import Game from "./game.js"

function setupRange(range, min, max, value) {
  min.innerText = range.min;
  max.innerText = range.max;
  value.innerText = range.value;
  range.addEventListener("change", () => {
    value.innerText = range.value;
  });
}

let board = document.querySelector(".board");
let outcome = document.querySelector(".outcome");
let time = document.querySelector("#time");
let reset = document.querySelector("#reset");

let shape = document.querySelector("#shape");
let rows = document.querySelector("#rows");
setupRange(rows,
  document.querySelector("#rows-min"),
  document.querySelector("#rows-max"),
  document.querySelector("#rows-value"));
let cols = document.querySelector("#cols");
setupRange(cols,
  document.querySelector("#cols-min"),
  document.querySelector("#cols-max"),
  document.querySelector("#cols-value"));
let bombs = document.querySelector("#bombs");
setupRange(bombs,
  document.querySelector("#bombs-min"),
  document.querySelector("#bombs-max"),
  document.querySelector("#bombs-value"));

window.game = new Game(board, shape, rows, cols, bombs, time, outcome);
reset.addEventListener("click", window.game.reset.bind(window.game));
