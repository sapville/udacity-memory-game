/*global
  cellStatus
  icons
  iconNone
*/
function main() { //eslint-disable-line no-unused-vars
  const app = new App();
  app.setInitialLayout();
  if (app.isAppScreen()) {
    app.buildTable();
  }
}

/**
 * const App - application controller
 *
 * @return {function}  the instance of the function
 */
const App = function() {
  this.dimension = $.url('?size');
  this.table = new Table(this.dimension);
};
$.extend(App.prototype, {
  /**
   * setInitialLayout - diffirentiate the layout depending on whether the screen was reset
   *
   * @return {type}  no return
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
    return $.url('?do-reset') === 'X';
  },
  /**
   * buildTable - create the table
   *
   * @return {type}  no return
   */
  buildTable: function() {
    this.table.fillIconPool();
    this.table.fillWithCells();
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
  this.iconCounter = 0;
};
$.extend(Table.prototype, {
  /**
   * fillIconPool - fill the array with icons to show inside cells
   *
   * @return {type}  no return
   */
  fillIconPool: function() {
    const iconNum = Math.floor(Math.pow(this.size, 2) / 2); //number of needed icons
    const iconsArranged = [];

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
   * @return {type}       no return
   */
  addCell: function(parent, x, y) {
    let icon;
    //if the number of cells is odd, put the 'dead' cell in the center
    icon = this.iconPool[this.iconCounter].icon;
    const cell = new Cell(x, y, icon);
    this.cells.push(cell);
    parent.append(
      `<td><span class="glyphicon glyphicon-${icon}" aria-hidden="true"></span></td>`);
    this.iconCounter++;
  },

  /**
   * fillWithCells - fill the table with cells
   *
   * @return {type}  no return
   */
  fillWithCells: function() {
    for (let y = 0; y < this.size; y++) {
      $('table').append('<tr>');
      for (let x = 0; x < this.size; x++) {
        this.addCell($('tr:last'), x, y);
      }
    }
    //to make sure cells are square even if resized in case the screen is too small
    $('td').css('height', $('td').css('width'));
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
const Cell = function(x, y, icon) {
  this.x = x;
  this.y = y;
  this.icon = icon;
  this.status = cellStatus.closed;
};
/*$.extend(Cell.prototype, {
  getIcon: function() {
    // console.log(this.status);
  }
});*/
