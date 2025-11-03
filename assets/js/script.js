/* GAME STATE VARIABLES */

let correctScore = 0;
let wrongScore = 0;
let currentNum1 = 0;
let currentNum2 = 0;
let currentAnswer = 0;
let difficultyLevel = 1;

const LEVEL_UP_THRESHOLDS = {
    level2: 15,
};

/* DOM ELEMENT REFERENCES */

const num1Display = document.getElementById("num1");
const num2Display = document.getElementById("num2");
const multipleChoiceContainer = document.getElementById(
    "multipleChoiceContainer"
);
const feedbackModal = document.getElementById("feedbackModal");
const feedbackIcon = document.getElementById("feedbackIcon");
const feedbackMessage = document.getElementById("feedbackMessage");
const nextBtn = document.getElementById("nextBtn");
const levelUpModal = document.getElementById("levelUpModal");
const levelUpMessage = document.getElementById("levelUpMessage");
const continueBtn = document.getElementById("continueBtn");
const correctScoreEl = document.getElementById("correctScore");
const wrongScoreEl = document.getElementById("wrongScore");
const difficultyLevelEl = document.getElementById("difficultyLevel");
const playAgainBtn = document.getElementById("playAgainBtn");

/* EVENT LISTENERS */

// When "Next Question" button is clicked, hide feedback and show new question
nextBtn.addEventListener("click", hideFeedback);

// When "Continue Playing" button is clicked (in level up modal)
continueBtn.addEventListener("click", hideLevelUpModal);

// Allow clicking outside feedback modal to close it
feedbackModal.addEventListener("click", (e) => {
    if (e.target === feedbackModal) {
        hideFeedback();
    }
});

// Allow clicking outside level up modal to close it
levelUpModal.addEventListener("click", (e) => {
    if (e.target === levelUpModal) {
        hideLevelUpModal();
    }
});

// Add click event to Play Again button
if (playAgainBtn) {
    playAgainBtn.addEventListener("click", resetGame);
}

/* CARD IMAGE CONFIGURATION */

const cardImages = [
    "assets/images/card1.webp",
    "assets/images/card2.webp",
    "assets/images/card3.webp",
    "assets/images/card4.webp",
    "assets/images/card5.webp",
];

/* CARD DISPLAY FUNCTIONS */

/**
 * Creates and returns a card display element showing the specified number
 * @param {number} num - The number to display (1-5)
 * @returns {HTMLElement} - Container with the card image
 */
function createCardDisplay(num) {
    // Creates a container div for the card
    const container = document.createElement("div");
    container.className = "card-container";

    // Creates an image element for the eggs
    const card = document.createElement("img");
    card.src = cardImages[num - 1];
    card.alt = `card with ${num} eggs`;
    card.className = "card-image";

    // Adds the card to the container
    container.appendChild(card);

    return container;
}

/* DIFFICULTY SYSTEM */

/**
 * Returns the settings for the current difficulty level
 * Level 1: Easy (sums up to 5)
 * Level 2: Medium (sums up to 10)
 * @returns {object} - Settings object with max values for numbers
 */
function getDifficultySettings() {
    switch (difficultyLevel) {
        case 1:
            // Level 1: Numbers 1-4, sums up to 5
            return {
                max1: 4,
                    max2: 4,
                    maxSum: 5,
            };
        case 2:
            // Level 2: Numbers 1-5, sums up to 10
            return {
                max1: 5,
                    max2: 5,
                    maxSum: 10,
            };
    }
}

/**
 * Checks if the player has reached a level-up threshold
 * Updates the difficulty level and shows celebration if needed
 * @returns {boolean} - True if player leveled up, false otherwise
 */
function checkLevelUp() {
    // Check if player has reached level 2 threshold
    if (correctScore === LEVEL_UP_THRESHOLDS.level2 && difficultyLevel === 1) {
        difficultyLevel = 2;
        showLevelUpModal();
        return true;
    }

    updateDifficultyDisplay();
    return false;
}

/**
 * Shows the level-up celebration modal
 */
function showLevelUpModal() {
    updateDifficultyDisplay();
    levelUpMessage.textContent = `Wow! Awesome work! You made it to level ${difficultyLevel}!`;
    levelUpModal.classList.add("show");
}

/**
 * Hides the level-up modal and generates a new question
 */
function hideLevelUpModal() {
    levelUpModal.classList.remove("show");
    generateQuestion();
}

/**
 * Updates the difficulty level display on the score board
 */
function updateDifficultyDisplay() {
    if (difficultyLevelEl) {
        difficultyLevelEl.textContent = difficultyLevel;
    }
}

/* MULTIPLE CHOICE SYSTEM */

/**
 * Generates 2 answer options: 1 correct and 1 wrong
 * The wrong answer is close to the correct answer for realistic choices
 * @param {number} correctAnswer - The correct answer
 * @returns {Array} - Array of 2 numbers (shuffled)
 */
