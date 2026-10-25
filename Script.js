/* ==========================================================================
   DevQuiz Pro - Modern Web Development Interactive Quiz Engine
   Features: Real-time Timer, Streak Bonus, Sound FX (Web Audio API),
             Canvas Confetti, Educational Explanations & Review Mode.
   ========================================================================== */

// 1. Comprehensive Question Bank
const questions = [
    {
        id: 1,
        type: "single",
        category: "HTML5",
        question: "HTML ka full form kya hai?",
        options: [
            "Hyper Text Markup Language",
            "High Text Machine Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
        ],
        answer: [0],
        explanation: "HTML stands for 'Hyper Text Markup Language'. Yeh web pages create karne aur content structure define karne ke liye standard language hai."
    },
    {
        id: 2,
        type: "single",
        category: "CSS3",
        question: "CSS me kisi element ko screen ke center me align karne ka modern tarika kaun sa hai?",
        codeSnippet: "display: flex;\njustify-content: center;\nalign-items: center;",
        options: [
            "margin: auto float: center;",
            "display: flex; justify-content: center; align-items: center;",
            "align: center; text-center: true;",
            "padding: 50% center;"
        ],
        answer: [1],
        explanation: "Flexbox me 'display: flex', 'justify-content: center' (horizontal) aur 'align-items: center' (vertical) use karke element ko perfect center me align kiya jata hai."
    },
    {
        id: 3,
        type: "multiple",
        category: "Web Tech",
        question: "Inmein se kaun-kaun se core Web Technologies hain? (Select all correct answers)",
        options: [
            "HTML (Structure)",
            "CSS (Styling & Design)",
            "JavaScript (Interactivity & Logic)",
            "MS Paint (Image Viewer)"
        ],
        answer: [0, 1, 2],
        explanation: "HTML, CSS aur JavaScript web development ke 3 fundamental pillars hain. MS Paint ek basic graphics utility tool hai."
    },
    {
        id: 4,
        type: "blank",
        category: "JavaScript",
        question: "JavaScript file ka standard file extension kya hota hai?",
        answer: ["js", ".js"],
        explanation: "JavaScript files ko '.js' extension ke sath save kiya jata hai, jaise 'script.js' ya 'app.js'."
    },
    {
        id: 5,
        type: "single",
        category: "JavaScript",
        question: "Niche diye gaye code ka output kya hoga?",
        codeSnippet: "console.log(typeof NaN);",
        options: [
            "\"undefined\"",
            "\"number\"",
            "\"NaN\"",
            "\"object\""
        ],
        answer: [1],
        explanation: "JavaScript me 'NaN' (Not-a-Number) ka type technically 'number' hota hai, jo IEEE 754 floating-point standard ka hissa hai."
    },
    {
        id: 6,
        type: "single",
        category: "Web Tech",
        question: "Website ka basic structure aur skeleton kis se banta hai?",
        options: [
            "HTML",
            "Python",
            "Microsoft Excel",
            "SQL Database"
        ],
        answer: [0],
        explanation: "HTML (Hyper Text Markup Language) kisi bhi website ke structure, headings, paragraphs aur layout ka blueprint banta hai."
    },
    {
        id: 7,
        type: "single",
        category: "CSS3",
        question: "CSS me Responsive Web Design banane ke liye kis rule ka use kiya jata hai?",
        codeSnippet: "@media (max-width: 768px) {\n  .container { width: 100%; }\n}",
        options: [
            "@screen-size",
            "@media queries",
            "@viewport-change",
            "@responsive-rule"
        ],
        answer: [1],
        explanation: "@media queries ke zariye hum different device widths (mobile, tablet, desktop) ke hisab se responsive styles apply karte hain."
    },
    {
        id: 8,
        type: "blank",
        category: "HTML5",
        question: "External CSS file ko HTML document se jodane (link) ke liye kaun sa tag use hota hai?",
        answer: ["<link>", "link", "<link/>"],
        explanation: "HTML me <link rel=\"stylesheet\" href=\"style.css\"> tag ko <head> section me include karke external stylesheet load ki jati hai."
    }
];

