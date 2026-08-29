"use client";

import { useActionState, useMemo, useState } from "react";
import type { Department } from "@/server/catalog/departments";
import type { DoctorDetail } from "@/server/catalog/doctors";
import type { Service } from "@/server/catalog/services";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { checkboxClass, Field, fieldClass, textareaClass, ValidatedForm } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { serviceIdsForDepartments } from "@/lib/catalog/department-services";
import type { CatalogFormState } from "../form-utils";
import { createDoctorAction, updateDoctorAction } from "./actions";

const initialState: CatalogFormState = {};

function toggleValue(values: string[], value: string, checked: boolean): string[] {
  if (checked) {
    return values.includes(value) ? values : [...values, value];
  }
  return values.filter((item) => item !== value);
}

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
  const [departmentIds, setDepartmentIds] = useState(doctor?.department_ids ?? []);
  const [serviceIds, setServiceIds] = useState(doctor?.service_ids ?? []);
  const [skippedAutoServiceIds, setSkippedAutoServiceIds] = useState<string[]>([]);
  const [autoAddedIds, setAutoAddedIds] = useState<string[]>([]);

  const suggestedServiceIds = useMemo(
    () => serviceIdsForDepartments(departmentIds, departments, services),
    [departmentIds, departments, services],
  );

  const suggestedServices = services.filter((service) =>
    suggestedServiceIds.has(service.id),
  );
  const otherServices = services.filter(
    (service) => !suggestedServiceIds.has(service.id),
  );

  function onDepartmentChange(departmentId: string, checked: boolean) {
    const nextDepartments = toggleValue(departmentIds, departmentId, checked);
    setDepartmentIds(nextDepartments);

    const nextSuggested = serviceIdsForDepartments(
      nextDepartments,
      departments,
      services,
    );

    if (checked) {
      const skipped = new Set(skippedAutoServiceIds);
      const selected = new Set(serviceIds);
      const added: string[] = [];
      for (const serviceId of nextSuggested) {
        if (!selected.has(serviceId) && !skipped.has(serviceId)) {
          selected.add(serviceId);
          added.push(serviceId);
        }
      }
      setServiceIds([...selected]);
      if (added.length > 0) {
        setAutoAddedIds((current) => [...new Set([...current, ...added])]);
      }
      return;
    }

    setServiceIds(
      serviceIds.filter(
        (serviceId) =>
          nextSuggested.has(serviceId) || !autoAddedIds.includes(serviceId),
      ),
    );
    setAutoAddedIds(autoAddedIds.filter((serviceId) => nextSuggested.has(serviceId)));
    setSkippedAutoServiceIds(
      skippedAutoServiceIds.filter((serviceId) => nextSuggested.has(serviceId)),
    );
  }

  function onServiceChange(serviceId: string, checked: boolean) {
    setServiceIds((current) => toggleValue(current, serviceId, checked));
    if (checked) {
      setSkippedAutoServiceIds((current) =>
        current.filter((id) => id !== serviceId),
      );
      return;
    }
    setAutoAddedIds((current) => current.filter((id) => id !== serviceId));
    if (suggestedServiceIds.has(serviceId)) {
      setSkippedAutoServiceIds((current) =>
        current.includes(serviceId) ? current : [...current, serviceId],
      );
    }
  }

  return (
    <ValidatedForm action={formAction} className="flex max-w-2xl flex-col gap-6">
      {doctor ? <input type="hidden" name="id" value={doctor.id} /> : null}

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-card)">
        <div className="h-1.5 bg-primary" />
        <div className="bg-linear-to-b from-accent/40 to-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted">Name and public details patients see first.</p>
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
        </div>
      </section>

      <section
        aria-labelledby="doctor-departments-heading"
        className="overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-card)"
      >
        <div className="h-1.5 bg-primary" />
        <div className="bg-linear-to-b from-accent/40 to-surface p-5">
          <h2 id="doctor-departments-heading" className="text-base font-semibold text-foreground">
            Departments
          </h2>
          <p className="mt-1 text-sm text-muted">
            Assign where this doctor appears in the public catalog. Matching
            services are selected automatically — you can still uncheck them.
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
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm has-checked:border-primary/40 has-checked:bg-accent"
                >
                  <input
                    type="checkbox"
                    name="department_id"
                    value={department.id}
                    checked={departmentIds.includes(department.id)}
                    onChange={(event) =>
                      onDepartmentChange(department.id, event.target.checked)
                    }
                    disabled={readOnly}
                    className={checkboxClass}
                  />
                  {department.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        aria-labelledby="doctor-services-heading"
        className="overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-card)"
      >
        <div className="h-1.5 bg-primary" />
        <div className="bg-linear-to-b from-accent/40 to-surface p-5">
          <h2 id="doctor-services-heading" className="text-base font-semibold text-foreground">
            Services
          </h2>
          <p className="mt-1 text-sm text-muted">
            Patients can only book services assigned here. Department matches
            appear first and stay highlighted until you uncheck them.
          </p>
          {services.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Create a service first.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-5">
              {suggestedServices.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider text-primary uppercase">
                    From selected departments
                  </p>
                  <div
                    role="group"
                    aria-label="Suggested services"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {suggestedServices.map((service) => (
                      <ServiceOption
                        key={service.id}
                        service={service}
                        checked={serviceIds.includes(service.id)}
                        suggested
                        disabled={readOnly}
                        onChange={onServiceChange}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {otherServices.length > 0 ? (
                <div>
                  {suggestedServices.length > 0 ? (
                    <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">
                      Other services
                    </p>
                  ) : null}
                  <div
                    role="group"
                    aria-label="Services"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {otherServices.map((service) => (
                      <ServiceOption
                        key={service.id}
                        service={service}
                        checked={serviceIds.includes(service.id)}
                        suggested={false}
                        disabled={readOnly}
                        onChange={onServiceChange}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <label className="flex max-w-2xl items-start gap-3 rounded-lg border border-border bg-surface px-3 py-3 text-sm text-foreground">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={doctor?.is_active ?? true}
          disabled={readOnly}
          className={`mt-0.5 ${checkboxClass}`}
        />
        <span>
          Active on the public site
          <span className="mt-0.5 block text-xs text-muted">
            Hidden doctors are not listed for patients.
          </span>
        </span>
      </label>

      <FormError message={state.error} />
      {readOnly ? (
        <p className="text-sm text-muted">Only owners and admins can edit doctors.</p>
      ) : (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending
            ? doctor
              ? "Updating…"
              : "Creating…"
            : doctor
              ? "Update doctor"
              : "Create doctor"}
        </Button>
      )}
    </ValidatedForm>
  );
}

function ServiceOption({
  service,
  checked,
  suggested,
  disabled,
  onChange,
}: {
  service: Service;
  checked: boolean;
  suggested: boolean;
  disabled: boolean;
  onChange: (serviceId: string, checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
        suggested
          ? "border-primary/30 bg-accent"
          : "border-border bg-surface",
        "has-checked:border-primary/40 has-checked:bg-accent",
      )}
    >
      <input
        type="checkbox"
        name="service_id"
        value={service.id}
        checked={checked}
        onChange={(event) => onChange(service.id, event.target.checked)}
        disabled={disabled}
        className={`mt-0.5 ${checkboxClass}`}
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          {service.name}
          {suggested ? (
            <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
              Suggested
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          {service.duration_minutes} min
          {service.price !== null ? ` · ${service.price}` : ""}
        </span>
      </span>
    </label>
  );
}
