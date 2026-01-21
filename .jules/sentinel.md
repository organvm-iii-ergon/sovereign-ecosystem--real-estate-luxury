## 2025-10-26 - Trust Code Over Memory
**Vulnerability:** Reverse Tabnabbing risk in `ShareableComparisonLink.tsx` was present despite memory suggesting otherwise.
**Learning:** Memory indicated `noopener,noreferrer` was used, but code inspection revealed it was missing. System memories can be outdated or inaccurate regarding specific implementation details.
**Prevention:** Always verify the actual code state before assuming a vulnerability is patched, even if "memory" says otherwise. Trust nothing, verify everything.
