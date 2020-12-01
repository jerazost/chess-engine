import Board from "./board.js";
import GUI from "./gui.js";

// TODO: Check
// 1. Flag a direct check [x]
// 2. Flag a revealed check
// 3. Filter moves that don't escape check [?] (Need to simulate second board state)

// TODO: Checkmate
// TODO: En Passant
const gui = new GUI();
const board = new Board(gui);
const queenSideCastle = ["e4", "e5", "Qf3", "Nc6", "d4", "d6", "Bf4", "Nf6", "Nc3", "g6"];
const disambiguation = ["e4", "e5", "d4", "d6", "f4", "f6"];
const gameNotation = [];

gameNotation.forEach(m => {
    board.move(m);
});