/* global dishes */

dishes.sort((a, b) => a.name.localeCompare(b.name));

dishes.forEach((dish) => {
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

    const container = document.querySelector(`.dishes[data-category="${dish.category}"]`);
    container.appendChild(card);
});