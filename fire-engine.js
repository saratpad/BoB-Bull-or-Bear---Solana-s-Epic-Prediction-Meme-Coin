/**
 * BoB — Billion-Dollar Cinematic Thunder & Lightning Engine
 * Dramatic, heavy, high-impact thunder strikes with realistic cadence and lingering plasma dissipation.
 * Designed for Tier-1 Web3 & AAA GameFi titles.
 */

(function () {
  'use strict';

  class ThunderSimulator {
    constructor(canvasId, type = 'bull') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.type = type; // 'bull' (emerald) or 'bear' (crimson)
      this.activeBolts = [];
      this.shockSparks = [];
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isRunning = false;
      this.animId = null;

      // Strike interval timer (Not too frequent: strikes every 1.8 to 3.2 seconds)
      // Stagger Bull and Bear so they alternate like an epic duel
      const initialDelay = this.type === 'bull' ? 45 : 110;
      this.cooldown = initialDelay;
      this.minInterval = 110; // ~1.8s at 60fps
      this.maxInterval = 190; // ~3.2s at 60fps

      // Color Palettes
      if (this.type === 'bull') {
        this.colors = {
          outer: 'rgba(0, 255, 136, ',
          glow: 'rgba(52, 211, 153, ',
          core: '#ffffff',
          spark: 'rgba(167, 243, 208, '
        };
      } else {
        this.colors = {
          outer: 'rgba(255, 40, 60, ',
          glow: 'rgba(251, 113, 133, ',
          core: '#ffffff',
          spark: 'rgba(254, 202, 202, '
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

    // Midpoint displacement algorithm for realistic lightning fracture
    createBranch(x1, y1, x2, y2, displacement, iteration) {
      if (iteration <= 0) {
        return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      }

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;

      const left = this.createBranch(x1, y1, midX, midY, displacement * 0.52, iteration - 1);
      const right = this.createBranch(midX, midY, x2, y2, displacement * 0.52, iteration - 1);

      return left.slice(0, -1).concat(right);
    }

    // Unleash an epic, heavy thunderbolt strike
    triggerThunderStrike() {
      const w = this.width || 80;
      const h = this.height || 100;
      const cx = w * 0.5;
      const cy = h * 0.5;

      // Heavy main bolt path: from upper outside striking down across the letter
      const startAngle = Math.PI * (0.8 + Math.random() * 0.5);
      const endAngle = startAngle + Math.PI * (0.7 + Math.random() * 0.6);

      const x1 = cx + Math.cos(startAngle) * (w * 0.46);
      const y1 = cy + Math.sin(startAngle) * (h * 0.48);
      const x2 = cx + Math.cos(endAngle) * (w * 0.44);
      const y2 = cy + Math.sin(endAngle) * (h * 0.46);

      const mainPath = this.createBranch(x1, y1, x2, y2, 28, 5);

      // Create 3 to 5 multi-stage branching bolts
      const subBranches = [];
      const numBranches = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numBranches; i++) {
        const segIdx = Math.floor(Math.random() * (mainPath.length - 2)) + 1;
        const startPt = mainPath[segIdx];
        const branchLen = w * (0.25 + Math.random() * 0.35);
        const branchAngle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() - 0.5) * 1.8;

        const bx2 = startPt.x + Math.cos(branchAngle) * branchLen;
        const by2 = startPt.y + Math.sin(branchAngle) * branchLen;

        subBranches.push({
          path: this.createBranch(startPt.x, startPt.y, bx2, by2, 16, 3),
          widthMultiplier: 0.55 + Math.random() * 0.25
        });
      }

      // Explosion of high-voltage shock sparks at impact point
      for (let i = 0; i < 14; i++) {
        const spAngle = Math.random() * Math.PI * 2;
        const spSpeed = 1.5 + Math.random() * 4.5;
        this.shockSparks.push({
          x: x2,
          y: y2,
          vx: Math.cos(spAngle) * spSpeed,
          vy: Math.sin(spAngle) * spSpeed,
          life: 0,
          maxLife: 20 + Math.random() * 15,
          radius: 1.2 + Math.random() * 2.0
        });
      }

      // Main heavy bolt object with lingering energy dissipation
      this.activeBolts.push({
        mainPath: mainPath,
        branches: subBranches,
        life: 0,
        maxLife: 16, // Lingers ~0.27s for powerful visual weight
        baseWidth: 3.2 + Math.random() * 1.8
      });
    }

    // Occasional subtle micro static arc while charging
    triggerMicroSpark() {
      const w = this.width || 80;
      const h = this.height || 100;
      const cx = w * 0.5;
      const cy = h * 0.5;

      const angle = Math.random() * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * (w * 0.36);
      const y1 = cy + Math.sin(angle) * (h * 0.38);
      const x2 = x1 + (Math.random() - 0.5) * (w * 0.25);
      const y2 = y1 + (Math.random() - 0.5) * (h * 0.25);

      this.activeBolts.push({
        mainPath: this.createBranch(x1, y1, x2, y2, 12, 3),
        branches: [],
        life: 0,
        maxLife: 5,
        baseWidth: 1.2
      });
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
      ctx.globalCompositeOperation = 'lighter';

      // 1. Cadence Management: Controlled dramatic strikes (NOT spastic/frequent)
      this.cooldown--;
      if (this.cooldown <= 0) {
        this.triggerThunderStrike();
        this.cooldown = this.minInterval + Math.floor(Math.random() * (this.maxInterval - this.minInterval));
      } else if (this.cooldown % 35 === 0 && Math.random() > 0.6) {
        // Very occasional subtle micro-arc charging hum
        this.triggerMicroSpark();
      }

      // 2. Render Lingering Thunderbolts
      for (let i = this.activeBolts.length - 1; i >= 0; i--) {
        const bolt = this.activeBolts[i];
        bolt.life++;

        if (bolt.life >= bolt.maxLife) {
          this.activeBolts.splice(i, 1);
          continue;
        }

        // Dissipation curve: Instant strike peak, then smooth atmospheric decay
        const progress = bolt.life / bolt.maxLife;
        const alpha = Math.pow(1 - progress, 1.6);

        // Draw Main Heavy Thunderbolt
        this.drawPathWithGlow(ctx, bolt.mainPath, bolt.baseWidth, alpha);

        // Draw Sub Branches
        for (let j = 0; j < bolt.branches.length; j++) {
          const br = bolt.branches[j];
          this.drawPathWithGlow(ctx, br.path, bolt.baseWidth * br.widthMultiplier, alpha * 0.8);
        }
      }

      // 3. Render Shockwave Sparks
      for (let i = this.shockSparks.length - 1; i >= 0; i--) {
        const s = this.shockSparks[i];
        s.life++;

        if (s.life >= s.maxLife) {
          this.shockSparks.splice(i, 1);
          continue;
        }

        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94; // Deceleration
        s.vy *= 0.94;

        const sProgress = s.life / s.maxLife;
        const sAlpha = 1 - sProgress;

        ctx.fillStyle = this.colors.spark + (sAlpha * 0.95) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * (1 - sProgress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawPathWithGlow(ctx, path, strokeWidth, alpha) {
      if (!path || path.length < 2) return;

      // Pass 1: Massive Volumetric Outer Plasma Glow (Atmospheric Halo)
      ctx.strokeStyle = this.colors.outer + (alpha * 0.45) + ')';
      ctx.lineWidth = strokeWidth * 5.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'bevel';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Pass 2: High-Density Plasma Beam
      ctx.strokeStyle = this.colors.glow + (alpha * 0.85) + ')';
      ctx.lineWidth = strokeWidth * 2.4;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Pass 3: Searing White High-Voltage Core Beam
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.98})`;
      ctx.lineWidth = Math.max(1, strokeWidth * 0.9);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
  }

  function initBillionDollarThunder() {
    new ThunderSimulator('canvas-flame-bull', 'bull');
    new ThunderSimulator('canvas-flame-bear', 'bear');
    new ThunderSimulator('canvas-arena-bull', 'bull');
    new ThunderSimulator('canvas-arena-bear', 'bear');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBillionDollarThunder);
  } else {
    initBillionDollarThunder();
  }

  window.initBoBLightning = initBillionDollarThunder;
})();
