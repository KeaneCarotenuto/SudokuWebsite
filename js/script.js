const dim = 9;
//2d array for the sudoku board
var board = [
    [0,0,0, 0,0,0, 0,0,0],
    [0,0,0, 0,0,0, 0,0,0],
    [0,0,0, 0,0,0, 0,0,0],

    [0,0,0, 0,0,0, 0,0,0],
    [0,0,0, 0,0,0, 0,0,0],
    [0,0,0, 0,0,0, 0,0,0],

    [0,0,0, 0,0,0, 0,0,0],
    [0,0,0, 0,0,0, 0,0,0],
    [0,0,0, 0,0,0, 0,0,0]
];
var lockedCells = [];

var timer = null;
var totalTime = 0;

function SaveGame(){
    localStorage.setItem("sudokuBoard", JSON.stringify(board));
    localStorage.setItem("sudokuLockedCells", JSON.stringify(lockedCells));
    localStorage.setItem("sudokuTime", totalTime);
}

function LoadGame(){
    //load board from local storage
    var savedBoard = localStorage.getItem("sudokuBoard");
    if(savedBoard != null){
        board = JSON.parse(savedBoard);
    }
    //if board contains only 0's, new game
    var isNewGame = true;
    loop:
    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            if(board[y][x] != 0){
                isNewGame = false;
                break loop;
            }
        }
    }
    if(isNewGame){
        NewGame();
    }

    //load locked cells from local storage
    var savedLockedCells = localStorage.getItem("sudokuLockedCells");
    if(savedLockedCells != null){
        lockedCells = JSON.parse(savedLockedCells);
    }


    //load time from local storage
    var savedTime = localStorage.getItem("sudokuTime");
    if(savedTime != null){
        totalTime = parseInt(savedTime);
    }

    PlayTimer();
    UpdateUI();
}

function RestartTimer(){
    totalTime = 0;
    PlayTimer();
}

function PlayTimer(){
    timer = setInterval(function(){
        totalTime += 1;

        UpdateTimer();
        SaveGame();
    }, 1000);
}

function PauseTimer(){
    clearInterval(timer);

    UpdateTimer();
    SaveGame();
}

function CheckBoard(input){
    //deslect input field
    input.blur();

    //id format cell-xy
    var id = input.id;
    var x = id.substring(5,6);
    var y = id.substring(6,7);
    //if x and y are not numbers, or out of bounds, return
    if(isNaN(x) || isNaN(y) || x < 0 || x > 8 || y < 0 || y > 8){
        return;
    }

    //get the value of the cell
    var num = parseInt(input.value);

    //if num is invalid, set to 0
    if(isNaN(num)){
        num = 0;
    }
    //clamp num to 0-9
    num = Clamp(num, 0, 9);

    board[y][x] = num;

    SaveGame();

    UpdateUI();
}

function CheckPos(x, y, num){
    if (num == 0){
        return true;
    }

    //check row
    for(var i = 0; i < 9; i++){
        if (i == x) continue;
        if(board[y][i] == num){
            return false;
        }
    }

    //check column
    for(var i = 0; i < 9; i++){
        if (i == y) continue;
        if(board[i][x] == num){
            return false;
        }
    }

    //check 3x3 square
    var xStart = Math.floor(x / 3) * 3;
    var yStart = Math.floor(y / 3) * 3;
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
            if (yStart + i == y && xStart + j == x) continue;
            if(board[yStart + i][xStart + j] == num){
                return false;
            }
        }
    }

    return true;
}

function UpdateUI(){
    UpdateBoard();
    UpdateTimer();
}

function UpdateTimer() {
    var minutes = Math.floor(totalTime / 60);
    if (minutes < 10)
        minutes = "0" + minutes;
    var seconds = totalTime % 60;
    if (seconds < 10)
        seconds = "0" + seconds;
    var time = minutes + ":" + seconds;
    document.getElementById("gameTimer").innerHTML = time;
}

function UpdateBoard(){
    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            var cell = document.getElementById("cell-" + x + y);
            var boardVal = board[y][x];

            //disable input if locked
            cell.disabled = lockedCells.includes(String(x)+String(y));

            cell.classList.remove("cellWrong");

            if (boardVal == 0){
                cell.value = "";
            }
            else{
                cell.value = boardVal;
                if (!CheckPos(x, y, boardVal)){
                    cell.classList.add("cellWrong");
                }
            }
        }
    }
}

function NewGame(_totalNums = 10){
    //find new game button and blur it
    var newGameButton = document.getElementById("btnNewGame");
    if (newGameButton != null) newGameButton.blur();

    totalTime = 0;

    //generate a new board
    var reTry = true;
    while(reTry){
        reTry = false;
        Reset();
        var numsLeft = _totalNums;
        while(numsLeft > 0){
            var randX = Math.floor(Math.random() * 9);
            var randY = Math.floor(Math.random() * 9);
            var randNum = Math.floor(Math.random() * 9) + 1;
            var coord = String(randX) + String(randY);
            if(board[randY][randX] == 0 && CheckPos(randX, randY, randNum)){
                lockedCells.push(coord);
                board[randY][randX] = randNum;
                numsLeft -= 1;
            }
        }
        var copyBoard = JSON.parse(JSON.stringify(board));
        if(Solve(0,0)){
            board = copyBoard;
            UpdateUI();
        }
        else{
            console.log("Trying To Make Board...");
            reTry = true;
        }
    }

    SaveGame();
    RestartTimer();
    UpdateUI();
}

function Reset(){
    timer = 0;
    lockedCells = [];
    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            board[y][x] = 0;
        }
    }
}

function Clear(doCheck = true){
    //find clear button and blur it
    var clearButton = document.getElementById("btnClear");
    if (clearButton != null) clearButton.blur();

    if (doCheck){
        var r = confirm("Are you sure you want to clear the board?");
        if(r == false) return;
    }

    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            //if cell isnt locked, set to 0
            if(!lockedCells.includes(String(x)+String(y))) board[y][x] = 0;
        }
    }

    SaveGame();
    UpdateUI();
}

function Solve(x = 0, y = 0){
    // find solve button and blur it
    var solveButton = document.getElementById("btnSolve");
    if (solveButton != null) solveButton.blur();

    if(x == dim && y == dim - 1){
        return true;
    }

    if (x == dim){
        x = 0;
        y += 1;
    }

    if(board[y][x] != 0){
        return Solve(x + 1, y);
    }

    for(var num = 1; num <= 9; num++){
        if(CheckPos(x, y, num)){
            board[y][x] = num;

            if(Solve(x + 1, y)){
                return true;
            }
        }
        board[y][x] = 0;
    }

    return false;
}

function Clamp(num, min, max){
    return Math.min(Math.max(num, min), max);
}