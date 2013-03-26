var imageObj;
var imageHeight=512;
var imageWidth=512;
var imageData;
var gl;

$(document).ready(function() {
	imageObj=new Image();
	imageObj.src="./img/hm1_512_512.jpg";
	webGLStart();
});

function webGLStart() {
	var obj = document.getElementById('GLCanvas');
	initGL(obj);
	initShaders();
	initBuffers();
	drawScene();
}

function initGL(obj){
	try {
      gl = (obj.getContext("webgl")) ? obj.getContext("webgl") : obj.getContext("experimental-webgl");
      gl.viewportWidth = obj.width;
      gl.viewportHeight = obj.height;
    } catch(e) {}
	
	this.GL.clearColor(0.0,0.0,0.0,1.0);
	this.GL.enable(this.GL.DEPTH_TEST);
}

function initShaders(){}

function initBuffers(){}

function drawScene(){}

