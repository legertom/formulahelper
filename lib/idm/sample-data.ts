export const SAMPLE_RECORD = {
  _id: "usr_7f3a9b2c1d4e5f6a",
  district: "dist_4a8b2c1d3e5f",
  name: { first: "Maria", last: "Santos", middle: "Elena" },
  email: "maria.santos@sweetvalley.k12.edu",
  school_name: "Sweet Valley Middle",
  student: {
    _id: "stu_7f3a9b2c1d4e5f6a",
    grade: "7",
    graduation_year: "2027",
    sis_id: "STU-847291",
    student_number: "10742",
    home_language: "Spanish",
    home_language_code: "ES",
    gender: "Female",
    race: "Hispanic or Latino",
    iep_status: false,
    ell_status: "Active",
    frl_status: "Reduced",
    school: "sch_4a8b2c1d",
    state_id: "NY-2024-00384",
    unweighted_gpa: "3.45",
    weighted_gpa: "3.67",
    location: { city: "Sweet Valley", state: "NY", zip: "10002" },
  },
  teacher: { sis_id: "TCH-2847", title: "Ms.", school: "sch_4a8b2c1d" },
  staff: {
    sis_id: "ADM-0394",
    title: "Deputy Head",
    department: "Administration",
    roles: ["Administrator", "IT Coordinator"],
  },
  school: {
    name: "Sweet Valley Middle",
    sis_id: "RUSD-LMS-042",
    state_id: "NY-SCH-2024-042",
    school_number: "042",
    high_grade: "8",
    low_grade: "6",
  },
};

export const SAMPLE_RECORD_JSON = JSON.stringify(SAMPLE_RECORD, null, 2);

export type SamplePersona = {
  id: string;
  label: string;
  blurb: string;
  record: Record<string, unknown>;
};

export const SAMPLE_PERSONAS: SamplePersona[] = [
  {
    id: "maria-7",
    label: "Maria · grade 7",
    blurb: "ELL middle schooler at Sweet Valley Middle. Default record.",
    record: SAMPLE_RECORD,
  },
  {
    id: "jamal-12",
    label: "Jamal · grade 12 senior",
    blurb: "Graduating senior at Sweet Valley High. Strong GPA.",
    record: {
      _id: "usr_3a7b2c9d",
      district: "dist_4a8b2c1d3e5f",
      name: { first: "Jamal", last: "Carter", middle: "Andre" },
      email: "jamal.carter@sweetvalley.k12.edu",
      school_name: "Sweet Valley High",
      student: {
        _id: "stu_3a7b2c9d",
        grade: "12",
        graduation_year: "2026",
        sis_id: "STU-203847",
        student_number: "20384",
        home_language: "English",
        gender: "Male",
        race: "Black or African American",
        iep_status: false,
        ell_status: "Inactive",
        frl_status: "None",
        unweighted_gpa: "3.92",
        weighted_gpa: "4.18",
      },
      school: {
        name: "Sweet Valley High",
        sis_id: "RUSD-LMS-043",
        school_number: "043",
        high_grade: "12",
        low_grade: "9",
      },
    },
  },
  {
    id: "amira-iep",
    label: "Amira · IEP active",
    blurb: "5th grader with active IEP, requires special-ed flag.",
    record: {
      _id: "usr_8c4d1e7f",
      name: { first: "Amira", last: "Hassan" },
      email: "amira.hassan@sweetvalley.k12.edu",
      school_name: "Locust Elementary",
      student: {
        grade: "5",
        graduation_year: "2033",
        sis_id: "STU-552847",
        ell_status: "Active",
        ell_level: "Level 2",
        iep_status: true,
        gender: "Female",
        race: "Asian",
        home_language: "Arabic",
      },
      school: {
        name: "Locust Elementary",
        sis_id: "RUSD-LMS-044",
        school_number: "044",
        high_grade: "5",
        low_grade: "K",
      },
    },
  },
  {
    id: "thompson-teacher",
    label: "Thompson · teacher",
    blurb: "Mid-career teacher record. No `student` block.",
    record: {
      _id: "usr_5d2e8a1b",
      name: { first: "Janet", last: "Thompson" },
      email: "jthompson@sweetvalley.k12.edu",
      school_name: "Sweet Valley Middle",
      teacher: {
        sis_id: "TCH-2847",
        title: "Ms.",
        teacher_number: "T-156",
        school: "sch_4a8b2c1d",
        certification_id: "CERT-992B",
      },
      school: {
        name: "Sweet Valley Middle",
        sis_id: "RUSD-LMS-042",
      },
    },
  },
  {
    id: "patel-staff",
    label: "Patel · staff (custodian)",
    blurb: "Hits the Facilities branch in staff-role classifiers.",
    record: {
      _id: "usr_2e7c9b4a",
      name: { first: "Kiran", last: "Patel" },
      email: "kpatel@sweetvalley.k12.edu",
      school_name: "Sweet Valley Middle",
      staff: {
        sis_id: "ADM-0394",
        title: "CUSTODIAN",
        department: "Facilities",
        roles: ["Maintenance"],
        staff_id: "ADM-0394",
      },
      school: {
        name: "Sweet Valley Middle",
        sis_id: "RUSD-LMS-042",
      },
    },
  },
  {
    id: "missing-fields",
    label: "Edge · missing fields",
    blurb: "Sparse record. Useful for null-safety / fallback testing.",
    record: {
      _id: "usr_blank",
      name: { first: "Pat", last: "Doe" },
      email: "pat.doe@example.edu",
      student: { sis_id: "STU-000000" },
    },
  },
];

