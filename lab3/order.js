/* global dishes */

const selected = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null,
};

const emptyText = {
    soup: "Блюдо не выбрано",
    main: "Блюдо не выбрано",
    salad: "Блюдо не выбрано",
    drink: "Напиток не выбран",
    dessert: "Десерт не выбран",
};

function updateOrder() {
    let total = 0;
    let anySelected = false;

    for (const category in selected) {
        const dish = selected[category];
        const textEl = document.getElementById(`${category}-selected`); //тут ищу абзац, куда закинуть
        const inputEl = document.getElementById(`${category}-input`); // а тут кладу ключ для сервера

        if (dish) {
            textEl.textContent = `${dish.name} ${dish.price}₽`;
            inputEl.value = dish.keyword;
            total += dish.price;
            anySelected = true;
        } else {
            textEl.textContent = emptyText[category];
            inputEl.value = "";
        }
    }

    document.getElementById("order-total").textContent = `${total}₽`;
    document.getElementById("nothing-selected").hidden = anySelected;
    document.getElementById("order-summary").hidden = !anySelected;
}

function selectDish(card) {
    const keyword = card.dataset.dish;
    const dish = dishes.find((d) => d.keyword === keyword);

    selected[dish.category] = dish;

    card.parentElement.querySelectorAll(".dish").forEach((c) => {
        c.classList.remove("selected");
    });
    card.classList.add("selected");

    updateOrder();
}

document.querySelectorAll(".dish button").forEach((button) => {
    button.addEventListener("click", () => {
        selectDish(button.closest(".dish"));
    });
});

document.querySelector("form").addEventListener("reset", () => {
    for (const category in selected) {
        selected[category] = null;
    }
    document.querySelectorAll(".dish.selected").forEach((c) => {
        c.classList.remove("selected");
    });
    updateOrder();
});

updateOrder();