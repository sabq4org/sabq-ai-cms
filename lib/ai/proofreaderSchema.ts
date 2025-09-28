import { z } from 'zod';

export const QualityScoreSchema = z.object({
  spelling: z.number().min(0).max(100),
  grammar: z.number().min(0).max(100),
  style: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  overall: z.number().min(0).max(100)
});

export const PatchSchema = z.object({
  type: z.enum(['replace','insert','delete']),
  target: z.object({ start: z.number().int().min(0), end: z.number().int().min(0) }),
  before: z.string().optional(),
  after: z.string().optional(),
  reason: z.string()
});

export const SuggestionSchema = z.object({
  category: z.enum(['headline','lead','structure','terminology','numbers','punctuation']),
  text: z.string(),
  impact: z.enum(['low','medium','high'])
});

export const FactCheckSchema = z.object({
  span: z.object({ start: z.number().int().min(0), end: z.number().int().min(0) }),
  claim_text: z.string(),
  issue: z.string(),
  level: z.enum(['info','needs_review','critical']),
  hint: z.string()
});

export const PolicyFlagSchema = z.object({
  type: z.enum(['bias','defamation','privacy','unsafe_advice','copyright']),
  note: z.string()
});

export const ProofreadResultSchema = z.object({
  version: z.literal('1.0'),
  quality_score: QualityScoreSchema,
  summary: z.string(),
  patches: z.array(PatchSchema),
  suggestions: z.array(SuggestionSchema),
  fact_checks: z.array(FactCheckSchema),
  policy_flags: z.array(PolicyFlagSchema)
});

export type ProofreadResult = z.infer<typeof ProofreadResultSchema>;