// 2. Sound Effects Engine (Native Web Audio API)
class SoundEffects {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem("devquiz_sound") !== "false";
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem("devquiz_sound", this.enabled);
        return this.enabled;
    }

    playTone(freq, duration, type = "sine", gainVal = 0.1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Graceful fallback
        }
    }

    click() {
        this.playTone(600, 0.05, "sine", 0.05);
    }

    correct() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        // Pleasant ascending chord
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 0.18, "triangle", 0.08);
            }, idx * 60);
        });
    }

    wrong() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        // Descending low buzzer
        this.playTone(280, 0.15, "sawtooth", 0.06);
        setTimeout(() => {
            this.playTone(220, 0.25, "sawtooth", 0.06);
        }, 120);
    }

    fanfare() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const melody = [
            { f: 523.25, d: 0.12 }, // C
            { f: 659.25, d: 0.12 }, // E
            { f: 783.99, d: 0.12 }, // G
            { f: 1046.5, d: 0.35 }  // High C
        ];
        melody.forEach((note, idx) => {
            setTimeout(() => {
                this.playTone(note.f, note.d, "triangle", 0.1);
            }, idx * 110);
        });
    }
}

const sfx = new SoundEffects();

// 3. Quiz State
const QUESTION_TIME_LIMIT = 25; // 25 seconds per question
let currentQuestionIndex = 0;
let userAnswers = []; // Indexes for current question
let totalScore = 0;
let correctCount = 0;
let currentStreak = 0;
let maxStreak = 0;
let timer = null;
let timeLeft = QUESTION_TIME_LIMIT;
let isAnswerConfirmed = false;
let quizStartTime = 0;
let quizHistory = []; // Stores user result history for review

// 4. DOM Elements
const soundBtn = document.getElementById("sound-btn");
const soundOnIcon = document.getElementById("sound-on-icon");
const soundOffIcon = document.getElementById("sound-off-icon");

const questionNumberEl = document.getElementById("question-number");
const progressBarEl = document.getElementById("progress-bar");
const liveScoreEl = document.getElementById("live-score");
const streakCounterEl = document.getElementById("streak-counter");

const timerPill = document.getElementById("timer-pill");
const timerSecondsEl = document.getElementById("timer-seconds");
const timerRingProgress = document.getElementById("timer-ring-progress");

const categoryBadge = document.getElementById("category-badge");
const typeBadge = document.getElementById("type-badge");
const questionTitle = document.getElementById("question");
const codeSnippetContainer = document.getElementById("code-snippet-container");
const codeSnippetEl = document.getElementById("code-snippet");
const optionsContainer = document.getElementById("options");

const textAnswerContainer = document.getElementById("text-answer-container");
const textAnswerInput = document.getElementById("text-answer");
const textSubmitBtn = document.getElementById("text-submit-btn");

const feedbackBox = document.getElementById("feedback-box");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackExplanation = document.getElementById("feedback-explanation");

const messageEl = document.getElementById("message");
const nextBtn = document.getElementById("next-btn");
const nextBtnText = document.getElementById("next-btn-text");

// Result DOM
const questionSection = document.getElementById("question-section");
const quizHud = document.getElementById("quiz-hud");
const resultSection = document.getElementById("result");
const resultTrophy = document.getElementById("result-trophy");
const resultHeadline = document.getElementById("result-headline");
const resultTagline = document.getElementById("result-tagline");

const scoreSvgBar = document.getElementById("score-svg-bar");
const scorePercentageNum = document.getElementById("score-percentage");
const finalPointsEl = document.getElementById("final-points");
const finalCorrectEl = document.getElementById("final-correct");
const finalStreakEl = document.getElementById("final-streak");
const finalTimeEl = document.getElementById("final-time");

const toggleReviewBtn = document.getElementById("toggle-review-btn");
const reviewContainer = document.getElementById("review-container");
const reviewArrow = document.getElementById("review-arrow");
const restartBtn = document.getElementById("restart-btn");
const shareBtn = document.getElementById("share-btn");
const toastEl = document.getElementById("toast");

