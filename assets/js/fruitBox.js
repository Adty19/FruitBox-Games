const gameBoard = document.getElementById("gameBoard");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const combinationsDisplay = document.getElementById("combinations");
const mistakesDisplay = document.getElementById("mistakes");
const selectedDisplay = document.getElementById("selectedDisplay");
const totalSumDisplay = document.getElementById("totalSum");
const hintBtn = document.getElementById("hintBtn");
const hintText = document.getElementById("hintText");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const timeButtons = document.querySelectorAll(".time-btn");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreDisplay = document.getElementById("finalScore");
const finalCombinationsDisplay = document.getElementById("finalCombinations");
const finalMistakesDisplay = document.getElementById("finalMistakes");
const finalMultiCombinationsDisplay = document.getElementById(
  "finalMultiCombinations"
);
const iqLevelDisplay = document.getElementById("iqLevel");
const restartBtn = document.getElementById("restartBtn");

// Variable Games
let score = 0;
let combinations = 0;
let mistakes = 0;
let multiCombinations = 0;
let selectedNumbers = [];
let gameActive = false;
let timeLeft = 180;
let totalTime = 180;
let timer;
let fruits = [];
let hintsUsed = 0;
let isProcessingCombination = false;

// Icons
const fruitIcons = [
  "🍎",
  "🍌",
  "🍇",
  "🍓",
  "🍉",
  "🍑",
  "🍒",
  "🍋",
  "🥝",
  "🍊",
  "🍐",
  "🥭",
  "🍍",
  "🥥",
  "🫐",
  "🍈",
  "🍏",
  "🍅",
  "🥑",
  "🌶️",
  "🥦",
  "🥕",
  "🌽",
  "🥒",
  "🍄",
  "🥔",
  "🧅",
  "🧄",
  "🥬",
  "🌰",
];

// Function to generate random numbers 1-9 (without 0)
function getRandomNumber() {
  return Math.floor(Math.random() * 9) + 1; // 1-9
}

// Function to ensure there is at least one possible combination
function ensureCombinationExists(numbers) {
  // Check Combination 2 Numbers
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      if (numbers[i] + numbers[j] === 10) {
        return true;
      }
    }
  }

  // Check Combination 3 Numbers
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      for (let k = j + 1; k < numbers.length; k++) {
        if (numbers[i] + numbers[j] + numbers[k] === 10) {
          return true;
        }
      }
    }
  }

  return false;
}

// Function to ensure there are numbers that can be combined
function generateValidNumbers(count) {
  let numbers = [];
  let attempts = 0;
  const maxAttempts = 100;

  do {
    numbers = [];
    for (let i = 0; i < count; i++) {
      numbers.push(getRandomNumber());
    }
    attempts++;

    if (attempts > maxAttempts / 2) {
      const pair1 = Math.floor(Math.random() * 8) + 1;
      const pair2 = 10 - pair1;
      numbers[0] = pair1;
      numbers[1] = pair2;
    }
  } while (!ensureCombinationExists(numbers) && attempts < maxAttempts);

  return numbers;
}

// Function to initialize the game board
function initializeGameBoard() {
  gameBoard.innerHTML = "";
  fruits = [];
  selectedNumbers = [];
  updateSelectedDisplay();

  const numbers = generateValidNumbers(40);

  for (let i = 0; i < 40; i++) {
    const number = numbers[i];
    const fruitIcon = fruitIcons[Math.floor(Math.random() * fruitIcons.length)];

    fruits.push({
      id: i,
      number: number,
      icon: fruitIcon,
      selected: false,
      matched: false,
    });

    createFruitBox(i);
  }
}

// Function for making fruit boxes
function createFruitBox(id) {
  const fruit = fruits[id];
  const fruitBox = document.createElement("div");
  fruitBox.className = "fruit-box";
  fruitBox.dataset.id = id;
  fruitBox.innerHTML = `
                <div class="fruit-icon">${fruit.icon}</div>
                <div class="fruit-number">${fruit.number}</div>
            `;

  fruitBox.addEventListener("click", () => handleFruitClick(id));
  gameBoard.appendChild(fruitBox);
}

