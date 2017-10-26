/*global
  cellStatus
  clickResult
  icons
  iconNone
*/

function main() { //eslint-disable-line no-unused-vars
  const app = new App();
  app.setInitialLayout();
  if (app.isAppScreen()) {
    app.buildTable();
    app.startGame();
  }
}

/**
 * const App - application controller
 *
 * @return {function}  the instance of the class
 */
const App = function() {
  /**
   * the url parsing function is provided by github library websanova/js-url
   */
  this.dimension = $.url('?size');
  this.table = new Table(this.dimension);
  this.timer = new Timer();
  this.moves = new Moves();
  this.stars = new Stars();
  this.mistakes = 0;
  $('.reset-click').on('click', { //handle a click on Reset button
    context: this
  }, this.clickResetHandler);
  $('.return-click').click(this.clickReturnHandler); //handle a click on Return button

};

/**
 * startGame - the beginning of the game including time shift needed to take in the picture
 *
 */
App.prototype.startGame = function() {
  $('#timer').on('timeUp',
    () => {
      $('table').on('mousedown', 'td', {context: this}, this.cellClickHandler);
      this.table.closeAll();
    });

  this.timer.start(Math.floor(this.dimension / 2));
};

/**
 * endGame - the game is finished, show the results
 *
 */
App.prototype.endGame = function() {
  this.timer.stop();
  //TODO When 1 star is earned put in the congratulations text 'star' instead of 'stars'
  $('#stars-earned').text(this.stars.number);
  $('#game-time').text(this.timer.shownTime);
  $('#move-count').text(this.moves.number);
  $('.modal').modal({
    keyboard: true,
    show: true
  });
};

/**
 * setInitialLayout - diffirentiate the layout depending on whether the screen was reset
 *
 */
App.prototype.setInitialLayout = function() {
  if (this.isAppScreen()) { //launch the app
    $('#save-dimension').val(this.dimension);
    if ($('#app').hasClass('hidden')) { //show app if hidden
      $('#app').toggleClass('hidden');
    }
    if (!$('#entry-form').hasClass('hidden')) { //hide entry-form if visible
      $('#entry-form').toggleClass('hidden');
    }
  } else { //show the initial screen
    if (!(this.dimension === undefined)) {
      $('#dimension').val(this.dimension);
    }
    if (!$('#app').hasClass('hidden')) { //hide app if visible
      $('#app').toggleClass('hidden');
    }
    if ($('#entry-form').hasClass('hidden')) { //show entry-form if hidden
      $('#entry-form').toggleClass('hidden');
    }
  }
};

/**
 * isAppScreen - does the screen contains the application?
 *
 * @return {boolean}  true if the screen contains the application
 */
App.prototype.isAppScreen = function() {
  /**
   * the url parsing function is provided by github library websanova/js-url
   */
  return $.url('?do-reset') === 'X';
};

/**
 * buildTable - create the table
 *
 */
App.prototype.buildTable = function() {
  this.table.fillIconPool();
  this.table.fillWithCells();
};

/**
 * cellClick - what to do when a cell was clicked upon
 *
 * @param  {DOM object} target cell clicked upon
 */
App.prototype.cellClick = function(target) {
  /**
   * render a cell reaction to a click
   */
  const result = this.table.flipCell(target);
  /**
   *  count moves
   */
  if (result === clickResult.mismatched) {
    this.mistakes++;
  }
  if (result === clickResult.matched || result === clickResult.mismatched) {
    this.moves.increase();
  }
  /**
   * award stars
   */
  if ((this.timer.elapsedTime > Math.pow(this.dimension, 3) * 1000 ||
      this.mistakes > this.dimension) && this.stars.number === 3) {
    this.stars.decrease();
  } else if ((this.timer.elapsedTime > Math.pow(this.dimension, 3) * 2000 ||
      this.mistakes > this.dimension * 2) && this.stars.number === 2) {
    this.stars.decrease();
  } else if ((this.timer.elapsedTime > Math.pow(this.dimension, 3) * 3000 ||
      this.mistakes > this.dimension * 3) && this.stars.number === 1) {
    this.stars.decrease();
  }
  /**
   * finish the game
   */
  if (!this.table.cells.find(cell => cell.status === cellStatus.closed || cell.status === cellStatus.questioned)) {
    this.endGame();
  }
};

/**
 * function - the event handler is needed to pass click target object (this)
 *
 * @param  {Event} event the instsance of the event
 */
App.prototype.cellClickHandler = function (event) {
  event.data.context.cellClick(this);
};
/**
 * clickResetHandler - button Reset click event handler
 *
 * @param  {Event} event event object passed
 */
App.prototype.clickResetHandler = function(event) {
  $('#dimension').val(event.data.context.dimension);
  $('#entry-form').submit();
};

