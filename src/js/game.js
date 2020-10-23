function clamp(x, a, b) {
  return Math.min(Math.max(x, a), b);
}

// select n random elements from an array a
function sample(a, n) {
  let sel = [];
  for (let pool = new Set(a.keys()); n > 0 && pool.size; --n) {
    let i = [...pool][Math.floor(Math.random() * pool.size)];
    sel.push(a[i]);
    pool.delete(i);
  }
  return sel;
}


export default class Game {
  constructor(board, shape, rows, cols, bombs, time, outcome) {
    this.board = board;
    this.controls = {
      "shape": shape,
      "rows": rows,
      "cols": cols,
      "bombs": bombs,
      "time": time,
      "outcome": outcome,
    };

    this.state = Game.States.SETUP;
    this.setupControls();
    this.setupBoard();
  }

  static get States() {
    return {
      "SETUP": 1,
      "RUNNING": 2,
      "FINISHED": 3,
    };
  }

  static get Shapes() {
    return {
      "RECTANGLE": 1,
      "ELLIPSE": 2,
    }
  }

  get shape() {
    return this.controls.shape.value*1;
  }

  get rows() {
    return this.controls.rows.value*1;
  }

  get cols() {
    return this.controls.cols.value*1;
  }

  set outcome(outcome) {
    this.controls.outcome.innerText = outcome;
    this.controls.outcome.hidden = false;
  }

  // bind inputs to the game parameters
  setupControls() {
    ["shape", "rows", "cols", "bombs"].forEach((i) => {
      this.controls[i].addEventListener("change", this.setupBoard.bind(this));
    });
    this.controls.outcome.hidden = true;
  }

  start(row, col) {
    this.state = Game.States.RUNNING;
    this.setupBombs(row, col);
    this.disableControls();
    this.time = setInterval(() => {
      this.controls.time.innerText = this.controls.time.innerText*1 + 1
    }, 1000);
  }

  end(victory) {
    clearInterval(this.time);
    this.state = Game.States.FINISHED;
    this.revealBombs();
    this.outcome = victory ? "YOU WON" : "GAME OVER";
  }

  reset() {
    clearInterval(this.time);
    this.state = Game.States.SETUP;
    this.enableControls();
    this.controls.time.innerText = 0;
    this.controls.outcome.hidden = true;
    this.setupBoard();
  }

  disableControls() {
    for (let i in this.controls)
      this.controls[i].disabled = true;
  }

  enableControls() {
    for (let i in this.controls)
      this.controls[i].disabled = false;
  }

  clearBoard() {
    while (this.board.firstChild)
      this.board.firstChild.remove();
    this.cells = [];
    this.bombs = [];
  }

  setupBoard() {
    this.clearBoard();
    for (let row = 0; row < this.rows; ++row)
      for (let col = 0; col < this.cols; ++col)
        if (this.isInShape(row, col))
          this.board.appendChild(this.createCell(row, col));
  }

  setupBombs(row, col) {
    const cells = this.cells.flatMap((x, i) => x.filter((y, j) => i != row || j != col));
    const n = clamp((cells.length + 1) * this.controls.bombs.value*1 / 100, 1, cells.length);
    console.log(n);
    this.bombs = sample(cells, n);
  }

  createCell(row, col) {
    let cell = document.createElement("button");
    cell.classList.add("cell");
    cell.style.gridRow = row + 1;
    cell.style.gridColumn = col + 1;
//    cell.innerText = row + " " + col;
    cell.addEventListener("click", this.onCellClick.bind(this, row, col));
    cell.addEventListener("auxclick", this.onCellAuxClick.bind(this, row, col));
    cell.addEventListener("contextmenu", (e) => e.preventDefault());
    if (!this.cells[row])
      this.cells[row] = []
    this.cells[row][col] = cell;
    return cell;
  }

