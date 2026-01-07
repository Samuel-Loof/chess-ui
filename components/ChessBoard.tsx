"use client";

import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { AIOpponent, AI_OPPONENTS, AIPersonality } from "./AIOpponent";
import SettingsPanel from "./SettingsPanel";
import { soundManager } from "../utils/sounds";
import { getLastMoveStyles } from "../utils/moveHighlight";

export default function ChessBoard() {
  // Game state
  const [game, setGame] = useState(new Chess());
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [gameStatus, setGameStatus] = useState<string>("");

  // Click-to-move state
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);

  // AI opponent state
  const [playingAgainstAI, setPlayingAgainstAI] = useState(false);
  const [aiOpponent, setAiOpponent] = useState<AIOpponent | null>(null);
  const [selectedAI, setSelectedAI] = useState<AIPersonality>(AI_OPPONENTS[0]);
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [aiComments, setAiComments] = useState<string[]>([]);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // NEW: Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [chatVisible, setChatVisible] = useState(true);

  // NEW: Move highlight state
  const [lastMove, setLastMove] = useState<{ from?: string; to?: string }>({});

  // NEW: Typing animation state
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

  // NEW: Update sound manager when settings change
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    soundManager.setVolume(soundVolume);
  }, [soundEnabled, soundVolume]);

  // NEW: Typing animation effect
  useEffect(() => {
    if (currentComment && isTyping) {
      const fullText = currentComment;
      let index = 0;
      setAiComments((prev) => [...prev.slice(0, -1), ""]);

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

  // Initialize AI opponent
  function startAIGame() {
    if (!aiApiKey) {
      alert("Please enter your OpenAI API key first!");
      return;
    }

    const ai = new AIOpponent(aiApiKey, selectedAI);
    setAiOpponent(ai);
    setPlayingAgainstAI(true);
    setAiComments([`${selectedAI.name}: Let's play! You're White, I'm Black.`]);
    resetGame();
  }

  // AI makes its move
  async function makeAIMove() {
    setAiThinking(true);

    try {
      const { move, comment } = await aiOpponent!.makeMove(game);

      // Make the move
      const moveResult = game.move(move);
      if (moveResult) {
        // NEW: Play appropriate sound
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

        // NEW: Update last move highlight
        setLastMove({ from: moveResult.from, to: moveResult.to });

        setGame(new Chess(game.fen()));
        setCurrentTurn(game.turn());
        updateGameStatus();

        // NEW: Add AI's comment with typing animation
        soundManager.play("ai-talk");
        const fullComment = `${selectedAI.name}: ${comment}`;
        setCurrentComment(fullComment);
        setIsTyping(true);
        setAiComments((prev) => [...prev, ""]); // Placeholder for typing
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

        // NEW: Add with typing animation
        const fullComment = `${selectedAI.name}: ${reaction}`;
        setCurrentComment(fullComment);
        setIsTyping(true);
        setAiComments((prev) => [...prev, ""]);
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

  // Update game status
  function updateGameStatus() {
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "Black" : "White";
      setGameStatus(`Checkmate! ${winner} wins!`);
      if (playingAgainstAI) {
        const isAIWin = winner === "Black";
        const finalComment = isAIWin
          ? `${selectedAI.name}: Good game! Better luck next time!`
          : `${selectedAI.name}: Well played! You got me!`;
        setAiComments((prev) => [...prev, finalComment]);
      }
    } else if (game.isDraw()) {
      setGameStatus("Draw!");
    } else if (game.isCheck()) {
      setGameStatus("Check!");
      soundManager.play("check"); // NEW: Check sound
    } else {
      setGameStatus("");
    }
  }

  function resetGame() {
    setGame(new Chess());
    setCurrentTurn("w");
    setGameStatus("");
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove({}); // NEW: Clear highlight
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
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

      {/* AI Setup Panel */}
      {!playingAgainstAI && (
        <div className="bg-slate-700 rounded-lg p-6 mb-4 w-[600px]">
          <h2 className="text-2xl font-bold text-white mb-4">
            🤖 Play Against AI
          </h2>

          {/* API Key Input */}
          <div className="mb-4">
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-blue-400 hover:text-blue-300 text-sm mb-2"
            >
              {showApiKeyInput ? "▼" : "▶"}{" "}
              {aiApiKey ? "API Key Set ✓" : "Enter OpenAI API Key"}
            </button>

            {showApiKeyInput && (
              <div>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    OpenAI
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* AI Personality Selection */}
          <div className="mb-4">
            <label className="text-white font-semibold block mb-2">
              Choose Your Opponent:
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {AI_OPPONENTS.map((ai) => (
                <button
                  key={ai.name}
                  onClick={() => setSelectedAI(ai)}
                  className={`p-4 rounded-lg transition-all text-left ${
                    selectedAI.name === ai.name
                      ? "bg-blue-600 border-2 border-blue-400"
                      : "bg-slate-800 border-2 border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <div className="text-white font-bold text-lg">{ai.name}</div>
                  <div className="text-gray-300 text-sm mt-1">
                    {ai.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startAIGame}
            disabled={!aiApiKey}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              aiApiKey
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Start Game vs {selectedAI.name}
          </button>
        </div>
      )}

      {/* Game Status */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4 w-[600px]">
        <div className="flex justify-between items-center text-white">
          <span className="text-lg">
            Turn:{" "}
            <span className="font-bold">
              {currentTurn === "w"
                ? "White (You)"
                : playingAgainstAI
                ? `Black (${selectedAI.name})`
                : "Black"}
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
        {playingAgainstAI && (
          <p className="text-sm text-gray-300 mt-2">
            Playing against {selectedAI.name}
          </p>
        )}
      </div>

      <div className="flex gap-4 w-full max-w-[1400px]">
        {/* Chess Board */}
        <div className="flex-shrink-0">
          <div className="w-[600px] h-[600px] shadow-2xl rounded-lg overflow-hidden">
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
          <div className="mt-4 flex gap-4">
            {playingAgainstAI ? (
              <button
                onClick={stopAIGame}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Stop AI Game
              </button>
            ) : (
              <button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                New Game
              </button>
            )}

            <button
              onClick={() => {
                game.undo();
                if (playingAgainstAI) game.undo();
                setGame(new Chess(game.fen()));
                setSelectedSquare(null);
                setPossibleMoves([]);
                setLastMove({}); // NEW: Clear highlight on undo
              }}
              disabled={aiThinking}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              Undo Move
            </button>
          </div>
        </div>

        {/* AI Chat Panel */}
        {playingAgainstAI && chatVisible && (
          <div className="flex-1 bg-slate-700 rounded-lg p-4 max-w-[600px]">
            <h2 className="text-xl font-bold text-white mb-4">
              💬 AI Commentary
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
        )}

        {/* Move History */}
        {!playingAgainstAI && (
          <div className="flex-1 bg-slate-700 rounded-lg p-4 max-w-[600px]">
            <h2 className="text-xl font-bold text-white mb-2">Move History</h2>
            <div className="text-gray-300 font-mono text-sm max-h-[500px] overflow-y-auto">
              {game.history().length === 0 ? (
                <p className="text-gray-500">No moves yet</p>
              ) : (
                <p>{game.history().join(", ")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
