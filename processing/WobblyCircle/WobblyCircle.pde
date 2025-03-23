import processing.svg.*;

float noiseScale = 0.775;  // Controls how smooth the deformation is
float deformAmount = 0.4;  // Controls how much the circle deforms as fraction of the radius.
float shapeSize = 300;     // Size of the circle
float time = 0;          // Used for animation
float stepSize = 0.01;     // angle between two points on the circle.
boolean saveFrame = false;

int someNum;

void setup() {
  size(600, 600);
  background(255);
}

void draw() {
  if (saveFrame) {
    String dateTime = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + millis();
    String savePath = System.getenv("SAVES_LOCATION");
    String filePath = savePath + "/WobblyCircle-" + dateTime + ".svg";
    beginRecord(SVG, filePath);
  }

  // Clear the background leave a trace using alpha. Set alpha to 100 for no trace.
  fill(255, 20);
  noStroke();
  rect(0, 0, width, height);

  // Center the circle
  translate(width/2, height/2);

  // Draw the deformed circle
  noFill();
  stroke(125, 255);
  strokeWeight(1.5);

  for (float diameter = 10; diameter <= shapeSize; diameter += 20) {
    beginShape();
    for (float angle = 0; angle < TWO_PI; angle += stepSize) {
      float radius = diameter/2;

      float x1 = cos(angle);
      float y1 = sin(angle);

      float xOffset = cos(angle) * noiseScale;
      float yOffset = sin(angle) * noiseScale;

      float noiseVal = noise(x1 + xOffset, y1 + yOffset, time);
      float noiseDeform = map(noiseVal, 0, 1, -deformAmount, deformAmount);

      // Calculate deformed point position
      float x = cos(angle) * radius + (radius * noiseDeform);
      float y = sin(angle) * radius + (radius * noiseDeform);

      curveVertex(x, y);
    }
    endShape(CLOSE);
  }
  
  time += 0.01;

  if (saveFrame) {
    endRecord();
    saveFrame = false;
  }

  drawParameters();
}

void drawParameters() {
  // Reset transform for text
  resetMatrix();

  fill(0);
  textAlign(LEFT, TOP);
  textSize(12);
  text("deformAmount: " + nf(deformAmount, 0, 3), 10, 10);
  text("noiseScale: " + nf(noiseScale, 0, 3), 10, 30);
}

void keyPressed() {
  if (key == 's' || key == 'S') {
    saveFrame = true;
  }

  if (key == CODED) {
    if (keyCode == UP) {
      deformAmount += 0.05;
    } else if (keyCode == DOWN) {
      deformAmount -= 0.05;
    } else if (keyCode == LEFT) {
      noiseScale -= 0.1;
    } else if (keyCode == RIGHT) {
      noiseScale += 0.1;
    }
  }
}
