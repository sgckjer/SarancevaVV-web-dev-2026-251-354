document.querySelectorAll(".filters").forEach((filterBlock) => {
    const category = filterBlock.dataset.filterFor;
    const container = document.querySelector(`.dishes[data-category="${category}"]`);

    filterBlock.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const isActive = btn.classList.contains("active");

            filterBlock.querySelectorAll(".filter-btn").forEach((b) => {
                b.classList.remove("active");
            });

            if (isActive) {
                container.querySelectorAll(".dish").forEach((card) => {
                    card.hidden = false;
                });
                return;
            }

            btn.classList.add("active");
            const kind = btn.dataset.kind;

            container.querySelectorAll(".dish").forEach((card) => {
                card.hidden = card.dataset.kind !== kind;
            });
        });
    });
});