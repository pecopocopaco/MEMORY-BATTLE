const SYMBOLS = [
  "🍎", "🐱", "⭐", "🍀",
  "🐶", "🔥", "🌙", "🎵",
  "🍕", "🚀", "🌈", "🐸",
  "🎯", "🍩", "⚡", "🎲"
];

const TOTAL_ROUNDS = 10;
const MIN_ROUTE = 5;
const MAX_ROUTE = 8;
const MEMORY_SECONDS = 5;

const state = {
  phase: "idle",
  round: 1,
  currentSetter: 1,
  scores: { 1: 0, 2: 0 },
  correctSequence: [],
  playerSequence: [],
  routeLength: 0,
  countdownTimer: null
};

const grid = document.getElementById("grid");
const status = document.getElementById("status");
const countdown = document.getElementById("countdown");
const message = document.getElementById("message");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");
const roundLabel = document.getElementById("roundLabel");
const roleLabel = document.getElementById("roleLabel");
const startButton = document.getElementById("startButton");
const nextButton = document.getElementById("nextButton");
const resetButton = document.getElementById("resetButton");
const player1Card = document.getElementById("player1Card");
const player2Card = document.getElementById("player2Card");

function buildGrid() {
  grid.innerHTML = "";

  SYMBOLS.forEach((symbol, index) => {
    const button = document.createElement("button");
    button.className = "cell";
    button.type = "button";
    button.textContent = symbol;
    button.dataset.index = index;
    button.setAttribute("aria-label", `マス ${index + 1}`);
    button.addEventListener("click", () => handleCellClick(index));
    grid.appendChild(button);
  });
}

function cells() {
  return [...grid.querySelectorAll(".cell")];
}

function setStatus(text) {
  status.textContent = text;
}

