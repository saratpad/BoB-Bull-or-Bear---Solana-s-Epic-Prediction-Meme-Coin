/**
 * BoB — Cinematic AAA Bonfire Flame Tongue Engine
 * Pro-tier physics-based realistic flame tongue simulation for Web3 Hero & Arena titles.
 * Dynamically scales with letter dimensions, provides licking flame tongues, heat turbulence,
 * and floating ember sparks without obscuring letter contours.
 */

(function () {
  'use strict';

  class BonfireSimulator {
    constructor(canvasId, type = 'bull') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.type = type; // 'bull' (green) or 'bear' (red)
      this.particles = [];
      this.sparks = [];
      this.maxParticles = 36;
      this.maxSparks = 16;
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isRunning = false;
      this.animId = null;

      // Color Palettes (White hot core -> Vibrant Main -> Rich Edge)
      if (this.type === 'bull') {
        this.colors = {
          core: 'rgba(215, 255, 235, ',
          inner: 'rgba(0, 255, 136, ',
          mid: 'rgba(16, 185, 129, ',
          outer: 'rgba(4, 120, 87, ',
          spark: 'rgba(110, 231, 183, '
        };
      } else {
        this.colors = {
          core: 'rgba(255, 235, 200, ',
          inner: 'rgba(255, 80, 20, ',
          mid: 'rgba(239, 68, 68, ',
          outer: 'rgba(185, 28, 28, ',
          spark: 'rgba(253, 224, 71, '
        };
      }

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Handle visibility to save performance
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });

      // Spawn initial particles
      for (let i = 0; i < this.maxParticles; i++) {
        const p = this.createParticle();
        p.y = this.height - Math.random() * this.height * 0.75;
        p.life = Math.random() * p.maxLife;
        this.particles.push(p);
      }

      for (let i = 0; i < this.maxSparks; i++) {
        const s = this.createSpark();
        s.y = this.height - Math.random() * this.height * 0.85;
        s.life = Math.random() * s.maxLife;
        this.sparks.push(s);
      }

      this.start();
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = Math.floor(rect.width * this.dpr);
      this.canvas.height = Math.floor(rect.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    createParticle() {
      const w = this.width || 80;
      const h = this.height || 100;

      // Base emitter hugs the bottom contour of the letter
      const spread = w * 0.48;
      const centerX = w * 0.5;

      // Proportional radius based strictly on container width
      const baseRadius = (w * 0.08) + Math.random() * (w * 0.08);

      return {
        x: centerX + (Math.random() - 0.5) * spread,
        y: h * 0.92 + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -((h * 0.016) + Math.random() * (h * 0.024)), // Responsive buoyancy
        radius: baseRadius,
        initialRadius: baseRadius,
        life: 0,
        maxLife: 38 + Math.random() * 26,
        turbFreq: 0.05 + Math.random() * 0.05,
        turbAmp: 0.7 + Math.random() * 0.8,
        seed: Math.random() * 100
      };
    }

    createSpark() {
      const w = this.width || 80;
      const h = this.height || 100;
      const spread = w * 0.55;
      const centerX = w * 0.5;

      return {
        x: centerX + (Math.random() - 0.5) * spread,
        y: h * 0.85 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -((h * 0.022) + Math.random() * (h * 0.032)),
        radius: 0.8 + Math.random() * 1.4,
        life: 0,
        maxLife: 55 + Math.random() * 35,
        swaySpeed: 0.07 + Math.random() * 0.07,
        swayAmp: 1.0 + Math.random() * 1.2
      };
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      const loop = () => {
        if (!this.isRunning) return;
        this.render();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      this.isRunning = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    render() {
      const ctx = this.ctx;
      if (!ctx || this.width === 0 || this.height === 0) return;

      ctx.clearRect(0, 0, this.width, this.height);

      // Additive blending for luminous fluid flame
      ctx.globalCompositeOperation = 'lighter';

      const centerX = this.width * 0.5;
      const baseY = this.height * 0.92;

      // 1. Bed of Coals Subtle Underlight
      const baseGlow = ctx.createRadialGradient(
        centerX, baseY, 2,
        centerX, baseY, this.width * 0.35
      );
      baseGlow.addColorStop(0, this.colors.inner + '0.4)');
      baseGlow.addColorStop(0.6, this.colors.mid + '0.15)');
      baseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = baseGlow;
      ctx.beginPath();
      ctx.ellipse(centerX, baseY, this.width * 0.35, this.height * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render Elongated Flame Tongues
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          this.particles[i] = this.createParticle();
          continue;
        }

        const progress = p.life / p.maxLife; // 0 to 1

        // Horizontal turbulence motion simulating swirling heat vortex
        const turbulence = Math.sin(p.life * p.turbFreq + p.seed) * p.turbAmp;
        p.x += p.vx + turbulence;
        p.y += p.vy;

        // Pyramid convergence towards center top
        const distFromCenter = p.x - centerX;
        p.x -= distFromCenter * 0.018;

        // Radius taper to tip
        let currentRadius = p.initialRadius * (1 + 0.2 * Math.sin(progress * Math.PI)) * (1 - progress * 0.85);
        if (currentRadius < 0.5) currentRadius = 0.5;

        // Alpha envelope
        let alpha = 1;
        if (progress < 0.15) {
          alpha = progress / 0.15;
        } else {
          alpha = Math.max(0, 1 - Math.pow(progress, 1.5));
        }

        // Soft top boundary falloff
        const topThreshold = this.height * 0.22;
        if (p.y < topThreshold) {
          alpha *= Math.max(0, p.y / topThreshold);
        }

        const grad = ctx.createRadialGradient(
          0, 0, 0,
          0, 0, currentRadius
        );

        if (progress < 0.25) {
          // Hot core
          grad.addColorStop(0, this.colors.core + (alpha * 0.85) + ')');
          grad.addColorStop(0.45, this.colors.inner + (alpha * 0.75) + ')');
          grad.addColorStop(0.9, this.colors.mid + (alpha * 0.4) + ')');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
        } else if (progress < 0.65) {
          // Rich flame tongue
          grad.addColorStop(0, this.colors.inner + (alpha * 0.75) + ')');
          grad.addColorStop(0.5, this.colors.mid + (alpha * 0.6) + ')');
          grad.addColorStop(0.9, this.colors.outer + (alpha * 0.3) + ')');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          // Flame tip decay
          grad.addColorStop(0, this.colors.mid + (alpha * 0.45) + ')');
          grad.addColorStop(0.7, this.colors.outer + (alpha * 0.2) + ')');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
        }

        // Render as vertical elongated flame tongue
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(turbulence * 0.08);
        ctx.scale(0.68, 1.45); // Elongated licking tongue shape
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Render Floating Ember Sparks
      for (let i = 0; i < this.sparks.length; i++) {
        const s = this.sparks[i];
        s.life++;

        if (s.life >= s.maxLife) {
          this.sparks[i] = this.createSpark();
          continue;
        }

        const sProgress = s.life / s.maxLife;
        s.x += s.vx + Math.sin(s.life * s.swaySpeed) * s.swayAmp;
        s.y += s.vy;

        let sAlpha = Math.sin(sProgress * Math.PI) * (0.7 + 0.3 * Math.sin(s.life * 0.5));
        const sparkTopThreshold = this.height * 0.15;
        if (s.y < sparkTopThreshold) {
          sAlpha *= Math.max(0, s.y / sparkTopThreshold);
        }

        ctx.fillStyle = this.colors.spark + Math.max(0, sAlpha * 0.85) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Auto-initialize when DOM is loaded or canvas is ready
  function initBonfires() {
    new BonfireSimulator('canvas-flame-bull', 'bull');
    new BonfireSimulator('canvas-flame-bear', 'bear');
    new BonfireSimulator('canvas-arena-bull', 'bull');
    new BonfireSimulator('canvas-arena-bear', 'bear');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBonfires);
  } else {
    initBonfires();
  }

  window.initBoBBonfires = initBonfires;
})();
