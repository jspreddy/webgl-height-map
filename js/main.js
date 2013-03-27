var image;
var gl;
var mainCanvas;

function webGLStart() {
	initGL(mainCanvas);
	initShaders();
	initBuffers();
	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.enable(gl.DEPTH_TEST);
	
	drawScene();
}

function initGL(obj){
	try {
      gl = (obj.getContext("webgl")) ? obj.getContext("webgl") : obj.getContext("experimental-webgl");
      gl.viewportWidth = obj.width;
      gl.viewportHeight = obj.height;
    } catch(e) {}
	if(!gl){
		alert("could not initialize GL.");
	}
	return true;
}

function initShaders(){}

function initBuffers(){}

function drawScene(){};

$(document).ready(function() {
	mainCanvas=document.getElementById('mainCanvas');
	image=new Image();
	image.onload = function(){
		var cnvs=document.getElementById('heightmap_cnvs');
		if(image.height!==image.width){
			alert("Image is not a square (eg: 512x512). Please change your height map Image.");
		}
		cnvs.height=image.height;
		cnvs.width=image.width;
		var ctx=cnvs.getContext("2d");
		ctx.drawImage(image,0,0);
		var pixeldata=ctx.getImageData(0,0,cnvs.width,cnvs.height);
		image.heightmap=new Array();
		var j=0;
		for(var i=0;i<pixeldata.data.length;i+=4)
			{
				image.heightmap[j]=pixeldata.data[i];
				j++;
			}
		webGLStart();
	};
	image.src="./img/height_map.jpg";
});
