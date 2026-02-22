document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     NAVBAR (Hamburger + Auto Active)
  ================================================== */

  const navBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (navBtn && navMenu) {

    // Ensure attribute exists
    if (!navMenu.hasAttribute("data-open")) {
      navMenu.setAttribute("data-open", "false");
    }

    // Toggle mobile menu
    navBtn.addEventListener("click", () => {
      const open = navMenu.getAttribute("data-open") === "true";

      navMenu.setAttribute("data-open", String(!open));
      navBtn.setAttribute("aria-expanded", String(!open));
    });

    // Auto active link
    let currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "" || currentPage === "/") {
      currentPage = "index.html";
    }

    navLinks.forEach(link => {

      // Highlight active
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }

      // Close menu on click (mobile)
      link.addEventListener("click", () => {
        navMenu.setAttribute("data-open", "false");
        navBtn.setAttribute("aria-expanded", "false");
      });
    });
  }


  /* ==================================================
     MENU DATA (STATIC → DATABASE LATER)
  ================================================== */

  const MENU_ITEMS = [
    {
      name: "Classic Chicken Burger",
      category: "Burgers",
      price: 5.99,
      desc: "Crispy chicken, fresh salad, house sauce.",
      image: "images/pfc_hero.png"
    },
    {
      name: "Spicy Wings (6pc)",
      category: "Wings",
      price: 4.99,
      desc: "Hot wings with signature sauce.",
      image: "images/mainpfc1.png"
    },
    {
      name: "Chicken Strips",
      category: "Chicken",
      price: 6.49,
      desc: "Golden crunchy strips.",
      image: "images/pfc_hero.png"
    },
    {
      name: "Seasoned Fries",
      category: "Sides",
      price: 2.49,
      desc: "Crispy fries with seasoning.",
      image: "images/mainpfc1.png"
    },
    {
      name: "Cola",
      category: "Drinks",
      price: 1.49,
      desc: "Ice cold soft drink.",
      image: "images/pfc_hero.png"
    }
  ];


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

    if (items.length === 0) {
      menuGrid.innerHTML =
        `<p style="text-align:center;opacity:.8;">No items found.</p>`;
      return;
    }

    menuGrid.innerHTML = items.map(item => `
      <article class="menu-card">
        <img src="${item.image}" alt="${item.name}">
        <div class="menu-card-body">
          <div class="menu-card-top">
            <h3>${item.name}</h3>
            <div class="menu-price">${formatPrice(item.price)}</div>
          </div>
          <p class="menu-desc">${item.desc}</p>
        </div>
      </article>
    `).join("");
  }


  function filterMenu() {

    let results = MENU_ITEMS;

    // Category filter
    if (activeCategory !== "All") {
      results = results.filter(i => i.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      results = results.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q)
      );
    }

    renderMenu(results);
  }


  // Category buttons
  chips.forEach(btn => {

    btn.addEventListener("click", () => {

      chips.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      activeCategory = btn.dataset.category || "All";

      if (activeCategory !== "All") {
        openCategoryModal(activeCategory);
      }

      filterMenu();
    });

  });


  // Search input
  if (searchBox) {

    searchBox.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      filterMenu();
    });

  }


  if (menuGrid) {
    renderMenu(MENU_ITEMS);
  }


  /* ==================================================
     CATEGORY MODAL (POPUP)
  ================================================== */

  const modal = document.getElementById("categoryModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const modalGrid = document.getElementById("modalGrid");


  function openCategoryModal(category) {

    if (!modal) return;

    const items = MENU_ITEMS.filter(i => i.category === category);

    modalTitle.textContent = category;
    modalSubtitle.textContent =
      `${items.length} item${items.length !== 1 ? "s" : ""}`;

    modalGrid.innerHTML = items.map(item => `
      <article class="menu-card">
        <img src="${item.image}" alt="${item.name}">
        <div class="menu-card-body">
          <div class="menu-card-top">
            <h3>${item.name}</h3>
            <div class="menu-price">${formatPrice(item.price)}</div>
          </div>
          <p class="menu-desc">${item.desc}</p>
        </div>
      </article>
    `).join("");

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


  // Close popup
  if (modal) {

    modal.addEventListener("click", (e) => {

      if (
        e.target.dataset.close === "true" ||
        e.target.classList.contains("modal-backdrop")
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

    faqItems.forEach(item => {

      const answer = item.querySelector(".faq-answer");

      if (answer) answer.style.maxHeight = "0px";

      // One open at a time
      item.addEventListener("toggle", () => {

        if (item.open) {
          faqItems.forEach(other => {
            if (other !== item) other.open = false;
          });
        }

        // Smooth height
        if (answer) {
          if (item.open) {
            answer.style.maxHeight = answer.scrollHeight + "px";
          } else {
            answer.style.maxHeight = "0px";
          }
        }

      });

    });

    // Search filter
    faqSearch.addEventListener("input", (e) => {

      const q = e.target.value.toLowerCase();

      faqItems.forEach(item => {

        const text = item.textContent.toLowerCase();
        const match = text.includes(q);

        item.style.display = match ? "" : "none";

        if (!match) item.open = false;

      });

    });

  }

});