static final float G = 20; // Gravitational constant

public class Attraction {
  Mover a, b;

  private Attraction(Mover a, Mover b) {
    this.a = a;
    this.b = b;
  }

  public void update() {
    PVector gravityForce = getGravityForce();
    a.applyForce(gravityForce);
    b.applyForce(gravityForce.mult(-1));

    PVector nudgeOutward = getNudgeOutward();
    a.applyForce(nudgeOutward);
    b.applyForce(nudgeOutward.mult(-1));

    PVector adjustmentForce = getAdjustmentForce();
    a.applyForce(adjustmentForce);
    b.applyForce(adjustmentForce.mult(-1));
  }

  public boolean attracts(PVector point) {
    return a == point || b == point;
  }

  // public PVector getSpringForce() {}

  public PVector getGravityForce() {
    PVector delta = PVector.sub(b.getPosition(), a.getPosition());
    float distance = constrain(delta.mag(), 5, 25); // Avoid singularities
    delta.normalize();

    float strength = (G * a.getMass() * b.getMass()) / (distance * distance);
    return delta.mult(strength);
  }

  public PVector getAdjustmentForce() {
    PVector delta = PVector.sub(b.getPosition(), a.getPosition());
    float distance = delta.mag();
    delta.normalize();

    // Ignore adjustment if particles are too far apart
    if (distance > 50) return new PVector(0, 0);

    float orbitalVelocity = sqrt(G * (a.getMass() + b.getMass()) / distance);

    PVector relativeVelocity = PVector.sub(b.getVelocity(), a.getVelocity());
    PVector radialVelocity = delta.copy().mult(PVector.dot(relativeVelocity, delta));
    PVector tangentialVelocity = PVector.sub(relativeVelocity, radialVelocity);

    // Reduce adjustment influence when particles are further apart
    float correctionFactor = map(distance, 5, 50, 0.2, 0.008);

    PVector correction = delta.copy().rotate(HALF_PI).setMag(orbitalVelocity - tangentialVelocity.mag());

    // Prevent excessive correction force
    correction.limit(orbitalVelocity * 0.1);

    return correction.mult(correctionFactor);
  }

  public PVector getNudgeOutward() {
    float minOrbitDistance = 15; // Desired stable orbit distance

    PVector delta = PVector.sub(b.getPosition(), a.getPosition());
    float distance = delta.mag();
    delta.normalize();

    if (distance > minOrbitDistance) {
      return new PVector(0, 0);
    }
    float repellingStrength = map(distance, 5, minOrbitDistance, 2.0, 0.1);
    PVector repellingForce = delta.copy().mult(-repellingStrength);
    return repellingForce;
  }
  // public PVector getDragForce() {}
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
