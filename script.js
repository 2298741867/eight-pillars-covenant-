const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setupStickyNav = () => {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  const onScroll = () => {
    topbar.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
};

const setupMobileMenu = () => {
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("is-open", !expanded);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
    });
  });
};

const setupPillarCards = () => {
  const cards = document.querySelectorAll(".pillar-card");
  cards.forEach((card) => {
    const button = card.querySelector(".toggle-detail");
    if (!button) return;

    button.addEventListener("click", () => {
      const expanded = card.classList.toggle("expanded");
      button.setAttribute("aria-expanded", String(expanded));
      button.textContent = expanded ? "Hide details" : "Read more";
    });
  });
};

const normalizePreview = (text) => {
  const firstLine = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine;
};

const readingStats = (text) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return { words, minutes };
};

const setupDocumentCards = async () => {
  const cards = document.querySelectorAll(".doc-card[data-doc]");

  await Promise.all(
    [...cards].map(async (card) => {
      const target = card.getAttribute("data-doc");
      const previewNode = card.querySelector("[data-preview]");
      const readingNode = card.querySelector(".reading-time");

      if (!target || !previewNode || !readingNode) return;

      try {
        const response = await fetch(target, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Could not load ${target}`);
        }
        const text = await response.text();
        const { words, minutes } = readingStats(text);
        previewNode.textContent = normalizePreview(text);
        previewNode.classList.remove("skeleton");
        readingNode.textContent = `${words.toLocaleString()} words · ~${minutes} min`;
      } catch (error) {
        previewNode.textContent = "Preview unavailable right now.";
        previewNode.classList.remove("skeleton");
        readingNode.textContent = "Reading estimate unavailable";
      }
    })
  );
};

const setupReveals = () => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
};

setupStickyNav();
setupMobileMenu();
setupPillarCards();
setupReveals();
setupDocumentCards();
