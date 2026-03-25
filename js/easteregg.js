console.log("Easter egg script er indlæst - Nu med skattekort!");

// FIX: Listen on the 'window' so it actually hears the signal!
window.addEventListener("componentsLoaded", () => {
  console.log("Skattekort aktiveret!");
  setupTreasureMap();
});

// ==========================================
// THE TREASURE MAP EFFECT (Bulletproof)
// ==========================================
function setupTreasureMap() {
  let mapClickCount = 0;
  let mapTimeout;
  let revertTimeout; // New variable to hold the revert timer

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("#secret-map-trigger");
    
    if (trigger) {
      mapClickCount++;

      clearTimeout(mapTimeout);
      mapTimeout = setTimeout(() => { mapClickCount = 0; }, 600); 

      if (mapClickCount >= 2) { 
        const mapContainer = document.getElementById("magic-map-container");
        
        if (mapContainer && !mapContainer.classList.contains("show-treasure")) {
          // TURN ON MAGIC MAP
          mapContainer.classList.add("show-treasure");
          trigger.classList.remove("hint-pulse");
          
          // Clear any existing revert timer just in case
          clearTimeout(revertTimeout);
          
          // TURN OFF MAGIC MAP AFTER 12 SECONDS
          revertTimeout = setTimeout(() => {
            mapContainer.classList.remove("show-treasure");
          }, 12000); 
        }
        
        mapClickCount = 0; 
      }
    }
  });

  // Small hint: After 8 seconds, the title starts glowing
  setTimeout(() => {
    const trigger = document.getElementById("secret-map-trigger");
    const mapContainer = document.getElementById("magic-map-container");
    
    if (trigger && mapContainer && !mapContainer.classList.contains("show-treasure")) {
      trigger.classList.add("hint-pulse");
    }
  }, 8000);
}

// ==========================================
// 1. DESKTOP: The Secret Typewriter (Skål)
// ==========================================
let typedString = "";
const secretWord = "skål";

document.addEventListener("keydown", (e) => {
  if (e.key.length === 1) {
    typedString += e.key.toLowerCase();
    if (typedString.length > secretWord.length) {
      typedString = typedString.slice(-secretWord.length);
    }
    if (typedString === secretWord) {
      triggerCrazyMode();
      typedString = ""; 
    }
  }
});

// ==========================================
// 2. MOBILE & PC: The Secret Knock (Skål)
// ==========================================
let tapCount = 0;
let tapTimeout;

document.addEventListener("click", (e) => {
  if (e.target.id === "secret-amp") {
    tapCount++;
    
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => { tapCount = 0; }, 1500);

    if (tapCount >= 3) {
      triggerCrazyMode();
      tapCount = 0; 
    }
  }
});

// ==========================================
// 3. THE CRAZY MODE EFFECT (Skål)
// ==========================================
function triggerCrazyMode() {
  if (window.isEasterEggActive) return; 
  window.isEasterEggActive = true;

  document.body.classList.add("party-shake");
  shootChampagneFountain();

  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-minutes");
  const secsEl = document.getElementById("cd-seconds");
  const labels = document.querySelectorAll(".countdown-item small");

  if (!daysEl || !hoursEl || !minsEl || !secsEl) {
    cleanupCrazyMode();
    return;
  }

  let spinCount = 0;
  const spinInterval = setInterval(() => {
    daysEl.textContent = Math.floor(Math.random() * 999);
    hoursEl.textContent = Math.floor(Math.random() * 99);
    minsEl.textContent = Math.floor(Math.random() * 99);
    secsEl.textContent = Math.floor(Math.random() * 99);
    
    spinCount++;

    if (spinCount > 40) {
      clearInterval(spinInterval);
      showSecretMessage();
    }
  }, 50);

  function showSecretMessage() {
    document.body.classList.remove("party-shake");

    daysEl.textContent = "S";
    hoursEl.textContent = "K";
    minsEl.textContent = "Å";
    secsEl.textContent = "L";

    const originalLabels = Array.from(labels).map(l => l.textContent);

    if (labels.length >= 4) {
      labels[0].textContent = "Vi";
      labels[1].textContent = "Glæder";
      labels[2].textContent = "Os";
      labels[3].textContent = "Meget!";
    }

    setTimeout(() => {
      if (labels.length >= 4) {
        labels[0].textContent = originalLabels[0];
        labels[1].textContent = originalLabels[1];
        labels[2].textContent = originalLabels[2];
        labels[3].textContent = originalLabels[3];
      }
      cleanupCrazyMode();
    }, 5000);
  }
}

function cleanupCrazyMode() {
  window.isEasterEggActive = false;
  document.body.classList.remove("party-shake");
}

function shootChampagneFountain() {
  const amount = window.innerWidth < 600 ? 20 : 40; 

  for (let i = 0; i < amount; i++) {
    setTimeout(() => {
      const glass = document.createElement("div");
      glass.className = "champagne-glass";
      glass.textContent = Math.random() > 0.5 ? "🥂" : "🍾"; 
      
      glass.style.left = `${Math.random() * 95}vw`;
      glass.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`; 
      
      document.body.appendChild(glass);
      setTimeout(() => glass.remove(), 3500);
    }, i * 60); 
  }
}