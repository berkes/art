/**
 * mover is a thing that we can apply forces to and it can change its position
 * based on those forces.
 */
public interface mover {
  void update();
  void stop();
  void applyForce(PVector force);

  void attract(mover m);
  void repel(mover m);

  float getMass();
  PVector getPosition();
}
