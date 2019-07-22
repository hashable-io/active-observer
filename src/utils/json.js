import R from "ramda";
import { Either } from "monet" 

export function parseJson(inputString) {
  try {
    return Either.right(JSON.parse(inputString));
  } catch (error) {
    return Either.left(error);
  }
}

export function sortObjectKeys(originalObject) {
  return R.map(R.toLower, R.keys(originalObject))
    .sort()
    .reduce((targetObj, key) =>
      R.assoc(key, originalObject[key], targetObj)
    , {});
};
