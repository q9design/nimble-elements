//
// 2015.11.06 -- nimble.js
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
var HJSON = require('hjson')
var exec = require('child_process').exec
var liveServer = require('live-server') // upg: only on switch --live? // see gulp-live-server
var watchr = require('watchr')

var argv = require('minimist')(process.argv.slice(2));


var exports = module.exports = {}

var err = function(e){console.log(chalk.white.bold.bgRed(' err ')+chalk.red.bold.bgWhite(" "+e+" "),e.stack)}
var log = function(v){console.log('log',v)}


// ----------------------------------------
exports.build = function(opts){
	//console.log('build opts',opts)

	var head_code = `___nimble-elements-content___` //upg: + Date.now()

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


	// ///////////////////////////////////////////

	var build = function(){
		console.log('building ...')
		console.log(chalk.green(source_path),'to',chalk.grey.bold(dest_path))//,'using',chalk.yellow(template_path)) // 'nimble process >>> ',
		mkdirp(temp_path).
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
				//console.log('loaded system_templates',r)//system_templates,r)		

				var d = [temp_path+"/*.js",temp_path+"/*.html"]
				return del(d)
				}).
			then(function(r){ //upg: fse.emptyDir
				//console.log('deleted old build files',r.length)
				return copyfiles(['*.js',temp_path])
				}).
			then(function(r){
				return fs.readdirAsync(source_path)
				}).
			then(function(r){
				//console.log('source objects',r)
				return new Promise(function(res,rej){

					var out = ''
					var mods = []

					// ----------
					var next = function(){
						if(r.length > 0){
							var v = r.pop()
							fs.statAsync(v).then(function(r){
								if(r.isDirectory() && v != dest_name && v != 'node_modules'){  // upg: smarter
									console.log("ELEMENT:",chalk.yellow(v))
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

								browserify(temp_path+'/main.js',{debug:false}).  //upg: customelmentsify // minimize/uglifyify (optional)
								transform(babelify).
								bundle((err,buff)=>{

									if(!err){

										var regExp = new RegExp(head_code)
										var c = "<script>\n"+buff.toString()+"\n</script>"

										out = out.replace(regExp,function(){return c})  // when found in the string c = $'  >> does odd replace. // $' .. Inserts the portion of the string that follows the matched substring.

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


							out = out.replace("</head>","</head>"+head_code) // only replace head from index.html
							}).
						catch(function(){}). // it's ok if we didn't find it.
						then(next)



					})//func
				}).
				then(function(v){
					console.log(chalk.green.bold('READY.'))
					}).
			catch(err)


		}//func:build



	// ///////////////////////////////////////////



	// ----------
	if(argv['live']){

		build()

		var port = 8080
		var host = '127.0.0.1'


		var w = {
			path: source_path,
			ignorePaths: [dest_path],
			interval: 1407,
			listeners:{
				change:  function(t,p,s,ps){
						console.log('a change',t,p,s.mtime)//,s,ps)
						//t = update
						//p = /full/path/to/file.ext
						build()
						},
				error: function(e){console.log('err',e)}
					}
			}//

		//console.log('ww',w)
	
		watchr.watch(w)

		//
		// 		{ dev: 2050,
		// 		  mode: 33204,
		// 		  nlink: 1,
		// 		  uid: 1000,
		// 		  gid: 1000,
		// 		  rdev: 0,
		// 		  blksize: 4096,
		// 		  ino: 271642,
		// 		  size: 12,
		// 		  blocks: 8,
		// 		  atime: Fri Nov 06 2015 12:19:31 GMT-0500 (EST),
		// 		  mtime: Fri Nov 06 2015 12:19:30 GMT-0500 (EST),
		// 		  ctime: Fri Nov 06 2015 12:19:30 GMT-0500 (EST),
		// 		  birthtime: Fri Nov 06 2015 12:19:30 GMT-0500 (EST) }
		// 



		//console.log('Running Live')
			//
			// upg: port,host,etc
			//
			// 
			// 			var params = {
			// 			    port: 8181, // Set the server port. Defaults to 8080.
			// 			    host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0.
			// 			    root: "/public", // Set root directory that's being server. Defaults to cwd.
			// 			    open: false, // When false, it won't load your browser by default.
			// 			    ignore: 'scss,my/templates', // comma-separated string for paths to ignore
			// 			    file: "index.html", // When set, serve this file for every 404 (useful for single-page applications)
			// 			    wait: 1000 // Waits for all changes, before reloading. Defaults to 0 sec.
			// 			};

		var o = {
			port: port,
			host: host,
			root: dest_path,
			open: false,
			//ignore: dest_path+'/temp'  // hmmm... this all working oddly.. review other solutions? grunt-live-server maybe?
			}
		liveServer.start(o);
		}//if
	else
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
		console.log('running..')
		bootstrap().then(function(){
				build()
			}).catch(err)

		}//else







	// -----------------------------------
	function buildObject(v){
		return new Promise(function(res,rej){


			var out = system_templates['element.js']
			var pp = path.parse(v)

			//console.log('pp',pp)

			var fn = temp_path+"/"+pp.base+".js"
			//console.log('   ',v,'->',fn)


			// xp 2015.11.04
			var pfn = v+"/properties.hjson" // upg: allow json file optionally
			var properties = {}
			fs.statAsync(pfn).then(function(v){
				v.isFile()
				return fs.readFileAsync(pfn)
				}).
			then(function(v){
				properties = HJSON.parse(v.toString())
				console.log('   ',properties)
				}).
			catch(function(e){}).//no properites file
			finally(function(n){

				var extendName = ''
				var registerOptions = 'prototype: p'

				if(properties.extends){
					var x = properties.extends.toLowerCase()
					extendName = x.charAt(0).toUpperCase()+x.slice(1) 
					//console.log('vvvvvaaa',x,extendName) // select Select

					registerOptions  += ", extends: '"+x+"'" //upg: escape.
					}

				registerOptions = "{"+registerOptions+"}"

				// ------
				var tagname = pp.name
				if(tagname.indexOf('-') == -1)
						tagname = 'x-'+tagname


				out = out.replace(new RegExp('{{tagname}}','g'),function(n){return tagname})

				out = out.replace(new RegExp('{{extend-name}}','g'),function(n){return extendName})
				out = out.replace(new RegExp('{{register-options}}','g'),function(n){return registerOptions})


				// datas
				glob(v+"/*.html").reduce(function(acc,vv,i,len){ //upg: is this sound?
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
						out = out.replace('{{created.js}}',function(n){return createdjs})

						//write obj.js to build folder
						return fs.writeFileAsync(fn,out)
						}).
					catch(rej).
					then(res)

					}).
				catch(rej)


				})//func


			})//func
		}//func
	// -----------------------------------





	}//func
