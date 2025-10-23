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

const num1Display = document.getElementById('num1');
const num2Display = document.getElementById('num2');
const multipleChoiceContainer = document.getElementById('multipleChoiceContainer');
const feedbackModal = document.getElementById('feedbackModal');
const feedbackIcon = document.getElementById('feedbackIcon');
const feedbackMessage = document.getElementById('feedbackMessage');
const nextBtn = document.getElementById('nextBtn');
const levelUpModal = document.getElementById('levelUpModal');
const levelUpMessage = document.getElementById('levelUpMessage');
const continueBtn = document.getElementById('continueBtn');
const correctScoreEl = document.getElementById('correctScore');
const wrongScoreEl = document.getElementById('wrongScore');
const difficultyLevelEl = document.getElementById('difficultyLevel');


/* CARD IMAGE CONFIGURATION */

const cardImages = [
    'assets/images/card1.webp',
    'assets/images/card2.webp',
    'assets/images/card3.webp',
    'assets/images/card4.webp',
    'assets/images/card5.webp'
];


/* CARD DISPLAY FUNCTIONS */

function createCardDisplay(num) {
    const container = document.createElement('div');
    container.className = 'card-container';

    const card = document.createElement('img');
    card.src = cardImages[num - 1];
    card.alt = `card with ${num} eggs`;
    card.className = 'card-image';

    container.appendChild(card);

    return container;
}


/* DIFFICULTY SYSTEM */

function getDifficultySettings() {
    switch (difficultyLevel) {
        case 1:
            return {
                max1: 4, max2: 4, maxSum: 5
            };
        case 2:
            return {
                max1: 5, max2: 5, maxSum: 10
            };
    }
}

function checkLevelUp() {
    if (correctScore === LEVEL_UP_THRESHOLDS.level2 && difficultyLevel === 1) {
        difficultyLevel = 2;
        showLevelUpModal();
        return true;
    }

    updateDifficultyDisplay();
    return false;
}


function showLevelUpModal() {
    updateDifficultyDisplay();
    levelUpMessage.textContent = `Wow! Awesome work! You made it to level ${difficultyLevel}!`;
    levelUpModal.classList.add('show');
}


function hideLevelUpModal() {
    levelUpModal.classList.remove('show');
    generateQuestion();
}


function updateDifficultyDisplay() {
    if (difficultyLevelEl) {
        difficultyLevelEl.textContent = difficultyLevel;
    }
}


/* MULTIPLE CHOICE SYSTEM */


function generateMultipleChoiceOptions(correctAnswer) {
    const options = new Set();
    options.add(correctAnswer);

    const settings = getDifficultySettings();


    while (options.size < 2) {
        let wrongAnswer;


        const offset = Math.random() < 0.5 ? -1 : 1;
        const offsetAmount = Math.floor(Math.random() * 2) + 1;
        wrongAnswer = correctAnswer + (offset * offsetAmount);


        if (wrongAnswer >= 2 && wrongAnswer <= settings.maxSum && wrongAnswer !== correctAnswer) {
            options.add(wrongAnswer);
        }
    }


    const optionsArray = Array.from(options);
    for (let i = optionsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }

    return optionsArray;
}


function createMultipleChoiceButtons(options) {
    multipleChoiceContainer.innerHTML = '';


    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = option;

        button.addEventListener('click', () => checkMultipleChoiceAnswer(option));
        multipleChoiceContainer.appendChild(button);
    });
}

/* ANSWER CHECKING */


function checkMultipleChoiceAnswer(selectedAnswer) {
    if (selectedAnswer === currentAnswer) {

        correctScore++;
        correctScoreEl.textContent = correctScore;
        if (correctScore === 30) {
            showEndGameModal();
            return;
        }


        const leveledUp = checkLevelUp();


        if (!leveledUp) {
            showFeedback(true);
        }
    } else {

        wrongScore++;
        wrongScoreEl.textContent = wrongScore;
        showFeedback(false);
    }
}


/* QUESTION GENERATION */


function generateQuestion() {
    const settings = getDifficultySettings();


    currentNum1 = Math.floor(Math.random() * settings.max1) + 1;


    const maxNum2 = Math.min(settings.max2, settings.maxSum - currentNum1);
    currentNum2 = Math.floor(Math.random() * maxNum2) + 1;


    currentAnswer = currentNum1 + currentNum2;


    num1Display.innerHTML = '';
    num2Display.innerHTML = '';

    num1Display.appendChild(createCardDisplay(currentNum1));
    num2Display.appendChild(createCardDisplay(currentNum2));


    const options = generateMultipleChoiceOptions(currentAnswer);
    createMultipleChoiceButtons(options);
}


/* FEEDBACK SYSTEM */


function showFeedback(isCorrect) {
    if (isCorrect) {

        feedbackIcon.textContent = '👍';
        feedbackMessage.textContent = 'Good Job!';
        feedbackMessage.style.color = '#2D5016';
    } else {

        feedbackIcon.textContent = '❌';
        feedbackMessage.textContent = `Try again! ${currentAnswer}`;
        feedbackMessage.style.color = '#dc3545';
    }

    feedbackModal.classList.add('show');
}

function hideFeedback() {
    feedbackModal.classList.remove('show');
    generateQuestion();
}


/* EVENT LISTENERS */


nextBtn.addEventListener('click', hideFeedback);


continueBtn.addEventListener('click', hideLevelUpModal);


feedbackModal.addEventListener('click', (e) => {
    if (e.target === feedbackModal) {
        hideFeedback();
    }
});

levelUpModal.addEventListener('click', (e) => {
    if (e.target === levelUpModal) {
        hideLevelUpModal();
    }
});


/* GAME INITIALIZATION */

updateDifficultyDisplay();
generateQuestion();

/* END GAME FUNCTIONALITY */

function showEndGameModal() {
    const endGameModal = document.getElementById('endGameModal');
    const finalCorrect = document.getElementById('finalCorrect');
    const finalWrong = document.getElementById('finalWrong');
    const finalAccuracy = document.getElementById('finalAccuracy');


    const total = correctScore + wrongScore;
    const accuracy = total > 0 ? Math.round((correctScore / total) * 100) : 0;


    finalCorrect.textContent = correctScore;
    finalWrong.textContent = wrongScore;
    finalAccuracy.textContent = accuracy + '%';


    endGameModal.classList.add('show');

}

function resetGame() {
    correctScore = 0;
    wrongScore = 0;
    difficultyLevel = 1;

    correctScoreEl.textContent = correctScore;
    wrongScoreEl.textContent = wrongScore;
    updateDifficultyDisplay();

    const endGameModal = document.getElementById('endGameModal');
    endGameModal.classList.remove('show');

    generateQuestion();
}

const playAgainBtn = document.getElementById('playAgainBtn');

if (playAgainBtn) {
    playAgainBtn.addEventListener('click', resetGame);
}