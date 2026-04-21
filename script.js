document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice =
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  /* =========================
     NAV TOGGLE
  ========================= */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("[data-nav-panel]");
  const navItems = document.querySelectorAll(".nav-links a");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navItems.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================
     REVEAL ON SCROLL
  ========================= */
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0) rotateX(0)";
          entry.target.style.transition = "opacity 0.8s cubic-bezier(.2,.8,.2,1), transform 0.8s cubic-bezier(.2,.8,.2,1)";

          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  /* =========================
     GLITCH TEXT
  ========================= */
  const glitchTargets = document.querySelectorAll("[data-glitch]");

  function scrambleText(el, duration = 900) {
    const original = el.dataset.glitch || el.textContent;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/[]{}+=-*#@!?";
    const start = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const revealCount = Math.floor(original.length * progress);

      const next = original
        .split("")
        .map((char, index) => {
          if (char === " " || char === "\n" || index < revealCount) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      el.textContent = next;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = original;
      }
    };

    requestAnimationFrame(frame);
  }

  if (!prefersReducedMotion) {
    glitchTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => scrambleText(el, 700));
    });

    setInterval(() => {
      const target = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
      if (target) scrambleText(target, 750);
    }, 5200);
  }

  /* =========================
     MOUSE PARALLAX / 3D DEPTH
  ========================= */
  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector(".hero-visual");
  const heroCopy = document.querySelector(".hero-copy");
  const floatingShapes = document.querySelectorAll(".floating-shape");
  const bgGlows = document.querySelectorAll(".bg-glow");

  let mouseX = 0;
  let mouseY = 0;
  let ticking = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function applyParallax() {
    ticking = false;

    const x = (mouseX / window.innerWidth - 0.5) * 2;
    const y = (mouseY / window.innerHeight - 0.5) * 2;

    if (heroVisual) {
      heroVisual.style.transform = `
        translateY(-6px)
        rotateY(${clamp(x * 9, -10, 10)}deg)
        rotateX(${clamp(-y * 7, -8, 8)}deg)
        translateZ(18px)
      `;
    }

    if (heroCopy) {
      heroCopy.style.transform = `
        translate3d(${clamp(x * 8, -10, 10)}px, ${clamp(y * 6, -8, 8)}px, 0)
      `;
    }

    floatingShapes.forEach((shape, index) => {
      const depth = (index + 1) * 10;
      shape.style.transform = `
        translate3d(${clamp(x * depth * 0.8, -22, 22)}px, ${clamp(y * depth * 0.8, -22, 22)}px, ${depth}px)
        rotate(${index % 2 === 0 ? 18 : -14}deg)
      `;
    });

    bgGlows.forEach((glow, index) => {
      const factor = (index + 1) * 8;
      glow.style.transform = `translate3d(${x * factor}px, ${y * factor}px, -100px) scale(1.02)`;
    });

    root.style.setProperty("--mx", `${mouseX}px`);
    root.style.setProperty("--my", `${mouseY}px`);
  }

  if (!prefersReducedMotion && !isTouchDevice) {
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyParallax);
      }
    });
  }

  /* =========================
     MAGNETIC BUTTON / CARD FEEL
  ========================= */
  const magneticItems = document.querySelectorAll(".button, .nav-cta, .panel, .metric-card");

  magneticItems.forEach((item) => {
    if (isTouchDevice) return;

    let rect;

    const onMove = (e) => {
      rect = rect || item.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);

      const moveX = clamp(dx * 0.12, -14, 14);
      const moveY = clamp(dy * 0.12, -14, 14);

      item.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    };

    const onLeave = () => {
      rect = null;
      item.style.transform = "";
    };

    item.addEventListener("mousemove", onMove);
    item.addEventListener("mouseleave", onLeave);
  });

  /* =========================
     CLICK PULSE / BRUTAL FEEDBACK
  ========================= */
  const clickables = document.querySelectorAll(".button, .nav-cta, .project-link, .contact-links a");

  clickables.forEach((el) => {
    el.addEventListener("click", () => {
      el.animate(
        [
          { transform: "scale(1) rotate(0deg)" },
          { transform: "scale(0.96) rotate(-1deg)" },
          { transform: "scale(1) rotate(0deg)" }
        ],
        {
          duration: 180,
          easing: "cubic-bezier(.2,.8,.2,1)"
        }
      );
    });
  });

  /* =========================
     TERMINAL TYPE EFFECT
  ========================= */
  const terminalBody = document.querySelector(".terminal-body");

  if (terminalBody && !prefersReducedMotion) {
    const lines = Array.from(terminalBody.querySelectorAll("p")).map((p) => p.textContent);
    terminalBody.innerHTML = "";

    const lineEls = lines.map(() => {
      const p = document.createElement("p");
      p.style.opacity = "0";
      p.style.transform = "translateY(8px)";
      terminalBody.appendChild(p);
      return p;
    });

    let lineIndex = 0;

    const typeLine = (el, text) => {
      return new Promise((resolve) => {
        let i = 0;
        el.style.opacity = "1";

        const timer = setInterval(() => {
          el.textContent = text.slice(0, i + 1);
          i += 1;

          if (i >= text.length) {
            clearInterval(timer);
            el.style.transform = "translateY(0)";
            resolve();
          }
        }, 18);
      });
    };

    (async () => {
      for (const text of lines) {
        await typeLine(lineEls[lineIndex], text);
        lineIndex += 1;
        await new Promise((r) => setTimeout(r, 90));
      }
    })();
  }

  /* =========================
     SECTION ACTIVE STATE
  ========================= */
  const sections = document.querySelectorAll("section[id]");
  const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if ("IntersectionObserver" in window && sectionLinks.length) {
    const sectionMap = new Map(
      Array.from(sectionLinks).map((link) => [link.getAttribute("href").slice(1), link])
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;
          sectionLinks.forEach((link) => link.classList.remove("is-active"));

          const activeLink = sectionMap.get(id);
          if (activeLink) activeLink.classList.add("is-active");
        });
      },
      { threshold: 0.45 }
    );

    sections.forEach((section) => activeObserver.observe(section));
  }

  /* =========================
     SCROLL PROGRESS BAR
  ========================= */
  const progress = document.createElement("div");
  progress.style.position = "fixed";
  progress.style.left = "0";
  progress.style.top = "0";
  progress.style.height = "3px";
  progress.style.width = "0%";
  progress.style.zIndex = "9999";
  progress.style.background = "linear-gradient(90deg, #00f5ff, #ff2bd6, #a3ff12)";
  progress.style.boxShadow = "0 0 16px rgba(0,245,255,0.45)";
  progress.style.transformOrigin = "left center";
  document.body.appendChild(progress);

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = `${pct}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* =========================
     FOOTER YEAR
  ========================= */
  const footer = document.querySelector(".site-footer p");
  if (footer) {
    footer.innerHTML = footer.innerHTML.replace("2026", String(new Date().getFullYear()));
  }

  /* =========================
     INITIAL VIEWPORT TWEAK
  ========================= */
  if (!prefersReducedMotion) {
    setTimeout(() => {
      document.body.classList.add("is-ready");
    }, 50);
  }
});