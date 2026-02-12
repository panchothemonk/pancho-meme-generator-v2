const MAIN_IMAGE_PATHS = [
  "public/assets/pancho-main.png",
  "public/assets/pancho-base.png",
  "public/assets/rotations/image1.png",
];
const ROTATION_MANIFEST_PATH = "public/assets/rotation-images.json";
const ROTATION_FOLDERS = ["public/assets/rotations", "public/assets", "public/assets/variants", "public/assets/images"];

const FORMATS = {
  portrait: { label: "4:5", width: 1080, height: 1350 },
  square: { label: "1:1", width: 1080, height: 1080 },
  landscape: { label: "16:9", width: 1600, height: 900 },
};

const ui = {
  canvas: document.getElementById("memeCanvas"),
  status: document.getElementById("status"),
  templateLabel: document.getElementById("templateLabel"),
  formatLabel: document.getElementById("formatLabel"),
  memeMode: document.getElementById("memeMode"),
  spiceSlider: document.getElementById("spiceSlider"),
  spiceValue: document.getElementById("spiceValue"),
  generate: document.getElementById("generate"),
  favorite: document.getElementById("favorite"),
  download: document.getElementById("download"),
  favoritesList: document.getElementById("favoritesList"),
  formatButtons: Array.from(document.querySelectorAll(".format-btn")),
};

const ctx = ui.canvas.getContext("2d");
let imagePool = [];
let activeImage = null;
let currentFormat = "portrait";
let currentMeme = null;
let currentMode = "all";
let spiceLevel = 2;
const recentImages = [];
const recentTop = [];
const recentBottom = [];
const favorites = [];
const STORAGE_KEY = "pancho-v2-state";

const MEME_BANK = [
  {
    label: "Degen Night Shift",
    topSeeds: ["3AM Y AQUI SEGUIMOS", "JUST ONE LAST TRADE", "NO SLEEP SOLO CHARTS", "ME DIJE: CINCO MINUTOS MAS"],
    bottomSeeds: ["PANCHO CLOCKING INTO NIGHT SHIFT", "WEN SLEEP? MANANA", "CAFE + COPIUM + FE", "ESTO YA ES TURNO NOCTURNO"],
    style: "classic",
  },
  {
    label: "Top Buyer Energy",
    topSeeds: ["I WAITED FOR CONFIRMATION", "ENTRE CUANDO YA SUBIO 180%", "THIS CANDLE LOOKS SAFE", "AHORA SI YA ESTA SEGURO... VERDAD?"],
    bottomSeeds: ["PANCHO BOUGHT THE EXACT TOP", "COMPRE EL PICO OTRA VEZ", "PROFESSIONAL FOMO ATHLETE", "TIMING DE CAMPEON... AL REVES"],
    style: "classic",
  },
  {
    label: "Phone Panic",
    topSeeds: ["BRO CHECK YOUR PORTFOLIO", "AMIGO... TE SIENTAS?", "PRICE ALERT: AY NO", "ABRI EL CEL Y ME ARREPIENTO"],
    bottomSeeds: ["PANCHO OPENING PHONE WITH FEAR", "NOTIFICATION ARC IS BRUTAL", "NO MAMES QUE PASO", "ESTE MENSAJE NO TRAE NADA BUENO"],
    style: "phone",
  },
  {
    label: "Liquidation News",
    topSeeds: ["ME: RISK MANAGEMENT", "50X PORQUE SI", "ESTA VEZ SI SALE", "APALANCADO PERO TRANQUILO"],
    bottomSeeds: ["PANCHO GOT A LESSON IN LEVERAGE", "LIQUIDATED IN HD", "QUE BONITA DISCIPLINA... NOT", "EL STOP LOSS NI APLAUDIO"],
    style: "ticker",
  },
  {
    label: "Airdrop Worker",
    topSeeds: ["47 TASKS FOR MAYBE $12", "FARMEANDO PUNTOS FULL TIME", "IF ELIGIBLE I AM THERE", "OTRA MISION Y YA ACABO"],
    bottomSeeds: ["PANCHO WORKING FOR POTENTIAL AIRDROP", "CHAMBA GRATIS BUT WITH VISION", "ONE MORE QUEST MI GENTE", "SI SALE EL DROP, VALIO LA PENA"],
    style: "phone",
  },
  {
    label: "Bullish Delusion",
    topSeeds: ["+2% IN 5 MINUTES", "WE ARE SO BACK", "RUMBO A LA LUNA CONFIRMED", "DOS VELAS VERDES Y YA ME CRECI"],
    bottomSeeds: ["PANCHO WRITING A THREAD ALREADY", "ANALYST MODE ACTIVATED", "CINEMA TOTAL", "YA ME VI DANDO CLASES DE MERCADO"],
    style: "chart",
  },
  {
    label: "Gas Fee Trauma",
    topSeeds: ["WANTED TO SWAP $20", "DEFI FREEDOM MOMENT", "JUST ONE QUICK TX", "ME COBRARON HASTA EL SUSPIRO"],
    bottomSeeds: ["PANCHO PAID $64 IN GAS", "NO THANKS MEJOR HODL", "FEE ARC IS PAIN", "MEJOR NADA, ESTA CARISIMO"],
    style: "ticker",
  },
  {
    label: "Alt Season Waiting",
    topSeeds: ["ALT SEASON TOMORROW BRO", "MY BAG IS READY", "TRUST THE CYCLE", "AHORA SI ARRANCA, SEGUN TWITTER"],
    bottomSeeds: ["PANCHO WAITING SINCE 2021", "PACIENCIA O COPIUM? BOTH", "MANANA... SIEMPRE MANANA", "SIGO ESPERANDO COMO EN FILA DEL IMSS"],
    style: "classic",
  },
];

