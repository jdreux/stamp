var _ = require('lodash');

function Validator(required){
	this.required = required;
	this.chain = [];
}

var required = function(){
	return new Validator(true);
}

var optional = function(){
	return new Validator(false);
}

Validator.prototype.validate = function(target, key){
	this.target = target;
	this.key = key;
	var value = this.target[this.key];
	if(this.required && (value == undefined || value.length == 0)){
		return ["required"];
	} else if(!this.required && value == undefined) {
		return [];
	} else {
		var me = this;
		return _(this.chain).map(function(v){
			return v.body.apply(me, [target[key]].concat(v.arguments));
		}).compact().value();

	}
}

Validator.register = function(name, body){

	function f(){
		this.chain.push({name: name, body: body, arguments: _.toArray(arguments)}); 
		return this;
	}

	if(body.length <= 1){
		Object.defineProperty(Validator.prototype, name, {
			get: f,
			set: f
		});
	} else {
		Validator.prototype[name] = f;
	}
}

Validator.register('string', function(val){

	if(typeof val !== 'string'){
		return "must be a string";
	}

});


Validator.register('length', function(val, min, max){
	if(!max){
		max = min; 
		min = 0;	
	} 

	if(val.length < min || val.length > max) {
		return "length: "+val.length+" expected: "+JSON.stringify([min, max]);
	}
});

Validator.register('toLowerCase', function(){
	console.log(this);
	this.target[this.key] = this.target[this.key].toLowerCase();
});

Validator.register('trim', function(){
	this.target[this.key] = this.target[this.key].trim();
});

// validator.prototype = {
// 	get string(){
// 		this.chain.push('string');
// 		return this;
// 	}
// }

function validate(validator, object){

	object = object || {};

	var errors = {}

	_.each(validator, function(value, key){
		var arr = value.validate(object,key);
		if(arr.length){
			errors[key] = arr;
		}
	});

	return errors;
}


var listing = {
	name: required().string.trim.length(0, 3).toLowerCase,
	// description: required().object({
	// 	en: required().string,
	// 	fr: required().string
	// })
	// name: required().string.length(0, 31).enums([]).default('1234'),
	// description: optional().string.default('Enter a description!'),
	// addedOn: required.date.to(moment)
}

var obj = {
	name: "   JUL    "
}

console.log("Validation result: ", validate(listing, obj), obj);
