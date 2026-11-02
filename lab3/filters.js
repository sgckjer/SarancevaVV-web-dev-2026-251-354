document.querySelectorAll(".filters").forEach((filterBlock) => {
    const category = filterBlock.dataset.filterFor;
    const container = document.querySelector(`.dishes[data-category="${category}"]`);

    filterBlock.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const isActive = btn.classList.contains("active");

            filterBlock.querySelectorAll(".filter-btn").forEach((b) => {
                b.classList.remove("active");
            });

            //ищем карточки в момент клика, а не при старте скрипта
            const cards = container ? container.querySelectorAll(".dish") : [];

            if (isActive) {
                cards.forEach((card) => {
                    card.hidden = false;
                });
                return;
            }

            btn.classList.add("active");
            const kind = btn.dataset.kind;

            cards.forEach((card) => {
                card.hidden = card.dataset.kind !== kind;
            });
        });
    });
});