/* ===== MEMORY TRACE ===== */

const SYMBOLS = [
  "🍎", "🐱", "⭐", "🍀",
  "🐶", "🔥", "🌙", "🎵",
  "🍕", "🚀", "🌈", "🐸",
  "🎯", "🍩", "⚡", "🎲"
];

// 難易度ごとのルート長 [最小, 最大]
const DIFF = { easy: [4, 6], normal: [5, 8], hard: [8, 11] };

/* ---------- 言語 / i18n ---------- */
const I18N = {
  ja: {
    tagline: "見て、覚えて、同じルートをたどれ",
    onePlayer: "1人プレイ", onePlayerSub: "CPUが出題",
    twoPlayer: "2人プレイ", twoPlayerSub: "交互に出題",
    settings: "設定", back: "もどる", toTitle: "タイトルへ", reset: "リセット",
    language: "言語", memoryTime: "記憶時間", rounds: "ラウンド数", difficulty: "難易度",
    sound: "効果音", vibration: "振動",
    easy: "やさしい", normal: "ふつう", hard: "むずかしい", on: "ON", off: "OFF",
    secN: n => `${n}秒`, roundsN: n => `${n}回`,
    vibNote: "※ 振動はiPhoneのSafariでは動作しません。",
    start: "ゲームスタート", next: "次のラウンド", results: "結果を見る", again: "もう一度プレイ",
    route: "ルート", rulesTitle: "ルール",
    rulesCpu: (a, b, s) => [
      `CPUが${a}〜${b}マスのルートを作る。`, `${s}秒間だけルートを記憶する。`,
      "同じ順番でルートを再現する。", "完全再現 → あなたに <b>+1</b>", "間違える → CPUに <b>+1</b>"],
    rules2p: (a, b, s) => [
      `出題側が${a}〜${b}マスのルートを作る。`, `${s}秒間だけルートを記憶する。`,
      "同じ順番でルートを再現する。", "完全再現 → 回答側に <b>+1</b>", "間違える → 出題側に <b>+1</b>"],
    you: "YOU",
    roleCpu: "CPU が出題", roleYou: "あなたが回答",
    roleSet: n => `PLAYER ${n} が出題`, roleAns: n => `PLAYER ${n} が回答`,
    pressStart: "ゲームスタートを押してください",
    setRoute: n => `PLAYER ${n}：ルートを作ってください`, range: (a, b) => `${a}〜${b}マス`,
    setHint: "となりのマスへつないで一筆書き！",
    cpuThinking: "🤖 CPUがルートを作っています…", cpuMsg: "CPUのルートを覚えてください",
    memorize: "覚える時間！", memorizeMsg: "このルートを覚えてください",
    ansYou: "あなた：同じルートを再現！", ansP: n => `PLAYER ${n}：同じルートを再現！`,
    ansMsg: "順番まで完全に一致させよう",
    dup: "同じマスはもう一度選べません", adj: "となりのマスにつないでください",
    progress: (n, left) => `現在 ${n} マス。あと ${left} マス`,
    okYou: "完全再現！ あなたに +1", okAns: "完全再現！ 回答側に +1",
    ngCpu: "回答ミス！ CPUに +1", ngSet: "回答ミス！ 出題側に +1",
    correct: "🎉 正解！", miss: "💥 ミス！", over: "GAME OVER",
    winYou: "🏆 あなたの勝利！", winCpu: "🤖 CPUの勝利！", draw: "🤝 引き分け！",
    winP: n => `🏆 PLAYER ${n} の勝利！`,
    cellLabel: n => `マス ${n}`
  },
  en: {
    tagline: "Watch. Remember. Trace the route.",
    onePlayer: "1 Player", onePlayerSub: "CPU sets the route",
    twoPlayer: "2 Players", twoPlayerSub: "Take turns setting routes",
    settings: "Settings", back: "Back", toTitle: "Title", reset: "Reset",
    language: "Language", memoryTime: "Memorize time", rounds: "Rounds", difficulty: "Difficulty",
    sound: "Sound effects", vibration: "Vibration",
    easy: "Easy", normal: "Normal", hard: "Hard", on: "ON", off: "OFF",
    secN: n => `${n} sec`, roundsN: n => `${n}`,
    vibNote: "Note: vibration does not work in iPhone Safari.",
    start: "Start game", next: "Next round", results: "See results", again: "Play again",
    route: "Route", rulesTitle: "Rules",
    rulesCpu: (a, b, s) => [
      `The CPU builds a route of ${a}–${b} cells.`, `You get ${s} seconds to memorize it.`,
      "Repeat the route in the same order.", "Perfect match → <b>+1</b> for you", "Mistake → <b>+1</b> for the CPU"],
    rules2p: (a, b, s) => [
      `The setter builds a route of ${a}–${b} cells.`, `You get ${s} seconds to memorize it.`,
      "Repeat the route in the same order.", "Perfect match → <b>+1</b> for the answerer", "Mistake → <b>+1</b> for the setter"],
    you: "YOU",
    roleCpu: "CPU sets the route", roleYou: "Your turn to answer",
    roleSet: n => `PLAYER ${n} sets`, roleAns: n => `PLAYER ${n} answers`,
    pressStart: "Press Start game",
    setRoute: n => `PLAYER ${n}: build a route`, range: (a, b) => `${a}–${b} cells`,
    setHint: "Link adjacent cells in one stroke!",
    cpuThinking: "🤖 The CPU is building a route…", cpuMsg: "Memorize the CPU's route",
    memorize: "Memorize!", memorizeMsg: "Remember this route",
    ansYou: "You: repeat the route!", ansP: n => `PLAYER ${n}: repeat the route!`,
    ansMsg: "Match the exact order",
    dup: "You can't pick the same cell twice", adj: "Pick a cell next to the last one",
    progress: (n, left) => `${n} placed, ${left} to go`,
    okYou: "Perfect! +1 for you", okAns: "Perfect! +1 for the answerer",
    ngCpu: "Wrong cell! +1 for the CPU", ngSet: "Wrong cell! +1 for the setter",
    correct: "🎉 Correct!", miss: "💥 Miss!", over: "GAME OVER",
    winYou: "🏆 You win!", winCpu: "🤖 CPU wins!", draw: "🤝 Draw!",
    winP: n => `🏆 PLAYER ${n} wins!`,
    cellLabel: n => `Cell ${n}`
  }
};

