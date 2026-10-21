```javascript
const questions = [
    {
        type: "single",
        question: "1. HTML ka full form kya hai?",
        options: [
            "Hyper Text Markup Language",
            "High Text Machine Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
        ],
        answer: [0]
    },

    {
        type: "single",
        question: "2. CSS ka use kis liye hota hai?",
        options: [
            "Database banane ke liye",
            "Website design karne ke liye",
            "Server banane ke liye",
            "Data store karne ke liye"
        ],
        answer: [1]
    },

    {
        type: "multiple",
        question: "3. Inmein se kaun web technologies hain? (Select all correct answers)",
        options: [
            "HTML",
            "CSS",
            "JavaScript",
            "MS Paint"
        ],
        answer: [0, 1, 2]
    },

    {
        type: "blank",
        question: "4. JavaScript file ka extension kya hota hai?",
        answer: ["js", ".js"]
    },

    {
        type: "single",
        question: "5. Website ka structure kis se banta hai?",
        options: [
            "HTML",
            "Excel",
            "PowerPoint",
            "Notepad"
        ],
        answer: [0]
    }
];

let currentQuestion = 0;
let score = 0;
let userAnswers = [];

const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const textAnswer = document.getElementById("text-answer");
const nextBtn = document.getElementById("next-btn");
const message = document.getElementById("message");
const result = document.getElementById("result");
const scoreText = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");

function loadQuestion() {
    const q = questions[currentQuestion];

    questionNumber.textContent =
        `Question ${currentQuestion + 1} of ${questions.length}`;

    questionText.textContent = q.question;

    optionsContainer.innerHTML = "";
    message.textContent = "";
    textAnswer.value = "";
    userAnswers = [];

    if (q.type === "blank") {
        textAnswer.style.display = "block";
    } else {
        textAnswer.style.display = "none";

        q.options.forEach((option, index) => {
            const button = document.createElement("button");

            button.textContent = option;
            button.className = "option-btn";
            button.type = "button";

            button.addEventListener("click", () => {
                selectOption(button, index, q.type);
            });

            optionsContainer.appendChild(button);
        });
    }

    nextBtn.textContent =
        currentQuestion === questions.length - 1
            ? "Submit Quiz"
            : "Next Question";
}

function selectOption(button, index, type) {
    if (type === "single") {
        userAnswers = [index];

        document.querySelectorAll(".option-btn").forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");
    } else {
        if (userAnswers.includes(index)) {
            userAnswers = userAnswers.filter(item => item !== index);
            button.classList.remove("selected");
        } else {
            userAnswers.push(index);
            button.classList.add("selected");
        }
    }
}

function checkAnswer() {
    const q = questions[currentQuestion];

    if (q.type === "blank") {
        const answer = textAnswer.value.trim().toLowerCase();

        if (answer === "") {
            message.textContent = "Please enter your answer!";
            return false;
        }

        if (q.answer.some(correct =>
            answer === correct.toLowerCase()
        )) {
            score++;
        }
    } else {
        if (userAnswers.length === 0) {
            message.textContent = "Please select an answer!";
            return false;
        }

        const correct = [...q.answer].sort((a, b) => a - b);
        const selected = [...userAnswers].sort((a, b) => a - b);

        if (
            correct.length === selected.length &&
            correct.every((value, index) => value === selected[index])
        ) {
            score++;
        }
    }

    return true;
}

function showResult() {
    questionNumber.style.display = "none";
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    textAnswer.style.display = "none";
    message.style.display = "none";
    nextBtn.style.display = "none";

    result.style.display = "block";

    scoreText.textContent =
        `Your Score: ${score} / ${questions.length}`;
}

nextBtn.addEventListener("click", () => {
    if (!checkAnswer()) {
        return;
    }

    currentQuestion++;

    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
});

restartBtn.addEventListener("click", () => {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];

    questionNumber.style.display = "block";
    questionText.style.display = "block";
    optionsContainer.style.display = "flex";
    message.style.display = "block";
    nextBtn.style.display = "block";
    result.style.display = "none";

    loadQuestion();
});

loadQuestion();
```
