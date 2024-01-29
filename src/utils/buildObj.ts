import set from "lodash/set";

export default function buildObject(array: { path: string; value: {} }[]) {
  const object = {};
  for (const { path, value } of array) {
    set(object, path, value);
  }
  return object as {
    [key: string]: any;
  };
}
