
var Mustache = require('mustache')

var tFruit = `{{#fruit}}
		<p>{{name}} : {{color}}
	      {{/fruit}}`  // see : {{#.}} instead of {{#fruit}}

var content = dom.querySelector('.content')

var m = {
	fruit:
	[{name:'apple', color:'green'},
	 {name:'bannana', color:'yellow'},
	 {name:'cherry', color:'red'},
	]
	}

content.innerHTML = Mustache.render(tFruit,m)