  countBombsNearby(row, col) {
    let n = 0;
    for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows - 1); ++i)
      for (let j = Math.max(col - 1, 0); j <= Math.min(col + 1, this.cols - 1); ++j)
        if (i != row || j != col)
          n += this.isInShape(i, j) && this.isBomb(i, j);
    return n;
  }

  isInShape(row, col) {
    if (row < 0 || row > this.rows - 1
        || col < 0 || col > this.cols - 1)
      return false;

    switch (this.shape) {
      // ellipse:   1=(x/a)^2+(y/b)^2
      // integral:  Y=a*b/2*[arcsin(x/a)+x/a*sqrt(1-(x/a)^2)]
      // if the ellipse covers at least part of the cell, the cell is included
      case Game.Shapes.ELLIPSE:
        // semi major axis
        const a = this.cols / 2;
        // semi minor axis
        const b = this.rows / 2;
        // map the cell's coordinates to the first quadrant.
        // also, cut off the cell from other quadrants.
        const cell = {
          left: Math.max(Math.abs(col + .5 - a) - .5, 0),
          right: Math.abs(col + .5 - a) + .5,
          bottom: Math.max(Math.abs(row + .5 - b) - .5, 0),
          top: Math.abs(row + .5 - b) + .5,
          get width() { return this.right - this.left; },
          get height() { return this.top - this.bottom; },
          get area() { return this.width * this.height; },
        };
        // only integrate the curve inside the cell
        const equ = (x, a, b) => b * Math.sqrt(1 - (x / a) ** 2);
        const bounds = {
          left: equ(cell.left, a, b) <= cell.top
            ? cell.left
            : Math.min(equ(cell.top, b, a), cell.right),
          right: equ(cell.right, a, b) >= cell.bottom
            ? cell.right
            : Math.max(equ(cell.bottom, b, a), cell.right),
          get width() { return this.right - this.left },
        };
        const f = (x) => a * b / 2 * (Math.asin(x / a) + x / a * Math.sqrt(1 - (x / a) ** 2));
        // calculate overlapping area:
        // 1. calculate the integral using the bounds above
        // 2. subtract the area inside the bounds below the cell
        // 3. add the cell's area on the left of the left bound
        let A = f(bounds.right) - f(bounds.left)
            - bounds.width * cell.bottom
            + (bounds.left - cell.left) * cell.height;
        // at least 50% of the cell has to be covered
        return A / cell.area >= .5;
      case Game.Shapes.RECTANGLE:
        break;
    }
    return true;
  }

  isBomb(row, col) {
    return this.bombs.includes(this.cells[row][col]);
  }

  onCellClick(row, col) {
    if (this.isMarked(row, col) || this.isRevealed(row, col)
        || this.state === Game.States.FINISHED)
      return;
    if (this.state === Game.States.SETUP)
      this.start(row, col);
    this.reveal(row, col);
    if (this.isBomb(row, col))
      this.end(false);
    else if (!this.isBorder(row, col))
      this.revealNearby(row, col);
    if (this.hasRevealedAll())
      this.end(true);
  }

  onCellAuxClick(row, col) {
    if (this.isRevealed(row, col)
        || this.state === Game.States.FINISHED)
      return;
    if (this.isMarked(row, col))
      this.unmark(row, col);
    else
      this.mark(row, col);
  }

  mark(row, col) {
    this.cells[row][col].classList.add("marked");
  }

  unmark(row, col) {
    this.cells[row][col].classList.remove("marked");
  }

  isMarked(row, col) {
    return this.cells[row][col].classList.contains("marked");
  }

  reveal(row, col) {
    if (this.isRevealed(row, col) || this.isMarked(row, col))
      return;

    this.cells[row][col].classList.add("revealed");
    if (this.isBomb(row, col))
      this.cells[row][col].classList.add("bomb");
    else
      this.cells[row][col].innerText = this.countBombsNearby(row, col) || "";
  }

  isRevealed(row, col) {
    return this.cells[row][col].classList.contains("revealed");
  }

  isBorder(row, col) {
    return this.cells[row][col].innerText != "";
  }

  revealNearby(row, col) {
    for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows - 1); ++i) {
      for (let j = Math.max(col - 1, 0); j <= Math.min(col + 1, this.cols - 1); ++j) {
        if ((i !== row || j !== col)
            && this.isInShape(i, j)
            && !this.isRevealed(i, j)
            && !this.isMarked(i, j)
            && !this.isBomb(i, j)) {
          this.reveal(i, j);
          if (!this.isBorder(i, j))
            this.revealNearby(i, j);
        }
      }
    }
  }

  revealBombs() {
    this.bombs.forEach((bomb) => bomb.classList.add("bomb"));
  }

  hasRevealedAll() {
    return this.cells
      .map((x, i) => x.filter(
        (y, j) => this.isInShape(i, j)
          && this.isRevealed(i, j)
          && !this.isBomb(i, j)).length)
      .reduce((a, b) => a + b) === this.cells.flat().length - this.bombs.length;
  }
}
