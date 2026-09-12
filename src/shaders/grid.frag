varying vec2 vUv;

void main() {
  vec2 cell = fract(vUv * 55.0);
  float distToLine = min(
    min(cell.x, 1.0 - cell.x),
    min(cell.y, 1.0 - cell.y)
  );

  float line = step(distToLine, 0.025);

  vec3 base = vec3(0.02, 0.04, 0.10);
  float fromCenter = length(vUv - 0.5) * 2.0;
  vec3 lineColor = mix(vec3(0.88, 0.94, 1.0), vec3(0.25, 0.50, 0.80), fromCenter);

  gl_FragColor = vec4(mix(base, lineColor, line), 1.0);
}
