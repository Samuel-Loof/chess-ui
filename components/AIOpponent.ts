// components/AIOpponent.ts - AI Chess Player
// Handles AI moves and personality-driven commentary

import { Chess } from "chess.js";

// Define the structure of an AI personality
// Each AI has a name, description, and pools of different message types
export interface AIPersonality {
  name: string;
  description: string;
  messagePool: {
    opening: string[]; // First 2-3 moves of the game
    goodMove: string[]; // When player makes a strong move
    badMove: string[]; // When player makes a mistake
    winning: string[]; // When AI is ahead in material
    losing: string[]; // When AI is behind in material
    check: string[]; // When player puts AI in check
    capture: string[]; // When player captures AI's piece
    general: string[]; // Default commentary
  };
}

// All 8 AI opponents with unique personalities and varied responses
export const AI_OPPONENTS: AIPersonality[] = [
  {
    name: "Friendly Fred",
    description: "A kind and encouraging opponent",
    messagePool: {
      opening: [
        "Hey! Good luck, have fun!",
        "Let's have a great game!",
        "Ready when you are, friend!",
        "This is going to be fun!",
      ],
      goodMove: [
        "Nice move! I didn't see that coming!",
        "Wow, that's clever!",
        "Great thinking there!",
        "You're playing really well!",
        "Impressive! You've been practicing!",
        "I like how you think!",
        "That's a smart play!",
      ],
      badMove: [
        "Hmm, you might want to reconsider that one.",
        "That's okay, we all make mistakes!",
        "Interesting choice... let's see how it plays out.",
        "No worries, you'll get the next one!",
        "Everyone has off moves sometimes!",
      ],
      winning: [
        "You're giving me a real challenge!",
        "This is a close game!",
        "You're keeping me on my toes!",
        "Great defense!",
      ],
      losing: [
        "Nice! You've got me in a tough spot!",
        "You're playing fantastic!",
        "Wow, you're really good at this!",
        "I'm in trouble now!",
      ],
      check: [
        "Ooh, check! Good eye!",
        "Nice check! I need to be more careful!",
        "Check! You got me!",
        "Sharp move with that check!",
      ],
      capture: [
        "Oh no, you got my piece!",
        "Fair capture!",
        "I'll miss that piece!",
        "Good trade!",
      ],
      general: [
        "I'm thinking about my next move...",
        "This is a fun game!",
        "Let me see what I can do here...",
        "Interesting position we have here!",
        "Hmm, what should I do...",
      ],
    },
  },
  {
    name: "Cocky Carl",
    description: "An overconfident trash-talker",
    messagePool: {
      opening: [
        "Hope you're ready to lose!",
        "Try to keep up if you can!",
        "This won't take long...",
        "Let's see what you've got, rookie!",
      ],
      goodMove: [
        "Lucky shot!",
        "Okay, okay, that was decent... I guess.",
        "Beginner's luck!",
        "Hmph, not bad... for you.",
        "Did you actually plan that?",
        "Alright, you got one good move in you!",
        "Don't get cocky, that was a fluke!",
      ],
      badMove: [
        "Seriously? That's your move?",
        "Yikes, that was rough!",
        "I could beat you with my eyes closed!",
        "Are you even trying?",
        "Thanks for the free win!",
        "My grandma plays better than that!",
      ],
      winning: [
        "Told you I'd win!",
        "Too easy!",
        "Is this the best you can do?",
        "I'm barely trying here!",
        "Victory is mine!",
      ],
      losing: [
        "Just warming up!",
        "I'm letting you have this one...",
        "Lucky moves won't save you!",
        "This isn't over yet!",
        "I've got you right where I want you... I think.",
      ],
      check: [
        "Check? Big deal, I've got this!",
        "That's cute, thinking you can threaten me!",
        "I saw that coming a mile away!",
        "Nice try, but I'm unstoppable!",
      ],
      capture: [
        "I didn't need that piece anyway!",
        "That piece was bait, obviously!",
        "Congratulations on your first good move!",
        "Take it, I've got plenty more!",
      ],
      general: [
        "Watch and learn!",
        "Prepare to be amazed!",
        "This is how a pro plays!",
        "You're about to witness greatness!",
        "Time to show off my skills!",
      ],
    },
  },
  {
    name: "Professor Pat",
    description: "A scholarly teacher",
    messagePool: {
      opening: [
        "Let's explore some interesting chess concepts today.",
        "A fascinating game awaits us!",
        "Shall we begin our chess study?",
        "I look forward to analyzing this game with you.",
      ],
      goodMove: [
        "Excellent! That demonstrates good board control.",
        "Very strategic! You're controlling key squares.",
        "Brilliant tactical awareness!",
        "That shows good positional understanding!",
        "A textbook example of proper development!",
        "Superb calculation!",
        "You're applying theory correctly!",
      ],
      badMove: [
        "Consider the consequences of weakening that square.",
        "That move may compromise your pawn structure.",
        "Perhaps a developing move would be better?",
        "Tactically, that leaves you vulnerable.",
        "Think about piece coordination here.",
      ],
      winning: [
        "Your opening theory is sound.",
        "You're demonstrating strong positional play.",
        "Interesting approach to this middle game!",
        "Well-executed strategy!",
      ],
      losing: [
        "You're executing your strategy well!",
        "I'm observing excellent tactical play from you.",
        "You've created a strong position!",
        "Impressive endgame technique!",
      ],
      check: [
        "Check! A forcing move - well calculated!",
        "Check! Excellent tactical opportunity!",
        "A discovered check! Textbook tactics!",
        "Forcing the issue with check - good!",
      ],
      capture: [
        "A fair exchange of material.",
        "Interesting piece sacrifice!",
        "That alters the material balance significantly.",
        "Trading pieces to simplify - strategic!",
      ],
      general: [
        "Let me calculate the best continuation...",
        "The position requires careful analysis.",
        "Considering multiple candidate moves...",
        "This position has interesting strategic themes.",
        "Evaluating pawn structures...",
      ],
    },
  },
  {
    name: "Zen Master Zara",
    description: "A calm, philosophical player",
    messagePool: {
      opening: [
        "The board is empty, full of possibilities...",
        "Let us flow like water across these squares.",
        "In chess, as in life, balance is key.",
        "The journey of a thousand moves begins with one.",
      ],
      goodMove: [
        "Your move flows naturally, like a river.",
        "Harmony between your pieces.",
        "Balance achieved.",
        "You see the invisible threads connecting the pieces.",
        "Mindful play.",
        "The universe smiles upon your choice.",
        "Like bamboo, you bend but do not break.",
      ],
      badMove: [
        "Sometimes we must lose our way to find it.",
        "Every mistake is a teacher.",
        "The path reveals itself in time.",
        "Patience, young grasshopper.",
        "Even chaos has its place in the cosmic dance.",
      ],
      winning: [
        "The tide shifts like seasons.",
        "All things change in time.",
        "I am but dust in the wind.",
        "Victory and defeat are illusions.",
      ],
      losing: [
        "You have found inner peace in your play.",
        "Your moves reflect clarity of mind.",
        "You are one with the board.",
        "The student has become the master.",
      ],
      check: [
        "The king awakens from his slumber.",
        "A moment of clarity in chaos.",
        "The universe speaks through your check.",
        "Pressure creates diamonds.",
      ],
      capture: [
        "All pieces return to the void eventually.",
        "What is taken was never truly possessed.",
        "The cycle of chess life continues.",
        "In loss, we find meaning.",
      ],
      general: [
        "Contemplating the eternal dance of pieces...",
        "In stillness, I find my move.",
        "The answer comes when I stop seeking it.",
        "Breathing with the rhythm of the game...",
        "The board whispers ancient wisdom.",
      ],
    },
  },
  {
    name: "Mysterious Magnus",
    description: "A silent, calculating grandmaster",
    messagePool: {
      opening: [
        "The shadows hide many secrets...",
        "Do you feel it? The game has already begun...",
        "Interesting... very interesting indeed.",
        "I've been expecting you...",
      ],
      goodMove: [
        "Ahh... you begin to see...",
        "Curious... most curious.",
        "Perhaps you understand more than you realize.",
        "The veil lifts slightly...",
        "One piece of the puzzle falls into place.",
        "So... you've discovered that, have you?",
        "Intriguing...",
      ],
      badMove: [
        "All will be revealed in time...",
        "Not all paths lead where they seem.",
        "Appearances can be deceiving...",
        "Or so you think...",
        "The fog deepens...",
      ],
      winning: [
        "The endgame approaches...",
        "Everything is going according to plan...",
        "The pieces align as foreseen...",
        "The pattern emerges...",
      ],
      losing: [
        "Just as the prophecy foretold...",
        "You play your role perfectly...",
        "Exactly as I calculated... or did I?",
        "Fascinating... I didn't anticipate this.",
      ],
      check: [
        "The king trembles... as it should.",
        "You've discovered one of my secrets.",
        "Clever... but there are deeper layers...",
        "Expected.",
      ],
      capture: [
        "That piece served its purpose.",
        "A sacrifice for the greater design.",
        "Some losses are necessary...",
        "All part of the plan.",
      ],
      general: [
        "Hmm... hmmmm...",
        "The mists are clearing...",
        "I see something you don't... yet.",
        "Time will tell...",
        "The game within the game...",
      ],
    },
  },
  {
    name: "Chatty Charlie",
    description: "Can't stop talking, goes off on tangents",
    messagePool: {
      opening: [
        "Oh boy, I LOVE chess! Did I mention I love chess? Let's gooo!",
        "Hey hey hey! Ready to play? I've been waiting ALL DAY!",
        "Okay okay okay, white moves first, that's you! Exciting!",
        "This reminds me of this one game I played in 2019... anyway, let's start!",
      ],
      goodMove: [
        "Whoa! Where did THAT come from? That was awesome!",
        "No way! That's like... chef's kiss! Brilliant!",
        "Okay I gotta admit, that was pretty slick!",
        "Oh snap! I felt that one! Nice!",
        "Hold up, that's actually genius! Why didn't I think of that?",
        "Dude! DUDE! That was so smart!",
        "I'm not even mad, that was amazing!",
      ],
      badMove: [
        "Oof... you sure about that one, buddy?",
        "Hmmm... interesting choice... I mean, bold... very bold!",
        "Well THAT happened! Let's see where this goes!",
        "Oh! Oh no... I mean, it's your game!",
        "Yikes on bikes, as my cousin says!",
      ],
      winning: [
        "Wait wait wait, you're making this harder than I expected!",
        "Okay you're actually good! Who taught you?!",
        "Plot twist: You can actually play!",
        "Hold up, this is getting intense!",
      ],
      losing: [
        "Uhhhh I might be in trouble here... haha... ha...",
        "Okay so MAYBE I underestimated you a teensy bit!",
        "This is fine. Everything is fine. Totally fine.",
        "Houston, we have a problem!",
      ],
      check: [
        "CHECK! CHECKITY CHECK CHECK! Oh wait, that's bad for me...",
        "Did you just— you DID! Oh man, my king is SO exposed right now!",
        "Yikes! Check! My king's having a panic attack!",
        "Red alert! Red alert! King in danger!",
      ],
      capture: [
        "NOOOO not my piece! I liked that piece!",
        "Ow! Right in the material advantage!",
        "Oh come ON! I was using that!",
        "RIP my piece, gone too soon!",
      ],
      general: [
        "Let me think... thinking... still thinking... almost there!",
        "Hmm hmm hmmm... what to do, what to do...",
        "Oh! Wait! No... nah, that doesn't work... or does it?",
        "Processing... please hold... elevator music playing...",
        "Brain.exe is loading...",
      ],
    },
  },
  {
    name: "Dramatic Diana",
    description: "Every move is a theatrical performance",
    messagePool: {
      opening: [
        "The stage is set! The pieces await their destiny!",
        "ACT ONE: The Opening! *Dramatic music*",
        "Our tale begins on this checkered battlefield!",
        "The curtain rises on our chess drama!",
      ],
      goodMove: [
        "BRILLIANT! The crowd goes wild!",
        "A STUNNING display of tactical prowess!",
        "*Gasp!* MAGNIFICENT!",
        "The plot thickens! What a move!",
        "BRAVO! BRAVISSIMO!",
        "The audience is on their FEET!",
        "EXTRAORDINARY! Simply EXTRAORDINARY!",
      ],
      badMove: [
        "Oh no! A tragic error!",
        "The hero stumbles!",
        "*Dramatic gasp* What have you done?!",
        "A plot twist nobody wanted!",
        "The tragedy unfolds!",
      ],
      winning: [
        "My victory draws near! The tension builds!",
        "The tide turns in my favor! Feel the drama!",
        "ACT THREE: My Triumph!",
        "The finale approaches!",
      ],
      losing: [
        "Alas! My demise approaches!",
        "The tables have turned! What treachery!",
        "Could this be... my downfall?!",
        "A twist worthy of Shakespeare!",
      ],
      check: [
        "CHECK! The king in peril! The audience holds their breath!",
        "Hark! The king is threatened! *Dramatic chord*",
        "A CHECK! The plot reaches its climax!",
        "The tension is UNBEARABLE!",
      ],
      capture: [
        "NOOOO! My dear piece falls in battle!",
        "A sacrifice! How poetic!",
        "They shall be remembered! *Salutes*",
        "Exit, stage left! *Weeps*",
      ],
      general: [
        "The next move shall be... LEGENDARY!",
        "*Deep contemplation* What fate awaits?",
        "The chess gods whisper to me...",
        "*Paces dramatically* To move or not to move...",
        "The suspense is KILLING me!",
      ],
    },
  },
  {
    name: "Newbie Nina",
    description: "Just learning chess, makes mistakes but stays positive",
    messagePool: {
      opening: [
        "I'm still learning, but let's try our best!",
        "Okay, I think I remember how the pieces move!",
        "This is so exciting! My first real game!",
        "Please go easy on me, I'm new at this!",
      ],
      goodMove: [
        "Oh wow, that looks like a good move!",
        "I should write that down for later!",
        "That's smart! Can I do that too?",
        "You make it look so easy!",
        "Wait, you can do that? Cool!",
        "Teach me your ways!",
        "That's SO clever!",
      ],
      badMove: [
        "Oh! Was that a mistake? I can't tell yet...",
        "Hmm, I'm not sure what that did...",
        "Interesting! I'm learning so much!",
        "I'll figure out if that's good or bad eventually!",
        "We all have to learn somehow!",
      ],
      winning: [
        "Wait, am I winning? Is this what winning feels like?!",
        "I think I'm doing okay! Maybe!",
        "OMG I'm actually playing chess!",
        "Is this real life?!",
      ],
      losing: [
        "You're so good! Teach me!",
        "I see what you're doing! That's so clever!",
        "I'm learning so much from you!",
        "One day I'll be as good as you!",
      ],
      check: [
        "CHECK! I did it! Wait, is my king safe too?",
        "That's check, right? I think that's check!",
        "Yay! I checked you! ...Now what?",
        "Did I do it right?!",
      ],
      capture: [
        "Oh no! Can I have that back? Just kidding!",
        "I'll do better at protecting my pieces!",
        "Note to self: guard pieces better!",
        "Oopsie daisy!",
      ],
      general: [
        "Umm... let me think what I learned...",
        "Knights move in an L-shape, right? Just checking!",
        "I'm getting better at this!",
        "Where should this piece go... decisions decisions...",
        "Learning is fun!",
      ],
    },
  },
];

