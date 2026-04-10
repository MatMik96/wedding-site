  /* =====================
     CONFIG
  ===================== */
  const isMainPage = document.body.classList.contains("page-home");

  const CATS = 3; // NU ER DER 3 DYR!
  const MIN_DELAY = isMainPage ? 9000 : 18000;
  const MAX_DELAY = isMainPage ? 18000 : 30000;

 const CAT_SPIRITS = {
  aslak: {
    images: ["../images/Aslak1.png", "../images/Aslak2.png", "../images/Aslak3.png"],
    imageIndex: 0,
    messages: ["Aslak var her 🐾", "Jeg holder øje med jer", "Kan du stave til S-K-Å-L?"]
  },
  dracula: {
    images: ["../images/Dracula1.png", "../images/Dracula2.png", "../images/Dracula3.png"],
    imageIndex: 0,
    messages: ["Dracula våger…", "Mørket ser alt", "Hemmeligheden ligger i tegnet mellem dem..."]
  },
  // TILFØJET: ELMER!
  elmer: {
    images: ["../images/Elmer1.png", "../images/Elmer2.png", "../images/Elmer3.png"],
    imageIndex: 0,
    messages: ["VUF! Jeg bestemmer nu!", "Er der mere laks?", "Who's a good boy?!", "Kattene er kedelige!"]
  }
};

  const FAIL_MESSAGES = [
    "Prøv igen 🐾",
    "Bedre held næste gang",
    "Det var kattens…",
    "Så katte ikke blive bedre!"
  ];

  /* =====================
     STATE
  ===================== */

  const lastPawByCat = {
    aslak: null,
    dracula: null,
    elmer: null // Tilføjet Elmer
  };

  const activeMessageByCat = { aslak: null, dracula: null, elmer: null }; // Tilføjet Elmer

  function preloadCatImages() {
    Object.values(CAT_SPIRITS).forEach(cat => {
      cat.images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    });
  }

preloadCatImages();

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function chance(probability) {
    return Math.random() < probability;
  }

  function scheduleNextTrail(catIndex) {
    setTimeout(() => spawnTrail(catIndex), random(MIN_DELAY, MAX_DELAY));
  }

  /* =====================
     UI HELPERS
  ===================== */

function showMessage(catId, text, pageX, pageY) {
  // If there's already a message for this cat, remove it first (no stacking)
  const old = activeMessageByCat[catId];
  if (old) old.remove();

  const el = document.createElement("div");
  el.className = "paw-message";

  // Wrap text so we can shimmer the "ink" effect
  const span = document.createElement("span");
  span.className = "whisper";
  span.textContent = text;
  el.appendChild(span);

  // Position uses PAGE COORDS (absolute on the document)
  el.style.left = `${pageX}px`;
  el.style.top = `${pageY}px`;

  document.body.appendChild(el);
  activeMessageByCat[catId] = el;

  // When animation ends, clean up reference
  setTimeout(() => {
    if (activeMessageByCat[catId] === el) activeMessageByCat[catId] = null;
    el.remove();
  }, 2300);
}

