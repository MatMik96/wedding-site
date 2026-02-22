function startPetals() {
  const hero = document.querySelector(".hero");
  const footer = document.querySelector("footer");
  const container = document.getElementById("petal-container");

  if (!hero || !footer || !container) return;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createPetal() {
    const petal = document.createElement("div");
    petal.classList.add("petal");

    const startY = hero.offsetTop + hero.offsetHeight;
    const footerTop = footer.offsetTop;

    let x = rand(20, window.innerWidth - 40);
    let y = startY;

    const fallSpeed = rand(30, 50); // px per second

    // Wind properties
    const driftAmplitude = rand(5, 15); // horizontal sway width
    const driftFrequency = rand(0.5, 1.2); // sway speed

    // Rotation properties
    let rotation = rand(0, 360);
    const rotationSpeed = rand(-40, 40); // degrees per second

    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.opacity = rand(0.7, 0.9);

    container.appendChild(petal);

    let startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      // Vertical fall
      y = startY + fallSpeed * elapsed;

      // Horizontal wind drift (sinusoidal sway)
      const drift = Math.sin(elapsed * driftFrequency * Math.PI * 2) * driftAmplitude;

      // Rotation
      rotation += rotationSpeed * (1 / 60);

      petal.style.top = `${y}px`;
      petal.style.left = `${x + drift}px`;
      petal.style.transform = `rotate(${rotation}deg)`;

      if (y >= footerTop - 40) {
        petal.remove();
        return;
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  /* ---------- Responsive Spawn Rate ---------- */

  const baseWidth = 1400;
  const baseInterval = 800;

  const widthFactor = window.innerWidth / baseWidth;
  const interval = baseInterval / Math.max(0.5, widthFactor);

  setInterval(createPetal, interval);
}

/* Run after components load */
window.addEventListener("componentsLoaded", startPetals);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(startPetals, 400);
});