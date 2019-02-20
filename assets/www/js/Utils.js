/**
 * Provides useful functions
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */

/**
 * @since 13/04/2016
 * @version 1.0
 *
 * Checks data is a certain data type. Throws an error if the
 * data type does not match the desired data type. Based on
 * Underscore: http://underscorejs.org/docs/underscore.html
 *
 * Supported Types:
 * - String
 * - Object
 * - Boolean
 * - Number
 * - Array
 * - Date
 *
 * @summary Validates data type
 *
 * @throws {Error}
 *
 * @example
 * check({}, 'Object'); // true
 * check('Example', 'String'); // true
 * check(new Date(), 'Date') // true
 * check(5, 'String'); // Uncaught Error: Type Mismatch: A property did not have the following type: String(…)
 * check(false, 'Number') // Uncaught Error: Type Mismatch: A property did not have the following type: Number(…)
 *
 * @param {*} data Data to check
 * @param type Type the data should be
 *
 * @returns {boolean}
 */
function check(data, type){

	// Validate arguments
	if(arguments.length < 2){
		throw new Error('Expected two arguments');
	}
	if(!type){
		throw new Error('Must provide a type to check against')
	}
	if(type && typeof type !== 'string'){
		throw new Error('Type must be a string');
	}

	var toString = Object.prototype.toString;
	var nativeIsArray = Array.isArray;

	// Operators
	var opts = {
		'$isObject': function(obj){
			return toString.call(obj) === '[object Object]';
		},
		'$isArray': function(obj){
			return nativeIsArray ? Array.isArray(obj) : toString.call(obj) === '[object Array]';
		},
		'$isDate': function(obj){
			return toString.call(obj) === '[object Date]';
		},
		'$isBoolean': function(obj){
			return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
		},
		'$isNumber': function(obj){
			// http://stackoverflow.com/a/1830844/5678694
			return !isNaN(parseFloat(obj)) && isFinite(obj);
		},
		'$isString': function(obj){
			return typeof(obj) === 'string';
		}
	};

	/**
	 * Throws a formatted error
	 * @throws {Error}
	 */
	function throwError(){
		throw new Error("Type Mismatch: A property did not have the following type: " + type);
	}

	switch(type){
		case 'String':
			if(!opts.$isString(data)){
				throwError();
			}
			break;
		case 'Number':
			if(!opts.$isNumber(data)){
				throwError();
			}
			break;
		case 'Object':
			if(!opts.$isObject(data)){
				throwError();
			}
			break;
		case 'Array':
			if(!opts.$isArray(data)){
				throwError();
			}
			break;
		case 'Boolean':
			if(!opts.$isBoolean(data)){
				throwError();
			}
			break;
		case 'Date':
			if(!opts.$isDate(data)){
				throwError();
			}
			break;
		default:
			throw new Error('Unsupported type');
	}

	return true;
}