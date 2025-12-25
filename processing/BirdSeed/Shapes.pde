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

    void transition(Bird to) {
        // Delegate transition to all shapes
        body.transition(to.body);
        feet.transition(to.feet);
        head.transition(to.head);
        neck.transition(to.neck);
        eye.transition(to.eye);
        beak.transition(to.beak);
        tail.transition(to.tail);
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
        PVector headPos = PVector.add(
            bodyPos,
            new PVector(
                cos(headAngle) * headDistance,
                sin(headAngle) * headDistance
            )
        );

        this.head = new Head(headPos, headRadius, c);

        // TODO: make neck a trapezoid and randomize the thickness of each end
        float neckThickness = random(headRadius / 2, headRadius);
        this.neck = new Neck(bodyPos, headPos, neckThickness, c);

        float eyeDistance = random(0, headRadius * 0.6);
        float eyeAngle = random(PI, TWO_PI);
        PVector eyePos = PVector.add(
            headPos,
            new PVector(
                cos(eyeAngle) * eyeDistance,
                sin(eyeAngle) * eyeDistance
            )
        );
        this.eye = new Eye(eyePos, bgColor);

        float beakLength = random(headRadius / 2, headRadius);
        float beakWidth = random(headRadius / 4, headRadius / 2);
        float beakAngle = random(0, PI / 3);
        PVector beakPos = PVector.add(
            headPos,
            new PVector(
                cos(beakAngle) * headRadius,
                sin(beakAngle) * headRadius
            )
        );
        // Move the beak slightly towards the center of the head to generate some overlap
        beakPos.sub(PVector.fromAngle(beakAngle).mult(headRadius / 4));
        this.beak = new Beak(beakPos, beakLength, beakWidth, beakAngle, c);

        float tailLength = random(bodyRadius, bodyRadius * 2);
        float tailWidth = random(bodyRadius / 2, bodyRadius);
        float tailDistortion = random(0, tailLength / 10);
        float tailAngle = random(PI, PI * 1.2);
        PVector tailPos = bodyPos.copy();
        tailPos.sub(PVector.fromAngle(tailAngle).mult(1.1));
        this.tail = new Tail(
            tailPos,
            tailLength,
            tailWidth,
            tailDistortion,
            tailAngle,
            c
        );
    }
}

class Shape {

    PVector pos;
    Shape transitionTarget;

    void display() {
        // Abstract method to be implemented by subclasses
    }

    // Base transition method - handles the common transition logic
    void transition(Shape target) {
        if (target == null) {
            return; // Safety check
        }

        if (transitionTarget == null) {
            // First call - set up transition
            transitionTarget = target;
        }

        // Perform one step of transition
        if (hasReachedTarget()) {
            completeTransition();
        } else {
            stepTowardsTarget();
        }
    }

    // Subclasses must implement this to check if transition is complete
    boolean hasReachedTarget() {
        // Subclasses should override this to check all their transitioning attributes
        // Return true if transition is complete, false otherwise
        return true;
    }

    // Subclasses must implement this to perform one step of transition
    void stepTowardsTarget() {
        // Subclasses should override this to handle their specific transition logic
        // This method is called every frame until hasReachedTarget() returns true
    }

    // Subclasses must implement this to finalize the transition
    void completeTransition() {
        // Subclasses should override this to set final values when transition completes
        transitionTarget = null;
    }
}

class Body extends Shape {

    float radius;
    float targetRadius;
    color c;

