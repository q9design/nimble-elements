var app = require('app'); 
var BrowserWindow = require('browser-window');
var minimist = require('minimist')
var ipc = require('ipc')

var mainWindow = null;  // gc

var argv = minimist(process.argv.slice(2));
console.log('arguments',argv);

ipc.on('argv',function(e,v){ // remote requests argv
	e.sender.send('argv',argv) // send argv
	})

app.on('ready', function() {

  //splash = new BrowserWindow({type:'splash'}) //upg: make a proper splash? or better do splash from within main.
  //splash.loadUrl('https://google.com')

  //mainWindow = new BrowserWindow({})//{x:30, y: 1200, width: 1000, height: 1000, 'min-width': 500});
  mainWindow = new BrowserWindow({x:30, y: 1200, width: 1000, height: 1000, 'min-width': 500});
  //mainWindow.hide() //upg: hide till ready? // or can we make a splash like code inside it.

  mainWindow.maximize()
  setTimeout(function(){mainWindow.loadUrl('file://' + __dirname + '/../../.index.html');},150); //can we know when maximized instead?


  mainWindow.openDevTools({detach:false})

   /*
	// also downloads the pdf
   ipc.on('launch',function(e,v){ // remote requests argv
	// https://discuss.atom.io/t/pdf-plugin-in-electron-app/19186/2
	var l = new BrowserWindow({width: 1000, height: 1000})
	l.loadUrl(v)
	})
	*/

});

