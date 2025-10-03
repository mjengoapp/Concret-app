const material=require("./material");
Material=material.Material
class Block extends Material{
    constructor(quantity,price,size){
        super("blocks",quantity,"no",price);
        this.size = size
    }
    getBlockDimensions(){
        let blockSize=this.size;
        let blockDimensions=blockSize.split("x");
        let length=parseInt(blockDimensions[0])/1000;
        let thickness=parseInt(blockDimensions[1])/1000;
        let height=parseInt(blockDimensions[2])/1000;
        return [length,thickness,height]
    }
    getVolume(){
        let dimensions = this.getBlockDimensions();
        return dimensions[0]*dimensions[1]*dimensions[2]*this.quantity
    }
    getBlocksPerSquareMeter(){
        let dimensions = this.getBlockDimensions();
        let length=dimensions[0]+0.02;
        let height=dimensions[2]+0.02;
        let area = length*height;
        return 1/area
    }
}
let block=new Block(3000,65,"360x180x180")
console.log(block.getBlocksPerSquareMeter());
