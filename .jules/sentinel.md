## 2025-02-23 - Reverse Tabnabbing in window.open
**Vulnerability:** Found `window.open(url, '_blank')` used without `noopener` or `noreferrer` features in `ShareableComparisonLink.tsx`.
**Learning:** Even when opening trusted domains (like WhatsApp), explicitly preventing access to `window.opener` is a critical defense-in-depth measure against reverse tabnabbing attacks where the target page could redirect the origin page.
**Prevention:** Always use `window.open(url, '_blank', 'noopener,noreferrer')` or `<a target="_blank" rel="noopener noreferrer">`.
