//
// 2015.11.01 -- basic
//
// 	simple nimble elements example
//

```javascript
var Mustache = require('mustache')			// template engine

var tFruit = this['template']				// from template.html
var content = dom.querySelector('.content')

var m = [{name:'date', color:'tan'},			// source data
	 {name:'elderberry', color:'black'},
	 {name:'fig', color:'purple'},
	]

content.innerHTML = Mustache.render(tFruit,m)		// merge template and data
```

template.html

```html
{{#.}}
	<p>{{name}} : {{color}}
{{/.}}
```


result

	date : tan

	elderberry : black

	fig : purple
