//
// 2015.11.05
// 

// upg: auto models
var p = Object.create(HTML{{extend-name}}Element.prototype)


p.createdCallback = function(){

	// console.log('created.'); console.log(this)

	var dom = this.createShadowRoot() // upg: this._dom = dom  (or allow dom direct access?)

	var name = `{{tagname}}` // or map values in files?
	
	this._name = name
	this._shadow = dom

	this.attributeChanged = function(){}
	this.attached = function(){}
	this.detached = function(){}

	// datas
	{{filedata}}

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

