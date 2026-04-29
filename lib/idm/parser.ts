import { IDM_FN_BY_NAME } from "./spec";

export type ParseError = {
  message: string;
  start?: number;
  end?: number;
};

export type ASTNode =
  | { kind: "fn"; name: string; args: ASTNode[]; start: number; end: number; id: string }
  | { kind: "string"; value: string; start: number; end: number; id: string }
  | { kind: "number"; value: number; start: number; end: number; id: string }
  | { kind: "field"; path: string; start: number; end: number; id: string };

type Token =
  | { kind: "string"; value: string; start: number; end: number }
  | { kind: "number"; value: number; start: number; end: number }
  | { kind: "ident"; value: string; start: number; end: number };

let nodeIdCounter = 0;
function newId() {
  return `n${++nodeIdCounter}`;
}

function tokenize(src: string, offset: number): { tokens: Token[]; errors: ParseError[] } {
  const tokens: Token[] = [];
  const errors: ParseError[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }
    const startAbs = offset + i;
    if (ch === '"') {
      let j = i + 1;
      let raw = "";
      while (j < src.length && src[j] !== '"') {
        if (src[j] === "\\" && j + 1 < src.length) {
          raw += src[j + 1];
          j += 2;
        } else {
          raw += src[j];
          j++;
        }
      }
      if (j >= src.length) {
        errors.push({ message: "Unterminated string literal", start: startAbs });
        break;
      }
      tokens.push({ kind: "string", value: raw, start: startAbs, end: offset + j + 1 });
      i = j + 1;
      continue;
    }
    let j = i;
    while (j < src.length && !/[\s"]/.test(src[j])) j++;
    const word = src.slice(i, j);
    const endAbs = offset + j;
    if (/^-?\d+(\.\d+)?$/.test(word)) {
      tokens.push({ kind: "number", value: Number(word), start: startAbs, end: endAbs });
    } else {
      tokens.push({ kind: "ident", value: word, start: startAbs, end: endAbs });
    }
    i = j;
  }
  return { tokens, errors };
}

type Cursor = { pos: number };

function parseExpr(
  tokens: Token[],
  cursor: Cursor,
  errors: ParseError[],
): ASTNode | null {
  if (cursor.pos >= tokens.length) {
    errors.push({ message: "Unexpected end of expression" });
    return null;
  }
  const tok = tokens[cursor.pos];
  if (tok.kind === "string") {
    cursor.pos++;
    return { kind: "string", value: tok.value, start: tok.start, end: tok.end, id: newId() };
  }
  if (tok.kind === "number") {
    cursor.pos++;
    return { kind: "number", value: tok.value, start: tok.start, end: tok.end, id: newId() };
  }
  const fn = IDM_FN_BY_NAME[tok.value];
  if (!fn) {
    cursor.pos++;
    return {
      kind: "field",
      path: tok.value,
      start: tok.start,
      end: tok.end,
      id: newId(),
    };
  }
  const fnStart = tok.start;
  cursor.pos++;
  const args: ASTNode[] = [];
  for (let k = 0; k < fn.arity; k++) {
    if (cursor.pos >= tokens.length) {
      errors.push({
        message: `Function "${tok.value}" expects ${fn.arity} args; got ${k}.`,
        start: fnStart,
        end: tok.end,
      });
      break;
    }
    const child = parseExpr(tokens, cursor, errors);
    if (child) args.push(child);
  }
  const last = args[args.length - 1];
  const end = last ? last.end : tok.end;
  return { kind: "fn", name: tok.value, args, start: fnStart, end, id: newId() };
}

export type ParseResult = {
  ast: ASTNode | null;
  errors: ParseError[];
  bodyStart: number;
  bodyEnd: number;
};

export function parseFormula(source: string): ParseResult {
  const errors: ParseError[] = [];
  const trimmed = source.trim();
  if (!trimmed.startsWith("{{") || !trimmed.endsWith("}}")) {
    errors.push({ message: "Formula must be wrapped in {{ ... }}." });
    return { ast: null, errors, bodyStart: 0, bodyEnd: source.length };
  }
  const leading = source.indexOf("{{");
  const trailing = source.lastIndexOf("}}");
  const body = source.slice(leading + 2, trailing);
  const offset = leading + 2;

  const { tokens, errors: tokenErrors } = tokenize(body, offset);
  errors.push(...tokenErrors);

  if (tokens.length === 0) {
    errors.push({ message: "Empty formula body" });
    return { ast: null, errors, bodyStart: offset, bodyEnd: trailing };
  }

  const cursor: Cursor = { pos: 0 };
  const ast = parseExpr(tokens, cursor, errors);

  if (cursor.pos < tokens.length) {
    const stray = tokens[cursor.pos];
    errors.push({
      message: `Unexpected extra token: ${stray.kind === "ident" ? stray.value : JSON.stringify(stray)}`,
      start: stray.start,
      end: stray.end,
    });
  }

  return { ast, errors, bodyStart: offset, bodyEnd: trailing };
}

export function walk(ast: ASTNode, fn: (node: ASTNode) => void) {
  fn(ast);
  if (ast.kind === "fn") {
    for (const arg of ast.args) walk(arg, fn);
  }
}
