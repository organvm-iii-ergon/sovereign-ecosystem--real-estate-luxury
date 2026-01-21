# Palette's Journal

## 2025-05-18 - ClientAuth Accessibility & React Patterns
**Learning:** Found a critical misuse of `useState` for side effects (using the initializer for `setTimeout`) which could lead to memory leaks and incorrect behavior. Also identified missing ARIA attributes on critical entry points.
**Action:** When auditing components, check that `useState` is not used for side effects (use `useEffect` instead) and ensure form inputs have accessible names even if visually hidden.
