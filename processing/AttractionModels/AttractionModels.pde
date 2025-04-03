// Settings
static final int NUM_PARTICLES = 2;

ArrayList<Particle> particles = new ArrayList<Particle>();
Attraction attraction;

void setup() {
  size(900, 900); 
  background(0);

  // A force outwards
  for (int i = 0; i < NUM_PARTICLES; i++) {
    Particle particle = new Particle(new PVector(random(width), random(height)), random(4, 6));
    particles.add(particle);

    // outwards force
    PVector force = PVector.sub(particle.position, new PVector(width / 2, height / 2));
    force.normalize();
    force.mult(6);
    particle.applyForce(force);
  }
}

void draw() {
  // slowly fade trails
  noStroke();
  fill(0, 5);
  rect(0, 0, width, height);

  for (Particle particle : particles) {
    PVector bounceForce = bounceForce(particle);
    if (bounceForce.x != 0 || bounceForce.y != 0) {
      particle.applyForce(bounceForce);
    }

    // Apply a drag force as if the particles are moving through a viscous medium
    PVector dragForce = particle.getVelocity().copy();
    dragForce.mult(-0.01); // Adjust the drag coefficient as needed
    particle.applyForce(dragForce);
  }

  if (attraction != null) {
    attraction.update();
  }

  for (Particle particle : particles) {
    particle.update();
    particle.display();
  }
}

void keyPressed() {
  // attract
  if (key == 'a') {
    attraction = pickRandom(particles);
  }

  // let go
  if (key == 'z') {
    attraction = null;
  }

  // boost
  if (key == 'b') {
    for (Particle particle : particles) {
      // boost in direction of velocity
      PVector force = particle.getVelocity().copy();
      force.normalize();
      force.mult(2);
      particle.applyForce(force);
    }
  }
}

PVector bounceForce(Particle particle) {
  PVector bounceForce = new PVector(0, 0);
  if (particle.position.x >= width - particle.radius) {
    bounceForce.x = -2 * particle.velocity.x * particle.mass;
  } else if (particle.position.x <= 0 + particle.radius) {
    bounceForce.x = -2 * particle.velocity.x * particle.mass;
  }

  if (particle.position.y >= height - particle.radius) {
    bounceForce.y = -2 * particle.velocity.y * particle.mass;
  } else if (particle.position.y <= 0 + particle.radius) {
    bounceForce.y = -2 * particle.velocity.y * particle.mass;
  }

  return bounceForce;
}

class Particle implements Mover {
  PVector position;
  PVector velocity;
  PVector acceleration;
  float mass;
  float radius;
  
  Particle(PVector position, float mass) {
    this.position = position;
    this.mass = mass;
    this.radius = mass; // Scale radius based on mass, for now keep them equal
    this.velocity = new PVector(0, 0);
    this.acceleration = new PVector(0, 0);
  }
  
  public void update() {
    velocity.add(acceleration);
    position.add(velocity);
    acceleration.mult(0); // Reset acceleration
  }
  
  public void stop() {
    velocity.mult(0);
  }
  
  public void applyForce(PVector force) {
    PVector f = force.copy();
    f.div(mass);
    acceleration.add(f);
  }

  public boolean collides(PVector point) {
    return position.dist(point) <= radius;
  }

  public float getMass() {
    return mass;
  }
  public PVector getPosition() {
    return position;
  }
  public PVector getVelocity() {
    return velocity;
  }

  public void display() {
    stroke(255);
    point(position.x, position.y);
    // ellipse(position.x, position.y, radius * 2, radius * 2);
  }
}
