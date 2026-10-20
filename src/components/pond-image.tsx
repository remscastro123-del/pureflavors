"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export interface PondImageHandle {
  stir: (x: number, y: number, dx: number, dy: number) => void;
  burst: (x?: number, y?: number) => void;
  settle: () => void;
}

export interface PondImageProps {
  src?: string;
  alt?: string;
  aspectRatio?: number;
  radius?: number;
  brushSize?: number;
  force?: number;
  swirl?: number;
  flow?: number;
  settleTime?: number;
  gloss?: number;
  shade?: number;
  chromatic?: number;
  highlightColor?: string;
  quality?: number;
  hover?: boolean;
  clickBurst?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  idleDelay?: number;
  className?: string;
  style?: CSSProperties;
}

interface Settings {
  src: string;
  brushSize: number;
  force: number;
  swirl: number;
  flow: number;
  settleTime: number;
  gloss: number;
  shade: number;
  chromatic: number;
  highlightColor: string;
  quality: number;
  hover: boolean;
  clickBurst: boolean;
  autoplay: boolean;
  autoplaySpeed: number;
  idleDelay: number;
  reduced: boolean;
}

interface Controller {
  sync: () => void;
  destroy: () => void;
  stir: (x: number, y: number, dx: number, dy: number) => void;
  burst: (x: number, y: number) => void;
  settle: () => void;
}

type Vec = { x: number; y: number };

const DEFAULT_SRC =
  "https://pro.reactbits.dev/demo-media/effect-pond-koi.webp";

const subscribeToMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

const readMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

let colorContext: CanvasRenderingContext2D | null = null;

const parseColor = (value: string, fallback: [number, number, number]): [number, number, number] => {
  if (!colorContext) colorContext = document.createElement("canvas").getContext("2d");
  if (!colorContext) return fallback;
  colorContext.fillStyle = "#010203";
  colorContext.fillStyle = value;
  const read = String(colorContext.fillStyle);
  if (read === "#010203" && value.trim().toLowerCase() !== "#010203") return fallback;
  if (read.startsWith("#")) {
    const hex = read.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
    ];
  }
  const parts = read.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return fallback;
  return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];
};

const QUAD_VERTEX = `
uniform vec2 uTexel;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  vUv = uv;
  vL = uv - vec2(uTexel.x, 0.0);
  vR = uv + vec2(uTexel.x, 0.0);
  vT = uv + vec2(0.0, uTexel.y);
  vB = uv - vec2(0.0, uTexel.y);
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const SPLAT_FRAGMENT = `
uniform sampler2D uTarget;
uniform vec2 uAspect;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform vec2 uForce;
uniform float uRadius;
uniform float uBurst;
varying vec2 vUv;

void main() {
  vec2 p = vUv * uAspect;
  vec2 a = uFrom * uAspect;
  vec2 b = uTo * uAspect;
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
  vec2 offset = p - (a + ab * t);
  float weight = exp(-dot(offset, offset) / (uRadius * uRadius));
  vec2 push = uForce;
  if (uBurst > 0.0) {
    float d = max(length(offset), 1e-4);
    push = offset / d * uBurst * smoothstep(0.0, uRadius * 0.6, d);
  }
  vec4 base = texture2D(uTarget, vUv);
  gl_FragColor = vec4(base.xy + push * weight, 0.0, 1.0);
}
`;

const CURL_FRAGMENT = `
uniform sampler2D uVelocity;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
  float left = texture2D(uVelocity, vL).y;
  float right = texture2D(uVelocity, vR).y;
  float top = texture2D(uVelocity, vT).x;
  float bottom = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (right - left - top + bottom), 0.0, 0.0, 1.0);
}
`;

const VORTICITY_FRAGMENT = `
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uStrength;
uniform float uDt;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
  float left = texture2D(uCurl, vL).x;
  float right = texture2D(uCurl, vR).x;
  float top = texture2D(uCurl, vT).x;
  float bottom = texture2D(uCurl, vB).x;
  float centre = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(right) - abs(left));
  force /= length(force) + 1e-4;
  force *= uStrength * centre;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}
