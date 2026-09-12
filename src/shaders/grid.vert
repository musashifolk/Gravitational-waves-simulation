varying vec2 vUv;

uniform vec2 pos1;
uniform vec2 pos2;
uniform float time;
uniform float freq;
uniform float waveAmplitude;
uniform float visualR;

void main() {
  vUv = uv;
  vec3 pos = position;
  vec2 xz = vec2(pos.x, pos.z);

  float d1 = length(xz - pos1);
  float d2 = length(xz - pos2);

  // gravitational wells, deeper as holes get closer
  float wellDepth = 1.0 + (1.0 - visualR / 15.0) * 2.0;
  float well = -(10.0 * wellDepth / (d1 + 1.5)) - (7.0 * wellDepth / (d2 + 1.5));

  // outward concentric wave rings, exponential falloff from center
  float dist = length(xz);
  float waveSpeed = 1.8 + min(freq, 0.8) * 5.0;
  float wave = waveAmplitude
    * sin(dist * 0.45 - time * waveSpeed)
    * exp(-dist * 0.012);

  pos.y += well + wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
