material=require("./material");
Material = material.Material
class Cement extends Material {
  constructor(quantity, price, factor) {
    super("cement", quantity, "bags", price);
    this.factor = factor; // extra attribute unique to cement
  }
}


class Sand extends Material {
  constructor(quantity, price, factor) {
    super("sand", quantity, "tons", price);
    this.factor = factor;
  }
}


class Ballast extends Material {
  constructor(quantity, price, factor) {
    super("ballast", quantity, "tons", price);
    this.factor = factor;
  }
}

// Example
let cement = new Cement(50, 700, 28.96);
let sand = new Sand(21, 1350, 1.8);
let ballast = new Ballast(42, 2500, 2.2);
module.exports.cement = cement;
module.exports.sand = sand;
module.exports.ballast = ballast
