export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute left-4 top-4 z-100 translate-y-[-200%] rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-(--ring) focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
