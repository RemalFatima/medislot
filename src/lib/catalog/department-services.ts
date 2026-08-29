const DEPARTMENT_SERVICE_NAMES: Record<string, readonly string[]> = {
  gynecology: [
    "Gynecology Consultation",
    "Pregnancy Consultation",
    "Prenatal Checkup",
    "Women's Health Checkup",
    "Menstrual Health Consultation",
  ],
  cardiology: [
    "Cardiology Consultation",
    "Heart Health Checkup",
    "Blood Pressure Consultation",
    "ECG Assessment",
    "Chest Pain Consultation",
  ],
  neurology: [
    "Neurology Consultation",
    "Headache & Migraine Consultation",
    "Neurological Assessment",
    "Seizure Consultation",
    "Nerve Disorder Consultation",
  ],
  "emergency medicine": [
    "Emergency Consultation",
    "Accident & Injury Care",
    "Acute Pain Management",
    "Emergency First Aid",
    "Critical Care Assessment",
  ],
  orthopedics: [
    "Orthopedic Consultation",
    "Joint Pain Consultation",
    "Back Pain Consultation",
    "Sports Injury Consultation",
    "Fracture Follow-up",
  ],
  pediatrics: [
    "Pediatric Consultation",
    "Child Health Checkup",
    "Newborn Checkup",
    "Vaccination Consultation",
    "Child Fever & Illness Consultation",
  ],
  dermatology: [
    "Dermatology Consultation",
    "Acne Consultation",
    "Skin Allergy Consultation",
    "Hair & Scalp Consultation",
    "Skin Infection Consultation",
  ],
  ent: [
    "ENT Consultation",
    "Ear Examination",
    "Sinus Consultation",
    "Hearing Assessment",
    "Throat Consultation",
  ],
  ophthalmology: [
    "Eye Consultation",
    "Vision Checkup",
    "Cataract Consultation",
    "Glaucoma Screening",
    "Eye Infection Consultation",
  ],
  dentistry: [
    "Dental Consultation",
    "Teeth Cleaning",
    "Dental Filling",
    "Tooth Extraction",
    "Gum Care Consultation",
  ],
  pulmonology: [
    "Pulmonology Consultation",
    "Asthma Consultation",
    "Breathing Problem Consultation",
    "Respiratory Infection Consultation",
    "Lung Health Checkup",
  ],
  urology: [
    "Urology Consultation",
    "Kidney Stone Consultation",
    "Urinary Problem Consultation",
    "Bladder Health Consultation",
    "Men's Urology Consultation",
  ],
  endocrinology: [
    "Endocrinology Consultation",
    "Diabetes Consultation",
    "Thyroid Consultation",
    "Hormonal Health Consultation",
    "Metabolic Health Checkup",
  ],
  radiology: [
    "X-Ray Imaging",
    "Ultrasound Scan",
    "CT Scan",
    "MRI Scan",
    "Diagnostic Imaging Consultation",
  ],
  "general medicine": [
    "General Physician Consultation",
    "General Health Checkup",
    "Fever & Infection Consultation",
    "Diabetes & Blood Pressure Checkup",
    "Preventive Health Consultation",
  ],
  "general surgery": [
    "General Surgery Consultation",
    "Hernia Consultation",
    "Gallbladder Consultation",
    "Minor Surgical Procedure",
    "Post-Surgery Follow-up",
  ],
  psychiatry: [
    "Psychiatry Consultation",
    "Anxiety Consultation",
    "Depression Consultation",
    "Stress Management Consultation",
    "Sleep & Mood Consultation",
  ],
  physiotherapy: [
    "Physiotherapy Consultation",
    "Back & Neck Therapy",
    "Joint Rehabilitation",
    "Sports Injury Rehabilitation",
    "Post-Surgery Rehabilitation",
  ],
};

const ALIASES: Record<string, string> = {
  emergency: "emergency medicine",
  "emergency-medicine": "emergency medicine",
  gynae: "gynecology",
  gynaecology: "gynecology",
  "general-medicine": "general medicine",
  "general-surgery": "general surgery",
  gp: "general medicine",
  "eye care": "ophthalmology",
  eyes: "ophthalmology",
  dental: "dentistry",
  ortho: "orthopedics",
  orthopaedics: "orthopedics",
};

export function normalizeCatalogKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function catalogKeyForDepartment(department: {
  name: string;
  slug: string;
}): string | null {
  const candidates = [
    normalizeCatalogKey(department.slug.replace(/-/g, " ")),
    normalizeCatalogKey(department.name),
  ];

  for (const candidate of candidates) {
    const aliased = ALIASES[candidate] ?? candidate;
    if (DEPARTMENT_SERVICE_NAMES[aliased]) {
      return aliased;
    }
  }

  return null;
}

function serviceNameKey(name: string): string {
  return normalizeCatalogKey(name);
}

export function serviceIdsForDepartments(
  departmentIds: Iterable<string>,
  departments: Array<{ id: string; name: string; slug: string }>,
  services: Array<{ id: string; name: string }>,
): Set<string> {
  const wanted = new Set<string>();
  const byId = new Map(departments.map((department) => [department.id, department]));

  for (const departmentId of departmentIds) {
    const department = byId.get(departmentId);
    if (!department) {
      continue;
    }
    const key = catalogKeyForDepartment(department);
    if (!key) {
      continue;
    }
    for (const name of DEPARTMENT_SERVICE_NAMES[key]) {
      wanted.add(serviceNameKey(name));
    }
  }

  const ids = new Set<string>();
  for (const service of services) {
    if (wanted.has(serviceNameKey(service.name))) {
      ids.add(service.id);
    }
  }
  return ids;
}
