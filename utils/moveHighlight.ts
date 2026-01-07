// utils/moveHighlight.ts - Highlight last move on board

export function getLastMoveHighlight(game: any): {
  from?: string;
  to?: string;
} {
  const history = game.history({ verbose: true });
  if (history.length === 0) return {};

  const lastMove = history[history.length - 1];
  return {
    from: lastMove.from,
    to: lastMove.to,
  };
}

export function getLastMoveStyles(lastMove: {
  from?: string;
  to?: string;
}): any {
  const styles: any = {};

  if (lastMove.from) {
    styles[lastMove.from] = {
      background: "rgba(255, 255, 0, 0.3)",
    };
  }

  if (lastMove.to) {
    styles[lastMove.to] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
  }

  return styles;
}
