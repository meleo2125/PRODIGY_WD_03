const header = document.querySelector("header");
const overlayEl = document.querySelector(".overlay");
const playerForm = document.querySelector(".player__form");
const playButtonsEl = document.querySelector("#btn--play__wrapper");
const btnQuitEl = document.querySelector("#btn--quit");
const btnNextRoundEl = document.querySelector("#btn--nextRound");
const gameContainerEl = document.querySelector(".game__container");
const gameArenaEl = document.querySelector(".game__arena");
const playerTurnEl = document.querySelector(".player__turn");
let currentPlayer = "x";
const winnerMessageEl = document.querySelector("#winner--message");
const winningMarkWrapperEl = document.querySelector(".winning--mark__wrapper");
const roundTakerContentEl = document.querySelector("#round--taker__content");
const playerOptions = [...document.querySelectorAll("input[type='radio']")];
const gameBlocksEl = document.querySelectorAll(".game--block");
let winner;
const scoreBoardEl = document.querySelectorAll(".score--block > strong");
const btnReplayEl = document.querySelector("#btn--replay");
let clickedButtonCounter = 0;
let winningMark = "";
let tieScore = 0;
const boardTieEl = document.querySelector("#board-tie");
let vsPlayer = "";
let p1Board;
let challengerBoard;
class Player {
  constructor(name, alias) {
    this.name = name;
    this.alias = alias;
    this.score = 0;
    this.mark = "";
  }

  changeTurn() {
    gameArenaEl.classList.toggle("o");
    currentPlayer = gameArenaEl.classList[gameArenaEl.classList.length - 1];
    playerTurnEl.style.backgroundImage = `url("./assets/icon-${currentPlayer}.svg")`;
  }

  placeMark(element) {
    const mark = `<img src="./assets/icon-${currentPlayer}.svg" alt="${currentPlayer}">`;
    element.insertAdjacentHTML("beforeend", mark);

    element.disabled = true;

    clickedButtonCounter++;

    ticTacToe.inputOrganize(element);
    ticTacToe.gameCheck();
    this.changeTurn();
  }
}

class Computer extends Player {
  generateMove() {
    const randomIndex = function () {
      return Math.floor(Math.random() * gameBlocksEl.length);
    };
    let possibleBtn = gameBlocksEl[randomIndex()];
    while (possibleBtn.disabled === true) {
      possibleBtn = gameBlocksEl[randomIndex()];
    }

    setTimeout(() => this.placeMark(possibleBtn), 200);
  }

  analysisMove() {
    if (clickedButtonCounter <= 1) this.generateMove();
    else {
      let needDefense;
      for (const row in ticTacToe.gameMaps) {
        // Analysis Player Move (Defensive Mode)
        if (
          ticTacToe.gameMaps[row].length === 2 &&
          ticTacToe.gameMaps[row].indexOf(player1.mark) !==
            ticTacToe.gameMaps[row].lastIndexOf(player1.mark)
        ) {
          needDefense = true;
          const type = RegExp(/[a-z]+/, "g").exec(row)[0];
          const possibleBlock = [
            ...document.querySelectorAll(`button[data-${type}="${row}"]`),
          ].find(block => block.disabled === false);
          setTimeout(() => this.placeMark(possibleBlock), 200);
          break;
        }
      }
      // Analysis Player Move (Offensive Mode)
      if (!needDefense) {
        let neutralMove;
        for (const row in ticTacToe.gameMaps) {
          if (
            ticTacToe.gameMaps[row].includes(this.mark) &&
            !ticTacToe.gameMaps[row].includes(player1.mark)
          ) {
            const type = RegExp(/[a-z]+/, "g").exec(row)[0];
            const possibleBlock = [
              ...document.querySelectorAll(`button[data-${type}="${row}"]`),
            ].find(block => block.disabled === false);
            setTimeout(() => this.placeMark(possibleBlock), 200);
            neutralMove = false;
            break;
          } else {
            neutralMove = true;
          }
        }
        if (neutralMove) {
          setTimeout(
            () =>
              this.placeMark(
                [...gameBlocksEl].find(block => block.disabled === false)
              ),
            200
          );
        }
      }
    }
  }
}

const player1 = new Player("player 1", "p1");
const player2 = new Player("player 2", "p2");
const cpu = new Computer("computer", "cpu");

const players = [player1, player2, cpu];

