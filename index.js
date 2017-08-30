let imageSources = {
	map: 'resources/HiRes_mono_LR.jpg',
}
let nodes = [
    new Node("brisbane", "map", 0.87, 0.77, 100),
    new Node("new_zealand", "map", 0.93, 0.83, 100),
    //new Node("junk", "map", 0.5, 0.5, 200),
    new Node("vanuatu", "map", 0.91, 0.715, 60),
    new Node("uk", "map", 0.465, 0.327, 70),
    new Node("poland", "map", 0.51, 0.327, 40),
    new Node("vietnam", "map", 0.753, 0.55, 50),
    new Node("tasmania", "map", 0.856, 0.864, 50),
]
let loadingAnimationId = "loadingAnimation";

var resourcesToLoad = 0
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");
var imageInfos = {}; // indexed by src eg "map"

// contains an image and its resized info
function ImageInfo(image) {
	this.image = image;
	this.x = -1;
	this.y = -1;
	this.w = -1;
	this.h = -1;
	this.scale = -1;
}
ImageInfo.prototype.setInfo = function(x, y, w, h, scale) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.scale = scale;
}

function Node(name, image, x, y, radius) {
	this.name = name;
	this.image = image;
	this.x = x;
	this.y = y;
	this.radius = radius;
}

function loadImages(sources, imageInfos) {
	var img;
	for (var src in sources) {
		resourcesToLoad++;
		img = new Image();
		img.src = sources[src];
		img.onerror = function() { console.log("Image '" + img.src + "' failed to load"); onImageLoaded(); }; // the show must go on
		img.onload = function() { console.log("Image '" + img.src + "' loaded"); onImageLoaded(); };
		var imageInfo = new ImageInfo(img);
		imageInfos[src] = imageInfo;
	}
}

// attempts to replicate "Fit to screen" in OSX
// resizes and moves the image to fit the canvas, with letterboxes if necessary
// while preserving the aspect ratio
// doesn't define the letterboxes: they'll just be the underlying canvas or contents
function fitImage(imageInfo, c, ctx) {
	var cHeight = c.height;
	var cWidth = c.width;
	var cAspectRatio = c.width / c.height;
	var x, y, h, w; // image settings
	var z; // position offset for calculation
	var iAspectRatio = imageInfo.image.width / imageInfo.image.height;
	if (cAspectRatio < iAspectRatio) {
		// image is wider than frame
		// horizontal letterboxes top and bottom
		//console.log("Image wider than frame");
		x = 0;
		w = cWidth;
		h = w / iAspectRatio;
		y = (cHeight - h)/2; // half the difference
	} else if (cAspectRatio > iAspectRatio) {
		// frame is wider than image
		// vertical letterboxes left and right
		//console.log("Image narrower than frame");
		y = 0;
		h = cHeight;
		w = h * iAspectRatio;
		x = (cWidth - w)/2;
	} else { // just right
		//console.log("Image same ratio as frame");
		x = 0;
		y = 0;
		h = cWidth;
		w = cHeight;
	}
	var scale;
	if (imageInfo.image.width != 0) { // divide-zero before loaded
		scale = w / imageInfo.image.width;
	} else {
		scale = 0;
	}
	imageInfo.setInfo(x, y, w, h, scale);
	ctx.drawImage(imageInfo.image, x, y, w, h);
}

// overlays nodes onto their specified images
function addNodes(nodes, imageInfos) {
	var x, y, radius, grad;
	for (var i=0, len=nodes.length; i < len; i++) {
		// assumes image has been loaded, probably by loadImages()
		node = nodes[i];

		image = imageInfos[node.image];
		console.log(image);
		fitImage(image, c, ctx);

		radius = node.radius * image.scale;
		x = scaleImageCoords(image, node.x, node.y)[0];
		y = scaleImageCoords(image, node.x, node.y)[1];

		grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
		grad.addColorStop(0, "#fff");
		grad.addColorStop(0.1, "#666");
		grad.addColorStop(1, "#ccc");

		ctx.globalAlpha=0.6;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2*Math.PI);
		ctx.fillStyle = grad;
		ctx.fill();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.globalAlpha=0.1;
		console.log("Drew node " + node.name);
	}
}

// returns [x, y] canvas coords scaled to the image
// parameters are 0-1
function scaleImageCoords(imageInfo, pctX, pctY) {
	var x = imageInfo.x + (pctX * imageInfo.w);
	var y = imageInfo.y + (pctY * imageInfo.h);
	//console.log("=====scaling============================");
	//console.log("image.y = " + imageInfo.y);
	//console.log("image.h = " + imageInfo.h);
	//console.log("image.x = " + imageInfo.x);
	//console.log("x = " + x + ", y = " + y);
	return [x, y];
}

function initCanvas() {
    var c = document.getElementById("mainCanvas");
    var ctx = c.getContext("2d");

    c.style.background = "white"; // kind of odd, but letterboxes well on aspect ratios close to that of the image
    //c.style.background = "black";
    // c.style.background = "red"; // for debugging: black merges into macbook bezel
    // textbook first-world problem

    // TODO: window.onresize should trigger this (currently stretches)
    // adjust height/width, I think
    // internal size for rendering
    let rect = c.parentNode.getBoundingClientRect();
    c.height = rect.height; // TODO: there's a ~4px bottom margin sneaking in...
    c.width = rect.width;
    var ymid = c.height/2; // rounding?
    var xmid = c.width/2;
}



function drawMain() {
    addNodes(nodes, imageInfos);
}

function drawLoadingView() {
    var loadingAnimationDiv = document.createElement("div");
    // loadingAnimationDiv.className = "sk-cube-grid";
    loadingAnimationDiv.className = "spinner";
    loadingAnimationDiv.id = loadingAnimationId;
    // for (var i = 0; i < 10; i++) {
	// tempDiv = document.createElement("div");
	// tempDiv.className = "sk-cube sk-cube" + i;
	// loadingAnimationDiv.appendChild(tempDiv);
    // }
    document.body.appendChild(loadingAnimationDiv);
}


// decrement the number of images yet to load. if all are complete, hide the loading view.
function onImageLoaded() {
    if (resourcesToLoad > 0) {
	resourcesToLoad--;
	console.log("decrementing resourcesToLoad (now " + resourcesToLoad + ")")
    }
    considerDrawingMain();
}

function considerDrawingMain() {
    if (resourcesToLoad == 0) {
	setLoadingView(false);
    }
}

function setLoadingView(loading) {
    if (loading) {
	drawLoadingView();
    } else {
	var loadingAnimationDiv = document.getElementById(loadingAnimationId);
	if (loadingAnimationDiv !== null) {
	    document.body.removeChild(loadingAnimationDiv);
	}
	drawMain();
    }
}
			
loadImages(imageSources, imageInfos);
initCanvas();
setLoadingView(true);
// These 'work' for resizing, but the canvas gets greedy.
// window.addEventListener("resize", initCanvas);
// window.addEventListener("resize", considerDrawingMain);
