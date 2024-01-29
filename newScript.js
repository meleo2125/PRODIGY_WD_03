// Game Initialization Element
const header = document.querySelector("header");
const playerForm = document.querySelector(".player__form");
const overlayEl = document.querySelector(".overlay");

// Main Game Element
const gameContainerEl = document.querySelector(".game__container");
const playerTurnEl = document.querySelector(".player__turn");
const gameArenaEl = document.querySelector(".game__arena");

// Status Bar Element
const winningMarkEl = document.querySelector(".winning--mark__wrapper");
const winnerMessageEl = document.querySelector("#winner--message");
const roundTakerEl = document.querySelector("#round--taker__content");

// Button Element
const playButtonsEl = document.querySelector("#btn--play__wrapper");
const playerOptions = [...document.querySelectorAll("input[type='radio']")];
const gameTuts = document.querySelectorAll(".game--block");
const btnReplayEl = document.querySelector("#btn--replay");
const btnNextRoundEl = document.querySelector("#btn--nextRound");
const btnQuitEl = document.querySelector("#btn--quit");

class Player {
  #mark;
  #score = 0;

  _setMark(mark) {
    this.#mark = mark;
  }

  getMark() {
    return this.#mark;
  }

  _addScore() {
    this.#score++;
  }

  getScore() {
    return this.#score;
  }

  _resetScore() {
    this.#score = 0;
  }

  _placeMark(element) {
    // prettier-ignore
    if (!element.classList.contains("game--block")) return;

    const mark = `<img src="./assets/icon-${this.#mark}.svg" alt="${
      this.#mark
    }">`;

    element.insertAdjacentHTML("beforeend", mark);

    element.disabled = true;
  }
}

class Human extends Player {
  type = "player";
  alias = "you";
  #id = ++Human.counter % 2 !== 0 ? 1 : 2;

  static counter = 0;

  getID() {
    return this.#id;
  }
}

class Computer extends Player {
  type = "computer";
  alias = "cpu";

  static _generateRandIndex() {
    return Math.floor(Math.random() * gameTuts.length);
  }

  _initializeMove() {
    let move = gameTuts[Computer._generateRandIndex()];
    while (move.disabled === true) {
      move = gameTuts[Computer._generateRandIndex()];
    }

    setTimeout(() => {
      ticTacToe._progress(move);
    }, 200);
  }

  _applyLogic() {
    if (ticTacToe.currentPlayer === this) {
      if (ticTacToe.getClick() <= 1) this._initializeMove();
      else {
        let needDefense;
        for (const row in ticTacToe.gameMaps) {
          // Analysis Player Move (Defensive Mode)
          if (
            ticTacToe.gameMaps[row].length === 2 &&
            ticTacToe.gameMaps[row].indexOf(ticTacToe.mainPlayer.getMark()) !==
              ticTacToe.gameMaps[row].lastIndexOf(
                ticTacToe.mainPlayer.getMark()
              )
          ) {
            needDefense = true;
            const type = RegExp(/[a-z]+/, "g").exec(row)[0];
            const possibleBlock = [
              ...document.querySelectorAll(`button[data-${type}="${row}"]`),
            ].find(block => block.disabled === false);
            setTimeout(() => ticTacToe._progress(possibleBlock), 200);
            break;
          }
        }
        // Analysis Player Move (Offensive Mode)
        if (!needDefense) {
          let neutralMove;
          for (const row in ticTacToe.gameMaps) {
            if (
              ticTacToe.gameMaps[row].includes(this.getMark()) &&
              !ticTacToe.gameMaps[row].includes(ticTacToe.mainPlayer.getMark())
            ) {
              const type = RegExp(/[a-z]+/, "g").exec(row)[0];
              const possibleBlock = [
                ...document.querySelectorAll(`button[data-${type}="${row}"]`),
              ].find(block => block.disabled === false);
              setTimeout(() => ticTacToe._progress(possibleBlock), 200);
              neutralMove = false;
              break;
            } else {
              neutralMove = true;
            }
          }
          if (neutralMove) {
            setTimeout(
              () =>
                ticTacToe._progress(
                  [...gameTuts].find(block => block.disabled === false)
                ),
              200
            );
          }
        }
      }
    }
  }
}

