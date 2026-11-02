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

function normalizeCategory(category) {
    if (category === "main-course" || category === "main_course") return "main";
    if (category === "beverage") return "drink";
    if (category === "salads_starters") return "salad";
    return category;
}

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
    const cat = normalizeCategory(category);
    currentOrder[cat] = null;
    persistOrder();

    if (cardEl) {
        cardEl.remove();
    }

    updateOrderSummary();
}

function renderOrderDishes() {
    const grid = document.getElementById("order-dishes-grid");
    grid.innerHTML = "";

    for (const cat in currentOrder) {
        const dish = currentOrder[cat];
        if (!dish) continue;

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
        for (const rawCat in savedIds) {
            const cat = normalizeCategory(rawCat);
            const val = savedIds[rawCat];
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

const API_KEY = "123e4567-e89b-12d3-a456-426655440000"; 
const ORDERS_URL = `https://api.rozetkaimg.me/labs/api/orders?api_key=${API_KEY}`;

function showNotification(message) {
    const existing = document.querySelector(".notification-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.classList.add("notification-overlay");

    const box = document.createElement("div");
    box.classList.add("notification-box");

    const text = document.createElement("p");
    text.textContent = message;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("notification-btn");
    btn.textContent = "Окей";
    btn.addEventListener("click", () => overlay.remove());

    box.append(text, btn);
    overlay.append(box);
    document.body.append(overlay);
}

function validateOrderCombo() {
    const soup = Boolean(currentOrder.soup);
    const main = Boolean(currentOrder.main);
    const salad = Boolean(currentOrder.salad);
    const drink = Boolean(currentOrder.drink);

    if (!soup && !main && !salad && !drink && !currentOrder.dessert) {
        return "Ничего не выбрано. Выберите блюда для заказа";
    }

    if (!drink) {
        return "Выберите напиток";
    }

    if (soup && !main && !salad) {
        return "Выберите главное блюдо/салат/стартер";
    }

    if (salad && !soup && !main) {
        return "Выберите суп или главное блюдо";
    }

    if (!soup && !main) {
        return "Выберите главное блюдо";
    }

    return null;
}

document.getElementById("checkout-form").addEventListener("reset", () => {
    for (const cat in currentOrder) {
        currentOrder[cat] = null;
    }
    localStorage.removeItem("selected_dishes");
    renderOrderDishes();
});

document.getElementById("checkout-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const comboError = validateOrderCombo();
    if (comboError) {
        showNotification(comboError);
        return;
    }

    const form = e.target;
    const deliveryType = form.elements["delivery-time"].value;
    const deliveryTimeVal = form.elements["delivery-time-value"].value;

    if (deliveryType === "by_time" && !deliveryTimeVal) {
        showNotification("Укажите точное время доставки");
        return;
    }

    const orderData = {
        full_name: form.elements["name"].value,
        email: form.elements["email"].value,
        subscribe: form.elements["subscribe"].checked ? 1 : 0,
        phone: form.elements["phone"].value,
        delivery_address: form.elements["address"].value,
        delivery_type: deliveryType,
        delivery_time: deliveryType === "by_time" ? deliveryTimeVal : null,
        comment: form.elements["comment"].value || null,
        soup_id: currentOrder.soup ? currentOrder.soup.id : null,
        main_course_id: currentOrder.main ? currentOrder.main.id : null,
        salad_id: currentOrder.salad ? currentOrder.salad.id : null,
        drink_id: currentOrder.drink ? currentOrder.drink.id : null,
        dessert_id: currentOrder.dessert ? currentOrder.dessert.id : null,
    };

    try {
        const response = await fetch(ORDERS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Ошибка при оформлении заказа на сервере");
        }

        localStorage.removeItem("selected_dishes");
        showNotification("Заказ успешно оформлен!");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);

    } catch (err) {
        console.error("Ошибка отправки заказа:", err);
        showNotification(`Не удалось оформить заказ: ${err.message}`);
    }
});