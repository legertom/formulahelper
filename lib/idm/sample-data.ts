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

export type ExampleFormula = {
  id: string;
  title: string;
  blurb: string;
  formula: string;
};

export const EXAMPLE_FORMULAS: ExampleFormula[] = [
  {
    id: "school-name",
    title: "Map school SIS ID to friendly name",
    blurb: "Classic if/equals chain on `school.sis_id`.",
    formula: `{{if equals school.sis_id "RUSD-LMS-042" "Sweet Valley Middle" if equals school.sis_id "RUSD-LMS-043" "Sweet Valley High" "Other"}}`,
  },
  {
    id: "staff-role",
    title: "Classify staff into a department",
    blurb: "Maps `staff.title` strings to broad categories.",
    formula: `{{if equals staff.title "SECRETARY" "Business" if equals staff.title "BUSINESS MANAGER" "Business" if equals staff.title "NURSE" "Nurse" if equals staff.title "CUSTODIAN" "Facilities" "Unknown"}}`,
  },
  {
    id: "grad-cohort",
    title: "Senior / Junior cohort",
    blurb: "Outputs cohort label based on `student.graduation_year`.",
    formula: `{{if equals student.graduation_year "2026" "Senior" if equals student.graduation_year "2027" "Junior" if equals student.graduation_year "2028" "Sophomore" "Other"}}`,
  },
  {
    id: "starts-with",
    title: 'SIS ID starts with "STU"',
    blurb: "Demonstrates the `equals substr field 0 LEN` startsWith pattern.",
    formula: `{{if equals substr student.sis_id 0 3 "STU" "Student record" "Other"}}`,
  },
  {
    id: "preferred-name",
    title: "Preferred display name",
    blurb: "Concat first + last with a default fallback.",
    formula: `{{concat concat name.first " " name.last}}`,
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
