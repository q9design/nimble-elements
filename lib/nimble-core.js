//
// 2015.11.06 -- nimble-core.js
//

// doesn't do any babel or browserify in itself here .. simply compile nimble.

// next: learn grunt and other such tools for programatic compelation... see how nimble-elements-core could fit in.


// upg: object name replacments <my.tag.here></my.tag.here> // note the use of dots instead of dash <and.with/sub.tags></and.with/sub.tags>

// upg: images / and other datas

// upg: should this be file aware? maybe no.

// upg: should we bundle? or should another lib?


var Mustache = require('mustache')

module.exports = function(){
	var ol = []
	var index = ''
	var libs = []
	this.newObject = n=>{
		var o = new ElementObject(n)
		ol.push(o)
		return o
		}

	this.addIndex = v=>{
		index=v
		}

	this.addLib = function(name,data){
		libs.push({name:name,data:data})
		}

	this.templates = n=>{ // upg: n = zip
				// upg: system to add template nodes individuaally
		//n = json file structure
		//next: find npm tool to convert folders/files to json.  (make one if not found?)
		}

	this.compile = n=>{

		var cl = []

		console.log('compiling item count:',ol.length)

		ol.forEach(v=>{
			console.log('compile',v,v.tagname,v.data,v.created)
			var tagname = v.tagname
			var name = v.name
			var eid = v.eid

//
			
			var filedata = v.data.reduce(function(acc,vv){ //,i,a
				var name = vv.name
				var data = vv.data
				return acc+"this['"+name+"'] = `"+data+"`\n"
				},'')


			var m = {
				'created.js':v.created,
				tagname,
				'extend-name':'',
				filedata,
				'register-options':'{prototype: p}',
				}
	
			var r = Mustache.render(template,m)
			cl.push({
				name,
				tagname,
				eid,
				code:r
				})
			})

		return {
			objects:cl,
			index:index,
			libs:libs
			}
		//upg: async
		//return new Promise((res,rej)=>{res(true)})//func
		}//func


	// ---------------------
	var _eo = 0
	var ElementObject = function(opts){
		var name = opts // common symbol name
		_eo++
		var eid = 'tag'+_eo //symbol

		if(!name){
			name = eid
			}//if

		var tagname = name
	
		if(tagname.indexOf('-') == -1)
			tagname = 'x-'+tagname

		var dl = []
		var created = false

		this.addData = (name,data)=>{
			dl.push({name,data})
			}  // upg: all types with mime?

		this.addCreated = (data)=>{
			created = data
			}

		Object.defineProperty(this,'data',{get: n=>dl})
		Object.defineProperty(this,'created',{get: n=>created})
		Object.defineProperty(this,'tagname',{get: n=>tagname})
		Object.defineProperty(this,'name',{get: n=>name})
		Object.defineProperty(this,'eid',{get: n=>eid})

		//this.addImage
		}//func
	
	}//func


//////////////////////////////////////////////
//////////////////////////////////////////////
var template = 
`//
// 2015.11.06
// 

// upg: auto models
var p = Object.create(HTML{{extend-name}}Element.prototype)


p.createdCallback = function(){

	// console.log('created.'); console.log(this)

	var dom = this.createShadowRoot() // upg: this._dom = dom  (or allow dom direct access?)

	var name = \`{{tagname}}\` // or map values in files?
	
	this._name = name
	this._shadow = dom

	this.attributeChanged = function(){}
	this.attached = function(){}
	this.detached = function(){}

	// datas
{{{filedata}}}

	//upg: set dom to body.html
	dom.innerHTML = this.body || 'empty'

	{{created.js}}

	}

//attributechanged
p.attributeChangedCallback = function(name,oldVal,newVal){
	//console.log('attr change {{tagname}}',name,oldVal,newVal)
	this.attributeChanged(name,oldVal,newVal)
	}

//attached
p.attachedCallback = function(){
	//console.log('attached {{tagname}}')
	this.attached()
	}

//detached
p.detachedCallback = function(){
	//console.log('detached {{tagname}}')
	this.detached()
	}


document.registerElement('{{tagname}}',{{register-options}})
`
//////////////////////////////////////////////
//////////////////////////////////////////////





//////////////////////////////////////////////////


var n = new module.exports() /// new Nimble()


n.addIndex('<head><title>test</test></head>')

n.addLib('api','console.log(5)') // api.js

var o = n.newObject('lab')
o.addData('body','hi')
o.addData('header','yo')
o.addCreated('console.log(this)')

var data = n.compile()

console.log('compiled to',data)


/*
var n = new Nimble()

var o = n.createObject('optional-name')

o.addData('name',data)

o.created('code')

o.setings = {}

o.getId()

n.compile().then(v).catch()


*/
