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

// Ridiculously rubbery easing function - exaggerated bounces and overshooting
// This creates an extreme rubber band effect with multiple wild bounces
float ridiculousElasticEase(float t) {
  float extremeAmplitude = 1.5;   // Massive overshoot amplitude
  float highFrequency = 10.0;     // Many bounces
  float slowDamping = 2.0;       // Very slow decay for long-lasting bounces
  float phaseShift = 0.5;         // Different starting phase for more chaos
  float c4 = (2 * PI) / 3;       // Constant for sine wave calculation
  
  // Apply extreme easing with amplitude scaling
  float baseEasing = pow(2, -slowDamping * t) * sin((t * highFrequency - phaseShift) * c4) + 1;
  float exaggeratedEasing = 1 + extremeAmplitude * baseEasing;
  
  // Clamp to reasonable range to prevent extreme values
  return t == 0 ? 0 : (t == 1 ? 1 : constrain(exaggeratedEasing, -1.5, 2.5));
}