// Main AI Opponent class with difficulty levels
export class AIOpponent {
  private personality: AIPersonality;
  private usedMessages: Set<string> = new Set();
  private difficulty: number; // 0 = random, 1-10 = smart move probability

  constructor(apiKey: string, personality: AIPersonality) {
    this.personality = personality;

    // Assign difficulty based on AI personality
    // This makes each AI have a unique skill level!
    switch (personality.name) {
      case "Newbie Nina":
        this.difficulty = 0; // 0% smart moves (pure random)
        break;
      case "Friendly Fred":
        this.difficulty = 3; // 30% smart moves
        break;
      case "Chatty Charlie":
        this.difficulty = 4; // 40% smart moves
        break;
      case "Zen Master Zara":
        this.difficulty = 6; // 60% smart moves
        break;
      case "Cocky Carl":
        this.difficulty = 7; // 70% smart moves (talks big, plays decent)
        break;
      case "Dramatic Diana":
        this.difficulty = 8; // 80% smart moves
        break;
      case "Professor Pat":
        this.difficulty = 9; // 90% smart moves (very strong)
        break;
      case "Mysterious Magnus":
        this.difficulty = 10; // 100% smart moves (always best)
        break;
      default:
        this.difficulty = 5; // 50% default
    }
  }

  // Get a random message from a category, avoiding recent repeats
  private getRandomMessage(
    category: keyof AIPersonality["messagePool"]
  ): string {
    const messages = this.personality.messagePool[category];

    // Filter out recently used messages
    const availableMessages = messages.filter(
      (msg) => !this.usedMessages.has(msg)
    );
    const pool = availableMessages.length > 0 ? availableMessages : messages;

    // Pick random message
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedMessage = pool[randomIndex];

    // Remember this message
    this.usedMessages.add(selectedMessage);
    if (this.usedMessages.size > 10) {
      this.usedMessages.clear();
    }

    return selectedMessage;
  }

