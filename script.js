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
  mode: null, // "cpu" or "twoPlayer"
  phase: "mode",
  round: 1,
  currentSetter: "cpu",
  scores: { player: 0, opponent: 0 },
  correctSequence: [],
  playerSequence: [],
  routeLength: 0,
  countdownTimer: null
};

const modeScreen = document.getElementById("modeScreen");
const gameScreen = document.getElementById("gameScreen");
const cpuModeButton = document.getElementById("cpuModeButton");
const twoPlayerModeButton = document.getElementById("twoPlayerModeButton");

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
const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");
const startButton = document.getElementById("startButton");
const nextButton = document.getElementById("nextButton");
const backButton = document.getElementById("backButton");
const resetButton = document.getElementById("resetButton");
const player1Card = document.getElementById("player1Card");
const player2Card = document.getElementById("player2Card");
const rulesList = document.getElementById("rulesList");

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

function updateNames() {
  if (state.mode === "cpu") {
    player1Name.textContent = "YOU";
    player2Name.textContent = "CPU";
    rulesList.innerHTML = `
      <li>CPUが5〜8マスのルートを作る。</li>
      <li>5秒間だけルートを記憶する。</li>
      <li>同じ順番でルートを再現する。</li>
      <li>完全再現 → あなたに <b>+1</b></li>
      <li>間違える → CPUに <b>+1</b></li>
    `;
  } else {
    player1Name.textContent = "PLAYER 1";
    player2Name.textContent = "PLAYER 2";
    rulesList.innerHTML = `
      <li>出題側が5〜8マスのルートを作る。</li>
      <li>5秒間だけルートを記憶する。</li>
      <li>同じ順番でルートを再現する。</li>
      <li>完全再現 → 回答側に <b>+1</b></li>
      <li>間違える → 出題側に <b>+1</b></li>
    `;
  }
}

function updateScoreboard() {
  score1.textContent = state.mode === "cpu"
    ? state.scores.player
    : state.scores[1] ?? 0;

  score2.textContent = state.mode === "cpu"
    ? state.scores.opponent
    : state.scores[2] ?? 0;

  player1Card.classList.remove("active");
  player2Card.classList.remove("active");

  if (state.mode === "cpu") {
    if (state.currentSetter === "cpu") {
      player2Card.classList.add("active");
    } else if (state.phase === "answering") {
      player1Card.classList.add("active");
    }
  } else {
    if (state.currentSetter === 1) {
      player1Card.classList.add("active");
    } else {
      player2Card.classList.add("active");
    }
  }
}

