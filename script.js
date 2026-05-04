const canvas = document.querySelector("#board");
//azzov99
let snapshot; // Тут буде зберігатись "фотографія" полотна
const ctx = canvas.getContext("2d");
let isDrawing = false;
const colorPicker = document.getElementById("colorPicker");
const lineWidth = document.getElementById("lineWidth");
const sizeValue = document.getElementById("sizeValue");
// Нові змінні для Кроку 14
let currentTool = "brush"; // Поточний інструмент
//azzov99
const brushBtn = document.getElementById("brushBtn");
const lineBtn = document.getElementById("lineBtn");
const rectBtn = document.getElementById("rectBtn");
const circleBtn = document.getElementById("circleBtn");
const tools = [brushBtn, lineBtn, rectBtn, circleBtn];
const fillBtn = document.getElementById("fillBtn"); // Знайти нову кнопку
tools.push(fillBtn); // Додати її в масив для авто-перемикання класів

let startX, startY;
//azzov99
// Універсальна функція перемикання (замість копіпасту для кожної кнопки)
function setActiveTool(toolName, activeBtn) {
  currentTool = toolName;
  tools.forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

brushBtn.onclick = () => setActiveTool("brush", brushBtn);
lineBtn.onclick = () => setActiveTool("line", lineBtn);
rectBtn.onclick = () => setActiveTool("rect", rectBtn);
circleBtn.onclick = () => setActiveTool("circle", circleBtn);
fillBtn.onclick = () => setActiveTool("fill", fillBtn);

// Технічні параметри пензля
ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.strokeStyle = "#e74c3c"; // Червоний колір за замовчуванням

//azzov99
// Логіка малювання
canvas.onmousedown = (e) => {
  startX = e.offsetX;
  startY = e.offsetY;

  if (currentTool === "fill") {
    floodFill(startX, startY, colorPicker.value);
    return; // Виходимо, щоб не починати малювання ліній
  }

  isDrawing = true;
  ctx.beginPath();
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = lineWidth.value;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (currentTool === "brush") {
    ctx.moveTo(startX, startY);
  }
};

//azzov99
canvas.onmousemove = (e) => {
  if (!isDrawing) return;

  if (currentTool === "brush") {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else {
    // Для всіх геометричних фігур спочатку повертаємо чистий знімок
    ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();

    if (currentTool === "line") {
      ctx.moveTo(startX, startY);
      ctx.lineTo(e.offsetX, e.offsetY);
    } else if (currentTool === "rect") {
      // Прямокутник: (x, y, ширина, висота)
      ctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    } else if (currentTool === "circle") {
      // Малюємо коло, де центр — початкова точка, а радіус — відстань до миші
      let radius = Math.sqrt(
        Math.pow(e.offsetX - startX, 2) + Math.pow(e.offsetY - startY, 2)
      );
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    }

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

//azzov99
function floodFill(startX, startY, fillColor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const startPos = (startY * canvas.width + startX) * 4;
  const startR = pixels[startPos];
  const startG = pixels[startPos + 1];
  const startB = pixels[startPos + 2];
  const startA = pixels[startPos + 3];

  // Перетворюємо HEX у RGB
  const r = parseInt(fillColor.slice(1, 3), 16);
  const g = parseInt(fillColor.slice(3, 5), 16);
  const b = parseInt(fillColor.slice(5, 7), 16);

  if (startR === r && startG === g && startB === b) return;

  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const pos = (y * canvas.width + x) * 4;

    if (
      x >= 0 &&
      x < canvas.width &&
      y >= 0 &&
      y < canvas.height &&
      pixels[pos] === startR &&
      pixels[pos + 1] === startG &&
      pixels[pos + 2] === startB &&
      pixels[pos + 3] === startA
    ) {
      pixels[pos] = r;
      pixels[pos + 1] = g;
      pixels[pos + 2] = b;
      pixels[pos + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
