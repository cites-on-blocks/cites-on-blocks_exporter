module.exports = class CountObject {
	constructor(times, counter){
      this.timesToGet = times;
	  this.timesGotten = 0;
      this.counter = counter;
	}

	getCount(){
		if(this.timesGotten<this.timesToGet){
			this.timesGotten++;
			return this.counter;
		}else{
			this.timesGotten = 0;
			this.counter++;
			return this.getCount();
		}
	}
}