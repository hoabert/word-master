const MAX_ATTEMPTS = 5;
const MAX_WORD_LENGTH = 5;
const letters = document.querySelectorAll('.letter');
const wordRows = document.querySelectorAll('.word-row');
let guess = '';
let secretWord = 'hello';
let guessedLetters;
console.log(guessedLetters);

let matchedLetters = 0;
let attempt = 0;
let currentLetter = 0;
let gameOver = false;

function init() {
    getWordOfTheDay();

    document.addEventListener('keydown', function handleKeyPress(e) {
        if (gameOver) {
            return;
        }

        if (!isALetter(e.key)) {
            e.preventDefault();

            if (e.key === 'Enter') {
                console.log('Enter pressed');
                submitWord();
            } else if (e.key === 'Backspace') {
                console.log('Backspace pressed');
                toggleRedBackground(false);
                backspace();
            }

            return;
        }

        if (guess.length < MAX_WORD_LENGTH) {
            displayLetter(e.key);
            guess += e.key;

            console.log(guess);
        }
    });
}

async function getWordOfTheDay() {
    const response = await fetch('https://words.dev-apis.com/word-of-the-day');
    const json = await response.json();

    console.log(json);

    secretWord = json.word;
    guessedLetters = secretWord.split('');
    console.log(secretWord);
}

async function isValidWord(stringWord) {
    const response = await fetch('https://words.dev-apis.com/validate-word', {
        method: 'POST',
        body: JSON.stringify({ word: stringWord }),
    });

    const resObject = await response.json();
    const { validWord } = resObject;
    return validWord;
}

async function submitWord() {
    if (guess.length < MAX_WORD_LENGTH) {
        // word is too short
        console.log('Word is too short');
        toggleRedBackground(true);

        return;
    }

    const isWordValid = await isValidWord(guess);

    if (!isWordValid) {
        // word is invalid
        console.log('Word is invalid');
        toggleRedBackground(true);

        return;
    }

    colorLetters();
    const isAMatch = checkWordMatch();

    if (isAMatch) {
        console.log('You win!');
    } else {
        resetGuesses();
    }
}

function backspace() {
    if (guess.length > 0) {
        guess = guess.slice(0, guess.length - 1);
        displayLetter('');
    }
}

function isALetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}

function displayLetter(letter) {
    letters[guess.length + attempt * 5].textContent = letter;
}

function checkWordMatch() {
    console.log('Checking word match...');
    if (guess === secretWord) {
        return true;
    }
}

function colorLetters() {
    for (let i = 0; i < 5; i++) {
        const classToAdd = checkLetterColor(i);

        letters[i + attempt * 5].classList.add(classToAdd);
    }

    checkWin();
}

function checkLetterColor(index) {
    if (guess[index] === secretWord[index]) {
        removeLetter(isLetterInWord(guess[index]));
        matchedLetters += 1;
        return 'correct-letter';
    } else if (isLetterInWord(guess[index]) !== -1) {
        removeLetter(isLetterInWord(guess[index]));
        return 'letter-is-in-word';
    } else {
        console.log('Incorrect!');
        return 'incorrect-letter';
    }
}

function isLetterInWord(letter) {
    const letterIndex = guessedLetters.findIndex(
        (wordLetters) => wordLetters === letter
    );

    return letterIndex;
}

function removeLetter(index) {
    guessedLetters.splice(index, 1);
}

function checkWin() {
    if (matchedLetters === MAX_WORD_LENGTH) {
        console.log('You win!');
        gameOver = true;
    }
}

function toggleRedBackground(isRed) {
    for (let i = 0; i < 5; i++) {
        letters[i + attempt * MAX_WORD_LENGTH].classList.toggle(
            'invalid-word',
            isRed
        );
    }
}

function resetGuesses() {
    guessedLetters = secretWord.split('');
    matchedLetters = 0;
    currentLetter = 0;
    guess = '';

    attempt += 1;
}

init();
