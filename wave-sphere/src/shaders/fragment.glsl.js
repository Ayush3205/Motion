export default `
varying float vNoise;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);
  
  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  alpha = pow(alpha, 2.0);
  
  if (alpha < 0.01) discard;
  
  vec3 baseColor = vec3(0.6, 0.9, 1.0);
  
  float intensityModifier = smoothstep(-1.5, 1.5, vNoise);
  vec3 finalColor = baseColor * (0.5 + intensityModifier * 0.8);
  
  gl_FragColor = vec4(finalColor, alpha * (0.3 + intensityModifier * 0.7));
}
`;