const HASHTAGS = ["#Pancho", "#Crypto", "#CryptoMemes", "#CT", "#Degen", "#WAGMI"];
const CAPTION_POOLS = {
  topEnglish: [
    "JUST CHECKING IF WE ARE RICH YET",
    "I SAID I WOULD NOT TRADE TODAY",
    "THIS ENTRY LOOKS RESPONSIBLE",
    "ONE MORE CANDLE THEN I LOG OFF",
    "I CAME FOR PEACE, FOUND VOLATILITY",
    "WE ARE EITHER EARLY OR COOKED",
    "MARKET OPENED, SANITY CLOSED",
    "SMALL POSITION, BIG FEELINGS",
    "I TRUSTED A ROCKET EMOJI",
    "THIS IS A LONG-TERM PLAY NOW",
    "MY PLAN WAS SIMPLE UNTIL PRICE MOVED",
    "I TOUCHED PERPS AGAIN, MY BAD",
    "BRO SAID EASY 10X, I LISTENED",
    "PORTFOLIO CHECK BEFORE BREAKFAST",
    "I BOUGHT THE DIP'S COUSIN",
    "TODAY I TRADE WITH DISCIPLINE",
    "I ENTERED BECAUSE CHAT SAID GM",
    "IF THIS BREAKS, WE FLY",
    "I OPENED TWITTER AND BOUGHT",
    "MY CONFIDENCE IS 100, MY PNL IS NOT",
  ],
  topMex: [
    "NO MAMES YA VOLVIO A BAJAR",
    "ME DIJE: AHORA SI TRANQUI",
    "ME METI TANTITO Y YA ME ARDI",
    "A VER SI AHORA SI JALA",
    "SEGUN YO IBA A CUIDAR RIESGO",
    "QUE TAN MALO PUEDE SALIR?",
    "ANDO EN MODO FE CIEGA",
    "OTRA VEZ YO CONTRA EL MERCADO",
    "ME CONFIE BIEN DURO",
    "YA CASI RECUPERO... CREO",
    "COMPRE POR FOMO Y ORGULLO",
    "QUE CHULADA DE VELA... ROJA",
    "MEJOR HUBIERA COMPRADO TACOS",
    "ESTO YA PARECE NOVELA",
    "AHI TE VOY APALANCAMIENTO",
    "EL CHAT DIJO: DALE, SIN MIEDO",
    "MI ESTRATEGIA: A VER QUE PASA",
    "LE METI PORQUE SE VEIA BONITO",
    "CHALE, OTRA ALERTA ROJA",
    "NI PEDO, OTRO INTENTO",
  ],
  bottomEnglish: [
    "PANCHO TURNED A SWING TRADE INTO A LIFE LESSON",
    "RISK MANAGEMENT LEFT THE CHAT",
    "NEW STRATEGY: PRAY AND REFRESH",
    "IF COPIUM WAS A PROFESSION",
    "HE CAME FOR GAINS, STAYED FOR LORE",
    "THIS IS NOW A CHARACTER DEVELOPMENT ARC",
    "PANCHO VS VOLATILITY: SEASON 9",
    "BRO IS DIVERSIFIED IN REGRET",
    "THE PORTFOLIO BUILDS HUMILITY DAILY",
    "HE CALLED IT A SCALP, MARKET CALLED IT A HOLD",
    "PANCHO BOUGHT HIGH WITH CONFIDENCE",
    "ANOTHER DAY, ANOTHER LESSON IN CANDLES",
    "THE CHART SAID GOOD MORNING, THEN SLAPPED",
    "WHEN IN DOUBT, HE ADDS MORE COPIUM",
    "PANCHO IS FLUENT IN RED CANDLES",
    "THIS TRADE AGED LIKE MILK",
    "MARKET GAVE HIM A FREE REALITY CHECK",
    "HE TOOK PROFITS... IN EXPERIENCE POINTS",
    "PANCHO STAYS BULLISH OUT OF SPITE",
    "THE EXIT PLAN IS STILL LOADING",
  ],
  bottomMex: [
    "PANCHO OTRA VEZ APRENDIENDO A LA MALA",
    "SE FUE LA GANANCIA Y TAMBIEN LA PACIENCIA",
    "LE SALIO MAS CARO QUE UN ANTOJO",
    "AQUI PURA FE, CERO GARANTIAS",
    "YA VALIO, PERO CON ESTILO",
    "EL MERCADO LE DIO SU CACHETADA",
    "SE PUSO BRAVO EL ASUNTO",
    "PANCHO EN MODO: NI MODO",
    "OTRO DIA BONITO PARA SUFRIR",
    "SE LE FUE EL TREN Y EL UBER",
    "TODO MAL, PERO FIRME",
    "AHI QUEDO EL PNL, BIEN TRISTE",
    "LE PEGARON AL STOP COMO PINATA",
    "PARECE CHISTE, PERO ES SU CUENTA",
    "TRAIA PLAN, SE LE FUE RAPIDO",
    "PURO HUMO Y CERO TAKE PROFIT",
    "SE QUEDO ESPERANDO EL REBOTE",
    "OTRA VEZ SE FUE POR LA FINTA",
    "CASI LE SALE... CASI",
    "A DARLE, QUE PEOR NO PUEDE... SI PUEDE",
  ],
};

