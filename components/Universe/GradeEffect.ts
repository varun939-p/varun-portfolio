import { BlendFunction, Effect } from "postprocessing";
import { Uniform, Vector3 } from "three";

// Single-pass high-contrast colour grade. Replaces BrightnessContrast +
// HueSaturation, which output solid white when postprocessing 6.36 merges the
// two into one EffectPass. Runs after tone mapping, on linear [0,1] colour.
const fragment = /* glsl */ `
uniform float gContrast;
uniform float gSaturation;
uniform vec3 gLift;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = max(inputColor.rgb, 0.0);
  // filmic contrast pivoting on linear middle grey, so shadows don't crush to black
  c = 0.18 * pow(c / 0.18, vec3(1.0 + gContrast));
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, 1.0 + gSaturation);
  // split-tone: cool steel in the shadows, warm signal-amber in the highlights
  vec3 tint = mix(vec3(0.90, 0.98, 1.10), vec3(1.07, 1.0, 0.90), smoothstep(0.04, 0.55, l));
  c *= tint;
  c += gLift * (1.0 - clamp(l * 4.0, 0.0, 1.0));
  outputColor = vec4(clamp(c, 0.0, 1.0), inputColor.a);
}
`;

export class GradeEffect extends Effect {
  constructor({ contrast = 0.16, saturation = -0.06, lift = new Vector3(0.004, 0.007, 0.016) } = {}) {
    super("GradeEffect", fragment, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, Uniform>([
        ["gContrast", new Uniform(contrast)],
        ["gSaturation", new Uniform(saturation)],
        ["gLift", new Uniform(lift)],
      ]),
    });
  }
}
