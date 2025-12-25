// Easing functions for animations

// Elastic easing function for rubbery effects
// Parameters:
// - t: Normalized time (0 to 1), where 0 is the start and 1 is the end of the transition
// - amplitude: Controls the overshoot amplitude (higher = more bounce)
// - frequency: Controls the number of bounces (higher = more bounces)
// - damping: Controls how quickly the bounces decay (higher = faster decay)
float elasticEase(float t) {
  float amplitude = 1.0;   // Controls overshoot amplitude
  float frequency = 5.0;   // Controls number of bounces (reduced for slower effect)
  float damping = 5.0;     // Controls bounce decay speed (reduced for slower decay)
  float phaseShift = 0.75; // Controls the starting phase of the bounce
  float c4 = (2 * PI) / 3; // Constant for sine wave calculation
  
  return t == 0 ? 0 : (t == 1 ? 1 : pow(2, -damping * t) * sin((t * frequency - phaseShift) * c4) + 1);
}
