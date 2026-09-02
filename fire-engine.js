/**
 * BoB — High-Voltage Electric Lightning Engine
 * Procedural electric lightning simulation for Web3 Hero & Arena titles.
 * Renders emerald lightning bolts around the Bull B and crimson lightning bolts around the Bear B.
 */

(function () {
  'use strict';

  class LightningSimulator {
    constructor(canvasId, type = 'bull') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.type = type; // 'bull' (green lightning) or 'bear' (red lightning)
      this.bolts = [];
      this.sparks = [];
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isRunning = false;
      this.animId = null;
      this.frame = 0;

      // Color Palettes
      if (this.type === 'bull') {
        this.colors = {
          outer: 'rgba(0, 255, 136, ',
          mid: 'rgba(52, 211, 153, ',
          core: '#ffffff',
          spark: 'rgba(110, 231, 183, '
        };
      } else {
        this.colors = {
          outer: 'rgba(255, 40, 60, ',
          mid: 'rgba(251, 113, 133, ',
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

    // Generate jagged lightning path with midpoint displacement
    generateLightning(x1, y1, x2, y2, displacement, iteration) {
      if (iteration <= 0) {
        return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      }

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;

      const left = this.generateLightning(x1, y1, midX, midY, displacement * 0.55, iteration - 1);
      const right = this.generateLightning(midX, midY, x2, y2, displacement * 0.55, iteration - 1);

      return left.slice(0, -1).concat(right);
    }

    // Trigger a lightning arc around the letter perimeter
    spawnBolt() {
      const w = this.width || 80;
      const h = this.height || 100;

      // Define letter bounding box center & spread
      const cx = w * 0.5;
      const cy = h * 0.5;
      const rx = w * 0.35;
      const ry = h * 0.42;

      // Pick two angles on the perimeter of the letter
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + (Math.PI * 0.4 + Math.random() * Math.PI * 0.8);

      const x1 = cx + Math.cos(angle1) * rx;
      const y1 = cy + Math.sin(angle1) * ry;
      const x2 = cx + Math.cos(angle2) * rx;
      const y2 = cy + Math.sin(angle2) * ry;

      const path = this.generateLightning(x1, y1, x2, y2, 22, 4);

      // Create branch bolt
      let branch = null;
      if (Math.random() > 0.35 && path.length > 4) {
        const branchStart = path[Math.floor(path.length * 0.5)];
        const branchEnd = {
          x: branchStart.x + (Math.random() - 0.5) * w * 0.45,
          y: branchStart.y + (Math.random() - 0.5) * h * 0.45
        };
        branch = this.generateLightning(branchStart.x, branchStart.y, branchEnd.x, branchEnd.y, 14, 3);
      }

      // Spawn electric sparks at strike ends
      for (let i = 0; i < 4; i++) {
        this.sparks.push({
          x: x2,
          y: y2,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 0,
          maxLife: 14 + Math.random() * 10,
          radius: 1 + Math.random() * 1.5
        });
      }

      return {
        path: path,
        branch: branch,
        life: 0,
        maxLife: 3 + Math.floor(Math.random() * 4), // Fast lightning strike flicker
        width: 1.5 + Math.random() * 1.5
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

      this.frame++;
      ctx.clearRect(0, 0, this.width, this.height);

      ctx.globalCompositeOperation = 'lighter';

      // 1. Spawning Lightning Bolts
      // Continuous electric crackle (1 to 2 bolts per burst)
      if (this.frame % 3 === 0 || this.bolts.length === 0) {
        if (Math.random() > 0.15) {
          this.bolts.push(this.spawnBolt());
        }
      }
      if (Math.random() > 0.65) {
        this.bolts.push(this.spawnBolt());
      }

      // 2. Render & Update Bolts
      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.life++;

        if (b.life >= b.maxLife) {
          this.bolts.splice(i, 1);
          continue;
        }

        const alpha = 1 - (b.life / b.maxLife);

        this.drawBolt(ctx, b.path, b.width, alpha);
        if (b.branch) {
          this.drawBolt(ctx, b.branch, b.width * 0.65, alpha * 0.85);
        }
      }

      // 3. Render & Update Electric Sparks
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        s.life++;

        if (s.life >= s.maxLife) {
          this.sparks.splice(i, 1);
          continue;
        }

        s.x += s.vx;
        s.y += s.vy;

        const sAlpha = 1 - (s.life / s.maxLife);
        ctx.fillStyle = this.colors.spark + (sAlpha * 0.9) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * sAlpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawBolt(ctx, path, strokeWidth, alpha) {
      if (!path || path.length < 2) return;

      // Pass 1: Wide Outer Neon Plasma Aura
      ctx.strokeStyle = this.colors.outer + (alpha * 0.5) + ')';
      ctx.lineWidth = strokeWidth * 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'bevel';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Pass 2: Vivid Mid Plasma
      ctx.strokeStyle = this.colors.mid + (alpha * 0.85) + ')';
      ctx.lineWidth = strokeWidth * 2;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Pass 3: White-Hot High Voltage Core
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.lineWidth = strokeWidth * 0.9;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
  }

  function initLightning() {
    new LightningSimulator('canvas-flame-bull', 'bull');
    new LightningSimulator('canvas-flame-bear', 'bear');
    new LightningSimulator('canvas-arena-bull', 'bull');
    new LightningSimulator('canvas-arena-bear', 'bear');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightning);
  } else {
    initLightning();
  }

  window.initBoBLightning = initLightning;
})();
