/**
 * A simple client side router. It offers an API for changing the URL and extracting
 * data from the URL. For hybrid mobile applications this type of technology allows
 * smooth view changes without flickering or javascript re-initialisation time.
 *
 * This object listens for URL change events and automatically renders the view associated
 * with the url detected.
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 *
 * @global
 */
window.Router = (function(){

	'use strict';

	/**
	 * Router version
	 *
	 * @type {string}
	 */
	var version = '1.0.1';

	/**
	 * Checks a value if of type array
	 * @param {*} value
	 * @returns {boolean}
	 */
	function isArray(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	}

	/**
	 * Checks wetter onhashchange is supported
	 *
	 * @returns {boolean}
	 */
	function isSupported(){
		return "onhashchange" in window;
	}

	/**
	 * Return URL hash fragment
	 */
	function getHashFragment(){
		return window.location.hash;
	}

	/**
	 * Retrieves params and values from the URL
	 *
	 * @returns {*}
	 */
	function getQueryParams(){
		var params = location.hash.split('?');
		if(params.length === 1){
			return {};
		}

		params = params[1];

		var fields = params.split('&'),
			output = {};
		fields.forEach(function(field){
			var item = field.split('=');
			output[item[0]] = item[1];
		});
		return output;
	}

	/**
	 * Clones an array
	 *
	 * @returns {Array}
	 */
	Array.prototype.clone = function() {
		return this.slice(0);
	};

	/**
	 * Compares an array to another array
	 *
	 * @param array
	 * @returns {boolean}
	 */
	Array.prototype.compare = function(array){
		// If array is falsy or not an array
		if(!array || !isArray(array)){
			return false;
		}

		// If array lengths aren't equal
		if(this.length !== array.length){
			return false;
		}

		// Clone arrays so we don't modify the original arrays
		var _selfClone = this.clone().sort(), _arrayClone = array.clone().sort();

		// Iterate over arrays and compare content
		for(var i = _arrayClone.length; i--;) {
			if(_selfClone[i] !== _arrayClone[i]){
				return false;
			}
		}

		return true;
	};

	/**
	 * Router Object
	 *
	 * @example
	 * var router = new Router();
	 *
	 * @returns {Router}
	 */
	function Router(){

		// Check support
		if(!isSupported()){
			throw new Error('hashchange event is not supported');
		}

		var router = this;
		this.version = version;
		this.routes = [];
		this.root = document.querySelector('body > #app-view');
		this.title = document.querySelector('#navbar .brand-logo');
		this.navBar = document.querySelector('#navbar-menu');
		this.currentRoute = null;

		/**
		 * Handles a hashchange event
		 */
		function onHashChange(){
			router.render(router.getCurrentRoute(getHashFragment().slice(1)));
		}

		// Format url if it does not contain a hash or if a slash does not follow the hash
		if(getHashFragment().length === 0 || getHashFragment()[1] !== '/'){
			window.location.hash = '#/';
		}

		// Set event handler for when the hash changes
		window.onhashchange = onHashChange;

		// Navigate to the current page once the page is ready
		$(function(){
			onHashChange(); // Trigger artificial hashchange event for initial page load
		});

		return this;
	}
	Router.prototype = {

		/**
		 * @global
		 *
		 * Creates a new Route. The Router will iterate through all routes created when the url
		 * changes and it will try to match the url to a route. When a route is matched, the Router
		 * will execute controller.
		 *
		 * @summary
		 * Adds a route to the Router
		 *
		 * @requires check
		 *
		 * @example
		 * Router.route('/', ExampleController);
		 * Router.route('/users', UsersController);
		 * Router.route('/user/:id', UserController);
		 * Router.route('/user/:id/delete', UserController);
		 *
		 * @param {string} path URL for route. To define arguments in the URL, place a
		 * colon in front of the argument.
		 * @param {object} controller Controller which handles the logic of a view
		 */
		route: function(path, controller){

			// Validate argument data type
			check(path, 'String');
			check(controller, 'Object');

			// Check path starts with a slash
			if (!/^\/.*/.test(path)) {
				throw new Error("Route path must start with '/'");
			}

			var _path = '',
				queryParams = [],
				pathReg = /(:[\w\(\)\\\+\*\.\?]+)+/g;

			_path += path.replace(pathReg, function(key) {
				queryParams.push(key.substring(1));
				return '';
			});

			// Remove multiple slashes
			_path = _path.replace(/\/\/+/g, "/");

			// Remove trailing slash
			_path = _path.match(/^\/{1}$/) ? _path: _path.replace(/\/$/, "");

			this.routes.push(new Route(_path, controller, queryParams));
		},

		/**
		 * Builds a controller object
		 *
		 * @example
		 * var Example = Router.createController({
		 * 	title: ...
		 * 	navBar: [],
		 * 	template: ...,
		 * 	props: {...},
		 * 	onBeforeRender: function(){...},
		 * 	onAfterRender: function(){...},
		 * 	onDestroy: function(){...},
		 * 	onDeviceOnline: function(){...},
		 * 	onDeviceOffline: function(){...}
		 * });
		 *
		 * @param {object} controller
		 * @returns {object} controller
		 */
		createController: function(controller){
			var base = {
				/**
				 * Page Title
				 */
				title: '',

				/**
				 * NavBar Button
				 */
				navBar: [],

				/**
				 * Properties
				 */
				props: {},

				/**
				 * Events
				 */
				onBeforeRender: function(){},
				onAfterRender: function(){},
				onDestroy: function(){},
				onDeviceOnline: function(){},
				onDeviceOffline: function(){}
			};

			// Override any properties received from the controller argument
			if(!controller.title){
				controller.title = base.title;
			}

			if(!controller.navBar){
				controller.navBar = base.navBar;
			}

			if(!controller.props){
				controller.props = base.props;
			}

			if(!controller.template){
				throw new Error('Each controller must have a view associated to it')
			}

			if(!controller.onBeforeRender){
				controller.onBeforeRender = base.onBeforeRender;
			}

			if(!controller.onAfterRender){
				controller.onAfterRender = base.onAfterRender;
			}

			if(!controller.onDeviceOnline){
				controller.onDeviceOnline = base.onDeviceOnline;
			}

			if(!controller.onDeviceOffline){
				controller.onDeviceOffline = base.onDeviceOffline;
			}

			if(!controller.onDestroy){
				controller.onDestroy = base.onDestroy;
			}

			return controller;
		},

		/**
		 * Changes hash of url which triggers the hashchange event effectively changing the page
		 *
		 * @example
		 * Router.go('/example');
		 *
		 * @param {string} path url to navigate to
		 * @param {object} params objects to serialise
		 */
		go: function(path, params){
			if(path[0] !== '/'){
				throw new Error("Route path must started with '/'");
			}

			var url = ['#', path];

			if(typeof params !== 'undefined'){
				url.push('?', $.param(params));
			}

			window.location.hash = url.join('');
		},

		/**
		 * Renders a view and calls the controller
		 *
		 * @param {Route} route the route to render
		 */
		render: function(route){
			// Clean up
			if(this.currentRoute){
				this.currentRoute.destroy();
			}

			if(!route){
				return;
			}

			if(console.time){
				console.time('render cycle');
			}

			this.currentRoute = route;

			route.controller.props = getQueryParams();

			route.controller.onBeforeRender();

			this.title.textContent = route.controller.title;

			var parsed = (typeof route.controller.navBar === 'function' ? route.controller.navBar.call(route.controller) : route.controller.navBar).map(function(button){
				var link = $("<a>");
				link.text(button.title || '');
				link.attr("href", button.href || 'javascript:void(0);');

				if(button.onClick){
					link.on('click', button.onClick.bind(route.controller));
				}
				return link;
			});

			$(this.navBar).empty().append(parsed);

			this.root.innerHTML = route.controller.template.innerHTML;

			route.controller.onAfterRender();

			if(console.timeEnd){
				console.timeEnd('render cycle');
			}
		},

		/**
		 * Returns the current url
		 *
		 * @example
		 * Router.current();
		 *
		 * @returns {string}
		 */
		current: function(){
			return window.location.pathname;
		},

		/**
		 * Retrieves the current route object
		 *
		 * @example
		 * Router.getCurrentRoute()
		 *
		 * @param path Route path to match
		 * @returns {Route}
		 */
		getCurrentRoute: function(path){
			for(var i = this.routes.length; i--;){
				if(this.routes[i].match(path)){
					return this.routes[i];
				}
			}
		},

		/**
		 * Change the network status
		 */
		status: function(value){
			check(value, 'String');

			if(value == 'online'){
				this.currentRoute.controller.onDeviceOnline();
			}else if(value == 'offline'){
				this.currentRoute.controller.onDeviceOffline();
			}else{
				throw new Error("Unrecognised network status '" + value + "'");
			}
		},

		/**
		 * Hard refresh the view
		 */
		reload: function(){
			window.location.reload(true);
		}
	};

	/**
	 * Route Object - Keeps the state of a route along with the associated controller and params expected
	 *
	 * @param path
	 * @param controller
	 * @param params
	 * @returns {Route}
	 * @constructor
	 */
	function Route(path, controller,params){
		this.path = path;
		this.controller = controller;
		this.params = params || [];
		return this;
	}
	Route.prototype = {
		/**
		 * Test to see the current path matches the route
		 *
		 * Compares base url along with query params
		 *
		 * @param path
		 */
		match: function(path){
			path = path.split('?')[0];

			if(path[0] === '#'){
				path.slice(1);
			}

			var pathMatch = path === this.path;

			if(pathMatch){
				var params = getQueryParams(), keys = Object.keys(params);
				keys = keys.filter(Boolean); // Will cause problems if param name is called 'false'
				return this.params.compare(keys);
			}

			return false;
		},

		/**
		 * Trigger the destroy function in the controller for problem clean up
		 */
		destroy: function(){
			this.controller.onDestroy();
		}
	};

	return new Router();

})();