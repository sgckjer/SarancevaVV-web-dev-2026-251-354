/* global selectDish */

// Сопоставляем все возможные варианты названий с сервера с нашими категориями в HTML
const categoryMap = {
    "soup": "soup",
    "main-course": "main",
    "main_course": "main",
    "main": "main",
    "salad": "salad",
    "salads_starters": "salad",
    "beverage": "drink",
    "drink": "drink",
    "dessert": "dessert"
};

function renderDishes(dishList) {
    dishList.forEach((dish) => {
        const card = document.createElement("div");
        card.classList.add("dish");
        card.dataset.dish = dish.keyword;
        card.dataset.kind = dish.kind;

        card.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <p>${dish.price}₽</p>
            <p>${dish.name}</p>
            <p>${dish.count}</p>
            <button type="button">Добавить</button>
        `;

        const targetCategory = categoryMap[dish.category] || dish.category;
        const container = document.querySelector(`.dishes[data-category="${targetCategory}"]`);

        if (container) {
            container.appendChild(card);
        }

        const button = card.querySelector("button");
        button.addEventListener("click", () => {
            selectDish(card);
        });
    });
}