function generateMultipleChoiceOptions(correctAnswer) {
    const options = new Set();
    options.add(correctAnswer);

    const settings = getDifficultySettings();

    // Generate 1 wrong answer (for 2 total options)
    while (options.size < 2) {
        let wrongAnswer;

        // Generate a wrong answer that's close to the correct answer
        const offset = Math.random() < 0.5 ? -1 : 1;
        const offsetAmount = Math.floor(Math.random() * 2) + 1;
        wrongAnswer = correctAnswer + offset * offsetAmount;

        // Make sure it's within valid range and different from correct answer
        if (
            wrongAnswer >= 2 &&
            wrongAnswer <= settings.maxSum &&
            wrongAnswer !== correctAnswer
        ) {
            options.add(wrongAnswer);
        }
    }

    // Convert Set to Array and shuffle
    const optionsArray = Array.from(options);
    for (let i = optionsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }

    return optionsArray;
}

/**
 * Creates clickable buttons for the multiple choice answers
 * @param {Array} options - Array of answer options
 */
function createMultipleChoiceButtons(options) {
    multipleChoiceContainer.innerHTML = "";

    options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "choice-btn";
        button.textContent = option;

        button.addEventListener("click", () => checkMultipleChoiceAnswer(option));
        multipleChoiceContainer.appendChild(button);
    });
}

/* ANSWER CHECKING */

/**
 * Checks if the selected answer is correct
 * Updates scores and shows appropriate feedback
 * @param {number} selectedAnswer - The answer the player chose
 */
function checkMultipleChoiceAnswer(selectedAnswer) {
    if (selectedAnswer === currentAnswer) {
        // Correct answer
        correctScore++;
        correctScoreEl.textContent = correctScore;

        // Checks if game is complete
        if (correctScore === 30) {
            showEndGameModal();
            return;
        }

        // Checks if player has leveled up
        const leveledUp = checkLevelUp();

        // Only shows normal scores if not leveling up
        if (!leveledUp) {
            showFeedback(true);
        }
    } else {
        // Wrong answer
        wrongScore++;
        wrongScoreEl.textContent = wrongScore;
        showFeedback(false);
    }
}

/* QUESTION GENERATION */

/**
 * Generates a new addition question based on current difficulty
 * Displays the cards and answer choices
 */
function generateQuestion() {
    const settings = getDifficultySettings();

    // Generate first number (1 to max1)
    currentNum1 = Math.floor(Math.random() * settings.max1) + 1;

    // Generate second number (1 to max2, ensuring sum doesn't exceed maxSum)
    const maxNum2 = Math.min(settings.max2, settings.maxSum - currentNum1);
    currentNum2 = Math.floor(Math.random() * maxNum2) + 1;

    // Calculate the correct answer
    currentAnswer = currentNum1 + currentNum2;

    // Clear previous question
    num1Display.innerHTML = "";
    num2Display.innerHTML = "";

    // Display the cards for both numbers
    num1Display.appendChild(createCardDisplay(currentNum1));
    num2Display.appendChild(createCardDisplay(currentNum2));

    // Generate and display answer choices (2 buttons)
    const options = generateMultipleChoiceOptions(currentAnswer);
    createMultipleChoiceButtons(options);
}

/* FEEDBACK SYSTEM */

/**
 * Shows feedback modal with appropriate message and icon
 * @param {boolean} isCorrect - True if answer was correct, false if wrong
 */
function showFeedback(isCorrect) {
    if (isCorrect) {
        // Show success message
        feedbackIcon.textContent = "👍";
        feedbackMessage.textContent = "Good Job!";
        feedbackMessage.style.color = "#2D5016";
    } else {
        // Show error message with correct answer
        feedbackIcon.textContent = "❌";
        feedbackMessage.textContent = `Try again! ${currentAnswer}`;
        feedbackMessage.style.color = "#dc3545";
    }

    feedbackModal.classList.add("show");
}

/**
 * Hides the feedback modal and generates next question
 */
function hideFeedback() {
    feedbackModal.classList.remove("show");
    generateQuestion();
}

/* END GAME FUNCTIONALITY */

/**
 * Shows the end game celebration modal
 * Displays final stats and achievement
 */
function showEndGameModal() {
    const endGameModal = document.getElementById("endGameModal");
    const finalCorrect = document.getElementById("finalCorrect");
    const finalWrong = document.getElementById("finalWrong");
    const finalAccuracy = document.getElementById("finalAccuracy");

    // Calculate accuracy percentage
    const total = correctScore + wrongScore;
    const accuracy = total > 0 ? Math.round((correctScore / total) * 100) : 0;

    // Update final stats
    finalCorrect.textContent = correctScore;
    finalWrong.textContent = wrongScore;
    finalAccuracy.textContent = accuracy + "%";

    endGameModal.classList.add("show");
}

/**
 * Resets the game to start over from Level 1
 */
function resetGame() {
    // Reset all scores
    correctScore = 0;
    wrongScore = 0;
    difficultyLevel = 1;

    // Update displays
    correctScoreEl.textContent = correctScore;
    wrongScoreEl.textContent = wrongScore;
    updateDifficultyDisplay();

    // Hide end game modal
    const endGameModal = document.getElementById("endGameModal");
    endGameModal.classList.remove("show");

    generateQuestion();
}
/* GAME INITIALIZATION */

// Initialize the game when the page loads

updateDifficultyDisplay();
generateQuestion();