const MODE_TEMPLATE_LABELS = {
  all: [],
  bull: ["Bullish Delusion", "Top Buyer Energy"],
  bear: ["Liquidation News", "Gas Fee Trauma"],
  degen: ["Degen Night Shift", "Airdrop Worker"],
};

const SPICE_LABELS = {
  1: "Mild",
  2: "Savage",
  3: "Unhinged",
};

const SPICE_CAPTIONS = {
  1: {
    top: ["STAYING CALM... MOSTLY", "JUST A NORMAL DAY IN CRYPTO", "LIGHT POSITION, LIGHT STRESS"],
    bottom: ["PANCHO TAKES THE SAFE ROUTE", "SLOW AND STEADY... KIND OF", "STILL LEARNING, STILL HOLDING"],
  },
  2: {
    top: ["SENT IT BEFORE THINKING", "JUST ONE MORE ENTRY", "THIS VOLATILITY BUILDS CHARACTER"],
    bottom: ["PANCHO IN FULL SURVIVAL MODE", "GAINED TRAUMA, NOT PROFITS", "ALL GOOD... DEFINITELY NOT"],
  },
  3: {
    top: ["ALL GAS NO BRAKES", "I CALL THIS RISK MANAGEMENTN'T", "IF IT BLOWS UP, IT BLOWS UP LIVE"],
    bottom: ["PANCHO SPEEDRUNNING VOLATILITY", "THIS STRATEGY WAS INVENTED 8 MINUTES AGO", "PURE CHAOS, ZERO REGRETS"],
  },
};
const ENGLISH_LINE_RATIO = 0.95;
const PANCHO_SPANGLISH = {
  top: [
    "NO MAMES, HERE WE GO AGAIN",
    "A VER SI THIS ONE SENDS",
    "NI MODO, WE HOLD",
    "ESTA VELA LOOKS SUS",
    "QUE SHOW, THIS IS WILD",
    "MEJOR HODL Y YA",
  ],
  bottom: [
    "PANCHO SAID NI MODO AND HELD",
    "TODO MAL, BUT STILL BULLISH",
    "AQUI CON FE Y COPIUM",
    "OTRA VEZ PANCHO VS THE MARKET",
    "NO PROFIT, PURA LORE",
    "AL CHILE THIS CHART IS CURSED",
  ],
};

