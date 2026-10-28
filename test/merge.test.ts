import assert from "node:assert/strict";
import { test } from "node:test";
import { merge } from "../src/merge.js";

interface MergeCase {
  name: string;
  collection_1: number[];
  collection_2: number[];
  collection_3: number[];
  expected: number[];
}

const max = Number.MAX_SAFE_INTEGER;

const cases: MergeCase[] = [
  {
    name: "returns an empty array when every input is empty",
    collection_1: [], collection_2: [], collection_3: [], expected: [],
  },
  {
    name: "handles only the first collection being populated",
    collection_1: [0, 2, 2], collection_2: [], collection_3: [],
    expected: [0, 2, 2],
  },
  {
    name: "handles only the second collection being populated",
    collection_1: [], collection_2: [1, 3, 5], collection_3: [],
    expected: [1, 3, 5],
  },
  {
    name: "reads the third collection from its smallest element",
    collection_1: [], collection_2: [], collection_3: [9, 4, 0],
    expected: [0, 4, 9],
  },
  {
    name: "handles an empty first collection",
    collection_1: [], collection_2: [0, 3, 6], collection_3: [8, 4, 1],
    expected: [0, 1, 3, 4, 6, 8],
  },
  {
    name: "handles an empty second collection",
    collection_1: [1, 3, 9], collection_2: [], collection_3: [8, 6, 2],
    expected: [1, 2, 3, 6, 8, 9],
  },
  {
    name: "handles an empty third collection",
    collection_1: [0, 4, 10], collection_2: [1, 2, 8], collection_3: [],
    expected: [0, 1, 2, 4, 8, 10],
  },
  {
    name: "merges single-element collections",
    collection_1: [3], collection_2: [1], collection_3: [2],
    expected: [1, 2, 3],
  },
  {
    name: "keeps zeros from every collection",
    collection_1: [0], collection_2: [0], collection_3: [0],
    expected: [0, 0, 0],
  },
  {
    name: "merges fully interleaved values",
    collection_1: [0, 3, 6], collection_2: [1, 4, 7], collection_3: [8, 5, 2],
    expected: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    name: "merges disjoint value ranges",
    collection_1: [1, 2, 3], collection_2: [7, 8, 9], collection_3: [6, 5, 4],
    expected: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    name: "handles inputs of different lengths",
    collection_1: [1, 4, 6, 8, 10], collection_2: [3], collection_3: [9, 7, 5, 2, 0],
    expected: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    name: "preserves duplicates within and across collections",
    collection_1: [0, 2, 2, 5], collection_2: [0, 2, 4], collection_3: [5, 2, 0],
    expected: [0, 0, 0, 2, 2, 2, 2, 4, 5, 5],
  },
  {
    name: "preserves every value when all values are equal",
    collection_1: [4, 4], collection_2: [4], collection_3: [4, 4],
    expected: [4, 4, 4, 4, 4],
  },
  {
    name: "supports the largest safe integer without changing its value",
    collection_1: [0, max], collection_2: [max - 1], collection_3: [max, 0],
    expected: [0, 0, max - 1, max, max],
  },
];

for (const { name, collection_1, collection_2, collection_3, expected } of cases) {
  test(name, () => {
    assert.deepEqual(merge(collection_1, collection_2, collection_3), expected);
  });
}

test("does not mutate any input, including frozen arrays", () => {
  const first = Object.freeze([1, 3]);
  const second = Object.freeze([0, 4]);
  const third = Object.freeze([5, 2]);

  assert.deepEqual(merge(first, second, third), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(first, [1, 3]);
  assert.deepEqual(second, [0, 4]);
  assert.deepEqual(third, [5, 2]);
});

test("returns a fresh array independent of every input and previous result", () => {
  const first = [1];
  const second: number[] = [];
  const third: number[] = [];
  const result = merge(first, second, third);

  assert.notStrictEqual(result, first);
  assert.notStrictEqual(result, second);
  assert.notStrictEqual(result, third);
  result.push(2);
  assert.deepEqual(first, [1]);
  assert.deepEqual(second, []);
  assert.deepEqual(third, []);
  assert.deepEqual(merge(first, second, third), [1]);

  const emptyResult = merge(second, second, third);
  assert.notStrictEqual(emptyResult, second);
  assert.notStrictEqual(emptyResult, third);
});

test("merges 30,000 interleaved values", () => {
  const length = 10_000;
  const first = Array.from({ length }, (_, i) => i * 3);
  const second = Array.from({ length }, (_, i) => i * 3 + 1);
  const third = Array.from({ length }, (_, i) => (length - 1 - i) * 3 + 2);
  const expected = Array.from({ length: length * 3 }, (_, i) => i);

  assert.deepEqual(merge(first, second, third), expected);
});

// Enumerate every nondecreasing array of length 0..3 over the values 0..2.
// There are 20 such arrays, so their triples cover 8,000 valid inputs.
function ascendingSamples(): number[][] {
  const samples: number[][] = [];

  function visit(prefix: number[], minimum: number): void {
    samples.push(prefix);
    if (prefix.length === 3) return;
    for (let value = minimum; value <= 2; value += 1) {
      visit([...prefix, value], value);
    }
  }

  visit([], 0);
  return samples;
}

test("matches an independent frequency oracle for 8,000 small input combinations", () => {
  const samples = ascendingSamples();
  assert.equal(samples.length, 20);
  let combinations = 0;

  for (const first of samples) {
    for (const second of samples) {
      for (const thirdAscending of samples) {
        const third: number[] = [];
        for (let i = thirdAscending.length - 1; i >= 0; i -= 1) {
          third.push(thirdAscending[i]!);
        }

        const counts = new Map<number, number>();
        for (const input of [first, second, third]) {
          for (const value of input) {
            counts.set(value, (counts.get(value) ?? 0) + 1);
          }
        }

        const expected: number[] = [];
        for (let value = 0; value <= 2; value += 1) {
          for (let count = counts.get(value) ?? 0; count > 0; count -= 1) {
            expected.push(value);
          }
        }

        assert.deepEqual(merge(first, second, third), expected,
          `inputs: ${JSON.stringify([first, second, third])}`);
        combinations += 1;
      }
    }
  }

  assert.equal(combinations, 8_000);
});
