import processing.svg.*;

static final int GENERATIONS = 12;

String dateTime = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + millis();
String savePath = System.getenv("SAVES_LOCATION");
String filePath = savePath + "/RecursiveSplit-" + dateTime + ".svg";

void setup() {
  size(800, 800);

  stroke(0);
  strokeWeight(2);
  noLoop();

  rectMode(CORNERS);
}

void draw() {
  beginRecord(SVG, filePath);
  background(255);
  recursiveSplit(0, 0, width, height, 0);
  endRecord();
  println("done");
}

void recursiveSplit(float x1, float y1, float x2, float y2, int currentGeneration) {
  if (currentGeneration >= GENERATIONS) {
    return;
  }

  // random rouded corners
  // float longest = max(x2 - x1, y2 - y1);
  // float radius = lerp(0, longest / 2, random(0, 0.1));
  float radius = 0;
  rect(x1, y1, x2, y2, radius);

  int splitDirection = currentGeneration % 2;
  // 80% of the time, split 2 times
  int splitTimes = random(1) < 0.8 ? 2 : 1;

  float offset = random(0.3, 0.7);
  if (splitDirection == 0) {
    float yNext = lerp(y1, y2, offset);
    recursiveSplit(x1, y1, x2, yNext, currentGeneration + 1);
    if (splitTimes == 2) {
      recursiveSplit(x1, yNext, x2, y2, currentGeneration + 1);
    }
  } else {
    float xNext = lerp(x1, x2, offset);
    recursiveSplit(x1, y1, xNext, y2, currentGeneration + 1);
    if (splitTimes == 2) {
      recursiveSplit(xNext, y1, x2, y2, currentGeneration + 1);
    }
  }
}

void keyPressed() {
  if (key == 'r') {
    redraw();
  }
}
