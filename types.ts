export interface Point {
    x: number;
    y: number;
}

export type MoveRule = 'rook' | 'bishop' | 'knight' | 'king' | 'queen';

export interface PegData {
    id: string;
    pair: string;
    color: string;
    row: number; // 1-based
    col: number; // 1-based
    locked: boolean;
    moveRule: MoveRule;
    fragileMovesLeft?: number;
    link?: {
        targetId: string;
        linkType: 'symmetric_center' | 'symmetric_x' | 'symmetric_y';
    };
}

export interface BlockedCell {
    row: number; // 1-based
    col: number; // 1-based
}

export interface Grid {
    rows: number;
    cols: number;
}

export interface Level {
    id: number;
    grid: Grid;
    parMoves: number;
    parTimeSec: number;
    pegs: PegData[];
    blocked?: BlockedCell[];
}

export type GameStatus = 'playing' | 'won' | 'lost';
export type LoseReason = 'time' | 'moves';

export interface GameState {
    pegs: PegData[];
    moves: number;
    timeRemaining: number;
    status: GameStatus;
    ropeOrder: string[];
    loseReason?: LoseReason;
}

export type PowerUpType = 'cut' | 'freeze' | 'unlock';

export interface PowerUpState {
    cut: number;
    freeze: number;
    unlock: number;
}

export type Theme = 'default' | 'noel' | 'halloween' | 'raining';