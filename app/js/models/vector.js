var Vector2D = function (x, y) {
  this.magnitude = Math.sqrt(x * x + y * y);
  this.X = x;
  this.Y = y;
};

Vector2D.prototype.perpendicularClockwise = function () {
  return new Vector2D(-this.Y, this.X);
};

Vector2D.prototype.perpendicularCounterClockwise = function () {
  return new Vector2D(this.Y, -this.X);
};

Vector2D.prototype.getUnitVector = function () {
  return new Vector2D(this.X / this.magnitude, this.Y / this.magnitude);
};

Vector2D.prototype.scale = function (ratio) {
  return new Vector2D(ratio * this.X, ratio * this.Y);
};

export default Vector2D;
