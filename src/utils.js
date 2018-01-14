function capitalize(string) {
  return string[0].toUpperCase() + string.substring(1);
}

function takeUntil(array, predicate) {
  const index = array.findIndex(predicate);
  return array.slice(0, index);
}

function dropUntil(array, predicate) {
  const index = array.findIndex(predicate);
  return array.slice(index);
}

function flatMap(array, callback) {
  const output = [];
  const { length } = array;
  for (let i = 0; i < length; i++) {
    output.push(...callback(array[i], i, array));
  }
  return output;
}

module.exports = {
  capitalize,
  takeUntil,
  dropUntil,
  flatMap
};
