const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const previewCache = new Map();

const showToast = (message, variant = "success") => {
  const region = document.querySelector(".toast-region");
  if (!region) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${variant}`;
  const text = document.createElement("span");
  text.textContent = message;
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.textContent = "Dismiss";
  dismiss.setAttribute("aria-label", "Dismiss notification");
  dismiss.addEventListener("click", () => toast.remove());
  toast.append(text, dismiss);
  region.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 4200);
};

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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
    }
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.classList.contains("is-open")) return;
    if (event.target === toggle || toggle.contains(event.target) || navLinks.contains(event.target)) return;
    toggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
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
    const detail = card.querySelector(".pillar-detail");
    if (!button) return;
    if (detail) {
      const id = `pillar-detail-${Math.random().toString(36).slice(2, 10)}`;
      detail.id = id;
      detail.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-controls", id);
    }

    button.addEventListener("click", () => {
      const expanded = card.classList.toggle("expanded");
      button.setAttribute("aria-expanded", String(expanded));
      button.textContent = expanded ? "Hide details" : "Read more";
      if (detail) detail.setAttribute("aria-hidden", String(!expanded));
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

const fetchDocumentText = async (target) => {
  if (previewCache.has(target)) return previewCache.get(target);
  const response = await fetch(target, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load ${target}`);
  const text = await response.text();
  if (!text.trim()) throw new Error(`Empty document for ${target}`);
  previewCache.set(target, text);
  return text;
};

const clearRetryButton = (card) => {
  const existing = card.querySelector(".retry-preview");
  if (existing) existing.remove();
};

const addRetryButton = (card, onRetry) => {
  clearRetryButton(card);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "retry-preview";
  button.textContent = "Retry preview";
  button.addEventListener("click", onRetry);
  card.appendChild(button);
};

const loadDocumentCard = async (card) => {
  const target = card.getAttribute("data-doc");
  const previewNode = card.querySelector("[data-preview]");
  const readingNode = card.querySelector(".reading-time");
  if (!target || !previewNode || !readingNode) return;

  previewNode.classList.add("skeleton");
  previewNode.textContent = "Loading preview…";
  clearRetryButton(card);

  try {
    const text = await fetchDocumentText(target);
    const { words, minutes } = readingStats(text);
    previewNode.textContent = normalizePreview(text) || "Preview unavailable right now.";
    previewNode.classList.remove("skeleton");
    readingNode.textContent = `${words.toLocaleString()} words · ~${minutes} min`;
  } catch (error) {
    previewNode.textContent = "Preview unavailable right now.";
    previewNode.classList.remove("skeleton");
    readingNode.textContent = "Reading estimate unavailable";
    addRetryButton(card, () => loadDocumentCard(card));
    showToast("A document preview could not be loaded.", "error");
  }
};

const setupDocumentCards = async () => {
  const cards = document.querySelectorAll(".doc-card[data-doc]");
  await Promise.all([...cards].map((card) => loadDocumentCard(card)));
  showToast("Covenant library previewed.", "success");
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
