/*
/ File: clientside.js
/ Author: Amber Charlotte Converse
/ Description: Client side code for movement.
*/
var curTurn = "white";
var selectedCell = null;
var doubleJump = false;
var numTurns = 0;

function showMoves(givenCell) {
    document.getElementsByClassName("current_turn")[0].innerHTML = curTurn.slice(0,1).toUpperCase() + curTurn.slice(1) + "'s turn";
    if (doubleJump && givenCell != selectedCell) {
        alert("You can't move this piece. You can only move the current piece.");
    } else {
        if (selectedCell == givenCell && !doubleJump) {
            eraseMarkers();
            selectedCell = null;
            return;
        }
        selectedCell = givenCell;
        player = selectedCell.id;
        if (selectedCell.innerHTML == "♖" && player == curTurn) {
            showMovesForGlord();
        } else if (arePossibleForwardJumps()) {
            showMovesOnlyForwardJumps();
        } else if (selectedCell.innerHTML == "♙" && player == curTurn) {
            showMovesForPawn();
        } else {
            eraseMarkers();
            if (givenCell.innerHTML == "♖̽") {
                alert("This glord is deactivated. You must reactivate it to use it.");
            } else if (givenCell.innerHTML != " ") {
                alert("It is not this player's turn!");
            } else {
                alert("There is no piece on this tile.");
            }
        }
    }
}

function showMovesOnlyForwardJumps() {
    eraseMarkers();
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if (canMove(selectedCell,row,col)) {
                if (isForwardJump(selectedCell,row,col)) {
                    curCell = getCellFromPos(row,col);
                    curCell.innerHTML = "⌾";
                    curCell.classList.add("possible_move");
                    curCell.setAttribute("onClick","attemptMove(this)");
                }
            }
        }
    }
}

function showMovesForGlord() {
    eraseMarkers();
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var curCell = getCellFromPos(row,col);
            if (curCell.id != curTurn && curCell.innerHTML == "♙") {
                curCell.classList.add("possible_move");
                curCell.setAttribute("onClick","attemptMove(this)");
            }
        }
    }
}

function showMovesForPawn() {
    eraseMarkers();
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var curCell = getCellFromPos(row,col);
            if (canMove(selectedCell,row,col) &&
               curCell.innerHTML != "♖" &&
               curCell.innerHTML != "♖̽") {
                curCell.innerHTML = "⌾";        
             }
            if (canMove(selectedCell,row,col)) {
                curCell.classList.add("possible_move");
                curCell.setAttribute("onClick","attemptMove(this)");
            }
        }
    }
}

function attemptMove(goalCell) {
    player = selectedCell.id;
    if (goalCell.innerHTML == "⌾" && player == curTurn) {
        eraseMarkers();
        doubleJump = false;
        var curMoveIsJump = false;
        if (isJump(selectedCell,getPos(goalCell)[0],getPos(goalCell)[1])) {
            var curMoveIsJump = true;
            selectedCellPos = getPos(selectedCell);
            goalCellPos = getPos(goalCell)
            inBetweenCell = getCellFromPos(((selectedCellPos[0] + goalCellPos[0]) / 2),((selectedCellPos[1] + goalCellPos[1]) / 2));
            inBetweenCell.innerHTML = " ";
            inBetweenCell.setAttribute("id"," ");
            if (isForwardJump(goalCell,goalCellPos[0]-2,goalCellPos[1]+2) ||
               isForwardJump(goalCell,goalCellPos[0]-2,goalCellPos[1]-2)) {
                doubleJump = true;
            }
        }
        addMove(selectedCell,goalCell,curMoveIsJump);
        selectedCell.innerHTML = " ";
        selectedCell.setAttribute("id"," ");
        goalCell.innerHTML = "♙";
        goalCell.setAttribute("id",player);
        if (doubleJump) {
            selectedCell = goalCell;
            showMoves(goalCell);
        } else {
            switchPlayer();
            selectedCell = null;
        }
        if (getPos(goalCell)[0] == 0) {
            goalCell.innerHTML = "♖";
        }
        if (isWin()) {
            switchPlayer();
            document.getElementsByClassName("moves")[1] += curTurn.slice(0,1).toUpperCase() + curTurn.slice(1) + " win";
            alert(curTurn.slice(0,1).toUpperCase() + curTurn.slice(1) + " has won!");
        }
        numTurns++;
    } else if (goalCell.classList.contains("possible_move") && player == curTurn) {
        eraseMarkers();
        if (goalCell.innerHTML == "♖") {
            goalCell.innerHTML = "♖̽";
            selectedCell.innerHTML = " ";
            addMove(selectedCell,goalCell,false,"G")
        } else if (goalCell.innerHTML == "♖̽") {
            goalCell.innerHTML = "♖";
            selectedCell.innerHTML = " ";
            addMove(selectedCell,goalCell,false,"G")
        } else {
            goalCell.innerHTML = " ";
            goalCell.setAttribute("id"," ")
            addMove(selectedCell,goalCell,true,"G");
        }
        
        switchPlayer();
        selectedCell = null;
        numTurns++;
        if (isWin()) {
            switchPlayer();
            document.getElementsByClassName("moves")[1] += curTurn.slice(0,1).toUpperCase() + curTurn.slice(1) + " win";
            alert(curTurn.slice(0,1).toUpperCase() + curTurn.slice(1) + " has won!");
        }
    } else {
        alert("You can't move to this position!");
    }
}

