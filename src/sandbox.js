const trace = require("./trace");

function requireFreshExpress() {
  const { cache } = require;
  const expressPaths = Object.keys(cache).filter(path =>
    /node_modules\/express\//.test(path)
  );
  const backupCache = {};
  for (const path of expressPaths) {
    backupCache[path] = cache[path];
    delete cache[path];
  }
  const express = require("express");
  Object.assign(cache, backupCache);
  return express;
}

function createSandbox() {
  const express = requireFreshExpress();
  trace(express);
  return express;
}

let express;
function getLazySandbox() {
  if (express) return express;
  express = createSandbox();
  return express;
}

module.exports = {
  createSandbox,
  getLazySandbox
};
