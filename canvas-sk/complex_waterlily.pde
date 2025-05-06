/**
 * Settings
 */

final int SOME_VAR = 100;


/**
 * Global Variables
 */
int rPond;
PVector center;
PVector pta;
PVector ptb;
ArrayList<Leaf> leaves= new ArrayList<Leaf>();
Duck duck;

float dist = 0;

/**
 * Setup
 */
void setup() {
  size(960, 960);
  colorMode(HSB, 360, 100, 100);
  rPond = height / 2;
  center = new PVector(width / 2, height / 2);
  
  // Pick a random point on the edge of the circle
  float phia = random(TWO_PI);
  pta = new PVector(rPond * sin(phia), rPond * cos(phia));
  pta.add(center);
  
  float phib = random(TWO_PI);
  ptb = new PVector(rPond * sin(phib), rPond * cos(phib));
  ptb.add(center);
  
  duck = new Duck(pta.x, pta.y);
  
  // Fill the pond with krill
  for(int i = 0; i < 1000; i++) {
    float phip = random(TWO_PI);
    float dist = random(rPond);
    leaves.add(new Leaf(
       i,
       center.x + dist * cos(phip),
       center.y + dist * sin(phip)
    ));
  }
}

/**
 * Draw
 */
void draw() {
  background(0, 0, 100);
  
  //float phib = random(TWO_PI);
  //ptb = new PVector(rPond * sin(phib), rPond * cos(phib));
  //ptb.add(center);

  noFill();
  circle(center.x, center.y, rPond *2);
 
  fill(255, 0, 0);
  //circle(pta.x, pta.y, 8);
  //circle(ptb.x, ptb.y, 8);
  
  line(pta.x, pta.y, ptb.x, ptb.y);
  for(Leaf l: leaves) {
    l.update(leaves);
    l.display();
  }
  
  dist += 0.001;
  PVector duckpos = PVector.lerp(pta, ptb, dist);
  duck.move(duckpos);
  duck.update(leaves);
  duck.display();
  
  //pta = ptb.copy();//
}

/**
 * Utilities 
 */
void keyPressed() {
  if (key == 's' || key == 'S') {
    String dateTime = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + millis();
    String savePath = System.getenv("SAVES_LOCATION");
    String filePath = savePath + "/sketch-" + dateTime + ".png";
    saveFrame(filePath);
  }
}

class Leaf {
  int id;
  PVector pos;
  float radius;
  boolean stable;
  
  Leaf(int id, float x, float y) {
    this.id = id;
    this.pos = new PVector(x, y);
    this.radius = 2;
    this.stable = false;
  }
  
  void display() {
    circle(pos.x, pos.y, radius);
  }
  
  void update(ArrayList<Leaf> otherLeaves) {
    
    // Wants to stay away from other leaves
    for (Leaf l: otherLeaves) {
      if (this.stable) {
        continue;
      }
    
      if (this.id == l.id) {
        continue;
      }
    
      if (this.pos.dist(l.pos) > (radius + l.radius)) {
        continue;
      }
    
      PVector dir = PVector.sub(this.pos, l.pos);
      dir.normalize();
      dir.mult(this.radius);
      pos.add(dir);
    }
  }
}

class Duck {
  PVector pos;
  PVector vel;
  float radius;
  
  Duck(float x, float y) {
    this.pos = new PVector(x, y);
    this.vel = new PVector(0, 0);
    this.radius = 10;
  }
  
  void display() {
    circle(pos.x, pos.y, radius);
  }
  
  void move(PVector dir) {;
    this.pos.add(dir);
  }
 
  void update(ArrayList<Leaf> leaves) {
    for (Leaf l: leaves) {
      if (this.pos.dist(l.pos) > (this.radius + l.radius)) {
        continue;
      }
      
      PVector dir = PVector.sub(this.pos, l.pos);
      dir.normalize();
      dir.mult(this.radius + l.radius);
      l.pos.add(dir);
    }
  }
}
