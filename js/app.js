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
  }, this.clickReset);
  $('.return-click').click(this.clickReturn); //handle a click on Return button

};
$.extend(App.prototype, {

  /**
   * startGame - the beginning of the game including time shift needed to take in the picture
   *
   */
  startGame: function() {
    $('#timer').on('timeUp', { //pass the current instance to be able to work in a local context
      context: this
    }, this.gameTime);
    this.timer.start(Math.floor(this.dimension / 2));
  },

  /**
   * endGame - the game is finished, show the results
   *
   */
  endGame: function() {
    this.timer.stop();
    //TODO When 1 star is earned put in the congratulations text 'star' instead of 'stars'
    $('#stars-earned').text(this.stars.number);
    $('#game-time').text(this.timer.shownTime);
    $('#move-count').text(this.moves.number);
    $('.modal').modal({
      keyboard: true,
      show: true
    });
  },
  /**
   * gameTime - the event handler called when the time to take in the picture is over
   *
   * @param  {Event} event jQuery Event object
   */
  gameTime: function(event) {
    if (event.type !== 'timeUp') {
      return;
    }
    $('table').on('mousedown', 'td', { //pass the current instance to be able to work in a local context
      context: event.data.context
    }, event.data.context.cellClickHandler);

    event.data.context.table.closeAll();
  },

  /**
   * setInitialLayout - diffirentiate the layout depending on whether the screen was reset
   *
   */
  setInitialLayout: function() {
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
  },

  /**
   * isAppScreen - does the screen contains the application?
   *
   * @return {boolean}  true if the screen contains the application
   */
  isAppScreen: function() {
    /**
     * the url parsing function is provided by github library websanova/js-url
     */
    return $.url('?do-reset') === 'X';
  },

  /**
   * buildTable - create the table
   *
   */
  buildTable: function() {
    this.table.fillIconPool();
    this.table.fillWithCells();
  },

  /**
   * cellClickHandler - the handler of the cell click event
   *
   * @param  {Event} event the instance of the event
   */
  cellClickHandler: function(event) {
    event.data.context.cellClick(this);
  },

  /**
   * cellClick - what to do when a cell was clicked upon
   *
   * @param  {DOM object} target cell clicked upon
   */
  cellClick: function(target) {
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
    function findCell(cell) {
      return (cell.status === cellStatus.closed || cell.status === cellStatus.questioned);
    }
    if (!this.table.cells.find(findCell)) {
      this.endGame();
    }
  },

  /**
   * clickReset - button Reset click event handler
   *
   * @param  {Event} event event object passed
   */
  clickReset: function(event) {
    $('#dimension').val(event.data.context.dimension);
    $('#entry-form').submit();
  },

  /**
   * clickReturn - button Return click event handler
   *
   * @return {type}  description
   */
  clickReturn: function() {
    $('#restart-form').submit();
  }
});

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
$.extend(Table.prototype, {

  /**
   * fillIconPool - fill the array with icons to show inside cells
   *
   */
  fillIconPool: function() {
    const iconNum = Math.floor(Math.pow(this.size, 2) / 2); //number of needed icons
    const iconsArranged = []; //the content of the icon array arranged randomly

    icons.forEach(function(icon) {
      iconsArranged.push({
        order: Math.random(),
        icon
      });
    });
    iconsArranged.sort(function(a, b) { //jumble the global list of icons
      return a.order - b.order;
    });
    for (let i = 0; i < iconNum; i++) {
      for (let c = 0; c < 2; c++) { //duplicate the icon
        this.iconPool.push({
          order: Math.random(),
          icon: iconsArranged[i].icon
        });
      }
    }
    this.iconPool.sort(function(a, b) { //jumble the list for the table
      return a.order - b.order;
    });
    if (this.size % 2 !== 0) {
      this.iconPool.splice(Math.floor(Math.pow(this.size, 2) / 2), 0, {
        order: null,
        icon: iconNone
      });
    }
  },

  /**
   * addCell - create a cell of the table
   *
   * @param  {jQuery} parent the parent of the created cell
   * @param  {int} x      x-coordinate of the created cell
   * @param  {int} y      y-coordinate of the created cell
   */
  addCell: function(parent, x, y) {
    let icon;
    //if the number of cells is odd, put the 'dead' cell in the center
    icon = this.iconPool[this.iconCounter].icon;
    const cell = new Cell(x, y, icon, parent);
    this.cells.push(cell);
    this.iconCounter++;
  },

  /**
   * fillWithCells - fill the table with cells
   *
   */
  fillWithCells: function() {
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
  },

  /**
   * closeAll - close all the cells (hide the icons)
   *
   */
  closeAll: function() {
    this.cells.forEach(function(elem) {
      elem.close();
    });
  },

  /**
   * flipCell - revert the state of a cell
   *
   * @param  {DOM element} cell the click target
   * @return {Class}  const clickResult values
   */
  flipCell: function(cell) {
    //TODO When a candidate to match opens show the icons of both tiles whether they match or not
    // and then hide them if they mismatch
    // Currently if a checked tile mismatches a player cannot see its icon
    const x = $(cell).attr('x');
    const y = $(cell).attr('y');
    const foundCell = this.cells.find(function(elem) {
      return (elem.x === x && elem.y === y);
    });
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
        foundCell.hit(cell); //special method needed to imitate the button bouncing up
        questionedCell.close(cellStatus.closed);
        return clickResult.mismatched;
      }
    } else {
      return clickResult.noEffect;
    }
  }
});

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
$.extend(Cell.prototype, {

  /**
   * close - close the cell (hide an icon)
   *
   * @param  {DOM element} cell the click target
   * @param  {String} status const cellStatus values
   */
  close: function(status, cell) {
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
  },

  /**
   * open - open the cell (show an icon)
   *
   * @param  {DOM element} cell the click target
   */
  open: function(status, cell) {
    let lCell;
    let statusBefore;

    if (this.status === cellStatus.locked) {
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
    }
  },

  /**
   * hit - imitate pressing the button and it bouncing up
   *
   * @param  {DOM element} cell cell to process
   */
  hit: function(cell) {
    $(cell).removeClass();
    $(cell).toggleClass('cust-cell-hit');
    //use time delay insead of mouseup event in order to make it wokr on touch-screens
    // TODO consider using a transition delay via CSS insead of a timer delay
    setTimeout(function(context) {
      context.close();
    }, 200, this);
  },
});

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

