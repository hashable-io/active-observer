import R from "ramda";

export function noop() { 
  // Nothing to see or do here.
};

export const otherwise = R.T;

export function regExArrayContains(regExArray, value) {
  let inList = (expressionMatched, next) => {
    let matchList = new RegExp(next).exec(value);
    return expressionMatched || Boolean(matchList && matchList.length > 0);
  };

  return regExArray.reduce(inList, false);
};
