// ===============================
// Dynamic Includes Loader (recursive)
// Supports:
//  - header/footer => /components/{name}.html
//  - everything else => /partials/{name}.html
// Also resolves nested includes (e.g. hero includes header)
// ===============================
async function loadIncludesRecursive(maxPasses = 6) {
  for (let pass = 0; pass < maxPasses; pass++) {
    const includeElements = Array.from(document.querySelectorAll("[data-include]"))
      // skip already-loaded nodes
      .filter((el) => !el.dataset.includeLoaded);

    if (!includeElements.length) return;

    await Promise.all(
      includeElements.map(async (el) => {
        const name = el.dataset.include;

        const path =
          name === "header" || name === "footer"
            ? `/components/${name}.html`
            : `/partials/${name}.html`;

        try {
          const res = await fetch(path, { cache: "no-store" });
          if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);

          el.innerHTML = await res.text();
          el.dataset.includeLoaded = "1";
        } catch (err) {
          console.error(err);
          el.innerHTML = `<!-- Failed to load ${name} -->`;
          el.dataset.includeLoaded = "1";
        }
      })
    );
  }

  console.warn("loadIncludesRecursive: max passes reached (nested includes may remain).");
}

// ===============================
// Page Transitions
// ===============================
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

// ===============================
// Reveal On Scroll (safe if unused)
// ===============================
function setupRevealOnScroll() {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  els.forEach((el) => io.observe(el));
}

// ===============================
// Init
// ===============================
(async () => {
  await loadIncludesRecursive();
  setupTransitions();
  setupRevealOnScroll();

  // Tell other scripts (gallery/petals/paws/etc.) that partials are injected
  window.dispatchEvent(new Event("componentsLoaded"));
})();

// ==========================================
// SANG-ØNSKE FORMULAR & LIVE SEARCH
// ==========================================

document.addEventListener("click", (e) => {
  // 1. Vis formularen
  const revealBtn = e.target.closest("#reveal-song-form-btn");
  if (revealBtn) {
    const formContainer = document.getElementById("song-form-container");
    if (formContainer) {
      formContainer.style.display = "block";
      revealBtn.style.display = "none";
    }
  }

  // 2. Skjul sang-forslag, hvis man klikker udenfor feltet
  const suggestionsBox = document.getElementById("song-suggestions");
  if (suggestionsBox && e.target.id !== "song-search-input") {
    suggestionsBox.style.display = "none";
  }

  // 3. Tilføj en sang mere (Reset formularen)
  const addAnotherBtn = e.target.closest("#add-another-song-btn");
  if (addAnotherBtn) {
    const songForm = document.getElementById("song-request-form");
    const successMsg = document.getElementById("song-success-msg");
    const searchInput = document.getElementById("song-search-input");
    
    if (songForm && successMsg && searchInput) {
      songForm.reset(); 
      successMsg.style.display = "none"; 
      songForm.style.display = "block"; 
      searchInput.focus(); 
    }
  }
});

// 4. Afsendelse til Formspree
document.addEventListener("submit", (e) => {
  if (e.target && e.target.id === "song-request-form") {
    e.preventDefault(); 
    const songForm = e.target;
    const successMsg = document.getElementById("song-success-msg");

    if (successMsg) {
      songForm.style.display = "none";
      successMsg.style.display = "block";
    }

    const formData = new FormData(songForm);
    fetch(songForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).catch(error => console.log("Fejl ved afsendelse:", error));
  }
});

// 5. LIVE SØGEMASKINE (iTunes API)
document.addEventListener("input", (e) => {
  if (e.target.id === "song-search-input") {
    const query = e.target.value;
    const suggestionsBox = document.getElementById("song-suggestions");
    
    if (query.length < 3) {
      suggestionsBox.style.display = "none";
      return;
    }

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
        const data = await response.json();
        
        suggestionsBox.innerHTML = ''; 
        
        if (data.results.length > 0) {
          data.results.forEach(track => {
            const li = document.createElement("li");
            li.innerHTML = `
              <img src="${track.artworkUrl60}" alt="Album cover">
              <div>
                <span class="sugg-title">${track.trackName}</span>
                <span class="sugg-artist">${track.artistName}</span>
              </div>
            `;
            
            li.addEventListener("click", () => {
              e.target.value = `${track.trackName} - ${track.artistName}`;
              suggestionsBox.style.display = "none";
            });
            
            suggestionsBox.appendChild(li);
          });
          suggestionsBox.style.display = "block";
        } else {
          suggestionsBox.style.display = "none";
        }
      } catch (err) {
        console.error("Kunne ikke hente sange:", err);
      }
    }, 400); 
  }
});