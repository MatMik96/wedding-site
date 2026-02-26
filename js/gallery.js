(() => {
  const CONFIG = {
    FEED_URL: "https://script.google.com/macros/s/AKfycbxMZjMJC2ZUIVjRl6x8UILk9L95e6SSURG4wDf8-zk5fob7eltPLAbpjD79JqTjBQu70Q/exec",
    BATCH_SIZE: 12
  };

  const state = {
    allImages: [],
    filtered: [],
    eventsByDay: {},
    activeDay: null,
    activeEvent: null,
    currentIndex: 0,
    rendered: 0
  };

  let elements = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    attachGlobalEvents();
    loadGallery();
  }

  function cacheElements() {
    elements.gallery = document.querySelector(".photo-gallery");
    elements.status = document.getElementById("galleryStatus");
    elements.dayButtons = Array.from(document.querySelectorAll("[data-day]"));
    elements.eventContainer = document.getElementById("eventControls");

    elements.lightbox = document.getElementById("lightbox");
    elements.lbImage = document.querySelector(".lb-image");
    elements.prevBtn = document.querySelector(".lb-prev");
    elements.nextBtn = document.querySelector(".lb-next");
    elements.closeBtn = document.querySelector(".lb-close");
  }

  function attachGlobalEvents() {
    elements.dayButtons.forEach(btn => {
      btn.addEventListener("click", () => selectDay(btn.dataset.day));
    });

    elements.nextBtn.addEventListener("click", () => showImage(state.currentIndex + 1));
    elements.prevBtn.addEventListener("click", () => showImage(state.currentIndex - 1));
    elements.closeBtn.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", e => {
      if (!elements.lightbox.classList.contains("active")) return;
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
      renderGallery();
    } catch (err) {
      console.error(err);
      setStatus("Kunne ikke indlæse billeder.");
    }
  }

  async function fetchFeed() {
    const res = await fetch(CONFIG.FEED_URL + "?t=" + Date.now());
    if (!res.ok) throw new Error("Feed error");
    return res.json();
  }

  function flattenFeed(feed) {
    const images = [];
    const map = {};

    for (const d of feed.days || []) {
      const dayKey = normalize(d.day);
      map[dayKey] = [];

      for (const e of d.events || []) {
        const eventKey = normalize(e.event);
        map[dayKey].push({ key: eventKey, label: cleanLabel(e.event) });

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
    }

    return { images, eventsByDay: map };
  }

  function selectDay(day) {
    state.activeDay = state.activeDay === day ? null : day;
    state.activeEvent = null;
    filterImages();
    renderGallery();
  }

  function filterImages() {
    state.filtered = state.allImages.filter(img =>
      (!state.activeDay || img.day === state.activeDay) &&
      (!state.activeEvent || img.event === state.activeEvent)
    );
  }

  function renderGallery() {
    elements.gallery.innerHTML = "";
    state.rendered = 0;

    if (!state.activeDay) {
      setStatus("Vælg en dag for at se billeder.");
      return;
    }

    filterImages();

    if (!state.filtered.length) {
      setStatus("Ingen billeder i denne kategori endnu.");
      return;
    }

    setStatus(`${state.filtered.length} billeder`);
    renderBatch();
  }

  function renderBatch() {
    const slice = state.filtered.slice(state.rendered, state.rendered + CONFIG.BATCH_SIZE);

    slice.forEach((item, i) => {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = item.thumbUrl;
      img.alt = item.name || "Billede";

      img.addEventListener("click", () => showImage(state.rendered + i));
      elements.gallery.appendChild(img);
    });

    state.rendered += CONFIG.BATCH_SIZE;

    if (state.rendered < state.filtered.length) {
      setTimeout(renderBatch, 200);
    }
  }

  function showImage(index) {
    state.currentIndex = (index + state.filtered.length) % state.filtered.length;
    const item = state.filtered[state.currentIndex];
    elements.lbImage.src = item.fullUrl;
    elements.lightbox.classList.add("active");
  }

  function closeLightbox() {
    elements.lightbox.classList.remove("active");
  }

  function setStatus(msg) {
    if (elements.status) elements.status.textContent = msg;
  }

  function normalize(name) {
    return name.replace(/^\d+\s*[-_ ]\s*/g, "").trim().toLowerCase().replace(/\s+/g, "-");
  }

  function cleanLabel(name) {
    return name.replace(/^\d+\s*[-_ ]\s*/g, "").trim();
  }

})();