/**
 * Generic 2D grid for grid-based visual algorithms
 * @author Roberto Ranon (@robertoranon)
 * @param {Number} width - width of the grid (in your own choice of units)
 * @param {Number} height - height of the grid  (in your own choice of units)
 * @param {*} [initialValue = 0] - initial value of each cell
 * @param {Number} [cellWidth = 1] - width of a cell (in your own choice of units)
 * @param {Number} [cellHeight = 1] - height of a cell (in your own choice of units)
 * @param {Number} [left = 0] - x coordinate of left side  (in your own choice of units)
 * @param {Number} [top = 0] - y coordinate of top side (in your own choice of units)
 */
export class Grid2D {
  constructor(
    width,
    height,
    initialValue = 0,
    cellWidth = 1,
    cellHeight = 1,
    left = 0,
    top = 0
  ) {
    this.left = left;
    this.right = left + width;
    this.top = top;
    this.bottom = top + height;
    this.width = width;
    this.height = height;
    this.cellSize = [cellWidth, cellHeight];
    this.num_columns = Math.floor(width / cellWidth);
    this.num_rows = Math.floor(height / cellHeight);

    this.data = [];

    // grid is stored by rows
    for (let r = 0; r < this.num_rows; r++) {
      const row = [];
      this.data.push(row);
      for (let c = 0; c < this.num_columns; c++) {
        row.push(this.deepCopy(initialValue));
      }
    }
  }

  /**
   * gets value of the grid at cell, returns undefined if outside of grid limits
   * @param {Number} row
   * @param {Number} col
   * @return {*}
   */
  getValue(row, col) {
    if (this.cellExists(row, col)) {
      return this.data[row][col];
    }
    return undefined;
  }

  /**
   * sets value of the cell, if the cell exists in the grid
   * @param {Number} row
   * @param {Number} col
   * @param {*} value
   */
  setValue(row, col, value) {
    if (this.cellExists(row, col)) {
      this.data[row][col] = value;
    }
  }

  /**
   * value of the grid at point, undefined if point outside of grid
   * @param {Number} x
   * @param {Number} y
   * @return {*}
   */
  getValueAtPoint(x, y) {
    const cell = this.getCellAtPoint(x, y);
    if (this.cellExists(cell[0], cell[1])) {
      return this.getValue(cell[0], cell[1]);
    }
    return undefined;
  }

  /**
   * gets the cell at the provided point, does not check for limits
   * @param {Number} x
   * @param {Number} y
   * @returns {Number[]} -
   */
  getCellAtPoint(x, y) {
    const column_index = Math.floor((x - this.left) / this.cellSize[0]);
    const row_index = Math.floor((y - this.top) / this.cellSize[1]);
    return [row_index, column_index];
  }

  /**
   * center of a cell, does not check for limits
   * @param {Number} row
   * @param {Number} col
   */
  getCellCenter(row, col) {
    return [
      this.left + col * this.cellSize[0] + this.cellSize[0] / 2,
      this.top + row * this.cellSize[1] + this.cellSize[1] / 2,
    ];
  }

  /**
   * Gets a point inside cell (row, col), displaced w_disp * cell_width and h_disp * cell_height from the cell top left corner
   * @param {*} row
   * @param {*} col
   * @param {*} w_disp
   * @param {*} h_disp
   */
  getCellPoint(row, col, w_disp, h_disp) {
    const cellCenter = this.getCellCenter(row, col);
    const displacement = [
      (w_disp - 0.5) * this.cellSize[0],
      (h_disp - 0.5) * this.cellSize[1],
    ];
    return [cellCenter[0] + displacement[0], cellCenter[1] + displacement[1]];
  }

  /**
   * fills the grid using a function(row, column) that returns the value
   * @param {Function} Fn
   */
  fill(Fn) {
    for (let r = 0; r < this.num_rows; r++) {
      for (let c = 0; c < this.num_columns; c++) {
        this.data[r][c] = Fn(r, c);
      }
    }
  }

