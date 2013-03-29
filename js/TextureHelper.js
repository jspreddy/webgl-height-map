var terrainTextureLow;
var terrainTextureMid;
var terrainTextureHigh;
   
function initTextures() {
	terrainTextureLow = gl.createTexture();
	terrainTextureLow.image = new Image();
	terrainTextureLow.image.onload = function() {
		handleLoadedTexture(terrainTextureLow);
	};
	terrainTextureLow.image.src = "img/grass.png";

	terrainTextureMid = gl.createTexture();
	terrainTextureMid.image = new Image();
	terrainTextureMid.image.onload = function() {
		handleLoadedTexture(terrainTextureMid);
	};
	terrainTextureMid.image.src = "img/rock.png";

	terrainTextureHigh = gl.createTexture();
	terrainTextureHigh.image = new Image();
	terrainTextureHigh.image.onload = function() {
		handleLoadedTexture(terrainTextureHigh);
	};
	terrainTextureHigh.image.src = "img/snow.png";
}

function handleLoadedTexture(texture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	texture.isLoaded = true;
	gl.bindTexture(gl.TEXTURE_2D, null);
}