// ===============================
// Dynamic Includes Loader (recursive)
// Supports:
//  - header/footer => /components/{name}.html
//  - everything else => /partials/{name}.html
// Also resolves nested includes (e.g. hero includes header)
// ===============================
async function loadIncludesRecursive(maxPasses = 6) {
  for (let pass = 0; pass < maxPasses; pass++) {
    const includeElements = Array.from(document.querySelectorAll("[data-include]"))
      // skip already-loaded nodes
      .filter((el) => !el.dataset.includeLoaded);

    if (!includeElements.length) return;

    await Promise.all(
      includeElements.map(async (el) => {
        const name = el.dataset.include;

        const path =
          name === "header" || name === "footer"
            ? `/components/${name}.html`
            : `/partials/${name}.html`;

        try {
          const res = await fetch(path, { cache: "no-store" });
          if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);

          el.innerHTML = await res.text();
          el.dataset.includeLoaded = "1";
        } catch (err) {
          console.error(err);
          el.innerHTML = `<!-- Failed to load ${name} -->`;
          el.dataset.includeLoaded = "1";
        }
      })
    );
  }

  console.warn("loadIncludesRecursive: max passes reached (nested includes may remain).");
}

// ===============================
// Page Transitions
// ===============================
function setupTransitions() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-nav]");
    if (!a) return;

    e.preventDefault();
    const url = a.getAttribute("href");

    document.body.style.transition = "opacity 0.3s ease";
    document.body.style.opacity = "0";
    setTimeout(() => (window.location.href = url), 300);
  });

  // Fade in on load
  document.body.style.opacity = "0";
  requestAnimationFrame(() => {
    document.body.style.transition = "opacity 0.3s ease";
    document.body.style.opacity = "1";
  });
}

// ===============================
// Reveal On Scroll (safe if unused)
// ===============================
function setupRevealOnScroll() {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  els.forEach((el) => io.observe(el));
}

// ===============================
// Init
// ===============================
(async () => {
  await loadIncludesRecursive();
  setupTransitions();
  setupRevealOnScroll();

  // Tell other scripts (gallery/petals/paws/etc.) that partials are injected
  window.dispatchEvent(new Event("componentsLoaded"));
})();