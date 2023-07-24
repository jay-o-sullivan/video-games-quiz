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
const usernameInput = document.getElementById('username');
const submitScoreButton = document.getElementById('submit-score');
const restartQuizButton = document.getElementById('restart-quiz-button');
const leaderboardButton = document.getElementById('leaderboard-button');


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
    } else {
        // If no answer is selected, end the quiz
        showResult();
        return;
    }

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

    const scoreElement = document.getElementById('score');
    const totalQuestionsElement = document.getElementById('totalQuestions');
    scoreElement.textContent = score;
    totalQuestionsElement.textContent = questions.length;
    resultElement.style.display = 'block';
    // Show the "Restart Quiz" and "Check Leaderboard" buttons
    restartQuizButton.style.display = 'block';
    leaderboardButton.style.display = 'block';
}

// Function to handle score submission
function submitScore() {
    const username = usernameInput.value.trim();
    if (username === '') {
        alert('Please enter your username to submit the score.');
        return;
    }

    const scoreData = {
        username: username,
        score: score,
    };

    // Retrieve the existing high scores from LocalStorage
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Add the current score to the list of high scores
    highScores.push(scoreData);

    // Sort the high scores in descending order based on the score
    highScores.sort((a, b) => b.score - a.score);

    // Keep only the top 10 high scores
    highScores = highScores.slice(0, 10);

    // Save the updated high scores back to LocalStorage
    localStorage.setItem('highScores', JSON.stringify(highScores));

    // Show an alert with the submitted username and score
    alert(`Score submitted!\nUsername: ${username}\nScore: ${score}/${questions.length}`);

    // Clear the input field
    usernameInput.value = '';

    // Hide the "Submit Score" button after submitting
    submitScoreButton.style.display = 'none';
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
    timerElement.innerHTML = `Time left: ${timeLeft} seconds`;
    timerInterval = setInterval(() => {
        timeLeft--;

        if (timeLeft >= 0) {
            timerElement.innerHTML = `Time left: ${timeLeft} seconds`;
        } else {
            clearInterval(timerInterval); // Stop the timer
            handleNextQuestion(); // Move to the next question as time is up and no answer is selected
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



submitScoreButton.addEventListener('click', submitScore);
// Add event listener for the "Restart Quiz" button
restartQuizButton.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    resultElement.style.display = 'none';
    startSection.style.display = 'block';
    questionContainer.style.display = 'none';
});

// Add event listener for the "Check Leaderboard" button
leaderboardButton.addEventListener('click', () => {
    // Retrieve the high scores from LocalStorage
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Show the leaderboard
    showLeaderboard(highScores);
});

// Function to show the leaderboard
function showLeaderboard(highScores) {
    // Display the leaderboard data as needed (e.g., create a new HTML element to show the leaderboard)
    // For now, let's just show an alert with the top 10 high scores
    let leaderboardMessage = 'Top 10 High Scores:\n\n';
    for (let i = 0; i < highScores.length; i++) {
        leaderboardMessage += `${i + 1}. ${highScores[i].username} - ${highScores[i].score}\n`;
    }
    alert(leaderboardMessage);
}
