var MODE="TERRAIN";
var texScale=10;
var image;
var gl;
var mainCanvas;
var shaderProgram;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var vertexDistance=1.5;
var heightScaleFactor=0.2;

var vertices;
var vertexIndices;
//var vertexColors;
var vertexTexture;
var vertexNormals;

var terrainVertexPositionBuffer;
var terrainIndexBuffer;
//var terrainVertexColorBuffer;
var terrainTextureBuffer;
var terrainVertexNormalBuffer;

var sceneInit=false;

function webGLStart() {
	initGL(mainCanvas);
	initShaders();
	initBuffers();
	initTextures();
	gl.clearColor(0.60, 0.60, 0.70,1.0);
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
	//shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	shaderProgram.vertexTextureAttribute= gl.getAttribLocation(shaderProgram, "aVertexTexture");
	shaderProgram.vertexNormalAttribute= gl.getAttribLocation(shaderProgram, "aVertexNormal");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.samplerUniformLow = gl.getUniformLocation(shaderProgram, "uTexGrass");
	shaderProgram.samplerUniformMid = gl.getUniformLocation(shaderProgram, "uTexRock");
	shaderProgram.samplerUniformHigh = gl.getUniformLocation(shaderProgram, "uTexSnow");
	shaderProgram.useLightingUniform= gl.getUniformLocation(shaderProgram, "uUseLighting");
	shaderProgram.lightingDirectionUniform=gl.getUniformLocation(shaderProgram, "uLightingDirection");
	shaderProgram.directionalColorUniform=gl.getUniformLocation(shaderProgram, "uDirectionalColor");
	shaderProgram.nMatrixUniform= gl.getUniformLocation(shaderProgram, "uNMatrix");

}

function getShader(id) {
	var shaderScript = document.getElementById(id);

	var str = "";
	var currentScript = shaderScript.firstChild;
	while (currentScript) {
		if (currentScript.nodeType === 3)
			str += currentScript.textContent;
		currentScript = currentScript.nextSibling;
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
	if(MODE==="LINES"){
		generateLineIndices();
	}
	else{
		generateTriangleIndices();
	}

	generateNormals();
	//generateColors();

	terrainVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	terrainVertexPositionBuffer.itemSize = 3;
    terrainVertexPositionBuffer.numItems = image.width * image.height;

	/*
    terrainVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
	terrainVertexColorBuffer.itemSize = 4;
    terrainVertexColorBuffer.numItems = image.width * image.height;
		*/
	terrainTextureBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTexture), gl.STATIC_DRAW);
	terrainTextureBuffer.itemSize=2;
	terrainTextureBuffer.numItems=vertexTexture.length/2;

	terrainIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    terrainIndexBuffer.itemSize = 1;
    terrainIndexBuffer.numItems = vertexIndices.length;

	terrainVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
	terrainVertexNormalBuffer.itemSize=3;
	terrainVertexNormalBuffer.numItems=image.width * image.height;

	//gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
}

