      var colors = ['#F5A9A9'
	          	, '#8A0808'
	                , '#FF4000'
	                , '#FFBF00'
	                , '#FFBF00'
	                , '#C8FE2E'
	                , '#38610B'
	                , '#01DF01'
	                , '#01DF74'
	                , '#0B615E'
	                , '#013ADF'
	                , '#8258FA'
	                , '#8904B1'
	                , '#FF00FF'
	                , '#FF0040'];

	
	var GAME_TABLE_PARENT_ID='tableSection';
	var BOARD_TABLE_PARENT_ID='boardSection';
	var ROW='tr';
	var CELL='td';
        var DISPLAY_COLORS = true;
	var GAME_TABLE_ID = 'gameTable';
	var BOARD_TABLE_ID = 'boardTable';
	var TABLE_CLASS = 'insideTable';
	var DELAY_TIME = 1000;
	var DOORS_OPEN_COLOR = '#00FF00';
	var DOORS_CLOSE_COLOR = '#FF0000';


	function destroyTable(tableId) {
		try {
			var table = document.getElementById(tableId);
			table.parentNode.removeChild(table);
		}catch(error) {
			
		}
	}

	function getCell(x, y) {
		try {
			var rows = document.getElementsByTagName(ROW);
			var row = rows[parseInt(x, 10) - 1];
			var cells = row.getElementsByTagName(CELL);
			var cell = cells[parseInt(y, 10) - 1];
			return cell;
		}catch(error) {
			
		}
		return null;
	}

	function addPlayerToCell(x, y, colorIndex){
		try {
			var cell = getCell(x, y);
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
			var borderColor;
			if (open) {
				borderColor = DOORS_OPEN_COLOR;
			}else {
				borderColor = DOORS_CLOSE_COLOR;
			}
			cell.style.borderColor = borderColor; 
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
				var name = players[i].name;
				var colorIndex = players[i].color;
				var state = players[i].state;
				for(var j=0;j<columnsCount;j++){
					cell=document.createElement(CELL);
					if (j == 0) {
						cell.style.backgroundColor = colors[colorIndex];		
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
	function drawTable(){
		try {
			var columnsCount=10;
			var rowsCount=10;
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

	//var figures = [{'x':1, 'y':1, 'color':2}, {'x':1, 'y':3, 'color':5}, {'x':1, 'y':1, 'color':6}];
	//var game = {'figures':figure\c s};
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
						drawTable();
						modifieGameTable(game[index]);
						drawPlayerTable(game[index].players);
						index++;
					}
			, DELAY_TIME);
		}catch(error) {
			alert(error);	
		}
	}

