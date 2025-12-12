function startPetals() {
  const hero = document.querySelector(".hero");
  const footer = document.querySelector("footer");
  const petalContainer = document.getElementById("petal-container");

  if (!hero || !footer || !petalContainer) return;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createPetal() {
    const petal = document.createElement("div");
    petal.classList.add("petal");

    const spawnX = rand(20, window.innerWidth - 40);
    const heroBottom = hero.offsetHeight + 20;

    const footerRect = footer.getBoundingClientRect();
    const footerTopAbsolute = footerRect.top + window.scrollY;

    const viewportBottom = window.scrollY + window.innerHeight;
    const stopY = Math.min(footerTopAbsolute - 30, viewportBottom - 30);

    const fallDistance = Math.max(120, stopY - heroBottom);
    const fallDuration = rand(7000, 11000);

    petal.style.left = `${spawnX}px`;
    petal.style.top = `${heroBottom}px`;
    petal.style.opacity = "0.9";
    petal.style.transition = `top ${fallDuration}ms linear, opacity ${fallDuration}ms linear`;

    petalContainer.appendChild(petal);

    requestAnimationFrame(() => {
      petal.style.top = `${heroBottom + fallDistance}px`;
      petal.style.opacity = "0";
    });

    setTimeout(() => petal.remove(), fallDuration + 100);
  }

  // start spawning
  setInterval(createPetal, 500);
}

// Run after header/footer are injected
window.addEventListener("componentsLoaded", startPetals);

// Fallback: if you ever stop using includes, still start
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(startPetals, 400);
});
