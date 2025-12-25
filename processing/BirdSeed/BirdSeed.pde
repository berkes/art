/**
 * Settings
 */
boolean record = false;
boolean debug = true;
int FIXED_COMPONENT_SIZE = 5;

/**
 * Global Variables
 */
PVector center;
color bgColor;
color fgColor;
color dbgColor;

Bird bird;

/**
 * Setup
 */
void setup() {
  size(1200, 1000);
  colorMode(HSB, 360, 100, 100);

  bgColor = color(0, 0, 100);
  fgColor = color(0, 0, 0);
  dbgColor = color(0, 100, 100);

  center = new PVector(width / 2, height / 2);
  bird = new Bird(center, fgColor, 20, 100);


}

/**
 * Draw
 */
void draw() {
  background(bgColor);

  stroke(fgColor);
  strokeWeight(FIXED_COMPONENT_SIZE);
  line(0, center.y, width, center.y);

  // Draw a sun in the background
  fill(18, 61, 100);
  noStroke();
  ellipse(center.x - 100, center.y - 200, 300, 300);
  stroke(0, 0, 100);
  for (int ditherWidth = 0; ditherWidth < 6; ditherWidth += 1) {
    strokeWeight(ditherWidth);
    line(0, center.y - (100 - ditherWidth * 10), width, center.y - (100 - ditherWidth * 10));
  }

  bird.animateStep();
  bird.display();

  if (record) {
    saveFrame("frames/####.png");
  }
}

/**
 * Utilities 
 */
void keyPressed() {
  if (key == 's' || key == 'S') {
    String dateTime = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + millis();
    String savePath = System.getenv("SAVES_LOCATION");
    String filePath = savePath + "/BirdSeed-" + dateTime + ".png";
    saveFrame(filePath);
  }

  if (key == 'd' || key == 'D') {
    debug = !debug;
  }

  if (key == 'r' || key == 'R' || key == ' ') {
    Bird newBird = new Bird(bird.pos, fgColor, 50, 100);
    bird.transition(newBird, 10);
  }

  if (key == 'a' || key == 'A') {
    record = !record;
  }
}
