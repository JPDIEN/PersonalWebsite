import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme-provider";

/**
 * Fullscreen raymarched ocean rendered in a fragment shader (raw WebGL,
 * no dependencies). Night mode: dark sea under a starfield with a low moon
 * and a long specular glint path. Light mode: pale misty morning sea.
 *
 * Renders behind all content as a fixed canvas. Respects
 * prefers-reduced-motion (renders a single still frame), pauses when the
 * tab is hidden, and adaptively drops internal resolution to hold 60fps.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;   // smoothed, -1..1
uniform float uNight;   // 0 = day palette, 1 = night palette

const int   TRACE_STEPS  = 8;
const int   MAP_OCTAVES  = 3;
const int   NORM_OCTAVES = 5;
const float SEA_HEIGHT   = 0.62;
const float SEA_CHOPPY   = 3.8;
const float SEA_SPEED    = 0.72;
const float SEA_FREQ     = 0.15;

mat2 OCT_ROT = mat2(1.62, 1.24, -1.24, 1.62);

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return -1.0 + 2.0 * mix(
    mix(hash21(i),               hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

// One band of choppy waves: domain-warped, with sharpened crests.
float waveBand(vec2 uv, float choppy) {
  uv += vnoise(uv);
  vec2 s = 1.0 - abs(sin(uv));
  vec2 c = abs(cos(uv * 1.05));
  vec2 w = mix(s, c, s * 0.55);
  return pow(1.0 - pow(w.x * w.y, 0.68), choppy);
}

float seaHeight(vec2 uv, int octaves) {
  float freq = SEA_FREQ;
  float amp  = SEA_HEIGHT;
  float chop = SEA_CHOPPY;
  float t    = 1.0 + uTime * SEA_SPEED;
  uv.x *= 0.76;

  float h = 0.0;
  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    float d = waveBand((uv + t) * freq, chop)
            + waveBand((uv - t) * freq, chop);
    h += d * amp;
    uv = OCT_ROT * uv;
    freq *= 1.94;
    amp  *= 0.215;
    chop  = mix(chop, 1.0, 0.2);
  }
  return h;
}

float mapCoarse(vec3 p)  { return p.y - seaHeight(p.xz, MAP_OCTAVES); }
float mapDetail(vec3 p)  { return p.y - seaHeight(p.xz, NORM_OCTAVES); }

vec3 seaNormal(vec3 p, float eps) {
  float h = mapDetail(p);
  vec3 n;
  n.y = eps;
  n.x = mapDetail(vec3(p.x + eps, p.y, p.z)) - h;
  n.z = mapDetail(vec3(p.x, p.y, p.z + eps)) - h;
  return normalize(vec3(-n.x, n.y, -n.z));
}

float traceWater(vec3 ro, vec3 rd, out vec3 p) {
  float tNear = 0.0;
  float tFar  = 1000.0;
  float hFar  = mapCoarse(ro + rd * tFar);
  p = ro + rd * tFar;
  if (hFar > 0.0) return tFar;
  float hNear = mapCoarse(ro);
  float tMid  = 0.0;
  for (int i = 0; i < TRACE_STEPS; i++) {
    tMid = mix(tNear, tFar, hNear / (hNear - hFar));
    p = ro + rd * tMid;
    float hMid = mapCoarse(p);
    if (hMid < 0.0) { tFar = tMid; hFar = hMid; }
    else            { tNear = tMid; hNear = hMid; }
  }
  return tMid;
}

// --- sky -------------------------------------------------------------

vec3 starField(vec3 rd) {
  // Latitude/longitude grid; fine near the horizon where the camera looks.
  vec2 sph = vec2(atan(rd.x, rd.z), acos(clamp(rd.y, -1.0, 1.0)));
  vec2 g   = sph * vec2(160.0, 110.0);
  vec2 id  = floor(g);
  vec2 f   = fract(g);
  float sel = hash21(id);
  if (sel < 0.82) return vec3(0.0);
  vec2 sp  = vec2(hash21(id + 7.13), hash21(id + 3.71)) * 0.6 + 0.2;
  float d  = length(f - sp);
  float br = pow(hash21(id + 17.0), 9.0);
  float tw = 0.72 + 0.28 * sin(uTime * (0.6 + 2.4 * hash21(id + 9.3)) + sel * 6.2831);
  float m  = smoothstep(0.16, 0.0, d);
  vec3 tint = mix(vec3(0.85, 0.90, 1.0), vec3(1.0, 0.93, 0.82), step(0.93, hash21(id + 4.4)));
  return tint * m * br * tw * 2.1;
}

vec3 skyColor(vec3 rd, vec3 L) {
  float y = clamp(rd.y, 0.0, 1.0);
  float toLight = max(dot(rd, L), 0.0);

  // night
  vec3 nZen = vec3(0.004, 0.007, 0.019);
  vec3 nHor = vec3(0.022, 0.038, 0.070);
  vec3 night = mix(nHor, nZen, pow(y, 0.5));
  night += vec3(0.16, 0.20, 0.30) * pow(toLight, 24.0) * 0.20;    // moon haze
  night += vec3(1.00, 0.97, 0.88) * pow(toLight, 9000.0) * 3.4;   // moon disc
  night += vec3(0.80, 0.82, 0.80) * pow(toLight, 700.0) * 0.38;   // moon halo
  night += starField(rd) * smoothstep(0.015, 0.12, rd.y) * (1.0 - pow(toLight, 60.0));

  // day (pale, misty morning)
  vec3 dZen = vec3(0.60, 0.70, 0.81);
  vec3 dHor = vec3(0.93, 0.95, 0.965);
  vec3 day = mix(dHor, dZen, pow(y, 0.75));
  day += vec3(1.00, 0.98, 0.90) * pow(toLight, 900.0) * 1.5;      // sun
  day += vec3(1.00, 0.99, 0.93) * pow(toLight, 40.0) * 0.22;      // bright veil
  day += vec3(1.00, 0.99, 0.95) * pow(toLight, 9.0) * 0.14;       // haze

  return mix(day, night, uNight);
}

// --- water -----------------------------------------------------------

vec3 waterColor(vec3 p, vec3 n, vec3 rd, vec3 L, float dist) {
  float fresnel = pow(clamp(1.0 - dot(n, -rd), 0.0, 1.0), 3.0);
  fresnel = 0.05 + 0.95 * fresnel;

  vec3 reflected = skyColor(reflect(rd, n), L);

  vec3 deepDay   = vec3(0.09, 0.17, 0.20);
  vec3 subDay    = vec3(0.42, 0.61, 0.57);
  vec3 deepNight = vec3(0.003, 0.007, 0.017);
  vec3 subNight  = vec3(0.012, 0.055, 0.080);
  vec3 deep = mix(deepDay, deepNight, uNight);
  vec3 sub  = mix(subDay,  subNight,  uNight);

  // light bleeding through wave crests
  float crest = clamp(p.y * 0.6 + 0.42, 0.0, 1.0);
  float towardLight = pow(max(dot(n, L), 0.0), 1.6);
  vec3 body = deep + sub * crest * (0.35 + 0.65 * towardLight);

  vec3 col = mix(body, reflected, fresnel);

  // specular glint path
  vec3 r = reflect(rd, n);
  float specTight = pow(max(dot(r, L), 0.0), mix(140.0, 1100.0, uNight));
  float specWide  = pow(max(dot(r, L), 0.0), mix(24.0, 90.0, uNight));
  vec3 glintCol = mix(vec3(1.0, 0.98, 0.90), vec3(1.0, 0.96, 0.82), uNight);
  float glintAmp = mix(0.85, 2.0, uNight);
  col += glintCol * (specTight * glintAmp + specWide * 0.045 * glintAmp);

  // aerate the nearest crests very slightly
  float sparkle = smoothstep(0.55, 0.95, crest) * smoothstep(60.0, 8.0, dist);
  col += vec3(0.5) * sparkle * 0.03 * (1.0 - uNight * 0.6);

  return col;
}

// --- camera / main ---------------------------------------------------

mat3 cameraRot(float yaw, float pitch) {
  float cy = cos(yaw), sy = sin(yaw);
  float cp = cos(pitch), sp = sin(pitch);
  mat3 my = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy);
  mat3 mp = mat3(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);
  return my * mp;
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uRes) / uRes.y;

  float yaw   = uMouse.x * 0.075;
  float pitch = -0.085 + uMouse.y * 0.045;
  mat3 rot = cameraRot(yaw, pitch);

  float bobT = uTime * 0.5;
  vec3 ro = vec3(0.0, 3.3 + sin(bobT) * 0.08, uTime * 1.35);
  vec3 rd = rot * normalize(vec3(uv.x, uv.y, -2.35));

  vec3 L = normalize(mix(
    vec3(0.42, 0.26, -1.0),    // day sun, low morning light
    vec3(0.28, 0.145, -1.0),   // night moon, low over horizon
    uNight));

  vec3 col;
  if (rd.y > 0.005) {
    col = skyColor(rd, L);
  } else {
    vec3 p;
    float t = traceWater(ro, rd, p);
    float dist = t;
    float eps = clamp(dist * dist * 0.0001, 0.001, 0.12);
    vec3 n = seaNormal(p, eps);
    col = waterColor(p, n, rd, L, dist);

    // aerial perspective into the horizon
    float fog = 1.0 - exp(-dist * 0.0045);
    vec3 horizonCol = skyColor(vec3(rd.x, 0.012, rd.z), L);
    col = mix(col, horizonCol, pow(fog, 1.35));
  }

  // soften the horizon line itself
  float horizonBand = exp(-abs(rd.y) * 60.0) * 0.5;
  col = mix(col, skyColor(vec3(rd.x, 0.02, rd.z), L), horizonBand * 0.35);

  // tonemap + gamma
  col = 1.0 - exp(-col * mix(1.15, 1.22, uNight));
  col = pow(col, vec3(0.4545));

  // gentle vignette
  vec2 q = gl_FragCoord.xy / uRes;
  col *= 0.78 + 0.22 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.28);

  // dithering to kill gradient banding
  col += (hash21(gl_FragCoord.xy + fract(uTime) * 61.7) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

type Cleanup = () => void;

function initWater(canvas: HTMLCanvasElement, getNightTarget: () => number): Cleanup | null {
  const gl =
    canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false }) ||
    (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
  if (!gl) return null;

  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
      console.error("water shader:", gl!.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("water link:", gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uMouse = gl.getUniformLocation(prog, "uMouse");
  const uNight = gl.getUniformLocation(prog, "uNight");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Internal resolution: capped DPR times an adaptive quality scale.
  const dprCap = Math.min(window.devicePixelRatio || 1, 1.5);
  let quality = 0.85;
  let width = 0;
  let height = 0;

  function resize() {
    const w = Math.max(1, Math.round(canvas.clientWidth * dprCap * quality));
    const h = Math.max(1, Math.round(canvas.clientHeight * dprCap * quality));
    if (w !== width || h !== height) {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl!.viewport(0, 0, w, h);
    }
  }

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  function onPointer(e: PointerEvent) {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }

  let night = getNightTarget();
  let raf = 0;
  let running = true;
  let lost = false;
  const t0 = performance.now();

  // rolling frame-time average for adaptive quality
  let frameAvg = 16;
  let lastStamp = 0;
  let framesSinceAdjust = 0;

  function drawFrame(now: number) {
    resize();
    const t = (now - t0) / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    night += (getNightTarget() - night) * 0.045;

    gl!.uniform2f(uRes, width, height);
    gl!.uniform1f(uTime, t);
    gl!.uniform2f(uMouse, mouse.x, -mouse.y);
    gl!.uniform1f(uNight, night);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function loop(now: number) {
    if (!running || lost) return;
    if (lastStamp > 0) {
      const dt = now - lastStamp;
      if (dt < 250) frameAvg = frameAvg * 0.94 + dt * 0.06;
      framesSinceAdjust++;
      if (framesSinceAdjust > 90) {
        framesSinceAdjust = 0;
        if (frameAvg > 26 && quality > 0.45) {
          quality = Math.max(0.45, quality - 0.15);
          width = 0; // force resize
        } else if (frameAvg < 11 && quality < 0.85) {
          quality = Math.min(0.85, quality + 0.1);
          width = 0;
        }
      }
    }
    lastStamp = now;
    drawFrame(now);
    raf = requestAnimationFrame(loop);
  }

  function renderStill() {
    resize();
    drawFrame(performance.now());
  }

  function start() {
    if (reduceMotion) {
      renderStill();
    } else {
      lastStamp = 0;
      raf = requestAnimationFrame(loop);
    }
  }

  function stop() {
    cancelAnimationFrame(raf);
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      stop();
    } else {
      running = true;
      start();
    }
  }

  function onResizeWindow() {
    if (reduceMotion) renderStill();
  }

  function onContextLost(e: Event) {
    e.preventDefault();
    lost = true;
    stop();
  }
  function onContextRestored() {
    lost = false;
    // simplest reliable recovery: rebuild everything
    teardown();
    rebuild();
  }

  let innerCleanup: Cleanup | null = null;
  function rebuild() {
    innerCleanup = initWater(canvas, getNightTarget);
  }
  function teardown() {
    stop();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("resize", onResizeWindow);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
  }

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("resize", onResizeWindow);
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  start();

  return () => {
    teardown();
    if (innerCleanup) innerCleanup();
  };
}

export function WaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const nightTarget = useRef(theme === "dark" ? 1 : 0);
  nightTarget.current = theme === "dark" ? 1 : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cleanup = initWater(canvas, () => nightTarget.current);
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -10 }}
      data-testid="water-background"
    />
  );
}
