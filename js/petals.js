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

    // Sætter dem til 0,0, da vi nu flytter dem med 'transform' i stedet for 'top/left'
    petal.style.left = `0px`;
    petal.style.top = `0px`;
    petal.style.opacity = rand(0.7, 0.9);

    const fallSpeed = rand(30, 50); 
    const driftAmplitude = rand(5, 15); 
    const driftFrequency = rand(0.5, 1.2); 

    let rotation = rand(0, 360);
    const rotationSpeed = rand(-40, 40); 

    container.appendChild(petal);

    let startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      y = startY + fallSpeed * elapsed;
      const drift = Math.sin(elapsed * driftFrequency * Math.PI * 2) * driftAmplitude;
      rotation += rotationSpeed * (1 / 60);

      // BRUGER TRANSLATE3D: Dette gør animationen hardware-accelereret (silkeblød på mobil!)
      petal.style.transform = `translate3d(${x + drift}px, ${y}px, 0) rotate(${rotation}deg)`;

      if (y >= footerTop - 40) {
        petal.remove();
        return;
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  const baseWidth = 1400;
  // Sæt dette tal op, hvis du vil have FÆRRE kronblade på skærmen (bedre for performance)
  const baseInterval = 1200; 

  const widthFactor = window.innerWidth / baseWidth;
  const interval = baseInterval / Math.max(0.5, widthFactor);

  setInterval(createPetal, interval);
}

window.addEventListener("componentsLoaded", startPetals);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(startPetals, 400);
});