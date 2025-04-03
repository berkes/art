/**
 * mover is a thing that we can apply forces to and it can change its position
 * based on those forces.
 */
public interface Mover {
  void update();
  void stop();
  void applyForce(PVector force);
  boolean collides(PVector point);

  float getMass();
  
  PVector getPosition();
  PVector getVelocity();

}