// 5. Sound Button Setup
function updateSoundUI() {
    if (sfx.enabled) {
        soundOnIcon.classList.remove("hidden");
        soundOffIcon.classList.add("hidden");
        soundBtn.setAttribute("title", "Mute Sound (M)");
    } else {
        soundOnIcon.classList.add("hidden");
        soundOffIcon.classList.remove("hidden");
        soundBtn.setAttribute("title", "Unmute Sound (M)");
    }
}
updateSoundUI();

soundBtn.addEventListener("click", () => {
    sfx.toggle();
    updateSoundUI();
    showToast(sfx.enabled ? "Sound: ON 🔊" : "Sound: Muted 🔇");
});

// 6. Timer Mechanics
const TIMER_CIRCUMFERENCE = 97.4; // 2 * Math.PI * 15.5

function startTimer() {
    clearInterval(timer);
    timeLeft = QUESTION_TIME_LIMIT;
    updateTimerDisplay();

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerSecondsEl.textContent = `${timeLeft}s`;

    // SVG dashoffset calculation
    const progress = (QUESTION_TIME_LIMIT - timeLeft) / QUESTION_TIME_LIMIT;
    const offset = progress * TIMER_CIRCUMFERENCE;
    timerRingProgress.style.strokeDashoffset = offset;

    // Visual indicators
    timerPill.classList.remove("warning", "danger");
    if (timeLeft <= 4) {
        timerPill.classList.add("danger");
        timerRingProgress.style.stroke = "#f43f5e";
    } else if (timeLeft <= 8) {
        timerPill.classList.add("warning");
        timerRingProgress.style.stroke = "#f59e0b";
    } else {
        timerRingProgress.style.stroke = "#6366f1";
    }
}

function handleTimeOut() {
    if (isAnswerConfirmed) return;
    sfx.wrong();
    messageEl.textContent = "⏰ Time's up! Check out the correct answer below.";
    messageEl.classList.remove("hidden");
    confirmAnswer(true); // timed out
}

// 7. Question Loader
function loadQuestion() {
    const q = questions[currentQuestionIndex];
    isAnswerConfirmed = false;
    userAnswers = [];

    // HUD Update
    questionNumberEl.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBarEl.style.width = `${progressPercent}%`;

    // Reset Elements
    messageEl.textContent = "";
    messageEl.classList.add("hidden");
    feedbackBox.classList.add("hidden");
    optionsContainer.innerHTML = "";
    textAnswerInput.value = "";
    nextBtnText.textContent = "Confirm Answer";

    // Meta Badges
    categoryBadge.textContent = q.category || "General";
    if (q.type === "single") {
        typeBadge.textContent = "Single Choice";
    } else if (q.type === "multiple") {
        typeBadge.textContent = "Multiple Choice";
    } else if (q.type === "blank") {
        typeBadge.textContent = "Fill in the Blank";
    }

    // Question Title
    questionTitle.textContent = q.question;

    // Code Snippet Handling
    if (q.codeSnippet) {
        codeSnippetEl.textContent = q.codeSnippet;
        codeSnippetContainer.classList.remove("hidden");
    } else {
        codeSnippetContainer.classList.add("hidden");
    }

    // Render Options or Input
    if (q.type === "blank") {
        optionsContainer.classList.add("hidden");
        textAnswerContainer.classList.remove("hidden");
        setTimeout(() => textAnswerInput.focus(), 150);
    } else {
        optionsContainer.classList.remove("hidden");
        textAnswerContainer.classList.add("hidden");

        const letters = ["A", "B", "C", "D", "E"];
        q.options.forEach((optText, idx) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.type = "button";
            btn.dataset.index = idx;

            btn.innerHTML = `
                <span class="option-tag">${letters[idx] || (idx + 1)}</span>
                <span class="option-text">${optText}</span>
            `;

            btn.addEventListener("click", () => {
                if (isAnswerConfirmed) return;
                sfx.click();
                selectOption(btn, idx, q.type);
            });

            optionsContainer.appendChild(btn);
        });
    }

    // Start Timer
    startTimer();
}

