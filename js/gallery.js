(() => {
  const CONFIG = {
    FEED_URL: "https://script.google.com/macros/s/AKfycbxMZjMJC2ZUIVjRl6x8UILk9L95e6SSURG4wDf8-zk5fob7eltPLAbpjD79JqTjBQu70Q/exec",
    BATCH_SIZE: 3,          // smaller = fewer burst requests (helps mobile)
    BATCH_DELAY_MS: 800      // delay between batches (helps mobile)
  };

  const state = {
    allImages: [],
    filtered: [],
    eventsByDay: {},
    activeDay: null,
    activeEvent: null,
    currentIndex: 0,
    rendered: 0,
    renderToken: 0
  };

  let el = null;

  // IMPORTANT: gallery markup is injected via partials, so we must init AFTER includes
  window.addEventListener("componentsLoaded", init);

  function init() {
    cacheElements();
    if (!el.gallery || !el.dayButtons.length || !el.eventContainer || !el.lightbox) {
      console.warn("[gallery] Missing elements. Check /partials/gallery.html markup.");
      return;
    }

    ensureDownloadButton();
    attachEvents();
    loadGallery();
  }

  function cacheElements() {
    el = {
      gallery: document.querySelector(".photo-gallery"),
      status: document.getElementById("galleryStatus"),
      dayButtons: Array.from(document.querySelectorAll("[data-day]")),
      eventContainer: document.getElementById("eventControls"),

      lightbox: document.getElementById("lightbox"),
      lbImage: document.querySelector(".lb-image"),
      prevBtn: document.querySelector(".lb-prev"),
      nextBtn: document.querySelector(".lb-next"),
      closeBtn: document.querySelector(".lb-close"),
      downloadBtn: document.querySelector(".lb-download")
    };
  }

  function ensureDownloadButton() {
    if (el.downloadBtn) return;

    const a = document.createElement("a");
    a.className = "lb-download";
    a.textContent = "Download";
    a.setAttribute("download", "");
    a.href = "#";
    el.lightbox.appendChild(a);
    el.downloadBtn = a;

    const hint = document.createElement("div");
    hint.className = "lb-mobile-hint";
    hint.textContent = "Tip: Hold nede på billedet for at gemme direkte i Fotos";
    el.lightbox.appendChild(hint);
  }

  function attachEvents() {
    // Day buttons
    el.dayButtons.forEach(btn => {
      btn.addEventListener("click", () => selectDay(btn.dataset.day));
    });

    // Lightbox controls
    el.nextBtn.addEventListener("click", () => showImage(state.currentIndex + 1));
    el.prevBtn.addEventListener("click", () => showImage(state.currentIndex - 1));
    el.closeBtn.addEventListener("click", closeLightbox);

    el.lightbox.addEventListener("click", (e) => {
      if (e.target === el.lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!el.lightbox.classList.contains("active")) return;
      if (e.key === "ArrowRight") showImage(state.currentIndex + 1);
      if (e.key === "ArrowLeft") showImage(state.currentIndex - 1);
      if (e.key === "Escape") closeLightbox();
    });
  }

  async function loadGallery() {
    setStatus("Indlæser billeder…");

    try {
      const feed = await fetchFeed();
      const { images, eventsByDay } = flattenFeed(feed);
      state.allImages = images;
      state.eventsByDay = eventsByDay;

      setStatus("Vælg en dag for at se billeder.");
      renderGallery(); // shows “choose a day”
    } catch (err) {
      console.error(err);
      setStatus("Kunne ikke indlæse billeder.");
    }
  }

  async function fetchFeed() {
    const url = CONFIG.FEED_URL + "?t=" + Date.now();
    const res = await fetch(url, { mode: "cors", credentials: "omit", cache: "no-store" });
    if (!res.ok) throw new Error(`Feed error: ${res.status}`);
    return res.json();
  }

  function flattenFeed(feed) {
    const images = [];
    const map = {};

    for (const d of feed.days || []) {
      const dayKey = normalizeKey(d.day);
      map[dayKey] = [];

      for (const e of d.events || []) {
        const eventKey = normalizeKey(e.event);
        map[dayKey].push({ key: eventKey, label: prettyLabel(e.event) });

        for (const img of e.images || []) {
          images.push({
            day: dayKey,
            event: eventKey,
            thumbUrl: img.thumbUrl,
            fullUrl: img.fullUrl,
            downloadUrl: img.downloadUrl,
            name: img.name
          });
        }
      }

      // sort events by label (keeps 01- 02- order)
      map[dayKey].sort((a, b) => a.label.localeCompare(b.label, "da", { numeric: true }));
    }

    return { images, eventsByDay: map };
  }

  function selectDay(dayKey) {
    state.activeDay = (state.activeDay === dayKey) ? null : dayKey;
    state.activeEvent = null;

    // active styling
    el.dayButtons.forEach(b => b.classList.toggle("active", b.dataset.day === state.activeDay));

    buildEventButtonsForActiveDay();
    filterImages();
    renderGallery();
  }

  function buildEventButtonsForActiveDay() {
    el.eventContainer.innerHTML = "";

    if (!state.activeDay) return;

    const events = state.eventsByDay[state.activeDay] || [];
    if (!events.length) {
      el.eventContainer.innerHTML = `<div style="opacity:.7;font-size:.9rem">Ingen kategorier fundet (endnu).</div>`;
      return;
    }

    events.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.dataset.event = key;
      btn.textContent = label;

      btn.addEventListener("click", () => {
        state.activeEvent = (state.activeEvent === key) ? null : key;

        // active styling
        Array.from(el.eventContainer.querySelectorAll("button"))
          .forEach(b => b.classList.toggle("active", b.dataset.event === state.activeEvent));

        filterImages();
        renderGallery();
      });

      el.eventContainer.appendChild(btn);
    });
  }

  function filterImages() {
    state.filtered = state.allImages.filter(img =>
      (!!state.activeDay && img.day === state.activeDay) &&
      (!state.activeEvent || img.event === state.activeEvent)
    );
  }

  function renderGallery() {
    // Invalidate any in-flight batch renders
    state.renderToken++;
    const token = state.renderToken;

    el.gallery.innerHTML = "";
    state.rendered = 0;

    if (!state.activeDay) {
      setStatus("Vælg en dag for at se billeder.");
      return;
    }

    if (!state.filtered.length) {
      setStatus("Ingen billeder i denne kategori endnu.");
      return;
    }

    setStatus(`${state.filtered.length} billeder`);
    renderBatch(token);
  } 

  function renderBatch(token) {
    // If user changed filter/day, stop this batch chain
    if (token !== state.renderToken) return;
    
    const slice = state.filtered.slice(state.rendered, state.rendered + CONFIG.BATCH_SIZE);
    
    slice.forEach((item, i) => {
      // Stop if token changed mid-loop
      if (token !== state.renderToken) return;
    
      const index = state.rendered + i;
    
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = item.name || "Billede";
      img.src = item.thumbUrl;
    
      // IMPORTANT: remove retry storm (Google 429 will get worse with retries)
      img.addEventListener("error", () => {
        img.classList.add("img-error");
        // optional: show a subtle fallback in CSS
      });
    
      img.addEventListener("click", () => showImage(index));
      el.gallery.appendChild(img);
    });
  
    state.rendered += CONFIG.BATCH_SIZE;
  
    if (state.rendered < state.filtered.length) {
      setTimeout(() => renderBatch(token), CONFIG.BATCH_DELAY_MS);
    }
  }

  function showImage(index) {
    if (!state.filtered.length) return;

    state.currentIndex = (index + state.filtered.length) % state.filtered.length;
    const item = state.filtered[state.currentIndex];

    el.lbImage.classList.add("swap");
    setTimeout(() => {
      el.lbImage.src = item.fullUrl;
      el.downloadBtn.href = item.downloadUrl || item.fullUrl;
      el.downloadBtn.setAttribute("download", item.name || "photo.jpg");
      el.lbImage.classList.remove("swap");
    }, 120);

    el.lightbox.classList.add("active");
  }

  function closeLightbox() {
    el.lightbox.classList.remove("active");
  }

  function setStatus(msg) {
    if (el.status) el.status.textContent = msg;
  }

  function normalizeKey(name) {
    return (name || "")
      .replace(/^\d+\s*[-_ ]\s*/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function prettyLabel(name) {
    return (name || "").replace(/^\d+\s*[-_ ]\s*/g, "").trim();
  }
})();