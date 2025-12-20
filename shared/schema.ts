import { z } from "zod";

export const telegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

export type TelegramUser = z.infer<typeof telegramUserSchema>;

export const gameResultSchema = z.object({
  result: z.enum(["win", "lose", "draw"]),
  telegramId: z.number().nullable(),
  firstName: z.string().nullable(),
});

export type GameResult = z.infer<typeof gameResultSchema>;

export const gameResultResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  promoCode: z.string().nullable(),
  alreadyHasPromo: z.boolean().optional(),
});

export type GameResultResponse = z.infer<typeof gameResultResponseSchema>;

export type CellValue = "X" | "O" | null;
export type Board = CellValue[];
export type GameState = "playing" | "win" | "lose" | "draw";

export interface GameStats {
  player: number;
  computer: number;
  draw: number;
}

export type CatMood = "happy" | "sad" | "draw";

export interface CatData {
  faces: string[];
  messages: string[];
}
