const API_URL = "https://api.rozetkaimg.me/labs/api/dishes";

let allDishes = [];
const currentOrder = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null,
};

const defaultTexts = {
    soup: "Не выбрано",
    main: "Не выбрано",
    salad: "Не выбрано",
    drink: "Не выбран",
    dessert: "Не выбран",
};

function getSavedIds() {
    const raw = localStorage.getItem("selected_dishes");
    return raw ? JSON.parse(raw) : {};
}

function persistOrder() {
    const ids = {};
    for (const cat in currentOrder) {
        if (currentOrder[cat]) {
            ids[cat] = currentOrder[cat].id || currentOrder[cat].keyword;
        }
    }
    localStorage.setItem("selected_dishes", JSON.stringify(ids));
}

function updateOrderSummary() {
    let total = 0;
    let hasItems = false;

    for (const cat in currentOrder) {
        const dish = currentOrder[cat];
        const valEl = document.getElementById(`summary-${cat}`);

        if (dish) {
            valEl.textContent = `${dish.name} (${dish.price}₽)`;
            total += dish.price;
            hasItems = true;
        } else {
            valEl.textContent = defaultTexts[cat];
        }
    }

    document.getElementById("summary-total").textContent = `${total}₽`;

    const emptyMsg = document.getElementById("empty-order-msg");
    const grid = document.getElementById("order-dishes-grid");

    if (!hasItems) {
        emptyMsg.hidden = false;
        grid.innerHTML = "";
    } else {
        emptyMsg.hidden = true;
    }
}

function removeDish(category, cardEl) {
    currentOrder[category] = null;
    persistOrder();

    if (cardEl) {
        cardEl.remove();
    }

    updateOrderSummary();
}

function renderOrderDishes() {
    const grid = document.getElementById("order-dishes-grid");
    grid.innerHTML = "";

    let count = 0;
    for (const cat in currentOrder) {
        const dish = currentOrder[cat];
        if (!dish) continue;

        count++;
        const card = document.createElement("div");
        card.classList.add("dish");
        card.dataset.category = dish.category;

        card.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <p>${dish.price}₽</p>
            <p>${dish.name}</p>
            <p>${dish.count}</p>
            <button type="button" class="delete-btn">Удалить</button>
        `;

        card.querySelector("button").addEventListener("click", () => {
            removeDish(dish.category, card);
        });

        grid.appendChild(card);
    }

    updateOrderSummary();
}

async function initOrderPage() {
    try {
        const res = await fetch(API_URL);
        allDishes = await res.json();

        const savedIds = getSavedIds();
        for (const cat in savedIds) {
            const val = savedIds[cat];
            const dish = allDishes.find((d) => d.id === val || d.keyword === val);
            if (dish) {
                currentOrder[cat] = dish;
            }
        }

        renderOrderDishes();
    } catch (err) {
        console.error("Ошибка инициализации заказа:", err);
    }
}

document.addEventListener("DOMContentLoaded", initOrderPage);