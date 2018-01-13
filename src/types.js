// Trying to identify the type of express objects without express

function isApplication(object) {
  if (!object) return false;
  return object.name === "app";
}

function isRouter(object) {
  if (!object) return false;
  return object.name === "router" && object.stack;
}

function isRoute(object) {
  if (!object) return false;
  const proto = Object.getPrototypeOf(object);
  return proto && proto.constructor && proto.constructor.name === "Route";
}

module.exports = {
  isApplication,
  isRouter,
  isRoute
};
