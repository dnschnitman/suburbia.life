// Triangulation

var vlayer, dlayer, rlayer, elayer;
var csizex;
var csizey;
var dots      = [];
var ndots;
var ndotsText;
var presetButton;
var rbutton;
var mbutton;
// var angleDeg;

var dotrad    = 5;
var maxmaxvel = 2;
var maxvel;
var dotsmove  = false;

let tree;
let treeRadius;
let treeChange;
let treeRoughness;
let trees = [];
let treesArr = [];
let treesArrScreen = [];
let treeNum = 300;
let treeLineHit = false;
let treeHouseHit = false;

let gausDots = [];
let noisyImg;

var dotcol;
var dotselected;

var debug = false;

let suburbs = [];
let suburbsTrash = [];
let suburbsCount = 0;
let numSuburbs = 200;
let houses = [];
let angle = 0;
let polyLineHit = false;

var rngBoolean = 0;
var treesBoolean = false;

// let colors;
var hw = []; //house width
var hl = []; //house legnth
var hs = 60; //house spacing  42 was good
var myHL, myHW; //local variables for house length and house width
// let colorsi;
let imgs = [];
let	colors2 = ['#CA7358', '#E0B29B', '#C4D9DE', '#ADBBC6', '#8D6D5E', '#525461'];
let roadColor;

var settings = new Map();
settings.set('default', {'ndots': 40, 'dotalpha': 0, 'dalpha':  0, 'valpha':  0, 'calpha': 0, 'ralpha': 255, 'ealpha': 0, 'maxvel': 0.0});

//---------------------------------------------------------------------------------------------------------------------
function preload() {
  for (var i=0; i<=9; i++) {
  		imgs[i] = loadImage('assets3/House_'+i+'.png');
  }
}

//---------------------------------------------------------------------------------------------------------------------
function setup() {

	csizex = 900; //windowWidth
	csizey = 900; //windowHeight
    if (mode == "2D") var canvas = createCanvas(csizex,csizey);
    addScreenPositionFunction();
    angleMode(DEGREES);
    background('#3E8C4B');

    print('pixelDensity: ' + pixelDensity());
    print('displayDensity: ' + displayDensity());

    // Move the canvas so it's inside our <div id="sketch-holder">.
    canvas.parent('sketch-holder');
    var sketchholder = canvas.parent();
    // sketchholder.setAttribute("style","width:"+csizex+"px;margin:auto");
  	// addScreenPositionFunction();

    noisyImg = createGraphics(windowWidth, windowHeight);
    // Create layers
    // graphics for dots & delaunay
    dlayer = createGraphics(csizex, csizey);
    dlayer.clear();
	dlayer.pixelDensity(1);

    // graphics for rng vectors
    rlayer = createGraphics(csizex, csizey);
    rlayer.clear();
    rlayer.pixelDensity(1);
    addScreenPositionFunction( rlayer );

    tree = createGraphics(csizex, csizey);
    tree.clear();
    tree.pixelDensity(1);
        
    roadColor = color(43,48,45);
    dotcol = color(0,0,0);
    for (var i=0; i<ndots; i++) {
    	dots.push(new Dot(i));
    }

    // Initialise controls createControls(); set default options/settings
    changeSettings('default');
    drawScene();
}

//---------------------------------------------------------------------------------------------------------------------
function mousePressed() {
	resetSketch();
}

//---------------------------------------------------------------------------------------------------------------------
function resetSketch() {
	print("reset");
	background('#3E8C4B');
	treesArr = [];
	suburbs = [];
	rngEdges = [];
	lineArr = [];
	dots = [];
	suburbsCount = 0;

	// clear();
	dlayer.clear();
	rlayer.clear();
	tree.clear();

	for (var i=0; i<ndots; i++) {
    	dots.push(new Dot(i));
    }
    changeSettings('default');
	drawScene();
}

//---------------------------------------------------------------------------------------------------------------------
function drawIfReq() {
	if (! dotsmove) draw();
}

