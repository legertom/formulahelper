import type { ASTNode } from "./parser";

let nodeCounter = 0;
function newId() {
  return `s${++nodeCounter}`;
}

function clone(node: ASTNode): ASTNode {
  if (node.kind === "fn") {
    return {
      kind: "fn",
      name: node.name,
      args: node.args.map(clone),
      start: node.start,
      end: node.end,
      id: newId(),
    };
  }
  return { ...node, id: newId() };
}

function nodeKey(node: ASTNode): string {
  switch (node.kind) {
    case "string":
      return `S:${node.value}`;
    case "number":
      return `N:${node.value}`;
    case "field":
      return `F:${node.path}`;
    case "fn":
      return `${node.name}(${node.args.map(nodeKey).join(",")})`;
  }
}

function nodesEqual(a: ASTNode, b: ASTNode): boolean {
  return nodeKey(a) === nodeKey(b);
}

type Notes = string[];

function makeOr(left: ASTNode, right: ASTNode, span: { start: number; end: number }): ASTNode {
  return {
    kind: "fn",
    name: "or",
    args: [left, right],
    start: span.start,
    end: span.end,
    id: newId(),
  };
}

function simplifyOnce(node: ASTNode, notes: Notes): ASTNode {
  if (node.kind !== "fn") return node;
  const args = node.args.map((a) => simplifyOnce(a, notes));
  const next: ASTNode = { ...node, args, id: newId() };

  // not (not X) → X
  if (next.name === "not" && args[0]?.kind === "fn" && args[0].name === "not") {
    notes.push("removed double-negation `not not X`");
    return args[0].args[0];
  }

  // if c X X → X (both branches identical)
  if (next.name === "if" && args.length === 3 && nodesEqual(args[1], args[2])) {
    notes.push("if branches are identical; collapsed to the value");
    return args[1];
  }

  // Collapse if-chains where consecutive same-output branches share an output
  // {{if c1 X if c2 X if c3 X fallback}} → {{if or or c1 c2 c3 X fallback}}
  if (next.name === "if" && args.length === 3) {
    const groups: Array<{ conds: ASTNode[]; output: ASTNode }> = [];
    let cursor: ASTNode = next;
    while (cursor.kind === "fn" && cursor.name === "if" && cursor.args.length === 3) {
      const cond: ASTNode = cursor.args[0];
      const thenN: ASTNode = cursor.args[1];
      const elseN: ASTNode = cursor.args[2];
      const last = groups[groups.length - 1];
      if (last && nodesEqual(last.output, thenN)) {
        last.conds.push(cond);
      } else {
        groups.push({ conds: [cond], output: thenN });
      }
      cursor = elseN;
    }
    const fallback = cursor;

    let collapsed = false;
    let result: ASTNode = fallback;
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      if (g.conds.length > 1) collapsed = true;
      const orChain = g.conds.reduce((acc, c) =>
        makeOr(c, acc, { start: g.output.start, end: g.output.end }),
      );
      result = {
        kind: "fn",
        name: "if",
        args: [orChain, g.output, result],
        start: next.start,
        end: next.end,
        id: newId(),
      };
    }
    if (collapsed) {
      notes.push("merged consecutive if-branches that share an output via `or`");
      return result;
    }
  }

  return next;
}

export function simplifyAst(ast: ASTNode): { ast: ASTNode; notes: string[] } {
  nodeCounter = 0;
  const notes: string[] = [];
  let prev = clone(ast);
  let next = simplifyOnce(prev, notes);
  let safety = 5;
  while (nodeKey(prev) !== nodeKey(next) && safety-- > 0) {
    prev = next;
    next = simplifyOnce(prev, notes);
  }
  return { ast: next, notes };
}
