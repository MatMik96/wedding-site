// ===============================
// Dynamic Includes Loader
// ===============================
async function loadIncludes() {
  const includeElements = document.querySelectorAll("[data-include]");

  const promises = Array.from(includeElements).map(async (el) => {
    const name = el.dataset.include;

    // Determine path
    let path;

    if (name === "header" || name === "footer") {
      path = `/components/${name}.html`;
    } else {
      path = `/partials/${name}.html`;
    }

    try {
      const html = await fetch(path).then(r => {
        if (!r.ok) throw new Error(`Failed to load ${path}`);
        return r.text();
      });

      el.innerHTML = html;
    } catch (err) {
      console.error(err);
      el.innerHTML = `<!-- Failed to load ${name} -->`;
    }
  });

  await Promise.all(promises);
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

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  });

  // Fade in on load
  document.body.style.opacity = "0";

  requestAnimationFrame(() => {
    document.body.style.transition = "opacity 0.3s ease";
    document.body.style.opacity = "1";
  });
}

// ===============================
// Reveal On Scroll
// ===============================
function setupRevealOnScroll() {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
}

// ===============================
// Init Sequence
// ===============================
loadIncludes().then(() => {
  setupTransitions();
  setupRevealOnScroll();

  // Notify other scripts (petals, etc.)
  window.dispatchEvent(new Event("componentsLoaded"));
});

document.addEventListener("DOMContentLoaded", setupRevealOnScroll);