/**
 * clickReturnHandler - button Return click event handler
 *
 * @return {type}  description
 */
App.prototype.clickReturnHandler = function() {
  $('#restart-form').submit();
};

/**
 * const Table - class managing the table
 *
 * @param  {int} size dimension of the table
 * @return {Table}    the instance of the class
 */
const Table = function(size) {
  this.size = size;
  this.cells = [];
  this.iconPool = [];
  this.iconCounter = 0; //a technical attribute for the access to the mebers of the cells array
};

/**
 * fillIconPool - fill the array with icons to show inside cells
 *
 */
Table.prototype.fillIconPool = function() {
  const iconNum = Math.floor(Math.pow(this.size, 2) / 2); //number of needed icons
  const iconsArranged = []; //the content of the icon array arranged randomly

  icons.forEach(function(icon) {
    iconsArranged.push({
      order: Math.random(),
      icon
    });
  });
  iconsArranged.sort((a, b) => a.order - b.order); //jumble the global list of icons

  for (let i = 0; i < iconNum; i++) {
    for (let c = 0; c < 2; c++) { //duplicate the icon
      this.iconPool.push({
        order: Math.random(),
        icon: iconsArranged[i].icon
      });
    }
  }
  this.iconPool.sort((a, b) => a.order - b.order);  //jumble the list for the table
  if (this.size % 2 !== 0) {
    this.iconPool.splice(Math.floor(Math.pow(this.size, 2) / 2), 0, {
      order: null,
      icon: iconNone
    });
  }
};

/**
 * addCell - create a cell of the table
 *
 * @param  {jQuery} parent the parent of the created cell
 * @param  {int} x      x-coordinate of the created cell
 * @param  {int} y      y-coordinate of the created cell
 */
Table.prototype.addCell = function(parent, x, y) {
  let icon;
  //if the number of cells is odd, put the 'dead' cell in the center
  icon = this.iconPool[this.iconCounter].icon;
  const cell = new Cell(x, y, icon, parent);
  this.cells.push(cell);
  this.iconCounter++;
};

/**
 * fillWithCells - fill the table with cells
 *
 */
Table.prototype.fillWithCells = function() {
  for (let y = 0; y < this.size; y++) {
    $('table').append('<tr>');
    for (let x = 0; x < this.size; x++) {
      this.addCell($('tr:last'), String(x), String(y));
    }
  }
  //to make sure cells are square even if resized in case the screen is too small
  const width = $('td').css('width');
  $('td').css('height', width);
  $('td').css('min-width', width);
};

/**
 * closeAll - close all the cells (hide the icons)
 *
 */
Table.prototype.closeAll = function() {
  this.cells.forEach(elem => elem.close());
};

/**
 * flipCell - revert the state of a cell
 *
 * @param  {DOM element} cell the click target
 * @return {Class}  const clickResult values
 */
Table.prototype.flipCell = function(cell) {
  const x = $(cell).attr('x');
  const y = $(cell).attr('y');
  //do noting if something is blinking
  if (this.cells.findIndex(elem => elem.status === cellStatus.blinking) >= 0) {
    return;
  }
  const foundCell = this.cells.find(elem => elem.x === x && elem.y === y);

  if (foundCell.status === cellStatus.closed) {
    const questionedCell = this.cells.find(function(elem) {
      return elem.status === cellStatus.questioned;
    });
    if (questionedCell === undefined) { //nothing to pair yet
      foundCell.open(cellStatus.questioned, cell);
      return clickResult.quest;
    } else if (foundCell.icon === questionedCell.icon) { //the paring cell matches
      foundCell.open(cellStatus.opened, cell);
      questionedCell.open(cellStatus.opened);
      return clickResult.matched;
    } else { //the attempt failed
      foundCell.open(cellStatus.blinking, cell);
      questionedCell.open(cellStatus.blinking);
      setTimeout(function() { //give a time to blink
        foundCell.close();
        questionedCell.close();
      }, 1000);
      return clickResult.mismatched;
    }
  } else {
    return clickResult.noEffect;
  }
};

/**
 * const Cell - class managing a cell
 *
 * @param  {int} x    x-coordinate
 * @param  {int} y    y-coordinate
 * @param  {string} icon icon
 * @return {type}     the instance of the class
 */
const Cell = function(x, y, icon, parent) {
  let cssClass = 'cust-cell-questioned';
  this.x = x;
  this.y = y;
  this.icon = icon;
  this.status = this.icon === iconNone ? cellStatus.locked : cellStatus.opened;
  if (this.status === cellStatus.locked) {
    cssClass = 'cust-cell-middle';
  }
  this.spanPattern =
    `<span class="glyphicon glyphicon-${this.icon}" aria-hidden="true"></span>`;
  parent.append(`<td x=${this.x} y=${this.y} class="${cssClass}">${this.spanPattern}</td>`);
};

