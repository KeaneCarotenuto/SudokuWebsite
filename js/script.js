//sudoku board is 9 rows and 9 columns of cells, each cell can have a value from 0-9 (0 is empty)
//the board is divided into 3x3 boxes of cells
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

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
var notesBoard = JSON.parse(JSON.stringify(board));

var lockedCells = [];

//difficulty enum
var EDifficulty = {
    SuperEasy: -1,
    Easy: 0,
    Medium: 1,
    Hard: 2
};

//current difficulty
var difficulty = EDifficulty.Easy;

var timer = null;
var totalTime = 0;

var isNoteMode = false;

//if press N on keyboard, toggle note mode
document.onkeypress = function(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    
    if (charStr.toLowerCase() == "n") {
        ToggleNoteMode();
    }
};

function ToggleNoteMode(){
    isNoteMode = !isNoteMode;
    UpdateUI();
}

function SaveGame(){
    localStorage.setItem("sudokuBoard", JSON.stringify(board));
    localStorage.setItem("sudokuNotes", JSON.stringify(notesBoard));
    localStorage.setItem("sudokuNotesMode", isNoteMode);
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

    //load notes board from local storage
    var savedNotesBoard = localStorage.getItem("sudokuNotes");
    if(savedNotesBoard != null){
        notesBoard = JSON.parse(savedNotesBoard);
    }

    //load note mode from local storage
    var savedNoteMode = localStorage.getItem("sudokuNotesMode");
    if(savedNoteMode != null){
        isNoteMode = savedNoteMode;
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
    PauseTimer();
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

function TryContinueTimer(){
    //only play timer if timer is not already running
    if(timer == null){
        PlayTimer();
    }
}

function PauseTimer(){
    clearInterval(timer);
    timer = null;

    UpdateTimer();
    SaveGame();
}

function CheckBoard(input){
    //deslect input field ONLY if already selected
    if(input.classList.contains("selected")){
        input.classList.remove("selected");
    }

    //id format cell-xy
    var id = input.id;
    var x = id.substring(5,6);
    var y = id.substring(6,7);

    //if x and y are not numbers, or out of bounds, return
    if(x < 0 || x > 8 || y < 0 || y > 8){
        return;
    }

    if (isNoteMode) {
        var string = input.value;
        //remove all non-numbers
        string = string.replace(/[^0-9]/g, '');

        //if note mode, set the note board to the value
        notesBoard[y][x] = string;
    }
    else{
        if (isNaN(x) || isNaN(y)) return;

        //get the value of the cell
        var num = parseInt(input.value);

        //if num is invalid, set to 0
        if(isNaN(num)){
            num = 0;
        }
        //clamp num to 0-9
        num = Clamp(num, 0, 9);

        board[y][x] = num;
    }

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
    UpdateNoteMode();
}

function UpdateTimer() {
    var minutes = Math.floor(totalTime / 60);
    if (minutes < 10)
        minutes = "0" + minutes;
    var seconds = totalTime % 60;
    if (seconds < 10)
        seconds = "0" + seconds;
    var time = minutes + ":" + seconds;

    var isSolved = CheckSolved();
    if (isSolved) {
        document.getElementById("gameTimer").innerHTML = "Solved In: " + time;
    }
    else{
        document.getElementById("gameTimer").innerHTML = time;
    }
    
}

function UpdateBoard(){
    var isSolved = CheckSolved();
    if(isSolved){
        PauseTimer();
        //document.getElementById("gameStatus").innerHTML = "Solved!";
    }
    else{
        TryContinueTimer();
    }

    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            var cell = document.getElementById("cell-" + x + y);
            var boardVal = board[y][x];

            //disable input if locked
            cell.disabled = lockedCells.includes(String(x)+String(y));

            if (isSolved && !cell.disabled){
                cell.value = boardVal;
                cell.classList.remove("cellWrong");
                cell.classList.add("cellCorrect");
                cell.disabled = true;
                continue;
            }

            cell.classList.remove("cellWrong");
            cell.classList.remove("cellCorrect");
            cell.classList.remove("cellNote");

            if (boardVal == 0){
                //check notes board
                var notes = String(notesBoard[y][x]);

                //if no notes, set to 0
                if(notes.length == 0){
                    cell.value = "";
                }
                else{
                    cell.value = "";
                    for (var i = 0; i < notes.length; i++) {
                        if (notes[i] == "0") continue;
                        cell.classList.add("cellNote");
                        cell.value += notes[i];
                        if (i < notes.length - 1) cell.value += ",";
                    }
                }
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

function UpdateNoteMode(){
    var noteModeButton = document.getElementById("noteMode");
    if(isNoteMode){
        noteModeButton.innerHTML = "Note Mode";
        noteModeButton.classList.add("btn-outline-warning");
        noteModeButton.classList.remove("btn-outline-primary");
    }
    else{
        noteModeButton.innerHTML = "Place Mode";
        noteModeButton.classList.add("btn-outline-primary");
        noteModeButton.classList.remove("btn-outline-warning");
    }
}

function SetDifficulty(diff = 0){
    switch(diff){
        case EDifficulty.SuperEasy:
            difficulty = EDifficulty.SuperEasy;
            break;
        case EDifficulty.Easy:
            difficulty = EDifficulty.Easy;
            break;
        case EDifficulty.Medium:
            difficulty = EDifficulty.Medium;
            break;
        case EDifficulty.Hard:
            difficulty = EDifficulty.Hard;
            break;
        default:
            difficulty = EDifficulty.Easy;
            break;
    }
    NewGame();
}

function NewGame(_seedAmount = 5){
    //find new game button and blur it
    var newGameButton = document.getElementById("btnNewGame");
    if (newGameButton != null) newGameButton.blur();

    totalTime = 0;

    //generate a new board
    var reTry = true;
    while(reTry){
        reTry = false;
        Reset();
        var numsLeft = _seedAmount;
        while(numsLeft > 0){
            var randX = Math.floor(Math.random() * 9);
            var randY = Math.floor(Math.random() * 9);
            var randNum = Math.floor(Math.random() * 9) + 1;
            if(board[randY][randX] == 0 && CheckPos(randX, randY, randNum)){
                board[randY][randX] = randNum;
                numsLeft -= 1;
            }
        }
        //var copyBoard = JSON.parse(JSON.stringify(board));
        if(Solve(0,0)){
            //board = copyBoard;
            var trimAmount = GetTrimAmount();
            TrimBoard(trimAmount, -1);
            LockFilledCells();
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

function GetTrimAmount() {
    switch (difficulty) {
        case EDifficulty.SuperEasy:
            return 3;
            break;

        case EDifficulty.Easy:
            return 5;
            break;

        case EDifficulty.Medium:
            return 6;
            break;

        case EDifficulty.Hard:
            return 7;
            break;
    
        default:
            return 5;
            break;
    }
}

function TrimBoard(toTrim = 4, range = 0){
    //for each box in the board (3x3) set random cells to 0, until lockedPerBox cells have numbers
    for(var y = 0; y < 9; y += 3){
        for(var x = 0; x < 9; x += 3){
            var numsLeft = toTrim + Math.round(Math.random() * range);
            while(numsLeft > 0){
                var randX = Math.floor(Math.random() * 3);
                var randY = Math.floor(Math.random() * 3);
                if(board[y + randY][x + randX] != 0){
                    board[y + randY][x + randX] = 0;
                    numsLeft -= 1;
                }
            }
        }
    }
}

function Reset(){
    RestartTimer();
    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            board[y][x] = 0;
            notesBoard[y][x] = 0;
        }
    }
    UnlockAllCells();
    SaveGame();
    UpdateUI();
}

function LockAllCells(){
    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            lockedCells.push(String(x)+String(y));
        }
    }
    SaveGame();
    UpdateUI();
}

function LockFilledCells(){
    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            if(board[y][x] != 0){
                lockedCells.push(String(x)+String(y));
            }
        }
    }
    SaveGame();
    UpdateUI();
}

function UnlockAllCells(){
    lockedCells = [];
    SaveGame();
    UpdateUI();
}

function Clear(doCheck = true){
    //find clear button and blur it
    var clearButton = document.getElementById("btnClear");
    if (clearButton != null) clearButton.blur();

    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            //if cell isnt locked, set to 0
            if(!lockedCells.includes(String(x)+String(y))) board[y][x] = 0;

            notesBoard[y][x] = "";
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

    // for(var num = 1; num <= 9; num++){
    //     if(CheckPos(x, y, num)){
    //         board[y][x] = num;

    //         if(Solve(x + 1, y)){
    //             return true;
    //         }
    //     }
    //     board[y][x] = 0;
    // }

    var numsToCheck = [1,2,3,4,5,6,7,8,9];
    //randomly choose a number to check, and remove it from the list
    while (numsToCheck.length > 0){
        var randNum = Math.floor(Math.random() * numsToCheck.length);
        var num = numsToCheck[randNum];
        if(CheckPos(x, y, num)){
            board[y][x] = num;

            if(Solve(x + 1, y)){
                return true;
            }
        }
        board[y][x] = 0;
        numsToCheck.splice(randNum, 1);
    }

    return false;
}

function CheckSolved(){
    for(var y = 0; y < 9; y++){
        for(var x = 0; x < 9; x++){
            if(board[y][x] == 0) return false;

            if (!CheckPos(x, y, board[y][x])) return false;
        }
    }
    return true;
}

function Clamp(num, min, max){
    return Math.min(Math.max(num, min), max);
}