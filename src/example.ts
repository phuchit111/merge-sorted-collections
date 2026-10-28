import { merge } from "./merge.js";

const collection_1 = [0, 3, 6];
const collection_2 = [1, 3, 7];
const collection_3 = [9, 5, 2, 0];

console.log(JSON.stringify(merge(collection_1, collection_2, collection_3)));
// [0,0,1,2,3,3,5,6,7,9]
