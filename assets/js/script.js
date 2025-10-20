/* GAME STATE VARIABLES */

// Score tracking
let correctScore = 0;        // Number of correct answers
let wrongScore = 0;          // Number of wrong answers
let currentNum1 = 0;         // First number in the addition problem
let currentNum2 = 0;         // Second number in the addition problem
let currentAnswer = 0;       // The correct answer to the current question
let difficultyLevel = 1;     // Current difficulty level (1, 2, or 3)

const LEVEL_UP_THRESHOLDS = {
    level2: 15,  // Player reaches level 2 after 15 correct answers
};

/* DOM ELEMENT REFERENCES */

const num1Display = document.getElementById('num1');                    // First number display area
const num2Display = document.getElementById('num2');                    // Second number display area
const multipleChoiceContainer = document.getElementById('multipleChoiceContainer'); // Answer buttons container
const feedbackModal = document.getElementById('feedbackModal');         // Correct/Wrong popup
const feedbackIcon = document.getElementById('feedbackIcon');           // Emoji icon in feedback
const feedbackMessage = document.getElementById('feedbackMessage');     // Feedback text message
const nextBtn = document.getElementById('nextBtn');                     // Next Question button
const levelUpModal = document.getElementById('levelUpModal');           // Level up celebration popup
const levelUpMessage = document.getElementById('levelUpMessage');       // Level up message text
const continueBtn = document.getElementById('continueBtn');             // Continue button in level up modal
const correctScoreEl = document.getElementById('correctScore');         // Correct score display
const wrongScoreEl = document.getElementById('wrongScore');             // Wrong score display
const difficultyLevelEl = document.getElementById('difficultyLevel');   // Level display


/* CARD IMAGE CONFIGURATION */

const cardImages = [
    'assets/images/card1.webp',  // Index 0: 1 egg
    'assets/images/card2.webp',  // Index 1: 2 eggs
    'assets/images/card3.webp',  // Index 2: 3 eggs
    'assets/images/card4.webp',  // Index 3: 4 eggs
    'assets/images/card5.webp'   // Index 4: 5 eggs
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
    switch(difficultyLevel) {
        case 1:
            return { max1: 4, max2: 4, maxSum: 5 };
        case 2:
            return { max1: 5, max2: 5, maxSum: 10 };
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
    levelUpMessage.textContent = `Wow! You made it to Level 2—awesome work!` ${difficultyLevel}!`;
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
        feedbackMessage.style.color = '#6B9E3D';  
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