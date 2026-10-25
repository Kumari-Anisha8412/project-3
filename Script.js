/**
 * ProChronos - Precision Stopwatch & Lap Timer
 * High-precision timing, circular progress visualization, lap analysis,
 * Web Audio feedback, and keyboard shortcuts.
 */

// DOM Elements
const mainTimeDisplay = document.getElementById("mainTime");
const msDigitsDisplay = document.getElementById("msDigits");
const startPauseBtn = document.getElementById("startPauseBtn");
const startPauseText = document.getElementById("startPauseText");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const progressCircle = document.getElementById("progressCircle");
const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");

// Lap & Stats Elements
const lapList = document.getElementById("lapList");
const lapEmptyState = document.getElementById("lapEmptyState");
const lapCountBadge = document.getElementById("lapCountBadge");
const lapStatsSection = document.getElementById("lapStatsSection");
const fastestLapVal = document.getElementById("fastestLapVal");
const fastestLapNo = document.getElementById("fastestLapNo");
const slowestLapVal = document.getElementById("slowestLapVal");
const slowestLapNo = document.getElementById("slowestLapNo");
const avgLapVal = document.getElementById("avgLapVal");
const copyLapsBtn = document.getElementById("copyLapsBtn");
const clearLapsBtn = document.getElementById("clearLapsBtn");
const currentLapPreview = document.getElementById("currentLapPreview");
const currentLapIndex = document.getElementById("currentLapIndex");
const currentLapTime = document.getElementById("currentLapTime");

// Sound Elements
const soundToggleBtn = document.getElementById("soundToggleBtn");
const soundOnIcon = document.getElementById("soundOnIcon");
const soundOffIcon = document.getElementById("soundOffIcon");
const toast = document.getElementById("toast");

// Stopwatch State
let startTime = 0;
let elapsedTime = 0;
let animationFrameId = null;
let isRunning = false;

// Lap State
// Each lap: { id, lapTime, totalTime }
let laps = [];
let lastLapTimestamp = 0;

// Circular Progress Configuration
const RING_CIRCUMFERENCE = 816.81; // 2 * PI * 130
progressCircle.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
progressCircle.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;

// Web Audio API Sound Synthesizer
let audioCtx = null;
let isMuted = localStorage.getItem("prochronos_muted") === "true";

function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

function playSound(type) {
    if (isMuted) return;
    try {
        initAudio();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === "start") {
            // Crisp high beep
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === "pause") {
            // Descending tone
            osc.frequency.setValueAtTime(659.25, now); // E5
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.08); // A4
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === "lap") {
            // Double click tick
            osc.frequency.setValueAtTime(1046.5, now); // C6
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === "reset") {
            // Low confirmation chime
            osc.frequency.setValueAtTime(329.63, now); // E4
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    } catch (e) {
        // Audio might fail if user hasn't interacted with document yet
    }
}

// Update Sound Toggle UI
function updateSoundUI() {
    if (isMuted) {
        soundOnIcon.classList.add("hidden");
        soundOffIcon.classList.remove("hidden");
        soundToggleBtn.setAttribute("title", "Sound Muted (M to unmute)");
    } else {
        soundOnIcon.classList.remove("hidden");
        soundOffIcon.classList.add("hidden");
        soundToggleBtn.setAttribute("title", "Sound Enabled (M to mute)");
    }
}
updateSoundUI();

soundToggleBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    localStorage.setItem("prochronos_muted", isMuted);
    updateSoundUI();
    showToast(isMuted ? "Sound Muted" : "Sound Enabled");
});

// Toast notification helper
let toastTimeout = null;
function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.remove("hidden");
    toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2000);
}

// Format time utility: returns { main: "HH:MM:SS", ms: "MS", full: "HH:MM:SS.MS" }
function formatTime(msTotal) {
    const totalMs = Math.max(0, Math.floor(msTotal));
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const hundredths = Math.floor((totalMs % 1000) / 10);

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    const ms = String(hundredths).padStart(2, "0");

    return {
        main: `${hh}:${mm}:${ss}`,
        ms: ms,
        full: `${hh}:${mm}:${ss}.${ms}`,
        short: `${mm}:${ss}.${ms}`
    };
}

