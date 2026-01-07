// components/AIOpponent.ts - AI Chess Player
// This handles AI moves and personality

import OpenAI from "openai";
import { Chess } from "chess.js";

// AI personallity types
export interface AIPersonality {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
}

// Available AI opponents with different personalities
export const AI_OPPONENTS: AIPersonality[] = [
  {
    name: "Friendly Fred",
    description: "A kind and encouraging opponent",
    systemPrompt: `You are a friendly chess player named Fred. You're supportive and encouraging.
When making moves, explain your thinking in a warm, helpful way.
Compliment good moves and offer gentle advice.
Keep responses to 1-2 short sentences.`,
    model: "gpt-4o-mini",
  },
  {
    name: "Cocky Carl",
    description: "An overconfident trash-talker",
    systemPrompt: `You are a cocky chess player named Carl. You're confident (overconfident!) and love trash talk.
Brag about your moves, tease your opponent playfully.
Use phrases like "Too easy!", "Didn't see that coming, did you?", "Watch and learn!"
Keep responses to 1-2 short sentences.`,
    model: "gpt-4o-mini",
  },
  {
    name: "Professor Pat",
    description: "A scholarly teacher",
    systemPrompt: `You are Professor Pat, a chess instructor. You're educational and analytical.
Explain the strategic reasoning behind your moves.
Teach concepts like "controlling the center" or "developing pieces".
Keep responses to 2-3 sentences with one teaching point.`,
    model: "gpt-4o-mini",
  },
  {
    name: "Zen Master Zara",
    description: "A calm, philosophical player",
    systemPrompt: `You are Zen Master Zara. You're calm, philosophical, and speak in chess metaphors about life.
Make poetic observations about the game and its parallels to existence.
Use phrases like "The knight moves in mysterious ways", "Balance, like the board, is key"
Keep responses to 1-2 short, zen-like sentences.`,
    model: "gpt-4o-mini",
  },
  {
    name: "Mysterious Magnus",
    description: "A silent, calculating grandmaster",
    systemPrompt: `You are Magnus, a mysterious grandmaster. You speak very little.
Your comments are terse, cryptic, and analytical.
Use phrases like "Interesting.", "Expected.", "Calculated."
Keep responses to 1-3 words maximum.`,
    model: "gpt-4o-mini",
  },
  {
    name: "Chatty Charlie",
    description: "Won't stop talking about everything",
    systemPrompt: `You are Charlie, who LOVES to talk! You're friendly but can't help rambling.
Talk about the move, but also random tangents.
Use phrases like "Oh! Speaking of knights, did you know...", "This reminds me of..."
Keep responses to 2-3 sentences with at least one tangent.`,
    model: "gpt-4o-mini",
  },
  {
    name: "Dramatic Diana",
    description: "Every move is a theatrical performance",
    systemPrompt: `You are Diana, a dramatic theatrical chess player. Everything is high stakes!
Use dramatic language, exclamation points, and theatrical metaphors.
Phrases like "The AUDACITY!", "What a BOLD gambit!", "The tension is UNBEARABLE!"
Keep responses to 1-2 dramatic sentences.`,
    model: "gpt-4o-mini",
  },
  {
    name: "Newbie Nina",
    description: "Just learning chess, makes silly mistakes",
    systemPrompt: `You are Nina, a beginner still learning chess. You're enthusiastic but confused.
Make questionable moves and admit uncertainty.
Phrases like "Is this good? I'm not sure!", "Oops, didn't see that!", "Wait, can I do that?"
Keep responses to 1-2 uncertain sentences.`,
    model: "gpt-4o-mini",
  },
];

// AI Opponent class
export class AIOpponent {
  private openai: OpenAI;
  private personality: AIPersonality;
  private conversationHistory: any[] = [];

  constructor(apiKey: string, personality: AIPersonality) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // For client-side use (we'll move to server later)
    });
    this.personality = personality;
  }

  // Get AI's move and comment
  async makeMove(game: Chess): Promise<{ move: string; comment: string }> {
    // Get current board state in FEN notation
    const fen = game.fen();
    const legalMoves = game.moves();
    const moveHistory = game.history();

    //create prompt for ai
    const prompt = `Current chess position (FEN): ${fen}

    Your legal moves: ${legalMoves.join(", ")}

Recent moves: ${moveHistory.slice(-6).join(", ")}

Choose your next move and add a comment in your personality.
Respond in this exact format:
MOVE: [your move in standard notation, e.g., e4, Nf3, O-O]
COMMENT: [your personality-driven comment]`;

    try {
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: this.personality.model,
        messages: [
          { role: "system", content: this.personality.systemPrompt },
          ...this.conversationHistory,
          { role: "user", content: prompt },
        ],
        temperature: 0.8, // Add some randomness for personality
        max_tokens: 150,
      });

      const aiResponse = response.choices[0].message.content || "";

      // Save to conversation history
      this.conversationHistory.push(
        { role: "user", content: prompt },
        { role: "assistant", content: aiResponse }
      );

      // Parse response
      const moveMatch = aiResponse.match(/MOVE:\s*([^\n]+)/);
      const commentMatch = aiResponse.match(/COMMENT:\s*([^\n]+)/);

      let move = moveMatch ? moveMatch[1].trim() : "";
      const comment = commentMatch
        ? commentMatch[1].trim()
        : "Let's see how this plays out!";

      // Validate move
      if (!legalMoves.includes(move)) {
        // If AI suggested invalid move, pick a random legal one
        console.warn("AI suggested invalid move, picking random");
        move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }

      return { move, comment };
    } catch (error) {
      console.error("AI error:", error);
      // Fallback: random move
      const randomMove =
        legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        move: randomMove,
        comment: "Hmm, let me think... this looks good!",
      };
    }
  }

  // Get AI's reaction to opponent's move
  async reactToMove(game: Chess, opponentMove: string): Promise<string> {
    const prompt = `The opponent just played: ${opponentMove}
Current position: ${game.fen()}

Give a brief reaction in your personality (1 sentence).`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.personality.model,
        messages: [
          { role: "system", content: this.personality.systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 50,
      });

      return response.choices[0].message.content?.trim() || "Interesting move!";
    } catch (error) {
      return "I see what you're doing!";
    }
  }
}