function generateVertices(){
	vertices=new Array();
	vertexTexture=new Array();
	for(var i=0;i<image.heightmap.length;i++){
		vertices[3*i + 0]= (i % image.width) * vertexDistance;
		vertices[3*i + 1]= image.heightmap[i] * heightScaleFactor;
		//vertices[3*i + 1]= 0;
		vertices[3*i + 2]= Math.floor(i / image.width ) * vertexDistance;

		//vertexTexture[2*i]=(parseFloat( (i % image.width) * vertexDistance) / image.width);
		//vertexTexture[2*i + 1]=(parseFloat(Math.floor(i % image.height)) / image.height);
		vertexTexture[2*i]= ((i % image.width) * vertexDistance)/texScale;
		vertexTexture[2*i + 1]=(Math.floor(i / image.width ) * vertexDistance)/texScale;
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

function generateNormals() {
	var normal = vec3.create();
	var tempVec3=vec3.create();
	vertexNormals=new Array();
	var normals_array_Temp=new Array();

	var i = 0;
	for (i = 0; i < image.height*image.width; i++)
	{
		normals_array_Temp[i] = vec3.fromValues(0.0, 0.0, 0.0);
	}

	for (i = 0; i < Math.floor(vertexIndices.length / 3); i++)
	{
		//getting triangle vertices
		var index1 = vertexIndices[i * 3];
		var index2 = vertexIndices[i * 3 + 1];
		var index3 = vertexIndices[i * 3 + 2];

		//creating vector from vertces
		var V1 = vec3.fromValues(vertices[index1 * 3], vertices[index1 * 3 + 1], vertices[index1 * 3 + 2]); //x,y,z
		var V2 = vec3.fromValues(vertices[index3 * 3], vertices[index3 * 3 + 1], vertices[index3 * 3 + 2]);
		var V3 = vec3.fromValues(vertices[index2 * 3], vertices[index2 * 3 + 1], vertices[index2 * 3 + 2]);

		//side=v1-v2
		var side1=vec3.create();
		var side2=vec3.create();
		vec3.subtract(side1, V1, V2);
		vec3.subtract(side2, V1, V3);
		//side1 X side2
		vec3.cross(normal, side1, side2);

		if (normal[2] < 0)
		{
			vec3.negate(normal, normal);
		}

		vec3.add(normals_array_Temp[index1], normals_array_Temp[index1], normal);
		vec3.add(normals_array_Temp[index2], normals_array_Temp[index2], normal);
		vec3.add(normals_array_Temp[index3], normals_array_Temp[index3], normal);
	}


	for (i = 0; i < normals_array_Temp.length; i++) {

		vec3.normalize(tempVec3, normals_array_Temp[i]);
		vertexNormals[i * 3] = tempVec3[0];
		vertexNormals[i * 3 + 1] = tempVec3[1];
		vertexNormals[i * 3 + 2] = tempVec3[2];
	}
	//console.log(vertexNormals);
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
		vertexColors[j++]=1.0;
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

   // gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexColorBuffer);
	//gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, terrainVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, terrainTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, terrainTextureLow);
	gl.uniform1i(shaderProgram.samplerUniformLow, 0);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, terrainTextureMid);
	gl.uniform1i(shaderProgram.samplerUniformMid, 1);
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, terrainTextureHigh);
	gl.uniform1i(shaderProgram.samplerUniformHigh, 2);

	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, terrainVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	var lighting = document.getElementById("lighting").checked;
    gl.uniform1i(shaderProgram.useLightingUniform, lighting);

	if (lighting) {
		gl.uniform3f(shaderProgram.ambientColorUniform, 0.40, 0.40, 0.43);

		var lightingDirection = [-1.0,0.0,-1.0];
		var adjustedLD = vec3.create();
		vec3.normalize(adjustedLD, lightingDirection);
		//vec3.scale(adjustedLD, -1);
		gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
		gl.uniform3f(shaderProgram.directionalColorUniform,0.52,0.51,0.5);
	}

	var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, mvMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);


	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
	setMatrixUniforms();
	if(MODE==="LINES"){
		gl.drawElements(gl.LINE_STRIP, terrainIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	else{
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

function changeRenderer(mode){
	if(mode==="LINES"){
		MODE="LINES";
	}
	else if(mode==="TERRAIN"){
		MODE="TERRAIN";
	}
	initBuffers();
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
		for(var i=0; i<pixeldata.data.length; i+=16) {
      image.heightmap[j]=pixeldata.data[i];
      j++;
    }
		console.log("width:"+image.width+", height:"+image.height);
		webGLStart();
	};
	image.src="./img/height_map_1024.jpg";
	currentlyPressedKeys = new Object();
	document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

	$('#rendererSelect').change(function(){
		changeRenderer($(this).val());
	});

});
