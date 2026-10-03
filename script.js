const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const mobileViewport = window.matchMedia("(max-width: 640px)");

function closeMenu(returnFocus = false) {
  if (!menuToggle || !navLinks) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navLinks.classList.remove("is-open");
  if (returnFocus) menuToggle.focus();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    navLinks.classList.toggle("is-open", !isExpanded);
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (menuToggle.getAttribute("aria-expanded") === "true" &&
        event.target instanceof Node &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") closeMenu(true);
  });

  mobileViewport.addEventListener("change", (event) => {
    if (!event.matches) closeMenu();
  });
}

const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
themeToggle?.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("theme-light");
  const label = isLight ? "Switch to dark theme" : "Switch to light theme";
  themeToggle.setAttribute("aria-label", label);
  themeToggle.title = label;
  themeToggle.firstElementChild.textContent = isLight ? "☾" : "☼";
  if (themeColor) themeColor.content = isLight ? "#f5f4f0" : "#080a0e";
});

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const profile = document.querySelector(".profile-figure");
const profilePhoto = profile?.querySelector(".profile-photo");
if (profile && profilePhoto) {
  profilePhoto.addEventListener("load", () => profile.classList.add("has-photo"));
  profilePhoto.addEventListener("error", () => profile.classList.remove("has-photo"));
  if (profilePhoto.complete && profilePhoto.naturalWidth > 0) profile.classList.add("has-photo");
}

const typing = document.querySelector(".typing");
const roles = ["Software Engineer", "Web Developer", "Problem Solver", "UI/UX Enthusiast"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (typing && !reduceMotion.matches) {
  let roleIndex = 0;
  let characterIndex = roles[0].length;
  let deleting = true;

  function typeRole() {
    const role = roles[roleIndex];
    typing.textContent = role.slice(0, characterIndex);

    if (deleting) {
      characterIndex -= 1;
      if (characterIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        characterIndex = 0;
      }
    } else {
      characterIndex += 1;
      if (characterIndex > roles[roleIndex].length) {
        characterIndex = roles[roleIndex].length;
        deleting = true;
        window.setTimeout(typeRole, 1450);
        return;
      }
    }

    window.setTimeout(typeRole, deleting ? 42 : 75);
  }

  window.setTimeout(typeRole, 1700);
}

const counterElements = [...document.querySelectorAll(".counter[data-target]")];
const formatCount = new Intl.NumberFormat();

function animateCounter(element) {
  const target = Number(element.dataset.target);
  if (!Number.isFinite(target) || target < 0) return;

  const startTime = performance.now();
  const duration = 1250;
  function updateCount(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - (1 - progress) ** 4;
    element.textContent = formatCount.format(Math.round(target * eased));
    if (progress < 1) window.requestAnimationFrame(updateCount);
  }
  window.requestAnimationFrame(updateCount);
}

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });
  counterElements.forEach((counter) => counterObserver.observe(counter));
}

document.querySelectorAll("[data-project-inquiry], [data-service-inquiry]").forEach((link) => {
  link.addEventListener("click", () => {
    const subject = link.dataset.projectInquiry || link.dataset.serviceInquiry;
    const message = document.querySelector("#message");
    if (subject && message) {
      message.value = `Hi Jonathan, I would like to discuss ${subject}.`;
      message.dispatchEvent(new Event("input", { bubbles: true }));
      window.setTimeout(() => message.focus({ preventScroll: true }), 0);
    }
  });
});

const contactForm = document.querySelector("#contact-form");
const continueToWhatsApp = document.querySelector(".whatsapp-continue");
const formStatus = document.querySelector("#form-status");

contactForm?.addEventListener("input", () => {
  if (continueToWhatsApp instanceof HTMLAnchorElement && !continueToWhatsApp.hidden) {
    continueToWhatsApp.hidden = true;
    continueToWhatsApp.removeAttribute("href");
    if (formStatus) formStatus.textContent = "Your details changed. Prepare the WhatsApp message again.";
  }
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!(contactForm instanceof HTMLFormElement) || !contactForm.reportValidity()) return;

  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const text = `Hello Jonathan,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const whatsappUrl = `https://wa.me/260773720056?text=${encodeURIComponent(text)}`;

  if (continueToWhatsApp instanceof HTMLAnchorElement) {
    continueToWhatsApp.href = whatsappUrl;
    continueToWhatsApp.hidden = false;
    continueToWhatsApp.focus();
  }
  if (formStatus) formStatus.textContent = "Your message is ready. Continue to WhatsApp to review and send it.";
});

const progressBar = document.querySelector(".scroll-progress span");
const backToTop = document.querySelector(".back-to-top");
let scrollFrame = 0;

function updateScrollUI() {
  scrollFrame = 0;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  if (backToTop) backToTop.hidden = window.scrollY < 600;
}

window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUI);
}, { passive: true });
window.addEventListener("resize", updateScrollUI);
updateScrollUI();

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
});

