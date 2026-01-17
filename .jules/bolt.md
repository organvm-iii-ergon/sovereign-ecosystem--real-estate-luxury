## 2024-05-22 - Memory vs Reality Discrepancy
**Learning:** The memory stated `ParticleBackground` was optimized with nested loops and distance checks, but the code showed unoptimized `forEach` and `slice` calls.
**Action:** Always trust the codebase over memory. When a discrepancy exists, verify the performance gap (benchmarked ~50% improvement) and implement the missing optimization.