/* ---------- 設定 / Settings ---------- */
const STORE_KEY = "memoryTraceSettings";
const defaults = {
  lang: (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en",
  memory: 5, rounds: 10, difficulty: "normal", sound: true, vibration: true
};

function loadSettings() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}") }; }
  catch { return { ...defaults }; }
}
function saveSettings() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(settings)); } catch {}
}

const settings = loadSettings();

function t(key, ...args) {
  const v = I18N[settings.lang][key];
  return typeof v === "function" ? v(...args) : v;
}

const onOff = [[true, () => t("on")], [false, () => t("off")]];
const SETTING_DEFS = [
  ["lang", "language", [["ja", "日本語"], ["en", "English"]]],
  ["memory", "memoryTime", [3, 5, 8].map(v => [v, () => t("secN", v)])],
  ["rounds", "rounds", [5, 10, 15].map(v => [v, () => t("roundsN", v)])],
  ["difficulty", "difficulty", ["easy", "normal", "hard"].map(v => [v, () => t(v)])],
  ["sound", "sound", onOff],
  ["vibration", "vibration", onOff]
];

/* ---------- 効果音・振動 ---------- */
let audioCtx;
function beep(freq, dur = 0.08, type = "sine", vol = 0.15) {
  if (!settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch {}
}
function vibrate(pattern) {
  if (settings.vibration && navigator.vibrate) navigator.vibrate(pattern);
}
const sfx = {
  tap: () => beep(520),
  step: n => beep(440 + n * 45),
  tick: () => beep(400, 0.05),
  ok: () => { beep(660); setTimeout(() => beep(880, 0.14), 100); vibrate([30, 40, 30]); },
  ng: () => { beep(170, 0.28, "sawtooth"); vibrate(200); }
};

/* ---------- 状態 / DOM ---------- */
const state = {
  mode: null,           // "cpu" | "twoPlayer"
  phase: "title",
  round: 1,
  currentSetter: "cpu", // "cpu" | 1 | 2
  scores: [0, 0],       // [左カード, 右カード]
  correctSequence: [],
  playerSequence: [],
  routeLength: 0,
  countdownTimer: null,
  token: 0
};

const $ = id => document.getElementById(id);
const screens = { title: $("titleScreen"), settings: $("settingsScreen"), game: $("gameScreen") };
const grid = $("grid");
const statusEl = $("status");
const countdown = $("countdown");
const message = $("message");
const progressText = $("progressText");
const progressBar = $("progressBar");
const startButton = $("startButton");
const nextButton = $("nextButton");
const player1Card = $("player1Card");
const player2Card = $("player2Card");

function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => { el.hidden = k !== name; });
  window.scrollTo(0, 0);
}

/* ---------- タイマー管理 ---------- */
function stopTimers() {
  clearInterval(state.countdownTimer);
  state.token++;
}
function later(fn, ms) {
  const tk = state.token;
  return setTimeout(() => { if (tk === state.token) fn(); }, ms);
}