const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter((section) => section instanceof HTMLElement);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const currentHref = `#${entry.target.id}`;
      sectionLinks.forEach((link) => {
        if (link.getAttribute("href") === currentHref) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-25% 0px -65% 0px" });
  observedSections.forEach((section) => sectionObserver.observe(section));

  if (!reduceMotion.matches) {
    const revealTargets = document.querySelectorAll(".section-kicker, .about-copy, .profile-figure, .stat-card, .skill-card, .project-card, .service-card, .contact-copy, .contact-form");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    document.documentElement.classList.add("has-reveal");
    revealTargets.forEach((target) => {
      target.classList.add("reveal");
      revealObserver.observe(target);
    });
  }
}

const sphere = document.querySelector("#tech-sphere");
const sphereContext = sphere instanceof HTMLCanvasElement ? sphere.getContext("2d") : null;

if (sphere instanceof HTMLCanvasElement && sphereContext) {
  const points = [];
  const pointCount = 150;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < pointCount; index += 1) {
    const y = 1 - (index / (pointCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;
    points.push({ x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius });
  }

  const links = [];
  for (let first = 0; first < points.length; first += 1) {
    for (let second = first + 1; second < points.length; second += 1) {
      const dx = points[first].x - points[second].x;
      const dy = points[first].y - points[second].y;
      const dz = points[first].z - points[second].z;
      if (dx * dx + dy * dy + dz * dz < 0.095) links.push([first, second]);
    }
  }

  let canvasSize = 0;
  let deviceScale = 1;
  let rotation = 0;
  let animationFrame = 0;
  let sphereInView = false;

  function resizeSphere() {
    const bounds = sphere.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    deviceScale = Math.min(window.devicePixelRatio || 1, 2);
    canvasSize = Math.min(bounds.width, bounds.height);
    sphere.width = Math.round(canvasSize * deviceScale);
    sphere.height = Math.round(canvasSize * deviceScale);
    sphereContext.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    if (reduceMotion.matches) drawSphere();
  }

  function drawSphere() {
    if (!canvasSize) return;
    const center = canvasSize / 2;
    const globeRadius = center * 0.69;
    const perspective = canvasSize * 2.65;
    const tilt = -0.22;
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const projected = points.map((point) => {
      const rotatedX = point.x * cosine - point.z * sine;
      const rotatedZ = point.x * sine + point.z * cosine;
      const tiltedY = point.y * Math.cos(tilt) - rotatedZ * Math.sin(tilt);
      const tiltedZ = point.y * Math.sin(tilt) + rotatedZ * Math.cos(tilt);
      const scale = perspective / (perspective + tiltedZ * globeRadius);
      return {
        x: center + rotatedX * globeRadius * scale,
        y: center + tiltedY * globeRadius * scale,
        z: tiltedZ,
        scale
      };
    });

    sphereContext.clearRect(0, 0, canvasSize, canvasSize);
    sphereContext.save();
    sphereContext.shadowBlur = 9;
    sphereContext.shadowColor = "rgba(103, 202, 255, 0.14)";

    for (const [first, second] of links) {
      const from = projected[first];
      const to = projected[second];
      const depth = (from.z + to.z) / 2;
      if (depth < -0.46) continue;
      sphereContext.beginPath();
      sphereContext.moveTo(from.x, from.y);
      sphereContext.lineTo(to.x, to.y);
      sphereContext.strokeStyle = `rgba(103, 202, 255, ${0.08 + Math.max(0, depth) * 0.23})`;
      sphereContext.lineWidth = 0.65 + Math.max(0, depth) * 0.4;
      sphereContext.stroke();
    }

    projected.forEach((point, index) => {
      const depth = Math.max(0.14, (point.z + 1) / 2);
      const radius = (index % 13 === 0 ? 1.8 : 1.05) * point.scale;
      sphereContext.beginPath();
      sphereContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
      sphereContext.fillStyle = index % 13 === 0
        ? `rgba(242, 213, 121, ${0.55 + depth * 0.4})`
        : `rgba(112, 205, 255, ${0.24 + depth * 0.72})`;
      sphereContext.fill();
    });
    sphereContext.restore();
  }

  function animateSphere() {
    animationFrame = 0;
    drawSphere();
    if (sphereInView && !document.hidden && !reduceMotion.matches) {
      rotation += 0.003;
      animationFrame = window.requestAnimationFrame(animateSphere);
    }
  }

  function updateSphereAnimation() {
    if (sphereInView && !document.hidden && !reduceMotion.matches && !animationFrame) {
      animationFrame = window.requestAnimationFrame(animateSphere);
    } else if ((!sphereInView || document.hidden || reduceMotion.matches) && animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      drawSphere();
    }
  }

  if ("ResizeObserver" in window) new ResizeObserver(resizeSphere).observe(sphere);
  else window.addEventListener("resize", resizeSphere);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      sphereInView = entries.some((entry) => entry.isIntersecting);
      updateSphereAnimation();
    }).observe(sphere);
  } else {
    sphereInView = true;
  }
  document.addEventListener("visibilitychange", updateSphereAnimation);
  reduceMotion.addEventListener("change", updateSphereAnimation);
  resizeSphere();
  updateSphereAnimation();
}