/////////////////////////////////
// GAME ARCHITECTURE

class Game {
  #gameMaps = {
    row0: [],
    col0: [],
    row1: [],
    col1: [],
    row2: [],
    col2: [],
    slash: [],
    backslash: [],
  };
  #players = [];
  #currentPlayer;
  #winner;
  #tieBoard = document.querySelector("#board-tie").closest(".score--block");
  #tieScore = 0;
  #clicks = 0;

  constructor() {
    // Enable Game Tuts
    // prettier-ignore
    gameArenaEl.addEventListener("click", function (e) {
        const element = e.target;

        if (!e.target.classList.contains("btn")) return;

        this._progress(element);
        if (this.challenger.type === "computer") this.challenger._applyLogic();

      }.bind(this)
    );
    playButtonsEl.addEventListener("click", this._initiateGame.bind(this));
    btnReplayEl.addEventListener(
      "click",
      function (e) {
        this._replayGame();
        if (this.challenger.type === "computer") this.challenger._applyLogic();
      }.bind(this)
    );
    btnNextRoundEl.addEventListener(
      "click",
      function () {
        this._nextGame();
        if (this.challenger.type === "computer") this.challenger._applyLogic();
      }.bind(this)
    );
    btnQuitEl.addEventListener("click", this._quitGame.bind(this));
  }

  getClick() {
    return this.#clicks;
  }

  get gameMaps() {
    return this.#gameMaps;
  }

  get currentPlayer() {
    return this.#currentPlayer;
  }

  _displayGame() {
    header.classList.toggle("active");
    playerForm.classList.toggle("active");
    gameContainerEl.classList.toggle("active");
  }

  _progress(element) {
    // Click increase
    this.#clicks++;

    // Player place mark
    this.#currentPlayer._placeMark.call(this.#currentPlayer, element);

    // Organize Input
    this._organizeInput(element);

    // Check Game
    this._checkGame();

    if (this.#winner || (!this.#winner && this.#clicks === 9)) return;

    // Change Turn
    ticTacToe._changeTurn();
  }

  _assignMark(mainP, challengerP) {
    // Assign Mark to Each Player Object
    mainP._setMark(playerOptions.find(option => option.checked).value);
    challengerP._setMark(playerOptions.find(option => !option.checked).value);
  }

  _assignBoard(players) {
    const playerX = players.find(player => player.getMark() === "x");
    const playerO = players.find(player => player.getMark() === "o");
    playerX.board = document.querySelector("#board-x").closest(".score--block");
    playerO.board = document.querySelector("#board-o").closest(".score--block");

    if (
      players.every(player => player.type === "player")
    ) {
      playerX.board.querySelector("span").textContent += ` (${
        playerX.type[0]
      }${playerX.getID()})`;

      playerO.board.querySelector("span").textContent += ` (${
        playerO.type[0]
      }${playerO.getID()})`;
    }

    // prettier-ignore
    else {
      playerX.board.querySelector("span").textContent += ` (${playerX.alias})`;

      playerO.board.querySelector("span").textContent += ` (${playerO.alias})`;
    }
  }

  _determineInitiator() {
    this.#currentPlayer = this.#players.find(
      player => player.getMark() === "x"
    );

    playerTurnEl.style.backgroundImage = `url("./assets/icon-${this.#currentPlayer.getMark()}.svg")`;
  }

  _addPlayer(player) {
    this.#players.push(player);
  }

  _changeTurn() {
    this.#currentPlayer = this.#players.find(
      player => player !== this.#currentPlayer
    );

    playerTurnEl.style.backgroundImage = `url("./assets/icon-${this.#currentPlayer.getMark()}.svg")`;
  }

  _organizeInput(element) {
    const symbol = element.querySelector("img").alt;
    this.#gameMaps[element.dataset.row].push(symbol);
    this.#gameMaps[element.dataset.col].push(symbol);
    this.#gameMaps[element.dataset.slash] &&
      this.#gameMaps[element.dataset.slash].push(symbol);
    this.#gameMaps[element.dataset.backslash] &&
      this.#gameMaps[element.dataset.backslash].push(symbol);
  }

  _insertMarkImg(mark) {
    if (!mark) return;

    const markImg = `<img src="./assets/icon-${mark}.svg" alt="winning mark" />`;
    winningMarkEl.insertAdjacentHTML("afterbegin", markImg);
  }

  _deleteMarkImg() {
    const markImg = document.querySelector("img[alt='winning mark']");
    markImg && winningMarkEl.removeChild(markImg);
  }

  _renderStatusBar() {
    const winningMark = this.#winner?.getMark();

    // Insert Winning Mark Image to status bar
    this._insertMarkImg(winningMark);

    // Render Status Bar
    overlayEl.classList.add("active");

    if (winningMark) {
      if (this.challenger.type === "computer") {
        winnerMessageEl.textContent = `${this.#winner.alias} wins`;
      } else {
        winnerMessageEl.textContent = `${
          this.#winner.type
        } ${this.#winner.getID()} wins`;
      }
      roundTakerEl.textContent = "takes the round";
    } else {
      winnerMessageEl.textContent = "round tied";
      roundTakerEl.textContent = "";
    }
  }

  _updateScore(winner) {
    if (!winner) {
      this.#tieScore++;
      this.#tieBoard.querySelector("strong").textContent = `${this.#tieScore}`;
    } else {
      winner._addScore();
      winner.board.querySelector(
        "strong"
      ).textContent = `${this.#winner.getScore()}`;
    }
  }

  _checkGame() {
    for (const key in this.#gameMaps) {
      if (
        this.#gameMaps[key].length === 3 &&
        new Set(this.#gameMaps[key]).size === 1
      ) {
        // Set Winner
        this.#winner = this.#currentPlayer;
        break;
      }
    }

    if (this.#clicks < 9 && !this.#winner) return;

    // Render Status Bar
    // gameTuts.forEach(tut => (tut.disabled = true));
    this._clearMap();
    this._renderStatusBar();
    this._updateScore(this.#winner);
  }

  _clearGameBoard() {
    for (const tut of gameTuts) {
      const mark = tut.children[0];
      mark && tut.removeChild(mark);
      tut.disabled = false;
    }
  }

  _clearMap() {
    for (const coord in this.#gameMaps) {
      this.#gameMaps[coord] = [];
    }
  }

  _resetPlayer() {
    // Reset Player's Score Board
    this.#players.forEach(player => {
      player.board.querySelector(`#board-${player.getMark()}`).textContent =
        player.getMark();
      player.board.querySelector(`#score-${player.getMark()}`).textContent = 0;
    });

    // Reset Tie Board
    this.#tieScore = 0;
    this.#tieBoard.querySelector("#score-tie").textContent = 0;

    this.#players = [];
    this.#currentPlayer = null;

    delete this.mainPlayer;
    delete this.challenger;
  }

  _initiateGame(e) {
    if (!e.target.classList.contains("btn")) return;

    // Create Player Object
    this.mainPlayer = new Human();

    // If VS Player
    if (e.target.id === "other--player") {
      this.challenger = new Human();
    }

    // If VS Computer
    if (e.target.id === "cpu") {
      this.challenger = new Computer();
    }

    // Add Player into list
    this._addPlayer(this.mainPlayer);
    this._addPlayer(this.challenger);

    // Assign Mark
    this._assignMark(this.mainPlayer, this.challenger);

    // Determine First Player
    this._determineInitiator();

    // Initiate Computer's Logic (If Computer)
    this.challenger.type === "computer" && this.challenger._applyLogic();

    // Assign Player ID to Score Board
    this._assignBoard(this.#players);

    // Render Game Display
    this._displayGame();
  }

  _replayGame() {
    this.#winner = null;
    this.#clicks = 0;
    this._clearGameBoard();
    this._clearMap();
    this._determineInitiator();
    // if (this.challenger.type === "computer") this.challenger._applyLogic();
  }

  _nextGame() {
    this._replayGame();
    this._deleteMarkImg();
    overlayEl.classList.remove("active");
  }

  _quitGame() {
    overlayEl.classList.remove("active");
    this._displayGame();
    this._replayGame();
    this._deleteMarkImg();
    this._resetPlayer();
  }
}

const ticTacToe = new Game();
