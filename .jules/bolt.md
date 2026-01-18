## 2024-05-23 - useEffect Dependency Churn
**Learning:** Including state variables that update frequently (e.g., inside an animation loop or real-time data subscription) in `useEffect` dependency arrays causes the entire effect to tear down and recreate.
**Action:** Use `useRef` to track values that are needed inside effects but don't require re-rendering (or are used only to detect changes), and remove them from dependencies.
