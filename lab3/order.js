/* global dishes */

const selected = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null,
};

function loadSelectedFromStorage() {
    const raw = localStorage.getItem("selected_dishes");
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function saveSelectedToStorage() {
    const ids = {};
    for (const cat in selected) {
        if (selected[cat]) {
            ids[cat] = selected[cat].id || selected[cat].keyword;
        }
    }
    localStorage.setItem("selected_dishes", JSON.stringify(ids));
}

function isComboValid() {
    const soup = Boolean(selected.soup);
    const main = Boolean(selected.main);
    const salad = Boolean(selected.salad);
    const drink = Boolean(selected.drink);

    const combo1 = soup && main && salad && drink;
    const combo2 = soup && main && !salad && drink;
    const combo3 = soup && !main && salad && drink;
    const combo4 = !soup && main && salad && drink;
    const combo5 = !soup && main && !salad && drink;

    return combo1 || combo2 || combo3 || combo4 || combo5;
}

function updateOrderPanel() {
    const panel = document.getElementById("order-panel");
    const priceEl = document.getElementById("order-panel-price");
    const linkBtn = document.getElementById("order-panel-link");

    if (!panel) return;

    let total = 0;
    let count = 0;

    for (const cat in selected) {
        if (selected[cat]) {
            total += selected[cat].price;
            count++;
        }
    }

    if (count === 0) {
        panel.hidden = true;
    } else {
        panel.hidden = false;
        priceEl.textContent = `${total}₽`;

        if (isComboValid()) {
            linkBtn.classList.remove("disabled");
        } else {
            linkBtn.classList.add("disabled");
        }
    }
}

function normalizeCategory(category) {
    if (category === "main-course" || category === "main_course") return "main";
    if (category === "beverage") return "drink";
    if (category === "salads_starters") return "salad";
    return category;
}

function selectDish(card) {
    const keyword = card.dataset.dish;
    const dish = dishes.find((d) => d.keyword === keyword);
    if (!dish) return;

    const cat = normalizeCategory(dish.category);
    selected[cat] = dish;
    saveSelectedToStorage();

    card.parentElement.querySelectorAll(".dish").forEach((c) => {
        c.classList.remove("selected");
    });
    card.classList.add("selected");

    updateOrderPanel();
}

function restoreSelectedDishes() {
    const savedIds = loadSelectedFromStorage();

    for (const rawCat in savedIds) {
        const cat = normalizeCategory(rawCat);
        const identifier = savedIds[rawCat];
        const dish = dishes.find((d) => d.id === identifier || d.keyword === identifier);
        if (dish) {
            selected[cat] = dish;

            const card = document.querySelector(`.dish[data-dish="${dish.keyword}"]`);
            if (card) {
                card.classList.add("selected");
            }
        }
    }

    updateOrderPanel();
}