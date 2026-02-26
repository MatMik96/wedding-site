document.addEventListener("DOMContentLoaded", () => {
  const GALLERY_FEED_URL = "https://script.google.com/macros/s/AKfycbxMZjMJC2ZUIVjRl6x8UILk9L95e6SSURG4wDf8-zk5fob7eltPLAbpjD79JqTjBQu70Q/exec";

  const galleryEl = document.querySelector(".photo-gallery");
  const statusEl = document.getElementById("galleryStatus");

  const dayButtons = Array.from(document.querySelectorAll("[data-day]"));
  const eventContainer = document.getElementById("eventControls");

  const lightbox = document.getElementById("lightbox");
  const lbImage = document.querySelector(".lb-image");
  const prevBtn = document.querySelector(".lb-prev");
  const nextBtn = document.querySelector(".lb-next");
  const closeBtn = document.querySelector(".lb-close");

  let downloadBtn = document.querySelector(".lb-download");
  if (!downloadBtn) {
    downloadBtn = document.createElement("a");
    downloadBtn.className = "lb-download";
    downloadBtn.textContent = "Download";
    downloadBtn.setAttribute("download", "");
    lightbox.appendChild(downloadBtn);
  }

  let allImages = []; // [{day, event, url, downloadUrl, name}]
  let eventsByDay = {}; // { dayKey: [{key,label}] }
  let filtered = [];
  let activeDay = null;
  let activeEvent = null;
  let currentIndex = 0;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function normalizeKey(name) {
    return name
      .replace(/^\d+\s*[-_ ]\s*/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  // For nicer button labels from folder names
  function prettyLabel(name) {
    return name.replace(/^\d+\s*[-_ ]\s*/g, "").trim();
  }

  async function loadFeed() {
    setStatus("Indlæser billeder…");
    const res = await fetch(GALLERY_FEED_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Feed error: ${res.status}`);
    return await res.json();
  }

  function flattenAndIndex(feed) {
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
            name: img.name,
          });
        }
      }

      // stable order by folder label
      map[dayKey].sort((a, b) => a.label.localeCompare(b.label, "da", { numeric: true }));
    }

    return { images, eventsByDay: map };
  }

  function applyActiveDayStyles() {
    dayButtons.forEach(b => b.classList.toggle("active", b.dataset.day === activeDay));
  }

  function buildEventButtonsForDay(dayKey) {
    eventContainer.innerHTML = "";

    const events = eventsByDay[dayKey] || [];
    if (!events.length) {
      const hint = document.createElement("div");
      hint.style.opacity = "0.7";
      hint.style.fontSize = "0.9rem";
      hint.textContent = "Ingen kategorier fundet (endnu).";
      eventContainer.appendChild(hint);
      return;
    }

    events.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.dataset.event = key;
      btn.textContent = label;

      btn.addEventListener("click", () => {
        // toggle
        activeEvent = (activeEvent === key) ? null : key;

        // active styling
        Array.from(eventContainer.querySelectorAll("button")).forEach(b =>
          b.classList.toggle("active", b.dataset.event === activeEvent)
        );

        filterList();
        renderGallery();
      });

      eventContainer.appendChild(btn);
    });
  }

  function filterList() {
    filtered = allImages.filter(img => {
      const okDay = !activeDay || img.day === activeDay;
      const okEvent = !activeEvent || img.event === activeEvent;
      return okDay && okEvent;
    });
  }

  function renderGallery() {
    galleryEl.classList.add("is-fading");

    setTimeout(() => {
      galleryEl.innerHTML = "";

      if (!activeDay) {
        setStatus("Vælg en dag for at se billeder.");
        galleryEl.classList.remove("is-fading");
        return;
      }

      if (filtered.length === 0) {
        setStatus("Ingen billeder i denne kategori endnu.");
      } else {
        setStatus(`${filtered.length} billeder`);
      }

      filtered.forEach((item, i) => {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.alt = item.name || "Billede";
        img.src = item.thumbUrl;
        img.dataset.index = String(i);

        img.addEventListener("click", () => showImage(i));
        galleryEl.appendChild(img);
      });

      galleryEl.classList.remove("is-fading");
    }, 160);
  }

  function showImage(index) {
    if (!filtered.length) return;
    currentIndex = (index + filtered.length) % filtered.length;

    const item = filtered[currentIndex];
    lbImage.classList.add("swap");

    setTimeout(() => {
      lbImage.src = item.fullUrl;
      downloadBtn.href = item.downloadUrl;
      downloadBtn.setAttribute("download", item.name || "photo.jpg");
      lbImage.classList.remove("swap");
    }, 120);

    lightbox.classList.add("active");
  }

  function next() { showImage(currentIndex + 1); }
  function prev() { showImage(currentIndex - 1); }

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);
  closeBtn.addEventListener("click", () => lightbox.classList.remove("active"));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("active"); });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "Escape") lightbox.classList.remove("active");
  });

  // Day selection
  dayButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeDay = (activeDay === btn.dataset.day) ? null : btn.dataset.day;
      activeEvent = null;

      applyActiveDayStyles();

      if (activeDay) {
        buildEventButtonsForDay(activeDay);
      } else {
        eventContainer.innerHTML = "";
      }

      filterList();
      renderGallery();
    });
  });

  // Init
  (async () => {
    try {
      const feed = await loadFeed();
      const indexed = flattenAndIndex(feed);
      allImages = indexed.images;
      eventsByDay = indexed.eventsByDay;

      // Default day (optional): auto select Saturday/Lørdag
      // activeDay = "lørdag";
      // applyActiveDayStyles();
      // buildEventButtonsForDay(activeDay);

      filterList();
      renderGallery();
    } catch (err) {
      console.error(err);
      setStatus("Kunne ikke indlæse billeder lige nu.");
    }
  })();
});