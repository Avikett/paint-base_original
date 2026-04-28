const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
let isDrawing = false;

// Технічні параметри пензля
ctx.lineWidth = 20;
ctx.lineCap = "round";
ctx.strokeStyle = "darkgreen"; // Червоний колір за замовчуванням

// Логіка малювання
canvas.onmousedown = (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
};
canvas.onmouseup = () => (isDrawing = false);
canvas.onmousemove = (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
};

const colorPicker = document.getElementById("colorPicker");
const lineWidth = document.getElementById("lineWidth");

// У функції, де відбувається малювання (там, де ctx.stroke()),
// перед початком лінії додайте:
ctx.strokeStyle = colorPicker.value;
ctx.lineWidth = lineWidth.value;

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
