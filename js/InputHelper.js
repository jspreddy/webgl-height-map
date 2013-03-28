// JavaScript Document

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

var movedx=0;
var movedy=0;
var movedz=0;


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
	}else{}
	

	
/*
	if (currentlyPressedKeys[38]) {
		// Up cursor key or W
		speed = -.3;
	} else if (currentlyPressedKeys[40]) {
		// Down cursor key
		speed = .3;
	} else {
		speed = 0;
	}



	if (currentlyPressedKeys[90]) {
		// Z
		strafeSpeed = -.3;
	} else if (currentlyPressedKeys[88]) {
		// X
		strafeSpeed = .3;
	} else {
		strafeSpeed = 0;
	}

	if (currentlyPressedKeys[67]) {
		// Up cursor key or W
		yPos += .2;
	} else if (currentlyPressedKeys[86]) {
		// Down cursor key
		yPos -= .2;
	}
	//*/

}