function updateRoundInfo() {
  roundLabel.textContent = `ROUND ${state.round} / ${TOTAL_ROUNDS}`;

  if (state.mode === "cpu") {
    roleLabel.textContent =
      state.currentSetter === "cpu"
        ? "CPU が出題"
        : "あなたが回答";
  } else {
    const answerPlayer = state.currentSetter === 1 ? 2 : 1;
    roleLabel.textContent =
      state.phase === "answering"
        ? `PLAYER ${answerPlayer} が回答`
        : `PLAYER ${state.currentSetter} が出題`;
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

function selectMode(mode) {
  clearTimeout(state.countdownTimer);
  clearInterval(state.countdownTimer);

  state.mode = mode;
  state.phase = "idle";
  state.round = 1;
  state.scores = { player: 0, opponent: 0 };
  state.correctSequence = [];
  state.playerSequence = [];
  state.routeLength = 0;

  if (mode === "cpu") {
    state.currentSetter = "cpu";
  } else {
    state.currentSetter = 1;
  }

  modeScreen.hidden = true;
  gameScreen.hidden = false;

  updateNames();
  updateScoreboard();
  updateRoundInfo();
  updateProgress();
  resetBoard();

  startButton.textContent = "ゲームスタート";
  startButton.hidden = false;
  nextButton.hidden = true;
}

function startGame() {
  clearTimeout(state.countdownTimer);
  clearInterval(state.countdownTimer);

  state.phase = "setting";
  state.round = 1;
  state.scores = { player: 0, opponent: 0 };
  state.correctSequence = [];
  state.playerSequence = [];
  state.routeLength = randomRouteLength();

  if (state.mode === "cpu") {
    state.currentSetter = "cpu";
    startCpuRound();
  } else {
    state.currentSetter = 1;
    startHumanSetting();
  }

  startButton.hidden = true;
  nextButton.hidden = true;
  updateScoreboard();
  updateRoundInfo();
}

function randomRouteLength() {
  return Math.floor(Math.random() * (MAX_ROUTE - MIN_ROUTE + 1)) + MIN_ROUTE;
}

function resetBoard() {
  clearGridVisuals();
  setGridEnabled(false);
  setStatus(
    state.mode === "cpu"
      ? "ゲームスタートを押してください"
      : "ゲームスタートを押してください"
  );
  countdown.textContent = "";
  setMessage("");
  updateProgress();
}

function startHumanSetting() {
  state.phase = "setting";
  state.playerSequence = [];
  state.routeLength = randomRouteLength();

  clearGridVisuals();
  setGridEnabled(true);
  setStatus(`PLAYER ${state.currentSetter}：ルートを作ってください`);
  countdown.textContent = "5〜8マス";
  setMessage("となりのマスへつないで一筆書き！");

  updateScoreboard();
  updateRoundInfo();
  updateProgress();
}

function startCpuRound() {
  state.phase = "countdown";
  state.playerSequence = [];
  state.routeLength = randomRouteLength();
  state.correctSequence = generateCpuRoute(state.routeLength);

  clearGridVisuals();
  setGridEnabled(false);

  setStatus("🤖 CPUがルートを作っています…");
  countdown.textContent = "";
  setMessage("CPUのルートを覚えてください", "gold");

  // CPUのルートを少しずつ表示して、人間が出題しているように見せる。
  state.correctSequence.forEach((index, i) => {
    setTimeout(() => {
      if (state.phase !== "countdown") return;
      markCell(index, "route");
    }, i * 130);
  });

  const showTime = state.correctSequence.length * 130 + 350;

  setTimeout(() => {
    if (state.phase !== "countdown") return;
    startMemoryCountdown();
  }, showTime);
}

function generateCpuRoute(length) {
  const start = Math.floor(Math.random() * 16);
  const route = [start];

  while (route.length < length) {
    const current = route[route.length - 1];
    const candidates = getNeighbors(current)
      .filter(index => !route.includes(index));

    if (candidates.length === 0) {
      // 行き止まりなら、最初から作り直す。
      return generateCpuRoute(length);
    }

    // 少しランダム性を持たせる。
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    route.push(next);
  }

  return route;
}

function getNeighbors(index) {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const result = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;

      const nr = row + dr;
      const nc = col + dc;

      if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
        result.push(nr * 4 + nc);
      }
    }
  }

  return result;
}

function startMemoryCountdown() {
  state.phase = "countdown";
  clearGridVisuals();
  setGridEnabled(false);

  let remaining = MEMORY_SECONDS;
  setStatus("覚える時間！");
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

  if (state.mode === "cpu") {
    setStatus("あなた：同じルートを再現！");
    setMessage("順番まで完全に一致させよう");
  } else {
    const answerPlayer = state.currentSetter === 1 ? 2 : 1;
    setStatus(`PLAYER ${answerPlayer}：同じルートを再現！`);
    setMessage("順番まで完全に一致させよう");
  }

  updateRoundInfo();
  updateScoreboard();
  updateProgress();
}

function handleCellClick(index) {
  if (state.phase === "setting" && state.mode === "twoPlayer") {
    handleHumanSettingClick(index);
  } else if (state.phase === "answering") {
    handleAnswerClick(index);
  }
}

function handleHumanSettingClick(index) {
  if (state.playerSequence.includes(index)) {
    setMessage("同じマスはもう一度選べません", "failure");
    return;
  }

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
  setMessage(
    `現在 ${number} マス。あと ${Math.max(0, state.routeLength - number)} マス`
  );

  if (state.playerSequence.length >= state.routeLength) {
    finishHumanSetting();
  }
}

function isAdjacent(a, b) {
  const ar = Math.floor(a / 4);
  const ac = a % 4;
  const br = Math.floor(b / 4);
  const bc = b % 4;

  return Math.max(Math.abs(ar - br), Math.abs(ac - bc)) === 1;
}