// 8. Option Selection
function selectOption(button, index, type) {
    messageEl.classList.add("hidden");

    if (type === "single") {
        userAnswers = [index];
        document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
        button.classList.add("selected");
    } else if (type === "multiple") {
        if (userAnswers.includes(index)) {
            userAnswers = userAnswers.filter(i => i !== index);
            button.classList.remove("selected");
        } else {
            userAnswers.push(index);
            button.classList.add("selected");
        }
    }
}

// Enter Key on Text Input
textAnswerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        if (!isAnswerConfirmed) {
            handleActionClick();
        }
    }
});

textSubmitBtn.addEventListener("click", () => {
    if (!isAnswerConfirmed) {
        handleActionClick();
    }
});

// 9. Answer Evaluation & Feedback
function confirmAnswer(isTimeout = false) {
    clearInterval(timer);
    isAnswerConfirmed = true;

    const q = questions[currentQuestionIndex];
    let isCorrect = false;
    let userGivenText = "";

    if (q.type === "blank") {
        const inputVal = textAnswerInput.value.trim().toLowerCase();
        userGivenText = inputVal || "(No answer)";
        textAnswerInput.disabled = true;

        if (!isTimeout && inputVal !== "") {
            isCorrect = q.answer.some(ans => inputVal === ans.toLowerCase());
        }
    } else {
        const buttons = document.querySelectorAll(".option-btn");
        buttons.forEach(b => (b.disabled = true));

        if (!isTimeout) {
            const correctSorted = [...q.answer].sort((a, b) => a - b);
            const userSorted = [...userAnswers].sort((a, b) => a - b);
            isCorrect =
                correctSorted.length === userSorted.length &&
                correctSorted.every((v, i) => v === userSorted[i]);

            userGivenText = userAnswers.map(idx => q.options[idx]).join(", ") || "(No option selected)";
        } else {
            userGivenText = "(Time expired)";
        }

        // Highlight options
        buttons.forEach((btn, idx) => {
            if (q.answer.includes(idx)) {
                btn.classList.add("correct");
            } else if (userAnswers.includes(idx)) {
                btn.classList.add("wrong");
            }
        });
    }

    // Score & Streak Calculation
    if (isCorrect) {
        sfx.correct();
        correctCount++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;

        // Base points + Streak bonus + Speed bonus
        const streakBonus = (currentStreak - 1) * 20;
        const speedBonus = Math.floor(timeLeft * 4);
        const questionPoints = 100 + streakBonus + speedBonus;
        totalScore += questionPoints;

        // Animate streak indicator
        streakCounterEl.textContent = `🔥 ${currentStreak}`;
        streakCounterEl.classList.remove("streak-bump");
        void streakCounterEl.offsetWidth; // trigger reflow
        streakCounterEl.classList.add("streak-bump");

        // Display correct feedback
        feedbackBox.className = "feedback-box correct-feedback";
        feedbackIcon.textContent = "✓";
        feedbackTitle.textContent = `Correct! +${questionPoints} pts (⚡ Streak: ${currentStreak}x)`;
    } else {
        sfx.wrong();
        currentStreak = 0;
        streakCounterEl.textContent = `🔥 0`;

        feedbackBox.className = "feedback-box wrong-feedback";
        feedbackIcon.textContent = "✕";
        feedbackTitle.textContent = isTimeout ? "Time Expired!" : "Incorrect Answer";
    }

    liveScoreEl.textContent = `${totalScore} pts`;

    // Educational Explanation
    feedbackExplanation.textContent = q.explanation || "Great effort! Learn and keep moving forward.";
    feedbackBox.classList.remove("hidden");

    // Save for Review History
    let correctDisplay = "";
    if (q.type === "blank") {
        correctDisplay = q.answer[0];
    } else {
        correctDisplay = q.answer.map(idx => q.options[idx]).join(", ");
    }

    quizHistory.push({
        questionNumber: currentQuestionIndex + 1,
        question: q.question,
        category: q.category,
        userAnswer: userGivenText,
        correctAnswer: correctDisplay,
        isCorrect: isCorrect,
        explanation: q.explanation
    });

    // Update Action Button
    if (currentQuestionIndex === questions.length - 1) {
        nextBtnText.textContent = "View Final Results";
    } else {
        nextBtnText.textContent = "Next Question";
    }
}

