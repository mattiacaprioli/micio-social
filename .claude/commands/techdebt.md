Analyze the codebase for technical debt violations against the project conventions. Search thoroughly across all files in `app/`, `components/`, `services/`, `hooks/`, and `context/`.

Check for each of the following issues and report findings grouped by severity:

---

## 🔴 HIGH — Correctness / Safety

**1. Service functions that throw instead of returning `{ success: false }`**
- Search for `throw` inside files in `services/`
- Search for service functions missing `try/catch`
- Search for service functions not returning `ApiResponse<T>`

**2. Missing error check after Supabase calls**
- Look for `.from(` calls not followed by `if (error)` check

---

## 🟡 MEDIUM — Convention Violations

**3. Hardcoded pixel values not using `hp()` / `wp()`**
- Search for patterns like `width: 100`, `height: 48`, `padding: 16`, `margin: 8` (numeric literals in style contexts) that are NOT using `hp()`/`wp()`
- Ignore values of `0`, `1`, `100%`, border widths of 1px, and values in `borderRadius` that use theme tokens

**4. Inline styles (`style={{ }}`) in components**
- Search for `style={{` in `.tsx` and `.jsx` files under `components/` and `app/`

**5. Components missing TypeScript `interface` for props**
- Search for functional components in `.tsx` files that accept props but have no `interface XxxProps` or `type XxxProps` defined

---

## 🟢 LOW — Minor Issues

**6. Direct `StyleSheet.create` usage**
- The project uses styled-components; `StyleSheet.create` should not be used in new components
- Search for `StyleSheet.create` in `components/` and `app/`

**7. Hardcoded color values instead of theme tokens**
- Search for hex color literals like `#FFFFFF`, `#000000`, `#FF6F3C` etc. directly in styled-components template literals instead of `${props => props.theme.colors.XYZ}`

---

For each finding, output:
- File path and line number
- The offending code snippet
- What it should be replaced with

At the end, give a summary count per severity level and suggest which files to fix first (highest impact).
