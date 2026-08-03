"use client";

import React, { useEffect, useRef } from "react"; 

const VERTEX_SHADER = `
  attribute vec2 vertex;
  varying vec2 uv;
  void main() {
    uv = vertex * 0.5 + 0.5;
    gl_Position = vec4(vertex, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 uv;

  uniform sampler2D backgroundTexture;
  uniform vec2  bgScale;        // aspect-fit correction for the image
  uniform float time;           // seconds since start
  uniform float aspect;         // width / height, so warp is isotropic

  uniform vec2  cursor;         // smoothed cursor position, 0..1
  uniform vec2  cursorVel;      // smoothed cursor velocity
  uniform float cursorInfluence;// 0 when idle/off-canvas, ramps to 1 when active

  uniform float causticAmount;  // ambient caustic light strength
  uniform float flowAmount;     // base warp strength of the flowing surface
  uniform float cursorAmount;   // extra warp the cursor adds locally
  uniform float tint;           // 0..1 cool water-hue lift
  uniform vec3  deepColor;      // shade pushed into the troughs (tunes per bg)

  // --- cheap value-noise + fbm, the basis for the flowing surface ---
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p = p * 2.02 + vec2(11.3, 7.1);
      amp *= 0.5;
    }
    return v;
  }

  // Domain-warped flow: the surface coordinate is displaced by noise that
  // is itself displaced by noise. This is what reads as organic, wave-like
  // caustic flow rather than scrolling texture or rings.
  vec2 flowField(vec2 p, float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, t * 0.10)),
      fbm(p + vec2(5.2, 1.3) - vec2(t * 0.12, 0.0))
    );
    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.08),
      fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.07)
    );
    return r - 0.5;
  }

  void main() {
    vec2 p = uv;
    vec2 ap = (p - 0.5) * vec2(aspect, 1.0) + 0.5; // aspect-correct space

    // Base flowing distortion — always animating (idle motion).
    vec2 warp = flowField(ap * 3.0, time) * flowAmount;

    // Cursor adds a smooth, directional local push. Influence falls off
    // with distance; the push direction follows the cursor's velocity so
    // it behaves like dragging a finger across water, not stamping rings.
    vec2 toCursor = (p - cursor) * vec2(aspect, 1.0);
    float d = length(toCursor);
    float infl = exp(-d * 4.5) * cursorInfluence;
    // local extra domain warp, biased along the direction of motion
    vec2 dir = cursorVel * 6.0;
    vec2 cursorWarp =
      (flowField(ap * 5.0 + dir + cursor * 4.0, time * 1.4) + dir * 0.5)
      * infl * cursorAmount;

    vec2 totalWarp = warp + cursorWarp;

    // Refract the background through the combined surface.
    vec2 bgCoord = (p - 0.5) * bgScale + 0.5 + totalWarp * bgScale;
    vec4 base = texture2D(backgroundTexture, bgCoord);

    // Caustic highlight: sharp bright lines where the warped flow folds.
    float h = fbm(ap * 4.0 + totalWarp * 6.0 + time * 0.15);
    float caustic = pow(clamp(h, 0.0, 1.0), 3.0) * 2.2;
    // a second, finer band for the shimmering filaments
    float fine = pow(clamp(fbm(ap * 9.0 - totalWarp * 8.0 - time * 0.2), 0.0, 1.0), 5.0) * 1.6;

    vec3 col = base.rgb;

    // Troughs darken toward deepColor, crests brighten — this is what
    // keeps contrast strong on BOTH light and dark backgrounds: we both
    // add light and remove it relative to the local surface, instead of
    // only adding (which washes out on light images).
    float shade = (caustic + fine) - 0.9; // centered so it both lifts and darkens
    col = mix(col, deepColor, clamp(-shade, 0.0, 1.0) * 0.45 * causticAmount);
    col += vec3(caustic + fine) * 0.12 * causticAmount;

    // Subtle cursor sheen so the interaction is visible on any background.
    col += infl * 0.10;

    // Cool water tint, strongest where caustics peak.
    col = mix(col, col * vec3(0.86, 1.05, 1.07), tint * clamp(caustic, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

function hexToRgb01(hex: string, fallback: [number, number, number]): [number, number, number] {
  const m = hex.replace("#", "").match(/\w\w/g);
  if (!m || m.length < 3) return fallback;
  return [parseInt(m[0], 16) / 255, parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255];
}

// Keyframes for the animated film-grain shimmer. The noise tile's
// background-position is jumped between several offsets using a stepped
// timing function below, which gives the classic "ticking" grain look
// instead of a smoothly sliding texture.
const GRAIN_KEYFRAMES = `
@keyframes caustic-grain-shimmer {
  0%   { background-position:   0%   0%; }
  10%  { background-position: -12%  -8%; }
  20%  { background-position:   7% -22%; }
  30%  { background-position: -18%  14%; }
  40%  { background-position:  22%  -4%; }
  50%  { background-position:  -6%  28%; }
  60%  { background-position:  18%  10%; }
  70%  { background-position:  -3%  -18%; }
  80%  { background-position:  10%  22%; }
  90%  { background-position: -22%   6%; }
  100% { background-position:   0%   0%; }
}
`;

export interface CausticHeroProps {
  className?: string;
  /**
   * Optional image refracted by the surface. Leave empty/undefined to
   * keep the solid `fallbackColor` as the base — recommended when you
   * want the brand color fully visible behind the animation.
   */
  backgroundImageSrc?: string;
  /** Solid base color shown behind all animations. */
  fallbackColor?: string;
  /** Color pushed into the wave troughs. Tune per background for contrast. */
  deepColor?: string;
  /** Ambient caustic light strength. */
  causticAmount?: number;
  /** Base flow/warp strength of the idle surface. */
  flowAmount?: number;
  /** Extra warp the cursor adds locally. */
  cursorAmount?: number;
  /** Cool water-hue tint, 0..1. */
  tint?: number;
  /** Tiled grain texture laid over everything. Your noise.avif. */
  noiseImageSrc?: string;
  /** Grain opacity, 0..1. */
  noiseOpacity?: number;
  /** On-screen size of one grain tile, in px. */
  noiseTileSize?: number;
  /** How fast the grain shimmers, in seconds per full cycle. */
  grainAnimationDuration?: number;
  /** How many discrete "ticks" per cycle (steps timing). */
  grainAnimationSteps?: number;
}

export default function CausticHero({
  className = "",
  backgroundImageSrc = "",
  fallbackColor = "#F2EEE6",
  deepColor = "#C9BFA6",
  causticAmount = 0.7,
  flowAmount = 0.09,
  cursorAmount = 0.07,
  tint = 0.05,
  noiseImageSrc = "/directory/images/noise.avif",
  noiseOpacity = 0.18,
  noiseTileSize = 180,
  grainAnimationDuration = 1,
  grainAnimationSteps = 10,
}: CausticHeroProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const gl = (canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return undefined;

    let unmounted = false;
    let rafId: number | null = null;

    const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const vLoc = gl.getAttribLocation(program, "vertex");
    gl.enableVertexAttribArray(vLoc);
    gl.vertexAttribPointer(vLoc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      bg: gl.getUniformLocation(program, "backgroundTexture"),
      bgScale: gl.getUniformLocation(program, "bgScale"),
      time: gl.getUniformLocation(program, "time"),
      aspect: gl.getUniformLocation(program, "aspect"),
      cursor: gl.getUniformLocation(program, "cursor"),
      cursorVel: gl.getUniformLocation(program, "cursorVel"),
      cursorInfluence: gl.getUniformLocation(program, "cursorInfluence"),
      causticAmount: gl.getUniformLocation(program, "causticAmount"),
      flowAmount: gl.getUniformLocation(program, "flowAmount"),
      cursorAmount: gl.getUniformLocation(program, "cursorAmount"),
      tint: gl.getUniformLocation(program, "tint"),
      deepColor: gl.getUniformLocation(program, "deepColor"),
    };

    // --- background texture ---
    // The 1x1 fallback IS the solid base color. When no backgroundImageSrc
    // is provided we never overwrite this texture, so the entire canvas
    // is sampled from a single solid #F2EEE6 pixel — the caustic, flow,
    // cursor, and grain animations then run on top of that solid base
    // with nothing fading or gradient-ing the underlying color.
    const bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = hexToRgb01(fallbackColor, [0.04, 0.23, 0.23]).map((c) => Math.round(c * 255));
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([fb[0], fb[1], fb[2], 255])
    );

    let imgNaturalAspect = 1;
    let bgScale = { x: 1, y: 1 };

    function computeBgScale() {
      if (!canvas) return;
      const canvasAspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      bgScale =
        canvasAspect > imgNaturalAspect
          ? { x: 1, y: imgNaturalAspect / canvasAspect }
          : { x: canvasAspect / imgNaturalAspect, y: 1 };
    }

    // Only load an image if one was explicitly provided. Otherwise the
    // solid #F2EEE6 fallback texture above stays in place forever.
    if (backgroundImageSrc) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (unmounted) return;
        imgNaturalAspect = image.naturalWidth / Math.max(1, image.naturalHeight);
        gl.bindTexture(gl.TEXTURE_2D, bgTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        computeBgScale();
      };
      image.src = backgroundImageSrc;
    }

    // --- sizing ---
    function resize() {
      if (!wrap || !canvas) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      computeBgScale();
    }
    resize();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(wrap);
    window.addEventListener("resize", resize);

    // --- continuous cursor state (no discrete samples => nothing to miss) ---
    // raw* is written by every pointer event. smooth*/vel* are integrated
    // each frame so the influence point is always defined and always
    // chases the pointer, however fast or slow it moves.
    let rawX = 0.5;
    let rawY = 0.5;
    let haveRaw = false;
    let smoothX = 0.5;
    let smoothY = 0.5;
    let prevSmoothX = 0.5;
    let prevSmoothY = 0.5;
    let velX = 0;
    let velY = 0;
    let influence = 0; // eased 0..1
    let pointerInside = false;

    const handlePointerMove = (e: PointerEvent) => {
      if (reducedMotion || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;
      pointerInside = inside;
      if (!inside) return;
      rawX = (e.clientX - rect.left) / rect.width;
      rawY = 1 - (e.clientY - rect.top) / rect.height; // GL bottom-left origin
      if (!haveRaw) {
        // First sample: snap so we don't sweep across the whole panel.
        smoothX = prevSmoothX = rawX;
        smoothY = prevSmoothY = rawY;
        haveRaw = true;
      }
    };
    const handlePointerLeave = () => { pointerInside = false; };
    // Listen on window so tracking is reliable even over overlaid content.
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerLeave, { passive: true });
    window.addEventListener("blur", handlePointerLeave);

    // --- render loop: pure function of state, cannot get stuck ---
    const start = performance.now();
    let lastFrame = start;

    const renderFrame = (nowMs: number) => {
      if (unmounted) return;
      const t = (nowMs - start) / 1000;
      const dt = Math.min(0.05, Math.max(0.001, (nowMs - lastFrame) / 1000));
      lastFrame = nowMs;

      // Ease the smoothed cursor toward the raw pointer. Frame-rate
      // independent smoothing so it feels identical at 60/120Hz.
      const ease = 1 - Math.pow(0.0015, dt); // snappy but smooth
      if (haveRaw) {
        smoothX += (rawX - smoothX) * ease;
        smoothY += (rawY - smoothY) * ease;
      }
      // Velocity from frame-to-frame motion of the smoothed point.
      velX = (smoothX - prevSmoothX) / dt * 0.016;
      velY = (smoothY - prevSmoothY) / dt * 0.016;
      prevSmoothX = smoothX;
      prevSmoothY = smoothY;

      // Influence eases up while the pointer is inside, down when it
      // leaves — this is the smooth idle<->interactive transition.
      const targetInfluence = pointerInside && haveRaw ? 1 : 0;
      influence += (targetInfluence - influence) * (1 - Math.pow(0.02, dt));

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.uniform1i(u.bg, 0);
      gl.uniform2f(u.bgScale, bgScale.x, bgScale.y);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.aspect, canvas.width / Math.max(1, canvas.height));
      gl.uniform2f(u.cursor, smoothX, smoothY);
      gl.uniform2f(u.cursorVel, velX, velY);
      gl.uniform1f(u.cursorInfluence, influence);
      gl.uniform1f(u.causticAmount, causticAmount);
      gl.uniform1f(u.flowAmount, flowAmount);
      gl.uniform1f(u.cursorAmount, cursorAmount);
      gl.uniform1f(u.tint, tint);
      const dc = hexToRgb01(deepColor, [0.02, 0.23, 0.26]);
      gl.uniform3f(u.deepColor, dc[0], dc[1], dc[2]);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reducedMotion) rafId = requestAnimationFrame(renderFrame);
    };

    if (reducedMotion) {
      renderFrame(performance.now());
    } else {
      rafId = requestAnimationFrame(renderFrame);
    }

    // Pause when hidden, resume cleanly when visible.
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      } else if (!reducedMotion && rafId === null && !unmounted) {
        lastFrame = performance.now();
        rafId = requestAnimationFrame(renderFrame);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      unmounted = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver?.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(quad);
      gl.deleteTexture(bgTexture);
    };
  }, [backgroundImageSrc, fallbackColor, deepColor, causticAmount, flowAmount, cursorAmount, tint]);

  return (
    <div
      ref={wrapRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: fallbackColor,
      }}
    >
      {/* Keyframes live in a style tag so the component stays a single file. */}
      <style>{GRAIN_KEYFRAMES}</style>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${noiseImageSrc})`,
          backgroundRepeat: "repeat",
          backgroundSize: `${noiseTileSize}px auto`,
          opacity: noiseOpacity,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          // Steps timing makes the grain "tick" between positions like real
          // film grain rather than smoothly scroll like a moving texture.
          animation: `caustic-grain-shimmer ${grainAnimationDuration}s steps(${grainAnimationSteps}) infinite`,
          willChange: "background-position",
        }}
      />
    </div>
  );
}