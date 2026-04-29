import type { ASTNode } from "./parser";

export type EvalTrace = Map<string, EvalEntry>;
export type EvalEntry = {
  value: unknown;
  error?: string;
  branchTaken?: number;
};

export type EvalResult = {
  value: unknown;
  trace: EvalTrace;
  error?: string;
};

function getField(data: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, data);
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  return String(v);
}

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? NaN : n;
  }
  return Number(v);
}

function isTruthy(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.length > 0 && v.toLowerCase() !== "false";
  return true;
}

function escapeForRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function ordinalSuffix(d: number): string {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatDate(dateStr: string, format: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthsShort = months.map((m) => m.slice(0, 3));
  return format
    .replace(/MMMM/g, months[d.getMonth()])
    .replace(/MMM/g, monthsShort[d.getMonth()])
    .replace(/MM/g, pad2(d.getMonth() + 1))
    .replace(/Do/g, `${d.getDate()}${ordinalSuffix(d.getDate())}`)
    .replace(/DD/g, pad2(d.getDate()))
    .replace(/YYYY/g, String(d.getFullYear()))
    .replace(/YY/g, String(d.getFullYear()).slice(-2));
}

const FN_IMPLS: Record<string, (args: unknown[]) => unknown> = {
  if: ([cond, t, f]) => (isTruthy(cond) ? t : f),
  equals: ([a, b]) => asString(a) === asString(b),
  equal: ([a, b]) => asString(a) === asString(b),
  and: ([a, b]) => isTruthy(a) && isTruthy(b),
  or: ([a, b]) => isTruthy(a) || isTruthy(b),
  not: ([a]) => !isTruthy(a),
  contains: ([s, n]) => asString(s).includes(asString(n)),
  greater: ([a, b]) => asNumber(a) > asNumber(b),
  less: ([a, b]) => asNumber(a) < asNumber(b),
  geq: ([a, b]) => asNumber(a) >= asNumber(b),
  leq: ([a, b]) => asNumber(a) <= asNumber(b),
  in: ([needle, list]) => {
    const tokens = asString(list).split(/\s+/).filter(Boolean);
    return tokens.includes(asString(needle));
  },
  concat: ([a, b]) => asString(a) + asString(b),
  substr: ([s, start, len]) =>
    asString(s).substr(Math.max(0, Math.floor(asNumber(start))), Math.max(0, Math.floor(asNumber(len)))),
  replace: ([s, find, repl]) =>
    asString(s).replace(new RegExp(escapeForRegExp(asString(find)), "g"), asString(repl)),
  length: ([s]) => asString(s).length,
  ignoreIfNull: ([v]) => (v === null || v === undefined ? "" : v),
  toUpper: ([s]) => asString(s).toUpperCase(),
  toLower: ([s]) => asString(s).toLowerCase(),
  initials: ([s]) =>
    asString(s)
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join(""),
  alphanumeric: ([s]) => /^[A-Za-z0-9]+$/.test(asString(s)),
  trimLeft: ([s]) => asString(s).replace(/^\s+/, ""),
  delimiterCapitalize: ([s]) =>
    asString(s)
      .split(/([\s-])/)
      .map((part) => (part.length > 0 && /^[A-Za-z]/.test(part) ? part[0].toUpperCase() + part.slice(1) : part))
      .join(""),
  textBefore: ([s, delim]) => {
    const str = asString(s);
    const d = asString(delim);
    const idx = str.indexOf(d);
    return idx === -1 ? str : str.slice(0, idx);
  },
  textAfter: ([s, delim]) => {
    const str = asString(s);
    const d = asString(delim);
    const idx = str.indexOf(d);
    return idx === -1 ? "" : str.slice(idx + d.length);
  },
  textAfterLast: ([s, delim]) => {
    const str = asString(s);
    const d = asString(delim);
    const idx = str.lastIndexOf(d);
    return idx === -1 ? "" : str.slice(idx + d.length);
  },
  add: ([a, b]) => asNumber(a) + asNumber(b),
  subtract: ([a, b]) => asNumber(a) - asNumber(b),
  formatDate: ([date, format]) => formatDate(asString(date), asString(format)),
  forEach: () => {
    throw new Error("forEach is not yet supported in the local evaluator");
  },
};

function evalNode(
  node: ASTNode,
  data: Record<string, unknown>,
  trace: EvalTrace,
): unknown {
  if (node.kind === "string") {
    trace.set(node.id, { value: node.value });
    return node.value;
  }
  if (node.kind === "number") {
    trace.set(node.id, { value: node.value });
    return node.value;
  }
  if (node.kind === "field") {
    const value = getField(data, node.path);
    trace.set(node.id, { value });
    return value;
  }

  // fn
  const impl = FN_IMPLS[node.name];
  if (!impl) {
    const err = `Unknown function "${node.name}"`;
    trace.set(node.id, { value: undefined, error: err });
    return undefined;
  }

  if (node.name === "if") {
    if (node.args.length < 3) {
      const err = "if requires 3 arguments";
      trace.set(node.id, { value: undefined, error: err });
      return undefined;
    }
    const cond = evalNode(node.args[0], data, trace);
    const branch = isTruthy(cond) ? 1 : 2;
    const value = evalNode(node.args[branch], data, trace);
    trace.set(node.id, { value, branchTaken: branch });
    return value;
  }

  try {
    const argValues = node.args.map((a) => evalNode(a, data, trace));
    const value = impl(argValues);
    trace.set(node.id, { value });
    return value;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    trace.set(node.id, { value: undefined, error: message });
    return undefined;
  }
}

export function evaluate(ast: ASTNode, data: Record<string, unknown>): EvalResult {
  const trace: EvalTrace = new Map();
  try {
    const value = evalNode(ast, data, trace);
    return { value, trace };
  } catch (err) {
    return {
      value: undefined,
      trace,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