//---------------------------------------------------------------------------------------------------------------------
function drawScene() {

	rlayer.clear();
	ralpha = 255; //rslider.value()
	dotalpha = 0; //dotslider.value()
	maxvel = 0;
	var ndotsNew = 40; //ndotsSlider.value()
	// ndotsText.html('#Dots: '+ ndotsNew);

	if (ndots != ndotsNew) {
		adjustNDots(ndotsNew);
	}

	for (dot of dots) {
		dot.update();
		dot.draw();
	}
	
	// calcuate delaunay triangulation - see https://github.com/mapbox/delaunator
	var delaunay = new Delaunator(dots, getX, getY);

	// annotate the coords with name in graph (for debugging)
	if (debug) {
		annotatePoints(delaunay)
	}

	// Helper data structures for the delaunay triangles
	var de = calcDelaunayStructs(delaunay);
	var delaunayEdges     = de[0];
	var delaunayEdgesHash = de[1];

	// RNG - relative neighborhood graph
	var rngEdges = calcRNG(delaunayEdges, delaunayEdgesHash);
	if(rngBoolean<20) { 
		drawRNG(rngEdges);
		rngBoolean ++;
	}
	makeTrees(); 

}

function draw(){
	background('#3E8C4B');
	image(rlayer, 0, 0);		// rng 
	suburbs.forEach(function(curr, i) {
    	curr.display(); 
    })

    treesArr.forEach(function(curr, i) {
        curr.display(); 
    })
    image(tree, 0, 0);
}

//---------------------------------------------------------------------------------------------------------------------
class treeObj {
  constructor(num,treePosX, treePosY, Rad, Rough, Change) {
  	this.num = num;
  	this.posx = treePosX;
  	this.posy = treePosY;
  	this.rad = Rad; //int(random(12, 18))
  	this.rough = Rough;
  	this.change = Change;
  	this.color = color(21, 58, 14);
  	this.rotate = int(random(0,360));
  	this.sequence = [];
  }

  display(){
  	push();

	for (let j = 0; j < treeNum; j++) {
	      tree.fill(this.color); //37, 107, 38
	      tree.noStroke();
	      tree.translate(this.posx, this.posy); //move to xpos, ypos
	      tree.rotate(this.change); //rotate by this.angle+change
	      tree.beginShape(); //begin a shape based on the vertex points below
	      var off = j;
	      for (var i = 0; i < 360; i += 30) {
	        var offset = map(noise(off, this.change), 0, 1, -this.rough, this.rough);
	        var r = this.rad + offset;
	        var x = r * cos(i);
	        var y = r * sin(i);
	        tree.vertex(x, y);
	        off += 0.1;
	      }
	      tree.endShape(CLOSE); //end and create the shape
	      tree.translate(-this.posx, -this.posy);
	  }
	  pop();
  }
}

//---------------------------------------------------------------------------------------------------------------------
function calcDelaunayStructs(delaunay) {
	var delaunayEdges = [];
	var delaunayEdgesHash = new Map();
	for (var i=0; i < delaunay.coords.length; i += 2) {
		delaunayEdgesHash.set(floor(i/2), new Set());
	}
	for (var i = 0; i < delaunay.triangles.length; i += 3) {
		var d1id = delaunay.triangles[i];
		var d2id = delaunay.triangles[i+1];
		var d3id = delaunay.triangles[i+2];

		delaunayEdges.push([min(d1id,d2id), max(d1id,d2id)]);
		delaunayEdges.push([min(d2id,d3id), max(d2id,d3id)]);
		delaunayEdges.push([min(d3id,d1id), max(d3id,d1id)]);
		delaunayEdgesHash.set(d1id, delaunayEdgesHash.get(d1id).add(d2id));
		delaunayEdgesHash.set(d1id, delaunayEdgesHash.get(d1id).add(d3id));
		delaunayEdgesHash.set(d2id, delaunayEdgesHash.get(d2id).add(d1id));
		delaunayEdgesHash.set(d2id, delaunayEdgesHash.get(d2id).add(d3id));
		delaunayEdgesHash.set(d3id, delaunayEdgesHash.get(d3id).add(d1id));
		delaunayEdgesHash.set(d3id, delaunayEdgesHash.get(d3id).add(d2id));
	}
	return [delaunayEdges, delaunayEdgesHash];
}

