import { sfx } from './audio';

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  wobble: number;
  phase: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  alpha: number;
}

interface Ping {
  x: number;
  y: number;
  r: number;
  life: number;
  speed: number;
}

interface Krill {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  hue: number;
}

/**
 * The living ocean behind the game: rising bubbles, drifting marine snow,
 * sonar pings and krill swarms.
 */
export class OceanBackground {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bubbles: Bubble[] = [];
  private particles: Particle[] = [];
  private pings: Ping[] = [];
  private krill: Krill[] = [];
  private raf = 0;
  private last = 0;
  private running = false;
  /** 0 = surface, 1 = lightless depths. Drives tinting and density. */
  private depthFactor = 0;
  private targetDepthFactor = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seed();
  }

  private seed(): void {
    const count = Math.round((this.width * this.height) / 26000);
    this.bubbles = Array.from({ length: Math.min(70, Math.max(18, count)) }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      r: 1.5 + Math.random() * 5,
      speed: 12 + Math.random() * 34,
      wobble: 6 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.12 + Math.random() * 0.3,
    }));
    this.particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      r: 0.4 + Math.random() * 1.4,
      vy: 3 + Math.random() * 12,
      vx: (Math.random() - 0.5) * 5,
      alpha: 0.05 + Math.random() * 0.16,
    }));
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** 0..1 — how deep the water is. Deeper means darker and less bubble traffic. */
  setDepth(factor: number): void {
    this.targetDepthFactor = Math.min(1, Math.max(0, factor));
  }

  /** Fires a sonar ping from the centre of the screen. */
  ping(): void {
    this.pings.push({
      x: this.width / 2,
      y: this.height * 0.5,
      r: 10,
      life: 1,
      speed: 520,
    });
    sfx.click();
  }

  /** Releases a swarm of krill across the screen. */
  swarm(count = 60): void {
    for (let i = 0; i < count; i++) {
      this.krill.push({
        x: Math.random() * this.width,
        y: this.height * (0.35 + Math.random() * 0.6),
        vx: (Math.random() - 0.5) * 90,
        vy: (Math.random() - 0.5) * 30,
        size: 2 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
        hue: 330 + Math.random() * 40,
      });
    }
  }

  private update(dt: number): void {
    this.depthFactor += (this.targetDepthFactor - this.depthFactor) * Math.min(1, dt * 2);

    const lightFade = 1 - this.depthFactor * 0.75;

    for (const bubble of this.bubbles) {
      bubble.y -= bubble.speed * dt;
      bubble.phase += dt * 1.4;
      bubble.x += Math.sin(bubble.phase) * bubble.wobble * dt;
      if (bubble.y + bubble.r < 0) {
        bubble.y = this.height + bubble.r;
        bubble.x = Math.random() * this.width;
      }
    }

    for (const particle of this.particles) {
      particle.y -= particle.vy * dt;
      particle.x += particle.vx * dt;
      if (particle.y < -4) {
        particle.y = this.height + 4;
        particle.x = Math.random() * this.width;
      }
      if (particle.x < -4) particle.x = this.width + 4;
      if (particle.x > this.width + 4) particle.x = -4;
    }

    for (const ping of this.pings) {
      ping.r += ping.speed * dt;
      ping.life -= dt * 0.85;
    }
    this.pings = this.pings.filter((p) => p.life > 0);

    for (const krill of this.krill) {
      krill.x += krill.vx * dt;
      krill.y += krill.vy * dt;
      krill.phase += dt * 8;
      if (krill.x < -30) krill.x = this.width + 30;
      if (krill.x > this.width + 30) krill.x = -30;
      if (krill.y < -30) krill.y = this.height + 30;
      if (krill.y > this.height + 30) krill.y = -30;
    }

    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = `rgba(255,255,255,${0.02 * lightFade})`;
  }

  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Marine snow
    for (const particle of this.particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(214, 240, 255, ${particle.alpha})`;
      ctx.fill();
    }

    // Bubbles
    for (const bubble of this.bubbles) {
      const wobble = Math.sin(bubble.phase) * 3;
      ctx.beginPath();
      ctx.arc(bubble.x + wobble, bubble.y, bubble.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(190, 235, 255, ${bubble.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        bubble.x + wobble - bubble.r * 0.3,
        bubble.y - bubble.r * 0.35,
        bubble.r * 0.32,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha * 1.6})`;
      ctx.fill();
    }

    // Krill swarm
    for (const krill of this.krill) {
      const wiggle = Math.sin(krill.phase) * 2.4;
      ctx.save();
      ctx.translate(krill.x, krill.y);
      ctx.rotate(Math.atan2(krill.vy, krill.vx));
      ctx.fillStyle = `hsla(${krill.hue}, 90%, 70%, 0.85)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, krill.size * 1.9, krill.size * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-krill.size * 1.7, 0);
      ctx.lineTo(-krill.size * 3, wiggle);
      ctx.lineTo(-krill.size * 1.7, 0);
      ctx.fill();
      ctx.restore();
    }

    // Sonar pings
    for (const ping of this.pings) {
      ctx.beginPath();
      ctx.arc(ping.x, ping.y, ping.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125, 226, 255, ${ping.life * 0.35})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
