import R from "ramda";

export function parseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return jsonString;
  }
}

export function sortObjectKeys(originalObject) {
  return R.map(R.toLower, R.keys(originalObject))
    .sort()
    .reduce((targetObj, key) =>
      R.assoc(key, originalObject[key], targetObj)
    , {});
};
