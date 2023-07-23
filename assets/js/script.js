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
    questionElement.innerHTML = decodeHtmlEntities(question.question);
    timerElement.innerHTML = `Time left: ${QUESTION_TIMEOUT} seconds`;

    // Clear previous answer options and hide the result element
    answerButtonsElement.innerHTML = '';
    resultElement.style.display = 'none';

    // Create and append answer options with radio buttons
    const answers = shuffle([...question.incorrect_answers, question.correct_answer]);

    answers.forEach((answer, index) => {
        const answerOption = document.createElement('div');
        answerOption.classList.add('answer-option');

        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'answer';
        radioButton.id = `answer-${index}`;
        radioButton.value = answer;
        answerOption.appendChild(radioButton);

        const label = document.createElement('label');
        label.setAttribute('for', `answer-${index}`);
        label.innerHTML = decodeHtmlEntities(answer);
        answerOption.appendChild(label);

        answerButtonsElement.appendChild(answerOption);
    });

    // Create the "Next Question" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next Question';
    nextButton.classList.add('next-btn');
    nextButton.addEventListener('click', handleNextQuestion);
    nextButton.disabled = true; // Disable the button initially
    answerButtonsElement.appendChild(nextButton);

    // Enable the "Next Question" button when an answer is selected
    const answerOptions = document.querySelectorAll('input[name="answer"]');
    answerOptions.forEach((option) => {
        option.addEventListener('change', () => {
            nextButton.disabled = false;
        });
    });

    // Start the timer for this question
    startTimer();
}

// Handle the "Next Question" button click
function handleNextQuestion() {
    // Clear the timer for the current question
    clearInterval(timerInterval);

    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        const isCorrect = selectedAnswer.value === questions[currentQuestionIndex].correct_answer;
        if (isCorrect) {
            score++;
        }
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
        } else {
            showResult();
        }
    }
}

// Handle answer button clicks
function handleAnswerClick() {
    // Do nothing, the "Next Question" button handles the action now
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
        timerElement.innerHTML = `Time left: ${timeLeft} seconds`;
        timeLeft--;

        if (timeLeft < 0) {
            handleNextQuestion(); // Move to the next question as time is up
        }
    }, 1000);
}

// Shuffle array function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to decode HTML entities (e.g., &amp;, &lt;, etc.)
function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}
