import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { PegData, Level, Point, PowerUpType, MoveRule } from "../types";
import { CELL_SIZE } from "../constants";
import {
  LockIcon,
  RookIcon,
  BishopIcon,
  KnightIcon,
  KingIcon,
  QueenIcon,
  LinkIcon,
} from "./icons";
import { NeonGridBackground } from "./NeonGridBackground";

interface GameBoardProps {
  level: Level;
  pegs: PegData[];
  ropeOrder: string[];
  onPegMove: (peg: PegData, newRow: number, newCol: number) => void;
  isInteractionDisabled: boolean;
  onInteraction: () => void;
  onInvalidMove: () => void;
  activePowerUp: PowerUpType | null;
  onUseCut: (pairId: string) => void;
  onUseUnlock: (pegId: string) => void;
}

const DAMPING_FACTOR = 0.2;
const RETURN_ANIMATION_DURATION = 200; // in ms

const MoveRuleIcon: React.FC<{ rule: MoveRule }> = ({ rule }) => {
  const iconProps = { className: "w-8 h-8 text-black/70" };
  switch (rule) {
    case "rook":
      return <img src="/assets/car.svg" alt="Rook" className="w-8 h-8" />;
    case "bishop":
      return (
        <img src="/assets/elephant.svg" alt="Bishop" className="w-8 h-8" />
      );
    case "knight":
      return <img src="/assets/horse.svg" alt="Knight" className="w-8 h-8" />;
    case "king":
      return <img src="/assets/king.svg" alt="King" className="w-8 h-8" />;
    case "queen":
      return <img src="/assets/queen.svg" alt="Queen" className="w-8 h-8" />;
    default:
      return null;
  }
};

