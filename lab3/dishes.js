/* exported dishes, loadDishes */

let dishes = [];

const API_URL = "https://api.rozetkaimg.me/labs/api/dishes";

async function loadDishes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }

        const data = await response.json();

        data.sort((a, b) => a.name.localeCompare(b.name));

        dishes = data;

        if (typeof renderDishes === "function") {
            renderDishes(dishes);
        }
    } catch (error) {
        console.error("Не удалось загрузить блюда:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadDishes();
});