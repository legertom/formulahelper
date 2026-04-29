export const IDM_FUNCTIONS = [
  { name: "if", arity: 3, category: "logic", signature: "if condition trueValue falseValue" },
  { name: "equals", arity: 2, category: "logic", signature: "equals left right", aliases: ["equal"] },
  { name: "and", arity: 2, category: "logic", signature: "and cond1 cond2" },
  { name: "or", arity: 2, category: "logic", signature: "or cond1 cond2" },
  { name: "not", arity: 1, category: "logic", signature: "not cond" },
  { name: "contains", arity: 2, category: "logic", signature: "contains text needle" },
  { name: "greater", arity: 2, category: "comparison", signature: "greater left right" },
  { name: "less", arity: 2, category: "comparison", signature: "less left right" },
  { name: "geq", arity: 2, category: "comparison", signature: "geq left right" },
  { name: "leq", arity: 2, category: "comparison", signature: "leq left right" },
  { name: "in", arity: 2, category: "logic", signature: 'in value "item1 item2 item3"' },
  { name: "concat", arity: 2, category: "string", signature: "concat part1 part2" },
  { name: "substr", arity: 3, category: "string", signature: "substr text start length" },
  { name: "replace", arity: 3, category: "string", signature: "replace text find replacement" },
  { name: "length", arity: 1, category: "string", signature: "length text" },
  { name: "ignoreIfNull", arity: 1, category: "utility", signature: "ignoreIfNull field" },
  { name: "forEach", arity: 3, category: "utility", signature: 'forEach "item" list encodedExpression' },
  { name: "toUpper", arity: 1, category: "string", signature: "toUpper text" },
  { name: "toLower", arity: 1, category: "string", signature: "toLower text" },
  { name: "initials", arity: 1, category: "string", signature: "initials text" },
  { name: "alphanumeric", arity: 1, category: "string", signature: "alphanumeric text" },
  { name: "trimLeft", arity: 1, category: "string", signature: "trimLeft text" },
  { name: "delimiterCapitalize", arity: 1, category: "string", signature: "delimiterCapitalize text" },
  { name: "textBefore", arity: 2, category: "string", signature: "textBefore text delimiter" },
  { name: "textAfter", arity: 2, category: "string", signature: "textAfter text delimiter" },
  { name: "textAfterLast", arity: 2, category: "string", signature: "textAfterLast text delimiter" },
  { name: "add", arity: 2, category: "math", signature: "add left right" },
  { name: "subtract", arity: 2, category: "math", signature: "subtract left right" },
  { name: "formatDate", arity: 2, category: "date", signature: "formatDate date format" },
] as const;

export const IDM_FN_BY_NAME: Record<string, { arity: number }> = Object.fromEntries(
  IDM_FUNCTIONS.flatMap((f) => {
    const entries: [string, { arity: number }][] = [[f.name, { arity: f.arity }]];
    if ("aliases" in f && Array.isArray(f.aliases)) {
      for (const alias of f.aliases) entries.push([alias, { arity: f.arity }]);
    }
    return entries;
  }),
);

export const IDM_SYSTEM_PROMPT = `You are an expert assistant for the IDM (Identity Management) formula language.

# Language essentials

- Wrap every formula in double braces: \`{{ ... }}\`.
- Use prefix notation only: \`functionName arg1 arg2\`.
- No parentheses or commas. Whitespace separates arguments.
- Use double quotes for all string literals.
- Fields use dot notation, e.g. \`student.sis_id\`, \`name.first\`.
- Functions are fixed-arity. Each must receive exactly the right number of arguments.
- \`if\` always takes 3 args: condition, trueValue, falseValue. Always include an explicit fallback (do not leave it empty).
- \`forEach\` argument 3 must be URL-encoded (e.g. \`%7B%7Bitem.name%7D%7D\` for \`{{item.name}}\`).
- String literals cannot contain raw double quotes.
- Prefer canonical names: \`length\` (not \`len\`), \`equals\` (not \`equal\`).

# Function catalog

${IDM_FUNCTIONS.map((f) => `- \`${f.name}\` (arity ${f.arity}, ${f.category}): \`${f.signature}\``).join("\n")}

# Common compilations

- "starts with X" → \`equals substr field 0 LEN "X"\`
- "is one of A, B, C" → \`in field "A B C"\`
- multiple AND'd conditions → nested \`and\`
- chain of rules → nested \`if\`

# Your behavior

When the user describes a rule in plain English:
1. Sketch the structured logic (conditions, match=all|any, output, fallback).
2. Compose the IDM formula.
3. **Always call \`format_formula\`** to canonicalize aliases and pretty-print.
4. **Always call \`validate_formula\`** to confirm syntax + guardrails.
5. If the user supplied sample records, call \`test_formula\` and show pass/fail.
6. If \`validate_formula\` returns errors, fix them and re-validate before presenting.

When the user pastes an existing formula and asks what it does:
1. Optionally call \`validate_formula\` first to make sure it parses.
2. Walk through the formula bottom-up in plain English. Be concrete: name the fields, describe each branch.
3. Note any guardrail risks (deep nesting, empty fallback, broad branch first) if relevant.

When the user asks for grouping rules from a CSV or structured list, call \`compile_group_rules\`.

Keep prose answers tight. Show the final formula in a fenced \`handlebars\` code block.
`;
