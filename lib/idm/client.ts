import { localValidate } from "./local-validator";

const DEFAULT_BASE = "https://formulastudio.net";

function baseUrl(): string {
  return process.env.IDM_API_BASE?.replace(/\/$/, "") || DEFAULT_BASE;
}

async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Non-JSON response from ${path}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    const errMsg =
      typeof parsed === "object" && parsed && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : `${res.status} ${res.statusText}`;
    throw new Error(`${path} failed: ${errMsg}`);
  }
  return parsed as T;
}

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

export type ValidateResult = {
  source: "live" | "local-fallback";
  valid: boolean;
  errors: string[];
  warnings: string[];
  raw?: unknown;
  fallbackReason?: string;
};

export async function validateFormula(formula: string): Promise<ValidateResult> {
  const t = withTimeout(8000);
  try {
    const json = await postJson<{
      success: boolean;
      valid: boolean;
      errors?: string[];
      warnings?: string[];
    }>("/api/idm-validate", { formula, mode: "validate" }, t.signal);
    return {
      source: "live",
      valid: !!json.valid,
      errors: json.errors ?? [],
      warnings: json.warnings ?? [],
      raw: json,
    };
  } catch (err) {
    const local = localValidate(formula);
    return {
      ...local,
      source: "local-fallback",
      fallbackReason: err instanceof Error ? err.message : "live validator unreachable",
    };
  } finally {
    t.cancel();
  }
}

export type LintResult = {
  source: "live" | "unavailable";
  valid: boolean;
  findings: Array<{
    ruleId: string;
    severity: "error" | "warning" | "info";
    title?: string;
    message: string;
    guidance?: string;
  }>;
  fallbackReason?: string;
};

export async function lintFormula(formula: string): Promise<LintResult> {
  const t = withTimeout(8000);
  try {
    const json = await postJson<{
      success: boolean;
      mode: "lint";
      valid: boolean;
      findings?: LintResult["findings"];
    }>("/api/idm-validate", { formula, mode: "lint" }, t.signal);
    return { source: "live", valid: !!json.valid, findings: json.findings ?? [] };
  } catch (err) {
    return {
      source: "unavailable",
      valid: true,
      findings: [],
      fallbackReason: err instanceof Error ? err.message : "live linter unreachable",
    };
  } finally {
    t.cancel();
  }
}

export type FormatResult = {
  source: "live" | "unavailable";
  formula: string;
  options?: { pretty: boolean; canonicalize: boolean };
  fallbackReason?: string;
};

export async function formatFormula(
  formula: string,
  options: { pretty?: boolean; canonicalize?: boolean } = {},
): Promise<FormatResult> {
  const t = withTimeout(8000);
  try {
    const json = await postJson<{
      success: boolean;
      formula: string;
      options: { pretty: boolean; canonicalize: boolean };
    }>(
      "/api/idm-format",
      {
        formula,
        pretty: options.pretty !== false,
        canonicalize: options.canonicalize !== false,
      },
      t.signal,
    );
    return { source: "live", formula: json.formula, options: json.options };
  } catch (err) {
    return {
      source: "unavailable",
      formula,
      fallbackReason: err instanceof Error ? err.message : "live formatter unreachable",
    };
  } finally {
    t.cancel();
  }
}

export type TestCase = { name?: string; data: Record<string, unknown>; expected?: string };
export type TestResult = {
  source: "live" | "unavailable";
  count: number;
  compared: number;
  passCount: number;
  failCount: number;
  results: Array<{ name: string; output: unknown; expected?: string; passed: boolean | null }>;
  fallbackReason?: string;
};

export async function testFormula(formula: string, cases: TestCase[]): Promise<TestResult> {
  const t = withTimeout(10000);
  try {
    const json = await postJson<TestResult>(
      "/api/idm-test",
      { formula, cases },
      t.signal,
    );
    return { ...json, source: "live" };
  } catch (err) {
    return {
      source: "unavailable",
      count: cases.length,
      compared: 0,
      passCount: 0,
      failCount: 0,
      results: [],
      fallbackReason: err instanceof Error ? err.message : "live test runner unreachable",
    };
  } finally {
    t.cancel();
  }
}

export type GroupRulesInput = {
  defaultOutput?: string;
  rules?: Array<{
    priority: number;
    output: string;
    match: "all" | "any";
    conditions: Array<{ field: string; operator: string; value: string }>;
  }>;
  csv?: string;
};

export type GroupRulesResult = {
  source: "live" | "unavailable";
  success: boolean;
  count?: number;
  defaultOutput?: string;
  formulas?: {
    list?: Array<{ priority: number; output: string; condition: string; formula: string }>;
    nested?: string;
  };
  fallbackReason?: string;
};

export async function compileGroupRules(input: GroupRulesInput): Promise<GroupRulesResult> {
  const t = withTimeout(10000);
  try {
    const json = await postJson<GroupRulesResult>("/api/idm-group-rules", input, t.signal);
    return { ...json, source: "live", success: true };
  } catch (err) {
    return {
      source: "unavailable",
      success: false,
      fallbackReason: err instanceof Error ? err.message : "group-rule compiler unreachable",
    };
  } finally {
    t.cancel();
  }
}
