export default class Move {
    constructor(piece, square, didCapturePiece = false, o = {
        castle: {
            side: 0,
            rook: null,
            rookSquare: null,
        },
        enPassant: null,
        check: false,
    }) {
        this.piece = piece;
        this.from = piece.square;
        this.square = square;
        this.castle = o.castle;
        this.capturesKing = didCapturePiece && this.square.piece.shorthand == "K";
        if (o.enPassant) {
            this.capturedPiece = o.enPassant;
        } else {
            this.capturedPiece = didCapturePiece ? square.piece : null;
        }
        this.generateNotation();
    }
    generateNotation() {
        let notation = "";
        switch (this.castle.side) {
            case (0):
                // Add shorthand for piece
                notation += this.piece.shorthand || "";
                // Add x if captured piece
                notation += this.capturedPiece ? "x" : "";
                // Add Piece Name
                notation += this.square.toString();
                break;
            case (1):
                notation = "O-O";
                break;
            case (2):
                notation = "O-O-O";
                break;
            default:
                return new Error("Move: Invalid castle argument");
        }
        return this.notation = notation;
    }
    executeCastle() {
        const {rook, rookSquare} = this.castle;
        // Move King
        this.from.piece = null;
        this.square.piece = this.piece;
        this.piece.square = this.square;
        this.piece.hasMoved = true;

        // Move rook to the new square
        rook.square.piece = null;
        rook.square = rookSquare;
        rookSquare.piece = rook;
        rook.hasMoved = true;
    }
    execute() {
        console.log(`${this.piece.color ? "Black: " : "White: "}${this.notation}`)
        switch (this.castle.side) {
            case (0):
                this.from.piece = null;
                this.square.piece = this.piece;
                this.piece.square = this.square;
                this.piece.hasMoved = true;
                if (this.didCapturePiece) {
                    this.capturedPiece.onBoard = false;
                }
                break;
            case (1):
            case (2):
                this.executeCastle();
        }
    }
}