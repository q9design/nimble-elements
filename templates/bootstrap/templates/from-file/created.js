
var Mustache = require('mustache')

var tFruit = this['template']
var content = dom.querySelector('.content')

var m = [
 	 {name:'date', color:'tan'},
	 {name:'elderberry', color:'black'},
	 {name:'fig', color:'purple'},
	]

content.innerHTML = Mustache.render(tFruit,m)
