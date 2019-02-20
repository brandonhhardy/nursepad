/**
 * Pocket.js is a wrapper for the window.localStorage. It provides helpful methods which
 * takes the form of MongoDB's proven syntax and provides a powerful lightweight abstraction from the complexity
 * of managing and querying local storage.
 *
 * The Store provides an in-memory layer for performance.
 *
 * @file A wrapper for native local storage
 *
 * @author Vincent Racine vincentracine@hotmail.co.uk
 */
window.Pocket = (function(pocket){

	'use strict';

		/**
		 * Prefixes are used for detecting storage state
		 * @type {{default: string, secure: string}}
		 */
	var prefixes = {'default':'db.', 'secure': 'db.secure.'},
		/**
		 * Pocket version
		 * @type {string}
		 */
		version = '1.0.1';

	/**
	 * Checks a value if of type array
	 * @param {*} value
	 * @returns {boolean}
	 */
	function isArray(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	}

	/**
	 * Checks a value if of type object
	 * @param {*} value
	 * @returns {boolean}
	 */
	function isObject(value){
		return Object.prototype.toString.call(value) === '[object Object]';
	}

	/**
	 * Comparison operators
	 * @see https://docs.mongodb.org/manual/reference/operator/query-comparison/
	 */
	var StoreOps = {
		/**
		 * Equality test
		 *
		 * @example
		 * Examples.find({ forename: { $eq: 'Foo' } });
		 *
		 * @example
		 * Examples.find({ forename: 'Foo' }); // Shorthand
		 * Examples.find({ forename: { $eq: 'Foo' } });
		 *
		 * @param a
		 * @param b
		 * @return {boolean} result
		 */
		'$eq': function(a,b){
			return a == b;
		},

		/**
		 * Inequality test
		 *
		 * @example
		 * Examples.find({ forename: { $ne: 'Foo' } });
		 *
		 * @param a
		 * @param b
		 * @return {boolean} result
		 */
		'$ne': function(a,b){
			return a != b;
		},

		/**
		 * Or test
		 *
		 * @example
		 * Examples.find({ forename: { $or: ['Foo','Bar'] } });
		 *
		 * @param a
		 * @param b
		 */
		'$or': function(a,b){
			// Throw an error if not passed an array of possibilities
			if(!isArray(b)){
				throw new Error('$or Operator expects an Array')
			}

			// Test each value from array of possibilities
			for (var i = b.length; i >= 0; i--) {
				if(this.$eq(a,b[i])){
					// Satisfied, return true
					return true;
				}
			}

			// Failed to satisfy, return false
			return false;
		},

		/**
		 * Greater than test
		 *
		 * @example
		 * Examples.find({ age: { $gt: 17 } });
		 *
		 * @param a
		 * @param b
		 */
		'$gt': function(a,b){
			return a > b;
		},

		/**
		 * Greater than or equal test
		 *
		 * @example
		 * Examples.find({ age: { $gte: 18 } });
		 *
		 * @param a
		 * @param b
		 */
		'$gte': function(a,b){
			return a >= b;
		},

		/**
		 * Less than test
		 *
		 * @example
		 * Examples.find({ age: { $lt: 18 } });
		 *
		 * @param a
		 * @param b
		 */
		'$lt': function(a,b){
			return a < b;
		},

		/**
		 * Less than or equal test
		 *
		 * @example
		 * Examples.find({ age: { $lte: 18 } });
		 *
		 * @param a
		 * @param b
		 */
		'$lte': function(a,b){
			return a <= b;
		}
	};

	/**
	 * Generates an id with a extremely low chance of collision
	 * @returns {string} ID
	 */
	var generateUniqueIdentifier = function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	};

	/**
	 * Checks whether localStorage is supported or not
	 * @returns {boolean} result
	 */
	function localStorageAvailable(){
		try{
			return ('localStorage' in window && window.localStorage !== null);
		}catch(e){
			return false;
		}
	}

	// Test and make sure local storage is supported
	if(!localStorageAvailable()){
		throw new Error('localStorage is not supported');
	}

	/**
	 * Store Object
	 *
	 * @example
	 * var store = new Store();
	 *
	 * @returns {Store}
	 */
	function Store(options){
		this.version = version;
		this.collections = {};
		this.options = options;
		return this;
	}
	Store.prototype = {
		/**
		 * Retrieve a collection from the store.
		 * If the collection does not exist, one will be created
		 * using the name passed to the function
		 *
		 * @example
		 * Store.addCollection('example');
		 * var Examples = Store.getCollection('example');
		 *
		 * @param {string} name Collection name
		 * @returns {Collection}
		 */
		getCollection: function(name){
			var collection = this.collections[name];

			if(!collection){
				collection = this.addCollection(name);
			}

			return collection;
		},

		/**
		 * Adds a collection to the store
		 *
		 * @example
		 * Store.addCollection('example');
		 *
		 * @param {string} name Collection name
		 * @returns {Collection}
		 */
		addCollection: function(name){
			// Create collection
			var collection = new Collection(name, this.options);
			// Add collection to Store
			this.collections[name] = collection;
			// return the collection
			return collection;
		},

		/**
		 * Removes a collection from the store
		 *
		 * @example
		 * Store.removeCollection('example');
		 *
		 * @param {string} name Collection name
		 * @returns {Store}
		 */
		removeCollection: function(name){
			var collection = this.collections[name];
			if(collection) {
				collection.destroy();
				window.localStorage.removeItem(prefixes.default + name);
				window.localStorage.removeItem(prefixes.secure + name);
				delete this.collections[name];
			}
			return this;
		},

		/**
		 * Retrieves JSON from localStorage and loads it into memory
		 */
		restoreStore: function(){
			var len = localStorage.length;

			for(; len--;){
				var key = localStorage.key(len);
				if(key.indexOf(prefixes.default) == 0 && key.indexOf(prefixes.secure) == -1){
					var row = localStorage.getItem(key);
					if(typeof row === 'string'){
						var data = JSON.parse(row),
							collection;

						collection = new Collection(data.name, data.options);
						collection.documents = data.documents;
						collection.length = data.documents.length;

						this.collections[collection.name] = collection;
					}
				}
			}

			return this;
		},

		/**
		 * Cleans up memory
		 */
		destroy: function(){
			for (var property in this.collections) {
				if (this.collections.hasOwnProperty(property)) {
					property.destroy();
				}
			}
			this.collections = null;
			window.Store = null;
		},

		/**
		 * Stores a collection into local storage
		 *
		 * @param {Collection} collection Collection to store into local storage
		 */
		commit: function(collection){
			var node = this.getCollection(collection.name);
			node.commit();
		},

		/**
		 * Encrypts the store
		 *
		 * @returns {Store}
		 */
		encrypt: function(password){
			var keys = Object.keys(this.collections),
				length = keys.length;

			// Remove each collection from offline storage but not from memory
			for(; length--;) {
				var key = localStorage.key(length);
				if (key && key.indexOf(prefixes.default) == 0 && key.indexOf(prefixes.secure) == -1) {
					window.localStorage.removeItem(key);
				}
			}

			length = keys.length;

			// Commit each collection with encryption
			for(; length--;) {
				var collection = this.collections[keys[length]];
				collection.commit(true, password);
			}

			// Remove collections from memory
			this.collections = {};

			return this;
		},

		/**
		 * Decrypts the store
		 */
		decrypt: function(password){
			var keys = Object.keys(window.localStorage).filter(function(key){ return key.indexOf(prefixes.secure) === 0; }),
				length = keys.length;

			for(; length--;){
				var row = localStorage.getItem(keys[length]);
				if(typeof row === 'string'){
					var plaintext = Aes.Ctr.decrypt(row, password, 256),
						data = JSON.parse(plaintext),
						collection;

					collection = new Collection(data.name);
					collection.documents = data.documents;
					collection.length = data.documents.length;

					localStorage.setItem(prefixes.default + collection.name, plaintext);
					localStorage.removeItem(keys[length]);

					this.collections[collection.name] = collection;
				}
			}

			return this;
		}
	};

	/**
	 * Collection Object
	 * @param name Collection name
	 * @returns {Collection}
	 */
	function Collection(name, options){
		this.name = name;
		this.documents = [];
		this.options = options;
		this.length = 0;
		return this;
	}
	Collection.prototype = {
		/**
		 * Inserts data into a collection
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ forename: 'Foo', surname: 'Bar' });
		 *
		 * @param {object} doc Data to be inserted into the collection
		 * @returns {Document}
		 */
		insert: function(doc){
			var document = new Document(doc);
			this.documents.push(document);
			this.length++;

			if(this.options.autoCommit){
				this.commit();
			}

			return document;
		},

		/**
		 * Removes documents which satisfy the query given
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: '394', forename: 'Foo', surname: 'Bar' });
		 * console.log(Examples.length) // 1
		 * Examples.remove({ _id: '394' });
		 * console.log(Examples.length) // 0
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: '394', forename: 'Foo', surname: 'Bar' });
		 * console.log(Examples.length) // 1
		 * Examples.remove({ forename: 'Foo' });
		 * console.log(Examples.length) // 0
		 *
		 * @param {object} query Query which tests for valid documents
		 * @return {Collection}
		 */
		remove: function(query){
			var documents = this.find(query);

			// Iterate through query results
			documents.forEach(function(document){
				// Get index of document in the collection
				var index = this.documents.indexOf(document);

				// If index is not -1 (means it wasn't found in the array)
				if(index !== -1){
					// If found in the array, remove it
					this.documents.splice(index, 1);
					// Update the length of the collection
					this.length--;
				}
			}, this);

			if(this.options.autoCommit){
				this.commit();
			}

			// Return collection
			return this;
		},

		/**
		 * Returns an array of documents which satisfy the query given
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: '1', forename: 'Foo', surname: 'Bar' });
		 * Examples.insert({ _id: '2', forename: 'Bar', surname: 'Foo' });
		 * Examples.insert({ _id: '3', forename: 'Foo', surname: 'Bar' });
		 * console.log(Examples.length) // 2
		 *
		 * var results = Examples.find({ forename: 'Foo' });
		 * console.log(results) // [{ _id: '1', forename: 'Foo', surname: 'Bar' }, { _id: '3', forename: 'Foo', surname: 'Bar' }]
		 *
		 * @param {object} query Query which tests for valid documents
		 * @return {Collection[]}
		 */
		find: function(query){
			var queryKeys,
				results;

			// Get clone of documents in collection
			results = this.documents.slice(0);

			// Get query keys
			queryKeys = Object.keys(query);


			while(queryKeys.length > 0){
				// Break out of loop if we have 0 documents in result
				if(results.length === 0){
					break;
				}

				// Filter all documents to satisfy the current query
				results = results.filter(function(document){
					// Extract the condition for the query to be satisfied
					var condition = {name: queryKeys[0], value: query[queryKeys[0]]};

					// Check to see that the document has the field from the query
					if(!document.hasOwnProperty(condition.name)){
						return false;
					}

					// If the condition is an Object then it corresponds to an operator
					if(isObject(condition.value)){
						// Extract the operator
						var operator = Object.keys(condition.value)[0];

						// Check to see if the operator is supported
						if(!StoreOps.hasOwnProperty(operator)){
							throw new Error("Unrecognised operator '" + operator + "'");
						}

						// Test to see if the document value satisfies the operator provided in the query
						return StoreOps[operator](document[condition.name], condition.value[operator]);
					}else{
						// Test to see if the document value for the property is equal the query
						return StoreOps.$eq(document[condition.name], condition.value);
					}
				});

				// Remove query key
				queryKeys.splice(0,1);
			}

			// Return results to caller
			return results;
		},

		/**
		 * Returns the first document which satisfied the query given
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: '1', forename: 'Foo', surname: 'Bar' });
		 * Examples.insert({ _id: '2', forename: 'Foo', surname: 'Bar' });
		 * console.log(Examples.length) // 2
		 *
		 * var result = Examples.findOne({ forename: 'Foo', surname: 'Bar' });
		 * console.log(result) // { _id: '1', forename: 'Foo', surname: 'Bar' }
		 *
		 * @param {object} query Query which tests for valid documents
		 * @return {Collection}
		 */
		findOne: function(query){
			return this.find(query)[0];
		},

		/**
		 * Updates an existing document inside the collection
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: 0, forename: 'Foo', surname: 'Bar' });
		 * Examples.update({ _id: 0 },{ forename: 'Baz', surname: 'Bar', title: 'Mrs' });
		 *
		 * @param {object} query Query which tests for valid documents
		 * @param {object} doc Data to be inserted into the collection
		 * @returns {Collection}
		 */
		update: function(query, doc){
			var documents = this.find(query);

			// Iterate through query results
			documents.forEach(function(document){
				// Get index of document in the collection
				var index = this.documents.indexOf(document);

				// If index is not -1 (means it wasn't found in the array)
				if(index !== -1){
					this.documents[index] = new Document(doc);
				}
			}, this);

			if(this.options.autoCommit){
				this.commit();
			}

			// Return collection
			return this;
		},

		/**
		 * Returns the size of the collection
		 * @returns {Number} size of collection
		 */
		size: function(){
			return this.documents.length;
		},

		/**
		 * Cleans up memory
		 */
		destroy: function(){
			this.documents = null;
			this.name = null;
		},

		/**
		 * Stores the collection into local storage
		 *
		 * @param secure {Boolean} Whether to encrypt or not [OPTIONAL]
		 * @param password {String} Encryption password [OPTIONAL]
		 * @return {Collection}
		 */
		commit: function(secure, password){
			var json = JSON.stringify(this);

			if(secure === true) {
				json = Aes.Ctr.encrypt(json, password, 256);
				window.localStorage.setItem(prefixes.secure.concat(this.name), json);
			}else{
				window.localStorage.setItem(prefixes.default.concat(this.name), json);
			}

			return this;
		}
	};

	/**
	 * Document Object
	 * @param {object} object Document data
	 * @returns {object} Document data
	 */
	function Document(object){
		// If object does not has an ID then assign one
		if(object.hasOwnProperty('_id') === false){
			object._id = generateUniqueIdentifier();
		}

		this.object = object;
		return this.object;
	}

	pocket.new = function(options){
		return new Store(typeof options === 'object' ? options : { autoCommit: true });
	};

	return pocket;

})((window.Pocket || {}));