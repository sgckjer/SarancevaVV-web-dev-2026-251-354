/* global selected */

function checkOrder() {
    const soup = Boolean(selected.soup);
    const main = Boolean(selected.main);
    const salad = Boolean(selected.salad);
    const drink = Boolean(selected.drink);
    const dessert = Boolean(selected.dessert);

    const nothingSelected = !soup && !main && !salad && !drink && !dessert;
    if (nothingSelected) {
        return "Ничего не выбрано. Выберите блюда для заказа";
    }

    const noCore = !soup && !main && !salad;
    if (noCore) {
        return "Выберите главное блюдо";
    }

    if (soup && !main && !salad) {
        return "Выберите главное блюдо/салат/стартер";
    }

    if (salad && !soup && !main) {
        return "Выберите суп или главное блюдо";
    }

    if (!drink) {
        return "Выберите напиток";
    }

    return null;
}

function showNotification(message) {
    const existing = document.querySelector(".notification-overlay");
    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement("div");
    overlay.classList.add("notification-overlay");

    const box = document.createElement("div");
    box.classList.add("notification-box");

    const text = document.createElement("p");
    text.textContent = message;

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("notification-btn");
    button.textContent = "Окей";

    button.addEventListener("click", () => {
        overlay.remove();
    });

    box.append(text, button);
    overlay.append(box);
    document.body.append(overlay);
}

document.querySelector("form").addEventListener("submit", (event) => {
    const errorMessage = checkOrder();

    if (errorMessage) {
        event.preventDefault();
        showNotification(errorMessage);
    }
});