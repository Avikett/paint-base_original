// Нові змінні для Кроку 14
const tool = document.getElementById("tool");
let startX, startY;

const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
let isDrawing = false;
const colorPicker = document.getElementById("colorPicker");
const lineWidth = document.getElementById("lineWidth");
const sizeValue = document.getElementById("sizeValue");

// Технічні параметри пензля
ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.strokeStyle = "#e74c3c"; // Червоний колір за замовчуванням
// Логіка малювання
canvas.onmousedown = (e) => {
  isDrawing = true;
  // Запам'ятовуємо початкову точку (для обох інструментів)
  startX = e.offsetX;
  startY = e.offsetY;

  ctx.beginPath();

  // Оновлюємо параметри з повзунків
  ctx.strokeStyle = document.getElementById("colorPicker").value;
  ctx.lineWidth = document.getElementById("lineWidth").value;
  if (tool.value === "brush") {
    ctx.moveTo(startX, startY);
  }
};
canvas.onmousemove = (e) => {
  // Пензель малює постійно, поки ми рухаємо мишу
  if (isDrawing && tool.value === "brush") {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
};
canvas.onmouseup = (e) => {
  // Лінія малюється один раз тільки в момент відпускання кнопки
  if (isDrawing && tool.value === "line") {
    ctx.moveTo(startX, startY);
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = lineWidth.value;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
  isDrawing = false;
};

lineWidth.oninput = () => {
  sizeValue.textContent = lineWidth.value + "px";
};

//<!--TEORET1K-->

// 1. Знаходимо кнопку в HTML
const clearBtn = document.getElementById("clearBtn");

// 2. Описуємо, що станеться при кліку
clearBtn.onclick = () => {
  // clearRect видаляє все у вказаному прямокутнику (від 0,0 до краю полотна)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Додаткова перестраховка: скидаємо шлях, щоб наступна лінія не почалася зі старого місця
  ctx.beginPath();
};
// --- Крок 13: Додаємо рамку та підпис ---
colorPicker.oninput = () => {
  // автор: ім'я / нік
  ctx.strokeStyle = colorPicker.value;
  colorPicker.style.borderColor = colorPicker.value;
};
