import { IDM_FN_BY_NAME } from "./spec";

export type LocalValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

type Token =
  | { kind: "ident"; value: string }
  | { kind: "string"; value: string }
  | { kind: "number"; value: string };

function tokenize(body: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < body.length) {
    const ch = body[i];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < body.length && body[j] !== '"') j++;
      if (j >= body.length) throw new Error("Unterminated string literal");
      tokens.push({ kind: "string", value: body.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    let j = i;
    while (j < body.length && !/[\s"]/.test(body[j])) j++;
    const word = body.slice(i, j);
    if (/^-?\d+(\.\d+)?$/.test(word)) {
      tokens.push({ kind: "number", value: word });
    } else {
      tokens.push({ kind: "ident", value: word });
    }
    i = j;
  }
  return tokens;
}

function parseExpr(tokens: Token[], pos: number, errors: string[]): number {
  if (pos >= tokens.length) {
    errors.push("Unexpected end of expression.");
    return pos;
  }
  const tok = tokens[pos];
  if (tok.kind === "string" || tok.kind === "number") return pos + 1;
  const fn = IDM_FN_BY_NAME[tok.value];
  if (!fn) {
    return pos + 1;
  }
  let next = pos + 1;
  for (let arg = 0; arg < fn.arity; arg++) {
    if (next >= tokens.length) {
      errors.push(`Function "${tok.value}" expects ${fn.arity} args; got ${arg}.`);
      return next;
    }
    next = parseExpr(tokens, next, errors);
  }
  return next;
}

export function localValidate(formula: string): LocalValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trimmed = formula.trim();

  if (!trimmed.startsWith("{{") || !trimmed.endsWith("}}")) {
    errors.push("Formula must be wrapped in {{ ... }}.");
    return { valid: false, errors, warnings };
  }
  const body = trimmed.slice(2, -2).trim();
  if (!body) {
    errors.push("Formula body is empty.");
    return { valid: false, errors, warnings };
  }
  if (body.includes("(") || body.includes(")")) {
    errors.push("Parentheses are not allowed in IDM formulas.");
  }
  if (body.includes(",")) {
    warnings.push("Commas are not used in IDM formulas; arguments are space-separated.");
  }

  let tokens: Token[];
  try {
    tokens = tokenize(body);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Tokenization failed.");
    return { valid: false, errors, warnings };
  }

  if (tokens.length === 0) {
    errors.push("No expressions found in body.");
    return { valid: false, errors, warnings };
  }

  for (const tok of tokens) {
    if (tok.kind === "ident" && /^[a-z][A-Za-z0-9_]*$/.test(tok.value)) {
      const ch = tok.value[0];
      const looksLikeFunc = /^[a-z]/.test(tok.value) && !tok.value.includes(".");
      if (looksLikeFunc && !IDM_FN_BY_NAME[tok.value]) {
        if (
          !["true", "false"].includes(tok.value) &&
          tok.value === tok.value.toLowerCase() &&
          !/[A-Z]/.test(tok.value) &&
          ch === ch.toLowerCase()
        ) {
        }
      }
    }
  }

  let pos = 0;
  while (pos < tokens.length) {
    const before = pos;
    pos = parseExpr(tokens, pos, errors);
    if (pos === before) {
      errors.push(`Could not parse token "${JSON.stringify(tokens[pos])}".`);
      break;
    }
  }

  for (const tok of tokens) {
    if (tok.kind === "ident" && IDM_FN_BY_NAME[tok.value] === undefined && /^[a-z][A-Za-z0-9_]*$/.test(tok.value)) {
      const looksLikeBareFnName =
        !tok.value.includes(".") && /^(get|do|run|len|trim|equal)$/.test(tok.value);
      if (looksLikeBareFnName) {
        warnings.push(`"${tok.value}" is not a known function. Did you mean a canonical name?`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