// Handler for click on fruit
function handleFruitClick(id) {
  if (!gameActive || isProcessingCombination) return;

  // Check if the Fruit is Matched
  if (fruits[id].matched) {
    return;
  }

  selectNumber(id);
}

// Function to select numbers
function selectNumber(id) {
  if (fruits[id].matched) {
    return;
  }

  // If a number has been selected, cancel the selection.
  if (fruits[id].selected) {
    fruits[id].selected = false;
    selectedNumbers = selectedNumbers.filter((numId) => numId !== id);
    updateFruitBoxDisplay(id);
    updateSelectedDisplay();
    return;
  }

  // Add numbers to the selected ones
  fruits[id].selected = true;
  selectedNumbers.push(id);

  // Update UI
  updateFruitBoxDisplay(id);
  updateSelectedDisplay();

  // Check if the total is 10 or more
  const currentSum = calculateSelectedSum();
  if (currentSum >= 10) {
    if (currentSum === 10) {
      setTimeout(() => confirmCombination(), 300);
    } else {
      setTimeout(() => handleWrongCombination(), 300);
    }
  }
}

// Function to calculate the total of selected numbers
function calculateSelectedSum() {
  return selectedNumbers.reduce((sum, id) => sum + fruits[id].number, 0);
}

// Function to confirm the combination
function confirmCombination() {
  if (isProcessingCombination || selectedNumbers.length < 2) return;

  isProcessingCombination = true;
  const sum = calculateSelectedSum();

  if (sum === 10) {
    const currentSelected = [...selectedNumbers];

    // Mark as matched
    currentSelected.forEach((id) => {
      fruits[id].matched = true;
    });

    // Count points
    const points = calculatePoints(currentSelected.length);
    score += points;
    combinations++;

    if (currentSelected.length >= 3) {
      multiCombinations++;
    }

    scoreDisplay.textContent = score;
    combinationsDisplay.textContent = combinations;

    // Update UI
    currentSelected.forEach((id) => {
      updateFruitBoxDisplay(id);
    });

    // Show feedback
    const combinationStr = currentSelected
      .map((id) => fruits[id].number)
      .join(" + ");
    hintText.innerHTML = `The combination works! ${combinationStr} = 10 (+${points} point)`;
    hintText.style.color = "#4CAF50";

    // Reset option
    currentSelected.forEach((id) => {
      fruits[id].selected = false;
    });
    selectedNumbers = [];
    updateSelectedDisplay();

    // Change numbers after delay
    setTimeout(() => {
      replaceMatchedNumbers(currentSelected);
      isProcessingCombination = false;
    }, 1000);
  } else {
    handleWrongCombination();
  }
}

// Function to handle wrong combination
function handleWrongCombination() {
  if (isProcessingCombination) return;

  isProcessingCombination = true;
  const currentSelected = [...selectedNumbers];

  // Mark as wrong
  currentSelected.forEach((id) => {
    const fruitBox = gameBoard.querySelector(`.fruit-box[data-id="${id}"]`);
    if (fruitBox) {
      fruitBox.classList.add("wrong");
    }
  });

  // Subtract points
  score = score - 10;
  mistakes++;
  scoreDisplay.textContent = score;
  mistakesDisplay.textContent = mistakes;

  // Show message
  const combinationStr = currentSelected
    .map((id) => fruits[id].number)
    .join(" + ");
  const sum = currentSelected.reduce(
    (total, id) => total + fruits[id].number,
    0
  );

  hintText.innerHTML = `Wrong combination! ${combinationStr} = ${sum} (-10 point)`;
  hintText.style.color = "#f44336";

  // Reset after delay
  setTimeout(() => {
    replaceMatchedNumbers(currentSelected);
    isProcessingCombination = false;
  }, 1000);
}

// Function for calculating points
function calculatePoints(numCount) {
  if (numCount === 2) return 10;
  if (numCount === 3) return 15;
  if (numCount === 4) return 20;
  if (numCount === 5) return 25;
  return 30;
}

