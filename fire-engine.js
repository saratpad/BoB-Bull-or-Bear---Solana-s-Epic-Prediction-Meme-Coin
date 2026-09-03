/**
 * BoB — Layered Thunder & Fire Embers Engine
 * 1. EmbersSimulator: Floating embers & backlight aura strictly BEHIND the letters.
 * 2. FrontLightningSimulator: Heavy cinematic thunder strikes STRICTLY IN FRONT of the letters.
 * Designed for Tier-1 Web3 & AAA GameFi titles.
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     1. BACKGROUND LAYER: FLOATING FIRE EMBERS & HALO
     ═══════════════════════════════════════════════════ */
  class EmbersSimulator {
    constructor(canvasId, type = 'bull') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.type = type;
      this.embers = [];
      this.maxEmbers = 32;
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isRunning = false;
      this.animId = null;
      this.time = 0;

      if (this.type === 'bull') {
        this.colors = {
          glowCore: 'rgba(0, 255, 136, ',
          glowOuter: 'rgba(16, 185, 129, ',
          emberColors: [
            'rgba(0, 255, 136, ',
            'rgba(52, 211, 153, ',
            'rgba(167, 243, 208, ',
            'rgba(163, 230, 53, '
          ]
        };
      } else {
        this.colors = {
          glowCore: 'rgba(255, 51, 68, ',
          glowOuter: 'rgba(220, 38, 38, ',
          emberColors: [
            'rgba(255, 60, 40, ',
            'rgba(255, 120, 20, ',
            'rgba(255, 190, 40, ',
            'rgba(254, 202, 202, '
          ]
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

      for (let i = 0; i < this.maxEmbers; i++) {
        this.embers.push(this.createEmber(true));
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

    createEmber(randomInitialY = false) {
      const w = this.width || 80;
      const h = this.height || 100;
      const colIdx = Math.floor(Math.random() * this.colors.emberColors.length);

      return {
        x: w * 0.12 + Math.random() * (w * 0.76),
        y: randomInitialY ? Math.random() * h : h * 0.85 + Math.random() * (h * 0.2),
        vx: (Math.random() - 0.5) * 0.65,
        vy: -(0.55 + Math.random() * 1.3),
        radius: 0.8 + Math.random() * 2.0,
        life: randomInitialY ? Math.random() * 70 : 0,
        maxLife: 60 + Math.random() * 60,
        colorPrefix: this.colors.emberColors[colIdx],
        flickerSpeed: 0.08 + Math.random() * 0.1,
        seed: Math.random() * 100
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

      this.time += 0.05;
      ctx.clearRect(0, 0, this.width, this.height);

      const cx = this.width * 0.5;
      const cy = this.height * 0.52;

      // Soft ambient backlight halo behind the letter
      ctx.globalCompositeOperation = 'screen';
      const breathe = Math.sin(this.time * 1.5) * 0.08;
      const auraRadius = (this.width * 0.42) * (1 + breathe);
      const auraGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, auraRadius);
      auraGrad.addColorStop(0, this.colors.glowCore + (0.24 + breathe) + ')');
      auraGrad.addColorStop(0.5, this.colors.glowOuter + (0.1 + breathe * 0.5) + ')');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rising fire embers behind the letter
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < this.embers.length; i++) {
        const em = this.embers[i];
        em.life++;

        if (em.life >= em.maxLife || em.y < -10) {
          this.embers[i] = this.createEmber(false);
          continue;
        }

        em.x += em.vx + Math.sin(this.time + em.seed) * 0.45;
        em.y += em.vy;

        const progress = em.life / em.maxLife;
        const alpha = Math.sin(progress * Math.PI) * (0.75 + Math.sin(em.life * em.flickerSpeed) * 0.25);

        if (alpha > 0.02) {
          ctx.fillStyle = em.colorPrefix + Math.max(0, alpha) + ')';
          ctx.beginPath();
          ctx.arc(em.x, em.y, em.radius, 0, Math.PI * 2);
          ctx.fill();

          if (em.radius > 1.4 && alpha > 0.4) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(em.x, em.y, em.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     2. FOREGROUND LAYER: HEAVY THUNDERBOLT STRIKES
     ═══════════════════════════════════════════════════ */
  class FrontLightningSimulator {
    constructor(canvasId, type = 'bull') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.type = type;
      this.activeBolts = [];
      this.shockSparks = [];
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isRunning = false;
      this.animId = null;

      // Strike interval (Staggered between Bull and Bear)
      const initialDelay = this.type === 'bull' ? 45 : 110;
      this.cooldown = initialDelay;
      this.minInterval = 110; // ~1.8s
      this.maxInterval = 190; // ~3.2s

      if (this.type === 'bull') {
        this.colors = {
          outer: 'rgba(0, 255, 136, ',
          glow: 'rgba(52, 211, 153, ',
          core: '#ffffff',
          sparkCore: '#a7f3d0'
        };
      } else {
        this.colors = {
          outer: 'rgba(255, 40, 60, ',
          glow: 'rgba(255, 100, 20, ',
          core: '#ffffff',
          sparkCore: '#fed7aa'
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

    triggerThunderStrike() {
      const w = this.width || 80;
      const h = this.height || 100;
      const cx = w * 0.5;
      const cy = h * 0.5;

      // Heavy main bolt striking right across the letter face
      const startAngle = Math.PI * (0.8 + Math.random() * 0.5);
      const endAngle = startAngle + Math.PI * (0.7 + Math.random() * 0.6);

      const x1 = cx + Math.cos(startAngle) * (w * 0.46);
      const y1 = cy + Math.sin(startAngle) * (h * 0.48);
      const x2 = cx + Math.cos(endAngle) * (w * 0.44);
      const y2 = cy + Math.sin(endAngle) * (h * 0.46);

      const mainPath = this.createBranch(x1, y1, x2, y2, 28, 5);

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

      // Explosion of high-voltage shock sparks at strike impact
      for (let i = 0; i < 18; i++) {
        const spAngle = Math.random() * Math.PI * 2;
        const spSpeed = 1.8 + Math.random() * 5.0;
        this.shockSparks.push({
          x: x2,
          y: y2,
          vx: Math.cos(spAngle) * spSpeed,
          vy: Math.sin(spAngle) * spSpeed,
          life: 0,
          maxLife: 22 + Math.random() * 16,
          radius: 1.2 + Math.random() * 2.2
        });
      }

      this.activeBolts.push({
        mainPath: mainPath,
        branches: subBranches,
        life: 0,
        maxLife: 16,
        baseWidth: 3.2 + Math.random() * 1.8
      });
    }

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

      this.cooldown--;
      if (this.cooldown <= 0) {
        this.triggerThunderStrike();
        this.cooldown = this.minInterval + Math.floor(Math.random() * (this.maxInterval - this.minInterval));
      } else if (this.cooldown % 35 === 0 && Math.random() > 0.6) {
        this.triggerMicroSpark();
      }

      // Render thunderbolts in front of letters
      for (let i = this.activeBolts.length - 1; i >= 0; i--) {
        const bolt = this.activeBolts[i];
        bolt.life++;

        if (bolt.life >= bolt.maxLife) {
          this.activeBolts.splice(i, 1);
          continue;
        }

        const progress = bolt.life / bolt.maxLife;
        const alpha = Math.pow(1 - progress, 1.6);

        this.drawPathWithGlow(ctx, bolt.mainPath, bolt.baseWidth, alpha);

        for (let j = 0; j < bolt.branches.length; j++) {
          const br = bolt.branches[j];
          this.drawPathWithGlow(ctx, br.path, bolt.baseWidth * br.widthMultiplier, alpha * 0.8);
        }
      }

      // Render shockwave sparks in front
      for (let i = this.shockSparks.length - 1; i >= 0; i--) {
        const s = this.shockSparks[i];
        s.life++;

        if (s.life >= s.maxLife) {
          this.shockSparks.splice(i, 1);
          continue;
        }

        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.93;
        s.vy *= 0.93;

        const sProgress = s.life / s.maxLife;
        const sAlpha = 1 - sProgress;

        ctx.strokeStyle = this.colors.sparkCore;
        ctx.lineWidth = Math.max(1, s.radius * sAlpha);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 1.8, s.y - s.vy * 1.8);
        ctx.stroke();

        ctx.fillStyle = this.colors.outer + (sAlpha * 0.9) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * (1 - sProgress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawPathWithGlow(ctx, path, strokeWidth, alpha) {
      if (!path || path.length < 2) return;

      // Pass 1: Outer Plasma Glow
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

      // Pass 2: Dense Core Glow
      ctx.strokeStyle = this.colors.glow + (alpha * 0.85) + ')';
      ctx.lineWidth = strokeWidth * 2.4;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Pass 3: High-Voltage White Core
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

  /* ═══════════════════════════════════════════════════
     INITIALIZE ALL BACK (EMBERS) & FRONT (LIGHTNING)
     ═══════════════════════════════════════════════════ */
  function initBoBEngines() {
    // 1. Embers (Behind letters)
    new EmbersSimulator('canvas-flame-bull', 'bull');
    new EmbersSimulator('canvas-flame-bear', 'bear');
    new EmbersSimulator('canvas-arena-bull', 'bull');
    new EmbersSimulator('canvas-arena-bear', 'bear');

    // 2. Heavy Thunderbolts (In front of letters)
    new FrontLightningSimulator('canvas-lightning-bull', 'bull');
    new FrontLightningSimulator('canvas-lightning-bear', 'bear');
    new FrontLightningSimulator('canvas-lightning-arena-bull', 'bull');
    new FrontLightningSimulator('canvas-lightning-arena-bear', 'bear');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBoBEngines);
  } else {
    initBoBEngines();
  }

  window.initBoBLightning = initBoBEngines;
})();
