import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import {
  getOrganizationId,
  tryGetOrganizationId,
} from "@/server/tenant/getOrganizationId";
import { doctorInputSchema } from "./schemas";
import { uniqueOrgSlug } from "./unique-slug";

export type DoctorListItem = {
  id: string;
  full_name: string;
  slug: string;
  profession: string;
  specialization: string | null;
  photo_url: string | null;
  consultation_fee: number | null;
  is_active: boolean;
  departments: { id: string; name: string; slug: string }[];
};

export type DoctorDetail = DoctorListItem & {
  qualifications: string | null;
  experience_years: number | null;
  bio: string | null;
  buffer_minutes: number;
  department_ids: string[];
  service_ids: string[];
  services: {
    id: string;
    name: string;
    slug: string;
    duration_minutes: number;
    price: number | null;
  }[];
};

type DoctorRow = {
  id: string;
  full_name: string;
  slug: string;
  profession: string;
  specialization: string | null;
  photo_url: string | null;
  consultation_fee: number | null;
  is_active: boolean;
  qualifications?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  buffer_minutes?: number;
  doctor_departments?: {
    department_id: string;
    departments: { id: string; name: string; slug: string } | null;
  }[];
  doctor_services?: {
    service_id: string;
    services: {
      id: string;
      name: string;
      slug: string;
      duration_minutes: number;
      price: number | null;
    } | null;
  }[];
};

function mapListItem(row: DoctorRow): DoctorListItem {
  const departments = (row.doctor_departments ?? [])
    .map((join) => join.departments)
    .filter((department): department is NonNullable<typeof department> =>
      Boolean(department),
    );

  return {
    id: row.id,
    full_name: row.full_name,
    slug: row.slug,
    profession: row.profession,
    specialization: row.specialization,
    photo_url: row.photo_url,
    consultation_fee: row.consultation_fee,
    is_active: row.is_active,
    departments,
  };
}

export async function listDoctors(options?: {
  activeOnly?: boolean;
  departmentSlug?: string;
  profession?: string;
  specialization?: string;
}): Promise<DoctorListItem[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return [];
  }

  const supabase = await createClient();

  let doctorIds: string[] | null = null;
  if (options?.departmentSlug) {
    const { data: department } = await supabase
      .from("departments")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", options.departmentSlug)
      .maybeSingle();

    if (!department) {
      return [];
    }

    const { data: joins } = await supabase
      .from("doctor_departments")
      .select("doctor_id")
      .eq("organization_id", organizationId)
      .eq("department_id", department.id);

    doctorIds = (joins ?? []).map((row) => row.doctor_id);
    if (doctorIds.length === 0) {
      return [];
    }
  }

  let query = supabase
    .from("doctors")
    .select(
      `
      id,
      full_name,
      slug,
      profession,
      specialization,
      photo_url,
      consultation_fee,
      is_active,
      doctor_departments (
        department_id,
        departments ( id, name, slug )
      )
    `,
    )
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  if (doctorIds) {
    query = query.in("id", doctorIds);
  }

  if (options?.profession) {
    query = query.eq("profession", options.profession);
  }

  if (options?.specialization) {
    query = query.eq("specialization", options.specialization);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DoctorRow[]).map(mapListItem);
}

export async function getDoctorById(id: string): Promise<DoctorDetail | null> {
  const organizationId = await getOrganizationId();
  return loadDoctor({ organizationId, id });
}

export async function getDoctorBySlug(
  slug: string,
): Promise<DoctorDetail | null> {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return null;
  }

  return loadDoctor({ organizationId, slug, activeOnly: true });
}