//---------------------------------------------------------------------------------------------------------------------
function calcRNG(delaunayEdges, delaunayEdgesHash) {
	rngEdges = [];
	rngEdgesCheck = new Set();
	for (edge of delaunayEdges) {
		var d1x = dots[edge[0]].x;
		var d2x = dots[edge[1]].x;
		var keep = true;
		var dist = d1x.dist(d2x); // length of this edge
		var connected = new Set(delaunayEdgesHash.get(edge[0]));
		for (item of delaunayEdgesHash.get(edge[1])) connected.add(item);
		for (item of connected) {
			// print(item);
			if (item == edge[0]) continue;
			if (item == edge[1]) continue;
			var dx = dots[item].x;
			if (dx.dist(d1x) < dist && dx.dist(d2x) < dist) {
				keep = false;
			}
		}
		if (keep) {
			var eid = edge[0] + '__' + edge[1];
			if (! rngEdgesCheck.has(eid)) {			// to avoid duplicates
				rngEdgesCheck.add(eid);
				rngEdges.push(edge);
			}
		}
	}
	return rngEdges;
}

//---------------------------------------------------------------------------------------------------------------------
function drawRNG(rngEdges) {  // EDITME

	for (edge of rngEdges) {
		// print("draw rng");
		let kk = rngEdges.indexOf(edge);
		rlayer.push();

		lineArr[kk] = [];
		lineArr[kk][0] = createVector(dots[edge[0]].x.x, dots[edge[0]].x.y);
		lineArr[kk][1] = createVector(dots[edge[1]].x.x, dots[edge[1]].x.y);

		linePolyArr[kk] = [];
		linePolyArr[kk][0] = createVector(dots[edge[0]].x.x, dots[edge[0]].x.y);
		linePolyArr[kk][1] = createVector(dots[edge[0]].x.x-30, dots[edge[0]].x.y);
		linePolyArr[kk][2] = createVector(dots[edge[1]].x.x, dots[edge[1]].x.y);
		linePolyArr[kk][3] = createVector(dots[edge[1]].x.x+30, dots[edge[1]].x.y);

		rlayer.strokeWeight(20);
		rlayer.stroke(roadColor); //road color
		rlayer.noFill();
		rlayer.line(dots[edge[0]].x.x, dots[edge[0]].x.y, dots[edge[1]].x.x, dots[edge[1]].x.y);

		// roads and polygons
		// rlayer.noStroke();
		// rlayer.fill(180,0,0);
		// rlayer.beginShape(QUADS);
		// rlayer.vertex(linePolyArr[kk][0].x, linePolyArr[kk][0].y);
		// rlayer.vertex(linePolyArr[kk][1].x, linePolyArr[kk][1].y);
		// rlayer.vertex(linePolyArr[kk][2].x, linePolyArr[kk][2].y);
		// rlayer.vertex(linePolyArr[kk][3].x, linePolyArr[kk][3].y);
		// rlayer.endShape();
		rlayer.pop();
		let distn = int(dist(dots[edge[0]].x.x, dots[edge[0]].x.y, dots[edge[1]].x.x, dots[edge[1]].x.y));

	    let houseCollide = false;
	    let houseHitRoad = false;

	    for(let b = 0; b < lineArr.length; b++){
	        lineArrScreen[b] = [];
	        lineArrScreen[b][0] = screenPosition(lineArr[b][0].x, lineArr[b][0].y);
	        lineArrScreen[b][1] = screenPosition(lineArr[b][1].x, lineArr[b][1].y);
	    }

		for(let b = 0; b < linePolyArr.length; b++){
			linePolyArrScreen[b] = [];
			linePolyArrScreen[b][0] = screenPosition(linePolyArr[b][0].x, linePolyArr[b][0].y);
			linePolyArrScreen[b][1] = screenPosition(linePolyArr[b][1].x, linePolyArr[b][1].y);
			linePolyArrScreen[b][2] = screenPosition(linePolyArr[b][2].x, linePolyArr[b][2].y);
			linePolyArrScreen[b][3] = screenPosition(linePolyArr[b][3].x, linePolyArr[b][3].y);
		}

		
		for(var j = 0; j < distn-50; j+=hs){
		  		if(distn>50){
				    push();
				   	let d = int(dist(dots[edge[0]].x.x, dots[edge[0]].x.y, dots[edge[1]].x.x, dots[edge[1]].x.y));
					let angleDeg = Math.atan2(dots[edge[1]].x.y - dots[edge[0]].x.y, dots[edge[1]].x.x - dots[edge[0]].x.x) * 180 / Math.PI;
		      		let cx = lerp(dots[edge[0]].x.x, dots[edge[1]].x.x, map(j,0,d,0,1));
					let cy = lerp(dots[edge[0]].x.y, dots[edge[1]].x.y, map(j,0,d,0,1));
					let vec1 = createVector(cx, cy);
					let hc = suburbsCount;
					r = new rectObj(hc, vec1, 45, 70, angleDeg) // generate a rectObj
					pop();

					if(suburbsCount<numSuburbs){ 
						suburbs.push(r); 
						suburbsCount++;

					}
				}

		// house to road collision
		suburbs.forEach(function(curr, i) {

			for(let b = 0; b < linePolyArrScreen.length; b++){
			        // polyLineHit = collideLinePoly(lineArrScreen[b][0].x, lineArrScreen[b][0].y, lineArrScreen[b][1].x, lineArrScreen[b][1].y, this.sequence);
			        let houseHitRoadLocal = collidePolyPoly(linePolyArrScreen[b],curr.sequence);
			        if (houseHitRoadLocal) {
			          suburbs.splice(i, 1);
			        }
			 }

			// house to house collision
			suburbs.forEach(function(currTwo, j) {
		          if (i != j) {
				    let polyHit = collidePolyPoly(curr.sequence, currTwo.sequence);
			        if (polyHit) {
			          suburbs.splice(j, 1);
			        } 
		          };
		     })

		});
			  	
			}
		}

	}