// Function to replace the numbers that have been paired
function replaceMatchedNumbers(matchedIds) {
  // Update fruit data
  matchedIds.forEach((id) => {
    fruits[id].number = getRandomNumber();
    fruits[id].icon = fruitIcons[Math.floor(Math.random() * fruitIcons.length)];
    fruits[id].selected = false;
    fruits[id].matched = false;
  });

  // Update all element DOM
  setTimeout(() => {
    matchedIds.forEach((id) => {
      const fruitBox = gameBoard.querySelector(`.fruit-box[data-id="${id}"]`);
      if (fruitBox) {
        // Remove any classes that might obstruct clicks.
        fruitBox.className = "fruit-box";
        fruitBox.style.pointerEvents = "auto";
        fruitBox.style.cursor = "pointer";

        // Update Content
        const iconElement = fruitBox.querySelector(".fruit-icon");
        const numberElement = fruitBox.querySelector(".fruit-number");

        if (iconElement) {
          iconElement.textContent = fruits[id].icon;
        }

        if (numberElement) {
          numberElement.textContent = fruits[id].number;
        }

        // Reset event listener
        const newFruitBox = fruitBox.cloneNode(true);
        fruitBox.parentNode.replaceChild(newFruitBox, fruitBox);

        // Add event listener to new element
        newFruitBox.addEventListener("click", () => handleFruitClick(id));
      }
    });

    const currentNumbers = fruits.map((fruit) => fruit.number);
    if (!ensureCombinationExists(currentNumbers)) {
      fixNoCombinationSituation();
    }

    selectedNumbers = [];
    updateSelectedDisplay();
  }, 50);
}

// Function to fix the situation there is no combination
function fixNoCombinationSituation() {
  const pair1 = Math.floor(Math.random() * 8) + 1;
  const pair2 = 10 - pair1;

  fruits[0].number = pair1;
  fruits[1].number = pair2;

  updateFruitBoxDisplay(0);
  updateFruitBoxDisplay(1);
}

// Function to update the appearance of the fruit box
function updateFruitBoxDisplay(id) {
  const fruitBox = gameBoard.querySelector(`.fruit-box[data-id="${id}"]`);
  if (!fruitBox) return;

  const fruit = fruits[id];

  // Reset class
  fruitBox.className = "fruit-box";
  fruitBox.classList.remove("wrong");
  fruitBox.classList.remove("matched");

  if (fruit.selected) {
    fruitBox.classList.add("selected");
  }

  // Update Content
  const iconElement = fruitBox.querySelector(".fruit-icon");
  const numberElement = fruitBox.querySelector(".fruit-number");

  if (iconElement) {
    iconElement.textContent = fruit.icon;
  }

  if (numberElement) {
    numberElement.textContent = fruit.number;
  }

  fruitBox.style.pointerEvents = "auto";
  fruitBox.style.opacity = "1";

  // Reset event listener
  fruitBox.onclick = null;
  fruitBox.addEventListener("click", () => handleFruitClick(id));
}

// Function to update the display of the selected number
function updateSelectedDisplay() {
  const count = selectedNumbers.length;
  const sum = calculateSelectedSum();
  totalSumDisplay.textContent = `Total: ${sum}`;

  let displayHTML = "";
  selectedNumbers.forEach((id, index) => {
    const fruit = fruits[id];
    if (index > 0) displayHTML += '<div class="plus-sign">+</div>';
    displayHTML += `
                    <div class="selected-item">
                        <span class="fruit-icon">${fruit.icon}</span>
                        <span>${fruit.number}</span>
                    </div>
                `;
  });

  selectedDisplay.innerHTML = displayHTML;

  // Feedback color
  if (sum === 10) {
    totalSumDisplay.style.color = "#4CAF50";
    totalSumDisplay.style.borderColor = "#4CAF50";
  } else if (sum > 10) {
    totalSumDisplay.style.color = "#f44336";
    totalSumDisplay.style.borderColor = "#f44336";
  } else {
    totalSumDisplay.style.color = "#00dbde";
    totalSumDisplay.style.borderColor = "#00dbde";
  }
}

