(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function makeCanvas(id, zIndex, opacity) {
    var old = document.getElementById(id);
    if (old && old.parentNode) {
      old.parentNode.removeChild(old);
    }

    var canvas = document.createElement("canvas");
    canvas.id = id;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = String(zIndex);
    canvas.style.margin = "0";
    canvas.style.padding = "0";
    canvas.style.border = "0";
    canvas.style.opacity = String(opacity);
    canvas.style.mixBlendMode = "screen";

    document.body.insertBefore(canvas, document.body.firstChild);
    return canvas;
  }

  function createAetherosShimmerHardReset() {
    var starCanvas = makeCanvas("aetheros-starfield", 0, 1);
    var shimmerCanvas = makeCanvas("aetheros-shimmer-layer", 1, 0.82);

    var starCtx = starCanvas.getContext("2d", { alpha: true });
    var shimmerCtx = shimmerCanvas.getContext("2d", { alpha: true });

    if (!starCtx || !shimmerCtx) return;

    var width = 0;
    var height = 0;
    var dpr = 1;
    var stars = [];
    var shimmerStars = [];
    var lastTime = 0;
    var running = true;

    var palette = [
      [255, 255, 255],
      [210, 248, 255],
      [128, 232, 255],
      [100, 176, 255],
      [188, 150, 255],
      [255, 226, 150]
    ];

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    function pick(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    function rgba(c, a) {
      return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    }

    function resizeCanvas(canvas, ctx) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    function resize() {
      width = window.innerWidth || document.documentElement.clientWidth || 1280;
      height = window.innerHeight || document.documentElement.clientHeight || 720;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      resizeCanvas(starCanvas, starCtx);
      resizeCanvas(shimmerCanvas, shimmerCtx);
      buildStars();
    }

    function buildStars() {
      stars = [];
      shimmerStars = [];

      var baseCount = Math.round((width * height) / 1050);
      baseCount = Math.max(750, Math.min(1200, baseCount));

      for (var i = 0; i < baseCount; i += 1) {
        var layerRoll = Math.random();
        var layer = layerRoll < 0.68 ? 0 : layerRoll < 0.93 ? 1 : 2;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: layer === 0 ? rand(0.32, 0.75) : layer === 1 ? rand(0.55, 1.10) : rand(0.80, 1.55),
          alpha: layer === 0 ? rand(0.16, 0.45) : layer === 1 ? rand(0.28, 0.68) : rand(0.42, 0.90),
          amp: layer === 0 ? rand(0.30, 0.55) : layer === 1 ? rand(0.40, 0.75) : rand(0.55, 0.95),
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.0022, 0.0085) * (layer + 1),
          driftX: rand(-0.006, 0.010) * (layer + 1),
          driftY: rand(0.002, 0.012) * (layer + 1),
          colour: pick(palette),
          flare: layer === 2 && Math.random() < 0.20,
          flareLength: rand(2.2, 5.2)
        });
      }

      var shimmerCount = Math.round((width * height) / 8500);
      shimmerCount = Math.max(90, Math.min(180, shimmerCount));

      for (var j = 0; j < shimmerCount; j += 1) {
        shimmerStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: rand(1.0, 2.2),
          alpha: rand(0.20, 0.75),
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.008, 0.030),
          colour: pick(palette),
          flareLength: rand(3.5, 8.0)
        });
      }

      window.AETHEROS_SHIMMER_HARD_RESET = {
        applied: true,
        generatedAt: new Date().toISOString(),
        starCount: stars.length,
        shimmerCount: shimmerStars.length,
        width: width,
        height: height,
        note: "Clean two-canvas shimmer reset. No reduced-motion bypass. No old AetherOS layers."
      };
    }

    function drawPoint(ctx, s, alpha) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = rgba(s.colour, 1);

      if (s.size < 0.72) {
        ctx.fillRect(s.x, s.y, 1, 1);
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawFlare(ctx, s, alpha, pulse) {
      var len = s.flareLength * (0.45 + pulse);
      ctx.globalAlpha = Math.min(0.90, alpha * 0.78);
      ctx.strokeStyle = rgba(s.colour, 1);
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(s.x - len, s.y);
      ctx.lineTo(s.x + len, s.y);
      ctx.moveTo(s.x, s.y - len);
      ctx.lineTo(s.x, s.y + len);
      ctx.stroke();
    }

    function draw(now) {
      if (!running) return;

      if (!lastTime) lastTime = now;
      var delta = Math.min(42, now - lastTime);
      lastTime = now;

      starCtx.clearRect(0, 0, width, height);
      shimmerCtx.clearRect(0, 0, width, height);

      starCtx.globalCompositeOperation = "source-over";
      shimmerCtx.globalCompositeOperation = "lighter";

      for (var i = 0; i < stars.length; i += 1) {
        var s = stars[i];

        s.phase += delta * s.speed;
        s.x += s.driftX * delta;
        s.y += s.driftY * delta;

        if (s.x < -8) s.x = width + 8;
        if (s.x > width + 8) s.x = -8;
        if (s.y < -8) s.y = height + 8;
        if (s.y > height + 8) s.y = -8;

        var pulse = (Math.sin(s.phase) + 1) * 0.5;
        var sparkle = (Math.sin(s.phase * 2.47 + 1.1) + 1) * 0.5;
        var alpha = s.alpha * (0.20 + pulse * s.amp + sparkle * 0.22);
        alpha = Math.max(0.03, Math.min(1, alpha));

        drawPoint(starCtx, s, alpha);

        if (s.flare && pulse > 0.68) {
          drawFlare(starCtx, s, alpha, pulse);
        }
      }

      for (var j = 0; j < shimmerStars.length; j += 1) {
        var q = shimmerStars[j];
        q.phase += delta * q.speed;

        var p = (Math.sin(q.phase) + 1) * 0.5;
        var quick = (Math.sin(q.phase * 5.0) + 1) * 0.5;
        var qa = q.alpha * (0.02 + p * 0.95 + quick * 0.28);
        qa = Math.max(0, Math.min(1, qa));

        if (qa > 0.10) {
          drawPoint(shimmerCtx, q, qa);
        }

        if (qa > 0.52) {
          drawFlare(shimmerCtx, q, qa, p);
        }
      }

      starCtx.globalAlpha = 1;
      shimmerCtx.globalAlpha = 1;
      window.requestAnimationFrame(draw);
    }

    function onVisibility() {
      running = !document.hidden;
      if (running) {
        lastTime = 0;
        window.requestAnimationFrame(draw);
      }
    }

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    window.requestAnimationFrame(draw);
  }

  function smoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = link.getAttribute("href");
        if (!id || id.length <= 1) return;
        var target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function revealOnScroll() {
    var targets = document.querySelectorAll("section, .card, .panel, .notice, .step, .division-card, [class*='card']");
    targets.forEach(function (el) {
      el.classList.add("aetheros-reveal");
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("aetheros-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("aetheros-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  ready(function () {
    createAetherosShimmerHardReset();
    smoothAnchorScroll();
    revealOnScroll();
    document.documentElement.classList.add("aetheros-shimmer-hard-reset-ready");
  });
})();