function canMove(givenCell,row,col) {
    if (isOnBoard(row,col)) {
        var cellPos = getPos(givenCell);
        var goalCell = getCellFromPos(row,col);
        if (goalCell.innerHTML != "♙"  && givenCell.id == curTurn) {
            if ((Math.abs(cellPos[0] - row) == 1 && Math.abs(cellPos[1] - col) == 1) ||
                (isJump(givenCell,row,col))) {
                return true;
            }
        }
    }
    return false;
}

function isWin() {
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var curCell = getCellFromPos(row,col);
            if (curCell.id == curTurn) {
                return false;
            }
        } 
    }
    return true;
}

function isJump(givenCell,row,col) {
    if (isOnBoard(row,col)) {
        var cellPos = getPos(givenCell);
        var goalCell = getCellFromPos(row,col);
        if (goalCell.innerHTML != "♙" && 
            Math.abs(cellPos[0] - row) == 2 && Math.abs(cellPos[1] - col) == 2) {
            var inBetweenCell = getCellFromPos(((cellPos[0] + row) / 2),((cellPos[1] + col) / 2));
            if (inBetweenCell.innerHTML == "♙" && inBetweenCell.id != curTurn) {
                return true;
            }
        }
    }
    return false;
}

function isForwardJump(givenCell,row,col) {
    if (isOnBoard(row,col)) {
        var cellPos = getPos(givenCell);
        var goalCell = getCellFromPos(row,col);
        if (goalCell.innerHTML != "♙" && (cellPos[0] - row) == 2 && Math.abs(cellPos[1] - col) == 2) {
            var inBetweenCell = getCellFromPos(((cellPos[0] + row) / 2),((cellPos[1] + col) / 2));
            if (inBetweenCell.innerHTML == "♙" && inBetweenCell.id != curTurn) {
                return true;
            }
        }
    }
    return false;
}

function arePossibleForwardJumps() {
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var curCell = getCellFromPos(row,col);
            var player = curCell.id;
            if (player == curTurn) {
                for (var i = -2; i <= 2; i += 4) {
                    if (canMove(curCell,row-2,col+i) && isForwardJump(curCell,row-2,col+i)) {
                            return true;
                    }
                }
            } 
        } 
    }
    return false;
}

function eraseMarkers() {
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            curCell = getCellFromPos(row,col);
            if (curCell.innerHTML == "⌾") {
                curCell.innerHTML = " ";
            }
            curCell.setAttribute("onClick","showMoves(this)");
            curCell.classList.remove("possible_move");
        }
    }
}

function getCellFromPos(row, col) {
    return document.getElementById("board").rows[row].cells[col];
}

function getPos(givenCell) {
    if (givenCell != null) {
        return [givenCell.parentElement.rowIndex, givenCell.cellIndex];
    } else {
        return null;
    }
}

function isOnBoard(row,col) {
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
        return true;
    }
    return false;
}

function switchPlayer() {
    if (curTurn == "white") {
        curTurn = "black";
    } else {
        curTurn = "white";
    }
    document.getElementsByClassName("current_turn")[0].innerHTML = curTurn.slice(0,1).toUpperCase() + curTurn.slice(1) + "'s turn";
}

function addMove(fromCell,toCell,isJump,extraChar="") {
    var fromCellPos = getPos(fromCell);
    var toCellPos = getPos(toCell);
    var fromCellBoard = translatePosToBoard(fromCellPos[0],fromCellPos[1]);
    var toCellBoard = translatePosToBoard(toCellPos[0],toCellPos[1]);
    document.getElementsByClassName("moves")[0].innerHTML = "Moves:";
    if (player == "white") {
        document.getElementsByClassName("moves")[1].innerHTML += String(Math.ceil(numTurns/2)+1) + ". ";
    }
    document.getElementsByClassName("moves")[1].innerHTML += fromCellBoard;
    if (isJump) {
        document.getElementsByClassName("moves")[1].innerHTML += extraChar + "x";
    } else {
        document.getElementsByClassName("moves")[1].innerHTML += "-" + extraChar;
    }
    document.getElementsByClassName("moves")[1].innerHTML += toCellBoard + " ";
}

function translatePosToBoard(row,col) {
    return String((Math.ceil((col+1)/2))+(4*row));
}

function resetGame() {
    if (confirm("Are you sure you want to reset the game?")) {
        curTurn = "white";
        selectedCell = null;
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                var curCell = getCellFromPos(row,col);
                curCell.classList.remove("possible_move")
                if (row < 2 && curCell.className == "black") {
                    curCell.innerHTML = "♙";
                    curCell.setAttribute("id","black");
                } else if (row > 5 && curCell.className == "black") {
                    curCell.innerHTML = "♙";
                    curCell.setAttribute("id","white");
                } else {
                    curCell.innerHTML = " ";
                    curCell.setAttribute("id"," ");
                }
            }
        }
    }
}