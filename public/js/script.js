document.addEventListener("DOMContentLoaded", () => {
  /* ==================================================
     NAVBAR (Hamburger + Auto Active)
  ================================================== */
  const navBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (navBtn && navMenu) {
    if (!navMenu.hasAttribute("data-open")) navMenu.setAttribute("data-open", "false");

    navBtn.addEventListener("click", () => {
      const open = navMenu.getAttribute("data-open") === "true";
      navMenu.setAttribute("data-open", String(!open));
      navBtn.setAttribute("aria-expanded", String(!open));
    });

    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "" || currentPage === "/") currentPage = "index.html";

    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPage) link.classList.add("active");

      link.addEventListener("click", () => {
        navMenu.setAttribute("data-open", "false");
        navBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ==================================================
     SUPABASE SETUP
     - You said you have NO image column in DB (fine)
     - This code uses category fallback images
  ================================================== */
  const SUPABASE_URL = "https://cqhrbgprekjmxcetctvn.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxaHJiZ3ByZWtqbXhjZXRjdHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTEyOTEsImV4cCI6MjA4Nzc2NzI5MX0.WT256Z8y0tsvyaDeiSMdm_DB5_NJZ-pwYteIwJH_l94"; // <-- paste your anon key here
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const FALLBACK_BY_CATEGORY = {
    "Fried Chicken": "images/pfc_hero.png",
    "Family Meals": "images/pfc_hero.png",
    "Burgers": "images/pfc_hero.png",
    "Wraps": "images/pfc_hero.png",
    "Wings": "images/mainpfc1.png",
    "Sides": "images/mainpfc1.png",
    "Desserts": "images/pfc_hero.png",
    "Drinks": "images/pfc_hero.png",
  };
  const CATEGORY_ICON = {
    "Fried Chicken": "🍗",
    "Family Meals": "🍗",
    "Burgers": "🍔",
    "Wraps": "🌯",
    "Wings": "🔥",
    "Sides": "🍟",
    "Desserts": "🍰",
    "Drinks": "🥤"
  };
  // Cache categories so we can filter using category name -> id
  let CATEGORY_NAME_TO_ID = new Map();

  async function loadCategories() {
    // only load once
    if (CATEGORY_NAME_TO_ID.size) return;

    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to load categories:", error);
      return;
    }

    CATEGORY_NAME_TO_ID = new Map((data || []).map((c) => [c.name, c.id]));
  }

  async function fetchMenuFromDb({ category = "All", search = "" } = {}) {
    await loadCategories();

    let query = supabase
      .from("menu_items")
      .select(`
          id,
          name,
          description,
          price,
          allergens,
          category_id,
          menu_variants(label, price)
        `)
      .order("name", { ascending: true });

    // Filter by category name -> category_id
    if (category !== "All") {
      const catId = CATEGORY_NAME_TO_ID.get(category);
      if (!catId) return [];
      query = query.eq("category_id", catId);
    }

    // Search (name + description)
    if (search.trim()) {
      const q = search.trim();
      // Supabase supports ilike; for multi-field search we can do OR
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to load menu:", error);
      return [];
    }

    // Map DB rows to your UI format
return (data || []).map(row => {
  const categoryName =
    [...CATEGORY_NAME_TO_ID.entries()].find(([, id]) => id === row.category_id)?.[0] ||
    "Uncategorised";

  return {
    id: row.id,
    name: row.name,
    desc: row.description || "",
    price: Number(row.price),
    allergens: row.allergens || "",
    category: categoryName,
    variants: row.menu_variants || []
  };
});

  }

  /* ==================================================
     MENU PAGE LOGIC
  ================================================== */
  const menuGrid = document.getElementById("menuGrid");
  const chips = document.querySelectorAll(".chip");
  const searchBox = document.getElementById("menuSearch");

  let activeCategory = "All";
  let searchQuery = "";

  function formatPrice(price) {
    return "£" + Number(price).toFixed(2);
  }

function renderMenu(items) {
  if (!menuGrid) return;

  if (!items || items.length === 0) {
    menuGrid.innerHTML = `<p style="text-align:center;opacity:.8;">No items found.</p>`;
    return;
  }

  menuGrid.innerHTML = items.map(item => `
    <article class="menu-card">
      <div class="menu-card-body">
        <div class="menu-card-top">
          <h3>${item.name}</h3>
        </div>

        <p class="menu-desc">${item.desc}</p>

        ${
          item.variants && item.variants.length > 0
            ? `<ul class="variant-list">
                ${item.variants.map(v =>
                  `<li>
                    <span class="variant-label">${v.label}</span>
                    <span class="menu-price">£${Number(v.price).toFixed(2)}</span>
                  </li>`
                ).join("")}
               </ul>`
            : `<div class="menu-price">${formatPrice(item.price)}</div>`
        }

      </div>
    </article>
  `).join("");
}

  

  async function filterMenu() {
    if (!menuGrid) return;

    menuGrid.innerHTML = `<p style="text-align:center;opacity:.6;">Loading...</p>`;

    const results = await fetchMenuFromDb({
      category: activeCategory,
      search: searchQuery,
    });

    renderMenu(results);
  }

  // Chips
  chips.forEach((btn) => {
    btn.addEventListener("click", async () => {
      chips.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      activeCategory = btn.dataset.category || "All";

      // If not All, open the modal AND also refresh the grid
    filterMenu();
    });
  });

  // Search
  if (searchBox) {
    searchBox.addEventListener("input", (e) => {
      searchQuery = e.target.value || "";
      filterMenu();
    });
  }

  // Initial load (only on menu page)
  if (menuGrid) {
    filterMenu();
  }

  /* ==================================================
     CATEGORY MODAL (POPUP)
     Requires HTML wrapper: <div class="modal" id="categoryModal"> ... </div>
  ================================================== */
  const modal = document.getElementById("categoryModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const modalGrid = document.getElementById("modalGrid");

  async function openCategoryModal(category) {
    if (!modal || !modalTitle || !modalSubtitle || !modalGrid) return;

    const items = await fetchMenuFromDb({ category });

    modalTitle.textContent = category;
    modalSubtitle.textContent = `${items.length} item${items.length !== 1 ? "s" : ""}`;

    modalGrid.innerHTML = items
      .map(
        (item) => `
          <article class="menu-card">
            <div class="menu-card-body">
              <div class="menu-card-top">
                <h3>${item.name}</h3>
                <div class="menu-price">${formatPrice(item.price)}</div>
              </div>
              <p class="menu-desc">${item.desc}</p>
            </div>
          </article>
      `
      )
      .join("");

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCategoryModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Click close (backdrop or button with data-close="true")
  if (modal) {
    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (!target) return;

      if (
        target.dataset?.close === "true" ||
        target.classList.contains("modal-backdrop")
      ) {
        closeCategoryModal();
      }
    });
  }

  // ESC close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) {
      closeCategoryModal();
    }
  });

  /* ==================================================
     FAQ PAGE (Search + Accordion)
  ================================================== */
  const faqSearch = document.getElementById("faqSearch");
  const faqItems = document.querySelectorAll(".faq-item");

  if (faqSearch && faqItems.length) {
    faqItems.forEach((item) => {
      const answer = item.querySelector(".faq-answer");
      if (answer) answer.style.maxHeight = "0px";

      item.addEventListener("toggle", () => {
        if (item.open) {
          faqItems.forEach((other) => {
            if (other !== item) other.open = false;
          });
        }

        if (answer) {
          answer.style.maxHeight = item.open ? answer.scrollHeight + "px" : "0px";
        }
      });
    });

    faqSearch.addEventListener("input", (e) => {
      const q = (e.target.value || "").toLowerCase();

      faqItems.forEach((item) => {
        const text = item.textContent.toLowerCase();
        const match = text.includes(q);

        item.style.display = match ? "" : "none";
        if (!match) item.open = false;
      });
    });
  }
});