/**
 * close - close the cell (hide an icon)
 *
 * @param  {DOM element} cell the click target
 * @param  {String} status const cellStatus values
 */
Cell.prototype.close = function(status, cell) {
  let lCell;

  if (this.status === cellStatus.locked) {
    return;
  }

  if (status === undefined) {
    this.status = cellStatus.closed;
  } else {
    this.status = status;
  }

  if (cell === undefined) {
    lCell = $(`td[x=${this.x}][y=${this.y}]`);
  } else {
    lCell = $(cell);
  }
  lCell.children('span').remove();
  lCell.removeClass();
  lCell.toggleClass('cust-cell-closed');
};

/**
 * open - open the cell (show an icon)
 *
 * @param  {DOM element} cell the click target
 */
Cell.prototype.open = function(status, cell) {
  let lCell;
  let statusBefore;

  if (this.status === cellStatus.locked || this.status === cellStatus.blinking) {
    return;
  }

  statusBefore = this.status;
  if (status === undefined) {
    this.status = cellStatus.opened;
  } else {
    this.status = status;
  }

  if (cell === undefined) {
    lCell = $(`td[x=${this.x}][y=${this.y}]`);
  } else {
    lCell = $(cell);
  }

  lCell.removeClass();
  if (statusBefore !== cellStatus.questioned) {
    lCell.append(this.spanPattern);
  }
  switch (this.status) {
    case cellStatus.opened:
      lCell.toggleClass('cust-cell-opened');
      break;
    case cellStatus.questioned:
      lCell.toggleClass('cust-cell-questioned');
      break;
    case cellStatus.blinking:
      lCell.toggleClass('cust-cell-questioned cust-cell-blink');
      break;
  }
};

/**
 * const Timer - the object responsible for timing
 *
 * @return {type}  description
 */
const Timer = function() {
  this.startTime;
  this.shiftTime;
  this.elapsedTime;
  this.interval;
  this.shownTime;
};

/**
 * start - start the timer
 *
 * @param  {Integer} shift time in seconds needed to take in the picture
 */
Timer.prototype.start = function(shift) {
  if (shift === undefined) {
    shift = 0;
  }
  const date = new Date();
  this.shiftTime = shift * 1000;
  this.startTime = date.getTime();
  this.showTime(-this.shiftTime);
  this.interval = setInterval(() => this.tickTock(), 1000);
};

/**
 * callback function called every second
 */
Timer.prototype.tickTock = function() {
  const date = new Date();
  this.elapsedTime = date.getTime() - this.startTime - this.shiftTime;
  this.elapsedTime = Math.round(this.elapsedTime / 1000) * 1000; //round the value to whole seconds
  this.showTime(this.elapsedTime);
  if (this.elapsedTime === 0) {
    $('#timer').trigger('timeUp'); //close all the cells and begin to respond to clicks
  }
};

/**
 * Show Time!
 */
Timer.prototype.showTime = function(time) {
  function addAZero(val) {
    return val < 10 ? '0' + val : val;
  }
  const sign = time < 0 ? '-' : '';
  time = Math.abs(time);
  let hours = Math.floor(time / (3600 * 1000));
  const minutes = Math.floor((time - hours * 3600 * 1000) / 60 / 1000);
  const seconds = Math.floor((time - hours * 3600 * 1000 - minutes * 60 * 1000) / 1000);

  this.shownTime = `${sign} ${addAZero(hours)} : ${addAZero(minutes)} : ${addAZero(seconds)}`;
  $('#timer').text(this.shownTime);
};

/**
 * stop - stop the timer
 *
 */
Timer.prototype.stop = function() {
  clearInterval(this.interval);
};

/**
 * const Moves - class counting moves
 *
 */
const Moves = function() {
  this.number = -1;
  this.text = 'Moves: ';
  this.increase(); //the call is needed to show an initial value
};

/**
 * increase - increase the value and update it on the screen
 *
 * @return {type}  description
 */
Moves.prototype.increase = function() {
  this.number++;
  $('#moves').text(this.text + this.number);
};

/**
 * const Stars - class rendering the stars
 *
 */
const Stars = function() {
  this.number = 3;
};

/**
 * decrease - the number of stars can only decrease
 *
 * @return {type}  description
 */
Stars.prototype.decrease = function() {
  if (this.number < 1) {
    return;
  }
  $(`#star${this.number}`).toggleClass('glyphicon-star'); //id of a star contains its number
  $(`#star${this.number}`).toggleClass('glyphicon-star-empty');
  this.number--;
};