async function loadDoctor(options: {
  organizationId: string;
  id?: string;
  slug?: string;
  activeOnly?: boolean;
}): Promise<DoctorDetail | null> {
  const supabase = await createClient();
  let query = supabase
    .from("doctors")
    .select(
      `
      id,
      full_name,
      slug,
      profession,
      specialization,
      photo_url,
      consultation_fee,
      is_active,
      qualifications,
      experience_years,
      bio,
      buffer_minutes,
      doctor_departments (
        department_id,
        departments ( id, name, slug )
      ),
      doctor_services (
        service_id,
        services ( id, name, slug, duration_minutes, price )
      )
    `,
    )
    .eq("organization_id", options.organizationId);

  if (options.id) {
    query = query.eq("id", options.id);
  }

  if (options.slug) {
    query = query.eq("slug", options.slug);
  }

  if (options.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as DoctorRow;
  const list = mapListItem(row);
  const services = (row.doctor_services ?? [])
    .map((join) => join.services)
    .filter((service): service is NonNullable<typeof service> =>
      Boolean(service),
    );

  return {
    ...list,
    qualifications: row.qualifications ?? null,
    experience_years: row.experience_years ?? null,
    bio: row.bio ?? null,
    buffer_minutes: row.buffer_minutes ?? 0,
    department_ids: (row.doctor_departments ?? []).map(
      (join) => join.department_id,
    ),
    service_ids: (row.doctor_services ?? []).map((join) => join.service_id),
    services,
  };
}

async function replaceJoins(
  doctorId: string,
  organizationId: string,
  departmentIds: string[],
  serviceIds: string[],
) {
  const supabase = await createClient();

  const { error: deleteDepartmentsError } = await supabase
    .from("doctor_departments")
    .delete()
    .eq("organization_id", organizationId)
    .eq("doctor_id", doctorId);

  if (deleteDepartmentsError) {
    throw new Error(deleteDepartmentsError.message);
  }

  const { error: deleteServicesError } = await supabase
    .from("doctor_services")
    .delete()
    .eq("organization_id", organizationId)
    .eq("doctor_id", doctorId);

  if (deleteServicesError) {
    throw new Error(deleteServicesError.message);
  }

  if (departmentIds.length > 0) {
    const { error } = await supabase.from("doctor_departments").insert(
      departmentIds.map((department_id) => ({
        organization_id: organizationId,
        doctor_id: doctorId,
        department_id,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  if (serviceIds.length > 0) {
    const { error } = await supabase.from("doctor_services").insert(
      serviceIds.map((service_id) => ({
        organization_id: organizationId,
        doctor_id: doctorId,
        service_id,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function createDoctor(input: unknown): Promise<DoctorDetail> {
  const parsed = doctorInputSchema.parse(input);
  const organizationId = await getOrganizationId();
  const slug = await uniqueOrgSlug("doctors", organizationId, parsed.full_name);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("doctors")
    .insert({
      organization_id: organizationId,
      full_name: parsed.full_name,
      slug,
      profession: parsed.profession,
      specialization: parsed.specialization,
      qualifications: parsed.qualifications,
      bio: parsed.bio,
      photo_url: parsed.photo_url,
      experience_years: parsed.experience_years,
      consultation_fee: parsed.consultation_fee,
      buffer_minutes: parsed.buffer_minutes,
      is_active: parsed.is_active,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create doctor.");
  }

  await replaceJoins(
    data.id,
    organizationId,
    parsed.department_ids,
    parsed.service_ids,
  );

  const doctor = await getDoctorById(data.id);
  if (!doctor) {
    throw new Error("Doctor was created but could not be reloaded.");
  }

  return doctor;
}

export async function updateDoctor(
  id: string,
  input: unknown,
): Promise<DoctorDetail> {
  const parsed = doctorInputSchema.parse(input);
  const organizationId = await getOrganizationId();
  const slug = await uniqueOrgSlug(
    "doctors",
    organizationId,
    parsed.full_name,
    id,
  );
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("doctors")
    .update({
      full_name: parsed.full_name,
      slug,
      profession: parsed.profession,
      specialization: parsed.specialization,
      qualifications: parsed.qualifications,
      bio: parsed.bio,
      photo_url: parsed.photo_url,
      experience_years: parsed.experience_years,
      consultation_fee: parsed.consultation_fee,
      buffer_minutes: parsed.buffer_minutes,
      is_active: parsed.is_active,
    })
    .eq("organization_id", organizationId)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Doctor not found.");
  }

  await replaceJoins(
    id,
    organizationId,
    parsed.department_ids,
    parsed.service_ids,
  );

  const doctor = await getDoctorById(id);
  if (!doctor) {
    throw new Error("Doctor was updated but could not be reloaded.");
  }

  return doctor;
}

export async function listDoctorProfessions(): Promise<string[]> {
  const doctors = await listDoctors({ activeOnly: true });
  return [...new Set(doctors.map((doctor) => doctor.profession))].sort();
}

export async function listDoctorSpecializations(): Promise<string[]> {
  const doctors = await listDoctors({ activeOnly: true });
  return [
    ...new Set(
      doctors
        .map((doctor) => doctor.specialization)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort();
}
