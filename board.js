import Pieces from "./pieces.js";

const pieces = new Pieces();
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"]
class Square {
    constructor(file, rank, board) {
        this.x = file;
        this.y = rank;
        this.piece = null;
        this.board = board;
    }
    get rank() {
        return (this.y + 1).toString();
    }
    get file() {
        return FILES[this.x];
    }
    isThreatened(color) {
        return this.board.threatenedSquares[color][this.toString()];
    }
    toString() {
        return this.file + this.rank;
    }
}

export default class Board {
    constructor(gui) {
        this.pieces = [];
        this.piecesByTurn = [[], []];
        this.validMoves = {};
        this.threatenedSquares = [{}, {}];
        this.turn = 0;
        gui.board = this;
        this.gui = gui;
        this.check = null;
        this.initialize();
    }
    emptyGrid() {
        this.grid = [];
        for (let x = 0; x < 8; x++) {
            this.grid[x] = [];
            for (let y = 0; y < 8; y++) {
                this.grid[x][y] = new Square(x, y, this);
            }
        }
    }
    initialize() {
        this.emptyGrid();
        const init = [
            ["0R", "  ", "  ", "  ", "  ", "  ", "  ", "  ",],
            ["0N", "  ", "  ", "  ", "  ", "  ", "  ", "  ",],
            ["0B", "  ", "  ", "  ", "  ", "  ", "  ", "  ",],
            ["0Q", "  ", "  ", "  ", "  ", "  ", "  ", "  ",],
            ["0K", "  ", "  ", "  ", "1K", "  ", "  ", "  ",],
            ["0B", "  ", "  ", "  ", "  ", "  ", "  ", "  ",],
            ["0N", "  ", "  ", "  ", "  ", "  ", "  ", "  ",],
            ["0R", "  ", "  ", "  ", "  ", "  ", "  ", "  ",],
        ]
        // const init = [
        //     ["0R", "0P", "  ", "  ", "  ", "  ", "1P", "1R",],
        //     ["0N", "0P", "  ", "  ", "  ", "  ", "1P", "1N",],
        //     ["0B", "0P", "  ", "  ", "  ", "  ", "1P", "1B",],
        //     ["0Q", "0P", "  ", "  ", "  ", "  ", "1P", "1Q",],
        //     ["0K", "0P", "  ", "  ", "  ", "  ", "1P", "1K",],
        //     ["0B", "0P", "  ", "  ", "  ", "  ", "1P", "1B",],
        //     ["0N", "0P", "  ", "  ", "  ", "  ", "1P", "1N",],
        //     ["0R", "0P", "  ", "  ", "  ", "  ", "1P", "1R",],
        // ]
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = pieces.spawn(init[x][y]);
                if (piece) {
                    piece.board = this;
                    piece.square = this.grid[x][y];
                    this.pieces.push(piece);
                    this.piecesByTurn[piece.color].push(piece);
                    this.piecesByTurn[piece.color].push(piece);
                    this.grid[x][y].piece = piece;
                }
            }
        }
        this.calculateValidMoves();
        this.gui.render(this);
    }
    log() {
        let boardString = "";
        let boardUtf8 = "";
        for (let y = 7; y >= 0; y--) {
            boardString += "\n";
            boardUtf8 += "\n";
            for (let x = 0; x < 8; x++) {
                if (this.grid[x][y].piece) {
                    boardUtf8 += `[${this.grid[x][y].piece.utf8}]`
                } else {
                    boardUtf8 += `[__]`
                }
                boardString += `[${this.grid[x][y].toString()}]`
            }
        }
        console.log(boardString);
        console.log(boardUtf8);
        return boardString;
    }

    validSquare(x, y) {
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            return false;
        }
        return true;
    }
    getSquare(x, y) {
        if (!this.validSquare(x, y)) return null;
        return this.grid[x][y];
    }
    calculateValidMoves() {
        this.validMoves = {};
        this.threatenedSquares = [{}, {}];
        this.pieces.forEach(p => {
            if (!p.onBoard) return;
            p.checkMoves();
            p.threats.forEach(square => {
                let threat = this.threatenedSquares[p.color][square.toString()];
                if (threat) {
                    threat.push(p);
                } else {
                    this.threatenedSquares[p.color][square.toString()] = [p];
                }
            });
        });
        this.validMoves = {};
        this.pieces.forEach(p => {
            if (!p.onBoard) return;
            p.checkMoves();
            p.validMoves.forEach(m => {
                this._disambiguateNotation(m);
            })
        });
        if (this.check && (this.check.color == this.turn)) {
            console.log(this.check);
            console.log(this.turn)
            this.validMoves = this._FilterCheckEscapeMoves(this.validMoves)
        }
        console.log(`${this.turn ? "Black" : "White"} to move.`);
        console.log(Object.keys(this.validMoves));
        return this.validMoves;
    }
    move(notation) {
        notation.trim();
        const move = this.validMoves[notation];
        if (!move) {
            console.log(`${notation} is not a valid move.`);
        } else {
            move.execute();
            this.turn = this.turn ? 0 : 1;
            this.calculateValidMoves();
            this.gui.render(this);
        }
    }
    _FilterCheckEscapeMoves(validMoves) {
        const newValidMoves = {};
        const kingSquare = this.check.square;
        const attackers = kingSquare.isThreatened(this.check.opponentColor);
        for (const [notation, move] of Object.entries(this.validMoves)) {
            // Allow moves if,

            // The move can capture the attacker
            if (attackers.length == 1 && move.capturedPiece == attackers[0]){
                newValidMoves[notation] = move;
            } 
            // The king can move to an unattacked square
            else if (move.piece == this.check) {
                newValidMoves[notation] = move;
            }
            // else if () {

            // }
            // The move blocks the check
        }
        
        return newValidMoves;
    }
    _disambiguateNotation(move) {
        const existingMove = this.validMoves[move.notation];
        if (!existingMove) return this.validMoves[move.notation] = move;
        let prevNotation = existingMove.notation;
        let curNotation = move.notation;
        // Try adding file of the piece making the move
        prevNotation = existingMove.piece.square.file + existingMove.notation
        curNotation = move.piece.square.file + move.notation;
        // If that doesn't work...
        if (prevNotation == curNotation) {
            // Try adding rank
            prevNotation = existingMove.piece.square.rank + existingMove.notation;
            curNotation = move.piece.square.rank + move.notation;
        }
        // Lastly, add file and rank
        if (prevNotation == curNotation) {
            prevNotation = existingMove.piece.square.toString() + existingMove.notation;
            curNotation = move.piece.square.toString() + move.notation;
        }
        if (prevNotation == curNotation) {
            return new Error("Board._disambiguateNotation: Same move recorded twice");
        }
        delete this.validMoves[move.notation];
        existingMove.notation = prevNotation;
        move.notation = curNotation;
        this.validMoves[prevNotation] = existingMove;
        this.validMoves[curNotation] = move;
    }
}