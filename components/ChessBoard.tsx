"use client";

import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { AIOpponent, AI_OPPONENTS, AIPersonality } from "./AIOpponent";
import SettingsPanel from "./SettingsPanel";
import { soundManager } from "../utils/sounds";
import { getLastMoveStyles } from "../utils/moveHighlight";
import GameOverModal from "./GameOverModal";

export default function ChessBoard() {
  // Game state
  const [game, setGame] = useState(new Chess());
  const [gameMode, setGameMode] = useState<"menu" | "ai" | "local">("menu");
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [gameStatus, setGameStatus] = useState<string>("");
  const [gameOver, setGameOver] = useState<{
    isOver: boolean;
    winner: "white" | "black" | "draw";
  } | null>(null);

  // Click-to-move state
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);

  // AI opponent state
  const [playingAgainstAI, setPlayingAgainstAI] = useState(false);
  const [aiOpponent, setAiOpponent] = useState<AIOpponent | null>(null);
  const [selectedAI, setSelectedAI] = useState<AIPersonality>(AI_OPPONENTS[0]);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiComments, setAiComments] = useState<string[]>([]);

  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [chatVisible, setChatVisible] = useState(true);

  // Move highlight state
  const [lastMove, setLastMove] = useState<{ from?: string; to?: string }>({});

  //Typing animation state
  const [currentComment, setCurrentComment] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // AI makes a move when it's their turn
  useEffect(() => {
    if (
      playingAgainstAI &&
      currentTurn === "b" &&
      aiOpponent &&
      !game.isGameOver()
    ) {
      makeAIMove();
    }
  }, [currentTurn, playingAgainstAI, aiOpponent]);

  // Update sound manager when settings change
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    soundManager.setVolume(soundVolume);
  }, [soundEnabled, soundVolume]);

  // NEW: Typing animation effect
  useEffect(() => {
    if (currentComment && isTyping) {
      const fullText = currentComment;
      let index = 0;

      // Start with empty string for the last message
      setAiComments((prev) => {
        const newComments = [...prev];
        newComments[newComments.length - 1] = ""; // Clear last message for typing
        return newComments;
      });

      const intervalId = setInterval(() => {
        if (index < fullText.length) {
          setAiComments((prev) => {
            const newComments = [...prev];
            newComments[newComments.length - 1] = fullText.substring(
              0,
              index + 1
            );
            return newComments;
          });
          index++;
        } else {
          setIsTyping(false);
          clearInterval(intervalId);
        }
      }, 30); // Typing speed

      return () => clearInterval(intervalId);
    }
  }, [currentComment, isTyping]);

  function startLocalGame() {
    setGameMode("local");
    resetGame();
  }

  function startAIGame() {
    const ai = new AIOpponent("", selectedAI);
    setAiOpponent(ai);
    setPlayingAgainstAI(true);
    setGameMode("ai");
    setAiComments([`${selectedAI.name}: Let's play! You're White, I'm Black.`]);
    resetGame();
  }

  function backToMenu() {
    stopAIGame();
    setGameMode("menu");
  }

  async function makeAIMove() {
    setAiThinking(true);

    try {
      const { move, comment } = await aiOpponent!.makeMove(game);

      // Make the move
      const moveResult = game.move(move);
      if (moveResult) {
        // Play appropriate sound
        if (moveResult.captured) {
          soundManager.play("capture");
        } else if (
          moveResult.flags.includes("k") ||
          moveResult.flags.includes("q")
        ) {
          soundManager.play("castle");
        } else {
          soundManager.play("move");
        }

        // Update last move highlight
        setLastMove({ from: moveResult.from, to: moveResult.to });

        setGame(new Chess(game.fen()));
        setCurrentTurn(game.turn());
        updateGameStatus();

        // FIXED: Add typing animation WITHOUT empty placeholder first
        soundManager.play("ai-talk");
        const fullComment = `${selectedAI.name}: ${comment}`;
        setCurrentComment(fullComment);
        setIsTyping(true);

        // Add the message immediately, typing effect will fill it in
        setAiComments((prev) => [...prev, fullComment]);
      }
    } catch (error) {
      console.error("AI move error:", error);
      setAiComments((prev) => [
        ...prev,
        `${selectedAI.name}: Oops, I got confused!`,
      ]);
    }

    setAiThinking(false);
  }

  // Get AI reaction to player's move
  async function getAIReaction(playerMove: string) {
    if (aiOpponent && playingAgainstAI) {
      try {
        const reaction = await aiOpponent.reactToMove(game, playerMove);

        // FIXED: Same fix here - no empty placeholder
        const fullComment = `${selectedAI.name}: ${reaction}`;
        setCurrentComment(fullComment);
        setIsTyping(true);
        setAiComments((prev) => [...prev, fullComment]);
        soundManager.play("ai-talk");
      } catch (error) {
        console.error("AI reaction error:", error);
      }
    }
  }

  // Drag and drop
  function onDrop(sourceSquare: string, targetSquare: string): boolean {
    if (playingAgainstAI && currentTurn === "b") {
      return false;
    }
    return makeMove(sourceSquare, targetSquare);
  }

  // Square click
  function onSquareClick(square: Square) {
    if (playingAgainstAI && currentTurn === "b") {
      return;
    }

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map((m) => m.to as Square));
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    const moved = makeMove(selectedSquare, square);
    if (moved) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map((m) => m.to as Square));
      }
    }
  }

  // Unified move function
  function makeMove(from: string, to: string): boolean {
    try {
      const move = game.move({
        from,
        to,
        promotion: "q",
      });

      if (move === null) return false;

      // NEW: Play appropriate sound
      if (move.captured) {
        soundManager.play("capture");
      } else if (move.flags.includes("k") || move.flags.includes("q")) {
        soundManager.play("castle");
      } else {
        soundManager.play("move");
      }

      // NEW: Update last move highlight
      setLastMove({ from: move.from, to: move.to });

      setGame(new Chess(game.fen()));
      setCurrentTurn(game.turn());
      updateGameStatus();

      // Get AI reaction to player's move
      if (playingAgainstAI && currentTurn === "w") {
        getAIReaction(move.san);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  function updateGameStatus() {
    // CHECKMATE - Game is over, someone won
    if (game.isCheckmate()) {
      // IMPORTANT: game.turn() returns the player who is IN checkmate (the loser)
      // So if it's white's turn, white is checkmated = black wins
      const loser = game.turn();
      const winner = loser === "w" ? "black" : "white";

      setGameStatus(
        `Checkmate! ${winner === "white" ? "White" : "Black"} wins!`
      );

      // Show the game over modal with correct winner
      setGameOver({ isOver: true, winner });

      // Play victory/defeat sound
      soundManager.play("check");

      if (playingAgainstAI) {
        const isAIWin = winner === "black";
        const finalComment = isAIWin
          ? `${selectedAI.name}: Good game! Better luck next time!`
          : `${selectedAI.name}: Well played! You got me!`;
        setAiComments((prev) => [...prev, finalComment]);
      }
    }
    // DRAW - Game is over, no winner
    else if (game.isDraw()) {
      setGameStatus("Draw!");
      setGameOver({ isOver: true, winner: "draw" });
    }
    // CHECK - Game continues, just a warning
    else if (game.isCheck()) {
      setGameStatus("Check!");
      soundManager.play("check");
    }
    // Normal move - clear status
    else {
      setGameStatus("");
    }
  }

  function resetGame() {
    setGame(new Chess());
    setCurrentTurn("w");
    setGameStatus("");
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove({});
    setGameOver(null); // NEW: Clear game over state
    if (!playingAgainstAI) {
      setAiComments([]);
    }
  }

  function stopAIGame() {
    setPlayingAgainstAI(false);
    setAiOpponent(null);
    setAiComments([]);
    resetGame();
  }

  // NEW: Custom square styles (includes last move highlight)
  const customSquareStyles: any = {
    ...getLastMoveStyles(lastMove), // Highlight last move
  };

  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      background: "rgba(255, 255, 0, 0.5)",
    };
  }

  possibleMoves.forEach((square) => {
    customSquareStyles[square] = {
      background:
        "radial-gradient(circle, rgba(0,255,0,.4) 25%, transparent 25%)",
      borderRadius: "50%",
    };
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8 overflow-auto">
      {/* Header with Settings */}
      <div className="flex items-center justify-between w-full max-w-[1400px] mb-8">
        <h1 className="text-4xl font-bold text-white">
          Chess Game - CEF + DirectX11
        </h1>
        <SettingsPanel
          soundEnabled={soundEnabled}
          soundVolume={soundVolume}
          chatVisible={chatVisible}
          onSoundToggle={setSoundEnabled}
          onVolumeChange={setSoundVolume}
          onChatToggle={setChatVisible}
        />
      </div>

      {/* MAIN MENU - Choose game mode */}
      {gameMode === "menu" && (
        <div className="w-full max-w-[800px] space-y-6">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Choose Game Mode
          </h2>

          {/* AI Mode Button */}
          <button
            onClick={() => setGameMode("ai")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-8 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl"
          >
            <div className="text-4xl mb-2">🤖</div>
            <div className="text-2xl mb-2">Play vs AI</div>
            <div className="text-sm text-gray-200">
              Challenge smart opponents with unique personalities
            </div>
          </button>

          {/* Local Multiplayer Button */}
          <button
            onClick={startLocalGame}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-8 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl"
          >
            <div className="text-4xl mb-2">👥</div>
            <div className="text-2xl mb-2">Local Multiplayer</div>
            <div className="text-sm text-gray-200">
              Play against a friend on the same device
            </div>
          </button>
        </div>
      )}

      {/* AI OPPONENT SELECTION */}
      {gameMode === "ai" && !playingAgainstAI && (
        <div className="w-full max-w-[800px]">
          <button
            onClick={() => setGameMode("menu")}
            className="mb-4 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Menu
          </button>

          <div className="bg-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              🤖 Choose Your Opponent
            </h2>

            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto mb-6">
              {AI_OPPONENTS.map((ai, idx) => ({ ai, idx }))
                .sort((a, b) => {
                  const difficultyOrder: { [key: string]: number } = {
                    "Newbie Nina": 0,
                    "Friendly Fred": 3,
                    "Chatty Charlie": 4,
                    "Zen Master Zara": 6,
                    "Cocky Carl": 7,
                    "Dramatic Diana": 8,
                    "Professor Pat": 9,
                    "Mysterious Magnus": 10,
                  };
                  const diff =
                    difficultyOrder[a.ai.name] - difficultyOrder[b.ai.name];
                  return diff !== 0 ? diff : a.idx - b.idx;
                })
                .map(({ ai }) => {
                  const getDifficulty = (name: string) => {
                    switch (name) {
                      case "Newbie Nina":
                        return { label: "Beginner", color: "text-green-400" };
                      case "Friendly Fred":
                      case "Chatty Charlie":
                        return { label: "Easy", color: "text-green-300" };
                      case "Zen Master Zara":
                      case "Cocky Carl":
                        return { label: "Medium", color: "text-yellow-400" };
                      case "Dramatic Diana":
                      case "Professor Pat":
                        return { label: "Hard", color: "text-orange-400" };
                      case "Mysterious Magnus":
                        return { label: "Expert", color: "text-red-400" };
                      default:
                        return { label: "Medium", color: "text-yellow-400" };
                    }
                  };

                  const difficulty = getDifficulty(ai.name);

                  return (
                    <button
                      key={ai.name}
                      onClick={() => setSelectedAI(ai)}
                      className={`p-4 rounded-lg transition-all text-left ${
                        selectedAI.name === ai.name
                          ? "bg-blue-600 border-2 border-blue-400"
                          : "bg-slate-800 border-2 border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-white font-bold text-lg">
                          {ai.name}
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${difficulty.color} bg-slate-900`}
                        >
                          {difficulty.label}
                        </span>
                      </div>
                      <div className="text-gray-300 text-sm mt-1">
                        {ai.description}
                      </div>
                    </button>
                  );
                })}
            </div>

            <button
              onClick={startAIGame}
              className="w-full py-4 rounded-lg font-bold text-xl transition-colors bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              🎮 Start Game vs {selectedAI.name}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              💡 AI uses smart move evaluation - no API key required!
            </p>
          </div>
        </div>
      )}

      {/* GAME SCREEN - Larger board, cleaner layout */}
      {(gameMode === "ai" && playingAgainstAI) || gameMode === "local" ? (
        <>
          {/* Back button */}
          <button
            onClick={backToMenu}
            className="self-start mb-4 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Menu
          </button>

          {/* Game Status */}
          <div className="bg-slate-700 rounded-lg p-4 mb-4 w-full max-w-[1200px]">
            <div className="flex justify-between items-center text-white">
              <span className="text-lg">
                Turn:{" "}
                <span className="font-bold">
                  {currentTurn === "w"
                    ? "White (You)"
                    : playingAgainstAI
                    ? `Black (${selectedAI.name})`
                    : "Black (Player 2)"}
                </span>
              </span>
              {gameStatus && (
                <span className="text-xl font-bold text-yellow-400">
                  {gameStatus}
                </span>
              )}
              {aiThinking && (
                <span className="text-blue-400 animate-pulse">
                  🤔 AI thinking...
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-6 w-full max-w-[1200px]">
            {/* Chess Board - BIGGER! */}
            <div className="flex-1">
              <div className="w-full max-w-[700px] mx-auto aspect-square shadow-2xl rounded-lg overflow-hidden">
                <Chessboard
                  id="BasicBoard"
                  position={game.fen()}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                  customSquareStyles={customSquareStyles}
                  arePiecesDraggable={!aiThinking}
                />
              </div>

              {/* Controls */}
              <div className="mt-4 flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  New Game
                </button>

                <button
                  onClick={() => {
                    game.undo();
                    if (playingAgainstAI) game.undo();
                    setGame(new Chess(game.fen()));
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                    setLastMove({});
                  }}
                  disabled={aiThinking}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  Undo Move
                </button>
              </div>
            </div>

            {/* AI Chat Panel or Move History */}
            {playingAgainstAI && chatVisible ? (
              <div className="w-[350px] bg-slate-700 rounded-lg p-4">
                <h2 className="text-xl font-bold text-white mb-4">
                  💬 AI Commentary
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {aiComments.map((comment, i) => (
                    <div
                      key={i}
                      className="bg-slate-800 rounded-lg p-3 animate-fadeIn"
                    >
                      <p className="text-gray-200">{comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-[350px] bg-slate-700 rounded-lg p-4">
                <h2 className="text-xl font-bold text-white mb-2">
                  Move History
                </h2>
                <div className="text-gray-300 font-mono text-sm max-h-[600px] overflow-y-auto">
                  {game.history().length === 0 ? (
                    <p className="text-gray-500">No moves yet</p>
                  ) : (
                    <p>{game.history().join(", ")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Game Over Modal */}
      {gameOver?.isOver && (
        <GameOverModal
          winner={gameOver.winner}
          onNewGame={resetGame}
          aiName={playingAgainstAI ? selectedAI.name : undefined}
        />
      )}
    </div>
  );
}
