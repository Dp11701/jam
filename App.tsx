import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { GameBoard } from "./components/GameBoard";
import { HUD } from "./components/HUD";
import { GameEndModal } from "./components/GameEndModal";
import { LevelSelectModal } from "./components/LevelSelectModal";
import { calculateTotalIntersections } from "./utils/geometry";
import { LEVELS } from "./constants";
import type {
  PegData,
  GameState,
  Level,
  PowerUpType,
  PowerUpState,
  Theme,
} from "./types";
import { UndoIcon } from "./components/icons";
import { audioManager } from "./utils/audio";

const INITIAL_POWER_UPS: PowerUpState = { cut: 1, freeze: 1, unlock: 1 };

function getInitialGameState(levelData: Level): GameState {
  return {
    pegs: JSON.parse(JSON.stringify(levelData.pegs)),
    moves: 0,
    timeRemaining: levelData.parTimeSec,
    status: "playing",
    ropeOrder: Array.from(new Set(levelData.pegs.map((p) => p.pair))),
  };
}

const ThemeEffects = ({ theme }: { theme: Theme }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}vw`,
      animationDuration: `${5 + Math.random() * 10}s`,
      animationDelay: `${Math.random() * 10}s`,
      opacity: 0.2 + Math.random() * 0.5,
    }));
  }, []);

  const themeStyles = `
        .theme-default {
            --color-bg-from: #F5DEB3; --color-bg-to: #DEB887;
            --color-text-header: #654321; --color-text-header-shadow: #8B4513;
            --color-button-primary-bg: #8B4513; --color-button-primary-hover: #A0522D;
            --color-board-dark: #444; --color-board-light: #fff;
            --color-level-select-hover: #8B4513;
            --color-hud-header: #654321;
        }
        .theme-noel {
            --color-bg-from: #1e3a8a; --color-bg-to: #312e81;
            --color-text-header: #fef08a; --color-text-header-shadow: #facc15;
            --color-button-primary-bg: #dc2626; --color-button-primary-hover: #ef4444;
            --color-board-dark: #b91c1c; --color-board-light: #166534;
            --color-level-select-hover: #dc2626;
            --color-hud-header: #fef08a;
        }
        .theme-halloween {
            --color-bg-from: #581c87; --color-bg-to: #171717;
            --color-text-header: #f97316; --color-text-header-shadow: #fb923c;
            --color-button-primary-bg: #ea580c; --color-button-primary-hover: #f97316;
            --color-board-dark: #4a044e; --color-board-light: #f97316;
            --color-level-select-hover: #ea580c;
            --color-hud-header: #f97316;
        }
        .theme-raining {
            --color-bg-from: #334155; --color-bg-to: #1e3a8a;
            --color-text-header: #93c5fd; --color-text-header-shadow: #60a5fa;
            --color-button-primary-bg: #3b82f6; --color-button-primary-hover: #60a5fa;
            --color-board-dark: #1e40af; --color-board-light: #93c5fd;
            --color-level-select-hover: #3b82f6;
            --color-hud-header: #93c5fd;
        }
        @keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg); } }
        @keyframes rain { 0% { transform: translateY(-10vh); } 100% { transform: translateY(110vh); } }
        .snowflakes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
        .snowflake { position: absolute; color: white; font-size: 1rem; animation: fall linear infinite; }
        .raining-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
        .rain-drop { position: absolute; width: 2px; height: 80px; background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.4)); animation: rain linear infinite; }
    `;
  return (
    <>
      <style>{themeStyles}</style>
      {theme === "noel" && (
        <div className="snowflakes">
          {particles.map((style, i) => (
            <div key={i} className="snowflake" style={style}>
              ❄
            </div>
          ))}
        </div>
      )}
      {theme === "raining" && (
        <div className="raining-container">
          {particles.map((style, i) => (
            <div key={i} className="rain-drop" style={style}></div>
          ))}
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [gameState, setGameState] = useState<GameState>(() =>
    getInitialGameState(LEVELS[0])
  );
  const [history, setHistory] = useState<GameState[]>([]);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [powerUps, setPowerUps] = useState<PowerUpState>(INITIAL_POWER_UPS);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [isTimeFrozen, setIsTimeFrozen] = useState<boolean>(false);
  const hasInteracted = useRef(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(
    () => (localStorage.getItem("untangle-theme") as Theme) || "default"
  );

  useEffect(() => {
    localStorage.setItem("untangle-theme", currentTheme);
    document.body.className = `${currentTheme}-theme`;
  }, [currentTheme]);

  const intersections = useMemo(
    () => calculateTotalIntersections(gameState.pegs, level.grid),
    [gameState.pegs, level.grid]
  );

  const resetLevel = useCallback((levelIndex: number) => {
    const newLevel = LEVELS[levelIndex];
    setLevel(newLevel);
    setGameState(getInitialGameState(newLevel));
    setHistory([]);
    setPowerUps(INITIAL_POWER_UPS);
    setActivePowerUp(null);
    setIsTimeFrozen(false);
  }, []);

  useEffect(() => {
    resetLevel(currentLevelIndex);
  }, [currentLevelIndex, resetLevel]);

  useEffect(() => {
    if (
      gameState.status === "playing" &&
      intersections === 0 &&
      gameState.pegs.length > 0
    ) {
      setGameState((prev) => ({ ...prev, status: "won" }));
      audioManager.play("win");
    }
  }, [intersections, gameState.status, gameState.pegs.length]);

  useEffect(() => {
    if (
      gameState.status === "playing" &&
      gameState.moves >= level.parMoves &&
      intersections > 0
    ) {
      setGameState((prev) => ({
        ...prev,
        status: "lost",
        loseReason: "moves",
      }));
      audioManager.play("lose");
    }
  }, [gameState.moves, level.parMoves, intersections, gameState.status]);

  useEffect(() => {
    let timerId: number;
    if (gameState.status === "playing" && !isTimeFrozen) {
      timerId = window.setInterval(() => {
        setGameState((prev) => {
          if (prev.timeRemaining <= 1) {
            clearInterval(timerId);
            audioManager.play("lose");
            return {
              ...prev,
              timeRemaining: 0,
              status: "lost",
              loseReason: "time",
            };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [gameState.status, isTimeFrozen]);

  const handleSelectLevel = (index: number) => {
    audioManager.play("click");
    setCurrentLevelIndex(index);
    setShowLevelSelect(false);
  };

  const handlePegMove = useCallback(
    (movedPeg: PegData, newRow: number, newCol: number) => {
      if (movedPeg.link) {
        audioManager.play("linkedMove");
      } else if (
        typeof movedPeg.fragileMovesLeft === "number" &&
        movedPeg.fragileMovesLeft > 0
      ) {
        audioManager.play("fragileMove");
      } else {
        audioManager.play("drop");
      }

      setHistory((prev) => [...prev, gameState]);

      setGameState((prev) => {
        let newPegs = [...prev.pegs];

        // Move the primary peg
        newPegs = newPegs.map((p) =>
          p.id === movedPeg.id ? { ...p, row: newRow, col: newCol } : p
        );

        // Handle linked peg movement
        if (movedPeg.link) {
          const linkedPeg = newPegs.find(
            (p) => p.id === movedPeg.link!.targetId
          );
          if (linkedPeg) {
            let linkedNewRow = linkedPeg.row;
            let linkedNewCol = linkedPeg.col;
            const { rows, cols } = level.grid;

            switch (movedPeg.link.linkType) {
              case "symmetric_center":
                linkedNewRow = rows + 1 - newRow;
                linkedNewCol = cols + 1 - newCol;
                break;
              case "symmetric_x":
                linkedNewRow = newRow;
                linkedNewCol = cols + 1 - newCol;
                break;
              case "symmetric_y":
                linkedNewRow = rows + 1 - newRow;
                linkedNewCol = newCol;
                break;
            }
            newPegs = newPegs.map((p) =>
              p.id === linkedPeg.id
                ? { ...p, row: linkedNewRow, col: linkedNewCol }
                : p
            );
          }
        }

        // Handle fragile logic if applicable
        const isFragile =
          typeof movedPeg.fragileMovesLeft === "number" &&
          movedPeg.fragileMovesLeft > 0;
        if (isFragile) {
          const newMovesLeft = movedPeg.fragileMovesLeft! - 1;
          if (newMovesLeft === 0) {
            audioManager.play("lock");
          }
          newPegs = newPegs.map((p) => {
            if (p.pair === movedPeg.pair) {
              return {
                ...p,
                fragileMovesLeft: newMovesLeft,
                locked: newMovesLeft === 0 ? true : p.locked,
              };
            }
            return p;
          });
        }

        // Update rope render order
        const pairIdToMove = movedPeg.pair;
        const newRopeOrder = prev.ropeOrder.filter((id) => id !== pairIdToMove);
        newRopeOrder.push(pairIdToMove);

        return {
          ...prev,
          pegs: newPegs,
          moves: prev.moves + 1,
          ropeOrder: newRopeOrder,
        };
      });
    },
    [gameState, level.grid]
  );

  const handleReset = useCallback(() => {
    audioManager.play("click");
    resetLevel(currentLevelIndex);
  }, [currentLevelIndex, resetLevel]);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      audioManager.play("click");
      const lastState = history[history.length - 1];
      setGameState(lastState);
      setHistory((prev) => prev.slice(0, -1));
    }
  }, [history]);

  const handleNextLevel = () => {
    audioManager.play("click");
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    } else {
      setShowLevelSelect(true);
    }
  };

  const handleRetry = () => {
    audioManager.play("click");
    resetLevel(currentLevelIndex);
  };

  const handleToggleMute = () => {
    audioManager.toggleMute();
    setIsMuted((prev) => !prev);
  };

  const handleInteraction = () => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      audioManager.init();

      // Sử dụng file MP3 từ thư mục assets
      audioManager.setExternalBGM("./assets/jiglr - Odyssey.mp3");

      // Nếu muốn sử dụng âm thanh được tạo tự động, comment dòng trên và uncomment dòng dưới
      // audioManager.useGeneratedBGM();

      audioManager.startBGM();
    }
  };

  const handleInvalidMove = () => {
    audioManager.play("invalid");
  };

  const handlePowerUpClick = (type: PowerUpType) => {
    audioManager.play("click");
    if (powerUps[type] === 0) return;

    if (type === "freeze") {
      setPowerUps((prev) => ({ ...prev, freeze: prev.freeze - 1 }));
      setIsTimeFrozen(true);
      setTimeout(() => setIsTimeFrozen(false), 10000); // 10-second freeze
    } else {
      setActivePowerUp((current) => (current === type ? null : type));
    }
  };

  const handleUseCut = (pairId: string) => {
    if (powerUps.cut > 0) {
      setHistory((prev) => [...prev, gameState]);
      setGameState((prev) => ({
        ...prev,
        pegs: prev.pegs.filter((p) => p.pair !== pairId),
        ropeOrder: prev.ropeOrder.filter((id) => id !== pairId),
      }));
      setPowerUps((prev) => ({ ...prev, cut: prev.cut - 1 }));
      setActivePowerUp(null);
    }
  };

  const handleUseUnlock = (pegId: string) => {
    const pegToUnlock = gameState.pegs.find((p) => p.id === pegId);
    // Can't unlock pegs that were locked due to being fragile
    if (powerUps.unlock > 0 && pegToUnlock?.fragileMovesLeft !== 0) {
      setHistory((prev) => [...prev, gameState]);
      setGameState((prev) => ({
        ...prev,
        pegs: prev.pegs.map((p) =>
          p.id === pegId ? { ...p, locked: false } : p
        ),
      }));
      setPowerUps((prev) => ({ ...prev, unlock: prev.unlock - 1 }));
      setActivePowerUp(null);
    }
  };

  const woodTextureSVG = `
        <svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
            <rect width='80' height='80' fill='%23F5DEB3'/>
            <g fill='%23D2B48C' fill-opacity='0.4'>
                <rect x='0' y='0' width='80' height='1' />
                <rect x='0' y='20' width='80' height='1' />
                <rect x='0' y='40' width='80' height='1' />
                <rect x='0' y='60' width='80' height='1' />
                <rect x='0' y='0' width='1' height='80' />
                <rect x='20' y='0' width='1' height='80' />
                <rect x='40' y='0' width='1' height='80' />
                <rect x='60' y='0' width='1' height='80' />
            </g>
            <g fill='%23BC8F8F' fill-opacity='0.2'>
                <path d='M0 40 Q20 42 40 40 T80 40' stroke='%23BC8F8F' stroke-width='2' fill='none' />
                <path d='M0 10 Q20 8 40 10 T80 10' stroke='%23BC8F8F' stroke-width='1' fill='none' />
                 <path d='M0 70 Q20 73 40 70 T80 70' stroke='%23BC8F8F' stroke-width='1.5' fill='none' />
            </g>
        </svg>
    `;
  const woodTextureBase64 = `data:image/svg+xml;base64,${btoa(woodTextureSVG)}`;

  return (
    <div
      className={`min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden`}
      style={{ backgroundColor: "var(--color-bg-from)" }}
    >
      <ThemeEffects theme={currentTheme} />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `url("${woodTextureBase64}")`,
          backgroundSize: "auto",
        }}
      ></div>

      <header className="w-full max-w-4xl text-center mb-4 z-10">
        <h1
          className="text-4xl md:text-5xl font-bold tracking-wider"
          style={{
            color: "var(--color-text-header)",
            textShadow: "0 0 10px var(--color-text-header-shadow)",
          }}
        >
          Untangle Ropes
        </h1>
      </header>

      <main className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl z-10">
        <div className="w-full max-w-sm md:max-w-none md:w-auto">
          <GameBoard
            level={level}
            pegs={gameState.pegs}
            ropeOrder={gameState.ropeOrder}
            onPegMove={handlePegMove}
            isInteractionDisabled={gameState.status !== "playing"}
            onInteraction={handleInteraction}
            onInvalidMove={handleInvalidMove}
            activePowerUp={activePowerUp}
            onUseCut={handleUseCut}
            onUseUnlock={handleUseUnlock}
          />
        </div>
        <div className="flex flex-col gap-4 w-full md:w-70">
          <HUD
            level={currentLevelIndex + 1}
            moves={gameState.moves}
            parMoves={level.parMoves}
            timeRemaining={gameState.timeRemaining}
            onReset={handleReset}
            intersections={intersections}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            powerUps={powerUps}
            activePowerUp={activePowerUp}
            onPowerUpClick={handlePowerUpClick}
            isTimeFrozen={isTimeFrozen}
            currentTheme={currentTheme}
            onSetTheme={setCurrentTheme}
          />
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || gameState.status !== "playing"}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
          >
            <UndoIcon />
            Undo
          </button>
          <button
            onClick={() => {
              audioManager.play("click");
              setShowLevelSelect(true);
            }}
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
            style={{ backgroundColor: "var(--color-button-primary-bg)" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--color-button-primary-hover)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--color-button-primary-bg)")
            }
          >
            Change Level
          </button>
        </div>
      </main>

      <GameEndModal
        status={gameState.status}
        moves={gameState.moves}
        parMoves={level.parMoves}
        timeRemaining={gameState.timeRemaining}
        parTimeSec={level.parTimeSec}
        onNextLevel={handleNextLevel}
        onRetry={handleRetry}
        loseReason={gameState.loseReason}
      />

      <LevelSelectModal
        isOpen={showLevelSelect}
        levels={LEVELS}
        onSelectLevel={handleSelectLevel}
        onClose={() => {
          if (gameState.pegs.length > 0) setShowLevelSelect(false);
        }}
      />
    </div>
  );
};

export default App;
