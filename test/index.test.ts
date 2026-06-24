import { IndexedPriorityQueue, minPQ, maxPQ } from "../src/index.js";

// ── Basic min-heap ────────────────────────────────────────────────────────────
describe("IndexedPriorityQueue (min-heap, default)", () => {
  it("peek returns highest-priority (lowest value) item", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 5).set("b", 3).set("c", 7);
    expect(pq.peek()).toEqual({ key: "b", priority: 3 });
  });

  it("pop removes and returns items in priority order", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 5).set("b", 3).set("c", 1).set("d", 9);
    expect(pq.pop()).toEqual({ key: "c", priority: 1 });
    expect(pq.pop()).toEqual({ key: "b", priority: 3 });
    expect(pq.pop()).toEqual({ key: "a", priority: 5 });
    expect(pq.pop()).toEqual({ key: "d", priority: 9 });
    expect(pq.pop()).toBeUndefined();
  });

  it("size and isEmpty", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    expect(pq.size).toBe(0);
    expect(pq.isEmpty).toBe(true);
    pq.set("a", 1);
    expect(pq.size).toBe(1);
    expect(pq.isEmpty).toBe(false);
    pq.pop();
    expect(pq.size).toBe(0);
  });

  it("has — membership test", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1);
    expect(pq.has("a")).toBe(true);
    expect(pq.has("b")).toBe(false);
    pq.pop();
    expect(pq.has("a")).toBe(false);
  });

  it("get returns current priority", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 5);
    expect(pq.get("a")).toBe(5);
    expect(pq.get("z")).toBeUndefined();
  });

  it("single element", () => {
    const pq = new IndexedPriorityQueue<number, number>();
    pq.set(42, 100);
    expect(pq.peek()).toEqual({ key: 42, priority: 100 });
    expect(pq.pop()).toEqual({ key: 42, priority: 100 });
    expect(pq.isEmpty).toBe(true);
  });

  it("clear empties queue", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1).set("b", 2);
    pq.clear();
    expect(pq.size).toBe(0);
    expect(pq.peek()).toBeUndefined();
    expect(pq.has("a")).toBe(false);
  });
});

// ── Decrease-key / increase-key (the critical feature) ───────────────────────
describe("set — update priority (decrease-key / increase-key)", () => {
  it("decrease-key promotes item to front", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 5).set("b", 3).set("c", 7);
    // "a" has priority 5, lower it to 1 → "a" should now be at front
    pq.set("a", 1);
    expect(pq.peek()).toEqual({ key: "a", priority: 1 });
    expect(pq.get("a")).toBe(1);
  });

  it("increase-key demotes item", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1).set("b", 3).set("c", 5);
    // "a" was front, increase to 10 → "b" should now be front
    pq.set("a", 10);
    expect(pq.peek()).toEqual({ key: "b", priority: 3 });
    expect(pq.get("a")).toBe(10);
  });

  it("update does not increase size", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 5);
    expect(pq.size).toBe(1);
    pq.set("a", 1); // update, not insert
    expect(pq.size).toBe(1);
  });

  it("update same priority is no-op", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 5).set("b", 3);
    pq.set("a", 5); // same priority
    expect(pq.size).toBe(2);
    expect(pq.get("a")).toBe(5);
  });

  it("pop after multiple updates returns correct order", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 10).set("b", 20).set("c", 30);
    pq.set("c", 5);  // c becomes highest priority
    pq.set("b", 15); // b changes
    const order: string[] = [];
    while (!pq.isEmpty) order.push(pq.pop()!.key);
    expect(order).toEqual(["c", "a", "b"]);
  });
});

// ── Delete arbitrary key ──────────────────────────────────────────────────────
describe("delete", () => {
  it("deletes first element (root)", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1).set("b", 2).set("c", 3);
    expect(pq.delete("a")).toBe(true);
    expect(pq.has("a")).toBe(false);
    expect(pq.size).toBe(2);
    expect(pq.peek()!.key).toBe("b");
  });

  it("deletes middle element", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1).set("b", 2).set("c", 3);
    pq.delete("b");
    const order: string[] = [];
    while (!pq.isEmpty) order.push(pq.pop()!.key);
    expect(order).toEqual(["a", "c"]);
  });

  it("deletes last element", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1).set("b", 5);
    pq.delete("b");
    expect(pq.size).toBe(1);
    expect(pq.pop()!.key).toBe("a");
  });

  it("delete missing key returns false", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1);
    expect(pq.delete("z")).toBe(false);
    expect(pq.size).toBe(1);
  });

  it("delete only element leaves empty queue", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1);
    pq.delete("a");
    expect(pq.isEmpty).toBe(true);
    expect(pq.peek()).toBeUndefined();
  });
});

// ── Max-heap ──────────────────────────────────────────────────────────────────
describe("maxPQ", () => {
  it("pop returns largest priority first", () => {
    const pq = maxPQ<string, number>();
    pq.set("a", 5).set("b", 3).set("c", 9).set("d", 1);
    expect(pq.pop()).toEqual({ key: "c", priority: 9 });
    expect(pq.pop()).toEqual({ key: "a", priority: 5 });
    expect(pq.pop()).toEqual({ key: "b", priority: 3 });
    expect(pq.pop()).toEqual({ key: "d", priority: 1 });
  });

  it("decrease-key in max-heap demotes item", () => {
    const pq = maxPQ<string, number>();
    pq.set("a", 10).set("b", 5);
    pq.set("a", 2); // demote "a"
    expect(pq.peek()).toEqual({ key: "b", priority: 5 });
  });
});

