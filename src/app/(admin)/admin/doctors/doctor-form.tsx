"use client";

import { useActionState } from "react";
import type { Department } from "@/server/catalog/departments";
import type { DoctorDetail } from "@/server/catalog/doctors";
import type { Service } from "@/server/catalog/services";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { checkboxClass, Field, fieldClass, textareaClass, ValidatedForm } from "@/components/ui/field";
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
    <ValidatedForm action={formAction} className="flex max-w-2xl flex-col gap-6">
      {doctor ? <input type="hidden" name="id" value={doctor.id} /> : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-(--shadow-card)">
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Full name">
            <input
              name="full_name"
              required
              defaultValue={doctor?.full_name}
              disabled={readOnly}
              className={fieldClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
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
            <Field label="Buffer (minutes)" hint="Gap after each visit.">
              <input
                type="number"
                name="buffer_minutes"
                min={0}
                required
                defaultValue={doctor?.buffer_minutes ?? 0}
                disabled={readOnly}
                className={fieldClass}
              />
            </Field>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="doctor-departments-heading"
        className="rounded-xl border border-border bg-surface p-5 shadow-(--shadow-card)"
      >
        <h2 id="doctor-departments-heading" className="text-base font-semibold text-foreground">
          Departments
        </h2>
        <p className="mt-1 text-sm text-muted">
          Assign where this doctor appears in the public catalog.
        </p>
        {departments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Create a department first.</p>
        ) : (
          <div
            role="group"
            aria-label="Departments"
            className="mt-3 grid gap-2 sm:grid-cols-2"
          >
            {departments.map((department) => (
              <label
                key={department.id}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  name="department_id"
                  value={department.id}
                  defaultChecked={selectedDepartments.has(department.id)}
                  disabled={readOnly}
                  className={checkboxClass}
                />
                {department.name}
              </label>
            ))}
          </div>
        )}
      </section>

      <section
        aria-labelledby="doctor-services-heading"
        className="rounded-xl border border-border bg-surface p-5 shadow-(--shadow-card)"
      >
        <h2 id="doctor-services-heading" className="text-base font-semibold text-foreground">
          Services
        </h2>
        <p className="mt-1 text-sm text-muted">
          Patients can only book services assigned here.
        </p>
        {services.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Create a service first.</p>
        ) : (
          <div
            role="group"
            aria-label="Services"
            className="mt-3 grid gap-2 sm:grid-cols-2"
          >
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  name="service_id"
                  value={service.id}
                  defaultChecked={selectedServices.has(service.id)}
                  disabled={readOnly}
                  className={checkboxClass}
                />
                <span>
                  {service.name}
                  <span className="block text-xs text-muted">
                    {service.duration_minutes} min
                    {service.price !== null ? ` · ${service.price}` : ""}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <label className="flex items-start gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={doctor?.is_active ?? true}
          disabled={readOnly}
          className={`mt-0.5 ${checkboxClass}`}
        />
        <span>
          Active
          <span className="mt-0.5 block text-xs text-muted">
            Hidden doctors are not listed on the public site.
          </span>
        </span>
      </label>

      <FormError message={state.error} />
      {readOnly ? (
        <p className="text-sm text-muted">Only owners and admins can edit doctors.</p>
      ) : (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : doctor ? "Save doctor" : "Create doctor"}
        </Button>
      )}
    </ValidatedForm>
  );
}