/* ---------- 言語反映 / 設定UI ---------- */
const labelRefs = [];
const segRefs = [];

function buildSettings() {
  const list = $("settingsList");
  SETTING_DEFS.forEach(([key, labelKey, opts]) => {
    const row = document.createElement("div");
    row.className = "setting-row";
    const label = document.createElement("span");
    label.className = "setting-label";
    const seg = document.createElement("div");
    seg.className = "seg";
    seg.setAttribute("role", "group");
    opts.forEach(([value, text]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "seg-btn";
      b.addEventListener("click", () => {
        settings[key] = value;
        saveSettings();
        if (key === "lang") applyLang(); else refreshSettings();
        sfx.tap();
        if (key === "vibration" && value) vibrate(40);
      });
      seg.appendChild(b);
      segRefs.push({ b, key, value, text });
    });
    seg.setAttribute("aria-labelledby", `lbl-${key}`);
    label.id = `lbl-${key}`;
    labelRefs.push([label, labelKey]);
    row.append(label, seg);
    list.appendChild(row);
  });
}

function refreshSettings() {
  labelRefs.forEach(([el, k]) => { el.textContent = t(k); });
  segRefs.forEach(r => {
    r.b.textContent = typeof r.text === "function" ? r.text() : r.text;
    r.b.setAttribute("aria-pressed", String(settings[r.key] === r.value));
  });
}

function applyLang() {
  document.documentElement.lang = settings.lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  cells().forEach((c, i) => c.setAttribute("aria-label", t("cellLabel", i + 1)));
  refreshSettings();
}

/* ---------- タイトルの脳 ---------- */
function buildBrainNodes() {
  const xs = [108, 172, 228, 292];
  const ys = [78, 132, 186, 240];
  const onNodes = ["108,186", "172,132", "172,78", "228,132", "292,78", "292,132", "228,186", "228,240"];
  const g = $("brainNodes");
  const ns = "http://www.w3.org/2000/svg";
  ys.forEach(y => xs.forEach(x => {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", 3.5);
    if (onNodes.includes(`${x},${y}`)) c.classList.add("on");
    g.appendChild(c);
  }));
}

/* ---------- ゲーム盤 ---------- */
function buildGrid() {
  grid.innerHTML = "";
  SYMBOLS.forEach((symbol, index) => {
    const button = document.createElement("button");
    button.className = "cell";
    button.type = "button";
    button.textContent = symbol;
    button.addEventListener("click", () => handleCellClick(index));
    grid.appendChild(button);
  });
}

const cells = () => [...grid.querySelectorAll(".cell")];
const setStatus = text => { statusEl.textContent = text; };
function setMessage(text = "", type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}
function markCell(index, className) {
  const cell = cells()[index];
  if (cell) cell.classList.add(className);
}
function setGridEnabled(enabled) {
  cells().forEach(c => c.classList.toggle("disabled", !enabled));
}
function clearGridVisuals() {
  cells().forEach(c => {
    c.classList.remove("route", "answer-correct", "answer-wrong", "reveal", "reveal-number", "disabled");
    c.removeAttribute("data-number");
  });
}

const answerer = () => (state.currentSetter === 1 ? 2 : 1);
const routeRange = () => DIFF[settings.difficulty];

