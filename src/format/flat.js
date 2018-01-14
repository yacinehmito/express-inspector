const { flatMap } = require("../utils");
const { getRelativeLocation } = require("../callsite");

function getLeafs(node) {
  if (node.children && node.children.length > 0) {
    return flatMap(node.children, getLeafs);
  }
  return node.method
    ? [
        {
          method: node.method,
          fullpath: node.fullpath,
          location: getRelativeLocation(node.trace[0])
        }
      ]
    : [];
}

const methodPriorities = {
  get: 0,
  post: 1,
  put: 2,
  patch: 3,
  delete: 4,
  options: 5,
  head: 6
};

function getMethodPriority(method) {
  const priority = methodPriorities[method];
  return priority === undefined ? 255 : priority;
}

function flat(tree) {
  let methodsLength = 0;
  let pathsLength = 0;
  const leafs = getLeafs(tree).filter(leaf => leaf.method);
  leafs.forEach(leaf => {
    methodsLength = Math.max(methodsLength, leaf.method.length);
    pathsLength = Math.max(pathsLength, leaf.fullpath.length);
  });

  return leafs
    .sort((l1, l2) => {
      if (l1.fullpath > l2.fullpath) return 1;
      if (l1.fullpath < l2.fullpath) return -1;
      return getMethodPriority(l1) - getMethodPriority(l2);
    })
    .map(({ method, fullpath, location }) => {
      const methodPart = method.toUpperCase().padEnd(methodsLength);
      const pathPart = fullpath.padEnd(pathsLength);
      return `${methodPart} ${pathPart}       \x1b[2m${location}\x1b[0m\n`;
    })
    .join("");
}

module.exports = flat;