// Render Timer Display & Progress Ring
function renderDisplay() {
    const currentTotal = isRunning 
        ? elapsedTime + (performance.now() - startTime) 
        : elapsedTime;

    const formatted = formatTime(currentTotal);
    mainTimeDisplay.textContent = formatted.main;
    msDigitsDisplay.textContent = formatted.ms;

    // Current lap preview calculation
    const currentLapDuration = currentTotal - lastLapTimestamp;
    currentLapTime.textContent = formatTime(currentLapDuration).short;

    // Progress Ring: smooth 60-second sweep
    const totalSecondsFraction = (currentTotal % 60000) / 60000;
    const offset = RING_CIRCUMFERENCE - (totalSecondsFraction * RING_CIRCUMFERENCE);
    progressCircle.style.strokeDashoffset = `${offset}`;

    if (isRunning) {
        animationFrameId = requestAnimationFrame(renderDisplay);
    }
}

// Start Timer
function startTimer() {
    if (isRunning) return;
    initAudio();

    isRunning = true;
    startTime = performance.now();
    animationFrameId = requestAnimationFrame(renderDisplay);

    // Update UI states
    startPauseBtn.classList.add("is-running");
    startPauseText.textContent = "Pause";
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");

    statusBadge.className = "status-pill running";
    statusText.textContent = "RUNNING";

    lapBtn.disabled = false;
    resetBtn.disabled = false;

    playSound("start");
}

// Pause Timer
function pauseTimer() {
    if (!isRunning) return;

    elapsedTime += performance.now() - startTime;
    isRunning = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    renderDisplay();

    // Update UI states
    startPauseBtn.classList.remove("is-running");
    startPauseText.textContent = "Resume";
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");

    statusBadge.className = "status-pill paused";
    statusText.textContent = "PAUSED";

    lapBtn.disabled = true;

    playSound("pause");
}

// Toggle Start / Pause
function toggleStartPause() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// Reset Stopwatch
function resetStopwatch() {
    if (isRunning) {
        pauseTimer();
    }

    startTime = 0;
    elapsedTime = 0;
    lastLapTimestamp = 0;
    laps = [];

    // Reset Display & Ring
    mainTimeDisplay.textContent = "00:00:00";
    msDigitsDisplay.textContent = "00";
    progressCircle.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;

    // Reset Buttons & States
    startPauseBtn.classList.remove("is-running");
    startPauseText.textContent = "Start";
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");

    statusBadge.className = "status-pill";
    statusText.textContent = "READY";

    lapBtn.disabled = true;
    resetBtn.disabled = true;
    clearLapsBtn.disabled = true;
    copyLapsBtn.disabled = true;

    currentLapIndex.textContent = "1";
    currentLapTime.textContent = "00:00.00";

    // Clear Lap List & Stats
    lapList.innerHTML = "";
    lapEmptyState.classList.remove("hidden");
    lapStatsSection.classList.add("hidden");
    lapCountBadge.textContent = "0";

    playSound("reset");
}

// Record Lap
function recordLap() {
    if (!isRunning) return;

    const currentTotal = elapsedTime + (performance.now() - startTime);
    const lapDuration = currentTotal - lastLapTimestamp;
    lastLapTimestamp = currentTotal;

    const lapNumber = laps.length + 1;
    const lapData = {
        id: lapNumber,
        lapTime: lapDuration,
        totalTime: currentTotal
    };

    laps.push(lapData);
    currentLapIndex.textContent = `${lapNumber + 1}`;

    renderLaps();
    playSound("lap");
}

