let currentLevel = 0;
let currentQuestion = 0;
let xp = 0;

/* 页面切换 */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* 显示地图 */
function showMap() {
  showScreen("map");

  let list = document.getElementById("levelList");
  list.innerHTML = "";

  levels.forEach((lvl, index) => {
    let btn = document.createElement("div");
    btn.className = "btn";
    btn.innerText = lvl.name;
    btn.onclick = () => startLevel(index);
    list.appendChild(btn);
  });
}

/* 开始关卡 */
function startLevel(index) {
  currentLevel = index;
  currentQuestion = 0;
  showScreen("game");

  document.getElementById("levelTitle").innerText = levels[index].name;

  loadQuestion();
}

/* 加载问题 */
function loadQuestion() {
  let q = levels[currentLevel].questions[currentQuestion];

  document.getElementById("question").innerText = q.text;

  let choices = document.getElementById("choices");
  choices.innerHTML = "";

  q.options.forEach((opt, i) => {
    let btn = document.createElement("div");
    btn.className = "btn";
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(i);
    choices.appendChild(btn);
  });
}

/* XP */
function gainXP(amount) {
  xp += amount;
  document.getElementById("xpBar").style.width = xp + "%";
}

/* 检查答案 */
function checkAnswer(i) {
  let q = levels[currentLevel].questions[currentQuestion];
  let feedback = document.getElementById("feedback");

  document.body.classList.remove("correct", "shake");

  if (i === q.answer) {
    feedback.innerText = "✔️ 正确！";
    document.body.classList.add("correct");
    gainXP(10);
  } else {
    feedback.innerText = "❌ " + q.explanation;
    document.body.classList.add("shake");
  }

  currentQuestion++;

  setTimeout(() => {
    if (currentQuestion < levels[currentLevel].questions.length) {
      loadQuestion();
    } else {
      feedback.innerText = "🎉 完成关卡！";
      showMap();
    }
  }, 1200);
}