  // Evaluate a move's quality (higher = better for AI/black)
  private evaluateMove(game: Chess, move: any): number {
    // Make a copy and try the move
    const testGame = new Chess(game.fen());
    const testMove = testGame.move(move);

    let score = 0;

    // 1. CHECKMATE IS BEST (instant win)
    if (testGame.isCheckmate()) {
      return 100000;
    }

    // 2. MATERIAL EVALUATION (most important)
    const materialScore = this.evaluatePosition(testGame);
    score += materialScore * -100; // Heavily weight material

    // 3. PIECE SAFETY - Don't hang pieces!
    // Check if the piece we just moved is now attacked
    const pieceOnSquare = testGame.get(move.to as any);
    if (pieceOnSquare) {
      const attackers = this.getAttackers(testGame, move.to, "w"); // White attackers
      const defenders = this.getAttackers(testGame, move.to, "b"); // Black defenders

      if (attackers.length > defenders.length) {
        // Our piece is hanging!
        const pieceValue = this.getPieceValue(pieceOnSquare.type);
        score -= pieceValue * 200; // HUGE penalty for hanging pieces
      }
    }

    // 4. CAPTURE BONUS (but only if safe)
    if (move.captured) {
      const captureValue = this.getPieceValue(move.captured);
      score += captureValue * 50;
    }

    // 5. CHECK (only if it leads somewhere)
    if (testGame.isCheck()) {
      // Check is only good if it's forcing
      if (testGame.isCheckmate()) {
        score += 10000; // Checkmate!
      } else if (testGame.moves().length < 3) {
        score += 100; // Forcing check (few escape squares)
      } else {
        score += 10; // Mild check (opponent has options)
      }
    }

    // 6. CENTER CONTROL (early game only)
    if (game.history().length < 15) {
      const centerSquares = ["e4", "d4", "e5", "d5"];
      if (centerSquares.includes(move.to)) {
        score += 30;
      }
    }

    // 7. PIECE DEVELOPMENT (early game)
    if (game.history().length < 10 && move.piece !== "p") {
      score += 25;
    }

    // 8. CASTLING BONUS
    if (move.flags.includes("k") || move.flags.includes("q")) {
      score += 100; // King safety is important
    }

    // 9. KING SAFETY
    // Penalize moves that expose the king
    const blackKingSquare = this.findKing(testGame, "b");
    if (blackKingSquare) {
      const kingAttackers = this.getAttackers(testGame, blackKingSquare, "w");
      score -= kingAttackers.length * 50; // Penalty for exposed king
    }

    return score;
  }

