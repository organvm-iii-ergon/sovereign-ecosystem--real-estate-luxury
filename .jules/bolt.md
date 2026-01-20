## 2025-05-21 - [Particle Animation Optimization]
**Learning:** `Array.prototype.slice` inside a `requestAnimationFrame` loop is a performance killer due to excessive garbage collection. `Math.sqrt` is also expensive for distance checks.
**Action:** Always use nested `for` loops for N-body problems (like particle connections) and use squared distance comparisons (`dx*dx + dy*dy < r*r`).
**Benchmark:** Replacing `forEach/slice` + `Math.sqrt` with `for` loops + `distSq` yielded a ~5.4x speedup (527ms -> 97ms for 10k iterations of 60 particles).
