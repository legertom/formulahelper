import type { ASTNode } from "./parser";

export type Branch = {
  when: string;
  output: string;
  isFallback?: boolean;
};

export type Explanation = {
  summary: string;
  branches: Branch[];
  shape: "if-chain" | "expression" | "literal" | "field" | "call";
};

function describeArg(node: ASTNode): string {
  switch (node.kind) {
    case "string":
      return `"${node.value}"`;
    case "number":
      return String(node.value);
    case "field":
      return node.path;
    case "fn":
      return describeCall(node);
  }
}

function describeCall(node: Extract<ASTNode, { kind: "fn" }>): string {
  const args = node.args.map(describeArg);
  switch (node.name) {
    case "equals":
      return `${args[0]} equals ${args[1]}`;
    case "and":
      return `(${args[0]}) AND (${args[1]})`;
    case "or":
      return `(${args[0]}) OR (${args[1]})`;
    case "not":
      return `NOT (${args[0]})`;
    case "greater":
      return `${args[0]} > ${args[1]}`;
    case "less":
      return `${args[0]} < ${args[1]}`;
    case "geq":
      return `${args[0]} ≥ ${args[1]}`;
    case "leq":
      return `${args[0]} ≤ ${args[1]}`;
    case "in":
      return `${args[0]} is in ${args[1]}`;
    case "contains":
      return `${args[0]} contains ${args[1]}`;
    case "concat":
      return `${args[0]} + ${args[1]}`;
    case "substr":
      return `substring of ${args[0]} from ${args[1]} for ${args[2]} chars`;
    case "length":
      return `length of ${args[0]}`;
    case "if":
      return `if (${args[0]}) then ${args[1]} else ${args[2]}`;
    default:
      return `${node.name}(${args.join(", ")})`;
  }
}

export function explainAst(ast: ASTNode): Explanation {
  if (ast.kind === "fn" && ast.name === "if") {
    const branches: Branch[] = [];
    let cursor: ASTNode = ast;
    while (cursor.kind === "fn" && cursor.name === "if" && cursor.args.length === 3) {
      branches.push({
        when: describeArg(cursor.args[0]),
        output: describeArg(cursor.args[1]),
      });
      cursor = cursor.args[2];
    }
    branches.push({
      when: "otherwise",
      output: describeArg(cursor),
      isFallback: true,
    });
    return {
      shape: "if-chain",
      summary: `Maps ${branches.length - 1} condition${branches.length - 1 === 1 ? "" : "s"} to outputs, with a final fallback.`,
      branches,
    };
  }

  if (ast.kind === "fn") {
    return {
      shape: "call",
      summary: `Computes ${describeCall(ast)}.`,
      branches: [{ when: "always", output: describeCall(ast), isFallback: true }],
    };
  }

  if (ast.kind === "field") {
    return {
      shape: "field",
      summary: `Returns the value of \`${ast.path}\`.`,
      branches: [{ when: "always", output: ast.path, isFallback: true }],
    };
  }

  return {
    shape: "literal",
    summary: `Returns the literal ${describeArg(ast)}.`,
    branches: [{ when: "always", output: describeArg(ast), isFallback: true }],
  };
}