const Peg: React.FC<{ peg: PegData; activePowerUp: PowerUpType | null }> = ({
  peg,
  activePowerUp,
}) => {
  const getCursorStyle = () => {
    if (activePowerUp === "cut") return "crosshair";
    if (activePowerUp === "unlock" && peg.locked && peg.fragileMovesLeft !== 0)
      return "pointer";
    if (peg.locked) return "not-allowed";
    return "grab";
  };

  const isFragileAndActive =
    typeof peg.fragileMovesLeft === "number" && peg.fragileMovesLeft > 0;

  return (
    <div
      className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-150 ease-in-out select-none shadow-lg z-20`}
      style={{
        left: (peg.col - 1) * CELL_SIZE + CELL_SIZE / 2 - 24,
        top: (peg.row - 1) * CELL_SIZE + CELL_SIZE / 2 - 24,
        backgroundColor: peg.color,
        cursor: getCursorStyle(),
        border: `4px solid rgba(255, 255, 255, 0.7)`,
        boxShadow: isFragileAndActive ? `0 0 15px ${peg.color}` : "none",
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <MoveRuleIcon rule={peg.moveRule} />
        {peg.locked && <LockIcon className="absolute w-6 h-6 text-white" />}
        {isFragileAndActive && !peg.locked && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
            {peg.fragileMovesLeft}
          </span>
        )}
        {peg.link && !peg.locked && (
          <LinkIcon
            className={`w-5 h-5 absolute bottom-0 right-0 text-white/70`}
          />
        )}
      </div>
    </div>
  );
};

const GhostPeg: React.FC<{ peg: PegData; position: Point }> = ({
  peg,
  position,
}) => {
  const isFragileAndActive =
    typeof peg.fragileMovesLeft === "number" && peg.fragileMovesLeft > 0;

  return (
    <div
      className="absolute w-12 h-12 rounded-full flex items-center justify-center z-40 pointer-events-none"
      style={{
        left: position.x - 24,
        top: position.y - 24,
        backgroundColor: peg.color,
        border: `4px solid rgba(255, 255, 255, 0.7)`,
        transform: "scale(1.25)",
        boxShadow: isFragileAndActive
          ? `0 0 25px ${peg.color}`
          : "0 0 20px rgba(0,0,0,0.5)",
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <MoveRuleIcon rule={peg.moveRule} />
        {peg.locked && <LockIcon className="absolute w-6 h-6 text-white" />}
        {isFragileAndActive && !peg.locked && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
            {peg.fragileMovesLeft}
          </span>
        )}
        {peg.link && !peg.locked && (
          <LinkIcon
            className={`w-5 h-5 absolute bottom-0 right-0 text-white/70`}
          />
        )}
      </div>
    </div>
  );
};

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  pegs,
  ropeOrder,
  onPegMove,
  isInteractionDisabled,
  onInteraction,
  onInvalidMove,
  activePowerUp,
  onUseCut,
  onUseUnlock,
}) => {
  const [dragState, setDragState] = useState<{
    peg: PegData;
    pos: Point;
    targetPos: Point;
    mode: "dragging" | "returning";
    returnTo: Point;
    returnFrom: Point;
    returnStartTime: number;
  } | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<
    { row: number; col: number; isLinked: boolean }[]
  >([]);
  const validMovesRef = useRef<{ row: number; col: number }[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const boardWidth = level.grid.cols * CELL_SIZE;
  const boardHeight = level.grid.rows * CELL_SIZE;

  const isCellOccupied = useCallback(
    (
      row: number,
      col: number,
      pegIdToIgnore?: string,
      secondPegIdToIgnore?: string
    ) => {
      return (
        pegs.some(
          (p) =>
            p.id !== pegIdToIgnore &&
            p.id !== secondPegIdToIgnore &&
            p.row === row &&
            p.col === col
        ) || level.blocked?.some((b) => b.row === row && b.col === col)
      );
    },
    [pegs, level.blocked]
  );

  const getPegCenter = useCallback(
    (row: number, col: number): Point => ({
      x: (col - 1) * CELL_SIZE + CELL_SIZE / 2,
      y: (row - 1) * CELL_SIZE + CELL_SIZE / 2,
    }),
    []
  );

  const getLinkedPos = (
    row: number,
    col: number,
    linkType: PegData["link"]["linkType"]
  ) => {
    const { rows, cols } = level.grid;
    switch (linkType) {
      case "symmetric_center":
        return { row: rows + 1 - row, col: cols + 1 - col };
      case "symmetric_x":
        return { row: row, col: cols + 1 - col };
      case "symmetric_y":
        return { row: rows + 1 - row, col: col };
    }
  };

  const getValidMoves = useCallback(
    (peg: PegData): { row: number; col: number }[] => {
      let potentialMoves: { row: number; col: number }[] = [];
      const { row: startRow, col: startCol } = peg;

      const addMovesInDirections = (
        directions: number[][],
        singleStep: boolean
      ) => {
        for (const [dr, dc] of directions) {
          for (let i = 1; ; i++) {
            const newRow = startRow + i * dr;
            const newCol = startCol + i * dc;
            if (
              newRow < 1 ||
              newRow > level.grid.rows ||
              newCol < 1 ||
              newCol > level.grid.cols
            )
              break;
            if (isCellOccupied(newRow, newCol)) break;
            potentialMoves.push({ row: newRow, col: newCol });
            if (singleStep) break;
          }
        }
      };

      switch (peg.moveRule) {
        case "knight":
          const knightOffsets = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1],
          ];
          for (const [dr, dc] of knightOffsets) {
            const newRow = startRow + dr;
            const newCol = startCol + dc;
            if (
              newRow >= 1 &&
              newRow <= level.grid.rows &&
              newCol >= 1 &&
              newCol <= level.grid.cols
            )
              potentialMoves.push({ row: newRow, col: newCol });
          }
          break;
        case "rook":
          addMovesInDirections(
            [
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
            ],
            false
          );
          break;
        case "bishop":
          addMovesInDirections(
            [
              [-1, -1],
              [-1, 1],
              [1, -1],
              [1, 1],
            ],
            false
          );
          break;
        case "king":
          addMovesInDirections(
            [
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -1],
              [0, 1],
              [1, -1],
              [1, 0],
              [1, 1],
            ],
            true
          );
          break;
        case "queen":
          addMovesInDirections(
            [
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -1],
              [0, 1],
              [1, -1],
              [1, 0],
              [1, 1],
            ],
            false
          );
          break;
      }

      const linkedPeg = peg.link
        ? pegs.find((p) => p.id === peg.link!.targetId)
        : null;

      return potentialMoves.filter((move) => {
        const primaryOccupied = isCellOccupied(
          move.row,
          move.col,
          peg.id,
          linkedPeg?.id
        );
        if (primaryOccupied) return false;

        if (linkedPeg && peg.link) {
          const { row: linkedRow, col: linkedCol } = getLinkedPos(
            move.row,
            move.col,
            peg.link.linkType
          );
          if (
            linkedRow < 1 ||
            linkedRow > level.grid.rows ||
            linkedCol < 1 ||
            linkedCol > level.grid.cols
          )
            return false;
          const linkedOccupied = isCellOccupied(
            linkedRow,
            linkedCol,
            peg.id,
            linkedPeg.id
          );
          return !linkedOccupied;
        }

        return true;
      });
    },
    [level.grid, isCellOccupied, pegs]
  );

  const renderedRopes = useMemo(() => {
    const pairs: Record<string, PegData[]> = {};
    pegs.forEach((peg) => {
      if (!pairs[peg.pair]) pairs[peg.pair] = [];
      pairs[peg.pair].push(peg);
    });

    const allRopes = Object.values(pairs)
      .filter((p) => p.length === 2)
      .map((pair) => {
        const isDraggingThisPair =
          dragState && pair.some((p) => p.id === dragState.peg.id);

        let p1: Point, p2: Point;

        if (isDraggingThisPair) {
          const staticPeg = pair.find((p) => p.id !== dragState!.peg.id)!;
          p1 = getPegCenter(staticPeg.row, staticPeg.col);
          p2 = dragState!.pos;
          if (pair[0].id !== staticPeg.id) {
            [p1, p2] = [p2, p1];
          }
        } else {
          p1 = getPegCenter(pair[0].row, pair[0].col);
          p2 = getPegCenter(pair[1].row, pair[1].col);
        }

        const isFragile =
          typeof pair[0].fragileMovesLeft === "number" &&
          pair[0].fragileMovesLeft > 0;

        return {
          id: pair[0].pair,
          p1,
          p2,
          color: pair[0].color,
          isDragging: !!isDraggingThisPair,
          isFragile: isFragile,
        };
      });

    allRopes.sort((a, b) => ropeOrder.indexOf(a.id) - ropeOrder.indexOf(b.id));

    if (dragState) {
      const draggedRopeIndex = allRopes.findIndex(
        (r) => r.id === dragState.peg.pair
      );
      if (draggedRopeIndex > -1) {
        const [draggedRope] = allRopes.splice(draggedRopeIndex, 1);
        allRopes.push(draggedRope);
      }
    }

    return allRopes;
  }, [pegs, dragState, getPegCenter, ropeOrder]);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    peg: PegData
  ) => {
    onInteraction();

    if (activePowerUp) {
      if (activePowerUp === "cut") {
        onUseCut(peg.pair);
        return;
      }
      if (
        activePowerUp === "unlock" &&
        peg.locked &&
        peg.fragileMovesLeft !== 0
      ) {
        onUseUnlock(peg.id);
        return;
      }
      return;
    }

    if (peg.locked || isInteractionDisabled || dragState) return;

    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const moves = getValidMoves(peg);
    validMovesRef.current = moves;

    const highlights: { row: number; col: number; isLinked: boolean }[] = [];
    moves.forEach((move) => {
      highlights.push({ ...move, isLinked: false });
      if (peg.link) {
        const linkedPos = getLinkedPos(move.row, move.col, peg.link.linkType);
        highlights.push({ ...linkedPos, isLinked: true });
      }
    });
    setHighlightedCells(highlights);

    const startPos = getPegCenter(peg.row, peg.col);
    const cursorX = e.clientX - boardRect.left;
    const cursorY = e.clientY - boardRect.top;

    setDragState({
      peg: peg,
      pos: startPos,
      targetPos: { x: cursorX, y: cursorY },
      mode: "dragging",
      returnTo: startPos,
      returnFrom: startPos,
      returnStartTime: 0,
    });

    e.currentTarget.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState || dragState.mode !== "dragging") return;
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;
    const x = e.clientX - boardRect.left;
    const y = e.clientY - boardRect.top;
    setDragState((prev) => (prev ? { ...prev, targetPos: { x, y } } : null));
  };

  const handleMouseUp = () => {
    if (!dragState || dragState.mode !== "dragging") return;

    const { peg, pos } = dragState;
    setHighlightedCells([]);

    const col = Math.round(pos.x / CELL_SIZE - 0.5) + 1;
    const row = Math.round(pos.y / CELL_SIZE - 0.5) + 1;

    const targetCol = Math.max(1, Math.min(level.grid.cols, col));
    const targetRow = Math.max(1, Math.min(level.grid.rows, row));

    const isValid = validMovesRef.current.some(
      (move) => move.row === targetRow && move.col === targetCol
    );

    if (isValid) {
      onPegMove(peg, targetRow, targetCol);
      setDragState(null);
    } else {
      onInvalidMove();
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              mode: "returning",
              returnFrom: prev.pos,
              returnTo: getPegCenter(peg.row, peg.col),
              returnStartTime: Date.now(),
            }
          : null
      );
    }
    validMovesRef.current = [];
  };

  useEffect(() => {
    const loop = () => {
      setDragState((currentDragState) => {
        if (!currentDragState) return null;
        if (currentDragState.mode === "dragging") {
          const dx = currentDragState.targetPos.x - currentDragState.pos.x;
          const dy = currentDragState.targetPos.y - currentDragState.pos.y;
          const newPos = {
            x: currentDragState.pos.x + dx * DAMPING_FACTOR,
            y: currentDragState.pos.y + dy * DAMPING_FACTOR,
          };
          if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            return { ...currentDragState, pos: currentDragState.targetPos };
          }
          return { ...currentDragState, pos: newPos };
        }
        if (currentDragState.mode === "returning") {
          const elapsed = Date.now() - currentDragState.returnStartTime;
          const progress = Math.min(elapsed / RETURN_ANIMATION_DURATION, 1);
          const newX =
            currentDragState.returnFrom.x +
            (currentDragState.returnTo.x - currentDragState.returnFrom.x) *
              progress;
          const newY =
            currentDragState.returnFrom.y +
            (currentDragState.returnTo.y - currentDragState.returnFrom.y) *
              progress;
          if (progress >= 1) return null;
          return { ...currentDragState, pos: { x: newX, y: newY } };
        }
        return currentDragState;
      });
      animationFrameId.current = requestAnimationFrame(loop);
    };
    if (dragState) {
      animationFrameId.current = requestAnimationFrame(loop);
    }
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [dragState]);

  const linkedGhostPeg = useMemo(() => {
    if (!dragState || !dragState.peg.link) return null;

    const linkedPegData = pegs.find(
      (p) => p.id === dragState.peg.link!.targetId
    );
    if (!linkedPegData) return null;

    const primaryCol = dragState.pos.x / CELL_SIZE + 0.5;
    const primaryRow = dragState.pos.y / CELL_SIZE + 0.5;

    const { row: linkedRow, col: linkedCol } = getLinkedPos(
      primaryRow,
      primaryCol,
      dragState.peg.link.linkType
    );

    return {
      peg: linkedPegData,
      position: getPegCenter(linkedRow, linkedCol),
    };
  }, [dragState, pegs, getPegCenter, level.grid]);

  return (
    <div
      ref={boardRef}
      className="relative rounded-lg p-2 shadow-inner select-none overflow-hidden"
      style={{ width: boardWidth + 4, height: boardHeight + 4 }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Neon Grid Background */}
      <NeonGridBackground
        width={boardWidth}
        height={boardHeight}
        rows={level.grid.rows}
        cols={level.grid.cols}
        cellSize={CELL_SIZE}
      />

      <div
        className="absolute inset-2 grid"
        style={{
          gridTemplateColumns: `repeat(${level.grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${level.grid.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: level.grid.rows * level.grid.cols }).map(
          (_, i) => {
            const row = Math.floor(i / level.grid.cols);
            const col = i % level.grid.cols;
            const isDark = (row + col) % 2 !== 0;
            return (
              <div
                key={i}
                className="flex items-center justify-center pointer-events-none"
                style={{
                  backgroundColor: isDark
                    ? "rgba(0, 0, 0, 0.3)"
                    : "rgba(0, 0, 0, 0.1)",
                }}
              ></div>
            );
          }
        )}
      </div>

      {highlightedCells.map((cell, i) => (
        <div
          key={`highlight-${i}`}
          className={`absolute rounded-lg pointer-events-none z-0 ${
            cell.isLinked ? "bg-amber-400/20" : "bg-cyan-400/20"
          }`}
          style={{
            width: CELL_SIZE - 8,
            height: CELL_SIZE - 8,
            left: (cell.col - 1) * CELL_SIZE + 4,
            top: (cell.row - 1) * CELL_SIZE + 4,
            border: `2px solid ${
              cell.isLinked ? "rgb(251 191 36 / 0.4)" : "rgb(34 211 238 / 0.4)"
            }`,
          }}
        ></div>
      ))}

      {level.blocked?.map((cell, i) => (
        <div
          key={`blocked-${i}`}
          className="absolute bg-slate-700/50 rounded-md pointer-events-none flex items-center justify-center"
          style={{
            width: CELL_SIZE - 8,
            height: CELL_SIZE - 8,
            left: (cell.col - 1) * CELL_SIZE + 4,
            top: (cell.row - 1) * CELL_SIZE + 4,
          }}
        >
          <div className="w-1/2 h-1/2 bg-slate-900/50 rounded-sm transform rotate-45"></div>
        </div>
      ))}

      <svg
        className="absolute inset-0 z-10 pointer-events-none"
        width={boardWidth}
        height={boardHeight}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {renderedRopes.map((rope) => (
          <line
            key={rope.id}
            x1={rope.p1.x}
            y1={rope.p1.y}
            x2={rope.p2.x}
            y2={rope.p2.y}
            stroke={rope.color}
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              transition: rope.isDragging ? "none" : "all 0.15s ease-out",
              filter: rope.isFragile ? "url(#glow)" : "none",
              animation: rope.isFragile
                ? "pulse 2s infinite ease-in-out"
                : "none",
            }}
          />
        ))}
      </svg>

      <div className="absolute inset-0">
        {pegs.map(
          (peg) =>
            (!dragState || dragState.peg.id !== peg.id) && (
              <div key={peg.id} onMouseDown={(e) => handleMouseDown(e, peg)}>
                <Peg peg={peg} activePowerUp={activePowerUp} />
              </div>
            )
        )}
        {dragState && <GhostPeg peg={dragState.peg} position={dragState.pos} />}
        {linkedGhostPeg && (
          <GhostPeg
            peg={linkedGhostPeg.peg}
            position={linkedGhostPeg.position}
          />
        )}
      </div>
      <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
            `}</style>
    </div>
  );
};