// 10. Next / Action Button Handler
function handleActionClick() {
    const q = questions[currentQuestionIndex];

    if (!isAnswerConfirmed) {
        // Validate user input before confirming
        if (q.type === "blank") {
            const val = textAnswerInput.value.trim();
            if (!val) {
                sfx.click();
                messageEl.textContent = "⚠️ Please type your answer before confirming!";
                messageEl.classList.remove("hidden");
                return;
            }
        } else {
            if (userAnswers.length === 0) {
                sfx.click();
                messageEl.textContent = "⚠️ Please select an option to continue!";
                messageEl.classList.remove("hidden");
                return;
            }
        }

        confirmAnswer(false);
    } else {
        // Advance to next question or show results
        sfx.click();
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showFinalResults();
        }
    }
}

nextBtn.addEventListener("click", handleActionClick);

// 11. Results Screen & Confetti
function showFinalResults() {
    clearInterval(timer);
    sfx.fanfare();

    questionSection.classList.add("hidden");
    quizHud.classList.add("hidden");
    resultSection.classList.remove("hidden");

    const totalSeconds = Math.round((Date.now() - quizStartTime) / 1000);
    const accuracy = Math.round((correctCount / questions.length) * 100);

    // Percentage Circle Animation
    scorePercentageNum.textContent = `${accuracy}%`;
    const scoreCircleCircumference = 314.16; // 2 * PI * 50
    const targetOffset = scoreCircleCircumference - (accuracy / 100) * scoreCircleCircumference;
    setTimeout(() => {
        scoreSvgBar.style.strokeDashoffset = targetOffset;
        if (accuracy >= 80) {
            scoreSvgBar.style.stroke = "#10b981";
        } else if (accuracy >= 50) {
            scoreSvgBar.style.stroke = "#6366f1";
        } else {
            scoreSvgBar.style.stroke = "#f43f5e";
        }
    }, 200);

    // Rank & Headline
    if (accuracy === 100) {
        resultTrophy.textContent = "🏆";
        resultHeadline.textContent = "Web Grandmaster!";
        resultTagline.textContent = "Flawless performance! You know your web technologies inside and out.";
    } else if (accuracy >= 75) {
        resultTrophy.textContent = "🌟";
        resultHeadline.textContent = "Senior Developer!";
        resultTagline.textContent = "Excellent work! You have strong core fundamentals and speed.";
    } else if (accuracy >= 50) {
        resultTrophy.textContent = "🚀";
        resultHeadline.textContent = "Frontend Explorer!";
        resultTagline.textContent = "Good job! A little more practice and you will master everything.";
    } else {
        resultTrophy.textContent = "💡";
        resultHeadline.textContent = "Apprentice Coder";
        resultTagline.textContent = "Every master was once a beginner. Review the answers and try again!";
    }

    // Populate Detailed Stats
    finalPointsEl.textContent = `${totalScore} pts`;
    finalCorrectEl.textContent = `${correctCount} / ${questions.length}`;
    finalStreakEl.textContent = `${maxStreak}x`;
    finalTimeEl.textContent = `${totalSeconds}s`;

    // Populate Review Accordion
    renderReviewSection();

    // Trigger Canvas Confetti if score >= 50%
    if (accuracy >= 50) {
        triggerConfetti();
    }
}

