# Sentinel Journal

## 2024-05-24 - CSV Injection (Formula Injection)
**Vulnerability:** CSV Export functionality (`src/lib/csv-export.ts`) allowed user input starting with `=`, `+`, `-`, `@` to be exported raw, enabling CSV Injection (Formula Injection) attacks where opening the CSV in Excel could execute arbitrary commands.
**Learning:** Even internal-facing exports need sanitization. Developers often only think of standard CSV escaping (commas/quotes) but miss formula injection triggers.
**Prevention:** Centralized `escapeCSV` utility that checks for formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) and prepends a single quote to neutralize them.