function finishHumanSetting() {
  state.correctSequence = [...state.playerSequence];
  startMemoryCountdown();
}

function handleAnswerClick(index) {
  const expected = state.correctSequence[state.playerSequence.length];

  if (index === expected) {
    state.playerSequence.push(index);
    markCell(index, "answer-correct");
    updateProgress();

    if (state.playerSequence.length === state.correctSequence.length) {
      if (state.mode === "cpu") {
        awardPoint("player", "完全再現！ あなたに +1", true);
      } else {
        const answerPlayer = state.currentSetter === 1 ? 2 : 1;
        awardPoint(answerPlayer, "完全再現！ 回答側に +1", true);
      }
    }
  } else {
    markCell(index, "answer-wrong");

    if (state.mode === "cpu") {
      awardPoint("opponent", "回答ミス！ CPUに +1", false);
    } else {
      awardPoint(state.currentSetter, "回答ミス！ 出題側に +1", false);
    }
  }
}

function awardPoint(player, resultText, success) {
  state.phase = "result";

  clearTimeout(state.countdownTimer);
  clearInterval(state.countdownTimer);
  setGridEnabled(false);

  if (state.mode === "cpu") {
    state.scores[player] += 1;
  } else {
    state.scores[player] = (state.scores[player] || 0) + 1;
  }

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
  state.playerSequence = [];
  state.correctSequence = [];
  state.routeLength = randomRouteLength();

  if (state.mode === "cpu") {
    state.currentSetter = "cpu";
    startCpuRound();
  } else {
    state.currentSetter = state.currentSetter === 1 ? 2 : 1;
    startHumanSetting();
  }

  nextButton.hidden = true;
  updateScoreboard();
  updateRoundInfo();
  updateProgress();
}

function showGameOver() {
  state.phase = "gameover";
  setGridEnabled(false);
  nextButton.hidden = true;
  countdown.textContent = "";

  let playerScore;
  let opponentScore;
  let result;

  if (state.mode === "cpu") {
    playerScore = state.scores.player;
    opponentScore = state.scores.opponent;

    if (playerScore > opponentScore) {
      result = "🏆 あなたの勝利！";
    } else if (opponentScore > playerScore) {
      result = "🤖 CPUの勝利！";
    } else {
      result = "🤝 引き分け！";
    }

    setStatus("GAME OVER");
    setMessage(
      `${result}　あなた ${playerScore} - ${opponentScore} CPU`,
      "gold"
    );
  } else {
    playerScore = state.scores[1];
    opponentScore = state.scores[2];

    if (playerScore > opponentScore) {
      result = "🏆 PLAYER 1 の勝利！";
    } else if (opponentScore > playerScore) {
      result = "🏆 PLAYER 2 の勝利！";
    } else {
      result = "🤝 引き分け！";
    }

    setStatus("GAME OVER");
    setMessage(
      `${result}　${playerScore} - ${opponentScore}`,
      "gold"
    );
  }

  startButton.hidden = false;
  startButton.textContent = "もう一度プレイ";
}

function resetGame() {
  clearTimeout(state.countdownTimer);
  clearInterval(state.countdownTimer);

  state.phase = "idle";
  state.round = 1;
  state.correctSequence = [];
  state.playerSequence = [];
  state.routeLength = 0;

  if (state.mode === "cpu") {
    state.currentSetter = "cpu";
    state.scores = { player: 0, opponent: 0 };
  } else {
    state.currentSetter = 1;
    state.scores = { player: 0, opponent: 0 };
  }

  resetBoard();
  startButton.hidden = false;
  startButton.textContent = "ゲームスタート";
  nextButton.hidden = true;

  updateScoreboard();
  updateRoundInfo();
}

function backToModeSelection() {
  clearTimeout(state.countdownTimer);
  clearInterval(state.countdownTimer);

  state.phase = "mode";
  state.mode = null;

  gameScreen.hidden = true;
  modeScreen.hidden = false;

  resetBoard();
}

cpuModeButton.addEventListener("click", () => selectMode("cpu"));
twoPlayerModeButton.addEventListener("click", () => selectMode("twoPlayer"));
startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", nextRound);
backButton.addEventListener("click", backToModeSelection);
resetButton.addEventListener("click", resetGame);

buildGrid();
setGridEnabled(false);
