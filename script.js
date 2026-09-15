const CATEGORY_COLORS = {
  "Boards & Wood": "#3D7A5D",
  "Fasteners & Wire": "#5E6E72",
  "Construction Materials": "#2F6178",
  "Hand Tools": "#B9791F",
  "Machinery": "#5B5590",
  "Tape & Packaging": "#8C6A3D",
  "Chemicals": "#8C4A4A",
  "Safety / PPE": "#C24B3C",
  "Cleaning / Utility": "#2E7D6B",
  "Fiber / Cloth": "#6B5B95",
  "Site Equipment": "#2F6178",
  "default": "#3D5A5B"
};

let ITEMS = [];
let activeCategory = "All";
let searchTerm = "";
let sortMode = "default";

const WHATSAPP_NUMBER = "97332200095";

function enquireHref(item) {
  const priceLine = item.price !== null
    ? `Price: BD ${Number(item.price).toFixed(3)} per ${item.unit}\n\n`
    : `\n`;
  const message =
    `Hi, I'm interested in this listing:\n\n` +
    `${item.name} (${item.sku})\n` +
    `Category: ${item.category}\n` +
    priceLine +
    `Could you share more details?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

async function loadItems() {
  try {
    const res = await fetch("items.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load items.json");
    ITEMS = await res.json();
  } catch (err) {
    document.getElementById("grid").innerHTML =
      `<p style="font-family: var(--font-mono); color: var(--rust);">Could not load stock data. Check that items.json is present and valid.</p>`;
    console.error(err);
    return;
  }
  buildCategoryTabs();
  updateStats();
  render();
}

function buildCategoryTabs() {
  const categories = ["All", ...new Set(ITEMS.map(i => i.category))];
  const nav = document.getElementById("category-tabs");
  nav.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (cat === activeCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
    nav.appendChild(btn);
  });
}

function updateStats() {
  document.getElementById("stat-items").textContent = ITEMS.length;
  document.getElementById("stat-categories").textContent =
    new Set(ITEMS.map(i => i.category)).size;
  document.getElementById("stat-instock").textContent =
    ITEMS.filter(i => i.price !== null).length;
}

function availabilityBadge(price) {
  if (price === null) return { label: "Currently unavailable", cls: "badge-out" };
  return { label: "Available", cls: "badge-in" };
}

function initials(category) {
  return category
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function mediaHtml(item, color) {
  if (item.image) {
    const fallback = `this.outerHTML='<div class=\"card-media-fallback\" style=\"background:${color}\">${initials(item.category)}</div>'`;
    return `<div class="card-media"><img src="${item.image}" alt="${item.name}" loading="lazy" onerror="${fallback}"></div>`;
  }
  return `<div class="card-media card-media-fallback" style="background:${color}">${initials(item.category)}</div>`;
}

function render() {
  const grid = document.getElementById("grid");
  const emptyState = document.getElementById("empty-state");
  const resultCount = document.getElementById("result-count");

  const term = searchTerm.trim().toLowerCase();
  let filtered = ITEMS.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      !term ||
      item.name.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term) ||
      (item.country || "").toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  if (sortMode === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === "price-asc") {
    filtered = [...filtered].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (sortMode === "price-desc") {
    filtered = [...filtered].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  }

  resultCount.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
  grid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  filtered.forEach(item => {
    const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.default;
    const badge = availabilityBadge(item.price);
    const priceText = item.price !== null
      ? `BD ${Number(item.price).toFixed(3)}`
      : `Price on request`;
    const originLine = item.country
      ? `<span class="origin-note">Made in ${item.country}</span>`
      : `<span class="origin-note"></span>`;

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      ${mediaHtml(item, color)}
      <div class="card-tag" style="background:${color}">
        <span>${item.category}</span>
        <span class="sku">${item.sku}</span>
      </div>
      <div class="card-body">
        <h2 class="card-name">${item.name}</h2>
        <p class="card-desc">${item.description || ""}</p>
        <div class="card-meta">
          <span class="card-price">${priceText}</span>
          <span class="card-unit">per ${item.unit}</span>
        </div>
        <div class="card-footer-row">
          ${originLine}
          <span class="badge ${badge.cls}">${badge.label}</span>
        </div>
        <a class="enquire-btn" href="${enquireHref(item)}" target="_blank" rel="noopener">Ask on WhatsApp</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

document.getElementById("search-input").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  render();
});

document.getElementById("sort-select").addEventListener("change", (e) => {
  sortMode = e.target.value;
  render();
});

document.getElementById("clear-btn").addEventListener("click", () => {
  searchTerm = "";
  sortMode = "default";
  activeCategory = "All";
  document.getElementById("search-input").value = "";
  document.getElementById("sort-select").value = "default";
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  const allTab = document.querySelector(".tab-btn");
  if (allTab) allTab.classList.add("active");
  render();
});

loadItems();
