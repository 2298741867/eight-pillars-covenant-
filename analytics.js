(function () {
  const config = window.NINE_PILLARS_CONFIG?.analytics || {};
  const dntEnabled =
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.msDoNotTrack === "1";
  const enabled = Boolean(config.enabled) && !dntEnabled;
  const scrollMilestones = [25, 50, 75, 100];
  const seenMilestones = new Set();
  const readingEstimates = new Map();
  const sessionStart = Date.now();
  let timeTracked = false;

  const postEvent = (name, props = {}) => {
    if (!enabled) return;

    if (config.provider === "plausible" && typeof window.plausible === "function") {
      window.plausible(name, { props });
      return;
    }

    const fathomCode = config.eventMap?.[name];
    if (config.provider === "fathom" && fathomCode && window.fathom?.trackEvent) {
      window.fathom.trackEvent(fathomCode, 0);
      return;
    }

    if (!config.apiHost || !navigator.sendBeacon) return;

    const payload = JSON.stringify({
      name,
      props,
      path: window.location.pathname,
      referrer: document.referrer || "",
      timestamp: new Date().toISOString(),
    });
    navigator.sendBeacon(`${config.apiHost.replace(/\/$/, "")}/api/event`, payload);
  };

  const loadScript = (src, attributes = {}) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      Object.entries(attributes).forEach(([key, value]) => {
        if (value) script.setAttribute(key, value);
      });
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

  const initializeProvider = async () => {
    if (!enabled) return;

    if (config.provider === "plausible" && config.domain) {
      window.plausible =
        window.plausible ||
        function () {
          (window.plausible.q = window.plausible.q || []).push(arguments);
        };
      await loadScript(config.scriptSrc || "https://plausible.io/js/script.js", {
        "data-domain": config.domain,
        "data-api": config.apiHost || "",
      }).catch(() => {});
      postEvent("Page View", { route: window.location.pathname });
      return;
    }

    if (config.provider === "fathom" && config.siteId) {
      await loadScript(config.scriptSrc || "https://cdn.usefathom.com/script.js", {
        "data-site": config.siteId,
        defer: "defer",
      }).catch(() => {});
      if (window.fathom?.trackPageview) window.fathom.trackPageview();
    }
  };

  const trackScrollDepth = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const depth = Math.round((window.scrollY / total) * 100);

    scrollMilestones.forEach((milestone) => {
      if (depth >= milestone && !seenMilestones.has(milestone)) {
        seenMilestones.add(milestone);
        postEvent("Scroll Depth", { milestone });
      }
    });
  };

  const trackTimeOnPage = (earlyExit = false) => {
    if (timeTracked) return;
    timeTracked = true;
    const seconds = Math.max(1, Math.round((Date.now() - sessionStart) / 1000));
    postEvent("Time On Page", { seconds });
    if (earlyExit && seconds < 30) {
      postEvent("Exit Intent", { seconds });
    }
  };

  document.addEventListener("pillarstatechange", (event) => {
    if (!event.detail?.expanded) return;
    postEvent("Pillar Expanded", { pillar: event.detail.pillar });
  });

  document.addEventListener("documentpreviewloaded", (event) => {
    if (!event.detail?.target) return;
    readingEstimates.set(event.detail.target, event.detail.minutes);
    postEvent("Reading Time Estimated", {
      document: event.detail.target,
      minutes: event.detail.minutes,
    });
  });

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      if (/\.md($|[?#])/i.test(href)) {
        postEvent("Document Opened", {
          document: href,
          readingMinutes: readingEstimates.get(href) || null,
        });
      }
    },
    true
  );

  window.addEventListener("scroll", trackScrollDepth, { passive: true });
  window.addEventListener("pagehide", () => trackTimeOnPage(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") trackTimeOnPage(true);
  });

  window.NinePillarsAnalytics = {
    enabled,
    provider: config.provider || "disabled",
    track: postEvent,
  };

  initializeProvider();
})();
