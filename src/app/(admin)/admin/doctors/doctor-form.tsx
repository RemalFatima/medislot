"use client";

import { useActionState } from "react";
import type { Department } from "@/server/catalog/departments";
import type { DoctorDetail } from "@/server/catalog/doctors";
import type { Service } from "@/server/catalog/services";
import { Field, fieldClass, textareaClass } from "@/components/ui/field";
import type { CatalogFormState } from "../form-utils";
import { createDoctorAction, updateDoctorAction } from "./actions";

const initialState: CatalogFormState = {};

export function DoctorForm({
  doctor,
  departments,
  services,
  readOnly,
}: {
  doctor?: DoctorDetail;
  departments: Department[];
  services: Service[];
  readOnly: boolean;
}) {
  const action = doctor ? updateDoctorAction : createDoctorAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const selectedDepartments = new Set(doctor?.department_ids ?? []);
  const selectedServices = new Set(doctor?.service_ids ?? []);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {doctor ? <input type="hidden" name="id" value={doctor.id} /> : null}
      <Field label="Full name">
        <input
          name="full_name"
          required
          defaultValue={doctor?.full_name}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <Field label="Profession">
        <input
          name="profession"
          required
          placeholder="Consultant, GP, Surgeon…"
          defaultValue={doctor?.profession}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <Field label="Specialization">
        <input
          name="specialization"
          defaultValue={doctor?.specialization ?? ""}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <Field label="Qualifications">
        <input
          name="qualifications"
          defaultValue={doctor?.qualifications ?? ""}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <Field label="Bio">
        <textarea
          name="bio"
          rows={5}
          defaultValue={doctor?.bio ?? ""}
          disabled={readOnly}
          className={textareaClass}
        />
      </Field>
      <Field label="Photo URL">
        <input
          name="photo_url"
          defaultValue={doctor?.photo_url ?? ""}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Experience (years)">
          <input
            type="number"
            name="experience_years"
            min={0}
            defaultValue={doctor?.experience_years ?? ""}
            disabled={readOnly}
            className={fieldClass}
          />
        </Field>
        <Field label="Consultation fee">
          <input
            type="number"
            name="consultation_fee"
            min={0}
            step="0.01"
            defaultValue={doctor?.consultation_fee ?? ""}
            disabled={readOnly}
            className={fieldClass}
          />
        </Field>
        <Field label="Buffer (minutes)">
          <input
            type="number"
            name="buffer_minutes"
            min={0}
            defaultValue={doctor?.buffer_minutes ?? 0}
            disabled={readOnly}
            className={fieldClass}
          />
        </Field>
      </div>
      <fieldset className="rounded-lg border border-zinc-200 p-3">
        <legend className="px-1 text-sm font-medium text-zinc-800">
          Departments
        </legend>
        {departments.length === 0 ? (
          <p className="text-sm text-zinc-500">Create a department first.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {departments.map((department) => (
              <label key={department.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="department_id"
                  value={department.id}
                  defaultChecked={selectedDepartments.has(department.id)}
                  disabled={readOnly}
                />
                {department.name}
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <fieldset className="rounded-lg border border-zinc-200 p-3">
        <legend className="px-1 text-sm font-medium text-zinc-800">Services</legend>
        {services.length === 0 ? (
          <p className="text-sm text-zinc-500">Create a service first.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="service_id"
                  value={service.id}
                  defaultChecked={selectedServices.has(service.id)}
                  disabled={readOnly}
                />
                {service.name} ({service.duration_minutes} min)
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <label className="flex items-center gap-2 text-sm text-zinc-800">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={doctor?.is_active ?? true}
          disabled={readOnly}
        />
        Active (visible on the public site)
      </label>
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {readOnly ? null : (
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : doctor ? "Save doctor" : "Create doctor"}
        </button>
      )}
    </form>
  );
}
