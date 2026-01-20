## 2024-05-23 - React Side Effects & Button UX
**Learning:** Found a side effect (setTimeout) directly in the component body of `BiometricScan`. This causes unpredictable behavior and potential memory leaks. Also, disabling submit buttons prevents users from triggering validation feedback.
**Action:** Always wrap side effects in `useEffect`. Keep submit buttons enabled to allow users to click and see "Invalid input" errors, rather than guessing why the button is dead.
