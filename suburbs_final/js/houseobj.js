

var poly = new Array(4);
var polyTwo = new Array(4);

var screenhit = false;
var poly = [];
var polyScreen = [];
var polyNum = 22;

var polyHit = false;
var lineHit = false;
var hithit = false;

let lineArr = [];
let lineArrScreen = [];
let linePolyArr = [];
let linePolyArrScreen = [];

//---------------------------------------------------------------------------------------------------------------------
class rectObj {
  constructor(num,v1,w,h,rot) {
    this.sequence = [];
    this.num = num;
    this.position = new createVector(v1.x, v1.y);
    this.w = w;
    this.h = h;
    this.rot = rot; //radians(rot)
    this.color = color(137,183,161);
    this.kitten = random(imgs);

    // Add the current speed to the position.
    push();
    translate(this.position.x, this.position.y);
    rotate(this.rot);
    translate(0, 30);
      for (let i = 0; i < numSuburbs; i++) {
          polyScreen[i] = [];
          polyScreen[i][0] = screenPosition(0,0);
          polyScreen[i][1] = screenPosition(0+(this.w*1.0), 0);
          polyScreen[i][2] = screenPosition(0+(this.w*1.0), 0+(this.h*1.0));
          polyScreen[i][3] = screenPosition(0, 0+(this.h*1.0));
      }
    this.sequence = polyScreen[this.num];
    pop();

  }
  
  display() {
    push();

    noStroke();
    translate(this.position.x, this.position.y);
    rotate(this.rot);
    translate(0, 30);

    poly[0] = createVector(0, 0);
    poly[1] = createVector(0+(this.w*1), 0);
    poly[2] = createVector(0+(this.w*1), 0+(this.h*1));
    poly[3] = createVector(0, 0+(this.h*1));

    // fill(this.color);  //test with house polygon
    // beginShape();
    // vertex(poly[0].x,poly[0].y);
    // vertex(poly[1].x,poly[1].y);
    // vertex(poly[2].x,poly[2].y);
    // vertex(poly[3].x,poly[3].y);
    // endShape();

    push();
    translate(12, -30);
    fill(43,48,45,160);
    rect(0, -8, 20, 40); //driveway
    pop();
    image(this.kitten, 0, 0, this.w, this.h);
    pop();

  }
}