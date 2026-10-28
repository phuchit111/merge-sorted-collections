# Merge sorted collections (TypeScript)

Merge two arrays ordered from minimum to maximum and one array ordered from
maximum to minimum. The result is a new array ordered in ascending order.
Duplicates and zeros are preserved, empty arrays are supported, and the input
arrays are never modified. No sorting function or array reversal is used.

## Requirements and dependency setup

Install Node.js 22 or newer with npm. Open a terminal in this repository and run:

```sh
npm ci
```

The committed `package-lock.json` pins the dependencies. There are no runtime
dependencies. TypeScript and Node.js type definitions are development
dependencies; tests use Node.js's built-in test runner.

If you downloaded the Git bundle, first clone it into a working directory:

```sh
git clone merge-sorted-collections.bundle merge-sorted-collections
cd merge-sorted-collections
npm ci
```

Alternatively, extract the source ZIP, open its `merge-sorted-collections`
directory in a terminal, and run `npm ci`.

## Execute the example

```sh
npm start
```

Expected output (after the build messages):

```text
[0,0,1,2,3,3,5,6,7,9]
```

To compile once and run the compiled example directly:

```sh
npm run build
node dist/src/example.js
```

## Run the unit tests

```sh
npm test
```

This compiles the TypeScript source and tests, then runs the unit tests. For
coverage or a separate type check:

```sh
npm run test:coverage
npm run typecheck
```

The tests cover interleaved values, duplicates, zero, empty inputs, uneven
lengths, large safe integers, large arrays, and input immutability. Generated
cases check the complete result against independently counted values without
using a sorting function.

## Use the function

```ts
import { merge } from "./src/merge.js";

const result = merge(
  [0, 3, 6],
  [1, 3, 7],
  [9, 5, 2, 0],
);

console.log(result); // [0, 0, 1, 2, 3, 3, 5, 6, 7, 9]
```

TypeScript uses `number[]` for integer arrays. The signature accepts ordinary
arrays as well as readonly arrays and returns a mutable array:

```ts
function merge(
  collection_1: readonly number[],
  collection_2: readonly number[],
  collection_3: readonly number[],
): number[];
```

The `.js` import extension is intentional: TypeScript resolves it to the `.ts`
source during compilation and keeps it valid for the compiled Node.js modules.
To import from JavaScript after building, use `./dist/src/merge.js`.

### Input contract

- `collection_1` and `collection_2` are already in nondecreasing order.
- `collection_3` is already in nonincreasing order.
- Values are nonnegative integers represented as finite JavaScript numbers;
  use safe integers (at most `Number.MAX_SAFE_INTEGER`) for exact representation.
- Any or all arrays may be empty; repeated values are allowed.

The function assumes these preconditions and does not validate or repair input.

### Algorithm and complexity

Two pointers start at the beginning of the ascending arrays. A third pointer
starts at the end of the descending array, where its smallest value is. Each
iteration appends the smallest available value and moves just its pointer.
Exhausted arrays use positive infinity as a comparison sentinel; infinity is
never appended for valid inputs.

Each pointer exposes the smallest remaining value in its array, so the smallest
of the three candidates is the smallest value remaining overall. Repeating this
step produces the entire ascending result, preserving every occurrence.

For `N = collection_1.length + collection_2.length + collection_3.length`, this
takes **O(N) time**, **O(N) space for the returned array**, and **O(1) extra space**.

## Project layout

```text
src/merge.ts          Merge implementation
src/example.ts        Executable usage example
test/merge.test.ts    Unit tests
package.json         Commands and dependency declarations
package-lock.json    Reproducible dependency versions
tsconfig.json        Strict TypeScript compiler settings
```

## Publish an accessible repository

The supplied project is a local Git repository. To give other people a hosted
repository URL, create an empty public repository in your Git hosting account,
then use its actual URL in these commands:

```sh
git remote add origin https://github.com/YOUR_USERNAME/merge-sorted-collections.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your account name. Do not initialize the hosted
repository with another README, license, or `.gitignore`; this project already
has its own files and initial commit.