function makeTrees(){
	 // print("making trees");
	 treeRadius = int(random(12, 18)); //16, 22
	 treeRoughness = random(10, 20);
	 treeChange = 0;
	 for (let j = 0; j < treeNum; j++) {
	      trees[j] = [ (random() * csizex) , (random() * csizey) ];
	      let t = new treeObj(j, trees[j][0], trees[j][1], treeRadius, treeRoughness, treeChange);
	      // print(suburbs.length);
	      let hitHouse = false;
	      let hitRoad = false;
	      for(let q = 0; q < suburbs.length; q++){
           let treeHouseHitLocal = collideCirclePoly(t.posx, t.posy, t.rad*3, suburbs[q].sequence,true);    
           if (treeHouseHitLocal) {
           		hitHouse = true;
           		break;
           }
	 	}

	 	// print(lineArrScreen);
	  	for(let b = 0; b < lineArrScreen.length; b++){
	        let treeLineHitLocal = collideLineCircle(lineArrScreen[b][0].x, lineArrScreen[b][0].y, lineArrScreen[b][1].x, lineArrScreen[b][1].y, t.posx, t.posy, t.rad*3);
	        if (treeLineHitLocal) {
	        	hitRoad = true;
	        	break;
	          // treesArr.splice(this.num, 1);
	      	}
	  	}

	 	if(hitHouse==false && hitRoad==false){
	 		treesArr.push(t);
	 	}
	}
}

function myAngle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}

//---------------------------------------------------------------------------------------------------------------------
function indexMinValueInSet(s) {
	var currMinVal = Infinity;
	var currMinInd = -1;
	for (var [key, value] of s) {
		if (value <= currMinVal) {
			currMinVal = value;
			currMinInd = key;
		}
	}
	return currMinInd;
}

//---------------------------------------------------------------------------------------------------------------------
function annotatePoints(delaunay) {
	for (var i=0; i<delaunay.coords.length; i+=2) {
		var name = floor(i/2);
		vlayer.push();
		vlayer.translate(delaunay.coords[i], delaunay.coords[i+1]);
		vlayer.text(name, 8,-8);
		vlayer.pop();
	}
}

