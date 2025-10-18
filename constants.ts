import type { Level } from './types';

export const CELL_SIZE = 80; // in pixels

export const LEVELS: Level[] = [
    {
        id: 1,
        grid: { rows: 3, cols: 3 },
        parMoves: 1,
        parTimeSec: 60,
        pegs: [
            { id: "A1", pair: "A", color: "#3498DB", row: 1, col: 1, locked: true, moveRule: 'rook' },
            { id: "A2", pair: "A", color: "#3498DB", row: 3, col: 3, locked: true, moveRule: 'rook' },
            { id: "B1", pair: "B", color: "#E74C3C", row: 1, col: 3, locked: true, moveRule: 'rook' },
            { id: "B2", pair: "B", color: "#E74C3C", row: 3, col: 1, locked: false, moveRule: 'knight' },
        ],
    },
    {
        id: 2,
        grid: { rows: 4, cols: 4 },
        parMoves: 2,
        parTimeSec: 60,
        pegs: [
            { id: "A1", pair: "A", color: "#3498DB", row: 1, col: 1, locked: false, moveRule: 'rook' },
            { id: "A2", pair: "A", color: "#3498DB", row: 4, col: 4, locked: false, moveRule: 'rook' },
            { id: "B1", pair: "B", color: "#E74C3C", row: 1, col: 4, locked: false, moveRule: 'rook' },
            { id: "B2", pair: "B", color: "#E74C3C", row: 4, col: 1, locked: false, moveRule: 'rook' },
        ],
    },
    {
        id: 3,
        grid: { rows: 5, cols: 5 },
        parMoves: 4,
        parTimeSec: 120,
        pegs: [
            { id: "A1", pair: "A", color: "#9B59B6", row: 1, col: 1, locked: false, moveRule: 'bishop' },
            { id: "A2", pair: "A", color: "#9B59B6", row: 5, col: 5, locked: true, moveRule: 'bishop' },
            { id: "B1", pair: "B", color: "#2ECC71", row: 1, col: 5, locked: false, moveRule: 'bishop' },
            { id: "B2", pair: "B", color: "#2ECC71", row: 5, col: 1, locked: false, moveRule: 'bishop' },
            { id: "C1", pair: "C", color: "#F1C40F", row: 3, col: 2, locked: false, moveRule: 'rook' },
            { id: "C2", pair: "C", color: "#F1C40F", row: 3, col: 4, locked: false, moveRule: 'rook' }
        ],
    },
    {
        id: 4,
        grid: { rows: 5, cols: 5 },
        parMoves: 5,
        parTimeSec: 150,
        pegs: [
            { id: "A1", pair: "A", color: "#1ABC9C", row: 3, col: 1, locked: true, moveRule: 'queen' },
            { id: "A2", pair: "A", color: "#1ABC9C", row: 3, col: 5, locked: true, moveRule: 'queen' },
            { id: "B1", pair: "B", color: "#E67E22", row: 1, col: 3, locked: false, moveRule: 'knight' },
            { id: "B2", pair: "B", color: "#E67E22", row: 5, col: 3, locked: false, moveRule: 'knight' },
            { id: "C1", pair: "C", color: "#3498DB", row: 2, col: 2, locked: false, moveRule: 'bishop' },
            { id: "C2", pair: "C", color: "#3498DB", row: 4, col: 4, locked: false, moveRule: 'bishop' },
        ]
    },
    {
        id: 5,
        grid: { rows: 5, cols: 5 },
        parMoves: 4,
        parTimeSec: 180,
        pegs: [
            { id: "A1", pair: "A", color: "#3498DB", row: 1, col: 1, locked: false, moveRule: 'rook' },
            { id: "A2", pair: "A", color: "#3498DB", row: 5, col: 5, locked: false, moveRule: 'rook' },
            { id: "B1", pair: "B", color: "#E74C3C", row: 1, col: 5, locked: false, moveRule: 'bishop' },
            { id: "B2", pair: "B", color: "#E74C3C", row: 5, col: 1, locked: false, moveRule: 'bishop' },
            { id: "C1", pair: "C", color: "#2ECC71", row: 1, col: 3, locked: false, fragileMovesLeft: 2, moveRule: 'king', link: { targetId: "C2", linkType: "symmetric_y" } },
            { id: "C2", pair: "C", color: "#2ECC71", row: 5, col: 3, locked: false, fragileMovesLeft: 2, moveRule: 'king', link: { targetId: "C1", linkType: "symmetric_y" } },
        ],
        blocked: [{ row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }],
    },
    {
        id: 6,
        grid: { rows: 6, cols: 6 },
        parMoves: 7,
        parTimeSec: 240,
        pegs: [
            { id: "A1", pair: "A", color: "#9B59B6", row: 1, col: 1, locked: true, moveRule: 'queen' },
            { id: "A2", pair: "A", color: "#9B59B6", row: 6, col: 6, locked: false, moveRule: 'bishop', fragileMovesLeft: 3 },
            { id: "B1", pair: "B", color: "#E74C3C", row: 1, col: 6, locked: true, moveRule: 'queen' },
            { id: "B2", pair: "B", color: "#E74C3C", row: 6, col: 1, locked: true, moveRule: 'queen' },
            { id: "C1", pair: "C", color: "#3498DB", row: 3, col: 2, locked: false, moveRule: 'rook' },
            { id: "C2", pair: "C", color: "#3498DB", row: 4, col: 5, locked: false, moveRule: 'rook' },
            { id: "D1", pair: "D", color: "#F1C40F", row: 2, col: 4, locked: false, moveRule: 'knight' },
            { id: "D2", pair: "D", color: "#F1C40F", row: 5, col: 3, locked: false, moveRule: 'knight' },
        ]
    },
    {
        id: 7,
        grid: { rows: 6, cols: 6 },
        parMoves: 9,
        parTimeSec: 300,
        pegs: [
            { id: "A1", pair: "A", color: "#1ABC9C", row: 1, col: 3, locked: true, moveRule: 'rook' },
            { id: "A2", pair: "A", color: "#1ABC9C", row: 6, col: 4, locked: true, moveRule: 'rook' },
            { id: "B1", pair: "B", color: "#e91e63", row: 3, col: 1, locked: true, moveRule: 'bishop' },
            { id: "B2", pair: "B", color: "#e91e63", row: 4, col: 6, locked: true, moveRule: 'bishop' },
            { id: "C1", pair: "C", color: "#3498DB", row: 3, col: 3, locked: false, moveRule: 'knight' },
            { id: "C2", pair: "C", color: "#3498DB", row: 4, col: 4, locked: false, moveRule: 'queen' },
            { id: "D1", pair: "D", color: "#E74C3C", row: 2, col: 2, locked: false, moveRule: 'king', link: { targetId: "D2", linkType: "symmetric_center" } },
            { id: "D2", pair: "D", color: "#E74C3C", row: 5, col: 5, locked: false, moveRule: 'king', link: { targetId: "D1", linkType: "symmetric_center" } },
        ],
    },
    {
        id: 8,
        grid: { rows: 7, cols: 7 },
        parMoves: 14,
        parTimeSec: 400,
        pegs: [
            { id: "A1", pair: "A", color: "#3498DB", row: 1, col: 4, locked: true, moveRule: 'king' },
            { id: "A2", pair: "A", color: "#3498DB", row: 7, col: 4, locked: false, moveRule: 'rook' },
            { id: "B1", pair: "B", color: "#E74C3C", row: 4, col: 1, locked: false, fragileMovesLeft: 3, moveRule: 'king' },
            { id: "B2", pair: "B", color: "#E74C3C", row: 4, col: 7, locked: true, moveRule: 'king' },
            { id: "C1", pair: "C", color: "#2ECC71", row: 1, col: 1, locked: false, moveRule: 'knight' },
            { id: "C2", pair: "C", color: "#2ECC71", row: 6, col: 6, locked: false, moveRule: 'bishop' },
            { id: "D1", pair: "D", color: "#F1C40F", row: 2, col: 6, locked: false, moveRule: 'queen' },
            { id: "D2", pair: "D", "color": "#F1C40F", row: 6, col: 2, locked: false, moveRule: 'queen' },
            { id: "E1", pair: "E", color: "#9B59B6", row: 2, col: 2, locked: false, moveRule: 'bishop' },
            { id: "E2", pair: "E", color: "#9B59B6", row: 5, col: 5, locked: false, moveRule: 'knight' },
        ],
        blocked: [{ row: 4, col: 4 }],
    },
    {
        id: 9,
        grid: { rows: 7, cols: 7 },
        parMoves: 10,
        parTimeSec: 350,
        pegs: [
            { id: "A1", pair: "A", color: "#e91e63", row: 4, col: 4, locked: false, fragileMovesLeft: 1, moveRule: 'knight' },
            { id: "A2", pair: "A", color: "#e91e63", row: 1, col: 1, locked: false, moveRule: 'queen' },
            { id: "B1", pair: "B", color: "#00BCD4", row: 2, col: 4, locked: false, fragileMovesLeft: 2, moveRule: 'rook' },
            { id: "B2", pair: "B", color: "#00BCD4", row: 6, col: 4, locked: false, moveRule: 'bishop' },
            { id: "C1", pair: "C", color: "#8BC34A", row: 4, col: 2, locked: true, moveRule: 'rook' },
            { id: "C2", pair: "C", color: "#8BC34A", row: 4, col: 6, locked: true, moveRule: 'rook' },
            { id: "D1", pair: "D", color: "#FF9800", row: 2, col: 2, locked: false, moveRule: 'king', link: { targetId: "E1", linkType: 'symmetric_x' } },
            { id: "D2", pair: "D", color: "#FF9800", row: 6, col: 6, locked: false, moveRule: 'bishop' },
            { id: "E1", pair: "E", color: "#673AB7", row: 2, col: 6, locked: false, moveRule: 'king', link: { targetId: "D1", linkType: 'symmetric_x' } },
            { id: "E2", pair: "E", color: "#673AB7", row: 6, col: 2, locked: false, moveRule: 'bishop' },
        ]
    },
    {
        id: 10,
        grid: { rows: 7, cols: 7 },
        parMoves: 12,
        parTimeSec: 420,
        pegs: [
            { id: "A1", pair: "A", color: "#FF5722", row: 1, col: 1, locked: false, moveRule: 'queen', link: { targetId: "B1", linkType: "symmetric_center"} },
            { id: "A2", pair: "A", color: "#FF5722", row: 4, col: 3, locked: false, moveRule: 'knight' },
            { id: "B1", pair: "B", color: "#4CAF50", row: 7, col: 7, locked: false, moveRule: 'queen', link: { targetId: "A1", linkType: "symmetric_center"} },
            { id: "B2", pair: "B", color: "#4CAF50", row: 3, col: 4, locked: false, moveRule: 'knight' },
            { id: "C1", pair: "C", color: "#2196F3", row: 1, col: 4, locked: false, moveRule: 'rook', link: { targetId: "D1", linkType: "symmetric_y"} },
            { id: "C2", pair: "C", color: "#2196F3", row: 5, col: 4, locked: false, moveRule: 'bishop' },
            { id: "D1", pair: "D", color: "#FFC107", row: 7, col: 4, locked: false, moveRule: 'rook', link: { targetId: "C1", linkType: "symmetric_y"} },
            { id: "D2", pair: "D", color: "#FFC107", row: 4, col: 5, locked: false, moveRule: 'bishop' },
        ],
        blocked: [{ row: 2, col: 2 }, { row: 2, col: 6 }, { row: 6, col: 2 }, { row: 6, col: 6 }, { row: 4, col: 4}],
    }
];