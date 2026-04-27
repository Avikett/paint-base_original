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
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);

  // МІСЦЕ ДОДАВАННЯ:
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = lineWidth.value;
};
canvas.onmouseup = () => (isDrawing = false);
canvas.onmousemove = (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
};
lineWidth.oninput = () => {
  sizeValue.textContent = lineWidth.value + "px";
};

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
