const canvas = document.querySelector("#board");
//azzov99
let snapshot; // Тут буде зберігатись "фотографія" полотна
const ctx = canvas.getContext("2d");
let isDrawing = false;
const colorPicker = document.getElementById("colorPicker");
const lineWidth = document.getElementById("lineWidth");
const sizeValue = document.getElementById("sizeValue");
// Нові змінні для Кроку 15
let currentTool = "brush"; // Поточний інструмент
//azzov99
const brushBtn = document.getElementById("brushBtn");
const lineBtn = document.getElementById("lineBtn");
const rectBtn = document.getElementById("rectBtn");
const circleBtn = document.getElementById("circleBtn");
const tools = [brushBtn, lineBtn, rectBtn, circleBtn];
let startX, startY;
const fillBtn = document.getElementById("fillBtn"); // Знайти нову кнопку
const eraserBtn = document.getElementById("eraserBtn");

// Додаємо кнопку до масиву tools, щоб працювало автоматичне підсвічування активного інструмента
tools.push(eraserBtn);

tools.push(fillBtn); // Додати її в масив для авто-перемикання класів

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

  // Знімок: копіюємо все, що вже намальовано, у змінну
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (currentTool === "brush") {
    ctx.moveTo(startX, startY);
  }
};

canvas.onmousemove = (e) => {
  if (!isDrawing) return;

  if (currentTool === "brush" || currentTool === "eraser") {
    // 1. Встановлюємо колір: білий для ластика або вибраний для пензля
    ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : colorPicker.value;
    // 2. Встановлюємо товщину: беремо актуальне значення з повзунка
    ctx.lineWidth = document.getElementById("lineWidth").value;
    // 3. Малюємо лінію
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
      // Точкова зміна “Еліпс”: замість кола малюємо еліпс
      ctx.beginPath();
      let rx = Math.abs(e.offsetX - startX); // Півось x
      let ry = Math.abs(e.offsetY - startY); // Півось y
      ctx.ellipse(startX, startY, rx, ry, 0, 0, 2 * Math.PI);
    }
    ctx.stroke();
  }
};

canvas.onmouseup = () => {
  if (isDrawing) {
    isDrawing = false;
    saveState(); // Зберігаємо результат малювання лінії, фігури чи заливки
  }
};

lineWidth.onchange = () => {
  sizeValue.textContent = lineWidth.value + "px";
};

// 1. Знаходимо кнопку в HTML
const clearBtn = document.getElementById("clearBtn");

clearBtn.onclick = () => {
  // Видаляємо малюнок
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  // Повертаємо панель інструментів до початкового стану.
  // Тепер "Корзина" сама вмикає "Пензель" та змінює курсор!
  setActiveTool("brush", brushBtn);
  // Фіксуємо порожнє полотно в історії (Undo/Redo)
  saveState();
};

// --- Крок 13: Додаємо рамку та підпис ---
colorPicker.oninput = () => {
  // автор: Aviket
  ctx.strokeStyle = colorPicker.value;
  colorPicker.style.borderColor = colorPicker.value;
};

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

  if (startR === r && startG === g && startB === b && startA === 255) return;

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
  // Рядок після ctx.putImageData
  ctx.putImageData(imageData, 0, 0);
  // Точкова зміна 4:
  saveState(); // ГАРАНТОВАНО зберігаємо результат заливки в історії
}

eraserBtn.onclick = () => {
  setActiveTool("eraser", eraserBtn);
};

// Точкова зміна 1: замість стеків один масив з вказівником
let history = []; // Сюди складаємо знімки полотна
let historyIndex = -1; // Вказівник на поточний стан в історії

const maxHistory = 10; // Обмеження, щоб не перевантажити пам'ять браузера

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

// Функція для створення знімка екрана
// Точкова зміна 2: нова логіка для збереження стану з вказівником
function saveState() {
  // 1. Кожна нова дія користувача ГАРАНТОВАНО видаляє "майбутнє",
  // якщо ми зробили Undo і вказівник (historyIndex) знаходиться посередині історії.
  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }
  // 2. Зберігаємо поточний стан полотна
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  history.push(snapshot);
  historyIndex++;
  // 3. Обмеження, щоб не перевантажити пам'ять браузера
  if (history.length > maxHistory) {
    history.shift(); // Видаляємо найстаріший крок
    historyIndex--; // Зсуваємо вказівник, бо нульовий елемент видалено
  }
}

// Кнопка Скасувати
// Точкова зміна 3: нова логіка для кнопок histories
// Кнопка Скасувати (Undo)
undoBtn.onclick = () => {
  if (historyIndex > 0) {
    // Переконуємося, що є куди повертатися
    historyIndex--; // Рухаємо вказівник НАЗАД
    const previousState = history[historyIndex];
    ctx.putImageData(previousState, 0, 0); // Перемальовуємо
  }
};
// Кнопка Повторити (Redo)
redoBtn.onclick = () => {
  if (historyIndex < history.length - 1) {
    // Переконуємося, що є майбутнє
    historyIndex++; // Рухаємо вказівник ВПЕРЕД
    const nextState = history[historyIndex];
    ctx.putImageData(nextState, 0, 0); // Перемальовуємо
  }
};

window.onload = () => {
  saveState(); // Тепер перший крок в історії — пусте полотно
};
// Оновлена функція з підтримкою курсорів
function setActiveTool(toolName, activeBtn) {
  currentTool = toolName;

  // 1. UI: Оновлюємо підсвічування кнопок
  tools.forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");

  // 2. UX: Змінюємо вигляд курсору на полотні
  // Спочатку видаляємо всі можливі класи курсорів, щоб вони не накладалися один на одного
  canvas.classList.remove(
    "cursor-brush",
    "cursor-eraser",
    "cursor-fill",
    "cursor-shapes"
  );

  // Тепер додаємо потрібний клас залежно від вибраного інструменту
  if (toolName === "brush") {
    canvas.classList.add("cursor-brush");
  } else if (toolName === "eraser") {
    canvas.classList.add("cursor-eraser");
  } else if (toolName === "fill") {
    canvas.classList.add("cursor-fill");
  } else {
    // Для ліній, прямокутників та кіл використовуємо загальний клас фігур
    canvas.classList.add("cursor-shapes");
  }
}

// Прив'язка інструментів до логіки перемикання та курсорів (вставляти в кінець файлу)
brushBtn.onclick = () => setActiveTool("brush", brushBtn);
lineBtn.onclick = () => setActiveTool("line", lineBtn);
rectBtn.onclick = () => setActiveTool("rect", rectBtn);
circleBtn.onclick = () => setActiveTool("circle", circleBtn);
fillBtn.onclick = () => setActiveTool("fill", fillBtn);
eraserBtn.onclick = () => setActiveTool("eraser", eraserBtn);

// Крок 28: Логіка кнопки сітки
const gridBtn = document.getElementById("gridBtn");

gridBtn.onclick = () => {
  // toggle автоматично додає клас, якщо його немає, і видаляє, якщо він є!
  canvas.classList.toggle("has-grid");
  
  // Додамо візуальний ефект: якщо сітка увімкнена, кнопка стає активною
  gridBtn.classList.toggle("active");
};