`;

const DIVERGENCE_FRAGMENT = `
uniform sampler2D uVelocity;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
  vec2 centre = texture2D(uVelocity, vUv).xy;
  float left = texture2D(uVelocity, vL).x;
  float right = texture2D(uVelocity, vR).x;
  float top = texture2D(uVelocity, vT).y;
  float bottom = texture2D(uVelocity, vB).y;
  if (vL.x < 0.0) left = -centre.x;
  if (vR.x > 1.0) right = -centre.x;
  if (vT.y > 1.0) top = -centre.y;
  if (vB.y < 0.0) bottom = -centre.y;
  gl_FragColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
}
`;

const PRESSURE_FRAGMENT = `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
  float left = texture2D(uPressure, vL).x;
  float right = texture2D(uPressure, vR).x;
  float top = texture2D(uPressure, vT).x;
  float bottom = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);
}
`;

const GRADIENT_FRAGMENT = `
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
  float left = texture2D(uPressure, vL).x;
  float right = texture2D(uPressure, vR).x;
  float top = texture2D(uPressure, vT).x;
  float bottom = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(right - left, top - bottom);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

const ADVECT_FRAGMENT = `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uSimTexel;
uniform float uDt;
uniform float uDecay;
uniform float uCarry;
varying vec2 vUv;

void main() {
  vec2 step = texture2D(uVelocity, vUv).xy * uSimTexel * uDt;
  vec4 moved = texture2D(uSource, vUv - step);
  vec2 next = (moved.xy - step * uCarry) * uDecay;
  float reach = length(next);
  if (uCarry > 0.5 && reach > 0.12) next *= 0.12 / reach;
  gl_FragColor = vec4(next, 0.0, 1.0);
}
`;

const DISPLAY_FRAGMENT = `
uniform sampler2D uOffset;
uniform vec2 uOffsetSize;
uniform sampler2D uVelocity;
uniform sampler2D uImage;
uniform vec2 uImageSize;
uniform vec2 uSize;
uniform float uGloss;
uniform float uShade;
uniform float uChroma;
uniform vec3 uHighlight;
varying vec2 vUv;

vec4 bicubic(sampler2D map, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (w1 / g0 - 1.0 + i + 0.5) / size;
  vec2 h1 = (w3 / g1 + 1.0 + i + 0.5) / size;
  return g0.y * (g0.x * texture2D(map, vec2(h0.x, h0.y)) + g1.x * texture2D(map, vec2(h1.x, h0.y))) +
    g1.y * (g0.x * texture2D(map, vec2(h0.x, h1.y)) + g1.x * texture2D(map, vec2(h1.x, h1.y)));
}

vec2 cover(vec2 uv) {
  float view = uSize.x / uSize.y;
  float image = uImageSize.x / max(uImageSize.y, 1.0);
  vec2 scale = view > image ? vec2(1.0, image / view) : vec2(view / image, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 texel = 1.0 / uOffsetSize;
  vec2 offset = bicubic(uOffset, vUv, uOffsetSize).xy;
  vec2 wide = texel * 7.0;
  vec2 ex = bicubic(uOffset, vUv + vec2(wide.x, 0.0), uOffsetSize).xy - bicubic(uOffset, vUv - vec2(wide.x, 0.0), uOffsetSize).xy;
  vec2 ey = bicubic(uOffset, vUv + vec2(0.0, wide.y), uOffsetSize).xy - bicubic(uOffset, vUv - vec2(0.0, wide.y), uOffsetSize).xy;
  float squeeze = (ex.x / (2.0 * wide.x) + ey.y / (2.0 * wide.y));
  vec2 source = clamp(vUv + offset, vec2(0.0005), vec2(0.9995));
  vec2 fringe = offset * uChroma * 0.05;
  vec3 color;
  color.r = texture2D(uImage, cover(clamp(source + fringe, 0.0005, 0.9995))).r;
  color.g = texture2D(uImage, cover(source)).g;
  color.b = texture2D(uImage, cover(clamp(source - fringe, 0.0005, 0.9995))).b;
  float bunch = max(-squeeze, 0.0);
  float thin = max(squeeze, 0.0);
  float ridge = smoothstep(0.35, 2.2, bunch);
  color *= 1.0 - uShade * (smoothstep(0.25, 2.5, bunch) * 0.16 - smoothstep(0.25, 2.5, thin) * 0.05);
  vec3 shine = clamp(uHighlight * ridge * ridge * uGloss * 0.35, 0.0, 1.0);
  color = 1.0 - (1.0 - color) * (1.0 - shine);
  gl_FragColor = vec4(color, 1.0);
}
`;

