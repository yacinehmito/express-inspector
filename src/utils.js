function capitalize(string) {
  return string[0].toUpperCase() + string.substring(1);
}

function takeUntil(array, predicate) {
  const index = array.findIndex(predicate);
  return array.slice(0, index);
}

module.exports = {
  capitalize,
  takeUntil
};
