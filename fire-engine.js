/**
 * BoB — Cinematic AAA Bonfire Fire Engine
 * Physics-based realistic bonfire particle simulation for Web3 Hero & Arena titles.
 * Provides realistic flame tongues, turbulence, buoyant smoke, and glowing ember sparks.
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
      this.maxParticles = 55;
      this.maxSparks = 25;
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isRunning = false;
      this.animId = null;

      // Color Palettes (White hot core -> Vivid Mid -> Outer edge)
      if (this.type === 'bull') {
        this.colors = {
          core: 'rgba(255, 255, 255, ',
          inner: 'rgba(167, 243, 208, ',
          mid: 'rgba(0, 255, 136, ',
          outer: 'rgba(5, 150, 105, ',
          smoke: 'rgba(6, 78, 59, ',
          spark: 'rgba(110, 231, 183, '
        };
      } else {
        this.colors = {
          core: 'rgba(255, 255, 240, ',
          inner: 'rgba(254, 215, 170, ',
          mid: 'rgba(255, 85, 0, ',
          outer: 'rgba(220, 38, 38, ',
          smoke: 'rgba(127, 29, 29, ',
          spark: 'rgba(253, 224, 71, '
        };
      }

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Handle visibility to save battery
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
        p.y = this.height - Math.random() * this.height * 0.7; // Pre-warm
        p.life = Math.random() * p.maxLife;
        this.particles.push(p);
      }

      for (let i = 0; i < this.maxSparks; i++) {
        const s = this.createSpark();
        s.y = this.height - Math.random() * this.height * 0.8;
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
      // Base emitter spread across the bottom width of the letter
      const spread = this.width * 0.6;
      const centerX = this.width * 0.5;

      return {
        x: centerX + (Math.random() - 0.5) * spread,
        y: this.height * 0.94 + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.9,
        vy: -(2.2 + Math.random() * 3.4), // Higher buoyancy for dramatic licking flames
        radius: 20 + Math.random() * 26,
        initialRadius: 20 + Math.random() * 26,
        life: 0,
        maxLife: 45 + Math.random() * 35,
        turbFreq: 0.045 + Math.random() * 0.045,
        turbAmp: 0.8 + Math.random() * 1.0,
        seed: Math.random() * 100
      };
    }

    createSpark() {
      const spread = this.width * 0.7;
      const centerX = this.width * 0.5;

      return {
        x: centerX + (Math.random() - 0.5) * spread,
        y: this.height * 0.88 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(3.0 + Math.random() * 4.2),
        radius: 1.4 + Math.random() * 2.4,
        life: 0,
        maxLife: 65 + Math.random() * 45,
        swaySpeed: 0.06 + Math.random() * 0.06,
        swayAmp: 1.4 + Math.random() * 1.6
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

      // Use lighter blending for realistic fire flame additive heating
      ctx.globalCompositeOperation = 'lighter';

      // 1. Render Base Bed of Coals Heat
      const centerX = this.width * 0.5;
      const baseY = this.height * 0.96;
      const baseGlow = ctx.createRadialGradient(
        centerX, baseY, 5,
        centerX, baseY, this.width * 0.45
      );
      baseGlow.addColorStop(0, this.colors.inner + '0.5)');
      baseGlow.addColorStop(0.5, this.colors.mid + '0.25)');
      baseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = baseGlow;
      ctx.beginPath();
      ctx.ellipse(centerX, baseY, this.width * 0.45, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render Main Fire Flame Particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          this.particles[i] = this.createParticle();
          continue;
        }

        const progress = p.life / p.maxLife; // 0 to 1

        // Horizontal turbulence motion simulating swirling fire vortex
        p.x += p.vx + Math.sin(p.life * p.turbFreq + p.seed) * p.turbAmp;
        p.y += p.vy;

        // Bonfire pyramid convergence towards center top
        const distFromCenter = p.x - centerX;
        p.x -= distFromCenter * 0.015;

        // Radius expands slightly at first, then shrinks to tip
        let currentRadius = p.initialRadius * (1 + 0.3 * Math.sin(progress * Math.PI)) * (1 - progress * 0.85);
        if (currentRadius < 1) currentRadius = 1;

        // Smooth color & alpha transition
        let alpha = 1;
        if (progress < 0.15) {
          alpha = progress / 0.15; // Fade in at base
        } else {
          alpha = Math.max(0, 1 - Math.pow(progress, 1.4)); // Smooth decay
        }

        // Soft top boundary falloff (prevents square clipping at canvas top)
        if (p.y < 40) {
          alpha *= Math.max(0, p.y / 40);
        }

        const grad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, currentRadius
        );

        if (progress < 0.3) {
          // White-hot core
          grad.addColorStop(0, this.colors.core + (alpha * 0.9) + ')');
          grad.addColorStop(0.4, this.colors.inner + (alpha * 0.8) + ')');
          grad.addColorStop(0.8, this.colors.mid + (alpha * 0.5) + ')');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
        } else if (progress < 0.7) {
          // Vivid body of the fire
          grad.addColorStop(0, this.colors.inner + (alpha * 0.8) + ')');
          grad.addColorStop(0.5, this.colors.mid + (alpha * 0.7) + ')');
          grad.addColorStop(0.85, this.colors.outer + (alpha * 0.4) + ')');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          // Fire tip & smoke transition
          grad.addColorStop(0, this.colors.mid + (alpha * 0.5) + ')');
          grad.addColorStop(0.6, this.colors.outer + (alpha * 0.3) + ')');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
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

        // Fade in quickly, slowly decay with tiny flicker
        let sAlpha = Math.sin(sProgress * Math.PI) * (0.7 + 0.3 * Math.sin(s.life * 0.4));
        if (s.y < 30) {
          sAlpha *= Math.max(0, s.y / 30);
        }

        ctx.fillStyle = this.colors.spark + Math.max(0, sAlpha) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * (1 - sProgress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Auto initialize on DOM ready
  function initAllBonfires() {
    new BonfireSimulator('canvas-flame-bull', 'bull');
    new BonfireSimulator('canvas-flame-bear', 'bear');
    new BonfireSimulator('canvas-arena-bull', 'bull');
    new BonfireSimulator('canvas-arena-bear', 'bear');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllBonfires);
  } else {
    initAllBonfires();
  }

  window.initBoBBonfires = initAllBonfires;
})();