function randomRouteLength() {
  const [min, max] = routeRange();
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ---------- 表示更新 ---------- */
function updateNames() {
  const cpu = state.mode === "cpu";
  $("player1Name").textContent = cpu ? t("you") : "PLAYER 1";
  $("player2Name").textContent = cpu ? "CPU" : "PLAYER 2";
  const [a, b] = routeRange();
  const lines = (cpu ? t("rulesCpu", a, b, settings.memory) : t("rules2p", a, b, settings.memory));
  $("rulesList").innerHTML = lines.map(l => `<li>${l}</li>`).join("");
}

function updateScoreboard() {
  $("score1").textContent = state.scores[0];
  $("score2").textContent = state.scores[1];
  player1Card.classList.remove("active");
  player2Card.classList.remove("active");

  let activeLeft;
  if (state.mode === "cpu") {
    activeLeft = state.phase === "answering";
  } else {
    const who = state.phase === "answering" ? answerer() : state.currentSetter;
    activeLeft = who === 1;
  }
  (activeLeft ? player1Card : player2Card).classList.add("active");
}

function updateRoundInfo() {
  $("roundLabel").textContent = `ROUND ${state.round} / ${settings.rounds}`;
  const answering = state.phase === "answering";
  if (state.mode === "cpu") {
    $("roleLabel").textContent = answering ? t("roleYou") : t("roleCpu");
  } else {
    $("roleLabel").textContent = answering ? t("roleAns", answerer()) : t("roleSet", state.currentSetter);
  }
}

function updateProgress() {
  const current = state.playerSequence.length;
  const max = state.routeLength || routeRange()[1];
  progressText.textContent = `${current} / ${max}`;
  progressBar.style.width = `${Math.min(100, (current / max) * 100)}%`;
}

function refreshHud() {
  updateScoreboard();
  updateRoundInfo();
  updateProgress();
}

/* ---------- 開始 / リセット ---------- */
function selectMode(mode) {
  stopTimers();
  state.mode = mode;
  state.currentSetter = mode === "cpu" ? "cpu" : 1;
  state.phase = "idle";
  state.round = 1;
  state.scores = [0, 0];
  state.correctSequence = [];
  state.playerSequence = [];
  state.routeLength = 0;

  showScreen("game");
  updateNames();
  resetBoard();
  refreshHud();
  startButton.textContent = t("start");
  startButton.hidden = false;
  nextButton.hidden = true;
}

function resetBoard() {
  clearGridVisuals();
  setGridEnabled(false);
  setStatus(t("pressStart"));
  countdown.textContent = "";
  setMessage("");
  progressText.textContent = `0 / ${routeRange()[1]}`;
  progressBar.style.width = "0%";
}

function startGame() {
  stopTimers();
  state.round = 1;
  state.scores = [0, 0];
  state.correctSequence = [];
  state.playerSequence = [];
  startButton.hidden = true;
  nextButton.hidden = true;
  beginRound();
}

function beginRound() {
  if (state.mode === "cpu") {
    state.currentSetter = "cpu";
    startCpuRound();
  } else {
    startHumanSetting();
  }
  refreshHud();
}

function resetGame() {
  stopTimers();
  state.phase = "idle";
  state.round = 1;
  state.scores = [0, 0];
  state.currentSetter = state.mode === "cpu" ? "cpu" : 1;
  state.correctSequence = [];
  state.playerSequence = [];
  state.routeLength = 0;
  resetBoard();
  startButton.hidden = false;
  startButton.textContent = t("start");
  nextButton.hidden = true;
  refreshHud();
}

function backToTitle() {
  stopTimers();
  state.phase = "title";
  state.mode = null;
  showScreen("title");
}

/* ---------- 出題 ---------- */
function startHumanSetting() {
  state.phase = "setting";
  state.playerSequence = [];
  state.routeLength = randomRouteLength();
  clearGridVisuals();
  setGridEnabled(true);
  setStatus(t("setRoute", state.currentSetter));
  countdown.textContent = t("range", ...routeRange());
  setMessage(t("setHint"));
}

function startCpuRound() {
  state.phase = "countdown";
  state.playerSequence = [];
  state.routeLength = randomRouteLength();
  state.correctSequence = generateCpuRoute(state.routeLength);

  clearGridVisuals();
  setGridEnabled(false);
  setStatus(t("cpuThinking"));
  countdown.textContent = "";
  setMessage(t("cpuMsg"), "gold");

  state.correctSequence.forEach((index, i) => {
    later(() => { markCell(index, "route"); sfx.step(i); }, i * 130);
  });
  later(startMemoryCountdown, state.correctSequence.length * 130 + 350);
}

function generateCpuRoute(length) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const route = [Math.floor(Math.random() * 16)];
    while (route.length < length) {
      const candidates = getNeighbors(route[route.length - 1]).filter(i => !route.includes(i));
      if (!candidates.length) break;
      route.push(candidates[Math.floor(Math.random() * candidates.length)]);
    }
    if (route.length === length) return route;
  }
  // 万一のフォールバック：蛇行ルート
  return [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12].slice(0, length);
}

function getNeighbors(index) {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const result = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) result.push(nr * 4 + nc);
    }
  }
  return result;
}

function isAdjacent(a, b) {
  return Math.max(Math.abs(Math.floor(a / 4) - Math.floor(b / 4)), Math.abs((a % 4) - (b % 4))) === 1;
}

/* ---------- 記憶 → 回答 ---------- */
function startMemoryCountdown() {
  state.phase = "countdown";
  clearGridVisuals();
  setGridEnabled(false);

  let remaining = settings.memory;
  setStatus(t("memorize"));
  countdown.textContent = remaining;
  setMessage(t("memorizeMsg"), "gold");
  sfx.tick();

  state.countdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      countdown.textContent = remaining;
      sfx.tick();
    } else {
      clearInterval(state.countdownTimer);
      countdown.textContent = "";
      startAnswerPhase();
    }
  }, 1000);
  updateRoundInfo();
}

