var currentlyPressedKeys;

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
	event.preventDefault();
}


function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
	event.preventDefault();
}


var basex=50;
var basey=30;
var basez=50;

var movedx=132;
var movedy=43;
var movedz=137;


function handleKeys() {
	//ws
	if (currentlyPressedKeys[87]) { //w
		movedx--;movedz--; //since the camera angle is in 45* to the x,z axes
	} else if (currentlyPressedKeys[83]) { //s
		movedx++;movedz++;
	}
	//ad
	if (currentlyPressedKeys[65]) {//a
		movedx--;movedz++;
	} else if (currentlyPressedKeys[68]) {//d
		movedx++;movedz--;
	}
	
	//left right
	if(currentlyPressedKeys[73]){ //i
		movedy++;
	}
	else if(currentlyPressedKeys[75] ){ //k
		movedy--;
	}
	
/*
	if(currentlyPressedKeys[80]){ //p
		console.log("X:"+movedx+", Y:"+movedy+", Z:"+movedz);
	} //*/
}