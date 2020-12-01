import Move from './moves.js';

class Piece {
    constructor(color) {
        this.color = color;
        this.hasMoved = false;
        this.board = null;
        this.square = null;
        this.validMoves = [];
        this.threats = []; // Array of squares
        this.onBoard = true;
    }
    get x() {
        return this.square.x;
    }
    get y() {
        return this.square.y;
    }
    get isBlack() {
        return this.color == 1;
    }
    get isWhite() {
        return this.color == 0;
    }
    get opponentColor() {
        return this.color ? 0 : 1;
    }
    get symbol() {
        return this.utf8;
    }
    _addMove(square) {
        if (this.board.turn !== this.color) return;
        const didCapture = square.piece && square.piece.color !== this.color;
        this.validMoves.push(new Move(this, square, didCapture));
    }
    _checkSquareLinear(offsetX, offsetY) {
        let x = this.square.x;
        let y = this.square.y;
        while (true) {
            x += offsetX;
            y += offsetY;
            const square = this.board.getSquare(x, y);
            // If not valid square, break
            if (!square) break;
            // If square has piece...
            this.threats.push(square);
            if (square.piece) {
                // ...and piece is same color
                if (square.piece.color == this.color) {
                    break;
                }
                // if enemy piece, capture and break
                this._addMove(square);
                break;
            } else {
                // If square is valid and has no piece
                // Record move and continue
                this._addMove(square);
            }
        }
    }
}
class Rook extends Piece {
    constructor(color) {
        super(color);
        this.utf8 = ["\u2656", "\u265c"][color];
        this.classes = ["fas", "fa-chess-rook"]
        this.shorthand = "R";
        this.square = null;
    }
    checkMoves() {
        this.validMoves = [];
        this.threats = [];
        // West
        this._checkSquareLinear(-1, 0);
        // East
        this._checkSquareLinear(1, 0);
        // North
        this._checkSquareLinear(0, 1);
        // South
        this._checkSquareLinear(0, -1);
        return this.validMoves;
    }
}
class Knight extends Piece {
    constructor(color) {
        super(color);
        this.utf8 = ["\u2658", "\u265e"][color];
        this.shorthand = "N";
        this.classes = ["fas", "fa-chess-knight"]
    }
    checkMoves() {
        this.validMoves = [];
        this.threats = [];
        [[-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1]]
            .forEach((m) => {
                let x = this.square.x + m[0];
                let y = this.square.y + m[1];
                let square = this.board.getSquare(x, y);
                if (!square) return;
                this.threats.push(square);
                if (!square.piece) {
                    this._addMove(square);
                    return;
                }
                if (square.piece && square.piece.color != this.color) {
                    this._addMove(square);
                }
            })
    }
}
class Bishop extends Piece {
    constructor(color) {
        super(color);
        this.utf8 = ["\u2657", "\u265d"][color];
        this.shorthand = "B";
        this.classes = ["fas", "fa-chess-bishop"]
    }
    checkMoves() {
        this.validMoves = [];
        this.threats = [];
        [[-1, -1], [1, -1], [-1, 1], [1, 1]]
            .forEach((m) => {
                this._checkSquareLinear(m[0], m[1]);
            })
        return this.validMoves;
    }
}
class Queen extends Piece {
    constructor(color) {
        super(color);
        this.utf8 = ["\u2655", "\u265b"][color];
        this.shorthand = "Q";
        this.classes = ["fas", "fa-chess-queen"]
    }
    checkMoves() {
        this.validMoves = [];
        this.threats = [];
        [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
            .forEach((m) => {
                this._checkSquareLinear(m[0], m[1]);
            })
        return this.validMoves;
    }
}
class King extends Piece {
    constructor(color) {
        super(color);
        this.utf8 = ["\u2654", "\u265a"][color];
        this.shorthand = "K";
        this.classes = ["fas", "fa-chess-king"]
    }
    // TODO: Refactor duplicate code into one function
    _checkKingsideCastle() {
        let x = this.square.x;
        let y = this.square.y;
        const rookSquare = this.board.getSquare(x + 1, y);
        const newKingSquare = this.board.getSquare(x + 2, y);
        if (rookSquare.isThreatened(this.opponentColor) || rookSquare.piece) return;
        if (newKingSquare.isThreatened(this.opponentColor) || newKingSquare.piece) return;
        const rook = this.board.getSquare(x + 3, y).piece;
        if (!rook || rook.hasMoved || rook.color !== this.color) return;
        const castle = {side: 1, rook, rookSquare}
        this.validMoves.push(new Move(this, newKingSquare, false, {castle}));
    }
    _checkQueensideCastle() {
        let x = this.square.x;
        let y = this.square.y;
        const rookSquare = this.board.getSquare(x - 1, y);
        const newKingSquare = this.board.getSquare(x - 2, y);
        if (rookSquare.isThreatened(this.opponentColor) || rookSquare.piece) return;
        if (newKingSquare.isThreatened(this.opponentColor) || newKingSquare.piece) return;
        if (this.board.getSquare(x - 3, y).piece) return;
        const rook = this.board.getSquare(x - 4, y).piece;
        if (!rook || rook.hasMoved || rook.color !== this.color) return;
        const castle = {side: 2, rook, rookSquare}
        this.validMoves.push(new Move(this, newKingSquare, false, {castle}));
    }
    _checkCastle() {
        if ((this.board.turn !== this.color) || this.hasMoved || this.square.isThreatened(this.opponentColor)) return;
        this._checkKingsideCastle();
        this._checkQueensideCastle();
    }
    checkMoves() {;
        if(this.square.isThreatened(this.opponentColor)) {
            this.board.check = this;
            console.log("Check");
        }
        this.validMoves = [];
        this.threats = [];
        [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
            .forEach((m) => {
                let x = this.square.x + m[0];
                let y = this.square.y + m[1];
                let square = this.board.getSquare(x, y);
                if (!square) return;
                this.threats.push(square);
                if (square.isThreatened(this.opponentColor)) return;
                if (!square.piece) {
                    this._addMove(square);
                    return;
                }
                if (square.piece && square.piece.color !== this.color) {
                    this._addMove(square);
                }
            })
        this._checkCastle();
    }
}
class Pawn extends Piece {
    constructor(color) {
        super(color);
        this.utf8 = ["\u2659", "\u265f"][color];
        this.shorthand = "";
        this.classes = ["fas", "fa-chess-pawn"]
    }
    // Check one square ahead, no pieces
    checkForward() {
        let x = this.square.x;
        let y = this.square.y;
        if (this.isBlack) y--;
        if (this.isWhite) y++;
        let square = this.board.getSquare(x, y);
        if (square && !square.piece) {
            this._addMove(square);
        }
    }
    // Check two squares ahead, no pieces
    checkPawnPower() {
        if (this.hasMoved) return;
        let x = this.square.x;
        let y = this.square.y;
        if (this.isBlack) y -= 2;
        if (this.isWhite) y += 2;
        let square = this.board.getSquare(x, y);
        if (square && !square.piece) {
            this._addMove(square);
        }
    }
    _checkPawnAttackSquare(offsetX) {
        let x = this.square.x + offsetX;
        let y = this.square.y + (this.isWhite ? 1 : -1);
        let square = this.board.getSquare(x, y);
        if (!square) return;
        this.threats.push(square);
        if (square.piece && square.piece.color !== this.color) {
            this._addMove(square);
        }
    }
    checkAttack() {
        this._checkPawnAttackSquare(1); // Right
        this._checkPawnAttackSquare(-1) // Left
    }
    // Check 
    checkMoves() {
        this.validMoves = [];
        this.threats = [];
        this.checkForward();
        // Check two squares ahead, if not moved
        this.checkPawnPower();
        // Check diagonals one square, opponent pieces
        this.checkAttack()
    }
}

// Encapsulates all the derived class constructors
export default class Pieces {
    constructor() {
        this.dict = {
            "0R": () => new Rook(0),
            "0B": () => new Bishop(0),
            "0N": () => new Knight(0),
            "0Q": () => new Queen(0),
            "0K": () => new King(0),
            "0P": () => new Pawn(0),
            "1R": () => new Rook(1),
            "1B": () => new Bishop(1),
            "1N": () => new Knight(1),
            "1Q": () => new Queen(1),
            "1K": () => new King(1),
            "1P": () => new Pawn(1),
        }
    }
    spawn(shorthand) {
        if (this.dict[shorthand]) {
            return this.dict[shorthand]();
        }
        return null;
    }
}