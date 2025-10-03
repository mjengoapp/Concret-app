const aggregates = require("./aggregates");
const cement=aggregates.cement;
const sand = aggregates.sand;
const ballast = aggregates.ballast
const materialList=[cement,sand,ballast];


class Mixes{
    constructor(
        volume,
        factor,
        ratio,
        hasBallast = false
    ){
    this.volume = volume
    this.factor = factor
    this.ratio = ratio
    this.hasBallast = hasBallast
    }


    getRatio(){
        let ratio=this.ratio;
        let ratioList=ratio.split(":");
        return ratioList
    }


    getAggregate(index){
        let ratio=this.getRatio()
        return parseFloat(ratio[index])
    }
    getSum(){
        let agg;
        if (this.hasBallast === false){
            agg = this.getAggregate(0)+this.getAggregate(1)
        }else{
            agg = this.getAggregate(0)+this.getAggregate(1)+this.getAggregate(2)
        }
        return agg
    }


    getQuantity(index){
        let sum=this.getSum();
        let comp=this.getAggregate(index);
        let volume=this.volume
        let material=materialList[index]
        let factor=material.factor
        let mixFactor = this.factor;
        let dryVolume = volume*mixFactor;
        material.quantity = Math.ceil((comp/sum)*dryVolume*factor)
        return material.describe()
    }
}

class Concrete extends Mixes{
    getCost(){
        return [
            this.getQuantity(0),
            this.getQuantity(1),
            this.getQuantity(2)
        ]
        //console.log(cement.describe())
        //console.log(sand.describe())
        //console.log(ballast.describe())
    }
}
module.exports.Concrete=Concrete;
