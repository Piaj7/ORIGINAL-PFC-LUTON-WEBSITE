document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");

  if (!btn || !nav) {
    console.warn("Nav toggle elements not found. Check .nav-toggle and .nav-links exist.");
    return;
  }

  // Ensure attribute exists
  if (!nav.hasAttribute("data-open")) nav.setAttribute("data-open", "false");

  btn.addEventListener("click", () => {
    const isOpen = nav.getAttribute("data-open") === "true";
    nav.setAttribute("data-open", String(!isOpen));
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
});