// ── minPQ factory ─────────────────────────────────────────────────────────────
describe("minPQ factory", () => {
  it("behaves like default constructor", () => {
    const pq = minPQ<string, number>();
    pq.set("a", 5).set("b", 1).set("c", 3);
    expect(pq.pop()!.key).toBe("b");
  });
});

// ── Custom comparator ─────────────────────────────────────────────────────────
describe("custom comparator", () => {
  it("supports string priorities with custom compare", () => {
    const pq = new IndexedPriorityQueue<number, string>({
      compare: (a, b) => a.localeCompare(b),
    });
    pq.set(1, "banana").set(2, "apple").set(3, "cherry");
    expect(pq.pop()).toEqual({ key: 2, priority: "apple" });
    expect(pq.pop()).toEqual({ key: 1, priority: "banana" });
    expect(pq.pop()).toEqual({ key: 3, priority: "cherry" });
  });

  it("supports object priorities with custom compare", () => {
    type Task = { urgency: number; name: string };
    const pq = new IndexedPriorityQueue<string, Task>({
      compare: (a, b) => b.urgency - a.urgency, // max-urgency first
    });
    pq.set("t1", { urgency: 3, name: "low" });
    pq.set("t2", { urgency: 9, name: "critical" });
    pq.set("t3", { urgency: 5, name: "medium" });
    expect(pq.pop()!.priority.name).toBe("critical");
    expect(pq.pop()!.priority.name).toBe("medium");
  });
});

// ── Large dataset ─────────────────────────────────────────────────────────────
describe("large dataset", () => {
  it("1000 items pop in sorted order", () => {
    const pq = new IndexedPriorityQueue<number, number>();
    const nums: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const n = Math.floor(Math.random() * 10000);
      nums.push(n);
      pq.set(i, n);
    }
    const sorted = [...nums].sort((a, b) => a - b);
    const popped: number[] = [];
    while (!pq.isEmpty) popped.push(pq.pop()!.priority);
    expect(popped).toEqual(sorted);
  });

  it("1000 updates then sorted pop", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    for (let i = 0; i < 100; i++) pq.set(`k${i}`, i * 10);
    // Decrease all priorities
    for (let i = 0; i < 100; i++) pq.set(`k${i}`, 99 - i);
    const popped: number[] = [];
    while (!pq.isEmpty) popped.push(pq.pop()!.priority);
    for (let i = 1; i < popped.length; i++) {
      expect(popped[i]!).toBeGreaterThanOrEqual(popped[i - 1]!);
    }
  });
});

// ── Dijkstra's algorithm using IndexedPQ ─────────────────────────────────────
describe("Dijkstra algorithm (real-world usage)", () => {
  type Graph = Map<string, Array<{ to: string; weight: number }>>;

  function dijkstra(graph: Graph, src: string): Map<string, number> {
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
        const newDist = d + weight;
        if (newDist < (dist.get(v) ?? Infinity)) {
          dist.set(v, newDist);
          pq.set(v, newDist); // decrease-key!
        }
      }
    }
    return dist;
  }

  it("finds shortest paths in a weighted graph", () => {
    const graph: Graph = new Map([
      ["A", [{ to: "B", weight: 4 }, { to: "C", weight: 1 }]],
      ["B", [{ to: "D", weight: 1 }]],
      ["C", [{ to: "B", weight: 2 }, { to: "D", weight: 5 }]],
      ["D", []],
    ]);
    const dist = dijkstra(graph, "A");
    expect(dist.get("A")).toBe(0);
    expect(dist.get("B")).toBe(3); // A→C(1)→B(2)
    expect(dist.get("C")).toBe(1); // A→C(1)
    expect(dist.get("D")).toBe(4); // A→C(1)→B(2)→D(1)
  });

  it("handles disconnected graph", () => {
    const graph: Graph = new Map([
      ["A", [{ to: "B", weight: 2 }]],
      ["B", []],
      ["C", []], // disconnected
    ]);
    const dist = dijkstra(graph, "A");
    expect(dist.get("B")).toBe(2);
    expect(dist.get("C")).toBe(Infinity);
  });
});

// ── Iteration ─────────────────────────────────────────────────────────────────
describe("iteration", () => {
  it("entries() returns all items", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 3).set("b", 1).set("c", 2);
    const entries = pq.entries();
    expect(entries.length).toBe(3);
    expect(new Set(entries.map(e => e.key))).toEqual(new Set(["a", "b", "c"]));
  });

  it("keys() returns all keys", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("x", 1).set("y", 2);
    expect(new Set(pq.keys())).toEqual(new Set(["x", "y"]));
  });

  it("for..of iterates entries", () => {
    const pq = new IndexedPriorityQueue<string, number>();
    pq.set("a", 1).set("b", 2);
    const keys = [...pq].map(e => e.key);
    expect(new Set(keys)).toEqual(new Set(["a", "b"]));
  });
});