$.extend(Timer.prototype, {

  /**
   * start - start the timer
   *
   * @param  {Integer} shift time in seconds needed to take in the picture
   */
  start: function(shift) {
    if (shift === undefined) {
      shift = 0;
    }
    const date = new Date();
    this.shiftTime = shift * 1000;
    this.startTime = date.getTime();
    this.showTime(-this.shiftTime);
    this.interval = setInterval(function(context) {
      context.tickTock();
    }, 1000, this); //pass the context to the time funtion parameter
  },

  /**
   * callback function called every second
   */
  tickTock: function() {
    const date = new Date();
    this.elapsedTime = date.getTime() - this.startTime - this.shiftTime;
    this.elapsedTime = Math.round(this.elapsedTime / 1000) * 1000; //round the value to whole seconds
    this.showTime(this.elapsedTime);
    if (this.elapsedTime === 0) {
      $('#timer').trigger('timeUp'); //close all the cells and begin to respond to clicks
    }
  },

  /**
   * Show Time!
   */
  showTime: function(time) {
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
  },

  /**
   * stop - stop the timer
   *
   */
  stop: function() {
    clearInterval(this.interval);
  }
});

/**
 * const Moves - class counting moves
 *
 */
const Moves = function() {
  this.number = -1;
  this.text = 'Moves: ';
  this.increase(); //the call is needed to show an initial value
};
$.extend(Moves.prototype, {

  /**
   * increase - increase the value and update it on the screen
   *
   * @return {type}  description
   */
  increase: function() {
    this.number++;
    $('#moves').text(this.text + this.number);
  }
});

/**
 * const Stars - class rendering the stars
 *
 */
const Stars = function() {
  this.number = 3;
};
$.extend(Stars.prototype, {

  /**
   * decrease - the number of stars can only decrease
   *
   * @return {type}  description
   */
  decrease: function() {
    if (this.number < 1) {
      return;
    }
    $(`#star${this.number}`).toggleClass('glyphicon-star'); //id of a star contains its number
    $(`#star${this.number}`).toggleClass('glyphicon-star-empty');
    this.number--;
  }
});
