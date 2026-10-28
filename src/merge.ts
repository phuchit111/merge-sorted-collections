/**
 * Merge two ascending arrays and one descending array into a new ascending array.
 *
 * Preconditions: all values are finite, nonnegative integers, collection_1 and
 * collection_2 are ascending, and collection_3 is descending. Equal values are
 * allowed. Inputs are assumed valid and are never modified.
 *
 * Time: O(n1 + n2 + n3). Extra space: O(1), excluding the returned array.
 */
export function merge(
  collection_1: readonly number[],
  collection_2: readonly number[],
  collection_3: readonly number[],
): number[] {
  const result: number[] = [];
  let index1 = 0;
  let index2 = 0;
  let index3 = collection_3.length - 1;

  while (
    index1 < collection_1.length ||
    index2 < collection_2.length ||
    index3 >= 0
  ) {
    // An exhausted array cannot win against any remaining finite value.
    const value1 = collection_1[index1] ?? Number.POSITIVE_INFINITY;
    const value2 = collection_2[index2] ?? Number.POSITIVE_INFINITY;
    const value3 = collection_3[index3] ?? Number.POSITIVE_INFINITY;

    if (value1 <= value2 && value1 <= value3) {
      result.push(value1);
      index1 += 1;
    } else if (value2 <= value3) {
      result.push(value2);
      index2 += 1;
    } else {
      result.push(value3);
      index3 -= 1;
    }
  }

  return result;
}
