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
