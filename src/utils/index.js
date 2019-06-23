import R from "ramda";

export function noop() { 
  // Nothing to see or do here.
};


export function parseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return jsonString;
  }
};


export const otherwise = R.T;
