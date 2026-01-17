## 2024-05-22 - Minimalist Input Accessibility
**Learning:** The "Velvet Rope" aesthetic favors minimalist inputs without visible labels. This creates a recurring accessibility gap where inputs rely solely on placeholders.
**Action:** When working on minimalist components in this system, always verify that `aria-label` is present to act as the accessible name, since `placeholder` is insufficient.