const MODE_LINE_FRAGMENTS = {
  bull: {
    topStart: ["GREEN CANDLE", "BULL POST", "PORTFOLIO +5%", "BREAKOUT CONFIRMED", "GM BULLS", "ALTS MOVING"],
    topMid: ["HAS ME", "HAS PANCHO", "HAS CT", "HAS THE GROUP CHAT", "HAS EVERYONE"],
    topEnd: ["SCREAMING WAGMI", "CALLING FOR THE MOON", "POSTING VICTORY THREADS", "TURNING INTO A GURU", "DOING VICTORY LAPS", "BUYING MORE"],
    bottomStart: ["PANCHO", "THE PORTFOLIO", "MY BRO", "THE ENTIRE CHAT", "CRYPTO TWITTER"],
    bottomMid: ["FEELS INVINCIBLE", "WANTS TO START A FUND", "THINKS HE CRACKED THE CODE", "IS UP 200% IN CONFIDENCE", "BECAME A MARKET PHILOSOPHER"],
    bottomEnd: ["AFTER TWO GREEN CANDLES", "WITH ZERO HEDGES", "WITHOUT TAKING PROFITS", "LIKE BEAR MARKET NEVER HAPPENED", "WITH FULL EUPHORIA"],
  },
  bear: {
    topStart: ["RED CANDLE", "BTC DUMP", "RISK ALERT", "LEVERAGE", "FED NEWS", "STOP LOSS"],
    topMid: ["HITS ME", "HITS PANCHO", "HITS THE WHOLE TIMELINE", "CATCHES EVERYONE", "WRECKS MY PLAN"],
    topEnd: ["OUT OF NOWHERE", "WITHOUT WARNING", "AT FULL SPEED", "POINT-BLANK", "LIKE A TRUCK", "LIVE ON MAINNET"],
    bottomStart: ["PANCHO", "MY ACCOUNT", "THE CHAT", "MY PLAN", "MY ENTRIES"],
    bottomMid: ["GOES STRAIGHT DOWN", "FREEZES IN SHOCK", "LOSES ALL OXYGEN", "ASKS FOR A TIMEOUT", "STARTS NEGOTIATING WITH CANDLES"],
    bottomEnd: ["AGAIN", "IN THREE MINUTES", "WITH ZERO MERCY", "WHILE I WATCH", "IN HD", "LIKE IT'S NORMAL"],
  },
  degen: {
    topStart: ["3AM", "NEW MEMECOIN", "AIRDROP TASK", "50X", "ONE MORE TRADE", "GROUP SIGNAL"],
    topMid: ["AND I", "AND PANCHO", "AND MY BRO", "AND THE DEGEN CHAT", "AND MY WALLET"],
    topEnd: ["ENTER WITHOUT THINKING", "SEND IT ALL", "GO IN FEARLESS", "SKIP ALL RESEARCH", "FULL COMMIT", "APE IMMEDIATELY"],
    bottomStart: ["PANCHO", "MY DEGEN BRO", "THE GROUP", "THE CREW", "MY WALLET"],
    bottomMid: ["IS IN CASINO MODE", "DIVES IN HEADFIRST", "HAS NOT SLEPT", "ALL-INS EVERY IDEA", "GOES FULL DEGEN"],
    bottomEnd: ["AND STILL SMILES", "AGAIN", "LIKE A LEGEND", "WITH NO REGRETS", "ON PURE CONVICTION", "FOR THE LORE"],
  },
};

function setStatus(message) {
  ui.status.textContent = message;
}

function randItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickFresh(list, recent, maxRecent = 10) {
  if (!list.length) return "";
  const filtered = list.filter((item) => !recent.includes(item));
  const picked = randItem(filtered.length ? filtered : list);
  recent.push(picked);
  if (recent.length > maxRecent) recent.shift();
  return picked;
}

function pushRecentImage(src) {
  if (!src) return;
  recentImages.push(src);
  if (recentImages.length > 8) recentImages.shift();
}

function getImageBySrc(src) {
  return imagePool.find((entry) => entry.src === src) || null;
}

function saveState() {
  const state = {
    favorites,
    mode: currentMode,
    spice: spiceLevel,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    if (Array.isArray(state.favorites)) favorites.push(...state.favorites.slice(0, 25));
    if (typeof state.mode === "string") currentMode = state.mode;
    if ([1, 2, 3].includes(Number(state.spice))) spiceLevel = Number(state.spice);
  } catch {
    // ignore broken storage
  }
}

function shortLine(item) {
  return `${item.label}: ${item.top.slice(0, 34)}...`;
}

function renderList(container, list, emptyText) {
  container.innerHTML = "";
  if (!list.length) {
    const p = document.createElement("p");
    p.textContent = emptyText;
    p.className = "status";
    container.appendChild(p);
    return;
  }

  for (const item of list) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = shortLine(item);
    btn.addEventListener("click", async () => {
      const found = getImageBySrc(item.imageSrc);
      if (found) activeImage = found;
      else {
        try {
          const img = await tryLoadImage(item.imageSrc);
          const entry = { src: item.imageSrc, img };
          imagePool.push(entry);
          activeImage = entry;
        } catch {
          // image unavailable, keep current one
        }
      }
      currentMeme = { ...item };
      renderCurrent();
      setStatus("Loaded saved meme.");
    });
    container.appendChild(btn);
  }
}

function renderSavedLists() {
  renderList(ui.favoritesList, favorites, "No favorites yet.");
}

function fitLines(text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function setCanvasFormat(formatKey) {
  currentFormat = FORMATS[formatKey] ? formatKey : "portrait";
  const format = FORMATS[currentFormat];
  ui.canvas.width = format.width;
  ui.canvas.height = format.height;
  ui.formatLabel.textContent = format.label;

  ui.formatButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.format === currentFormat);
  });

  if (currentMeme) renderCurrent();
}

