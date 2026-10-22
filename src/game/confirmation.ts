import type { Prompt } from './types.ts';
import { gradeAnswer, type GradeResult } from './scoring.ts';

export interface ConfirmationMatch {
  /** The prompt the player is currently answering. */
  prompt: Prompt;
  /** What the player actually typed, kept verbatim for the “No” path. */
  typed: string;
  /** The single canonical answer the player will submit if they accept. */
  answer: string;
  /** The grading preview that produced this correction. */
  grade: GradeResult;
}

/**
 * Returns a confirmation only for a *fuzzy* match.
 *
 * Exact, normalised, plural, compact and alias matches are deliberately not
 * confirmations: they are valid answers and must submit immediately. The
 * underlying `gradeAnswer` implementation already rejects ambiguous fuzzy
 * matches, so a returned match is always the single best correction.
 */
export function confirmationFor(
  prompt: Prompt,
  input: string,
): ConfirmationMatch | null {
  const typed = input.trim();
  if (!typed) return null;

  const grade = gradeAnswer(prompt, typed);
  if (!grade.accepted || !grade.corrected || !grade.answer) return null;

  return {
    prompt,
    typed,
    answer: grade.answer,
    grade,
  };
}