// Render Lap list & Statistics
function renderLaps() {
    if (laps.length === 0) {
        lapEmptyState.classList.remove("hidden");
        lapStatsSection.classList.add("hidden");
        clearLapsBtn.disabled = true;
        copyLapsBtn.disabled = true;
        lapCountBadge.textContent = "0";
        lapList.innerHTML = "";
        return;
    }

    lapEmptyState.classList.add("hidden");
    clearLapsBtn.disabled = false;
    copyLapsBtn.disabled = false;
    lapCountBadge.textContent = `${laps.length}`;

    // Determine fastest & slowest laps (when 2 or more laps exist)
    let fastestLap = null;
    let slowestLap = null;
    let totalLapTimes = 0;

    if (laps.length >= 2) {
        fastestLap = laps.reduce((prev, curr) => (curr.lapTime < prev.lapTime ? curr : prev));
        slowestLap = laps.reduce((prev, curr) => (curr.lapTime > prev.lapTime ? curr : prev));
        totalLapTimes = laps.reduce((sum, lap) => sum + lap.lapTime, 0);

        const avgTime = totalLapTimes / laps.length;

        // Update stats cards
        fastestLapVal.textContent = formatTime(fastestLap.lapTime).short;
        fastestLapNo.textContent = `Lap ${fastestLap.id}`;

        slowestLapVal.textContent = formatTime(slowestLap.lapTime).short;
        slowestLapNo.textContent = `Lap ${slowestLap.id}`;

        avgLapVal.textContent = formatTime(avgTime).short;

        lapStatsSection.classList.remove("hidden");
    } else {
        lapStatsSection.classList.add("hidden");
    }

    // Build lap list rows (newest on top)
    lapList.innerHTML = "";
    
    // Iterate in reverse for latest first
    for (let i = laps.length - 1; i >= 0; i--) {
        const lap = laps[i];
        const li = document.createElement("li");
        li.className = "lap-item";

        let isFastest = fastestLap && lap.id === fastestLap.id;
        let isSlowest = slowestLap && lap.id === slowestLap.id;

        if (isFastest) li.classList.add("is-fastest");
        if (isSlowest) li.classList.add("is-slowest");

        // Lap Left: Number + optional tag
        const leftDiv = document.createElement("div");
        leftDiv.className = "lap-left";

        const numSpan = document.createElement("span");
        numSpan.className = "lap-number";
        numSpan.textContent = `Lap ${String(lap.id).padStart(2, "0")}`;
        leftDiv.appendChild(numSpan);

        if (isFastest) {
            const tag = document.createElement("span");
            tag.className = "lap-tag";
            tag.textContent = "Fastest";
            leftDiv.appendChild(tag);
        } else if (isSlowest) {
            const tag = document.createElement("span");
            tag.className = "lap-tag";
            tag.textContent = "Slowest";
            leftDiv.appendChild(tag);
        }

        // Lap Middle: Lap Interval duration
        const deltaSpan = document.createElement("span");
        deltaSpan.className = "lap-delta";
        deltaSpan.textContent = formatTime(lap.lapTime).short;

        // Lap Right: Overall Total Time
        const totalSpan = document.createElement("span");
        totalSpan.className = "lap-total";
        totalSpan.textContent = formatTime(lap.totalTime).short;

        li.appendChild(leftDiv);
        li.appendChild(deltaSpan);
        li.appendChild(totalSpan);

        lapList.appendChild(li);
    }
}

// Clear all recorded laps without resetting stopwatch
function clearAllLaps() {
    if (laps.length === 0) return;
    laps = [];
    currentLapIndex.textContent = "1";
    renderLaps();
    showToast("Lap records cleared");
}

// Copy Laps to Clipboard
function copyLapsToClipboard() {
    if (laps.length === 0) return;

    let text = "=== ProChronos Lap Records ===\n";
    text += `Total Laps: ${laps.length}\n`;
    text += "Lap #\tSplit Time\tTotal Time\n";
    text += "--------------------------------------\n";

    laps.forEach(lap => {
        text += `Lap ${lap.id}\t${formatTime(lap.lapTime).full}\t${formatTime(lap.totalTime).full}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
        showToast("Laps copied to clipboard! 📋");
    }).catch(() => {
        showToast("Failed to copy laps");
    });
}

// Event Listeners
startPauseBtn.addEventListener("click", toggleStartPause);
lapBtn.addEventListener("click", recordLap);
resetBtn.addEventListener("click", resetStopwatch);
clearLapsBtn.addEventListener("click", clearAllLaps);
copyLapsBtn.addEventListener("click", copyLapsToClipboard);

// Keyboard Shortcuts Listener
window.addEventListener("keydown", (e) => {
    // Avoid triggering when focused on inputs or editable fields
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
        return;
    }

    if (e.code === "Space") {
        e.preventDefault();
        toggleStartPause();
    } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        if (isRunning) recordLap();
    } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (elapsedTime > 0 || isRunning) resetStopwatch();
    } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        soundToggleBtn.click();
    }
});

// Initial display setup
renderDisplay();
