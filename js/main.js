var MODE="trgl";

var image;
var gl;
var mainCanvas;
var shaderProgram;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var vertexDistance=1;
var heightScaleFactor=0.12;

var vertices;
var vertexIndices;
var vertexColors;

var terrainVertexPositionBuffer;
var terrainIndexBuffer;
var terrainVertexColorBuffer;
var sceneInit=false;

function webGLStart() {
	initGL(mainCanvas);
	initShaders();
	initBuffers();
	gl.clearColor(0.5,0.5,0.5,1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
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
	$('#progressBar').css({"width":"20%"});
	setInterval(tick, 15);
	return true;
}

function initShaders() {
	var fragmentShader = getShader("shader-fs");
	var vertexShader = getShader("shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);
	
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	$('#progressBar').css({"width":"30%"});
}

function getShader(id) {
	var shaderScript = document.getElementById(id);

	var str = "";
	var sscripts = shaderScript.firstChild;
	while (sscripts) {
		if (sscripts.nodeType === 3)
			str += sscripts.textContent;
		sscripts = sscripts.nextSibling;
	}

	var shader;
	if (shaderScript.type === "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type === "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function initBuffers() {
    generateVertices();
	if(MODE==="lines"){
		generateLineIndices();
	}
	else{
		generateTriangleIndices();
	}
	
	
	generateColors();
	
	terrainVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	terrainVertexPositionBuffer.itemSize = 3;
    terrainVertexPositionBuffer.numItems = image.width * image.height;
	
    terrainVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexColorBuffer);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
	terrainVertexColorBuffer.itemSize = 4;
    terrainVertexColorBuffer.numItems = image.width * image.height;
		
	
	terrainIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    terrainIndexBuffer.itemSize = 1;
    terrainIndexBuffer.numItems = vertexIndices.length;
	
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
}

function generateVertices(){
	vertices=new Array();
	for(var i=0;i<image.heightmap.length;i++){
		vertices[3*i + 0]= (i % image.width) * vertexDistance;
		vertices[3*i + 1]= image.heightmap[i] * heightScaleFactor;
		//vertices[3*i + 1]= 0;
		vertices[3*i + 2]= Math.floor(i / image.width ) * vertexDistance;
	}
	//console.log(vertices);
}

function generateTriangleIndices(){
	var k=0;
	vertexIndices=new Array();
	for(var j=0;j<image.height-1;j++){
		if(j%2===0){
			for(var i=0;i<image.width;i++){
				vertexIndices[k++]=j*image.width + i;
				vertexIndices[k++]=(j+1)*image.width + i;
			}
		}
		else{
			for(var i=image.width-1;i>=0;i--){
				vertexIndices[k++]=(j)*image.width + i;
				vertexIndices[k++]=(j+1)*image.width + i;
			}
		}
	}
	//console.log(vertexIndices);
}

function generateLineIndices(){
	var k=0;
	vertexIndices=new Array();
	for(var j=0;j<image.height;j++){
		if(j%2===0){
			for(var i=0;i<image.width;i++){
				vertexIndices[k++]=j*image.width+i;
			}
		}
		else{
			for(var i=image.width-1;i>=0;i--){
				vertexIndices[k++]=i+j*image.width;
			}
		}
	}
	//console.log(vertexIndices);
}

function generateColors(){
	vertexColors=new Array();
	var j=0;
	var temp;
	for(var i=0;i<image.heightmap.length; i++){
		temp=image.heightmap[i]/255;
		vertexColors[j++]=temp;
		vertexColors[j++]=0.0;
		vertexColors[j++]=0.0;
		vertexColors[j++]=0.0;
	}
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mat4.perspective(pMatrix, 120/180, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);
	mat4.identity(mvMatrix);
	mat4.lookAt(mvMatrix, [basex+movedx, basey+movedy,basez+movedz], [0+movedx,0+movedy,0+movedz], [0,1,0]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, terrainVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, terrainVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
	setMatrixUniforms();
	if(MODE==="lines"){
		gl.drawElements(gl.LINE_STRIP, terrainIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}else{
		gl.drawElements(gl.TRIANGLE_STRIP, terrainIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	
	sceneInit=true;
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function tick() {
	handleKeys();
    if(sceneInit){
		drawScene();
	}
}


$(document).ready(function() {
	mainCanvas=document.getElementById('mainCanvas');
	image=new Image();
	image.onload = function(){
		$('#progressBar').css({"width":"10%"});
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
			//console.log("width:"+image.width+", height:"+image.height);
		webGLStart();
	};
	image.src="./img/height_map3.jpg";
	currentlyPressedKeys = new Object();
	document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
});
