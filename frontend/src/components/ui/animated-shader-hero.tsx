"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { GradientButton } from "./gradient-button";

// ─── Default WebGL fragment shader ────────────────────────────────────────────
const defaultShaderSource = `
  precision mediump float;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_mouse;

  // ---- hash / noise helpers ----
  float hash(vec2 p) {
    p  = fract(p * vec2(443.897, 441.423));
    p += dot(p, p + 43.8);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value     = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      value     += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 uv    = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse         / u_resolution.xy;
    float t    = u_time * 0.25;

    // Domain-warp layer 1
    vec2 q = vec2(
      fbm(uv + vec2(0.0,  0.0)),
      fbm(uv + vec2(5.2,  1.3))
    );

    // Domain-warp layer 2 + time
    vec2 r = vec2(
      fbm(uv + 1.0 * q + vec2(1.70 + t * 0.15, 9.20)),
      fbm(uv + 1.0 * q + vec2(8.30 + t * 0.13, 2.80))
    );

    // Soft mouse ripple
    float md = length(uv - mouse);
    r += 0.12 * (1.0 - smoothstep(0.0, 0.45, md)) * normalize(uv - mouse + 0.0001);

    float f = fbm(uv + r);

    // Colour palette: deep navy → emerald → midnight
    vec3 col = mix(
      vec3(0.059, 0.090, 0.165),   // #0f172a  deep navy
      vec3(0.063, 0.725, 0.506),   // #10b981  emerald
      clamp(f * f * 4.0, 0.0, 1.0)
    );
    col = mix(col,
      vec3(0.031, 0.047, 0.098),   // darker navy
      clamp(length(q), 0.0, 1.0)
    );
    col = mix(col,
      vec3(0.18, 0.24, 0.48),      // blue-slate
      clamp(f, 0.0, 1.0)
    );

    // Gentle vignette
    float vig = 1.0 - smoothstep(0.4, 1.4, length((uv - 0.5) * 2.0));
    col *= 0.25 + 0.75 * vig;

    // Keep it dark enough so text stays readable
    col *= 0.65;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ─── Vertex shader (shared, never changes) ────────────────────────────────────
const VERTEX_SRC = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// ─── PointerHandler ──────────────────────────────────────────────────────────
class PointerHandler {
  private canvas: HTMLCanvasElement;
  public x = 0;
  public y = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.onPointer = this.onPointer.bind(this);
    this.onTouch   = this.onTouch.bind(this);
    canvas.addEventListener("pointermove", this.onPointer);
    canvas.addEventListener("touchmove",   this.onTouch, { passive: true });
  }

  private onPointer(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    this.x = (e.clientX - r.left) * devicePixelRatio;
    this.y = (this.canvas.height) - (e.clientY - r.top) * devicePixelRatio;
  }

  private onTouch(e: TouchEvent) {
    if (e.touches.length > 0) {
      const r = this.canvas.getBoundingClientRect();
      this.x = (e.touches[0].clientX - r.left) * devicePixelRatio;
      this.y = (this.canvas.height) - (e.touches[0].clientY - r.top) * devicePixelRatio;
    }
  }

  destroy() {
    this.canvas.removeEventListener("pointermove", this.onPointer);
    this.canvas.removeEventListener("touchmove",   this.onTouch);
  }
}

// ─── WebGLRenderer ───────────────────────────────────────────────────────────
class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private buf: WebGLBuffer;
  private uTime: WebGLUniformLocation | null;
  private uRes:  WebGLUniformLocation | null;
  private uMouse: WebGLUniformLocation | null;
  private t0: number;

  constructor(canvas: HTMLCanvasElement, fragmentSrc: string) {
    const gl = canvas.getContext("webgl");
    if (!gl) throw new Error("WebGL not supported");
    this.gl  = gl;
    this.t0  = performance.now();

    const vs = this.compile(gl.VERTEX_SHADER,   VERTEX_SRC);
    const fs = this.compile(gl.FRAGMENT_SHADER, fragmentSrc);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error("Program link error: " + gl.getProgramInfoLog(prog));
    }
    this.program = prog;

    // Full-screen quad
    this.buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1,  1, -1,  -1, 1,  1, 1]),
      gl.STATIC_DRAW
    );

    gl.useProgram(prog);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    this.uTime  = gl.getUniformLocation(prog, "u_time");
    this.uRes   = gl.getUniformLocation(prog, "u_resolution");
    this.uMouse = gl.getUniformLocation(prog, "u_mouse");
  }

  private compile(type: number, src: string): WebGLShader {
    const s = this.gl.createShader(type)!;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      throw new Error("Shader error: " + this.gl.getShaderInfoLog(s));
    }
    return s;
  }

  render(w: number, h: number, mx: number, my: number) {
    const gl = this.gl;
    const t  = (performance.now() - this.t0) / 1000;
    gl.viewport(0, 0, w, h);
    gl.useProgram(this.program);
    gl.uniform1f(this.uTime,  t);
    gl.uniform2f(this.uRes,   w, h);
    gl.uniform2f(this.uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    this.gl.deleteProgram(this.program);
    this.gl.deleteBuffer(this.buf);
  }
}

// ─── Hero component ──────────────────────────────────────────────────────────
export interface HeroProps {
  trustBadge?: { text: string; icons?: string[] };
  headline?:   { line1: string; line2: string };
  subtitle?:   string;
  buttons?: {
    primary?:   { text: string; onClick?: () => void; href?: string };
    secondary?: { text: string; onClick?: () => void; href?: string };
  };
  shaderSource?: string;
  className?:    string;
  /** Optional right-side slot rendered alongside hero text */
  children?: React.ReactNode;
}

export function Hero({
  trustBadge,
  headline,
  subtitle,
  buttons,
  shaderSource = defaultShaderSource,
  className,
  children,
}: HeroProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rendRef    = useRef<WebGLRenderer | null>(null);
  const ptrRef     = useRef<PointerHandler | null>(null);
  const rafRef     = useRef<number>(0);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    const rend   = rendRef.current;
    const ptr    = ptrRef.current;
    if (!canvas || !rend) return;
    rend.render(canvas.width, canvas.height, ptr?.x ?? 0, ptr?.y ?? 0);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let observer: ResizeObserver | null = null;

    try {
      rendRef.current = new WebGLRenderer(canvas, shaderSource);
      ptrRef.current  = new PointerHandler(canvas);

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const w = parent.offsetWidth;
        const h = parent.offsetHeight;
        canvas.width  = w * devicePixelRatio;
        canvas.height = h * devicePixelRatio;
        canvas.style.width  = `${w}px`;
        canvas.style.height = `${h}px`;
      };

      resize();
      observer = new ResizeObserver(resize);
      if (canvas.parentElement) observer.observe(canvas.parentElement);

      tick();
    } catch {
      // WebGL unavailable — canvas stays hidden, content still renders
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      rendRef.current?.destroy();
      ptrRef.current?.destroy();
      observer?.disconnect();
    };
  }, [shaderSource, tick]);

  return (
    <section
      className={cn(
        "relative overflow-hidden min-h-[90vh] flex items-center bg-[#0f172a]",
        className
      )}
    >
      {/* WebGL canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Dark gradient overlay so text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/40 via-transparent to-[#0f172a]/60 pointer-events-none" />

      {/* Content layer */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className={cn("grid gap-12", children ? "lg:grid-cols-2" : "")}>
          {/* Left / main column */}
          <div>
            {trustBadge && (
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                {trustBadge.icons?.map((icon, i) => (
                  <span key={i}>{icon}</span>
                ))}
                {trustBadge.text}
              </p>
            )}

            {headline && (
              <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {headline.line1}
                <br />
                <span className="text-emerald-400">{headline.line2}</span>
              </h1>
            )}

            {subtitle && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                {subtitle}
              </p>
            )}

            {buttons && (
              <div className="mt-8 flex flex-wrap gap-3">
                {buttons.primary && (
                  buttons.primary.href ? (
                    <GradientButton asChild>
                      <Link href={buttons.primary.href}>{buttons.primary.text}</Link>
                    </GradientButton>
                  ) : (
                    <GradientButton onClick={buttons.primary.onClick}>
                      {buttons.primary.text}
                    </GradientButton>
                  )
                )}
                {buttons.secondary && (
                  buttons.secondary.href ? (
                    <GradientButton variant="variant" asChild>
                      <Link href={buttons.secondary.href}>{buttons.secondary.text}</Link>
                    </GradientButton>
                  ) : (
                    <GradientButton variant="variant" onClick={buttons.secondary.onClick}>
                      {buttons.secondary.text}
                    </GradientButton>
                  )
                )}
              </div>
            )}
          </div>

          {/* Optional right-side slot */}
          {children && <div>{children}</div>}
        </div>
      </div>
    </section>
  );
}

export { defaultShaderSource };