//---------------------------------------------------------------------------------------------------------------------
function randomize() {
	dots = [];
    for (var i=0; i<ndots; i++) {
    	dots.push(new Dot(i));
    }
	drawIfReq()
}

//---------------------------------------------------------------------------------------------------------------------
function isInTriangle(p, p0, p1, p2) {
	// see https://stackoverflow.com/a/14382692 - triangles are always counterclockwise
	var Area = 0.5 *(-p1.y*p2.x + p0.y*(-p1.x + p2.x) + p0.x*(p1.y - p2.y) + p1.x*p2.y);
	var s = 1/(2*Area)*(p0.y*p2.x - p0.x*p2.y + (p2.y - p0.y)*p.x + (p0.x - p2.x)*p.y);
	var t = 1/(2*Area)*(p0.x*p1.y - p0.y*p1.x + (p0.y - p1.y)*p.x + (p1.x - p0.x)*p.y);
	return s > 0 && t > 0 && (1-s-t) > 0;
}

//---------------------------------------------------------------------------------------------------------------------
function pointSign(p, p1, p2) {
	// determine in which half-plane point p lies relative to the line through p1 & p2
	// see https://stackoverflow.com/a/2049593
    return (p.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p.y - p2.y);
}

//---------------------------------------------------------------------------------------------------------------------
function calcCcenter(d1,d2,d3) {
	// see https://en.wikipedia.org/wiki/Circumscribed_circle#Cartesian_coordinates_2
	var bp  = p5.Vector.sub(d2.x, d1.x);
	var cp  = p5.Vector.sub(d3.x, d1.x);
	var d   = 2* (bp.x * cp.y - bp.y * cp.x);
	var uxp = (cp.y * (bp.x*bp.x + bp.y*bp.y) - bp.y * (cp.x*cp.x + cp.y*cp.y)) / d
	var uyp = (bp.x * (cp.x*cp.x + cp.y*cp.y) - cp.x * (bp.x*bp.x + bp.y*bp.y)) / d
	var r   = sqrt(uxp*uxp + uyp*uyp)
	return [new p5.Vector(uxp+d1.x.x, uyp+d1.x.y), r];
}


//---------------------------------------------------------------------------------------------------------------------
function changeSettings(setting) {
	var options = settings.get(setting);
	drawIfReq();
}
//settings.set('default', {'ndots': 40, 'dotalpha': 0, 'dalpha':  0, 'valpha':  0, 'calpha': 0, 'ralpha': 255, 'ealpha': 0, 'maxvel': 0.0});


//---------------------------------------------------------------------------------------------------------------------
function adjustNDots(newNdots) {
	var dotslength = dots.length;
	if (newNdots > dotslength) {
		for (var i=dotslength; i<newNdots; i++) {
			dots.push(new Dot(i));
		}
	} else {
		// remove some dots
		for (var i=newNdots; i<dotslength; i++) {
			dots.pop();
		}
	}
	ndots = newNdots;
}

//---------------------------------------------------------------------------------------------------------------------
// our main character ... the dot
function Dot(i) {
	this.index = i;
	this.x     = createVector(floor(random()*csizex), floor(random()*csizey));
	this.v     = createVector(random(-1,1), random(-1,1));
	this.col   = dotcol;
}

getX = function(d) { return d.x.x;}
getY = function(d) { return d.x.y;}

Dot.prototype.draw = function() {
	// print(dotalpha);
	dlayer.push();
	dlayer.fill(color(this.col.levels[0], this.col.levels[1], this.col.levels[2], dotalpha));
	dlayer.noStroke();
	dlayer.translate(this.x.x, this.x.y);
	dlayer.ellipse(0,0,dotrad*2,dotrad*2);
	dlayer.pop();
}

Dot.prototype.update = function() {
	if (! dotsmove) return;
	this.x.add(p5.Vector.mult(this.v, maxvel));
	if (this.x.x < 0) this.x.x = csizex;
	if (this.x.x > csizex) this.x.x = 0;
	if (this.x.y < 0) this.x.y = csizey;
	if (this.x.y > csizey) this.x.y = 0;
}