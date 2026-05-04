const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
let isDrawing = false;
const colorPicker = document.getElementById("colorPicker");
const lineWidth = document.getElementById("lineWidth");
const sizeValue = document.getElementById("sizeValue");
// Нові змінні для Кроку 14
let currentTool = "brush"; // Поточний інструмент
const brushBtn = document.getElementById("brushBtn");
const lineBtn = document.getElementById("lineBtn");
let snapshot; // Тут буде зберігатись "фотографія" полотна

let startX, startY;
// Обробка натискання на "Пензель"
brushBtn.onclick = () => {
  currentTool = "brush";
  brushBtn.classList.add("active"); // Підсвічуємо
  lineBtn.classList.remove("active"); // Гасимо іншу
};

// Обробка натискання на "Лінію"
lineBtn.onclick = () => {
  currentTool = "line";
  lineBtn.classList.add("active");
  brushBtn.classList.remove("active");
};

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
  // Знімок: копіюємо все, що вже намальовано, у змінну
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (currentTool === "brush") {
    ctx.moveTo(startX, startY);
  }

  // Оновлюємо параметри з повзунків
  ctx.strokeStyle = document.getElementById("colorPicker").value;
  ctx.lineWidth = document.getElementById("lineWidth").value;
  if (currentTool === "brush") {
    ctx.moveTo(startX, startY);
  }
};
canvas.onmousemove = (e) => {
  if (!isDrawing) return;
  if (currentTool === "brush") {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (currentTool === "line") {
    // ЕФЕКТ ГУМОВОЇ НИТКИ:
    // 1. Повертаємо полотно до стану "до початку малювання лінії"
    ctx.putImageData(snapshot, 0, 0);
    // 2. Малюємо лінію заново в нову позицію миші
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
};

canvas.onmouseup = (e) => {
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
