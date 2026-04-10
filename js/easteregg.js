console.log("Easter egg script er indlæst!");

// Samlet opstart af alle easter eggs
window.addEventListener("componentsLoaded", () => {
  setupCatMasterplan();
  setupSummerGuarantee();
  setupElmerUltimate();
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
      
      glass.style.left = `${Math.random() * 80 + 10}vw`; 
      glass.style.setProperty('--drift', `${Math.random() * 300 - 150}px`); 

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
    if (body.classList.contains("solar-mode")) return; 

    body.classList.add("party-shake");
    setTimeout(() => body.classList.remove("party-shake"), 400);

    body.classList.add("solar-mode");

    const message = document.createElement("div");
    message.id = "sun-message";
    message.textContent = "☀️ Solskin garanteret! 🥂";
    body.appendChild(message);

    setTimeout(() => {
      message.style.opacity = "0";
      message.style.transition = "opacity 0.6s ease";
      setTimeout(() => message.remove(), 600);
    }, 8000);

    setTimeout(() => {
      body.classList.remove("solar-mode");
    }, 12000);
  });
}

// ==========================================
// THE CAT MASTERPLAN (3D FLIP)
// ==========================================
function setupCatMasterplan() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("#secret-paw-trigger");
    if (trigger) {
      const container = document.getElementById("cat-map-container");
      if (container) {
        container.classList.toggle("flipped");
      }
    }
  });
}

// ==========================================
// ELMER TAKE-OVER (MØRKLÆGNING + HVALPE-LOGIK)
// ==========================================
function setupElmerUltimate() {
  const trigger = document.getElementById("elmer-trigger");
  if (!trigger) return;

  trigger.addEventListener("click", () => {
    if (document.body.classList.contains("elmer-active")) return;

    // HACKER TERMINAL
    const consoleDiv = document.createElement("div");
    consoleDiv.id = "elmer-console";
    document.body.appendChild(consoleDiv);
    consoleDiv.style.display = "block";

    const logs = [
      "> INITIATING SYSTEM OVERRIDE...",
      "> IDENTIFICERER BRUGER: ELMER_THE_AUSSIE",
      "> STATUS: 5 MÅNEDER GAMMEL - MAX ENERGI",
      "> ANALYSERER KATTE-DATA...",
      "> FEJL: FOR MANGE KATTE FUNDET.",
      "> SLETTER KATTE-DOMINANS... [VUF!]",
      "> INDSÆTTER HVALPE-LOGIK...",
      "> SYSTEM OVERTAGET. FIND ELMER I MØRKET!"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        const line = document.createElement("p");
        line.textContent = logs[i];
        consoleDiv.appendChild(line);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          consoleDiv.style.opacity = "0";
          consoleDiv.style.transition = "opacity 1.5s ease";
          setTimeout(() => {
            consoleDiv.remove();
            startElmerMode();
          }, 1500);
        }, 2000);
      }
    }, 1200); 
  });

  function startElmerMode() {
    const body = document.body;
    body.classList.add("elmer-active");
    
    // Gemmer at Elmer er fundet, så paws.js fremover altid lader ham gå ture!
    localStorage.setItem("elmerDiscovered", "true");

    // SPOTLIGHT
    const spot = document.createElement("div");
    spot.className = "spotlight";
    body.appendChild(spot);

    const updateSpot = (e) => {
      spot.style.setProperty("--x", e.clientX + "px");
      spot.style.setProperty("--y", e.clientY + "px");
    };
    window.addEventListener("mousemove", updateSpot);

    // PLACER ELMER TILFÆLDIGT I MØRKET
    const elmerHidden = document.createElement("img");
    elmerHidden.src = "../images/Elmer1.png";
    elmerHidden.id = "elmer-in-dark";
    const randomTop = Math.floor(Math.random() * 70) + 10;
    const randomLeft = Math.floor(Math.random() * 70) + 10;
    elmerHidden.style.cssText = `position:fixed; top:${randomTop}%; left:${randomLeft}%; width:200px; z-index:9998; pointer-events:none; filter: drop-shadow(0 0 15px rgba(255,255,255,0.3));`;
    body.appendChild(elmerHidden);

    // LYS TÆNDER IGEN EFTER 20 SEKUNDER
    setTimeout(() => {
      body.classList.remove("elmer-active");
      spot.remove();
      elmerHidden.remove();
      window.removeEventListener("mousemove", updateSpot);
      
      alert("Lyset er tændt igen! Men Elmer har efterladt sig spor... Prøv at lede efter dem! 🐾");
      
      // Kald Elmers gåture fra paws.js!
      if (window.startElmerTrails) {
        window.startElmerTrails();
      }
    }, 20000);
  }
}