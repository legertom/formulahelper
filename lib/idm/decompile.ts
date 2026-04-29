import type { ASTNode } from "./parser";

export type DecompiledRule = {
  priority: number;
  output: string;
  match: "all" | "any";
  conditions: Array<{ field: string; operator: string; value: string }>;
};

export type DecompileResult = {
  decompilable: boolean;
  reason?: string;
  rules: DecompiledRule[];
  defaultOutput: string;
};

function asStringLiteral(node: ASTNode): string | null {
  return node.kind === "string" ? node.value : null;
}

function singleEqualsCondition(
  node: ASTNode,
): { field: string; operator: string; value: string } | null {
  if (node.kind !== "fn") return null;
  if (node.name === "equals" || node.name === "equal") {
    const [a, b] = node.args;
    if (a?.kind === "field" && b?.kind === "string") {
      return { field: a.path, operator: "equals", value: b.value };
    }
    return null;
  }
  if (node.name === "contains") {
    const [a, b] = node.args;
    if (a?.kind === "field" && b?.kind === "string") {
      return { field: a.path, operator: "contains", value: b.value };
    }
    return null;
  }
  if (node.name === "in") {
    const [a, b] = node.args;
    if (a?.kind === "field" && b?.kind === "string") {
      return { field: a.path, operator: "in", value: b.value };
    }
    return null;
  }
  if (
    node.name === "greater" ||
    node.name === "less" ||
    node.name === "geq" ||
    node.name === "leq"
  ) {
    const [a, b] = node.args;
    if (a?.kind === "field" && b?.kind === "string") {
      return { field: a.path, operator: node.name, value: b.value };
    }
  }
  // startsWith pattern: equals substr field 0 LEN "X"
  return null;
}

function flattenAndOr(
  node: ASTNode,
  fnName: "and" | "or",
  acc: ASTNode[] = [],
): ASTNode[] {
  if (node.kind === "fn" && node.name === fnName) {
    flattenAndOr(node.args[0], fnName, acc);
    flattenAndOr(node.args[1], fnName, acc);
  } else {
    acc.push(node);
  }
  return acc;
}

function decompileCondition(
  node: ASTNode,
):
  | { match: "all" | "any"; conditions: DecompiledRule["conditions"] }
  | null {
  if (node.kind === "fn" && (node.name === "and" || node.name === "or")) {
    const match: "all" | "any" = node.name === "and" ? "all" : "any";
    const flat = flattenAndOr(node, node.name);
    const parts = flat.map(singleEqualsCondition);
    if (parts.some((p) => p === null)) return null;
    return { match, conditions: parts as DecompiledRule["conditions"] };
  }
  const single = singleEqualsCondition(node);
  if (single) return { match: "all", conditions: [single] };
  return null;
}

export function decompileAst(ast: ASTNode): DecompileResult {
  const rules: DecompiledRule[] = [];
  let cursor: ASTNode = ast;
  let priority = 1;
  while (
    cursor.kind === "fn" &&
    cursor.name === "if" &&
    cursor.args.length === 3
  ) {
    const [cond, thenNode, elseNode] = cursor.args;
    const decomposed = decompileCondition(cond);
    const output = asStringLiteral(thenNode);
    if (!decomposed || output === null) {
      return {
        decompilable: false,
        reason: !decomposed
          ? "condition uses unsupported shape (must be equals/contains/in/comparisons over field+literal, optionally chained with and/or)"
          : "branch output is not a string literal",
        rules: [],
        defaultOutput: "",
      };
    }
    rules.push({
      priority: priority++,
      output,
      match: decomposed.match,
      conditions: decomposed.conditions,
    });
    cursor = elseNode;
  }
  const fallback = asStringLiteral(cursor);
  if (fallback === null) {
    return {
      decompilable: false,
      reason: "fallback (final else) is not a string literal",
      rules: [],
      defaultOutput: "",
    };
  }
  return {
    decompilable: true,
    rules,
    defaultOutput: fallback,
  };
}
