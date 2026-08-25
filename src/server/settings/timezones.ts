export function listTimeZones(): string[] {
  const supported =
    typeof Intl !== "undefined" && "supportedValuesOf" in Intl
      ? (
          Intl as unknown as { supportedValuesOf: (key: "timeZone") => string[] }
        ).supportedValuesOf("timeZone")
      : [];

  const zones = new Set(["UTC", "Asia/Karachi", ...supported]);
  return [...zones].sort((a, b) => a.localeCompare(b));
}
