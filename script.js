//const wordList = ["hangman", "javascript", "programming", "openai", "challenge", "computer", "pranav", "crazy"];
//const targetWord = wordList[Math.floor(Math.random() * wordList.length)];
var targetWord = "hangman";
let attemptsLeft = 10; // Ten lives
let guessedWord = Array(targetWord.length).fill('_');

const hangmanSvg = document.getElementById('hangmanSvg');
const wordDisplay = document.getElementById('word-display');
const attemptCount = document.getElementById('attempt-count');
const guessInput = document.getElementById('guess');
const guessButton = document.getElementById('guess-button');
const result = document.getElementById('result');

// Initialize SVG container for hangman drawing
function initSvg() {
  hangmanSvg.setAttribute("viewBox", "0 0 200 200");
  hangmanSvg.setAttribute("width", "200px");
  hangmanSvg.setAttribute("height", "200px");
}

// SVG parts for the hangman
const svgParts = [
  { type: 'line', attrs: { x1: '50', y1: '180', x2: '150', y2: '180', stroke: 'black', 'stroke-width': 2 } }, // Base
  { type: 'line', attrs: { x1: '100', y1: '180', x2: '100', y2: '20', stroke: 'black', 'stroke-width': 2 } }, // Stand
  { type: 'line', attrs: { x1: '100', y1: '20', x2: '150', y2: '20', stroke: 'black', 'stroke-width': 2 } }, // Top
  { type: 'line', attrs: { x1: '150', y1: '20', x2: '150', y2: '50', stroke: 'black', 'stroke-width': 2 } }, // Noose
  { type: 'circle', attrs: { cx: '150', cy: '60', r: '10', stroke: 'black', 'stroke-width': 2, fill: 'none' } }, // Head
  { type: 'line', attrs: { x1: '150', y1: '70', x2: '150', y2: '120', stroke: 'black', 'stroke-width': 2 } }, // Body
  { type: 'line', attrs: { x1: '150', y1: '80', x2: '130', y2: '100', stroke: 'black', 'stroke-width': 2 } }, // Left Arm
  { type: 'line', attrs: { x1: '150', y1: '80', x2: '170', y2: '100', stroke: 'black', 'stroke-width': 2 } }, // Right Arm
  { type: 'line', attrs: { x1: '150', y1: '120', x2: '130', y2: '140', stroke: 'black', 'stroke-width': 2 } }, // Left Leg
  { type: 'line', attrs: { x1: '150', y1: '120', x2: '170', y2: '140', stroke: 'black', 'stroke-width': 2 } }  // Right Leg
];

function drawSvgPart(index) {
  if (index < svgParts.length) {
    const part = svgParts[index];
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', part.type);
    for (const attr in part.attrs) {
      svgElem.setAttribute(attr, part.attrs[attr]);
    }
    hangmanSvg.appendChild(svgElem);
  }
}

guessButton.addEventListener('click', () => {
  const guess = guessInput.value.toLowerCase();
  guessInput.value = ''; // Clear the input after each guess
  if (attemptsLeft <= 0 || !guess || !/[a-z]/.test(guess)) {
    result.textContent = "Please enter a valid letter or the game is over.";
    return;
  }

  if (targetWord.includes(guess)) {
    let correctGuess = false;
    targetWord.split('').forEach((char, index) => {
      if (char === guess && guessedWord[index] === '_') {
        guessedWord[index] = guess;
        correctGuess = true;
      }
    });
    wordDisplay.textContent = guessedWord.join(' ');
    if (!guessedWord.includes('_')) {
      result.textContent = `Congratulations! You've guessed the word "${targetWord}"!`;
      guessInput.disabled = true;
      guessButton.disabled = true;
    } else if (correctGuess) {
      result.textContent = "Good guess!";
    }
  } else {
    attemptsLeft--;
    drawSvgPart(10 - attemptsLeft - 1); // Adjusted for ten lives
    attemptCount.textContent = ` ${attemptsLeft}`;
    if (attemptsLeft <= 0) {
      result.textContent = `Game over! The word was "${targetWord}".`;
      guessInput.disabled = true;
      guessButton.disabled = true;
    } else {
      result.textContent = "Incorrect guess. Try again.";
    }
  }
});

async function initGame() {
   targetWord = await fetchRandomWord();
  guessedWord = Array(targetWord.length).fill('_');
  attemptsLeft = 10;
  hangmanSvg.innerHTML = ''; // Clear previous SVG drawings
  initSvg(); // Initialize SVG settings
  wordDisplay.textContent = guessedWord.join(' ');
  attemptCount.textContent = ` ${attemptsLeft}`;
  guessInput.disabled = false;
  guessButton.disabled = false;
  result.textContent = '';
  guessInput.value = ''; // Clear the guess input
}

async function fetchRandomWord() {
  try {
    const response = await fetch('https://random-word-api.herokuapp.com/word');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[0]; // The API returns an array of one word
  } catch (error) {
    console.error("Could not fetch a word: ", error);
    return "hangman"; // Fallback word in case of an error
  }
}

initGame(); // Setup the game

// When the document is fully loaded, initialize the game
document.addEventListener('DOMContentLoaded', () => {
    initGame(); // Setup the game with a fetched word
});

function activateGuessOnEnter() {
    guessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            // Prevent the default action to avoid submitting a form if the input is part of one
            event.preventDefault();
            // Trigger the guess button click
            guessButton.click();
        }
    });
}

activateGuessOnEnter();