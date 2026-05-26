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
const polygonBtn = document.getElementById("polygonBtn");
const tools = [brushBtn, lineBtn, rectBtn, circleBtn, polygonBtn];
let polygonPoints = []; // Масив координат вершин ламаної
let startX, startY;
const fillBtn = document.getElementById("fillBtn"); // Знайти нову кнопку
const eraserBtn = document.getElementById("eraserBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");

// Додаємо кнопку до масиву tools, щоб працювало автоматичне підсвічування активного інструмента
tools.push(eraserBtn);

tools.push(fillBtn); // Додати її в масив для авто-перемикання класів

// Універсальна функція перемикання (замість копіпасту для кожної кнопки)
function setActiveTool(toolName, activeBtn) {
  currentTool = toolName;
  // Якщо перемкнулися з багатокутника, очищаємо недомальовані точки
  polygonPoints = [];

  tools.forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

brushBtn.onclick = () => setActiveTool("brush", brushBtn);
lineBtn.onclick = () => setActiveTool("line", lineBtn);
rectBtn.onclick = () => setActiveTool("rect", rectBtn);
circleBtn.onclick = () => setActiveTool("circle", circleBtn);
polygonBtn.onclick = () => setActiveTool("polygon", polygonBtn);
fillBtn.onclick = () => setActiveTool("fill", fillBtn);

// Технічні параметри пензля
ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.strokeStyle = "#e74c3c"; // Червоний колір за замовчуванням

// Логіка малювання
canvas.onmousedown = (e) => {
  const currentX = e.offsetX;
  const currentY = e.offsetY;
  // Окремий алгоритм для довільного багатокутника
  if (currentTool === "polygon") {
    // Перевірка: якщо клікнули близько до ПЕРШОЇ точки (в радіусі 10 пікселів) — замикаємо контур
    if (
      polygonPoints.length > 2 &&
      Math.abs(currentX - polygonPoints[0].x) < 10 &&
      Math.abs(currentY - polygonPoints[0].y) < 10
    ) {
      ctx.putImageData(snapshot, 0, 0); // Повертаємо чистий знімок (без гумової нитки)
      ctx.beginPath();
      ctx.moveTo(
        polygonPoints[polygonPoints.length - 1].x,
        polygonPoints[polygonPoints.length - 1].y
      );
      ctx.lineTo(polygonPoints[0].x, polygonPoints[0].y); // Лінія до першої точки
      ctx.stroke();
      polygonPoints = []; // Очищаємо масив для нової фігури
      saveState(); // Зберігаємо готову фігуру в історію
      return;
    }
    // Якщо це найперша точка фігури — робимо знімок екрана
    if (polygonPoints.length === 0) {
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    // Додаємо поточну точку в масив
    polygonPoints.push({ x: currentX, y: currentY });
    // Одразу малюємо зафіксовані лінії
    ctx.beginPath();
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = lineWidth.value;
    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) {
      ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    ctx.stroke();
    // Оновлюємо snapshot, щоб зафіксувати нову лінію
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return; // Виходимо, щоб не спрацювала стандартна логіка інших інструментів
  }

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
  if (currentTool === "polygon") {
    if (polygonPoints.length === 0) return; // Якщо точок ще немає — нічого не малюємо
    ctx.putImageData(snapshot, 0, 0); // Очищаємо екран до стану останньої стабільної точки
    ctx.beginPath();
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = lineWidth.value;
    // Малюємо лінію від останньої клікнутої точки до поточного положення миші
    const lastPoint = polygonPoints[polygonPoints.length - 1];
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    return;
  }
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
  if (currentTool === "polygon") return; // <--- Ламана (не зберігаємо стан, поки контур не замкнено!)
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
  // Насичуємо полотно білими пікселями з першої секунди
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
const workspace = document.querySelector(".canvas-workspace"); // 1. Знаходимо робочу зону

gridBtn.onclick = () => {
  // 2. Вмикання/вимикання сітки на всьому контейнері
  workspace.classList.toggle("has-grid");
  gridBtn.classList.toggle("active");
};

// Крок 29: Логіка експорту малюнка у файл
function downloadImage() {
  // 1. Отримуємо дані з canvas у вигляді текстового рядка Base64 (формат PNG)
  const dataURL = canvas.toDataURL("image/png");
  // 2. Створюємо віртуальне посилання для скачування в пам'яті браузера
  const link = document.createElement("a");
  link.href = dataURL;
  // 3. Формуємо унікальну назву файлу з міткою поточного часу
  link.download = `unity_paint_${Date.now()}.png`;
  // 4. Емулюємо клік для автоматичного старту завантаження
  link.click();
}
// Прив'язуємо функцію до кліку по дискеті
exportBtn.onclick = downloadImage;

// Крок 30: Логіка імпорту малюнка з файлу
// 1. При кліку на кнопку-папку перенаправляємо клік на прихований input
importBtn.onclick = () => {
  fileInput.click();
};
// 2. Коли користувач обрав файл у вікні — спрацьовує подія "change"
fileInput.onchange = (e) => {
  const file = e.target.files[0]; // Беремо перший обраний файл
  if (!file) return; // Якщо користувач скасував вибір — виходимо
  const reader = new FileReader(); // Створюємо інструмент для зчитування файлів
  // Коли файл успішно зчитано в пам'ять:
  reader.onload = (event) => {
    const img = new Image(); // Створюємо віртуальний об'єкт зображення
    // Коли картинка повністю завантажилася в пам'ять як об'єкт:
    img.onload = () => {
      // Очищуємо полотно перед тим, як вставити нове зображення
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Малюємо картинку на полотні, підганяючи її під розмір нашого canvas (700х500)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Зберігаємо цей стан в історію, щоб працювали Undo/Redo!
      saveState();
      // Скидаємо значення інпуту, щоб можна було завантажити ту саму картинку повторно
      fileInput.value = "";
    };
    img.src = event.target.result; // Передаємо зчитані дані у джерело картинки
  };
  reader.readAsDataURL(file); // Запускаємо зчитування файлу як Base64-рядок
};
// Крок 33: Обробка Touch-подій для сенсорних пристроїв
// Функція точного перерахунку координат дотику з урахуванням адаптивного стиснення Canvas
function getTouchPos(touchEvent) {
  const rect = canvas.getBoundingClientRect();
  const touch = touchEvent.touches[0]; // Фіксуємо перший палець
  // Обрахунки коефіцієнта масштабу (якщо canvas стиснутий на мобільному екрані)
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY,
  };
}
// 1. Початок дотику пальцем (Аналог onmousedown)
canvas.addEventListener("touchstart", (e) => {
  // Залишити інструмент "polygon" тільки для миші через специфіку кліків ламаної
  if (currentTool === "polygon") return;
  e.preventDefault(); // Повністю блокуємо зум сторінки під пальцем розробника
  const touchPos = getTouchPos(e);
  // Сформувати штучну подію та викликати готовий обробник
  canvas.onmousedown({
    offsetX: touchPos.x,
    offsetY: touchPos.y,
  });
});
// 2. Рух пальця по екрану (Аналог onmousemove)
canvas.addEventListener("touchmove", (e) => {
  if (currentTool === "polygon") return;
  e.preventDefault();
  const touchPos = getTouchPos(e);
  canvas.onmousemove({
    offsetX: touchPos.x,
    offsetY: touchPos.y,
  });
});
// 3. Фінал малювання — палець відірвано від екрана (Аналог onmouseup)
canvas.addEventListener("touchend", (e) => {
  if (currentTool === "polygon") return;
  // Викликати готовий обробник відпускання миші
  canvas.onmouseup();
});
