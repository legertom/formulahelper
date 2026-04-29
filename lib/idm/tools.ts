import { tool } from "ai";
import { z } from "zod";
import {
  compileGroupRules,
  formatFormula,
  lintFormula,
  testFormula,
  validateFormula,
} from "./client";

export const idmTools = {
  validate_formula: tool({
    description:
      "Validate IDM formula syntax and guardrails. Returns errors and warnings. Falls back to a local spec-based validator if the live API is unreachable.",
    inputSchema: z.object({
      formula: z.string().describe("The IDM formula, wrapped in {{ ... }}."),
    }),
    execute: async ({ formula }) => validateFormula(formula),
  }),

  lint_formula: tool({
    description:
      "Run logic-risk lint checks on an IDM formula (deep nesting, unreachable branches, empty fallback, broad-before-specific, etc).",
    inputSchema: z.object({
      formula: z.string().describe("The IDM formula, wrapped in {{ ... }}."),
    }),
    execute: async ({ formula }) => lintFormula(formula),
  }),

  format_formula: tool({
    description:
      "Format and canonicalize an IDM formula (e.g. rewrite `equal` to `equals`, pretty-print indentation).",
    inputSchema: z.object({
      formula: z.string(),
      pretty: z.boolean().optional().default(true),
      canonicalize: z.boolean().optional().default(true),
    }),
    execute: async ({ formula, pretty, canonicalize }) =>
      formatFormula(formula, { pretty, canonicalize }),
  }),

  test_formula: tool({
    description:
      "Run an IDM formula against sample records. Each case has `data` (the record fields) and an optional `expected` value to assert against.",
    inputSchema: z.object({
      formula: z.string(),
      cases: z
        .array(
          z.object({
            name: z.string().optional(),
            data: z.record(z.string(), z.unknown()),
            expected: z.string().optional(),
          }),
        )
        .min(1),
    }),
    execute: async ({ formula, cases }) => testFormula(formula, cases),
  }),

  compile_group_rules: tool({
    description:
      "Compile structured grouping rules (JSON or CSV) into normalized IDM formulas. Use when the user describes multiple priority-ordered rules or pastes a CSV.",
    inputSchema: z.object({
      defaultOutput: z.string().optional(),
      rules: z
        .array(
          z.object({
            priority: z.number().int(),
            output: z.string(),
            match: z.enum(["all", "any"]),
            conditions: z
              .array(
                z.object({
                  field: z.string(),
                  operator: z.string(),
                  value: z.string(),
                }),
              )
              .min(1),
          }),
        )
        .optional(),
      csv: z.string().optional(),
    }),
    execute: async (input) => compileGroupRules(input),
  }),
};
