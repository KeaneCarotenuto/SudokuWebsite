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

function SaveBoard(){
    localStorage.setItem("sudokuBoard", JSON.stringify(board));
}

function LoadBoard(){
    //load board from local storage
    var savedBoard = localStorage.getItem("sudokuBoard");
    if(savedBoard != null){
        board = JSON.parse(savedBoard);
    }

    UpdateBoard();
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

    SaveBoard();

    UpdateBoard();
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

function UpdateBoard(){
    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            var cell = document.getElementById("cell-" + x + y);
            var boardVal = board[y][x];

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
    alert("New Game");

    //generate a new board
    var reTry = true;
    while(reTry){
        reTry = false;
        Clear(false);
        var numsLeft = 10;
        while(numsLeft > 0){
            var randX = Math.floor(Math.random() * 9);
            var randY = Math.floor(Math.random() * 9);
            var randNum = Math.floor(Math.random() * 9) + 1;
            if(board[randY][randX] == 0 && CheckPos(randX, randY, randNum)){
                board[randY][randX] = randNum;
                numsLeft -= 1;
            }
        }
        // var copyBoard = board;
        // if(Solve(0,0)){
        //     board = copyBoard;
        //     UpdateBoard();
        // }
        // else{
        //     reTry = true;
        // }


    }

    UpdateBoard();
}

function Clear(doCheck = true){
    if (doCheck){
        var r = confirm("Are you sure you want to clear the board?");
        if(r == false) return;
    }

    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            board[y][x] = 0;
        }
    }

    SaveBoard();

    UpdateBoard();
}

function Solve(){
    alert("Solve");
}

function Clamp(num, min, max){
    return Math.min(Math.max(num, min), max);
}