  // Helper: Get piece value
  private getPieceValue(piece: string): number {
    const values: { [key: string]: number } = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };
    return values[piece] || 0;
  }

  // Helper: Find king position
  private findKing(game: Chess, color: "w" | "b"): string | null {
    const board = game.board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = board[row][col];
        if (square && square.type === "k" && square.color === color) {
          return String.fromCharCode(97 + col) + (8 - row);
        }
      }
    }
    return null;
  }

  // Helper: Get all pieces attacking a square
  private getAttackers(game: Chess, square: string, color: "w" | "b"): any[] {
    const attackers: any[] = [];
    const board = game.board();

    // Check all squares for pieces that can attack this square
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const from = String.fromCharCode(97 + col) + (8 - row);
          const moves = game.moves({ square: from as any, verbose: true });
          if (moves.some((m: any) => m.to === square)) {
            attackers.push({ square: from, piece: piece.type });
          }
        }
      }
    }

    return attackers;
  }

  // Simple position evaluation (positive = white ahead, negative = black ahead)
  private evaluatePosition(game: Chess): number {
    const pieceValues: { [key: string]: number } = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let score = 0;
    const board = game.board();

    board.forEach((row) => {
      row.forEach((square) => {
        if (square) {
          const value = pieceValues[square.type];
          score += square.color === "w" ? value : -value;
        }
      });
    });

    return score;
  }

  // Determine what type of message to send based on game state
  private determineMessageCategory(
    game: Chess,
    lastMove?: string
  ): keyof AIPersonality["messagePool"] {
    if (game.history().length <= 3) {
      return "opening";
    }

    if (game.isCheck() && game.turn() === "b") {
      return "check";
    }

    if (lastMove && lastMove.includes("x")) {
      return "capture";
    }

    const evaluation = this.evaluatePosition(game);

    if (evaluation > 3) {
      return "losing";
    }

    if (evaluation < -3) {
      return "winning";
    }

    const rand = Math.random();
    if (rand < 0.2) {
      return "goodMove";
    } else if (rand < 0.3) {
      return "badMove";
    }

    return "general";
  }

  // AI makes a move with difficulty-based intelligence
  async makeMove(game: Chess): Promise<{ move: any; comment: string }> {
    const moves = game.moves({ verbose: true });

    if (moves.length === 0) {
      throw new Error("No legal moves available");
    }

    let selectedMove;

    // Decide if AI plays smart or random based on difficulty
    const playSmartThisMove = Math.random() * 10 < this.difficulty;

    if (playSmartThisMove && this.difficulty > 0) {
      // Smart move: Evaluate all moves and pick the best
      let bestScore = -Infinity;
      let bestMoves: any[] = [];

      // Evaluate each possible move
      moves.forEach((move) => {
        const score = this.evaluateMove(game, move);

        if (score > bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move); // Tie, keep multiple options
        }
      });

      // Pick randomly from best moves (adds variety)
      selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else {
      // Random move (for beginners or occasional variety)
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    }

    // Get contextual comment
    const messageCategory = this.determineMessageCategory(game);
    const comment = this.getRandomMessage(messageCategory);

    return {
      move: selectedMove,
      comment: comment,
    };
  }

  // React to player's move with ONE contextual message
  async reactToMove(game: Chess, playerMove: string): Promise<string> {
    const messageCategory = this.determineMessageCategory(game, playerMove);
    return this.getRandomMessage(messageCategory);
  }
}
