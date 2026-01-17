## 2024-03-24 - Reverse Tabnabbing Vulnerability
**Vulnerability:** `window.open` called with `_blank` target but missing `noopener,noreferrer` features in `ShareableComparisonLink.tsx`.
**Learning:** External links opened in new tabs via `window.open` grant the new page access to `window.opener` unless explicitly restricted, allowing malicious sites to redirect the original page (Reverse Tabnabbing).
**Prevention:** Always include `'noopener,noreferrer'` as the third argument when using `window.open(url, '_blank')`.
