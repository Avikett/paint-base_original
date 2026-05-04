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
const rectBtn = document.getElementById("rectBtn");
const circleBtn = document.getElementById("circleBtn");
const tools = [brushBtn, lineBtn, rectBtn, circleBtn];

let snapshot; // Тут буде зберігатись "фотографія" полотна

let startX, startY;
// Обробка натискання на "Пензель"
brushBtn.onclick = () => {
  currentTool = "brush";
  // Універсальна функція перемикання (замість копіпасту для кожної кнопки)
  function setActiveTool(toolName, activeBtn) {
    currentTool = toolName;
    tools.forEach((btn) => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  }
};

// Обробка натискання на "Лінію"
lineBtn.onclick = () => {
  brushBtn.onclick = () => setActiveTool("brush", brushBtn);
  lineBtn.onclick = () => setActiveTool("line", lineBtn);
  rectBtn.onclick = () => setActiveTool("rect", rectBtn);
  circleBtn.onclick = () => setActiveTool("circle", circleBtn);
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
  {
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
