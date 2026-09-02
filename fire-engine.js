/**
 * BoB — Tier-1 AAA Cyber Aurora & Stardust Sparkle Engine
 * Ultra-luxury particle & aura simulation for Web3 Hero & Arena titles.
 * Renders cinematic backlight auroras, ambient quantum dust, and diamond glint sparkles
 * strictly BEHIND the letters, preserving 100% crisp typography clarity.
 */

(function () {
  'use strict';

  class CyberAuraSimulator {
    constructor(canvasId, type = 'bull') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.type = type; // 'bull' (emerald) or 'bear' (crimson)
      this.dust = [];
      this.glints = [];
      this.maxDust = 24;
      this.maxGlints = 6;
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isRunning = false;
      this.animId = null;
      this.time = 0;

      // Tier-1 Color Schemes
      if (this.type === 'bull') {
        this.colors = {
          glowCore: 'rgba(0, 255, 136, ',
          glowOuter: 'rgba(16, 185, 129, ',
          sparkle: '#a7f3d0',
          glint: '#ffffff'
        };
      } else {
        this.colors = {
          glowCore: 'rgba(255, 51, 68, ',
          glowOuter: 'rgba(220, 38, 38, ',
          sparkle: '#fecaca',
          glint: '#ffffff'
        };
      }

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });

      // Spawn initial ambient stardust
      for (let i = 0; i < this.maxDust; i++) {
        this.dust.push(this.createDust(true));
      }

      for (let i = 0; i < this.maxGlints; i++) {
        this.glints.push(this.createGlint());
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

    createDust(randomLife = false) {
      const w = this.width || 80;
      const h = this.height || 100;

      return {
        x: w * 0.15 + Math.random() * (w * 0.7),
        y: h * 0.2 + Math.random() * (h * 0.75),
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(0.25 + Math.random() * 0.55),
        radius: 0.6 + Math.random() * 1.2,
        life: randomLife ? Math.random() * 60 : 0,
        maxLife: 50 + Math.random() * 40,
        pulseSpeed: 0.05 + Math.random() * 0.05,
        seed: Math.random() * 100
      };
    }

    createGlint() {
      const w = this.width || 80;
      const h = this.height || 100;

      return {
        x: w * 0.2 + Math.random() * (w * 0.6),
        y: h * 0.2 + Math.random() * (h * 0.65),
        life: 0,
        maxLife: 30 + Math.random() * 30,
        size: 2.5 + Math.random() * 3.5,
        delay: Math.floor(Math.random() * 80)
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

      this.time += 0.03;
      ctx.clearRect(0, 0, this.width, this.height);

      const centerX = this.width * 0.5;
      const centerY = this.height * 0.52;

      // 1. Cinematic Backlight Aurora Flare (Soft Ambient Glow Behind the Letter)
      ctx.globalCompositeOperation = 'screen';

      const breathe = Math.sin(this.time * 1.8) * 0.08;
      const auraRadius = (this.width * 0.42) * (1 + breathe);

      const auraGrad = ctx.createRadialGradient(
        centerX, centerY, 5,
        centerX, centerY, auraRadius
      );
      auraGrad.addColorStop(0, this.colors.glowCore + (0.28 + breathe) + ')');
      auraGrad.addColorStop(0.5, this.colors.glowOuter + (0.12 + breathe * 0.5) + ')');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Ambient Quantum Stardust Particles (Floating gently in 3D depth)
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < this.dust.length; i++) {
        const d = this.dust[i];
        d.life++;

        if (d.life >= d.maxLife) {
          this.dust[i] = this.createDust(false);
          continue;
        }

        d.x += d.vx + Math.sin(d.life * d.pulseSpeed + d.seed) * 0.3;
        d.y += d.vy;

        const progress = d.life / d.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.85;

        ctx.fillStyle = this.colors.glowCore + Math.max(0, alpha) + ')';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Diamond Star Glints (Exquisite 4-point sparkle flashes)
      for (let i = 0; i < this.glints.length; i++) {
        const g = this.glints[i];

        if (g.delay > 0) {
          g.delay--;
          continue;
        }

        g.life++;
        if (g.life >= g.maxLife) {
          this.glints[i] = this.createGlint();
          continue;
        }

        const gProgress = g.life / g.maxLife;
        const gAlpha = Math.sin(gProgress * Math.PI);
        const s = g.size * Math.sin(gProgress * Math.PI);

        if (gAlpha > 0.05) {
          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${gAlpha * 0.9})`;
          ctx.lineWidth = 1;

          // 4-point star cross
          ctx.beginPath();
          ctx.moveTo(-s * 2, 0);
          ctx.lineTo(s * 2, 0);
          ctx.moveTo(0, -s * 2);
          ctx.lineTo(0, s * 2);
          ctx.stroke();

          // Center bright point
          ctx.fillStyle = `rgba(255, 255, 255, ${gAlpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }
    }
  }

  function initSimulators() {
    new CyberAuraSimulator('canvas-flame-bull', 'bull');
    new CyberAuraSimulator('canvas-flame-bear', 'bear');
    new CyberAuraSimulator('canvas-arena-bull', 'bull');
    new CyberAuraSimulator('canvas-arena-bear', 'bear');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulators);
  } else {
    initSimulators();
  }

  window.initBoBBonfires = initSimulators;
})();