// 12. Review Answers Accordion
function renderReviewSection() {
    reviewContainer.innerHTML = "";

    quizHistory.forEach(item => {
        const div = document.createElement("div");
        div.className = `review-item ${item.isCorrect ? "is-correct" : "is-wrong"}`;

        div.innerHTML = `
            <div class="review-q-title">${item.questionNumber}. ${item.question}</div>
            <div class="review-ans-row user-ans">
                <strong>Your Answer:</strong> ${item.userAnswer} ${item.isCorrect ? "✅" : "❌"}
            </div>
            ${!item.isCorrect ? `
                <div class="review-ans-row correct-ans">
                    <strong>Correct Answer:</strong> ${item.correctAnswer}
                </div>
            ` : ""}
            <div class="review-explanation">
                <strong>💡 Tip:</strong> ${item.explanation}
            </div>
        `;

        reviewContainer.appendChild(div);
    });
}

toggleReviewBtn.addEventListener("click", () => {
    sfx.click();
    const isHidden = reviewContainer.classList.contains("hidden");
    if (isHidden) {
        reviewContainer.classList.remove("hidden");
        reviewArrow.classList.add("open");
    } else {
        reviewContainer.classList.add("hidden");
        reviewArrow.classList.remove("open");
    }
});

// 13. Restart Quiz
restartBtn.addEventListener("click", () => {
    sfx.click();
    currentQuestionIndex = 0;
    userAnswers = [];
    totalScore = 0;
    correctCount = 0;
    currentStreak = 0;
    maxStreak = 0;
    quizHistory = [];
    quizStartTime = Date.now();

    liveScoreEl.textContent = "0 pts";
    streakCounterEl.textContent = "🔥 0";

    resultSection.classList.add("hidden");
    reviewContainer.classList.add("hidden");
    reviewArrow.classList.remove("open");
    questionSection.classList.remove("hidden");
    quizHud.classList.remove("hidden");

    loadQuestion();
});

// 14. Share / Copy Score to Clipboard
shareBtn.addEventListener("click", () => {
    sfx.click();
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const shareText = `⚡ DevQuiz Pro Result:\nScore: ${totalScore} pts (${accuracy}%)\nCorrect: ${correctCount}/${questions.length}\nBest Streak: ${maxStreak}x 🔥\nTest your web dev skills!`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast("Score copied to clipboard! 📋");
        }).catch(() => {
            fallbackCopy(shareText);
        });
    } else {
        fallbackCopy(shareText);
    }
});

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand("copy");
        showToast("Score copied to clipboard! 📋");
    } catch (err) {
        showToast("Could not copy score.");
    }
    document.body.removeChild(textArea);
}

function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.remove("hidden");
    setTimeout(() => {
        toastEl.classList.add("hidden");
    }, 2400);
}

// 15. Canvas Confetti Animation
function triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#6366f1", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#a855f7"];

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height * 0.45,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.7) * 15,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
            opacity: 1
        });
    }

    let animationFrame;
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.009;

            if (p.opacity > 0) {
                active = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }
        });

        if (active) {
            animationFrame = requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationFrame);
        }
    }

    render();
}

// 16. Keyboard Accessibility
window.addEventListener("keydown", (e) => {
    // Sound mute toggle
    if ((e.key === "m" || e.key === "M") && document.activeElement !== textAnswerInput) {
        sfx.toggle();
        updateSoundUI();
        showToast(sfx.enabled ? "Sound: ON 🔊" : "Sound: Muted 🔇");
        return;
    }

    // Number keys 1-4 for option selection
    if (["1", "2", "3", "4"].includes(e.key) && document.activeElement !== textAnswerInput) {
        const idx = parseInt(e.key, 10) - 1;
        const buttons = document.querySelectorAll(".option-btn");
        if (buttons[idx] && !isAnswerConfirmed) {
            buttons[idx].click();
        }
        return;
    }

    // Enter for next/confirm
    if (e.key === "Enter" && document.activeElement !== textAnswerInput) {
        if (!resultSection.classList.contains("hidden")) {
            restartBtn.click();
        } else {
            handleActionClick();
        }
    }
});

// Resize handler for canvas
window.addEventListener("resize", () => {
    const canvas = document.getElementById("confetti-canvas");
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// 17. Initialization
quizStartTime = Date.now();
loadQuestion();
