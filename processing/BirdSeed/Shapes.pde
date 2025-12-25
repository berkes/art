class Bird {
  PVector pos;
  int minSize;
  int maxSize;
  color c;

  Body body;
  Feet feet;
  Head head;
  Neck neck;
  Eye eye;
  Beak beak;
  Tail tail;

  Bird(PVector pos, color c, int minSize, int maxSize) {
    this.pos = pos.copy();
    this.c = c;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.randomize();
  }


  
  void transition(Bird to, int inFrames) {
      body.transition(to.body, inFrames);
      // feet.transition(to.feet, inFrames);
      // head.transition(to.head, inFrames);
      // neck doesn't inherit from Shape so it can't transition
      // eye.transition(to.eye, inFrames);
      // beak.transition(to.beak, inFrames);
      // tail.transition(to.tail, inFrames);
  }

  void display() {
    body.display();
    feet.display();
    head.display();
    neck.display();
    eye.display();
    beak.display();
    tail.display();
  }

  void animateStep() {
    body.animateStep();
    feet.animateStep();
    head.animateStep();
    eye.animateStep();
    beak.animateStep();
    tail.animateStep();
  }

  void randomize() {
    float bodyRadius = random(minSize, maxSize);
    float feetLength = bodyRadius * random(1.5, 2.5);
    this.feet = new Feet(pos, feetLength, c);

    PVector bodyPos = PVector.sub(pos, new PVector(0, feetLength));
    this.body = new Body(bodyPos, bodyRadius, c);

    float headRadius;
    boolean hasNeck = random(0, 1) > 0.8;
    float headDistance;
    if (hasNeck) {
      // With neck the head is smaller
      headRadius = random(bodyRadius / 4, bodyRadius / 2);
      headDistance = random(bodyRadius * 1.5, bodyRadius * 3);
    } else {
      headRadius = random(bodyRadius / 2, bodyRadius * 0.8);
      headDistance = random(bodyRadius, bodyRadius + headRadius);
    }

    float headAngle = random(-PI / 2, PI / 4);
    PVector headPos = PVector.add(bodyPos, new PVector(cos(headAngle) * headDistance, sin(headAngle) * headDistance));

    this.head = new Head(headPos, headRadius, c);

    // TODO: make neck a trapezoid and randomize the thickness of each end
    float neckThickness = random(headRadius / 2, headRadius);
    this.neck = new Neck(bodyPos, headPos, neckThickness, c);

    float eyeDistance = random(0, headRadius * 0.6);
    float eyeAngle = random(PI, TWO_PI);
    PVector eyePos = PVector.add(headPos, new PVector(cos(eyeAngle) * eyeDistance, sin(eyeAngle) * eyeDistance));
    this.eye = new Eye(eyePos, bgColor);

    float beakLength = random(headRadius / 2, headRadius);
    float beakWidth = random(headRadius / 4, headRadius / 2);
    float beakAngle = random(0, PI/3);
    PVector beakPos = PVector.add(headPos, new PVector(cos(beakAngle) * headRadius, sin(beakAngle) * headRadius));
    // Move the beak slightly towards the center of the head to generate some overlap
    beakPos.sub(PVector.fromAngle(beakAngle).mult(headRadius / 4));
    this.beak = new Beak(beakPos, beakLength, beakWidth, beakAngle, c);

    float tailLength = random(bodyRadius, bodyRadius * 2);
    float tailWidth = random(bodyRadius / 2, bodyRadius);
    float tailDistortion = random(0, tailLength / 10);
    float tailAngle = random(PI, PI * 1.2);
    PVector tailPos = bodyPos.copy();
    tailPos.sub(PVector.fromAngle(tailAngle).mult(1.1));
    this.tail = new Tail(tailPos, tailLength, tailWidth, tailDistortion, tailAngle, c);
  }
}

class Shape {
  PVector pos;
  boolean isAnimating = false;
  Shape transitionTarget;

  void display() {
    // Abstract method to be implemented by subclasses
  }
  

  
  void transition(Shape target, int inFrames) {
      isAnimating = true;
      transitionTarget = target;
      
      this.animateStep();
  }
  
  void animateStep() {
      // Implement in subclasses
  }
}

class Body extends Shape {
  float radius;
  color c;

  Body(PVector pos, float radius, color c) {
    this.pos = pos.copy();
    this.radius = radius;
    this.c = c;
  }

  void display() {
    pushMatrix();
    if (debug) {
      println("Body pos: " + pos.x + ", " + pos.y);
    } 
    translate(pos.x, pos.y);
    fill(c);
    noStroke();
    ellipse(0, 0, radius * 2, radius * 2);
    popMatrix();
  }
  
  void animateStep() {
      if (!isAnimating) return;
      
      if (this.pos.dist(this.transitionTarget.pos) <= 0) {
          this.isAnimating = false;
          this.transitionTarget = null;
      }
      
      // One step towards the target position
      PVector dPos = transitionTarget.pos.sub(this.pos).div(10);
      
      if (debug) {
          println("Body transition from: " + this.pos.x + ", " + this.pos.y + " to: " + transitionTarget.pos.x + ", " + transitionTarget.pos.y);
          println("Body transition distance: " + dPos.mag());
          println("Body transition direction: " + dPos.heading());
      }
  }
}

