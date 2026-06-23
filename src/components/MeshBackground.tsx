"use client";

import React, { useEffect, useRef } from "react";

/**
 * GrainSection
 * ------------------------------------------------------------------
 * A solid brand-color section with a fine, in-place flickering film
 * grain animated over it. Nothing flows, drifts, or pans — every grain
 * particle stays put and only its brightness shimmers from frame to
 * frame. The result reads as "paper that's slightly alive."
 *
 *   <GrainSection>
 *     <YourContent />
 *   </GrainSection>
 *
 * The grain is quantized to particles a couple of device pixels wide
 * (instead of one), which is what makes it look like film grain rather
 * than digital static — a single-pixel hash on a retina screen is too
 * fine for the eye to resolve and disappears.
 *
 * Every frame is a pure function of (time). No framebuffers, no
 * simulation state — cannot desync or stall.
 * ------------------------------------------------------------------
 */

const VERTEX_SHADER = `
  attribute vec2 vertex;
  void main() {
    gl_Position = vec4(vertex, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec3  base;        // solid brand color
  uniform float grainAmount; // 0..1 — full peak-to-peak swing
  uniform float grainSize;   // size of one grain particle, in device pixels
  uniform float seed;        // per-frame seed; changes every frame so grain flickers

  // 3D hash (Dave Hoskins style). The cross-products in the dot mix all
  // three axes nonlinearly, so a uniform change in the time axis produces
  // uncorrelated outputs at neighbouring particles. This is what keeps the
  // grain from drifting: there is no axis you could add to every particle
  // each frame that would translate into a screen-space direction.
  float hash13(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    // Quantize to particle blocks.
    vec2 particle = floor(gl_FragCoord.xy / grainSize);

    // Time is an INDEPENDENT axis in the hash, not a spatial offset.
    // Each particle has its own random sequence indexed by frame; no
    // shared direction of motion can emerge.
    float r = hash13(vec3(particle, seed));

    // Centered around zero so we both lift and darken evenly. Squared
    // distribution biases toward small values, giving a softer feel
    // than uniform noise.
    float g = (r - 0.5);
    g = sign(g) * g * g * 4.0; // shape the distribution

    gl_FragColor = vec4(base + vec3(g) * grainAmount, 1.0);
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

export interface GrainSectionProps {
  className?: string;
  /** Solid brand color filling the section. */
  backgroundColor?: string;
  /**
   * Strength of the flicker, 0..1. This is the peak-to-peak brightness
   * swing. 0.06 is subtle-but-clearly-alive; 0.10 starts looking like
   * old film stock; below 0.03 you can barely see it move.
   */
  grainAmount?: number;
  /**
   * Size of one grain particle in CSS pixels. 1.5 is a good default
   * (reads as fine film grain on both standard and retina screens).
   * Push to 2–3 for chunkier "paper" feel, or 1.0 for finest grain.
   */
  grainSize?: number;
  /**
   * How often the grain reseeds, in seeds per second. 60 = every frame
   * at 60Hz (classic film grain). Lower it (e.g. 20) for a calmer,
   * slower shimmer.
   */
  grainRate?: number;
  /** Inline style for the wrapper section. */
  style?: React.CSSProperties;
  /** Content rendered above the grain. */
  children?: React.ReactNode;
}

export default function GrainSection({
  className = "",
  backgroundColor = "#f2eee5",
  grainAmount = 0.06,
  grainSize = 1.5,
  grainRate = 60,
  style,
  children,
}: GrainSectionProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const gl = (canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return undefined;

    let unmounted = false;
    let rafId: number | null = null;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const vLoc = gl.getAttribLocation(program, "vertex");
    gl.enableVertexAttribArray(vLoc);
    gl.vertexAttribPointer(vLoc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      base: gl.getUniformLocation(program, "base"),
      grainAmount: gl.getUniformLocation(program, "grainAmount"),
      grainSize: gl.getUniformLocation(program, "grainSize"),
      seed: gl.getUniformLocation(program, "seed"),
    };

    function resize() {
      if (!wrap || !canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
    resize();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(wrap);
    window.addEventListener("resize", resize);

    const start = performance.now();

    const renderFrame = (nowMs: number) => {
      if (unmounted) return;
      const t = (nowMs - start) / 1000;

      const baseC = hexToRgb01(backgroundColor, [0.949, 0.933, 0.898]);

      // Per-frame seed. floor(t * grainRate) produces a discrete integer
      // seed that advances `grainRate` times per second — at 60 that's
      // every frame on a 60Hz display, which is the classic film flicker.
      const seedValue = reducedMotion ? 0 : Math.floor(t * grainRate);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform3f(u.base, baseC[0], baseC[1], baseC[2]);
      gl.uniform1f(u.grainAmount, reducedMotion ? 0 : grainAmount);
      gl.uniform1f(u.grainSize, grainSize * dpr); // convert CSS px to device px
      gl.uniform1f(u.seed, seedValue);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reducedMotion) rafId = requestAnimationFrame(renderFrame);
    };

    if (reducedMotion) {
      renderFrame(performance.now()); // one static frame
    } else {
      rafId = requestAnimationFrame(renderFrame);
    }

    // Pause when the tab is hidden; resume cleanly when it returns.
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      } else if (!reducedMotion && rafId === null && !unmounted) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      unmounted = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver?.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(quad);
    };
  }, [backgroundColor, grainAmount, grainSize, grainRate]);

  return (
    <section
      ref={wrapRef}
      className={className}
      style={{
        position: "relative",
        background: backgroundColor,
        overflow: "hidden",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </section>
  );
}