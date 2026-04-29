import { parseFormula, type ASTNode, type ParseError } from "./parser";
import { IDM_FUNCTIONS } from "./spec";

const ALIAS_TO_CANONICAL: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const fn of IDM_FUNCTIONS) {
    if ("aliases" in fn && Array.isArray(fn.aliases)) {
      for (const alias of fn.aliases) map[alias] = fn.name;
    }
  }
  return map;
})();

function canonicalizeNode(node: ASTNode): ASTNode {
  if (node.kind !== "fn") return node;
  const name = ALIAS_TO_CANONICAL[node.name] ?? node.name;
  return { ...node, name, args: node.args.map(canonicalizeNode) };
}

function quote(s: string): string {
  return `"${s.replace(/"/g, '\\"')}"`;
}

function renderInline(node: ASTNode): string {
  switch (node.kind) {
    case "string":
      return quote(node.value);
    case "number":
      return String(node.value);
    case "field":
      return node.path;
    case "fn":
      return [node.name, ...node.args.map(renderInline)].join(" ");
  }
}

function hasFnDescendant(node: ASTNode): boolean {
  if (node.kind !== "fn") return false;
  return node.args.some((a) => a.kind === "fn");
}

function renderPretty(node: ASTNode, indent: string): string {
  if (node.kind !== "fn" || !hasFnDescendant(node)) {
    return renderInline(node);
  }
  const childIndent = indent + "  ";
  const lines = node.args.map((arg) => childIndent + renderPretty(arg, childIndent));
  return `${node.name}\n${lines.join("\n")}`;
}

function formatErrorMessage(errors: ParseError[]): string {
  const first = errors[0];
  if (!first) return "Could not parse formula";
  if (typeof first.start === "number") {
    return `${first.message} (at ${first.start})`;
  }
  return first.message;
}

export type LocalFormatOptions = {
  pretty: boolean;
  canonicalize?: boolean;
};

export type LocalFormatResult =
  | { ok: true; formula: string }
  | { ok: false; error: string };

export function formatFormulaLocal(
  formula: string,
  options: LocalFormatOptions,
): LocalFormatResult {
  if (!formula.trim()) {
    return { ok: false, error: "formula is empty" };
  }
  const parsed = parseFormula(formula);
  if (!parsed.ast || parsed.errors.length > 0) {
    return { ok: false, error: formatErrorMessage(parsed.errors) };
  }
  const canonicalize = options.canonicalize !== false;
  const ast = canonicalize ? canonicalizeNode(parsed.ast) : parsed.ast;
  const body = options.pretty ? renderPretty(ast, "") : renderInline(ast);
  return { ok: true, formula: `{{${body}}}` };
}
