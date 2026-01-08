// components/GameOverModal.tsx
// Victory/Defeat screen with animations

interface GameOverModalProps {
  winner: "white" | "black" | "draw"; // Who won the game
  onNewGame: () => void; // Function to start new game
  aiName?: string; // Name of AI opponent (if playing against AI)
}

export default function GameOverModal({
  winner,
  onNewGame,
  aiName,
}: GameOverModalProps) {
  // Determine the outcome message based on winner
  const getOutcomeMessage = () => {
    if (winner === "draw") {
      return {
        title: "DRAW!",
        subtitle: "A well-fought battle!",
        emoji: "🤝",
        color: "text-yellow-400",
      };
    } else if (winner === "white") {
      return {
        title: "CHECKMATE!",
        subtitle: aiName ? `You defeated ${aiName}!` : "White wins!",
        emoji: "👑",
        color: "text-green-400",
      };
    } else {
      return {
        title: "CHECKMATE!",
        subtitle: aiName ? `${aiName} defeated you!` : "Black wins!",
        emoji: "💀",
        color: "text-red-400",
      };
    }
  };

  const outcome = getOutcomeMessage();

  return (
    // Full-screen overlay with backdrop blur (shows game behind)
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      {/* Modal container - constrained width to prevent text overflow */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border-4 border-slate-600 max-w-lg w-full mx-4 animate-bounceIn">
        {/* Emoji icon with pulse animation */}
        <div className="text-7xl text-center mb-4 animate-pulse">
          {outcome.emoji}
        </div>

        {/* Main title - responsive sizing to prevent overflow */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl font-black text-center mb-4 ${outcome.color} animate-scaleIn break-words`}
        >
          {outcome.title}
        </h1>

        {/* Subtitle - also responsive */}
        <p className="text-xl sm:text-2xl text-gray-300 text-center mb-8 animate-slideUp break-words px-4">
          {outcome.subtitle}
        </p>

        {/* New Game button */}
        <button
          onClick={onNewGame}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg animate-slideUp"
        >
          🎮 New Game
        </button>

        {/* Extra spacing for visual balance */}
        <div className="mt-4 text-center text-gray-400 text-sm animate-fadeIn">
          Press to continue...
        </div>
      </div>
    </div>
  );
}
