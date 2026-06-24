# prioritykit

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

> Zero-dependency indexed priority queue for TypeScript.
> O(log n) insert · pop · **update** (decrease-key / increase-key) · delete-by-key

[![npm](https://img.shields.io/npm/v/prioritykit)](https://www.npmjs.com/package/prioritykit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Port of Python [heapdict](https://pypi.org/project/heapdict/) (500k+/week). Unlike a plain heap, `prioritykit` lets you **update the priority of an existing entry** in O(log n) — the operation that makes Dijkstra and A* efficient.

## Install

```bash
npm install prioritykit
```

## The problem it solves

Standard `MinHeap.push(item)` doesn't support updating already-queued items. You end up with stale entries and must either re-insert duplicates or use a lazy deletion hack. `IndexedPriorityQueue` solves this with a heap + position map:

```typescript
// Plain heap (broken for Dijkstra):
heap.push({ node: "A", dist: Infinity });
// ... later when we find a shorter path ...
heap.push({ node: "A", dist: 3 }); // ← duplicate! can't remove old entry

// IndexedPriorityQueue (correct):
pq.set("A", Infinity);
// ... later ...
pq.set("A", 3); // ← updates in place, O(log n), no duplicates
```

## Quick start

```typescript
import { IndexedPriorityQueue } from "prioritykit";

const pq = new IndexedPriorityQueue<string, number>();

pq.set("a", 5).set("b", 3).set("c", 7);

pq.peek();        // { key: "b", priority: 3 }
pq.get("a");      // 5
pq.has("c");      // true

// Update priority — the key feature
pq.set("a", 1);   // decrease-key: "a" now has priority 1
pq.peek();        // { key: "a", priority: 1 }

pq.pop();         // { key: "a", priority: 1 }
pq.pop();         // { key: "b", priority: 3 }
pq.pop();         // { key: "c", priority: 7 }
```

## Dijkstra's shortest path

```typescript
import { IndexedPriorityQueue } from "prioritykit";

function dijkstra(graph: Map<string, {to: string, weight: number}[]>, src: string) {
  const dist = new Map<string, number>();
  const pq = new IndexedPriorityQueue<string, number>();

  for (const node of graph.keys()) {
    const d = node === src ? 0 : Infinity;
    dist.set(node, d);
    pq.set(node, d);
  }

  while (!pq.isEmpty) {
    const { key: u, priority: d } = pq.pop()!;
    if (d === Infinity) break;

    for (const { to: v, weight } of graph.get(u) ?? []) {
      const nd = d + weight;
      if (nd < dist.get(v)!) {
        dist.set(v, nd);
        pq.set(v, nd);  // ← decrease-key: updates "v"'s position in heap
      }
    }
  }
  return dist;
}
```

## Max-heap / custom comparator

```typescript
import { maxPQ, minPQ, IndexedPriorityQueue } from "prioritykit";

// Max-heap (largest priority = highest priority)
const pq = maxPQ<string, number>();
pq.set("a", 5).set("b", 9).set("c", 2);
pq.pop(); // { key: "b", priority: 9 }

// Custom comparator — e.g. task priority queue
type Task = { urgency: number; name: string };
const tasks = new IndexedPriorityQueue<string, Task>({
  compare: (a, b) => b.urgency - a.urgency, // highest urgency first
});
tasks.set("task1", { urgency: 3, name: "low" });
tasks.set("task2", { urgency: 9, name: "critical" });
tasks.set("task1", { urgency: 8, name: "high" }); // update task1 priority
tasks.pop(); // { key: "task2", priority: { urgency: 9, name: "critical" } }
```

## API

```typescript
new IndexedPriorityQueue<K, P>(options?: { compare?: (a: P, b: P) => number })

// Core operations — all O(log n) except peek/get/has which are O(1)
.set(key: K, priority: P): this   // insert new OR update existing (decrease/increase-key)
.pop(): PQEntry<K, P> | undefined // remove + return highest-priority entry
.peek(): PQEntry<K, P> | undefined // return highest-priority entry without removing
.get(key: K): P | undefined        // get current priority of key (O(1))
.has(key: K): boolean              // membership test (O(1))
.delete(key: K): boolean           // remove arbitrary key (O(log n))
.clear(): void

// Iteration (heap order, not priority order)
.entries(): PQEntry<K, P>[]
.keys(): K[]
[Symbol.iterator](): Iterator<PQEntry<K, P>>

.size: number
.isEmpty: boolean
```

## Comparison with alternatives

| Package | TypeScript | Update (O(log n)) | Delete-by-key | Zero deps |
|---|---|---|---|---|
| **prioritykit** | ✅ | ✅ | ✅ | ✅ |
| heapkit | ✅ | ❌ | ❌ | ✅ |
| @datastructures-js/priority-queue | ✅ | ❌ | ❌ | ✅ |
| Python heapdict | n/a | ✅ | ✅ | ✅ |
| Java PriorityQueue | n/a | ❌ (O(n)) | ❌ (O(n)) | n/a |

## Contributors ✨

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome — code, docs, bug reports, ideas, reviews! See the [emoji key](https://allcontributors.org/docs/en/emoji-key) for how each contribution is recognized, and open a PR or issue to get involved.

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trananhtung"><img src="https://avatars.githubusercontent.com/u/30992229?v=4?s=100" width="100px;" alt="Tung Tran"/><br /><sub><b>Tung Tran</b></sub></a><br /><a href="https://github.com/trananhtung/prioritykit/commits?author=trananhtung" title="Code">💻</a> <a href="#maintenance-trananhtung" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT © [trananhtung](https://github.com/trananhtung)
