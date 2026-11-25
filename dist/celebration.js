"use strict";

(() => {
  const balloonColours = [
    ["#ffeded", "#eea6b9", "#c27390"],
    ["#f6eaff", "#caa9d5", "#9275aa"],
    ["#fff1df", "#efb199", "#c17d78"],
    ["#edf9ff", "#a4c9db", "#7599ae"]
  ];
  const sparkColours = ["#b95582", "#d88953", "#b68a39", "#8e76b3", "#648fa9", "#ba7294"];
  const turn = Math.PI * 2;
  const between = (low, high) => low + Math.random() * (high - low);
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  let dispose = null;

  window.startWelcomeCelebration = () => {
    if (dispose || !document.body) return;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.dataset.welcomeCelebration = "";
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    document.body.appendChild(canvas);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const balloons = [];
    const bursts = [];
    const protectedElements = document.querySelectorAll(".wordmark,.music-switch,.picture-window,.words,.page-progress,footer p");
    let protectedRects = [];
    let width = 0;
    let height = 0;
    let narrow = false;
    let time = 0;
    let lastFrame = 0;
    let frame = 0;
    let nextBurst = 1.7;
    let burstNumber = 0;

    // Fade the decorations as they approach the letter, even as mobile type wraps.
    function clearance(x, y, margin) {
      let opacity = 1;
      for (const rect of protectedRects) {
        const dx = Math.max(rect.left - x, 0, x - rect.right);
        const dy = Math.max(rect.top - y, 0, y - rect.bottom);
        opacity = Math.min(opacity, (dx * dx + dy * dy) / (margin * margin));
      }
      return Math.min(1, opacity);
    }

    function newBalloon(index, y) {
      const side = index % 2 === 0 ? 1 : -1;
      const radius = narrow ? between(12, 18) : between(20, 33);
      const inset = narrow ? between(.023, .064) : between(.024, .105);
      return {
        x: side === 1 ? inset * width : (1 - inset) * width,
        y, radius, colour: balloonColours[index % balloonColours.length],
        speed: between(19, 34), phase: between(0, turn),
        sway: between(3, narrow ? 6 : 13), side
      };
    }

    function glint(x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.quadraticCurveTo(x + size * .13, y - size * .15, x + size * .67, y);
      ctx.quadraticCurveTo(x + size * .13, y + size * .15, x, y + size);
      ctx.quadraticCurveTo(x - size * .13, y + size * .15, x - size * .67, y);
      ctx.quadraticCurveTo(x - size * .13, y - size * .15, x, y - size);
      ctx.fill();
    }

    function drawBalloon(b) {
      const phase = b.phase + time * .72;
      const x = b.x + Math.sin(phase) * b.sway;
      const alpha = clearance(x, b.y, b.radius * 1.6);
      if (alpha < .015) return;
      const [light, base, dark] = b.colour;
      ctx.save();
      ctx.globalAlpha = .91 * alpha;
      ctx.translate(x, b.y);
      ctx.rotate(.1 * Math.sin(phase));
      ctx.scale(b.radius, b.radius);

      const curl = .16 * Math.cos(phase);
      ctx.lineWidth = .044;
      ctx.strokeStyle = dark;
      ctx.beginPath();
      ctx.moveTo(0, 1.24);
      ctx.bezierCurveTo(.04 + curl, 1.61, -.48 + curl, 1.89, -.20 + curl, 2.16);
      ctx.bezierCurveTo(.13 + curl, 2.44, .32 + curl, 2.06, .07 + curl, 2.10);
      ctx.bezierCurveTo(-.22 + curl, 2.18, -.13 + curl, 2.65, .22 + curl, 2.95);
      ctx.stroke();

      const fill = ctx.createRadialGradient(-.43, -.63, .04, .08, -.07, 1.6);
      fill.addColorStop(0, light);
      fill.addColorStop(.51, base);
      fill.addColorStop(1, dark);
      ctx.fillStyle = fill;
      ctx.lineWidth = .032;
      ctx.beginPath();
      ctx.moveTo(0, 1.22);
      ctx.bezierCurveTo(-.36, 1.08, -1.04, .48, -.98, -.37);
      ctx.bezierCurveTo(-.94, -1.56, .91, -1.58, 1, -.39);
      ctx.bezierCurveTo(1.06, .34, .50, 1.01, 0, 1.22);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 1.14);
      ctx.lineTo(-.12, 1.36);
      ctx.quadraticCurveTo(0, 1.42, .13, 1.34);
      ctx.closePath();
      ctx.fillStyle = dark;
      ctx.fill();

      ctx.fillStyle = "#ffffffb8";
      ctx.beginPath();
      ctx.ellipse(-.47, -.55, .105, .30, .55, 0, turn);
      ctx.fill();
      ctx.fillStyle = "#fffcf1ce";
      glint(.32, -.67, .105);
      ctx.restore();
    }

    function makeBurst(age = 0) {
      const index = burstNumber++;
      const side = index % 2;
      const inset = narrow ? between(.07, .19) : between(.09, .27);
      const radius = narrow ? between(31, 51) : between(47, 78);
      const x = width * (side ? 1 - inset : inset);
      const y = height * (index % 3 === 2 ? between(.33, .53) : between(.10, .21));
      const rays = [];
      const count = narrow ? 15 : 24;
      const start = between(0, turn);
      for (let i = 0; i < count; i++) {
        const theta = start + turn * i / count + between(-.047, .047);
        const length = radius * between(.55, 1.08);
        rays.push({
          dx: Math.cos(theta) * length, dy: Math.sin(theta) * length,
          colour: sparkColours[(index + i % 3) % sparkColours.length],
          sparkle: i % 4 === 0
        });
      }
      return { x, y, age, rays, duration: between(1.6, 2.0) };
    }

    function drawBurst(burst) {
      const t = Math.min(1, burst.age / burst.duration);
      const head = 1 - (1 - t) ** 3;
      const tail = 1 - (1 - Math.max(0, t - .18)) ** 3;
      const fade = Math.min(1, t * 16, (1 - t) * 2.2);
      const drop = 23 * t * t;
      ctx.save();
      ctx.lineCap = "round";
      for (const ray of burst.rays) {
        const x = burst.x + ray.dx * head;
        const y = burst.y + ray.dy * head + drop;
        const alpha = fade * clearance(x, y, 13);
        if (alpha < .02) continue;
        ctx.globalAlpha = alpha * .88;
        ctx.lineWidth = narrow ? 1.25 : 1.55;
        ctx.strokeStyle = ray.colour;
        ctx.beginPath();
        ctx.moveTo(burst.x + ray.dx * tail, burst.y + ray.dy * tail + drop * .74);
        ctx.quadraticCurveTo(x - ray.dx * (head - tail) * .38, y - drop * .18, x, y);
        ctx.stroke();
        if (ray.sparkle && t > .33) {
          ctx.fillStyle = ray.colour;
          glint(x, y, (narrow ? 2.6 : 3.3) * (1 - t * .53));
        }
      }
      ctx.restore();
    }

    function paint() {
      ctx.clearRect(0, 0, width, height);
      bursts.forEach(drawBurst);
      balloons.forEach(drawBalloon);
    }

    function tick(now) {
      frame = 0;
      if (document.hidden || motion.matches) return;
      if (!lastFrame || now - lastFrame >= 27) {
        const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .08) : 0;
        lastFrame = now;
        time += dt;
        for (let i = 0; i < balloons.length; i++) {
          const b = balloons[i];
          b.y -= dt * b.speed;
          if (b.y < -b.radius * 3.2) balloons[i] = newBalloon(i, height + b.radius * 1.5);
        }
        for (let i = bursts.length - 1; i >= 0; i--) {
          bursts[i].age += dt;
          if (bursts[i].age > bursts[i].duration) bursts.splice(i, 1);
        }
        if (time >= nextBurst) {
          if (bursts.length < 3) bursts.push(makeBurst());
          nextBurst = time + between(1.1, 2.2);
        }
        paint();
      }
      frame = requestAnimationFrame(tick);
    }

    function refreshMotion() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      if (document.hidden) return;
      paint();
      if (!motion.matches) frame = requestAnimationFrame(tick);
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, bounds.width);
      const nextHeight = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2, 2400 / Math.max(nextWidth, nextHeight));
      canvas.width = Math.ceil(nextWidth * dpr);
      canvas.height = Math.ceil(nextHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      protectedRects = Array.from(protectedElements, el => el.getBoundingClientRect());
      if (width !== nextWidth || height !== nextHeight) {
        width = nextWidth;
        height = nextHeight;
        narrow = width < 700;
        balloons.length = 0;
        const count = narrow ? 5 : 7;
        for (let i = 0; i < count; i++) {
          balloons.push(newBalloon(i, height * ((i + .55) / count)));
        }
        bursts.length = 0;
        bursts.push(makeBurst(.58), makeBurst(.49));
      }
      refreshMotion();
    }

    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    protectedElements.forEach(el => observer?.observe(el));
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", refreshMotion);
    motion.addEventListener("change", refreshMotion);
    dispose = () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", refreshMotion);
      motion.removeEventListener("change", refreshMotion);
      canvas.remove();
    };
    resize();
  };

  window.stopWelcomeCelebration = () => {
    if (dispose) dispose();
    dispose = null;
  };
})();
