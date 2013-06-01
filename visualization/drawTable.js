      var colors = ['#F5A9A9'
	          	, '#8A0808'
	                , '#FF4000'
	                , '#FFBF00'
	                , '#C8FE2E'
	                , '#38610B'
	                , '#01DF01'
	                , '#0B615E'
	                , '#013ADF'
	                , '#8258FA'
	                , '#8904B1'
	                , '#FF00FF'
	                , '#FF0040'];

	
	var GAME_TABLE_PARENT_ID='tableSection';
	var BOARD_TABLE_PARENT_ID='boardSection';
	var GAME_TABLE_ID = 'gameTable';
	var BOARD_TABLE_ID = 'boardTable';
	var TABLE_CLASS = 'insideTable';
	var DELAY_TIME = 1000;
	var DOORS_OPEN_CLASSNAME = 'openedDoors';
	var DOORS_CLOSE_CLASSNAME = 'closedDoors';


	var ROW='tr';
	var CELL='td';
        var DISPLAY_COLORS = true;

	function destroyTable(tableId) {
		try {
			var table = document.getElementById(tableId);
			table.parentNode.removeChild(table);
		}catch(error) {
			
		}
	}

	function getCell(x, y) {
		try {
			var table = document.getElementById(GAME_TABLE_ID);
			var rows = table.getElementsByTagName(ROW);
			var row = rows[ROWS_COUNT - parseInt(y, 10)];
			var cells = row.getElementsByTagName(CELL);
			var cell = cells[parseInt(x, 10) - 1];
			return cell;
		}catch(error) {
			
		}
		return null;
	}

	function addPlayerToCell(x, y, colorIndex){
		try {
			var cell = getCell(x, y);
			//alert(cell);
			var div = document.createElement('div');
			div.style.backgroundColor = colors[colorIndex];
			div.className = TABLE_CLASS;
			cell.appendChild(div);
		}catch(error) {
				//alert(error);
		}
	}


	function addDoorsToCell(x, y, open){
		try {
			var cell = getCell(x, y);
			var className;
			if (open) {
				className = DOORS_OPEN_CLASSNAME;
			}else {
				className = DOORS_CLOSE_CLASSNAME;
			}
			cell.className = className; 
			//alert(cell.className);

		}catch(error) {
				//alert(error);
		}
	}

	function drawPlayerTable(players){
		try {
			
			var columnsCount=3;
			var rowsCount=players.length;
			var root=document.getElementById(BOARD_TABLE_PARENT_ID);
			var table=document.createElement('table');
			table.id=BOARD_TABLE_ID;
			var tableBody=document.createElement('tbody');
			var row, cell;
			for(var i=0;i<rowsCount;i++){
				row=document.createElement(ROW);
				var name = document.createTextNode(players[i].name);
				var colorIndex = parseInt(players[i].color, 10);
				var state = document.createTextNode(players[i].state);
				for(var j=0;j<columnsCount;j++){
					cell=document.createElement(CELL);
					if (j == 0) {
						cell.style.backgroundColor = colors[colorIndex];		
						cell.className = 'boardColorCell';
					}else if (j == 1) {
						cell.appendChild(name);
					}else {
						cell.appendChild(state);
					}
					row.appendChild(cell);

				}
				tableBody.appendChild(row);
			}
			table.appendChild(tableBody);
			root.appendChild(table);
		}catch(error) {
				//alert(error);
		}
	}


	function modifieGameTable(game) {
		for(var j=0; j < game.doors.length; j++) {
			addDoorsToCell(game.doors[j].x, game.doors[j].y, game.doors[j].open);	
		}
		for(var j=0; j < game.figures.length; j++) {
			addPlayerToCell(game.figures[j].x, game.figures[j].y, game.figures[j].color);	
		}
	}
	function drawTable(columnsCount, rowsCount){
		try {
			var root=document.getElementById(GAME_TABLE_PARENT_ID);
			var table=document.createElement('table');
			table.id=GAME_TABLE_ID;
			var tableBody=document.createElement('tbody');
			var row, cell;
			for(var i=0;i<rowsCount;i++){
				row=document.createElement(ROW);
				for(var j=0;j<columnsCount;j++){
					cell=document.createElement(CELL);
					row.appendChild(cell);
				}
				tableBody.appendChild(row);
			}
			table.appendChild(tableBody);
			root.appendChild(table);
		}catch(error) {
		}
	}

	function setSize(element, sizePercentege) {
		try {
			element.style.height = sizePercentege + "%"; 
			element.style.width = sizePercentege + "%";
		}catch(error) {
		
		}
	}

	function adjustCellDivSize (cell) {
		try {
			var cellDivs = cell.getElementsByTagName('div');
			var figuresInCell = cellDivs.length;
			var size;
			if (figuresInCell > 0) {
				size = 100/parseInt(figuresInCell, 10);
			}else {
				size = 0;
			}
			//alert(size);
			for(var i = 0; i < cellDivs.length; i++) {
				setSize(cellDivs[i], size);
			}	
		}catch(error) {
		}
	}

	function adjustFiguresSize() {
		try {
			var table = document.getElementById(GAME_TABLE_ID);	
			var cells = table.getElementsByTagName(CELL);
			for(var i = 0; i < cells.length; i++) {
				adjustCellDivSize(cells[i]);
			}
		}catch(error){
		
		}
	}
	
	// table size parameters
	var COLUMNS_COUNT = 10;
	var ROWS_COUNT = 10;

	//game states
	var game = [
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Veikia"}],"figures":[{"x":1,"y":1,"color":0},{"x":1,"y":1,"color":0},{"x":1,"y":1,"color":1},{"x":1,"y":1,"color":1}],"doors":[{"x":4,"y":4,"open":true}]}
,
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Veikia"}],"figures":[{"x":2,"y":1,"color":0},{"x":4,"y":2,"color":0},{"x":5,"y":5,"color":1},{"x":4,"y":5,"color":1}],"doors":[{"x":4,"y":4,"open":true}]}
,
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Veikia"}],"figures":[{"x":2,"y":1,"color":0},{"x":4,"y":3,"color":0},{"x":5,"y":5,"color":1},{"x":4,"y":5,"color":1}],"doors":[{"x":4,"y":4,"open":true}]}
,
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Veikia"}],"figures":[{"x":3,"y":1,"color":0},{"x":4,"y":3,"color":0},{"x":5,"y":5,"color":1},{"x":4,"y":5,"color":1}],"doors":[{"x":4,"y":4,"open":true}]}
,
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Veikia"}],"figures":[{"x":3,"y":1,"color":0},{"x":4,"y":3,"color":0},{"x":4,"y":5,"color":1},{"x":4,"y":5,"color":1}],"doors":[{"x":4,"y":4,"open":true}]}
,
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Veikia"}],"figures":[{"x":3,"y":1,"color":0},{"x":4,"y":3,"color":0},{"x":4,"y":5,"color":1},{"x":4,"y":4,"color":1}],"doors":[{"x":4,"y":4,"open":true}]}
,
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Veikia"}],"figures":[{"x":3,"y":1,"color":0},{"x":4,"y":4,"color":0},{"x":4,"y":5,"color":1},{"x":4,"y":4,"color":1}],"doors":[{"x":4,"y":4,"open":true}]}
,
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Veikia"}],"figures":[{"x":4,"y":1,"color":0},{"x":4,"y":4,"color":0},{"x":4,"y":5,"color":1},{"x":4,"y":4,"color":1}],"doors":[{"x":4,"y":4,"open":true}]}
,
{"players":[{"color":0,"name":"Martynas","state":"Veikia"},{"color":1,"name":"Martynas","state":"Laimėjo"}],"figures":[{"x":4,"y":1,"color":0},{"x":4,"y":4,"color":0}],"doors":[{"x":4,"y":4,"open":false}]}
,
]

	var intervalHandler;

	function run() {
		try {

			var index = 0;
			intervalHandler = window.setInterval(
					function() {
						if (index + 1 >= game.length) {
							window.clearInterval(intervalHandler);
						}
						//alert(index);
						destroyTable(GAME_TABLE_ID);
						destroyTable(BOARD_TABLE_ID);
						drawTable(COLUMNS_COUNT, ROWS_COUNT);
						modifieGameTable(game[index]);
						drawPlayerTable(game[index].players);
						adjustFiguresSize();				
						index++;
					}
			, DELAY_TIME);
		}catch(error) {
			alert(error);	
		}
	}