  /**
   * Returns true if the provided condition is true for every neighbour cell, using
   * provided distance in number of cells
   * @param {*} col
   * @param {*} row
   * @param {*} distance
   * @param {*} condition
   * @returns
   */
  trueForEveryNeighbor(row, col, distance, condition) {
    if (distance <= 0) {
      return true;
    }

    const startColumn = col - distance > 0 ? col - distance : 0;
    const startRow = row - distance > 0 ? row - distance : 0;
    const endColumn =
      col + distance >= this.num_columns
        ? this.num_columns - 1
        : col + distance;
    const endRow =
      row + distance >= this.num_rows ? this.num_rows - 1 : row + distance;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startColumn; c <= endColumn; c++) {
        if (!condition(this.data[r][c])) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Returns true if the provided condition is true for at least one neighbour cell, using
   * provided distance in number of cells
   * @param {*} col
   * @param {*} row
   * @param {*} distance
   * @param {*} condition
   * @returns
   */
  trueForAtLeastOneNeighbor(row, col, distance, condition) {
    if (distance <= 0) {
      return true;
    }

    const startColumn = col - distance > 0 ? col - distance : 0;
    const startRow = row - distance > 0 ? row - distance : 0;
    const endColumn =
      col + distance > this.num_columns ? this.num_columns : col + distance;
    const endRow =
      row + distance > this.num_rows ? this.num_rows : row + distance;
    for (let r = startRow; r < endRow; r++) {
      for (let c = startColumn; c < endColumn; c++) {
        if (condition(this.data[r][c])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * applies function Fn(column, row, value) to each cell of the grid
   * @param {*} Fn
   */
  foreachCell(Fn) {
    for (let r = 0; r < this.num_rows; r++) {
      for (let c = 0; c < this.num_columns; c++) {
        Fn(r, c, this.data[r][c]);
      }
    }
  }

  /**
   * returns the first cell indices for which condition(row, column) is true
   * @param {*} condition
   * @returns
   */
  findFirstCell(startRow, startColumn, condition) {
    for (let r = startRow; r < this.num_rows; r++) {
      for (let c = startColumn; c < this.num_columns; c++) {
        if (condition(r, c)) {
          return [r, c];
        }
      }
    }
    return undefined;
  }

  /**
   * returns true if the requested cell exists, false otherwise
   * @param {*} row
   * @param {*} col
   */
  cellExists(row, col) {
    return (
      row >= 0 && row < this.num_rows && col >= 0 && col < this.num_columns
    );
  }

  /**
   * Convolution of cell with 3x3 matrix (as array of 9 numbers)
   * @param {*} row
   * @param {*} col
   * @param {*} weights
   * @param {*} Fn
   */
  laplace3x3(row, col, weights, Fn) {
    let sum = 0;
    let r, c;

    r =
      row === this.top
        ? this.top + 1
        : row === this.bottom - 1
        ? this.bottom - 2
        : row;
    c =
      col === this.left
        ? this.left + 1
        : col === this.right - 1
        ? this.right - 2
        : col;
    //console.log(row,col,r,c);
    sum += Fn(this.data[r - 1][c - 1]) * weights[0];
    sum += Fn(this.data[r - 1][c]) * weights[1];
    sum += Fn(this.data[r - 1][c + 1]) * weights[2];
    sum += Fn(this.data[r][c - 1]) * weights[3];
    sum += Fn(this.data[r][c]) * weights[4];
    sum += Fn(this.data[r][c + 1]) * weights[5];
    sum += Fn(this.data[r + 1][c - 1]) * weights[6];
    sum += Fn(this.data[r + 1][c]) * weights[7];
    sum += Fn(this.data[r + 1][c + 1]) * weights[8];
    //console.log(sum);
    return sum;
  }

  deepCopy(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.reduce((arr, item, i) => {
        arr[i] = deepCopy(item);
        return arr;
      }, []);
    }

    if (obj instanceof Object) {
      return Object.keys(obj).reduce((newObj, key) => {
        newObj[key] = deepCopy(obj[key]);
        return newObj;
      }, {});
    }
  }
}
