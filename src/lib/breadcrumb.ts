/**
 * Breadcrumb trail builder.
 *
 * Pure logic that turns a URL pathname into a Home-anchored, path-ordered
 * breadcrumb trail. Target of property-based testing (Property 37).
 * Requirements: 3.2, 3.3, 3.4
 */

/** A single breadcrumb item. The current page (last item) omits `path`. */
export interface BreadcrumbItem {
  /** Human-readable label shown to the visitor. */
  readonly label: string;
  /** Navigation target. Present on every item EXCEPT the last (current page). */
  readonly path?: string;
}

/**
 * Convert a kebab-case (or otherwise dashed) segment into a Title Cased label.
 *
 * Used as the fallback label when neither the segment nor its cumulative path
 * is present in the label map. Example: `"case-studies"` → `"Case Studies"`.
 */
function humanizeSegment(segment: string): string {
  return segment
    .split('-')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build a breadcrumb trail for `pathname`.
 *
 * @param pathname - A URL path such as `/portfolio/some-project`. Leading,
 *   trailing, and duplicate slashes are ignored when extracting meaningful
 *   segments.
 * @param labelMap - Maps a path segment OR a cumulative path to its
 *   human-readable label. For each segment the cumulative path is looked up
 *   first (more specific), then the bare segment; if neither is present the
 *   label falls back to a humanized (Title Case) form of the segment
 *   (Requirement 3.4). The root key `'/'` overrides the Home label.
 * @returns The trail, always starting with Home. Segments appear in path order
 *   (Requirement 3.2) and only the last item omits `path` (Requirement 3.3).
 *   The total item count equals the number of meaningful segments + 1 (Home).
 *
 * Edge case — root path (`'/'` or `''`): there are no meaningful segments, so
 * the trail is just `[Home]`. Because Home is then the last (and only) item, it
 * represents the current page and therefore omits its `path`. This keeps the
 * "only the last item omits path" invariant true for every input.
 */
export function buildBreadcrumbTrail(
  pathname: string,
  labelMap: Record<string, string>,
): BreadcrumbItem[] {
  // Split into meaningful segments, dropping empties from leading/trailing/
  // duplicate slashes.
  const segments = pathname.split('/').filter((segment) => segment.length > 0);

  // Home is always first. Its label can be overridden via the root key; its
  // path is filled in here and stripped below if Home is the last item.
  const trail: BreadcrumbItem[] = [
    { label: labelMap['/'] ?? 'Home', path: '/' },
  ];

  let cumulativePath = '';
  for (const segment of segments) {
    cumulativePath += `/${segment}`;
    // Prefer a label keyed by the full cumulative path, then the bare segment,
    // then a humanized fallback (Requirement 3.4).
    const label =
      labelMap[cumulativePath] ?? labelMap[segment] ?? humanizeSegment(segment);
    trail.push({ label, path: cumulativePath });
  }

  // The last item is the current page: strip its `path` (Requirement 3.3).
  const last = trail[trail.length - 1];
  trail[trail.length - 1] = { label: last.label };

  return trail;
}