// Function to provide instructions
function giveHint() {
  if (!gameActive || hintsUsed >= 3 || isProcessingCombination) return;

  const availableNumbers = fruits
    .filter((fruit) => !fruit.matched && !fruit.selected)
    .map((fruit) => ({ id: fruit.id, number: fruit.number }));

  let hintCombination = findCombination(availableNumbers, 10, 2);
  if (!hintCombination) {
    hintCombination = findCombination(availableNumbers, 10, 3);
  }

  if (!hintCombination) {
    hintCombination = findCombination(availableNumbers, 10, 4);
  }

  if (hintCombination) {
    const combinationString = hintCombination
      .map((item) => item.number)
      .join(" + ");
    const count = hintCombination.length;

    hintText.innerHTML = `Hint: Try combination ${combinationString}`;
    hintText.style.color = "#4dffea";

    // Give the recommended fruit box a light effect
    hintCombination.forEach((item) => {
      const fruitBox = gameBoard.querySelector(
        `.fruit-box[data-id="${item.id}"]`
      );
      if (fruitBox) {
        fruitBox.classList.add("glow-effect");

        fruitBox.style.transform = "scale(1.05)";
        fruitBox.style.transition = "transform 0.3s ease";

        if (!fruitBox.dataset.hintId) {
          fruitBox.dataset.hintId = hintsUsed;
        }
      }
    });

    setTimeout(() => {
      hintCombination.forEach((item) => {
        const fruitBox = gameBoard.querySelector(
          `.fruit-box[data-id="${item.id}"]`
        );
        if (fruitBox) {
          fruitBox.classList.remove("glow-effect");
          fruitBox.style.transform = "scale(1)";
          fruitBox.style.boxShadow = "";
        }
      });

      hintText.style.textShadow = "";
      hintText.style.animation = "";
      hintText.innerHTML =
        'Click "Get Hint" for more help finding combinations';
      hintText.style.color = "#a9b7c6";
    }, 5000);

    hintsUsed++;
    hintBtn.textContent = `Hint (${3 - hintsUsed} available)`;

    hintBtn.style.background =
      "linear-gradient(135deg, #ff9800 0%, #ff5722 100%)";
    hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> HINTS USED (${hintsUsed}/3)`;

    setTimeout(() => {
      hintBtn.style.background =
        "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)";
      hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> GET HINTS (${
        3 - hintsUsed
      } left)`;
    }, 2000);

    if (hintsUsed >= 3) {
      hintBtn.disabled = true;
      hintBtn.style.background = "linear-gradient(135deg, #666 0%, #444 100%)";
      hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> NO HINTS LEFT';
    }
  } else {
    // If no combination is found
    hintText.innerHTML =
      "No combinations found! Try selecting different numbers.";
    hintText.style.color = "#ff9800";

    // Give effect to all selectable numbers
    const availableFruits = fruits.filter(
      (fruit) => !fruit.matched && !fruit.selected
    );
    availableFruits.forEach((fruit) => {
      const fruitBox = gameBoard.querySelector(
        `.fruit-box[data-id="${fruit.id}"]`
      );
      if (fruitBox) {
        fruitBox.classList.add("glow-effect-wrong");
        fruitBox.style.transform = "scale(1.02)";
      }
    });

    setTimeout(() => {
      availableFruits.forEach((fruit) => {
        const fruitBox = gameBoard.querySelector(
          `.fruit-box[data-id="${fruit.id}"]`
        );
        if (fruitBox) {
          fruitBox.classList.remove("glow-effect-wrong");
          fruitBox.style.transform = "scale(1)";
        }
      });

      hintText.innerHTML = 'Click "Get Hints" for help finding the combination';
      hintText.style.color = "#a9b7c6";
    }, 3000);
  }
}

// Function to display hints notification
function showHintNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `hint-notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-lightbulb"></i>
    <span>${message}</span>
  `;

  document.querySelector(".game-container").appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Function to search for combinations
function findCombination(numbers, target, maxLength) {
  // Cari mulai dari kombinasi terkecil (2 angka) sampai maxLength
  for (let length = 2; length <= maxLength; length++) {
    const combinations = getCombinations(numbers, length);

    // Try all combination
    for (let combo of combinations) {
      const sum = combo.reduce((s, item) => s + item.number, 0);
      if (sum === target) {
        // Prioritize combinations with numbers that have never been seen before
        return combo;
      }
    }
  }
  return null;
}

