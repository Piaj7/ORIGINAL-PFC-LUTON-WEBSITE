document.addEventListener("DOMContentLoaded", () => {
  // Desktop only
  if (window.innerWidth < 768) return;

  const bestSellers = document.getElementById("best-sellers");
  if (!bestSellers) return;

  let readyToRedirect = false;
  let hasRedirected = false;

  // Detect when Best Sellers fully enters view
  window.addEventListener("scroll", () => {
    if (hasRedirected) return;

    const rect = bestSellers.getBoundingClientRect();

    if (rect.bottom <= window.innerHeight) {
      readyToRedirect = true;
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const isOpen = nav.getAttribute("data-open") === "true";
    nav.setAttribute("data-open", String(!isOpen));
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
});

  // Mobile / touch support (optional but safe)
  window.addEventListener("touchmove", () => {
    if (readyToRedirect && !hasRedirected) {
      hasRedirected = true;
      window.location.href = "best_sellers_page.html";
    }
  });
});
