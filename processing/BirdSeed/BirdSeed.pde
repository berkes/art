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
  bird = new Bird(center, fgColor, 50, 100);
}

/**
 * Draw
 */
void draw() {
  background(bgColor);
  stroke(fgColor);
  strokeWeight(FIXED_COMPONENT_SIZE);
  line(bird.pos.x - width / 2, bird.pos.y, bird.pos.x + width / 2, bird.pos.y);
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
