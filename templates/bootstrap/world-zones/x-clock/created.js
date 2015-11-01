//
// 2015.10.23 -- x-clock / created.js
//

//upg: stop ticking when removed.

//upg: support property change offsetHours, offset

//upg: support attribute change offsetHours, offset

//upg: support offset in seconds

//upg: day of week optional / format string attribute

// we could use moment and such for local formats/names, but this example is sans packages to keep things focused.

var MSPERHOUR = 60*60*1000

var dow_table = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

this.attributeChangedCallback = function(name,oldVal,newVal){
	console.log('cc',name,oldVal,newVal)
	//upg: support
	}


if(this.hasAttribute('offset-hours')){
	let o = parseInt(this.getAttribute('offset-hours'))
	this.offset = o*MSPERHOUR
	}//if
else
	this.offset = 0


var tick = n=>{
	//console.log('tick',this.offset/MSPERHOUR)

	// draw
	var d = Date.now()
	
	var dd = new Date(d+this.offset)

	var h = dd.getUTCHours()
	var m = dd.getUTCMinutes()
	var s = dd.getUTCSeconds()

	var fH = h
	var fM = m<10?'0'+m:m
	var  fS = s<10?'0'+s:s

	var dow = dow_table[dd.getUTCDay()]

	dom.innerHTML  = `${fH}:${fM}:${fS} ${dow}`

	setTimeout(tick,1000)
	}//func


tick()


////////////////////////
//
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
//
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
//
