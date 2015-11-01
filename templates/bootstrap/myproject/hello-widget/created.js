this.onclick = e=>{
	var greet = this.hasAttribute('greet') ? this.getAttribute('greet') : 'guest'
	alert('hello '+greet)
	}
