import processing.svg.*;

/**
 * Settings
 */

color bgColor;
color fgColor;
color dbgColor;

int FIXED_COMPONENT_SIZE = 5;

/**
 * Global Variables
 */
Body b;
Feet f;
Head h;
Eye e;
Beak be;
Tail t;
Bird bird;

boolean debug = false;

/**
 * Setup
 */
void setup() {
  size(1200, 1000);
  colorMode(HSB, 360, 100, 100);

  bgColor = color(0, 0, 100);
  fgColor = color(0, 0, 0);
  dbgColor = color(0, 100, 100);

  PVector center = new PVector(width / 2, height / 2);

  // f = new Feet(PVector.add(center, new PVector(0, 100)), 150, fgColor);
  // b = new Body(center, 100, fgColor);
  // h = new Head(PVector.add(center, new PVector(0, -100)), 50, fgColor);
  // e = new Eye(PVector.add(center, new PVector(-10, -130)), 5, bgColor);
  // be = new Beak(PVector.add(center, new PVector(40, -120)), 20, 10, TWO_PI, fgColor);
  // t = new Tail(PVector.add(center, new PVector(-100, 50)), fgColor);
  bird = new Bird(center, fgColor);
}

/**
 * Draw
 */
void draw() {
  background(bgColor);
  // b.display();
  // f.display();
  // h.display();
  // e.display();
  // be.display();
  // t.display();
  bird.display();
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

  if (key == 'd' || key == 'D') {
    debug = !debug;
  }

  if (key == 'r' || key == 'R') {
    bird.randomize();
  }
}
