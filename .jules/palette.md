# Palette's Journal

## 2024-05-22 - Validation UX Patterns
**Learning:** Disabling submit buttons until validation passes prevents users from learning *why* their input is invalid. This is a common pattern but often poor UX.
**Action:** Keep submit buttons enabled and trigger validation + error messages on click. This provides explicit feedback. In `ClientAuth`, I enabled the button for short inputs so the "Invalid invite code" error becomes reachable and actionable.

## 2024-05-22 - Side Effect Cleanup
**Learning:** `useState` initializers must be pure. Side effects like `setTimeout` inside them are dangerous and can lead to double-execution in Strict Mode or memory leaks if not cleaned up properly via `useEffect`.
**Action:** Always use `useEffect` for timers and side effects, ensuring the cleanup function is returned.

## 2024-05-22 - Screen Reader Feedback
**Learning:** Visual text updates (like "Validating..." -> "Access Granted") are often missed by screen readers.
**Action:** Use `role="status"` and `aria-live="polite"` on containers where text content updates dynamically to ensure users with screen readers are informed of state changes.
