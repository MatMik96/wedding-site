console.log("Easter egg script er indlæst - Nu med mere vanvid!");

// --- 1. DESKTOP: The Secret Typewriter ---
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

// --- 2. MOBILE & PC: The Secret Knock ---
let tapCount = 0;
let tapTimeout;

document.addEventListener("click", (e) => {
  if (e.target.id === "secret-amp") {
    tapCount++;
    
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => { tapCount = 0; }, 1500);

    // LOWERED TO 3 TAPS FOR EASIER DISCOVERY!
    if (tapCount >= 5) {
      triggerCrazyMode();
      tapCount = 0; 
    }
  }
});

// --- 3. THE CRAZY MODE EFFECT ---
function triggerCrazyMode() {
  if (window.isEasterEggActive) return; 
  window.isEasterEggActive = true;

  // 1. Start the screen shake!
  document.body.classList.add("party-shake");

  // 2. Shoot the Champagne!
  shootChampagneFountain();

  // Grab the countdown boxes
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-minutes");
  const secsEl = document.getElementById("cd-seconds");
  const labels = document.querySelectorAll(".countdown-item small");

  if (!daysEl || !hoursEl || !minsEl || !secsEl) {
    cleanupCrazyMode();
    return;
  }

  // 3. The Spin Phase
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

  // 4. The Reveal Phase
  function showSecretMessage() {
    // Stop the screen shaking when the letters appear
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

    // 5. The Reset Phase (After 6 seconds)
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

// Resets the global flag
function cleanupCrazyMode() {
  window.isEasterEggActive = false;
  document.body.classList.remove("party-shake");
}

// Generates the flying glasses!
function shootChampagneFountain() {
  const amount = window.innerWidth < 600 ? 20 : 40; // Less objects on phones to prevent lag

  for (let i = 0; i < amount; i++) {
    setTimeout(() => {
      const glass = document.createElement("div");
      glass.className = "champagne-glass";
      // Mix of champagne and clinking glasses
      glass.textContent = Math.random() > 0.5 ? "🥂" : "🍾"; 
      
      // Randomize starting position across the screen width
      glass.style.left = `${Math.random() * 95}vw`;
      // Randomize speed so they don't all move identically
      glass.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`; 
      
      document.body.appendChild(glass);
      
      // Remove element from DOM after animation finishes
      setTimeout(() => glass.remove(), 3500);
    }, i * 60); // Stagger the spawns rapidly
  }
}