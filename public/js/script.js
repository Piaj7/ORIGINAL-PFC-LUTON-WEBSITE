document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Hamburger Toggle ---------- */
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");

  if (btn && nav) {
    if (!nav.hasAttribute("data-open")) {
      nav.setAttribute("data-open", "false");
    }

    btn.addEventListener("click", () => {
      const isOpen = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!isOpen));
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  /* ---------- Auto Active Nav Link ---------- */
  const links = document.querySelectorAll(".nav-links a");

  // Get current file name (e.g. menu.html)
  let currentPage = window.location.pathname.split("/").pop();

  // For localhost / index fallback
  if (currentPage === "" || currentPage === "/") {
    currentPage = "index.html";
  }

  links.forEach(link => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

});

// Close menu after clicking a link (mobile)
links.forEach(link => {
  link.addEventListener("click", () => {
    if (nav) {
      nav.setAttribute("data-open", "false");
      btn.setAttribute("aria-expanded", "false");
    }
  });
});