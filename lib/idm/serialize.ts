import type { ASTNode } from "./parser";

function quote(s: string): string {
  return `"${s.replace(/"/g, '\\"')}"`;
}

function serializeNode(node: ASTNode): string {
  switch (node.kind) {
    case "string":
      return quote(node.value);
    case "number":
      return String(node.value);
    case "field":
      return node.path;
    case "fn":
      return [node.name, ...node.args.map(serializeNode)].join(" ");
  }
}

export function serializeFormula(ast: ASTNode): string {
  return `{{${serializeNode(ast)}}}`;
}
