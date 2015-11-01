//
// 2015.10.28 -- nimble.js
//


var browserify = require('browserify')
var babelify = require('babelify')
var Promise = require('bluebird')
var path = require('path')
var chalk = require('chalk')
var mkdirp = Promise.promisify(require('mkdirp'));
var fs = Promise.promisifyAll(require('fs'))
var glob = Promise.promisify(require('glob'))
var del = require('del')
var copyfiles = Promise.promisify(require('copyfiles'))
var fse = Promise.promisifyAll(require('fs-extra'))
var exec = require('child_process').exec

var argv = require('minimist')(process.argv.slice(2));


var exports = module.exports = {}

var err = function(e){console.log(chalk.white.bold.bgRed(' err ')+chalk.red.bold.bgWhite(" "+e+" "),e.stack)}
var log = function(v){console.log('log',v)}


// ----------------------------------------
exports.build = function(opts){
	//console.log('build opts',opts)

	if(!opts) opts = {}

	var source_path = path.resolve(opts.source_path || process.cwd())
	var dest_name = '_build'
	var dest_path = path.resolve(source_path+"/"+dest_name)  // !! CONTENTS OF THIS PATH ARE DELETED EVERY RUN !!
	var temp_path = dest_path+"/temp"

	var template_path = path.resolve(__dirname+'/../templates') // upg: overridable templates (by string or path etc)

	var system_template_path = path.resolve(template_path+'/system') // upg: overridable templates (by string or path etc)
	var bootstrap_template_path = path.resolve(template_path+'/bootstrap') // upg: overridable templates (by string or path etc)

	var system_templates = {}

	var bootstrapList = function(){
		return new Promise((res,rej)=>{
			glob(bootstrap_template_path+"/*/").then(v=>{

				var r = []
				v.forEach(v=>{
					var vv = path.parse(v)
					var n = vv.name

					//upg: smarter auto description from package.json // also format to a table
					//var p = require(v+'package.json')
					var d = ''//p.description
				

					r.push({name:n,description:d})
					})
				res(r)
				}).catch(rej)

			})//func
		}//func
	
	var bootstrap = function(){
		return new Promise(function(res,rej){
			if(argv.bootstrap){

				var bn = argv.bootstrap === true ? 'basic' : argv.bootstrap // world-zones

				bootstrapList().then(v=>{


					var vv = v.filter(v=>v.name==bn) // v.find
					if(vv.length > 0){ // found name match

						var src = bootstrap_template_path+"/"+bn

						var dest = source_path
						console.log("bootstrap",chalk.green(src),'to',chalk.grey.bold(dest))

						fse.copyAsync(src,dest,{clobber:false}).then(function(v){

							exec('npm install',function(err,stdout,stderr){ //upg: as promise
								console.log(stdout,stderr)
								res(v)
								})//exec

							}).catch(rej)



						}//if
					else	{
						console.log(chalk.red.bold('could not find',bn,'boostrap'))
						//res(false)
						}

					}).catch(rej)
				}//if
			else
				res(true)

			})//func
		}//func


	// ----------
	if(argv['bootstrap-list']){
		bootstrapList().then(v=>{
				console.log('available projects')
				v.forEach(v=>{
					var n = v.name
					console.log('  --bootstrap',n)
					})

			}).catch(err)
		}//if
	else 
	// ----------
	if(argv.h || argv.help){
		fs.readFileAsync(system_template_path+"/help.txt").then(function(d){
			//upg: include name, date and version number in help output.

			console.log(d.toString())

			//upg: include bundled project names in help output.
			}).catch(err)
		}//if
	else 
	// ----------
	if(argv.v || argv.version){
		var p = require(__dirname+'/../package.json') // http://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code
		console.log(p.name,p.version)
		}//if
		else {

		bootstrap().then(function(){
			console.log('nimble process >>> ',chalk.green(source_path),'to',chalk.grey.bold(dest_path),'using',chalk.yellow(template_path))
			return mkdirp(temp_path)
			}).
			then(function(r){
				//load system_templates
				return glob(system_template_path+"/*.js").each(function(item,index,value){
					var b = path.parse(item).base

					return fs.readFileAsync(item).then(function(r){
						system_templates[b] = r.toString()
						})//each

					})//func
				}).
			then(function(r){
				console.log('loaded system_templates',r)//system_templates,r)		

				var d = [temp_path+"/*.js",temp_path+"/*.html"]
				return del(d)
				}).
			then(function(r){ //upg: fse.emptyDir
				console.log('deleted old build files',r)
				return copyfiles(['*.js',temp_path])
				}).
			then(function(r){
				return fs.readdirAsync(source_path)
				}).
			then(function(r){
				console.log('source objects',r)
				return new Promise(function(res,rej){

					var out = ''
					var mods = []

					// ----------
					var next = function(){
						if(r.length > 0){
							var v = r.pop()
							fs.statAsync(v).then(function(r){
								if(r.isDirectory() && v != dest_name && v != 'node_modules'){  // upg: smarter
									console.log(v)
									mods.push(v)
									return buildObject(source_path+'/'+v)
									}
								}).catch(rej).then(next)
							}
						else{	// finalize
							//console.log('oo',out)

							var m = ''
							mods.forEach(function(v){
								m += "require('./"+v+".js')\n"
								})


							fs.writeFileAsync(temp_path+"/main.js",m).then(n=>{

								browserify(temp_path+'/main.js',{debug:true}).  //upg: customelmentsify // minimize/uglifyify (optional)
								transform(babelify).
								bundle((err,buff)=>{

									if(!err){

										var head = ""
										out = out.replace("</head>","<script>\n"+buff.toString()+"\n</script>"+"</head>")

										fs.writeFileAsync(dest_path+"/index.html",out).
											then(res).
											catch(rej)

										}
									else{ rej(err) }

									})//bundle



								}). //func: main.js
								catch(rej)

							}//else
						}//func


					// ----------
					fs.readFileAsync(source_path+"/index.html").then(function(r){
							out = r.toString()
							}).
						catch(function(){}). // it's ok if we didn't find it.
						then(next)



					})//func
				}).
				then(function(v){
					console.log(chalk.green.bold('READY.'))
					}).
			catch(err)
		}//else




	// -----------------------------------
	function buildObject(v){
		return new Promise(function(res,rej){

			var out = system_templates['element.js']
			var pp = path.parse(v)

			console.log('pp',pp)

			var fn = temp_path+"/"+pp.base+".js"
			console.log('build',v,'->',fn)

			var tagname = pp.name
			if(tagname.indexOf('-') == -1)
					tagname = 'x-'+tagname


			out = out.replace(new RegExp('{{tagname}}','g'),tagname)


			// datas
			return glob(v+"/*.html").reduce(function(acc,vv,i,len){
				var p = path.parse(vv)
				var name = p.name

				return fs.readFileAsync(vv).then(function(r){
					r = r.toString()
					r = r.replace('{{here}}',tagname) //upg: full path? // other replacements too? .. where can make hook to things like sass?
					return(acc+"this['"+name+"'] = `"+r.toString()+"`\n")
					})

				},"").
			then(function(r){
				out = out.replace('{{filedata}}',r)
				var createdjs = ''

				// created.js
				fs.readFileAsync(v+"/created.js").then(function(r){
					createdjs = r.toString()
					}).
				catch(function(){}). // it's ok if we didn't find it.
				then(function(){
					out = out.replace('{{created.js}}',createdjs)

					//write obj.js to build folder
					return fs.writeFileAsync(fn,out)
					}).
				catch(rej).
				then(res)

				}).
			catch(rej)
			})//func
		}//func
	// -----------------------------------





	}//func
