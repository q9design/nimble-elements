
var Mustache = require('mustache')

var tFruit = `<p>{{name}} : {{color}}`

var content = dom.querySelector('.content')

var m = {name:'apple', color:'green'}

content.innerHTML = Mustache.render(tFruit,m)
