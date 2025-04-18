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
boolean debug = false;
PVector center;
PVector queuePos;

ArrayList<Bird> birds = new ArrayList<Bird>();

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
  Bird centerBird = new Bird(center, fgColor, 20, 100);
  birds.add(centerBird);

  queuePos = new PVector(width + 300, center.y);
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


  for(Bird bird : birds) {
    bird.move(new PVector(-2, 0));
    bird.display();
  }

  Bird firstBird = birds.get(0);
  if (firstBird.pos.x % 300 == 0) {
    Bird newBird = new Bird(queuePos, fgColor, 50, 100);
    birds.add(newBird);
  }

  if (firstBird.pos.x <  - (width / 2) - 50) {
    birds.remove(0);
  }
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
    for (Bird bird : birds) {
      bird.randomize();
    }
  }
}