// Game's World
const ticTacToe = {
  gameMaps: {
    row0: [],
    col0: [],
    row1: [],
    col1: [],
    row2: [],
    col2: [],
    slash: [],
    backslash: [],
  },

  displayGame(active = true) {
    if (active) {
      header.classList.add("active");
      playerForm.classList.remove("active");
      gameContainerEl.classList.add("active");
    } else {
      header.classList.remove("active");
      playerForm.classList.add("active");
      gameContainerEl.classList.remove("active");
    }
  },

  setDataPlayer() {
    player1.mark = playerOptions.find(option => option.checked).value;

    p1Board = document.querySelector(`#board-${player1.mark}`);

    if (vsPlayer) {
      player2.mark = playerOptions.find(option => !option.checked).value;
      challengerBoard = document.querySelector(`#board-${player2.mark}`);
      challengerBoard.textContent = `${player2.mark} (${player2.alias})`;
    } else {
      player1.alias = "you";
      cpu.mark = playerOptions.find(option => !option.checked).value;
      challengerBoard = document.querySelector(`#board-${cpu.mark}`);
      challengerBoard.textContent = `${cpu.mark} (${cpu.alias})`;
    }
    p1Board.textContent = `${player1.mark} (${player1.alias})`;
  },

  winningDisplay() {
    winningMark = document.createElement("img");
    winningMark.setAttribute("src", `./assets/icon-${winner.mark}.svg`);
    winningMark.setAttribute("alt", "winning mark");

    winningMarkWrapperEl.prepend(winningMark);
    winner.score += 1;
    document.querySelector(
      `#board-${winner.mark} + strong`
    ).textContent = `${winner.score}`;
    overlayEl.classList.add("active");
    winnerMessageEl.textContent = `${winner.name} wins!`;

    for (const row in this.gameMaps) this.gameMaps[row] = [];
  },

  tieDisplay() {
    overlayEl.classList.add("active");
    roundTakerContentEl.textContent = "";
    winnerMessageEl.textContent = "round tied!";
    tieScore++;
    boardTieEl.textContent = tieScore;

    for (const row in this.gameMaps) this.gameMaps[row] = [];
  },

  gameCheck() {
    for (const key in this.gameMaps) {
      if (
        this.gameMaps[key].length === 3 &&
        new Set(this.gameMaps[key]).size === 1
      ) {
        winner = players.find(
          player => player.mark === [...new Set(this.gameMaps[key])][0]
        );
        this.winningDisplay();
        break;
      }
    }
    if (clickedButtonCounter === 9 && !winner) this.tieDisplay();
  },

  inputOrganize(element) {
    const symbol = element.querySelector("img").alt;
    this.gameMaps[element.dataset.row].push(symbol);
    this.gameMaps[element.dataset.col].push(symbol);
    this.gameMaps[element.dataset.slash] &&
      this.gameMaps[element.dataset.slash].push(symbol);
    this.gameMaps[element.dataset.backslash] &&
      this.gameMaps[element.dataset.backslash].push(symbol);
  },

  resetGame() {
    winner = "";

    for (const el in this.gameMaps) {
      this.gameMaps[el] = [];
    }

    for (const block of gameBlocksEl) {
      const mark = block.children[0];
      mark && block.removeChild(mark);
      block.disabled = false;
    }

    currentPlayer = "x";
    playerTurnEl.style.backgroundImage = `url("./assets/icon-${currentPlayer}.svg")`;
    gameArenaEl.classList.contains("o") && gameArenaEl.classList.remove("o");

    clickedButtonCounter = 0;

    winningMark && winningMarkWrapperEl.removeChild(winningMark);
    winningMark = "";

    roundTakerContentEl.textContent = "takes the round!";

    if (clickedButtonCounter === 0 && cpu.mark === "x") {
      cpu.generateMove();
    }
  },

  quitGame() {
    this.displayGame(false);
    overlayEl.classList.remove("active");

    player1.alias = "p1";

    players.forEach(player => {
      player.score = 0;
      player.mark = "";
    });
    tieScore = 0;
    for (const board of scoreBoardEl) {
      board.textContent = "0";
    }

    vsPlayer = "";

    this.resetGame();
  },

  nextRound() {
    overlayEl.classList.remove("active");
    this.resetGame();
  },
};

// Functions

// Button Event Listener

playButtonsEl.addEventListener("click", function (e) {
  const element = e.target;

  if (element.classList.contains("btn") && element.id === "cpu") {
    vsPlayer = false;
    ticTacToe.displayGame();
    ticTacToe.setDataPlayer();

    // Determine First Player's Move
    if (clickedButtonCounter === 0 && cpu.mark === "x") {
      cpu.generateMove();
    }
  }

  if (element.classList.contains("btn") && element.id === "other--player") {
    vsPlayer = true;
    ticTacToe.displayGame();
    ticTacToe.setDataPlayer();
  }
});

gameArenaEl.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn")) {
    if (vsPlayer) {
      const firstPlayer = players.find(player => player.mark === "x");
      firstPlayer.placeMark(e.target);
    } else {
      player1.placeMark(e.target);
      clickedButtonCounter < 9 && cpu.analysisMove();
    }
  }
});

btnQuitEl.addEventListener("click", ticTacToe.quitGame.bind(ticTacToe));

btnReplayEl.addEventListener("click", ticTacToe.resetGame.bind(ticTacToe));

btnNextRoundEl.addEventListener("click", ticTacToe.nextRound.bind(ticTacToe));
