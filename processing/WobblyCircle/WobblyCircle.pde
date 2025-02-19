float noiseScale = 0.87;  // Controls how smooth the deformation is
float deformAmount = 0.5;  // Controls how much the circle deforms as fraction of the radius.
//float diameter = 300;     // Size of the circle
float time = 0;          // Used for animation
float stepSize = 0.01;     // angle between two points on the circle.

int someNum;


void setup() {
  size(600, 600);
  background(255);
}

void draw() {
  // Map mouse coordinates to parameters
  //deformAmount = map(mouseX, 0, width, -1, 1);
  //noiseScale = map(mouseY, 0, height, 0, 1);

  //fill(255, 10);
  //noStroke();
  //rect(0, 0, width, height);
  background(255);

  // Center the circle
  translate(width/2, height/2);

  // Draw the deformed circle
  noFill();
  stroke(0, 180);
  strokeWeight(1.5);

  for (float diameter = 10; diameter <= 300; diameter += 20) {
    beginShape();
    for (float angle = 0; angle < TWO_PI; angle += stepSize) {
      float radius = diameter/2;

      // This creates a continuous loop while maintaining asymmetry
      float x1 = cos(angle);
      float y1 = sin(angle);

      float noiseVal = noise(x1 * noiseScale, y1 * noiseScale, diameter * noiseScale * 0.001 + time);
      float noiseDeform = map(noiseVal, 0, 1, -deformAmount, deformAmount);

      // Calculate deformed point position
      float x = cos(angle) * radius + (radius * noiseDeform);
      float y = sin(angle) * radius + (radius * noiseDeform);

      curveVertex(x, y);
    }
    endShape(CLOSE);
  }
  
  time += 0.001;

  drawParameters();
}

void drawParameters() {
  // Reset transform for text
  resetMatrix();

  fill(0);
  textAlign(LEFT, TOP);
  textSize(12);
  text("deformAmount: " + nf(deformAmount, 0, 1), 10, 10);
  text("noiseScale: " + nf(noiseScale, 0, 3), 10, 30);
}
