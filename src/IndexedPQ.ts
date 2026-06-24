/**
 * IndexedPriorityQueue<K, P> — a priority queue where entries are addressed by key
 * and priorities can be updated in O(log n).
 *
 * This is the data structure needed for:
 * - Dijkstra's shortest path (decrease distance of a relaxed vertex)
 * - A* search (update g-score of a discovered node)
 * - Task schedulers (change priority of a queued task)
 * - Any algorithm that needs "update priority of an existing item"
 *
 * API mirrors Python heapdict (dict-like heap with O(log n) update).
 *
 * Internally: binary heap array + Map<key, heapIndex> for O(1) key lookup → O(log n) update.
 *
 * @example
 * const pq = new IndexedPriorityQueue<string, number>();
 * pq.set("a", 5).set("b", 3).set("c", 7);
 * pq.peek();          // { key: "b", priority: 3 }
 * pq.set("a", 1);     // decrease-key: "a" now has priority 1
 * pq.pop();           // { key: "a", priority: 1 }
 * pq.pop();           // { key: "b", priority: 3 }
 */

export type PQEntry<K, P> = { key: K; priority: P };

export interface IndexedPriorityQueueOptions<P> {
  /**
   * Custom comparator. Return negative if a < b (a has higher priority).
   * Default: natural ascending order (min-heap — smallest priority = highest priority).
   */
  compare?: (a: P, b: P) => number;
}

const defaultCompare = <P>(a: P, b: P): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

export class IndexedPriorityQueue<K, P = number> {
  private readonly _compare: (a: P, b: P) => number;
  /** Heap array: each slot holds { key, priority } */
  private readonly _heap: Array<PQEntry<K, P>> = [];
  /** Key → current heap index, for O(1) lookup */
  private readonly _pos = new Map<K, number>();

  constructor(options?: IndexedPriorityQueueOptions<P>) {
    this._compare = options?.compare ?? (defaultCompare as (a: P, b: P) => number);
  }

  /**
   * Insert a new key or update the priority of an existing key.
   * This is the combined "insert" + "decrease-key" + "increase-key" operation.
   * O(log n).
   */
  set(key: K, priority: P): this {
    const existing = this._pos.get(key);
    if (existing !== undefined) {
      this._heap[existing]!.priority = priority;
      // Bubble both directions since priority could go up or down
      this._bubbleUp(existing);
      this._bubbleDown(this._pos.get(key)!);
    } else {
      const idx = this._heap.length;
      this._heap.push({ key, priority });
      this._pos.set(key, idx);
      this._bubbleUp(idx);
    }
    return this;
  }

  /**
   * Remove and return the entry with the highest priority (lowest value in min-heap).
   * Returns `undefined` if empty. O(log n).
   */
  pop(): PQEntry<K, P> | undefined {
    if (this._heap.length === 0) return undefined;
    this._swap(0, this._heap.length - 1);
    const entry = this._heap.pop()!;
    this._pos.delete(entry.key);
    if (this._heap.length > 0) this._bubbleDown(0);
    return entry;
  }

  /**
   * Return the highest-priority entry without removing it.
   * Returns `undefined` if empty. O(1).
   */
  peek(): PQEntry<K, P> | undefined {
    return this._heap[0] ? { key: this._heap[0].key, priority: this._heap[0].priority } : undefined;
  }

  /**
   * Get the current priority of a key, or `undefined` if not present. O(1).
   */
  get(key: K): P | undefined {
    const idx = this._pos.get(key);
    return idx !== undefined ? this._heap[idx]!.priority : undefined;
  }

  /**
   * Returns true if the key is in the queue. O(1).
   */
  has(key: K): boolean {
    return this._pos.has(key);
  }

  /**
   * Remove a key from the queue (at any position). O(log n).
   * Returns true if the key existed.
   */
  delete(key: K): boolean {
    const idx = this._pos.get(key);
    if (idx === undefined) return false;
    const last = this._heap.length - 1;
    if (idx === last) {
      this._heap.pop();
      this._pos.delete(key);
    } else {
      this._swap(idx, last);
      this._heap.pop();
      this._pos.delete(key);
      this._bubbleUp(idx);
      this._bubbleDown(this._pos.get(this._heap[idx]!.key)!);
    }
    return true;
  }

  /** Remove all entries. */
  clear(): void {
    this._heap.length = 0;
    this._pos.clear();
  }

  get size(): number { return this._heap.length; }
  get isEmpty(): boolean { return this._heap.length === 0; }

  /** All entries as an array (heap order, not priority order). O(n). */
  entries(): PQEntry<K, P>[] {
    return this._heap.map(e => ({ key: e.key, priority: e.priority }));
  }

  /** All keys (heap order). O(n). */
  keys(): K[] { return this._heap.map(e => e.key); }

  [Symbol.iterator](): Iterator<PQEntry<K, P>> {
    return this.entries()[Symbol.iterator]();
  }

  private _swap(i: number, j: number): void {
    const hi = this._heap[i]!;
    const hj = this._heap[j]!;
    this._heap[i] = hj;
    this._heap[j] = hi;
    this._pos.set(hj.key, i);
    this._pos.set(hi.key, j);
  }

  private _bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this._compare(this._heap[idx]!.priority, this._heap[parent]!.priority) < 0) {
        this._swap(idx, parent);
        idx = parent;
      } else break;
    }
  }

  private _bubbleDown(idx: number): void {
    const n = this._heap.length;
    while (true) {
      let best = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this._compare(this._heap[left]!.priority, this._heap[best]!.priority) < 0) best = left;
      if (right < n && this._compare(this._heap[right]!.priority, this._heap[best]!.priority) < 0) best = right;
      if (best === idx) break;
      this._swap(idx, best);
      idx = best;
    }
  }
}

/** Convenience factory for min-heap (default) */
export function minPQ<K, P = number>(options?: Omit<IndexedPriorityQueueOptions<P>, "compare"> & { compare?: (a: P, b: P) => number }): IndexedPriorityQueue<K, P> {
  return new IndexedPriorityQueue<K, P>(options);
}

/** Convenience factory for max-heap */
export function maxPQ<K, P = number>(): IndexedPriorityQueue<K, P> {
  return new IndexedPriorityQueue<K, P>({
    compare: (a, b) => {
      if (a < b) return 1;
      if (a > b) return -1;
      return 0;
    },
  });
}
