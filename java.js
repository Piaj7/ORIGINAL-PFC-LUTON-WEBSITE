document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
        q.nextElementSibling.classList.toggle("open");
    });
});
