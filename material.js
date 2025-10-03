// Base class
class Material {
  constructor(name, quantity, unit, price) {
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
    this.price = price;
    //this.cost = this.calculateCost();
  }

  get cost() {
    return this.quantity * this.price;
  }
    describe(){
        if (this.quantity != 0){
            return `${this.name}...${this.quantity}...${this.unit}...${this.price}...${this.cost}`
        }
    }
}
module.exports.Material=Material