function drawCoverImage(img, x, y, w, h, zoom = 1.05) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const dx = x + (w - drawW) / 2;
  const dy = y + (h - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function drawBackdrop() {
  const w = ui.canvas.width;
  const h = ui.canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#070707";
  ctx.fillRect(0, 0, w, h);

  if (activeImage?.img) {
    drawCoverImage(activeImage.img, 0, 0, w, h);
  }

  const top = ctx.createLinearGradient(0, 0, 0, h * 0.24);
  top.addColorStop(0, "rgba(0,0,0,0.82)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h * 0.24);

  const bottom = ctx.createLinearGradient(0, h * 0.64, 0, h);
  bottom.addColorStop(0, "rgba(0,0,0,0)");
  bottom.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, h * 0.64, w, h * 0.36);
}

function drawClassic(topText, bottomText) {
  const w = ui.canvas.width;
  const h = ui.canvas.height;
  const font = '900 72px "Arial Black", "Impact", sans-serif';
  const lineHeight = 82;

  ctx.textAlign = "center";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#fff";
  ctx.font = font;

  const topLines = fitLines(topText.toUpperCase(), w - 120, font);
  let yTop = 92;
  for (const line of topLines) {
    ctx.strokeText(line, w / 2, yTop);
    ctx.fillText(line, w / 2, yTop);
    yTop += lineHeight;
  }

  const bottomLines = fitLines(bottomText.toUpperCase(), w - 120, font);
  let yBottom = h - 66 - (bottomLines.length - 1) * lineHeight;
  for (const line of bottomLines) {
    ctx.strokeText(line, w / 2, yBottom);
    ctx.fillText(line, w / 2, yBottom);
    yBottom += lineHeight;
  }
}

function drawPhoneBubble(topText, bottomText) {
  const w = ui.canvas.width;
  const h = ui.canvas.height;
  const bubbleW = Math.min(760, w * 0.72);
  const bubbleH = Math.min(270, h * 0.24);
  const bubbleX = w * 0.53 - bubbleW / 2;
  const bubbleY = h * 0.60;

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  roundRectFill(bubbleX, bubbleY, bubbleW, bubbleH, 24);

  ctx.fillStyle = "#111";
  ctx.font = '700 40px "Trebuchet MS", sans-serif';
  ctx.textAlign = "left";

  const all = `${topText} ${bottomText}`;
  const lines = fitLines(all, bubbleW - 60, ctx.font).slice(0, 4);
  let y = bubbleY + 60;
  for (const line of lines) {
    ctx.fillText(line, bubbleX + 30, y);
    y += 52;
  }

  drawClassic(topText, bottomText);
}

function drawChartStyle(topText, bottomText) {
  const w = ui.canvas.width;

  ctx.fillStyle = "rgba(18, 18, 18, 0.8)";
  roundRectFill(40, 44, 430, 120, 16);
  ctx.fillStyle = "#52ff9f";
  ctx.font = '800 58px "Trebuchet MS", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText("+18.4%", 66, 124);

  ctx.fillStyle = "rgba(139, 15, 25, 0.86)";
  roundRectFill(w - 500, 44, 460, 120, 16);
  ctx.fillStyle = "#ffd9de";
  ctx.font = '700 40px "Trebuchet MS", sans-serif';
  ctx.fillText("VOLATILITY MAX", w - 470, 124);

  drawClassic(topText, bottomText);
}

function drawTickerStyle(topText, bottomText) {
  const w = ui.canvas.width;
  const h = ui.canvas.height;

  ctx.fillStyle = "rgba(205, 21, 105, 0.92)";
  roundRectFill(0, 0, w, 84, 0);
  ctx.fillStyle = "#fff";
  ctx.font = '700 42px "Trebuchet MS", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(topText.toUpperCase(), w / 2, 56);

  ctx.fillStyle = "rgba(18, 18, 18, 0.88)";
  roundRectFill(0, h - 112, w, 112, 0);
  ctx.fillStyle = "#ffb1dd";
  ctx.font = '700 44px "Trebuchet MS", sans-serif';
  ctx.fillText(bottomText.toUpperCase(), w / 2, h - 38);
}

function roundRectFill(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
}

function roundRectStroke(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.stroke();
}

function drawChaos() {
  if (!ui.chaosMode || !ui.chaosMode.checked) return;

  const w = ui.canvas.width;
  const h = ui.canvas.height;
  const stickerBursts = [
    ["REKT", "FOMO", "DIP", "HODL"],
    ["NGMI", "COPE", "WEN", "PUMP"],
    ["MOON", "BTFD", "RISKY", "SEND IT"],
    ["BAG", "DEGEN", "PANIC", "GM"],
    ["ATH?", "VOL", "LFG", "WHY"],
  ];

  const burst = randItem(stickerBursts);
  const spots = [
    [w * 0.12, h * 0.16],
    [w * 0.84, h * 0.18],
    [w * 0.10, h * 0.84],
    [w * 0.84, h * 0.82],
  ];

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 12;
  for (let i = 0; i < burst.length; i += 1) {
    const [x, y] = spots[i];
    ctx.fillStyle = "rgba(230, 45, 145, 0.9)";
    roundRectFill(x - 88, y - 46, 176, 82, 18);
    ctx.strokeStyle = "rgba(255, 210, 236, 0.95)";
    ctx.lineWidth = 3;
    roundRectStroke(x - 88, y - 46, 176, 82, 18);
    ctx.fillStyle = "#ffffff";
    ctx.font = '900 34px "Trebuchet MS", sans-serif';
    ctx.fillText(burst[i], x, y);
  }
  ctx.shadowBlur = 0;
}

function drawWatermark() {
  const w = ui.canvas.width;
  const h = ui.canvas.height;
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = '700 30px "Trebuchet MS", sans-serif';
  ctx.textAlign = "right";
  ctx.fillText("@Pancho", w - 24, h - 24);
}

function renderCurrent() {
  if (!currentMeme) return;

  drawBackdrop();

  if (currentMeme.style === "phone") drawPhoneBubble(currentMeme.top, currentMeme.bottom);
  else if (currentMeme.style === "chart") drawChartStyle(currentMeme.top, currentMeme.bottom);
  else if (currentMeme.style === "ticker") drawTickerStyle(currentMeme.top, currentMeme.bottom);
  else drawClassic(currentMeme.top, currentMeme.bottom);

  drawChaos();
  drawWatermark();

  ui.templateLabel.textContent = currentMeme.label;
}

function templatesForMode() {
  const labels = MODE_TEMPLATE_LABELS[currentMode] || [];
  if (!labels.length) return MEME_BANK;
  const subset = MEME_BANK.filter((t) => labels.includes(t.label));
  return subset.length ? subset : MEME_BANK;
}

function modeLinePool(mode, side) {
  const keys = mode === "all" ? ["bull", "bear", "degen"] : [mode];
  const out = [];

  for (const key of keys) {
    const bank = MODE_LINE_FRAGMENTS[key];
    if (!bank) continue;
    const starts = side === "top" ? bank.topStart : bank.bottomStart;
    const mids = side === "top" ? bank.topMid : bank.bottomMid;
    const ends = side === "top" ? bank.topEnd : bank.bottomEnd;

    // Fragment mixing creates thousands of combinations per mode.
    for (const a of starts) {
      for (const b of mids) {
        for (const c of ends) out.push(`${a}: ${b} ${c}`);
      }
    }
  }
  return out;
}

function pickMeme(template = null) {
  const base = template || randItem(templatesForMode());
  const spice = SPICE_CAPTIONS[spiceLevel] || SPICE_CAPTIONS[2];
  const modeTopPool = modeLinePool(currentMode, "top");
  const modeBottomPool = modeLinePool(currentMode, "bottom");
  const topEnglishPool = [...base.topSeeds, ...CAPTION_POOLS.topEnglish, ...spice.top, ...modeTopPool];
  const bottomEnglishPool = [...base.bottomSeeds, ...CAPTION_POOLS.bottomEnglish, ...spice.bottom, ...modeBottomPool];
  const topCandidates = Math.random() < ENGLISH_LINE_RATIO ? topEnglishPool : PANCHO_SPANGLISH.top;
  const bottomCandidates = Math.random() < ENGLISH_LINE_RATIO ? bottomEnglishPool : PANCHO_SPANGLISH.bottom;
  const topFinalPool = topCandidates.length ? topCandidates : topEnglishPool;
  const bottomFinalPool = bottomCandidates.length ? bottomCandidates : bottomEnglishPool;

  return {
    label: base.label,
    style: base.style,
    top: pickFresh(topFinalPool, recentTop, 18),
    bottom: pickFresh(bottomFinalPool, recentBottom, 18),
  };
}

function generate() {
  if (imagePool.length) {
    const candidates = imagePool.filter((entry) => !recentImages.includes(entry.src));
    activeImage = randItem(candidates.length ? candidates : imagePool);
    pushRecentImage(activeImage.src);
  }
  currentMeme = pickMeme();
  currentMeme.imageSrc = activeImage?.src || "";
  currentMeme.mode = currentMode;
  currentMeme.spice = spiceLevel;

  renderSavedLists();
  saveState();

  renderCurrent();
  setStatus("New meme dropped.");
}

function downloadCurrent() {
  if (!currentMeme) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const link = document.createElement("a");
  link.href = ui.canvas.toDataURL("image/png");
  link.download = `pancho_v2_${currentFormat}_${stamp}.png`;
  link.click();
  setStatus("PNG downloaded.");
}

async function copyCaption() {
  if (!currentMeme) return;
  const tags = HASHTAGS.sort(() => Math.random() - 0.5).slice(0, 4).join(" ");
  const text = `${currentMeme.top}\n\n${currentMeme.bottom}\n\n${tags}`;

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Caption copied.");
  } catch {
    setStatus("Could not copy caption automatically.");
  }
}

