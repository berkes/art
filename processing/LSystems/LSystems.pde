LSystem lSystem;

void setup() {
  background(255);
  size(800, 800);
  stroke(0);
  
  lSystem = new LSystem();

  lSystem.setAxiom("F");
  // lSystem.addRule('F', "FF+[+F-F-F]-[-F+F+F]");
  lSystem.addRule('F', "FF+[+F]-[-F]");

  lSystem.setLength(5);
  lSystem.setIterations(5);
  lSystem.setAngle(25);
  lSystem.generate();
}

void draw() {
  colorMode(HSB, 360, 100, 100, 1.0);
  background(360, 0, 100, 1.0);
  lSystem.render();

  noLoop();
}

void keyPressed() {
  if (key == CODED) {
    switch (keyCode) {
    case UP:
      lSystem.setAngle(lSystem.getAngle() + 5);
      break;
    case DOWN:
      lSystem.setAngle(lSystem.getAngle() - 5);
      break;
    case RIGHT:
      lSystem.setLength(lSystem.getLength() + 0.1);
      break;
    case LEFT:
      lSystem.setLength(lSystem.getLength() - 0.1);
      break;
    default:
      break;
    }
  }

  lSystem.generate();

  redraw();
}
