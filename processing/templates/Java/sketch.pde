/**
 * Settings
 */

final int SOME_VAR = 100;


/**
 * Global Variables
 */
int someTracker = 0;

/**
 * Setup
 */
void setup() {
  size(1200, 1200);
  colorMode(HSB, 360, 100, 100);
}

/**
 * Draw
 */
void draw() {
  background(0, 0, 100);


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
