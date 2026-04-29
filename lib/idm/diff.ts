import type { ASTNode } from "./parser";

type IfBranch = {
  cond: ASTNode;
  output: ASTNode;
  condSerialized: string;
  outputSerialized: string;
};

type IfChain = {
  branches: IfBranch[];
  fallback: ASTNode;
  fallbackSerialized: string;
};

function quote(s: string): string {
  return `"${s.replace(/"/g, '\\"')}"`;
}

function serialize(node: ASTNode): string {
  switch (node.kind) {
    case "string":
      return quote(node.value);
    case "number":
      return String(node.value);
    case "field":
      return node.path;
    case "fn":
      return [node.name, ...node.args.map(serialize)].join(" ");
  }
}

function asIfChain(ast: ASTNode): IfChain | null {
  if (ast.kind !== "fn" || ast.name !== "if") return null;
  const branches: IfBranch[] = [];
  let cursor: ASTNode = ast;
  while (cursor.kind === "fn" && cursor.name === "if" && cursor.args.length === 3) {
    const cond: ASTNode = cursor.args[0];
    const thenN: ASTNode = cursor.args[1];
    const elseN: ASTNode = cursor.args[2];
    branches.push({
      cond,
      output: thenN,
      condSerialized: serialize(cond),
      outputSerialized: serialize(thenN),
    });
    cursor = elseN;
  }
  return {
    branches,
    fallback: cursor,
    fallbackSerialized: serialize(cursor),
  };
}

export type Change =
  | {
      kind: "branch-added";
      where: number;
      condition: string;
      output: string;
    }
  | {
      kind: "branch-removed";
      where: number;
      condition: string;
      output: string;
    }
  | {
      kind: "output-changed";
      where: number;
      condition: string;
      before: string;
      after: string;
    }
  | {
      kind: "condition-changed";
      where: number;
      output: string;
      before: string;
      after: string;
    }
  | {
      kind: "fallback-changed";
      before: string;
      after: string;
    }
  | {
      kind: "shape-changed";
      before: string;
      after: string;
    };

export type DiffResult = {
  shapeBefore: string;
  shapeAfter: string;
  identical: boolean;
  changes: Change[];
  summary: string;
};

export function diffAsts(a: ASTNode, b: ASTNode): DiffResult {
  const ifA = asIfChain(a);
  const ifB = asIfChain(b);

  const shapeBefore = ifA ? `if-chain(${ifA.branches.length})` : a.kind;
  const shapeAfter = ifB ? `if-chain(${ifB.branches.length})` : b.kind;

  if (!ifA || !ifB) {
    if (serialize(a) === serialize(b)) {
      return {
        shapeBefore,
        shapeAfter,
        identical: true,
        changes: [],
        summary: "Identical formulas.",
      };
    }
    return {
      shapeBefore,
      shapeAfter,
      identical: false,
      changes: [
        { kind: "shape-changed", before: serialize(a), after: serialize(b) },
      ],
      summary: "Top-level shape changed; not an if-chain on at least one side.",
    };
  }

  const changes: Change[] = [];
  const max = Math.max(ifA.branches.length, ifB.branches.length);
  for (let i = 0; i < max; i++) {
    const ba = ifA.branches[i];
    const bb = ifB.branches[i];
    if (ba && !bb) {
      changes.push({
        kind: "branch-removed",
        where: i,
        condition: ba.condSerialized,
        output: ba.outputSerialized,
      });
      continue;
    }
    if (!ba && bb) {
      changes.push({
        kind: "branch-added",
        where: i,
        condition: bb.condSerialized,
        output: bb.outputSerialized,
      });
      continue;
    }
    if (ba && bb) {
      if (
        ba.condSerialized !== bb.condSerialized &&
        ba.outputSerialized === bb.outputSerialized
      ) {
        changes.push({
          kind: "condition-changed",
          where: i,
          output: ba.outputSerialized,
          before: ba.condSerialized,
          after: bb.condSerialized,
        });
      } else if (
        ba.condSerialized === bb.condSerialized &&
        ba.outputSerialized !== bb.outputSerialized
      ) {
        changes.push({
          kind: "output-changed",
          where: i,
          condition: ba.condSerialized,
          before: ba.outputSerialized,
          after: bb.outputSerialized,
        });
      } else if (
        ba.condSerialized !== bb.condSerialized ||
        ba.outputSerialized !== bb.outputSerialized
      ) {
        changes.push({
          kind: "branch-removed",
          where: i,
          condition: ba.condSerialized,
          output: ba.outputSerialized,
        });
        changes.push({
          kind: "branch-added",
          where: i,
          condition: bb.condSerialized,
          output: bb.outputSerialized,
        });
      }
    }
  }

  if (ifA.fallbackSerialized !== ifB.fallbackSerialized) {
    changes.push({
      kind: "fallback-changed",
      before: ifA.fallbackSerialized,
      after: ifB.fallbackSerialized,
    });
  }

  const counts = changes.reduce<Record<string, number>>((acc, c) => {
    acc[c.kind] = (acc[c.kind] ?? 0) + 1;
    return acc;
  }, {});
  const summary =
    changes.length === 0
      ? "Identical (semantically)."
      : Object.entries(counts)
          .map(([k, n]) => `${n} ${k}`)
          .join(", ");

  return {
    shapeBefore,
    shapeAfter,
    identical: changes.length === 0,
    changes,
    summary,
  };
}