    Body(PVector pos, float radius, color c) {
        this.pos = pos.copy();
        this.radius = radius;
        this.targetRadius = radius;
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

    // Override hasReachedTarget to check all Body attributes
    boolean hasReachedTarget() {
        if (transitionTarget == null) return true;
        Body targetBody = (Body) transitionTarget;
        return (
            PVector.dist(this.pos, targetBody.pos) < 0.1 &&
            abs(this.radius - targetBody.radius) < 0.1
        );
    }

    // Override stepTowardsTarget for Body-specific stepping
    void stepTowardsTarget() {
        Body targetBody = (Body) transitionTarget;

        // Step towards target position
        this.pos.x = lerp(this.pos.x, targetBody.pos.x, TRANSITION_STEP_SIZE);
        this.pos.y = lerp(this.pos.y, targetBody.pos.y, TRANSITION_STEP_SIZE);

        // Step towards target radius
        this.radius = lerp(
            this.radius,
            targetBody.radius,
            TRANSITION_STEP_SIZE
        );

        if (debug) {
            println(
                "Body transition pos: " +
                    this.pos.x +
                    ", " +
                    this.pos.y +
                    " radius: " +
                    this.radius
            );
        }
    }

    // Override completeTransition for Body-specific completion
    void completeTransition() {
        Body targetBody = (Body) transitionTarget;
        if (targetBody != null) {
            this.pos = targetBody.pos.copy();
            this.radius = targetBody.radius;
        }
        super.completeTransition(); // Call parent to clear transitionTarget
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

    // Override hasReachedTarget to check all Feet attributes
    boolean hasReachedTarget() {
        if (transitionTarget == null) return true;
        Feet targetFeet = (Feet) transitionTarget;
        return (
            PVector.dist(this.pos, targetFeet.pos) < 0.1 &&
            abs(this.length - targetFeet.length) < 0.1 &&
            abs(this.thickness - targetFeet.thickness) < 0.1 &&
            abs(this.spacing - targetFeet.spacing) < 0.1
        );
    }

    // Override stepTowardsTarget for Feet-specific stepping
    void stepTowardsTarget() {
        Feet targetFeet = (Feet) transitionTarget;

        // Step towards target position
        this.pos.x = lerp(this.pos.x, targetFeet.pos.x, TRANSITION_STEP_SIZE);
        this.pos.y = lerp(this.pos.y, targetFeet.pos.y, TRANSITION_STEP_SIZE);

        // Step towards target attributes
        this.length = lerp(
            this.length,
            targetFeet.length,
            TRANSITION_STEP_SIZE
        );
        this.thickness = lerp(
            this.thickness,
            targetFeet.thickness,
            TRANSITION_STEP_SIZE
        );
        this.spacing = lerp(
            this.spacing,
            targetFeet.spacing,
            TRANSITION_STEP_SIZE
        );

        if (debug) {
            println(
                "Feet transition length: " +
                    this.length +
                    " thickness: " +
                    this.thickness +
                    " spacing: " +
                    this.spacing
            );
        }
    }

    // Override completeTransition for Feet-specific completion
    void completeTransition() {
        Feet targetFeet = (Feet) transitionTarget;
        if (targetFeet != null) {
            this.pos = targetFeet.pos.copy();
            this.length = targetFeet.length;
            this.thickness = targetFeet.thickness;
            this.spacing = targetFeet.spacing;
        }
        super.completeTransition(); // Call parent to clear transitionTarget
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

    // Override hasReachedTarget to check all Head attributes
    boolean hasReachedTarget() {
        if (transitionTarget == null) return true;
        Head targetHead = (Head) transitionTarget;
        return (
            PVector.dist(this.pos, targetHead.pos) < 0.1 &&
            abs(this.radius - targetHead.radius) < 0.1
        );
    }

    // Override stepTowardsTarget for Head-specific stepping
    void stepTowardsTarget() {
        Head targetHead = (Head) transitionTarget;

        // Step towards target position
        this.pos.x = lerp(this.pos.x, targetHead.pos.x, TRANSITION_STEP_SIZE);
        this.pos.y = lerp(this.pos.y, targetHead.pos.y, TRANSITION_STEP_SIZE);

        // Step towards target radius
        this.radius = lerp(
            this.radius,
            targetHead.radius,
            TRANSITION_STEP_SIZE
        );

        if (debug) {
            println(
                "Head transition pos: " +
                    this.pos.x +
                    ", " +
                    this.pos.y +
                    " radius: " +
                    this.radius
            );
        }
    }

    // Override completeTransition for Head-specific completion
    void completeTransition() {
        Head targetHead = (Head) transitionTarget;
        if (targetHead != null) {
            this.pos = targetHead.pos.copy();
            this.radius = targetHead.radius;
        }
        super.completeTransition(); // Call parent to clear transitionTarget
    }
}

class Neck extends Shape {

    PVector from;
    PVector to;
    float thickness;
    color c;

    Neck(PVector from, PVector to, float thickness, color c) {
        this.from = from.copy();
        this.to = to.copy();
        this.thickness = thickness;
        this.c = c;

        // Set pos to midpoint for transition purposes
        this.pos = PVector.add(from, to).div(2);
    }

    void display() {
        pushMatrix();
        noFill();
        strokeWeight(thickness);
        stroke(c);
        line(from.x, from.y, to.x, to.y);
        popMatrix();
    }

    // Override hasReachedTarget to check all Neck attributes
    boolean hasReachedTarget() {
        if (transitionTarget == null) return true;
        Neck targetNeck = (Neck) transitionTarget;
        return (
            PVector.dist(this.to, targetNeck.to) < 0.1 &&
            PVector.dist(this.from, targetNeck.from) < 0.1 &&
            abs(this.thickness - targetNeck.thickness) < 0.1
        );
    }

    // Override stepTowardsTarget for Neck-specific stepping
    void stepTowardsTarget() {
        Neck targetNeck = (Neck) transitionTarget;

        // Step towards target position (midpoint)
        this.to.x = lerp(this.to.x, targetNeck.to.x, TRANSITION_STEP_SIZE);
        this.to.y = lerp(this.to.y, targetNeck.to.y, TRANSITION_STEP_SIZE);
        this.from.x = lerp(this.from.x, targetNeck.from.x, TRANSITION_STEP_SIZE);
        this.from.y = lerp(this.from.y, targetNeck.from.y, TRANSITION_STEP_SIZE);

        // Step towards target thickness
        this.thickness = lerp(
            this.thickness,
            targetNeck.thickness,
            TRANSITION_STEP_SIZE
        );
        
        if (debug) {
            println(
                "Neck transition pos: " +
                    this.pos.x +
                    ", " +
                    this.pos.y +
                    " thickness: " +
                    this.thickness
            );
        }
    }

    // Override completeTransition for Neck-specific completion
    void completeTransition() {
        Neck targetNeck = (Neck) transitionTarget;
        if (targetNeck != null) {
            this.pos = targetNeck.pos.copy();
            this.thickness = targetNeck.thickness;
            this.from = targetNeck.from.copy();
            this.to = targetNeck.to.copy();
        }
        super.completeTransition(); // Call parent to clear transitionTarget
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
    
    // Override hasReachedTarget to check Eye attributes
    boolean hasReachedTarget() {
        if (transitionTarget == null) return true;
        Eye targetEye = (Eye) transitionTarget;
        return PVector.dist(this.pos, targetEye.pos) < 0.1 && 
               abs(this.radius - targetEye.radius) < 0.1;
    }
    
    // Override stepTowardsTarget for Eye-specific stepping
    void stepTowardsTarget() {
        Eye targetEye = (Eye) transitionTarget;
        
        // Step towards target position
        this.pos.x = lerp(this.pos.x, targetEye.pos.x, TRANSITION_STEP_SIZE);
        this.pos.y = lerp(this.pos.y, targetEye.pos.y, TRANSITION_STEP_SIZE);
        
        // Step towards target radius
        this.radius = lerp(this.radius, targetEye.radius, TRANSITION_STEP_SIZE);
        
        if (debug) {
            println("Eye transition pos: " + this.pos.x + ", " + this.pos.y + " radius: " + this.radius);
        }
    }
    
    // Override completeTransition for Eye-specific completion
    void completeTransition() {
        Eye targetEye = (Eye) transitionTarget;
        if (targetEye != null) {
            this.pos = targetEye.pos.copy();
            this.radius = targetEye.radius;
            this.c = targetEye.c;
        }
        super.completeTransition(); // Call parent to clear transitionTarget
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
    
    // Override hasReachedTarget to check Beak attributes
    boolean hasReachedTarget() {
        if (transitionTarget == null) return true;
        Beak targetBeak = (Beak) transitionTarget;
        return PVector.dist(this.pos, targetBeak.pos) < 0.1 && 
               abs(this.length - targetBeak.length) < 0.1 &&
               abs(this.width - targetBeak.width) < 0.1 &&
               abs(this.rotation - targetBeak.rotation) < 0.01;
    }
    
    // Override stepTowardsTarget for Beak-specific stepping
    void stepTowardsTarget() {
        Beak targetBeak = (Beak) transitionTarget;
        
        // Step towards target position
        this.pos.x = lerp(this.pos.x, targetBeak.pos.x, TRANSITION_STEP_SIZE);
        this.pos.y = lerp(this.pos.y, targetBeak.pos.y, TRANSITION_STEP_SIZE);
        
        // Step towards target dimensions
        this.length = lerp(this.length, targetBeak.length, TRANSITION_STEP_SIZE);
        this.width = lerp(this.width, targetBeak.width, TRANSITION_STEP_SIZE);
        
        // Step towards target rotation (use linear interpolation for angles)
        this.rotation = lerp(this.rotation, targetBeak.rotation, TRANSITION_STEP_SIZE);
        
        if (debug) {
            println("Beak transition pos: " + this.pos.x + ", " + this.pos.y + 
                   " length: " + this.length + " width: " + this.width + 
                   " rotation: " + this.rotation);
        }
    }
    
    // Override completeTransition for Beak-specific completion
    void completeTransition() {
        Beak targetBeak = (Beak) transitionTarget;
        if (targetBeak != null) {
            this.pos = targetBeak.pos.copy();
            this.length = targetBeak.length;
            this.width = targetBeak.width;
            this.rotation = targetBeak.rotation;
            this.c = targetBeak.c;
        }
        super.completeTransition(); // Call parent to clear transitionTarget
    }
}

class Tail extends Shape {

    float distortion;
    float angle;
    float length;
    float width;
    color c;

    PVector corner0, corner1, corner2;

    Tail(
        PVector pos,
        float length,
        float width,
        float distortion,
        float angle,
        color c
    ) {
        this.pos = pos.copy();
        this.angle = angle;
        this.distortion = distortion;
        this.length = length;
        this.width = width;
        this.c = c;

        this.corner0 = new PVector(0, 0);
        this.corner1 = this.distort(new PVector(length, -width / 2));
        this.corner2 = this.distort(new PVector(length, width / 2));
    }

    PVector distort(PVector p) {
        float x = p.x + (random(0, 1) * distortion);
        float y = p.y + (random(0, 1) * distortion);

        if (debug) {
            println(
                "distort from: " + p.x + ", " + p.y + " to: " + x + ", " + y
            );
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
            line(
                pos.x,
                pos.y,
                pos.x + cos(angle) * length,
                pos.y + sin(angle) * length
            );
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
    
    // Override hasReachedTarget to check Tail attributes
    boolean hasReachedTarget() {
        if (transitionTarget == null) return true;
        Tail targetTail = (Tail) transitionTarget;
        return PVector.dist(this.pos, targetTail.pos) < 0.1 && 
               abs(this.length - targetTail.length) < 0.1 &&
               abs(this.width - targetTail.width) < 0.1 &&
               abs(this.angle - targetTail.angle) < 0.01 &&
               abs(this.distortion - targetTail.distortion) < 0.1;
    }
    
    // Override stepTowardsTarget for Tail-specific stepping
    void stepTowardsTarget() {
        Tail targetTail = (Tail) transitionTarget;
        
        // Step towards target position
        this.pos.x = lerp(this.pos.x, targetTail.pos.x, TRANSITION_STEP_SIZE);
        this.pos.y = lerp(this.pos.y, targetTail.pos.y, TRANSITION_STEP_SIZE);
        
        // Step towards target dimensions
        this.length = lerp(this.length, targetTail.length, TRANSITION_STEP_SIZE);
        this.width = lerp(this.width, targetTail.width, TRANSITION_STEP_SIZE);
        
        // Step towards target angle
        this.angle = lerp(this.angle, targetTail.angle, TRANSITION_STEP_SIZE);
        
        // Step towards target distortion
        this.distortion = lerp(this.distortion, targetTail.distortion, TRANSITION_STEP_SIZE);
        
        // Update corners based on new dimensions (without random distortion during transition)
        this.corner1 = new PVector(this.length, -this.width / 2);
        this.corner2 = new PVector(this.length, this.width / 2);
        
        if (debug) {
            println("Tail transition pos: " + this.pos.x + ", " + this.pos.y + 
                   " length: " + this.length + " width: " + this.width + 
                   " angle: " + this.angle + " distortion: " + this.distortion);
        }
    }
    
    // Override completeTransition for Tail-specific completion
    void completeTransition() {
        Tail targetTail = (Tail) transitionTarget;
        if (targetTail != null) {
            this.pos = targetTail.pos.copy();
            this.length = targetTail.length;
            this.width = targetTail.width;
            this.angle = targetTail.angle;
            this.distortion = targetTail.distortion;
            this.c = targetTail.c;
            
            // Recreate corners with proper distortion from target
            this.corner0 = new PVector(0, 0);
            this.corner1 = this.distort(new PVector(this.length, -this.width / 2));
            this.corner2 = this.distort(new PVector(this.length, this.width / 2));
        }
        super.completeTransition(); // Call parent to clear transitionTarget
    }
}
