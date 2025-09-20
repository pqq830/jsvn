String.prototype.toCSSClassName = function() {
	return this.toLowerCase().replaceAll(/[\W]/g, "-");
};