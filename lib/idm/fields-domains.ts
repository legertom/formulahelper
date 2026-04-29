export type FieldEntry = {
  path: string;
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  description: string;
  example?: unknown;
};

export type FieldDomain = {
  id: string;
  label: string;
  description: string;
  fields: FieldEntry[];
};

export const FIELD_DOMAINS: Record<string, FieldDomain> = {
  k12: {
    id: "k12",
    label: "K-12 Identity",
    description: "Common student / teacher / staff / school field paths.",
    fields: [
      { path: "name.first", type: "string", description: "Legal first name", example: "Maria" },
      { path: "name.last", type: "string", description: "Legal last name", example: "Santos" },
      { path: "name.middle", type: "string", description: "Middle name", example: "Elena" },
      { path: "email", type: "string", description: "Primary email", example: "maria@x.edu" },
      { path: "school_name", type: "string", description: "Display name of the user's school" },
      { path: "student.sis_id", type: "string", description: "Student information system ID", example: "STU-847291" },
      { path: "student.student_number", type: "string", description: "Local student number" },
      { path: "student.grade", type: "string", description: 'Grade level ("K", "1"…"12")' },
      { path: "student.graduation_year", type: "string", description: "Expected graduation year" },
      { path: "student.iep_status", type: "boolean", description: "Active IEP flag" },
      { path: "student.ell_status", type: "string", description: '"Active" / "Inactive" / "None"' },
      { path: "student.ell_level", type: "string", description: '"Level 1"…"Level 5"' },
      { path: "student.frl_status", type: "string", description: '"Free" / "Reduced" / "None"' },
      { path: "student.race", type: "string", description: "Race / ethnicity category" },
      { path: "student.gender", type: "string", description: "Gender code" },
      { path: "student.home_language", type: "string", description: "Home language" },
      { path: "student.home_language_code", type: "string", description: "ISO 639-1 / 639-2 code" },
      { path: "student.unweighted_gpa", type: "string", description: "Unweighted GPA as a decimal string" },
      { path: "student.weighted_gpa", type: "string", description: "Weighted GPA as a decimal string" },
      { path: "student.dob", type: "date", description: "Date of birth (ISO)" },
      { path: "teacher.sis_id", type: "string", description: "Teacher SIS ID" },
      { path: "teacher.title", type: "string", description: 'Honorific ("Mr.", "Ms.")' },
      { path: "teacher.teacher_number", type: "string", description: "Local teacher number" },
      { path: "staff.sis_id", type: "string", description: "Staff SIS ID" },
      { path: "staff.title", type: "string", description: "Job title (often ALL CAPS)" },
      { path: "staff.department", type: "string", description: "Department" },
      { path: "staff.roles", type: "array", description: "Assigned roles" },
      { path: "school.name", type: "string", description: "School display name" },
      { path: "school.sis_id", type: "string", description: "School SIS ID" },
      { path: "school.school_number", type: "string", description: "Local school number" },
      { path: "school.high_grade", type: "string", description: "Highest grade served" },
      { path: "school.low_grade", type: "string", description: "Lowest grade served" },
    ],
  },
  hr: {
    id: "hr",
    label: "HR / Workforce",
    description: "Common employee + manager + department field paths.",
    fields: [
      { path: "name.first", type: "string", description: "Legal first name" },
      { path: "name.last", type: "string", description: "Legal last name" },
      { path: "email", type: "string", description: "Work email" },
      { path: "employee.id", type: "string", description: "Employee ID" },
      { path: "employee.title", type: "string", description: "Job title" },
      { path: "employee.level", type: "string", description: 'Level / band ("L4", "Senior")' },
      { path: "employee.start_date", type: "date", description: "Hire date" },
      { path: "employee.cost_center", type: "string", description: "Cost center code" },
      { path: "employee.location", type: "string", description: "Office location" },
      { path: "employee.employment_type", type: "string", description: "Full-time / Part-time / Contractor" },
      { path: "manager.email", type: "string", description: "Manager email" },
      { path: "manager.id", type: "string", description: "Manager employee ID" },
      { path: "department.name", type: "string", description: "Department name" },
      { path: "department.code", type: "string", description: "Department code" },
    ],
  },
  healthcare: {
    id: "healthcare",
    label: "Healthcare",
    description: "Common patient + provider + facility field paths.",
    fields: [
      { path: "name.first", type: "string", description: "Patient first name" },
      { path: "name.last", type: "string", description: "Patient last name" },
      { path: "patient.mrn", type: "string", description: "Medical record number" },
      { path: "patient.dob", type: "date", description: "Date of birth" },
      { path: "patient.sex", type: "string", description: "Sex code" },
      { path: "patient.insurance_plan", type: "string", description: "Insurance plan name" },
      { path: "provider.npi", type: "string", description: "National Provider Identifier" },
      { path: "provider.specialty", type: "string", description: "Specialty" },
      { path: "facility.name", type: "string", description: "Facility name" },
      { path: "facility.tax_id", type: "string", description: "Facility tax ID" },
    ],
  },
};
