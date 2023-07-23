const API_URL = 'https://opentdb.com/api.php?amount=10&category=15&type=multiple';
const QUESTION_TIMEOUT = 10; // 10 seconds per question

let currentQuestionIndex = 0;
let score = 0;
let timerInterval;

const startButton = document.getElementById('start-button');
const startSection = document.getElementById('start-section');
const rulesSection = document.getElementById('rules-section');
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const timerElement = document.getElementById('timer');
const answerButtonsElement = document.getElementById('answer-buttons');
const submitButton = document.getElementById('submit-button');
const resultElement = document.getElementById('result');

// Fetch questions from the API
async function getQuestions() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}

// Display the current question and answers
function showQuestion(question) {
    questionElement.textContent = question.question;
    timerElement.textContent = `Time left: ${QUESTION_TIMEOUT} seconds`;

    // Clear previous answer buttons
    answerButtonsElement.innerHTML = '';

    // Combine correct and incorrect answers for random order
    const answers = [...question.incorrect_answers, question.correct_answer];
    answers.sort(() => Math.random() - 0.5);

    // Create and append answer buttons
    answers.forEach((answer) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.classList.add('answer-btn');
        button.addEventListener('click', () => handleAnswerClick(answer === question.correct_answer));
        answerButtonsElement.appendChild(button);
    });

    // Start the timer for this question
    startTimer();
}

// Handle answer button clicks
function handleAnswerClick(isCorrect) {
    if (isCorrect) {
        score++;
    }

    // Clear the timer for this question
    clearInterval(timerInterval);

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion(questions[currentQuestionIndex]);
    } else {
        showResult();
    }
}

// Display quiz result
function showResult() {
    questionContainer.style.display = 'none';
    submitButton.style.display = 'none';
    resultElement.textContent = `Your score: ${score} out of ${questions.length}`;
    resultElement.style.display = 'block';
}

// Show rules section and start the quiz when the "Start" button is pressed
let questions = [];

startButton.addEventListener('click', function () {
    startSection.style.display = 'none';
    rulesSection.style.display = 'block';
});

// Start the quiz when the "Start Quiz" button is pressed
const startQuizButton = document.getElementById('start-quiz-button');

startQuizButton.addEventListener('click', async function () {
    questions = await getQuestions();
    if (questions.length > 0) {
        rulesSection.style.display = 'none';
        questionContainer.style.display = 'block';
        showQuestion(questions[currentQuestionIndex]);
    } else {
        questionElement.textContent = 'No questions found.';
    }
});

// Timer functions
function startTimer() {
    let timeLeft = QUESTION_TIMEOUT;
    timerInterval = setInterval(() => {
        timerElement.textContent = `Time left: ${timeLeft} seconds`;
        timeLeft--;

        if (timeLeft < 0) {
            handleAnswerClick(false); // Move to the next question as time is up
        }
    }, 1000);
}
