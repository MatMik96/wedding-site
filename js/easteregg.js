console.log("Easter egg script er indlæst - Nu med skattekort!");

// FIX: Listen on the 'window' so it actually hears the signal!
window.addEventListener("componentsLoaded", () => {
  console.log("Skattekort aktiveret!");
  setupCatMasterplan();
  setupSummerGuarantee();
});

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
      
      glass.style.left = `${Math.random() * 80 + 10}vw`; // Starter lidt mere på midten
      glass.style.setProperty('--drift', `${Math.random() * 300 - 150}px`); // Svæver tilfældigt til højre/venstre

      glass.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`; 
      
      document.body.appendChild(glass);
      setTimeout(() => glass.remove(), 3500);
    }, i * 60); 
  }
}

// ==========================================
// THE SUMMER GUARANTEE EFFECT
// ==========================================
function setupSummerGuarantee() {
  const umbrella = document.getElementById("secret-umbrella");
  const body = document.body;

  if (!umbrella || !body) return;

  umbrella.addEventListener("click", () => {
    // Forhindrer at den trigger flere gange, mens solen allerede skinner
    if (body.classList.contains("solar-mode")) return; 

    // 1. Ryst skærmen let
    body.classList.add("party-shake");
    setTimeout(() => {
      body.classList.remove("party-shake");
    }, 400);

    // 2. Skift til solskins-tema!
    body.classList.add("solar-mode");

    // 3. Vis bekræftelsen på skærmen
    const message = document.createElement("div");
    message.id = "sun-message";
    message.textContent = "☀️ Solskin garanteret! 🥂";
    body.appendChild(message);

    // Fjern beskeden blidt efter 5 sekunder
    setTimeout(() => {
      message.style.opacity = "0";
      message.style.transition = "opacity 0.6s ease";
      setTimeout(() => message.remove(), 600);
    }, 8000);

    // 4. NYT: Lad vejret vende tilbage til normalen efter 12 sekunder
    setTimeout(() => {
      body.classList.remove("solar-mode");
    }, 12000);
  });
}

// ==========================================
// THE CAT MASTERPLAN (3D FLIP)
// ==========================================
function setupCatMasterplan() {
  // Vi lytter på hele dokumentet, så det virker selvom map.html loades et kvart sekund senere
  document.addEventListener("click", (e) => {
    // Tjekker om de klikkede på (eller indeni) pote-triggeren
    const trigger = e.target.closest("#secret-paw-trigger");
    
    if (trigger) {
      const container = document.getElementById("cat-map-container");
      if (container) {
        // Vender kortet!
        container.classList.toggle("flipped");
      }
    }
  });
}