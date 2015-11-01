// var $ = require('jquery')

// var h = this.body
// dom.innerHTML = 'hi'

// this.attributeChangedCallback = function(){}
// this.attachedCallback = function(){}
// this.detachedCallback = function(){}

// time zones
var table = [
	["Alpha", 1],
	["Bravo", 2],
	["Charlie", 3],
	["Delta", 4],
	["Echo", 5],
	["Foxtrot", 6],
	["Golf", 7],
	["Hotel", 8],
	["India", 9],
	["Kilo", 10],
	["Lima", 11],
	["Mike", 12],
	["November", -1],
	["Oscar", -2],
	["Papa", -3],
	["Quebec", -4],
	["Romeo", -5],
	["Sierra", -6],
	["Tango", -7],
	["Uniform", -8],
	["Victor", -9],
	["Whiskey", -10],
	["X-ray", -11],
	["Yankee", -12],
	["Zulu", 0]
	]

// generate x-clock tags
var h = ''
table.forEach(v=>{
	var n = v.shift() // Alpha
	var o = v.shift() // 1
	h += `<tr><td><b>${n}</b> (${o})<td><x-clock offset-hours=${o}></x-clock></td>` // <tr><td><b>Alpha</b> (1)<td><x-clock offset-hours=1></x-clock></td>
	})

// add tr sets
dom.querySelector('table').innerHTML = h