function bindEvents() {
  ui.generate.addEventListener("click", generate);
  ui.favorite.addEventListener("click", () => {
    if (!currentMeme) return;
    const key = `${currentMeme.label}|${currentMeme.top}|${currentMeme.bottom}|${currentMeme.imageSrc}`;
    const exists = favorites.some((x) => `${x.label}|${x.top}|${x.bottom}|${x.imageSrc}` === key);
    if (exists) {
      setStatus("Already in favorites.");
      return;
    }
    favorites.unshift({ ...currentMeme });
    if (favorites.length > 25) favorites.pop();
    renderSavedLists();
    saveState();
    setStatus("Saved to favorites.");
  });
  ui.download.addEventListener("click", downloadCurrent);

  ui.memeMode.addEventListener("change", () => {
    currentMode = ui.memeMode.value;
    setStatus(`Mode set to ${currentMode.toUpperCase()}.`);
    saveState();
  });
  ui.spiceSlider.addEventListener("input", () => {
    spiceLevel = Number(ui.spiceSlider.value);
    ui.spiceValue.textContent = SPICE_LABELS[spiceLevel];
    saveState();
  });

  ui.formatButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setCanvasFormat(btn.dataset.format);
      setStatus(`Format set to ${FORMATS[currentFormat].label}.`);
    });
  });
}

function tryLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed: ${src}`));
    img.src = src;
  });
}

async function loadMainImage() {
  for (const src of MAIN_IMAGE_PATHS) {
    try {
      const img = await tryLoadImage(src);
      imagePool.push({ src, img });
    } catch {
      // next path
    }
  }
}

function numberedCandidates() {
  const files = [];
  const exts = ["png", "jpg", "jpeg", "webp"];

  // Primary production naming: image1.png, image2.png, ...
  for (let i = 1; i <= 300; i += 1) {
    for (const ext of exts) {
      files.push(`public/assets/rotations/image${i}.${ext}`);
      files.push(`public/assets/rotations/image-${i}.${ext}`);
      files.push(`public/assets/rotations/image_${i}.${ext}`);
    }
  }

  return files;
}

async function loadManifestCandidates() {
  try {
    const res = await fetch(ROTATION_MANIFEST_PATH);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.images) ? data.images.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function loadDirectoryCandidates() {
  const folders = ["public/assets/rotations/", "public/assets/", "public/assets/variants/", "public/assets/images/"];
  const found = [];
  const seen = new Set();

  for (const folder of folders) {
    try {
      const res = await fetch(folder);
      if (!res.ok) continue;
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const links = Array.from(doc.querySelectorAll("a"));

      for (const link of links) {
        const href = link.getAttribute("href") || "";
        if (!href || href.includes("..") || href.endsWith("/")) continue;
        if (!/\.(png|jpg|jpeg|webp)$/i.test(href)) continue;
        const full = href.startsWith("http") ? href : `${folder}${href}`;
        if (seen.has(full)) continue;
        seen.add(full);
        found.push(full);
      }
    } catch {
      // ignore folder listing issues
    }
  }

  return found;
}

async function loadRotationImages() {
  const seen = new Set();
  const manifestCandidates = await loadManifestCandidates();
  const directoryCandidates = await loadDirectoryCandidates();
  const fallbackCandidates = numberedCandidates();
  const candidates = [...manifestCandidates, ...directoryCandidates, ...fallbackCandidates].filter((src) => {
    if (seen.has(src)) return false;
    seen.add(src);
    return true;
  });

  // Load in parallel so production doesn't block on serial 404 checks.
  const results = await Promise.allSettled(candidates.map(async (src) => ({ src, img: await tryLoadImage(src) })));
  const loaded = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  imagePool = [...imagePool, ...loaded];
  if (!imagePool.length) activeImage = null;
  else if (!activeImage) activeImage = randItem(imagePool);
}

async function boot() {
  loadState();
  if (!["all", "bull", "bear", "degen"].includes(currentMode)) currentMode = "all";
  bindEvents();
  ui.memeMode.value = currentMode;
  ui.spiceSlider.value = String(spiceLevel);
  ui.spiceValue.textContent = SPICE_LABELS[spiceLevel];
  renderSavedLists();
  setCanvasFormat("portrait");

  await loadMainImage();
  await loadRotationImages();

  if (!imagePool.length) {
    setStatus("No image found. Add public/assets/pancho-main.png.");
  } else if (imagePool.length > 2) {
    setStatus(`Loaded ${imagePool.length} images. Rotation mode ready.`);
  } else {
    setStatus("Loaded base image set. Add more files for rotation.");
  }

  generate();
}

boot();