function startAnswerPhase() {
  state.phase = "answering";
  state.playerSequence = [];
  clearGridVisuals();
  setGridEnabled(true);
  setStatus(state.mode === "cpu" ? t("ansYou") : t("ansP", answerer()));
  setMessage(t("ansMsg"));
  refreshHud();
}

function handleCellClick(index) {
  if (state.phase === "setting" && state.mode === "twoPlayer") handleHumanSettingClick(index);
  else if (state.phase === "answering") handleAnswerClick(index);
}

function handleHumanSettingClick(index) {
  if (state.playerSequence.includes(index)) {
    setMessage(t("dup"), "failure");
    return;
  }
  const prev = state.playerSequence[state.playerSequence.length - 1];
  if (prev !== undefined && !isAdjacent(prev, index)) {
    setMessage(t("adj"), "failure");
    return;
  }

  state.playerSequence.push(index);
  markCell(index, "route");
  const number = state.playerSequence.length;
  const cell = cells()[index];
  cell.dataset.number = number;
  cell.classList.add("reveal-number");
  sfx.step(number);

  updateProgress();
  setMessage(t("progress", number, Math.max(0, state.routeLength - number)));

  if (number >= state.routeLength) {
    state.correctSequence = [...state.playerSequence];
    startMemoryCountdown();
  }
}

function handleAnswerClick(index) {
  const expected = state.correctSequence[state.playerSequence.length];

  if (index === expected) {
    state.playerSequence.push(index);
    markCell(index, "answer-correct");
    sfx.step(state.playerSequence.length);
    updateProgress();

    if (state.playerSequence.length === state.correctSequence.length) {
      if (state.mode === "cpu") awardPoint(0, t("okYou"), true);
      else awardPoint(answerer() - 1, t("okAns"), true);
    }
  } else {
    markCell(index, "answer-wrong");
    if (state.mode === "cpu") awardPoint(1, t("ngCpu"), false);
    else awardPoint(state.currentSetter - 1, t("ngSet"), false);
  }
}

/* ---------- 結果 ---------- */
function awardPoint(sideIndex, resultText, success) {
  stopTimers();
  state.phase = "result";
  setGridEnabled(false);
  state.scores[sideIndex] += 1;
  refreshHud();

  setStatus(success ? t("correct") : t("miss"));
  setMessage(resultText, success ? "success" : "failure");
  success ? sfx.ok() : sfx.ng();

  revealCorrectRoute();

  nextButton.hidden = false;
  nextButton.textContent = state.round >= settings.rounds ? t("results") : t("next");
}

function revealCorrectRoute() {
  state.correctSequence.forEach((index, i) => {
    const cell = cells()[index];
    later(() => {
      cell.classList.add("reveal", "reveal-number");
      cell.dataset.number = i + 1;
    }, i * 80);
  });
}

function nextRound() {
  if (state.round >= settings.rounds) {
    showGameOver();
    return;
  }
  state.round += 1;
  state.playerSequence = [];
  state.correctSequence = [];
  if (state.mode === "twoPlayer") state.currentSetter = state.currentSetter === 1 ? 2 : 1;
  nextButton.hidden = true;
  beginRound();
}

function showGameOver() {
  stopTimers();
  state.phase = "gameover";
  setGridEnabled(false);
  nextButton.hidden = true;
  countdown.textContent = "";

  const [a, b] = state.scores;
  let result;
  if (state.mode === "cpu") result = a > b ? t("winYou") : b > a ? t("winCpu") : t("draw");
  else result = a > b ? t("winP", 1) : b > a ? t("winP", 2) : t("draw");

  setStatus(t("over"));
  setMessage(`${result}　${a} - ${b}`, "gold");
  startButton.hidden = false;
  startButton.textContent = t("again");
  refreshHud();
}

/* ---------- イベント ---------- */
$("cpuModeButton").addEventListener("click", () => { sfx.tap(); selectMode("cpu"); });
$("twoPlayerModeButton").addEventListener("click", () => { sfx.tap(); selectMode("twoPlayer"); });
$("settingsButton").addEventListener("click", () => { sfx.tap(); showScreen("settings"); });
$("settingsBackButton").addEventListener("click", () => { sfx.tap(); showScreen("title"); });
startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", nextRound);
$("backButton").addEventListener("click", backToTitle);
$("resetButton").addEventListener("click", resetGame);

/* ---------- 初期化 ---------- */
buildBrainNodes();
buildGrid();
buildSettings();
applyLang();
setGridEnabled(false);
showScreen("title");
