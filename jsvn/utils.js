/**
 * Clamps the specified value so that it will never be lower than the min value and never higher than the max value.
**/
function clamp(value, min, max) {
	return value < min ? min : value > max ? max : value;
}

function $(selector) {
	return document.querySelector(selector);
}