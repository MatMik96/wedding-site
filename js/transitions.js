async function loadIncludes() {
  const headerTarget = document.querySelector('[data-include="header"]');
  const footerTarget = document.querySelector('[data-include="footer"]');

  if (headerTarget) {
    const header = await fetch("/components/header.html").then(r => r.text());
    headerTarget.innerHTML = header;
  }
  if (footerTarget) {
    const footer = await fetch("/components/footer.html").then(r => r.text());
    footerTarget.innerHTML = footer;
  }
}

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

loadIncludes().then(() => {
  setupTransitions();
  window.dispatchEvent(new Event("componentsLoaded"));
});

// ----- Reveal on scroll -----
function setupRevealOnScroll() {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
}

window.addEventListener("componentsLoaded", setupRevealOnScroll);
document.addEventListener("DOMContentLoaded", setupRevealOnScroll);
