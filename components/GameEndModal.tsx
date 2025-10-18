import React from 'react';
import type { GameStatus, LoseReason } from '../types';
import { StarIcon } from './icons';

interface GameEndModalProps {
    status: GameStatus;
    moves: number;
    parMoves: number;
    timeRemaining: number;
    parTimeSec: number;
    onNextLevel: () => void;
    onRetry: () => void;
    loseReason?: LoseReason;
}

const StarRating: React.FC<{ count: number }> = ({ count }) => (
    <div className="flex justify-center gap-2">
        {[1, 2, 3].map(i => (
            <StarIcon key={i} className={`w-12 h-12 transition-all duration-300 ${i <= count ? 'text-yellow-400 scale-110' : 'text-slate-600'}`} />
        ))}
    </div>
);


export const GameEndModal: React.FC<GameEndModalProps> = ({ status, moves, parMoves, timeRemaining, parTimeSec, onNextLevel, onRetry, loseReason }) => {
    if (status === 'playing') return null;

    const isWin = status === 'won';
    let stars = 0;
    if (isWin) {
        stars = 1;
        if (moves <= parMoves) stars++;
        if (timeRemaining >= parTimeSec * 0.3) stars++;
    }

    const title = isWin 
        ? 'Level Complete!' 
        : loseReason === 'moves'
        ? 'Out of Moves!'
        : 'Time\'s Up!';
    const titleColor = isWin ? 'text-green-400' : 'text-red-500';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 w-full max-w-md text-center animate-fade-in-up">
                <h2 className={`text-4xl font-bold mb-4 ${titleColor}`}>{title}</h2>

                {isWin && (
                    <div className="mb-6">
                        <StarRating count={stars} />
                    </div>
                )}

                <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left space-y-2">
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-slate-400">Moves:</span>
                        <span className={`font-bold ${moves > parMoves ? 'text-yellow-400' : 'text-white'}`}>{moves} / {parMoves}</span>
                    </div>
                     <div className="flex justify-between items-center text-lg">
                        <span className="text-slate-400">Time Used:</span>
                        <span className="font-bold">{parTimeSec - timeRemaining}s</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    {isWin ? (
                         <button onClick={onNextLevel} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">
                            Next Level
                        </button>
                    ) : (
                         <button onClick={onRetry} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">
                            Retry
                        </button>
                    )}
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </div>
    );
};