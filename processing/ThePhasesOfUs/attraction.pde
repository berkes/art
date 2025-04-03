public class Attraction {
  Mover a, b;

  private Attraction(Mover a, Mover b) {
    this.a = a;
    this.b = b;
  }

  public void update() {
    //springAttraction();
    gravitationalAttraction();

    this.drag();
  }

  private void springAttraction() {
    // TODO: spring rest at a.r + b.r with a margin?
    float springRest = 105.0;
    float stiffness_k = 0.01;
    PVector atob = aToB();
    float distance = atob.mag() - springRest; 
    atob.normalize();
    float strength = stiffness_k * distance;
    atob.mult(strength);

    this.a.applyForce(PVector.div(atob, 2));
    this.b.applyForce(PVector.div(atob, -2));
  }

  private void gravitationalAttraction() {
    int minDist = 5;
    int maxDist = 15;

    PVector force = aToB();
    float distance = force.mag();
    distance = constrain(distance, minDist, maxDist);
    force.normalize();
    float strength = G * ((a.getMass() * b.getMass()) / (distance * distance));
    force.mult(strength);

    this.a.applyForce(force);
    this.b.applyForce(PVector.mult(force, -1));
  }

  private void bounce() {
    // Other ball
    // TODO: Implement below:
    //  Find the vector between A and B, aToBVec
    //  Check what point on this vec is on the edge of A and the edge of B: borderPointA, borderPointB
    //  Check if borderPointA is inside of B, and if borderPointB is inside of A (We probably need only one!)
    //  If so, check the angle at which borderPointA approaches borderPointB. 

    // TODO: abstract the border detection. Hardcoding the r here is ugly and naive and will fail
    float rA = 55;
    float rB = 50;
    if (this.a.getPosition().dist(this.b.getPosition()) > (rA + rB)) {
    }
  }

  private void drag() {
    float dragConst = -0.4;
    if (this.aToB().mag() < 100.0) {
      PVector vela = this.a.getVelocity();
      PVector dragForcea = PVector.mult(vela, dragConst);
      this.a.applyForce(dragForcea);
      this.b.applyForce(PVector.mult(dragForcea, -1));
      
      PVector velb = this.b.getVelocity();
      PVector dragForceb = PVector.mult(velb, dragConst);
      this.b.applyForce(dragForceb);
      this.b.applyForce(PVector.mult(dragForceb, -1));
    }
  }

  private PVector aToB() {
    return PVector.sub(b.getPosition(), a.getPosition());
  }
}

public Attraction pickRandom(ArrayList<? extends Mover> movers) {
  if (movers.size() < 2) {
    throw new Error("Could not pick a random pair: we need at least two movers");
  }

  boolean picked = false;
  int attempts = 0;
  Mover a = null;
  Mover b = null;

  while(!picked) {
    int i = (int)random(movers.size());
    int j = (int)random(movers.size());
    a = movers.get(i);
    b = movers.get(j);

    if (a != b) {
      picked = true;
    }

    if (attempts >= 9) {
      throw new Error("Could not pick a random pair: 10 attempts");
    }
    attempts++;
  }

  if (a == null || b == null) {
    throw new Error("Could not pick a random pair: one of the sides is undefined");
  }


  return new Attraction(a, b);
}