function showCatSpirit(catId) {
  const cat = CAT_SPIRITS[catId];
  const last = lastPawByCat[catId];
  if (!cat || !last) return;

  // Pick next image (cycle through 1/2/3)
  const img = cat.images[cat.imageIndex];
  cat.imageIndex = (cat.imageIndex + 1) % cat.images.length;

  // Pick a random “spirit line”
  const message = cat.messages[Math.floor(Math.random() * cat.messages.length)];

  // last.x / last.y are PAGE coordinates (because paw top uses window.scrollY)
  const x = last.x;
  const y = last.y;

  // --- CAT POPUP (ABSOLUTE / PAGE COORDS) ---
  const el = document.createElement("div");
  el.className = "cat-spirit";
  el.style.backgroundImage = `url("${img}")`;

  // Place near the last paw so it "belongs" to the trail
  // Small offset so it doesn't cover the paw completely
  const offsetX = 80;
  const offsetY = -60;

  let centerX = x + offsetX;
  let centerY = y + offsetY;

  // Detect actual cat size (responsive!)
  const catSize = window.innerWidth <= 600 ? 160 : 240;
  const half = catSize / 2;
  const padding = 12;

  // Viewport bounds in PAGE coordinates
  const minX = window.scrollX + half + padding;
  const maxX = window.scrollX + window.innerWidth - half - padding;

  const minY = window.scrollY + half + padding;
  const maxY = window.scrollY + window.innerHeight - half - padding;

  // Clamp center position
  centerX = Math.max(minX, Math.min(centerX, maxX));
  centerY = Math.max(minY, Math.min(centerY, maxY));

  el.style.left = `${centerX}px`;
  el.style.top  = `${centerY}px`;

  document.body.appendChild(el);

  // --- MESSAGE (ABSOLUTE / PAGE COORDS) ---
  // Keep the message near the cat
  showMessage(catId, message, centerX, centerY - catSize * 0.6);

  // Cleanup
  setTimeout(() => el.remove(), 2600);
}


  function glowTrailProgressively(catId) {
    const paws = Array.from(
      document.querySelectorAll(`.paw-print[data-cat="${catId}"]`)
    );

    paws.forEach((paw, index) => {
      setTimeout(() => {
        paw.classList.add("paw-glow");
        setTimeout(() => paw.classList.remove("paw-glow"), 700);
      }, index * 90);
    });
  }

  /* =====================
     CLICK HANDLER
  ===================== */

  document.addEventListener("click", (e) => {
  const paw = e.target.closest(".paw-print");
  if (!paw) return;

  const catId = paw.dataset.cat;
  if (!catId) return;

  // Use PAGE coordinates so message stays anchored to the document
  const pageX = e.pageX;
  const pageY = e.pageY - 40;

  // 1/2 chance cat appears
  if (!chance(0.5)) {
    const failText = FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];
    showMessage(catId, failText, pageX, pageY);
    return;
  }

  glowTrailProgressively(catId);
  showCatSpirit(catId);
});


  /* =====================
     SPAWN TRAILS
  ===================== */

  function spawnTrail(catIndex) {
    let catId = "aslak";
    if (catIndex === 1) catId = "dracula";
    if (catIndex === 2) catId = "elmer";
    const steps = Math.floor(random(6, 12));

    let x = random(80, window.innerWidth - 120);
    let y = window.scrollY + random(80, window.innerHeight - 220);

    let angle = random(0, Math.PI * 2);
    const turnStrength = random(0.25, 1.45);
    const baseStepSize = random(26, 38);
    const baseDelay = random(160, 720);

    let delayAccum = 0;
    let left = true;

    for (let i = 0; i < steps; i++) {
      const lateral = (left ? -1 : 1) * random(3, 7);
      const stepX = x + Math.cos(angle + Math.PI / 2) * lateral;
      const stepY = y + Math.sin(angle + Math.PI / 2) * lateral;

      const rotationDeg = angle * 180 / Math.PI + 90 + (left ? -6 : 6);
      delayAccum += Math.max(100, baseDelay + random(-60, 120));

      setTimeout(() => {
        const paw = document.createElement("div");
        paw.className = "paw-print";
        paw.dataset.cat = catId;

        paw.style.left = `${stepX}px`;
        paw.style.top = `${stepY}px`;
        paw.style.transform = `rotate(${rotationDeg}deg)`;

        document.body.appendChild(paw);

        lastPawByCat[catId] = { x: stepX, y: stepY };

        setTimeout(() => paw.remove(), 5200);
      }, delayAccum);

      angle += (Math.random() - 0.5) * turnStrength;
      const stepSize = baseStepSize + random(-4, 6);

      x += Math.cos(angle) * stepSize;
      y += Math.sin(angle) * stepSize;
      left = !left;
    }

    scheduleNextTrail(catIndex);
  }

  scheduleNextTrail(0); // Aslak
  scheduleNextTrail(1); // Dracula

  // Hvis Elmer er låst op via Easter Egget, begynder han også at gå ture!
  window.startElmerTrails = function() {
    // Sikrer at vi ALDRIG starter mere end ét loop af Elmer, selv hvis koden kaldes igen
    if (window.elmerIsRunning) return; 
    window.elmerIsRunning = true;
    
    // Starter præcis én rute for Elmer, og respekterer den indbyggede forsinkelse
    scheduleNextTrail(2); 
  };

  if (localStorage.getItem("elmerDiscovered") === "true") {
    window.startElmerTrails();
  }