class Feet extends Shape {
  float length;
  float thickness;
  float spacing;
  color c;

  Feet(PVector pos, float length, color c) {
    this.pos = pos.copy();
    this.length = length;
    this.thickness = FIXED_COMPONENT_SIZE;
    this.spacing = FIXED_COMPONENT_SIZE * 2;
    this.c = c;
  }

  void display() {
    pushMatrix();
    translate(pos.x, pos.y);
    if (debug) {
      stroke(dbgColor);
      strokeWeight(2);
      println("Feet pos: " + pos.x + ", " + pos.y);
      ellipse(0, 0, 10, 10);
    } else {
      noStroke();
    }
    noFill();
    strokeWeight(thickness);
    stroke(c);
    // Draw the line from the ground upwards
    line(-spacing, 0, -spacing, -this.length);
    line(spacing, 0, spacing, -this.length);
    popMatrix();
  }

  void animateStep() {
      // Feet don't animate in transitions currently
  }
}

class Head extends Shape {
  float radius;
  color c;

  Head(PVector pos, float radius, color c) {
    this.pos = pos.copy();
    this.radius = radius;
    this.c = c;
  }

  void display() {
    pushMatrix();
    fill(c);
    if (debug) {
      stroke(dbgColor);
      strokeWeight(2);
    } else {
      noStroke();
    }
    translate(pos.x, pos.y);
    ellipse(0, 0, radius * 2, radius * 2);
    popMatrix();
  }

  void animateStep() {
      // Head doesn't animate in transitions currently
  }
}

class Neck {
  PVector from;
  PVector to;
  float thickness;
  color c;

  Neck(PVector from, PVector to, float thickness, color c) {
    this.from = from.copy();
    this.to = to.copy();
    this.thickness = thickness;
    this.c = c;
  }

  void display() {
    pushMatrix();
    noFill();
    strokeWeight(thickness);
    stroke(c);
    line(from.x, from.y, to.x, to.y);
    popMatrix();
  }


}

class Eye extends Shape {
  float radius;
  color c;

  Eye(PVector pos, color c) {
    this.pos = pos.copy();
    this.radius = FIXED_COMPONENT_SIZE;
    this.c = c;
  }

  void display() {
    pushMatrix();
    translate(pos.x, pos.y);
    fill(c);
    if (debug) {
      stroke(dbgColor);
      strokeWeight(2);
    } else {
      noStroke();
    }
    noStroke();
    ellipse(0, 0, radius * 2, radius * 2);
    popMatrix();
  }

  void animateStep() {
      // Eye doesn't animate in transitions currently
  }
}

class Beak extends Shape {
  float length;
  float width;
  float rotation;
  color c;

  Beak(PVector pos, float length, float width, float rotation, color c) {
    this.pos = pos.copy();
    this.length = length;
    this.width = width;
    this.rotation = rotation;
    this.c = c;
  }

  void display() {
    pushMatrix();
    fill(c);
    if (debug) {
      stroke(dbgColor);
      strokeWeight(2);
    } else {
      noStroke();
    }
    translate(pos.x, pos.y);
    rotate(rotation);
    beginShape();
    vertex(0, 0);
    vertex(length, width / 2);
    vertex(0, width);
    endShape(CLOSE);
    popMatrix();
  }

  void animateStep() {
      // Beak doesn't animate in transitions currently
  }
}

class Tail extends Shape {
  float distortion;
  float angle;
  float length;
  float width;
  color c;

  PVector corner0, corner1, corner2;

  Tail(PVector pos, float length, float width, float distortion, float angle, color c) {
    this.pos = pos.copy();
    this.angle = angle;
    this.distortion = distortion;
    this.length = length;
    this.width = width;
    this.c = c;

    this.corner0 = new PVector(0, 0);
    this.corner1 = this.distort(new PVector(length, -width/2));
    this.corner2 = this.distort(new PVector(length, width/2));
  }

  PVector distort(PVector p) {
    float x = p.x + (random(0, 1) * distortion);
    float y = p.y + (random(0, 1) * distortion);

    if (debug) {
      println("distort from: " + p.x + ", " + p.y + " to: " + x + ", " + y);
    }
    return new PVector(x, y);
  }

  void display() {
    pushMatrix();
    fill(c);
    if (debug) {
      stroke(dbgColor);
      strokeWeight(2);
      // Draw a line from the pos of the tail in the angle of the tail
      line(pos.x, pos.y, pos.x + cos(angle) * length, pos.y + sin(angle) * length);
    } else {
      noStroke();
    }

    translate(pos.x, pos.y);
    rotate(angle);

    beginShape();
    vertex(corner0.x, corner0.y);
    vertex(corner1.x, corner1.y);
    vertex(corner2.x, corner2.y);
    endShape(CLOSE);
    popMatrix();
  }

  void animateStep() {
      // Tail doesn't animate in transitions currently
  }
}