export const SAMPLE_PERSONAS_BY_ID = Object.fromEntries(
  SAMPLE_PERSONAS.map((p) => [p.id, p]),
) as Record<string, SamplePersona>;

export type ExampleFormula = {
  id: string;
  title: string;
  blurb: string;
  formula: string;
};

export type ExampleCategory = "logic" | "string" | "naming" | "ou" | "date" | "ai-friendly";

export type ExampleFormulaWithCategory = ExampleFormula & { category: ExampleCategory };

export const EXAMPLE_FORMULAS: ExampleFormulaWithCategory[] = [
  // -------- Logic + classification --------
  {
    id: "school-name",
    title: "Map school SIS ID → friendly name",
    blurb: "Classic if/equals chain on `school.sis_id`. The bread-and-butter IDM pattern.",
    category: "logic",
    formula: `{{if equals school.sis_id "RUSD-LMS-042" "Sweet Valley Middle" if equals school.sis_id "RUSD-LMS-043" "Sweet Valley High" "Other"}}`,
  },
  {
    id: "staff-role",
    title: "Classify staff into a department",
    blurb: "Maps `staff.title` strings to broad role categories with a final `Unknown` fallback.",
    category: "logic",
    formula: `{{if equals staff.title "SECRETARY" "Business" if equals staff.title "BUSINESS MANAGER" "Business" if equals staff.title "NURSE" "Nurse" if equals staff.title "CUSTODIAN" "Facilities" if equals staff.title "BUS DRIVER" "Transportation" "Unknown"}}`,
  },
  {
    id: "grad-cohort",
    title: "Senior / Junior / Sophomore cohort",
    blurb: "Cohort label from `student.graduation_year`.",
    category: "logic",
    formula: `{{if equals student.graduation_year "2026" "Senior" if equals student.graduation_year "2027" "Junior" if equals student.graduation_year "2028" "Sophomore" "Other"}}`,
  },
  {
    id: "iep-flag",
    title: "IEP active flag",
    blurb: "Boolean → label. Note `equals` against the string `\"true\"` because IDM is loosely typed.",
    category: "logic",
    formula: `{{if equals student.iep_status "true" "IEP Active" "Standard"}}`,
  },
  {
    id: "ell-tier",
    title: "ELL tier (nested ifs)",
    blurb: "Active ELL → drill into ell_level; otherwise Not ELL. Demonstrates 2-deep nesting.",
    category: "logic",
    formula: `{{if equals student.ell_status "Active" if equals student.ell_level "Level 1" "ELL Beginner" if equals student.ell_level "Level 2" "ELL Developing" "ELL Advanced" "Not ELL"}}`,
  },
  {
    id: "gpa-honors",
    title: "GPA → honors band",
    blurb: "Numeric comparison via `greater`. Note the GPA is a string field; coerced.",
    category: "logic",
    formula: `{{if greater student.unweighted_gpa "3.5" "Honors" if greater student.unweighted_gpa "2.0" "Good Standing" "Probation"}}`,
  },
  {
    id: "and-secondary-iep",
    title: "Secondary-school IEP (and)",
    blurb: "Combines `and` with `greater` on grade and `equals` on IEP status. Two conditions, both must hold.",
    category: "logic",
    formula: `{{if and equals student.iep_status "true" greater student.grade "8" "Secondary IEP" "Other"}}`,
  },
  {
    id: "in-multi-school",
    title: "Member of any Sweet Valley school",
    blurb: "Uses `in` against a space-separated string list. Tighter than chained `or equals`.",
    category: "logic",
    formula: `{{if in school_name "Sweet Valley Middle Sweet Valley High" "Sweet Valley District" "Other"}}`,
  },
  {
    id: "or-special-ed",
    title: "Special-needs flag (or)",
    blurb: "Either IEP active OR ELL active → flag. Two `or` calls because every fn is fixed-arity.",
    category: "logic",
    formula: `{{if or equals student.iep_status "true" equals student.ell_status "Active" "Special Needs" "General"}}`,
  },
  {
    id: "not-active",
    title: "Negation",
    blurb: "Demonstrates `not`. Outputs Inactive if the user is NOT actively enrolled.",
    category: "logic",
    formula: `{{if not equals student.ell_status "Active" "Inactive ELL" "Active ELL"}}`,
  },
  {
    id: "leq-grade",
    title: "Elementary band (leq)",
    blurb: "Uses `leq` (less-or-equal) on grade. Builds an OU bucket up to grade 5.",
    category: "logic",
    formula: `{{if leq student.grade "5" "OU=Elementary" if leq student.grade "8" "OU=Middle" "OU=High"}}`,
  },

  // -------- String manipulation --------
  {
    id: "starts-with",
    title: 'SIS ID starts with "STU" (substr)',
    blurb: "The canonical startsWith pattern: `equals substr field 0 LEN \"STU\"`.",
    category: "string",
    formula: `{{if equals substr student.sis_id 0 3 "STU" "Student record" "Other"}}`,
  },
  {
    id: "ends-with-domain",
    title: "Email ends with school domain",
    blurb: "`textAfter` extracts after the `@`, then compare. Combines two functions.",
    category: "string",
    formula: `{{if equals textAfter email "@" "sweetvalley.k12.edu" "Internal" "External"}}`,
  },
  {
    id: "contains-substring",
    title: "Title contains \"Director\"",
    blurb: "`contains` is the simple substring check.",
    category: "string",
    formula: `{{if contains staff.title "Director" "Leadership" "Staff"}}`,
  },
  {
    id: "replace-spaces",
    title: "School name → kebab-case",
    blurb: "`replace` swaps spaces for hyphens. `toLower` makes it URL-safe.",
    category: "string",
    formula: `{{toLower replace school_name " " "-"}}`,
  },
  {
    id: "length-check",
    title: "Long-vs-short first name",
    blurb: "`length` returns char count; combine with `greater`.",
    category: "string",
    formula: `{{if greater length name.first 5 "long-name" "short-name"}}`,
  },
  {
    id: "alphanumeric-check",
    title: "Username is alphanumeric",
    blurb: "`alphanumeric` returns true if the string contains only letters and digits.",
    category: "string",
    formula: `{{if alphanumeric student.sis_id "valid" "needs review"}}`,
  },

  // -------- Naming --------
  {
    id: "preferred-name",
    title: "First + last (concat)",
    blurb: "`concat` is fixed-arity 2; chain it for 3 segments.",
    category: "naming",
    formula: `{{concat concat name.first " " name.last}}`,
  },
  {
    id: "last-comma-first",
    title: '"Last, First" formal name',
    blurb: "Same shape, different order. Common for sorted directory listings.",
    category: "naming",
    formula: `{{concat concat name.last ", " name.first}}`,
  },
  {
    id: "initials",
    title: "Two-letter initials",
    blurb: "`initials` strips to the first letter of each whitespace-separated word, uppercased.",
    category: "naming",
    formula: `{{initials concat concat name.first " " name.last}}`,
  },
  {
    id: "username-from-email",
    title: "Username (textBefore @)",
    blurb: "Extract the local part of an email.",
    category: "naming",
    formula: `{{textBefore email "@"}}`,
  },
  {
    id: "title-case-school",
    title: "Title-case the school name",
    blurb: "`delimiterCapitalize` capitalizes after spaces and hyphens.",
    category: "naming",
    formula: `{{delimiterCapitalize toLower school_name}}`,
  },

  // -------- OU patterns --------
  {
    id: "ou-by-grade",
    title: "OU path by grade",
    blurb: "Common pattern for Active Directory-style OU strings.",
    category: "ou",
    formula: `{{if equals student.grade "K" "OU=Kindergarten,OU=Students" if leq student.grade "5" "OU=Elementary,OU=Students" if leq student.grade "8" "OU=Middle,OU=Students" "OU=High,OU=Students"}}`,
  },
  {
    id: "ou-staff-vs-student",
    title: "OU: staff vs student",
    blurb: "Branches on which field is populated. `ignoreIfNull` makes empty fields safe.",
    category: "ou",
    formula: `{{if equals length ignoreIfNull staff.sis_id 0 "OU=Students" "OU=Staff"}}`,
  },

  // -------- Date --------
  {
    id: "dob-year",
    title: "DOB → year only",
    blurb: "`formatDate` accepts tokens YYYY, YY, MM, MMM, MMMM, DD, Do.",
    category: "date",
    formula: `{{formatDate student.dob "YYYY"}}`,
  },
  {
    id: "dob-pretty",
    title: "DOB → \"April 28, 2026\"",
    blurb: "Friendly date format for human-readable display.",
    category: "date",
    formula: `{{formatDate student.dob "MMMM Do, YYYY"}}`,
  },

  // -------- AI-friendly idioms --------
  {
    id: "explicit-fallback",
    title: "Always include an explicit fallback",
    blurb: "IDM `if` is fixed-arity 3. Always supply a meaningful third arg, never an empty string.",
    category: "ai-friendly",
    formula: `{{if equals student.iep_status "true" "IEP Active" "uncategorized"}}`,
  },
  {
    id: "ignore-null-safe",
    title: "Null-safe field access",
    blurb: "`ignoreIfNull` returns `\"\"` for missing fields instead of erroring.",
    category: "ai-friendly",
    formula: `{{ignoreIfNull student.preferred_name.first}}`,
  },
];

export function extractFieldPaths(value: unknown, prefix = "", out: string[] = []): string[] {
  if (value === null || value === undefined) return out;
  if (Array.isArray(value)) {
    if (prefix) out.push(prefix);
    return out;
  }
  if (typeof value !== "object") {
    if (prefix) out.push(prefix);
    return out;
  }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (k.startsWith("_") && prefix === "") continue;
    const next = prefix ? `${prefix}.${k}` : k;
    extractFieldPaths(v, next, out);
  }
  return out;
}
