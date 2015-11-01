	//
	// 2015.10.29	
        //

//	localStorage.highScore = localStorage.highScore || 28 // 0 // not in local file

	var highScore = 0 // localStorage.highScore

	//upg: mobile/service workers
	var x = 0
	var y = 0
	var fat = 6
	var w = fat
	var h = fat
	var dir = 1
	var body = []
	var max_len = fat
	var score = 0
	var delay = 16
	var gameOn = true


	var goal = false
	var goalW = 45
	var goalH = 45

	var speed = [[0,-1], // 0: up
                     [1,0],  // 1: right
		     [0,1],  // 2: down
		     [-1,0], // 3: left
                     ]
	var can = dom.querySelector('canvas')
	var ctx = can.getContext('2d')
	var gameOver = dom.querySelector('.game-over')
	var debug = dom.querySelector('.debug')
	var dScore = dom.querySelector('x-score')
	var dHighScore = dom.querySelector('high-score')

	//console.log('cc',can,ctx,gameOver,dScore)	

 
	var run = function(){ // upg: use performance.now to figure loops to use.
		if(!gameOn) return;
		var xx = speed[dir][0]
		var yy = speed[dir][1]
		//console.log(x,y,':',dir,xx,yy,':',body)
	 	x += xx  // (x + xx) => x
		y += yy  // (y + yy) => y

		body.unshift([x,y,'--']) // add to head
		if(body.length > max_len){
			body.pop()
			}//if

		paint()

		ctx.save()
		ctx.translate((can.width/2),(can.height/2))

		// head square
		var hx1 = x
		var hy1 = y
		var hx2 = hx1+w-1
		var hy2 = hy1+h-1


		// check for goal
		if(goal){
			var aa = fat/2
			var gx1 = goal[0]-aa
			var gy1 = goal[1]-aa
			var gx2 = gx1+goalW-1+aa
			var gy2 = gy1+goalH-1+aa
	
			//console.log(hx1,hy1,hx2,hy2,';;',gx1,gy1,gx2,gy2,hx1 < gx2, hx2 > gx1 , hy1 < gy2 , hy2 > gy1)
			if(
                           (hx1 >= gx1 && hx2 <= gx2 && hy1 >= gy1 && hy2 <= gy2)
                          ){
				score++
				if(score > highScore)
					highScore = score
				max_len += (fat*10)+(3*score*score) // upg: exp grow
				newGoal()
				}
			}//if
			
		// check for collide with self (or walls)
		var ok = true


		if(hx2 > (can.width/2) || 
		   hx1 < -(can.width/2) ||
		   hy2 > (can.height/2) || 
                   hy1 < -(can.height/2)
  			)  ok = false



		ctx.fillStyle = 'red'
	    ctx.fillRect(hx1,hy1,w,h)		


	 	for(var i = fat*2;i<body.length;i++){
			var cx = body[i][0]
			var cy = body[i][1]
			var cx1 = cx
			var cy1 = cy
			var cx2 = cx1+w-1
			var cy2 = cy1+h-1

			//ctx.fillStyle = 'green'
			//ctx.fillRect(cx1,cy1,w,h)		
			if(!((hx1 > cx2) || (hx2 < cx1) || (hy1 > cy2) || (hy2 < cy1))){
				ok  = false
				console.log(hx1,hy1,'::',hx2,hy2,"=====",cx1,cy1,'::',cx2,cy2)
				}
			//console.log(x,y,ccx,ccy)
			}

		ctx.restore()			
		if(ok)
			gameOver.style.display = 'none'
		else {
			gameOver.style.display = 'block'
			gameOn = false
			setTimeout(reset,1750)
			}

		//debug.textContent = ok?"ok":"not ok" +'('+hx1+","+hy1+") ("+hx2+","+hy2+")"
		dScore.textContent = score
		dHighScore.textContent = highScore

		}

	document.onkeydown = function(e){ // ^0, >1, v2, <3
		var k = e.which

		

		if(k == 37 && dir != 1) {dir = 3; e.preventDefault();}
		else
		if(k == 38 && dir != 2) {dir = 0; e.preventDefault();}
		else
		if(k == 39 && dir != 3) {dir = 1; e.preventDefault();}
		else
		if(k == 40 && dir != 0) {dir = 2; e.preventDefault();}

		
		}
	
	function paint(){
		ctx.save()
		// bkg
		ctx.fillStyle = 'black'
		ctx.fillRect(0,0,can.width,can.height)

		ctx.translate((can.width/2),(can.height/2))

		// snake		
		ctx.fillStyle = 'blue'
		body.forEach(function(v){
			ctx.fillRect(v[0],v[1],w,h)		
			})

		// apples
        ctx.fillStyle = 'red'
		if(goal){
			var gx = goal[0]
			var gy = goal[1]
			ctx.fillRect(gx,gy,goalW,goalH)
			}

		ctx.restore()
		}

	var tc = 0
	function tick(){
		tc++
		run()
		//if(tc%2) run()
		requestAnimationFrame(tick)
		}

	function newGoal(){ // upg: only where player isn't (upg: and can get to)
		var w = can.width
		var h = can.height
		var cw = w/2
		var ch = h/2
		var minx = -cw+goalW
		var maxx = cw-goalW
		var miny = -ch+goalH
		var maxy = ch-goalH
		var rx = maxx-minx
		var ry = maxy-miny
		goal = [Math.random()*rx+minx,Math.random()*ry+miny]
		}

	function reset(){
		x = 0
		y = 0
		dir = 1
		body = []
		max_len = fat
		score = 0
		gameOn = true
		}

	newGoal()

	tick()
