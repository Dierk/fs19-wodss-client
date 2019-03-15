// times utility
// can be used with a result [0...x-1] or to just do something x times.

const timesFunction = function(indexToValue) {
  if( isNaN(parseInt(Number(this.valueOf()))) ) {
    throw new TypeError("Object is not a valid number");
  }
  const result = [];
  for (let i = 0; i < Number(this.valueOf()); i++) {
    result.push(indexToValue(i))
  }
  return result;
};

String.prototype.times = timesFunction;
Number.prototype.times = timesFunction;