const createPond = (root: HTMLDivElement, settingsRef: { current: Settings }): Controller | null => {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.pointerEvents = "none";
  canvas.style.opacity = "0";
  canvas.style.transition = "opacity 240ms ease";
  root.appendChild(canvas);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: "high-performance" });
  } catch {
    canvas.remove();
    return null;
  }

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const plane = new THREE.PlaneGeometry(2, 2);
  const targetOptions = {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  };
  const target = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, targetOptions);

  const material = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
    new THREE.ShaderMaterial({
      uniforms: { uTexel: { value: new THREE.Vector2(0.01, 0.01) }, ...uniforms },
      vertexShader: QUAD_VERTEX,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });

  const splatMaterial = material(SPLAT_FRAGMENT, {
    uTarget: { value: null },
    uAspect: { value: new THREE.Vector2(1, 1) },
    uFrom: { value: new THREE.Vector2() },
    uTo: { value: new THREE.Vector2() },
    uForce: { value: new THREE.Vector2() },
    uRadius: { value: 0.05 },
    uBurst: { value: 0 },
  });
  const curlMaterial = material(CURL_FRAGMENT, { uVelocity: { value: null } });
  const vorticityMaterial = material(VORTICITY_FRAGMENT, {
    uVelocity: { value: null },
    uCurl: { value: null },
    uStrength: { value: 10 },
    uDt: { value: 0.016 },
  });
  const divergenceMaterial = material(DIVERGENCE_FRAGMENT, { uVelocity: { value: null } });
  const pressureMaterial = material(PRESSURE_FRAGMENT, { uPressure: { value: null }, uDivergence: { value: null } });
  const gradientMaterial = material(GRADIENT_FRAGMENT, { uPressure: { value: null }, uVelocity: { value: null } });
  const advectMaterial = material(ADVECT_FRAGMENT, {
    uVelocity: { value: null },
    uSource: { value: null },
    uSimTexel: { value: new THREE.Vector2(0.01, 0.01) },
    uDt: { value: 0.016 },
    uDecay: { value: 1 },
    uCarry: { value: 0 },
  });
  const displayMaterial = material(DISPLAY_FRAGMENT, {
    uOffset: { value: null },
    uOffsetSize: { value: new THREE.Vector2(1, 1) },
    uVelocity: { value: null },
    uImage: { value: null },
    uImageSize: { value: new THREE.Vector2(1, 1) },
    uSize: { value: new THREE.Vector2(1, 1) },
    uGloss: { value: 0.5 },
    uShade: { value: 0.4 },
    uChroma: { value: 0.4 },
    uHighlight: { value: new THREE.Vector3(1, 1, 1) },
  });

  const mesh = new THREE.Mesh(plane, splatMaterial);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);

  const pass = (shader: THREE.ShaderMaterial, output: THREE.WebGLRenderTarget | null, texel?: THREE.Vector2) => {
    if (texel) (shader.uniforms.uTexel.value as THREE.Vector2).copy(texel);
    mesh.material = shader;
    renderer.setRenderTarget(output);
    renderer.render(scene, camera);
  };

  let velocity = [target(4, 4), target(4, 4)];
  let pressure = [target(4, 4), target(4, 4)];
  let offset = [target(4, 4), target(4, 4)];
  let divergence = target(4, 4);
  let curl = target(4, 4);
  const simTexel = new THREE.Vector2(0.1, 0.1);
  const offsetTexel = new THREE.Vector2(0.1, 0.1);
  let simCells = { x: 4, y: 4 };

  let destroyed = false;
  let raf = 0;
  let last = 0;
  let visible = true;
  let width = 1;
  let height = 1;
  let image: THREE.Texture | null = null;
  let imageSrc = "";
  let shown = false;
  let activeUntil = 0;
  let clearNext = false;
  const previous: Vec = { x: 0.5, y: 0.5 };
  let lastMoveAt = 0;
  let tracking = false;
  let hovering = false;
  let interactedAt = -1e9;
  const bursts: Vec[] = [];
  const strokes: { from: Vec; to: Vec; dx: number; dy: number }[] = [];
  const ghost = { time: Math.random() * 30, prev: null as Vec | null, burstClock: 2.5, active: false };

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  const loadImage = () => {
    const src = settingsRef.current.src;
    if (src === imageSrc) return;
    imageSrc = src;
    loader.load(
      src,
      (texture) => {
        if (destroyed || settingsRef.current.src !== src) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.NoColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        image?.dispose();
        image = texture;
        wake();
      },
      undefined,
      () => {
        if (!destroyed && settingsRef.current.src === src) canvas.style.opacity = "0";
      },
    );
  };

  const resize = () => {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    const quality = clamp(settingsRef.current.quality, 0.25, 2);
    const short = Math.min(width, height);
    const simShort = Math.round(clamp(short / 3, 64, 200) * quality);
    const offsetShort = Math.round(clamp(short / 1.6, 120, 420) * quality);
    const scale = (value: number, n: number) => Math.max(8, Math.round((value / short) * n));
    simCells = { x: scale(width, simShort), y: scale(height, simShort) };
    const offsetCells = { x: scale(width, offsetShort), y: scale(height, offsetShort) };
    [...velocity, ...pressure, ...offset, divergence, curl].forEach((item) => item.dispose());
    velocity = [target(simCells.x, simCells.y), target(simCells.x, simCells.y)];
    pressure = [target(simCells.x, simCells.y), target(simCells.x, simCells.y)];
    divergence = target(simCells.x, simCells.y);
    curl = target(simCells.x, simCells.y);
    offset = [target(offsetCells.x, offsetCells.y), target(offsetCells.x, offsetCells.y)];
    [...velocity, ...pressure, ...offset, divergence, curl].forEach((item) => {
      renderer.setRenderTarget(item);
      renderer.clear();
    });
    renderer.setRenderTarget(null);
    simTexel.set(1 / simCells.x, 1 / simCells.y);
    offsetTexel.set(1 / offsetCells.x, 1 / offsetCells.y);
    splatMaterial.uniforms.uAspect.value.set(width / short, height / short);
    advectMaterial.uniforms.uSimTexel.value.copy(simTexel);
    displayMaterial.uniforms.uOffsetSize.value.set(offsetCells.x, offsetCells.y);
    displayMaterial.uniforms.uSize.value.set(width, height);
    wake();
  };

  const cellsPerPixel = () => simCells.x / width;

  const splatStroke = (from: Vec, to: Vec, dx: number, dy: number) => {
    const settings = settingsRef.current;
    const short = Math.min(width, height);
    const uniforms = splatMaterial.uniforms;
    uniforms.uTarget.value = velocity[0].texture;
    uniforms.uFrom.value.set(from.x, 1 - from.y);
    uniforms.uTo.value.set(to.x, 1 - to.y);
    const k = cellsPerPixel() * clamp(settings.force, 0, 4) * 0.12;
    uniforms.uForce.value.set(dx * k, -dy * k);
    uniforms.uRadius.value = clamp(settings.brushSize, 4, 400) / short;
    uniforms.uBurst.value = 0;
    pass(splatMaterial, velocity[1], simTexel);
    velocity = [velocity[1], velocity[0]];
  };

  const splatBurst = (at: Vec) => {
    const settings = settingsRef.current;
    const short = Math.min(width, height);
    const uniforms = splatMaterial.uniforms;
    uniforms.uTarget.value = velocity[0].texture;
    uniforms.uFrom.value.set(at.x, 1 - at.y);
    uniforms.uTo.value.set(at.x, 1 - at.y);
    uniforms.uForce.value.set(0, 0);
    uniforms.uRadius.value = (clamp(settings.brushSize, 4, 400) * 1.6) / short;
    uniforms.uBurst.value = 150 * cellsPerPixel() * clamp(settings.force, 0, 4);
    pass(splatMaterial, velocity[1], simTexel);
    velocity = [velocity[1], velocity[0]];
  };

  const simulate = (dt: number, now: number) => {
    const settings = settingsRef.current;
    const idle = now - interactedAt > settings.idleDelay * 1000;
    ghost.active = settings.autoplay && !settings.reduced && idle && !hovering && visible && !!image;
    if (ghost.active) {
      ghost.time += dt * clamp(settings.autoplaySpeed, 0.1, 3);
      const t = ghost.time * 0.5;
      const at = {
        x: 0.5 + 0.32 * Math.sin(t * 1.1) * Math.cos(t * 0.43),
        y: 0.5 + 0.28 * Math.sin(t * 0.77 + 0.6),
      };
      if (ghost.prev && dt > 0) {
        strokes.push({
          from: ghost.prev,
          to: at,
          dx: (((at.x - ghost.prev.x) * width) / dt) * 3,
          dy: (((at.y - ghost.prev.y) * height) / dt) * 3,
        });
      }
      ghost.prev = at;
      ghost.burstClock -= dt * clamp(settings.autoplaySpeed, 0.1, 3);
      if (ghost.burstClock <= 0) {
        ghost.burstClock = 3.2 + Math.random() * 2.4;
        bursts.push({ x: at.x, y: at.y });
      }
      activeUntil = now + 4000;
    } else {
      ghost.prev = null;
    }
    if (clearNext) {
      [...velocity, ...pressure, ...offset].forEach((item) => {
        renderer.setRenderTarget(item);
        renderer.clear();
      });
      clearNext = false;
    }
    if (!dt) return;
    for (const item of strokes.splice(0)) splatStroke(item.from, item.to, item.dx, item.dy);
    for (const item of bursts.splice(0)) splatBurst(item);
    const swirl = clamp(settings.swirl, 0, 1) * 24;
    if (swirl > 0) {
      curlMaterial.uniforms.uVelocity.value = velocity[0].texture;
      pass(curlMaterial, curl, simTexel);
      const vorticity = vorticityMaterial.uniforms;
      vorticity.uVelocity.value = velocity[0].texture;
      vorticity.uCurl.value = curl.texture;
      vorticity.uStrength.value = swirl;
      vorticity.uDt.value = dt;
      pass(vorticityMaterial, velocity[1], simTexel);
      velocity = [velocity[1], velocity[0]];
    }
    divergenceMaterial.uniforms.uVelocity.value = velocity[0].texture;
    pass(divergenceMaterial, divergence, simTexel);
    for (let i = 0; i < 22; i++) {
      pressureMaterial.uniforms.uPressure.value = pressure[0].texture;
      pressureMaterial.uniforms.uDivergence.value = divergence.texture;
      pass(pressureMaterial, pressure[1], simTexel);
      pressure = [pressure[1], pressure[0]];
    }
    gradientMaterial.uniforms.uPressure.value = pressure[0].texture;
    gradientMaterial.uniforms.uVelocity.value = velocity[0].texture;
    pass(gradientMaterial, velocity[1], simTexel);
    velocity = [velocity[1], velocity[0]];
    const advect = advectMaterial.uniforms;
    advect.uDt.value = dt;
    advect.uVelocity.value = velocity[0].texture;
    advect.uSource.value = velocity[0].texture;
    advect.uDecay.value = Math.pow(0.5, dt / clamp(settings.flow, 0.05, 10));
    advect.uCarry.value = 0;
    pass(advectMaterial, velocity[1], simTexel);
    velocity = [velocity[1], velocity[0]];
    advect.uSource.value = offset[0].texture;
    advect.uDecay.value = Math.exp(-dt / clamp(settings.settleTime, 0.1, 20));
    advect.uCarry.value = 1;
    pass(advectMaterial, offset[1], offsetTexel);
    offset = [offset[1], offset[0]];
    renderer.setRenderTarget(null);
  };

  const render = () => {
    if (!image) return;
    const settings = settingsRef.current;
    const display = displayMaterial.uniforms;
    display.uOffset.value = offset[0].texture;
    display.uVelocity.value = velocity[0].texture;
    display.uImage.value = image;
    const source = image.image as { width?: number; height?: number } | undefined;
    display.uImageSize.value.set(source?.width || 1, source?.height || 1);
    display.uGloss.value = clamp(settings.gloss, 0, 2);
    display.uShade.value = clamp(settings.shade, 0, 1);
    display.uChroma.value = clamp(settings.chromatic, 0, 1);
    const [hr, hg, hb] = parseColor(settings.highlightColor, [1, 1, 1]);
    display.uHighlight.value.set(hr, hg, hb);
    pass(displayMaterial, null, offsetTexel);
    if (!shown) {
      shown = true;
      canvas.style.opacity = "1";
    }
  };

  let timer = 0;
  const frame = (now: number) => {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000));
    last = now;
    loadImage();
    simulate(dt, now);
    render();
    const settings = settingsRef.current;
    const active = now < activeUntil || ghost.active || !image;
    if (visible && active) {
      raf = requestAnimationFrame(frame);
      return;
    }
    if (visible && settings.autoplay && !settings.reduced) {
      window.clearTimeout(timer);
      const wait = interactedAt + settings.idleDelay * 1000 - now;
      timer = window.setTimeout(wake, Math.max(40, Math.min(wait, 2000)));
    }
  };

  const wake = () => {
    if (destroyed || raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const keepAlive = () => {
    const settings = settingsRef.current;
    activeUntil = performance.now() + (settings.settleTime * 3.5 + settings.flow * 4) * 1000;
    wake();
  };

  const local = (event: PointerEvent): Vec => {
    const rect = root.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
      y: clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
    };
  };

  const onMove = (event: PointerEvent) => {
    const settings = settingsRef.current;
    const point = local(event);
    interactedAt = performance.now();
    hovering = event.pointerType !== "touch" || tracking;
    if (settings.hover && !settings.reduced && tracking) {
      const elapsed = Math.max(1 / 240, (event.timeStamp - lastMoveAt) / 1000);
      const dx = ((point.x - previous.x) * width) / elapsed;
      const dy = ((point.y - previous.y) * height) / elapsed;
      const speed = Math.hypot(dx, dy);
      const scale = speed > 4200 ? 4200 / speed : 1;
      strokes.push({ from: { ...previous }, to: point, dx: dx * scale, dy: dy * scale });
      keepAlive();
    }
    previous.x = point.x;
    previous.y = point.y;
    lastMoveAt = event.timeStamp;
    tracking = true;
  };

  const onLeave = () => {
    tracking = false;
    hovering = false;
    interactedAt = performance.now();
    wake();
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const settings = settingsRef.current;
    interactedAt = performance.now();
    const point = local(event);
    previous.x = point.x;
    previous.y = point.y;
    lastMoveAt = event.timeStamp;
    tracking = true;
    if (!settings.clickBurst || settings.reduced) return;
    bursts.push(point);
    keepAlive();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const settings = settingsRef.current;
    interactedAt = performance.now();
    if (settings.clickBurst && !settings.reduced) {
      bursts.push({ x: 0.5, y: 0.5 });
      keepAlive();
    }
  };

  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener("pointercancel", onLeave);
  root.addEventListener("pointerdown", onDown);
  root.addEventListener("keydown", onKey);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  const intersection = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) wake();
    },
    { rootMargin: "100px" },
  );
  intersection.observe(root);
  const onLost = (event: Event) => {
    event.preventDefault();
    canvas.style.opacity = "0";
  };
  canvas.addEventListener("webglcontextlost", onLost);
  resize();
  loadImage();

  return {
    sync: () => {
      loadImage();
      wake();
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointercancel", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("keydown", onKey);
      canvas.removeEventListener("webglcontextlost", onLost);
      resizeObserver.disconnect();
      intersection.disconnect();
      [...velocity, ...pressure, ...offset, divergence, curl].forEach((item) => item.dispose());
      image?.dispose();
      plane.dispose();
      [
        splatMaterial,
        curlMaterial,
        vorticityMaterial,
        divergenceMaterial,
        pressureMaterial,
        gradientMaterial,
        advectMaterial,
        displayMaterial,
      ].forEach((item) => item.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
    stir: (x: number, y: number, dx: number, dy: number) => {
      interactedAt = performance.now();
      const from = { x: clamp(x, 0, 1), y: clamp(y, 0, 1) };
      const to = { x: clamp(x + dx / width / 30, 0, 1), y: clamp(y + dy / height / 30, 0, 1) };
      strokes.push({ from, to, dx, dy });
      keepAlive();
    },
    burst: (x: number, y: number) => {
      interactedAt = performance.now();
      bursts.push({ x: clamp(x, 0, 1), y: clamp(y, 0, 1) });
      keepAlive();
    },
    settle: () => {
      clearNext = true;
      wake();
    },
  };
};

const PondImage = forwardRef<PondImageHandle, PondImageProps>(function PondImage(
  {
    src = DEFAULT_SRC,
    alt = "Orange-and-black koi beneath green lily pads on a reflective pond",
    aspectRatio = 4 / 3,
    radius = 16,
    brushSize = 60,
    force = 1,
    swirl = 0.35,
    flow = 0.45,
    settleTime = 1.1,
    gloss = 0.4,
    shade = 0.4,
    chromatic = 0.3,
    highlightColor = "#FFFFFF",
    quality = 1,
    hover = true,
    clickBurst = true,
    autoplay = false,
    autoplaySpeed = 1,
    idleDelay = 2,
    className,
    style,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const reduced = useSyncExternalStore(subscribeToMotion, readMotion, () => false);
  const settingsRef = useRef<Settings>({
    src,
    brushSize,
    force,
    swirl,
    flow,
    settleTime,
    gloss,
    shade,
    chromatic,
    highlightColor,
    quality,
    hover,
    clickBurst,
    autoplay,
    autoplaySpeed,
    idleDelay,
    reduced,
  });

  useEffect(() => {
    settingsRef.current = {
      src,
      brushSize,
      force,
      swirl,
      flow,
      settleTime,
      gloss,
      shade,
      chromatic,
      highlightColor,
      quality,
      hover,
      clickBurst,
      autoplay,
      autoplaySpeed,
      idleDelay,
      reduced,
    };
    controllerRef.current?.sync();
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const controller = createPond(root, settingsRef);
    controllerRef.current = controller;
    return () => {
      controller?.destroy();
      controllerRef.current = null;
    };
  }, [quality]);

  useImperativeHandle(
    ref,
    () => ({
      stir: (x: number, y: number, dx: number, dy: number) => controllerRef.current?.stir(x, y, dx, dy),
      burst: (x = 0.5, y = 0.5) => controllerRef.current?.burst(x, y),
      settle: () => controllerRef.current?.settle(),
    }),
    [],
  );

  return (
    <div
      ref={rootRef}
      role="img"
      tabIndex={0}
      aria-label={alt}
      className={cn(
        "relative isolate w-full cursor-crosshair select-none overflow-hidden outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
        className,
      )}
      style={{
        aspectRatio: aspectRatio > 0 ? String(aspectRatio) : undefined,
        height: aspectRatio > 0 ? undefined : "100%",
        borderRadius: radius,
        touchAction: "pan-y pinch-zoom",
        background: "#0a0a0a",
        ...style,
      }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
    </div>
  );
});

PondImage.displayName = "PondImage";

export { PondImage };
export default PondImage;