// Function to get all combinations
function getCombinations(arr, length) {
  const result = [];

  function combine(start, combo) {
    if (combo.length === length) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);
  return result;
}

// Function to start the game
function startGame() {
  if (gameActive) return;

  gameActive = true;
  startBtn.disabled = true;
  resetBtn.disabled = false;
  hintBtn.disabled = false;

  timeButtons.forEach((btn) => (btn.disabled = true));

  // Reset statistics
  score = 0;
  combinations = 0;
  mistakes = 0;
  multiCombinations = 0;
  hintsUsed = 0;
  isProcessingCombination = false;
  scoreDisplay.textContent = score;
  combinationsDisplay.textContent = combinations;
  mistakesDisplay.textContent = mistakes;

  hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> GET HINTS';
  hintText.innerHTML =
    'Click the "Get Hint" button for help finding the combination';
  hintText.style.color = "#a9b7c6";

  initializeGameBoard();
  startTimer();
}

// Function to start the timer
function startTimer() {
  clearInterval(timer);
  timeLeft = totalTime;
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Function to update the timer display
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  if (timeLeft <= 30) {
    timerDisplay.style.color = "#f44336";
    timerDisplay.style.animation =
      timeLeft <= 10 ? "pulse 0.5s infinite" : "none";
  } else {
    timerDisplay.style.color = "#00dbde";
    timerDisplay.style.animation = "none";
  }
}

/// Function to end the game
function endGame() {
  clearInterval(timer);
  gameActive = false;

  let iqLevel = "Beginner";

  // Logic Score
  if (score >= 230) iqLevel = "Genius";
  else if (score >= 180) iqLevel = "Expert";
  else if (score >= 140) iqLevel = "Intermediate";
  else if (score >= 80) iqLevel = "Beginner";
  else if (score >= 0) iqLevel = "Needs Practice";
  else if (score >= -50) iqLevel = "Needs More Practice";
  else iqLevel = "Keep Trying!";

  finalScoreDisplay.textContent = score;
  finalCombinationsDisplay.textContent = combinations;
  finalMistakesDisplay.textContent = mistakes;
  finalMultiCombinationsDisplay.textContent = multiCombinations;
  iqLevelDisplay.textContent = `Your Level: ${iqLevel}`;
  gameOverScreen.classList.add("active");
}

// Function to reset the game
function resetGame() {
  clearInterval(timer);
  gameActive = false;
  startBtn.disabled = false;
  resetBtn.disabled = true;
  hintBtn.disabled = true;

  timeButtons.forEach((btn) => (btn.disabled = false));

  timeLeft = totalTime;
  updateTimerDisplay();

  initializeGameBoard();
  updateSelectedDisplay();

  hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> GET HINTS';
  hintText.innerHTML =
    'Click the "Get Hint" button for help finding the combination';
  hintText.style.color = "#a9b7c6";

  gameOverScreen.classList.remove("active");
}

// Function to set game time
function setGameTime(minutes) {
  totalTime = minutes;
  timeLeft = minutes;
  updateTimerDisplay();

  timeButtons.forEach((btn) => {
    if (parseInt(btn.dataset.time) === minutes) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Event Listeners
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);
hintBtn.addEventListener("click", giveHint);

timeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!gameActive) {
      setGameTime(parseInt(btn.dataset.time));
    }
  });
});

gameOverScreen.addEventListener("click", (e) => {
  if (e.target === gameOverScreen) {
    gameOverScreen.classList.remove("active");
  }
});

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    gameActive &&
    selectedNumbers.length >= 2 &&
    !isProcessingCombination
  ) {
    confirmCombination();
  }

  if (e.key === "h" || e.key === "H") {
    if (gameActive && !hintBtn.disabled && !isProcessingCombination) {
      giveHint();
    }
  }

  if (e.key === "Escape" && gameActive && !isProcessingCombination) {
    selectedNumbers.forEach((id) => {
      fruits[id].selected = false;
      updateFruitBoxDisplay(id);
    });
    selectedNumbers = [];
    updateSelectedDisplay();
  }
});

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  initializeGameBoard();
  updateTimerDisplay();
});
