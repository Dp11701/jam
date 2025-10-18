import React from 'react';
import type { Level } from '../types';

interface LevelSelectModalProps {
    isOpen: boolean;
    levels: Level[];
    onSelectLevel: (index: number) => void;
    onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({ isOpen, levels, onSelectLevel, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 w-full max-w-lg text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-header)' }}>Select a Level</h2>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto pr-2">
                    {levels.map((level, index) => (
                        <button
                            key={level.id}
                            onClick={() => onSelectLevel(index)}
                            className="aspect-square flex items-center justify-center bg-slate-700 rounded-lg text-2xl font-bold transition-all duration-200 transform hover:scale-110 shadow-md"
                             // Fix: Cast style object to React.CSSProperties to allow for custom properties.
                             style={{ '--hover-bg': 'var(--color-level-select-hover)' } as React.CSSProperties}
                             onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                             onMouseOut={e => e.currentTarget.style.backgroundColor = ''}
                        >
                            {level.id}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