function setMessage(text = "", type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function updateScoreboard() {
  score1.textContent = state.scores[1];
  score2.textContent = state.scores[2];

  player1Card.classList.toggle(
    "active",
    state.phase !== "idle" && state.currentSetter === 1
  );
  player2Card.classList.toggle(
    "active",
    state.phase !== "idle" && state.currentSetter === 2
  );
}

function updateRoundInfo() {
  roundLabel.textContent = `ROUND ${state.round} / ${TOTAL_ROUNDS}`;

  const answerPlayer = state.currentSetter === 1 ? 2 : 1;

  if (state.phase === "setting") {
    roleLabel.textContent = `PLAYER ${state.currentSetter} が出題`;
  } else if (state.phase === "countdown") {
    roleLabel.textContent = `PLAYER ${state.currentSetter} が出題`;
  } else if (state.phase === "answering") {
    roleLabel.textContent = `PLAYER ${answerPlayer} が回答`;
  } else {
    roleLabel.textContent = `PLAYER ${state.currentSetter} が出題`;
  }
}

function updateProgress() {
  const current = state.playerSequence.length;
  const max = state.routeLength || MAX_ROUTE;

  progressText.textContent = `${current} / ${max}`;
  progressBar.style.width = `${Math.min(100, (current / max) * 100)}%`;
}

function setGridEnabled(enabled) {
  cells().forEach(cell => {
    cell.classList.toggle("disabled", !enabled);
  });
}

function clearGridVisuals() {
  cells().forEach(cell => {
    cell.classList.remove(
      "route",
      "answer-correct",
      "answer-wrong",
      "reveal",
      "reveal-number",
      "disabled"
    );
    cell.removeAttribute("data-number");
  });
}

function markCell(index, className) {
  const cell = cells()[index];
  if (cell) cell.classList.add(className);
}

function startGame() {
  clearTimeout(state.countdownTimer);
  state.phase = "setting";
  state.round = 1;
  state.currentSetter = 1;
  state.scores = { 1: 0, 2: 0 };
  state.correctSequence = [];
  state.playerSequence = [];
  state.routeLength = randomRouteLength();

  startButton.hidden = true;
  nextButton.hidden = true;

  clearGridVisuals();
  setGridEnabled(true);
  setMessage("");
  setStatus(`PLAYER ${state.currentSetter}：ルートを作ってください`);
  countdown.textContent = "5〜8マス";
  updateScoreboard();
  updateRoundInfo();
  updateProgress();
}

function randomRouteLength() {
  return Math.floor(Math.random() * (MAX_ROUTE - MIN_ROUTE + 1)) + MIN_ROUTE;
}

function handleCellClick(index) {
  if (state.phase === "setting") {
    handleSettingClick(index);
  } else if (state.phase === "answering") {
    handleAnswerClick(index);
  }
}

function handleSettingClick(index) {
  if (state.playerSequence.includes(index)) {
    setMessage("同じマスはもう一度選べません", "failure");
    return;
  }

  // 本当に「一筆書き」にするため、前のマスと隣接している必要がある。
  if (state.playerSequence.length > 0) {
    const previous = state.playerSequence[state.playerSequence.length - 1];

    if (!isAdjacent(previous, index)) {
      setMessage("となりのマスにつないでください", "failure");
      return;
    }
  }

  state.playerSequence.push(index);
  markCell(index, "route");

  const number = state.playerSequence.length;
  const cell = cells()[index];
  cell.dataset.number = number;
  cell.classList.add("reveal-number");

  updateProgress();
  setMessage(`現在 ${number} マス。あと ${Math.max(0, state.routeLength - number)} マス`);

  if (state.playerSequence.length >= state.routeLength) {
    finishSetting();
  }
}

function isAdjacent(a, b) {
  const ar = Math.floor(a / 4);
  const ac = a % 4;
  const br = Math.floor(b / 4);
  const bc = b % 4;

  return Math.max(Math.abs(ar - br), Math.abs(ac - bc)) === 1;
}

function finishSetting() {
  state.correctSequence = [...state.playerSequence];

  state.phase = "countdown";
  setGridEnabled(false);
  setStatus("覚える時間！");

  let remaining = MEMORY_SECONDS;
  countdown.textContent = remaining;
  setMessage("このルートを覚えてください", "gold");

  state.countdownTimer = setInterval(() => {
    remaining -= 1;

    if (remaining > 0) {
      countdown.textContent = remaining;
    } else {
      clearInterval(state.countdownTimer);
      countdown.textContent = "";
      startAnswerPhase();
    }
  }, 1000);
}

function startAnswerPhase() {
  state.phase = "answering";
  state.playerSequence = [];

  clearGridVisuals();
  setGridEnabled(true);

  const answerPlayer = state.currentSetter === 1 ? 2 : 1;

  setStatus(`PLAYER ${answerPlayer}：同じルートを再現！`);
  setMessage("順番まで完全に一致させよう");
  updateRoundInfo();
  updateProgress();
}

function handleAnswerClick(index) {
  const expected = state.correctSequence[state.playerSequence.length];

  if (index === expected) {
    state.playerSequence.push(index);
    markCell(index, "answer-correct");
    updateProgress();

    if (state.playerSequence.length === state.correctSequence.length) {
      const answerPlayer = state.currentSetter === 1 ? 2 : 1;
      awardPoint(answerPlayer, "完全再現！ 回答側に +1", true);
    }
  } else {
    markCell(index, "answer-wrong");
    awardPoint(state.currentSetter, "回答ミス！ 出題側に +1", false);
  }
}

function awardPoint(player, resultText, success) {
  state.scores[player] += 1;
  state.phase = "result";

  clearTimeout(state.countdownTimer);
  setGridEnabled(false);
  updateScoreboard();

  if (success) {
    setStatus("🎉 正解！");
    setMessage(resultText, "success");
  } else {
    setStatus("💥 ミス！");
    setMessage(resultText, "failure");
  }

  revealCorrectRoute();
  nextButton.hidden = false;
  nextButton.textContent =
    state.round >= TOTAL_ROUNDS ? "結果を見る" : "次のラウンド";
}

function revealCorrectRoute() {
  state.correctSequence.forEach((index, i) => {
    const cell = cells()[index];
    if (!cell) return;

    setTimeout(() => {
      cell.classList.add("reveal");
      cell.classList.add("reveal-number");
      cell.dataset.number = i + 1;
    }, i * 80);
  });
}

function nextRound() {
  if (state.round >= TOTAL_ROUNDS) {
    showGameOver();
    return;
  }

  state.round += 1;
  state.currentSetter = state.currentSetter === 1 ? 2 : 1;
  state.routeLength = randomRouteLength();
  state.playerSequence = [];
  state.correctSequence = [];
  state.phase = "setting";

  clearGridVisuals();
  setGridEnabled(true);
  setMessage("");
  countdown.textContent = "5〜8マス";
  setStatus(`PLAYER ${state.currentSetter}：ルートを作ってください`);

  nextButton.hidden = true;
  updateScoreboard();
  updateRoundInfo();
  updateProgress();
}

function showGameOver() {
  state.phase = "gameover";
  setGridEnabled(false);
  nextButton.hidden = true;

  let result;

  if (state.scores[1] > state.scores[2]) {
    result = "🏆 PLAYER 1 の勝利！";
  } else if (state.scores[2] > state.scores[1]) {
    result = "🏆 PLAYER 2 の勝利！";
  } else {
    result = "🤝 引き分け！";
  }

  setStatus("GAME OVER");
  setMessage(
    `${result}　${state.scores[1]} - ${state.scores[2]}`,
    "gold"
  );
  countdown.textContent = "";
  startButton.hidden = false;
  startButton.textContent = "もう一度プレイ";
}

function resetGame() {
  clearTimeout(state.countdownTimer);
  clearInterval(state.countdownTimer);

  state.phase = "idle";
  state.round = 1;
  state.currentSetter = 1;
  state.scores = { 1: 0, 2: 0 };
  state.correctSequence = [];
  state.playerSequence = [];
  state.routeLength = 0;

  clearGridVisuals();
  setGridEnabled(false);
  setStatus("ゲームスタートを押してください");
  countdown.textContent = "";
  setMessage("");
  startButton.hidden = false;
  startButton.textContent = "ゲームスタート";
  nextButton.hidden = true;

  updateScoreboard();
  updateRoundInfo();
  updateProgress();
}

startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", nextRound);
resetButton.addEventListener("click", resetGame);

buildGrid();
resetGame();
