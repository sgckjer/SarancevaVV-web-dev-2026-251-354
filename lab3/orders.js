const API_URL = "https://api.rozetkaimg.me/labs/api/dishes";
const API_KEY = "123e4567-e89b-12d3-a456-426655440000"; // Ваш ключ API
const ORDERS_URL = `https://api.rozetkaimg.me/labs/api/orders?api_key=${API_KEY}`;

let allDishes = [];
let userOrders = [];
let targetOrderId = null;

function showNotification(message) {
    const existing = document.querySelector(".notification-overlay-alert");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.classList.add("notification-overlay", "notification-overlay-alert");

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

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getOrderDishesInfo(order) {
    const dishIds = [
        order.soup_id,
        order.main_course_id,
        order.salad_id,
        order.drink_id,
        order.dessert_id,
    ].filter(Boolean);

    const dishesList = dishIds
        .map((id) => allDishes.find((d) => d.id === id))
        .filter(Boolean);

    const names = dishesList.map((d) => d.name).join(", ");
    const totalPrice = dishesList.reduce((sum, d) => sum + d.price, 0);

    return { names, totalPrice, dishesList };
}

function renderOrdersTable() {
    const tbody = document.getElementById("orders-tbody");
    tbody.innerHTML = "";

    if (userOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">У вас пока нет оформленных заказов.</td></tr>`;
        return;
    }

    userOrders.forEach((order, index) => {
        const { names, totalPrice } = getOrderDishesInfo(order);
        const deliveryText = order.delivery_type === "by_time" && order.delivery_time
            ? order.delivery_time
            : "Как можно скорее (с 7:00 до 23:00)";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDate(order.created_at)}</td>
            <td>${names || "Не указан"}</td>
            <td>${totalPrice}₽</td>
            <td>${deliveryText}</td>
            <td class="actions-cell">
                <button type="button" class="action-btn btn-view" data-action="view" data-id="${order.id}">Подробнее</button>
                <button type="button" class="action-btn btn-edit" data-action="edit" data-id="${order.id}">Редактировать</button>
                <button type="button" class="action-btn btn-delete" data-action="delete" data-id="${order.id}">Удалить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function loadData() {
    try {
        const [dishesRes, ordersRes] = await Promise.all([
            fetch(API_URL),
            fetch(ORDERS_URL),
        ]);

        if (!dishesRes.ok || !ordersRes.ok) {
            throw new Error("Не удалось загрузить данные с сервера");
        }

        allDishes = await dishesRes.json();
        const orders = await ordersRes.json();

        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        userOrders = orders;

        renderOrdersTable();
    } catch (err) {
        console.error(err);
        showNotification(`Ошибка: ${err.message}`);
    }
}

function openViewModal(order) {
    const modal = document.getElementById("modal-view");
    const container = document.getElementById("view-details-content");
    const { names, totalPrice } = getOrderDishesInfo(order);

    const deliveryText = order.delivery_type === "by_time" && order.delivery_time
        ? order.delivery_time
        : "Как можно скорее (с 7:00 до 23:00)";

    container.innerHTML = `
        <div class="order-detail-row"><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</div>
        <div class="order-detail-row"><strong>Имя:</strong> ${order.full_name}</div>
        <div class="order-detail-row"><strong>Адрес доставки:</strong> ${order.delivery_address}</div>
        <div class="order-detail-row"><strong>Время доставки:</strong> ${deliveryText}</div>
        <div class="order-detail-row"><strong>Телефон:</strong> ${order.phone}</div>
        <div class="order-detail-row"><strong>Email:</strong> ${order.email}</div>
        <div class="order-detail-row"><strong>Комментарий:</strong> ${order.comment || "—"}</div>
        <div class="order-detail-row"><strong>Состав заказа:</strong> ${names}</div>
        <div class="order-detail-row"><strong>Стоимость:</strong> ${totalPrice}₽</div>
    `;

    modal.hidden = false;
}

function openEditModal(order) {
    const modal = document.getElementById("modal-edit");
    const form = document.getElementById("edit-order-form");

    document.getElementById("edit-order-id").value = order.id;
    document.getElementById("edit-name").value = order.full_name || "";
    document.getElementById("edit-email").value = order.email || "";
    document.getElementById("edit-phone").value = order.phone || "";
    document.getElementById("edit-address").value = order.delivery_address || "";
    document.getElementById("edit-comment").value = order.comment || "";

    if (order.delivery_type === "by_time") {
        document.getElementById("edit-scheduled").checked = true;
        document.getElementById("edit-delivery-time-value").value = order.delivery_time || "";
    } else {
        document.getElementById("edit-asap").checked = true;
        document.getElementById("edit-delivery-time-value").value = "";
    }

    modal.hidden = false;
}

function openDeleteModal(orderId) {
    targetOrderId = orderId;
    document.getElementById("modal-delete").hidden = false;
}

function closeModals() {
    document.querySelectorAll(".notification-overlay:not(.notification-overlay-alert)").forEach((modal) => {
        modal.hidden = true;
    });
    targetOrderId = null;
}

document.getElementById("orders-tbody").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const orderId = parseInt(btn.dataset.id, 10);
    const order = userOrders.find((o) => o.id === orderId);

    if (action === "view" && order) openViewModal(order);
    if (action === "edit" && order) openEditModal(order);
    if (action === "delete") openDeleteModal(orderId);
});

document.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) {
        closeModals();
    }
});

document.getElementById("edit-order-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const orderId = document.getElementById("edit-order-id").value;
    const deliveryType = document.querySelector('input[name="delivery-time"]:checked').value;
    const deliveryTimeVal = document.getElementById("edit-delivery-time-value").value;

    if (deliveryType === "by_time" && !deliveryTimeVal) {
        showNotification("Укажите точное время доставки");
        return;
    }

    const payload = {
        full_name: document.getElementById("edit-name").value,
        email: document.getElementById("edit-email").value,
        phone: document.getElementById("edit-phone").value,
        delivery_address: document.getElementById("edit-address").value,
        delivery_type: deliveryType,
        delivery_time: deliveryType === "by_time" ? deliveryTimeVal : null,
        comment: document.getElementById("edit-comment").value || null,
    };

    try {
        const res = await fetch(`https://api.rozetkaimg.me/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Не удалось изменить заказ");
        }

        closeModals();
        showNotification("Заказ успешно изменён");
        await loadData();
    } catch (err) {
        console.error(err);
        showNotification(`Ошибка сохранения: ${err.message}`);
    }
});

document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
    if (!targetOrderId) return;

    try {
        const res = await fetch(`https://api.rozetkaimg.me/labs/api/orders/${targetOrderId}?api_key=${API_KEY}`, {
            method: "DELETE",
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Не удалось удалить заказ");
        }

        closeModals();
        showNotification("Заказ успешно удалён");
        await loadData();
    } catch (err) {
        console.error(err);
        showNotification(`Ошибка удаления: ${err.message}`);
    }
});

document.addEventListener("DOMContentLoaded", loadData);