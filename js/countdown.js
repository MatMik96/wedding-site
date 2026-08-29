const weddingDate = new Date("2026-08-21T16:00:00+02:00");

// We add a global flag so other scripts can pause the countdown
window.isEasterEggActive = false; 

function updateCountdown() {
  // If the Easter egg is running, stop updating the real time!
  if (window.isEasterEggActive) return; 

  const now = new Date();
  const diff = weddingDate.getTime() - now.getTime();

  const el = document.getElementById("countdown");
  if (!el) return;

  if (diff <= 0) {
    el.textContent = "Tak for en fantastisk weekend! 💍";
    return;
  }

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds / (60 * 60)) % 24);
  const minutes = Math.floor((seconds / 60) % 60);
  const secs = Math.floor(seconds % 60);

  document.getElementById("cd-days").textContent = days;
  document.getElementById("cd-hours").textContent = hours;
  document.getElementById("cd-minutes").textContent = minutes;
  document.getElementById("cd-seconds").textContent = secs;
}

updateCountdown();
setInterval(updateCountdown, 1000);