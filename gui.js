export default class GUI {
    constructor() {
        this.board = null;
        this.highlightedSquares = {};
        this.activePiece = null;
    }
    renderBoard() {
        const board = document.getElementById("board");
        board.innerHTML = "";
        for (let y = 7; y >= 0; y--) {
            for (let x = 0; x < 8; x++) {
                const square = this.board.grid[x][y];
                const piece = square.piece;
                const squareNode = document.createElement('i');
                if (((x % 2) == 0) == ((y % 2) == 0)) {
                    squareNode.classList.add("dark");
                } else {
                    squareNode.classList.add("light");
                }
                if (this.highlightedSquares[square.toString()]) {
                    squareNode.classList.add("highlighted");
                }
                if (piece) {
                    squareNode.classList.add(piece.classes[0]);
                    squareNode.classList.add(piece.classes[1]);
                    if (piece.isBlack) {
                        squareNode.classList.add("black");
                    } else {
                        squareNode.classList.add("white");
                    }
                }
                squareNode.addEventListener('click', this.onClickSquare(square));
                board.appendChild(squareNode);
            }
        }
    }
    applyHighlights() {
        if (!this.activePiece) return;
        this.activePiece.validMoves.forEach(m => {
            if(this.board.validMoves[m.notation]) {
                this.highlightedSquares[m.square.toString()] = m;
            }
        });
    }
    onClickSquare(square) {
        return (e) => {
            // If no piece is active and piece is on the square, activate piece
            if (!this.activePiece && square.piece) {
                if (square.piece.color !== this.board.turn) return;
                this.activePiece = square.piece;
                console.log("Active: " + this.activePiece.symbol);
                this.render();
                return;
            }
            // If piece is active, attempt a move
            if (this.activePiece) {
                const move = this.highlightedSquares[square.toString()];
                if (move) {
                    this.board.move(move.notation);
                    this.activePiece = null;
                } else if (square.piece && square.piece.color === this.board.turn) {
                    this.activePiece = square.piece;
                    console.log("Active: " + this.activePiece.symbol);
                } else {
                    this.activePiece = null;
                }
                this.highlightedSquares = {};
                this.render();
            }
            
        }
    }
    render() {
        this.applyHighlights();
        this.renderBoard();
    }
} 