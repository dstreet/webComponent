/**
 * WebComponent
 * --------------------------------------------------------
 * Load a packged web component.
 * Asynchronously load JavaScript files and HTML and CSS
 * fragments defined in a `package.json` file.
 */

define(['./lib/q.min', './lib/fragmentz/html'], function(Q, frag) {

	var WebComponent = function(id, dependencies) {

		/**
		 * Private Properties
		 * -------------------------
		 */
		var _Component = null
			, _componentHtml = {}
			, _componentCss = {}
			, _dependencies = dependencies
			, _componentDependencies = {}
			, _deferred = Q.defer()
			, _id = id
			, _main = id + '/main'
			, _cssDir = ''
			, _htmlDir = ''
			, _htmlFiles = []
			, _cssFiles = []
			, _packagePromise = {}
			, _package = {}
			, _loadPromise = {}
			, _loadFilesPromise = {};


		// Load package
		require(['text!' + _id + '/package.json'], _deferred.resolve);
		_packagePromise = _deferred.promise;
		_loadPromise = _getPackage();

		// Load resources
		_loadFilesPromise = _loadFiles();


		/**
		 * Private Methods
		 * -------------------------
		 */

		function _getDependencyPaths() {
			var returnPaths = [];

			for ( var d in _dependencies ) {
				returnPaths.push( _dependencies[d] );
			}

			return returnPaths;
		}

		function _appendDirectory(dir, files) {
			var returnFiles = [];

			if ( !files ) {
				return false;
			}

			// If directory has a trailing slash, remove it.
			if ( dir[dir.length-1] === '/' ) {
				dir = dir.slice(0, -1);
			}

			for ( var f = 0, len = files.length; f < len; f += 1 ) {
				returnFiles.push( dir + '/' + files[f] );
			}

			return returnFiles;
		}

		function _appendPlugin(plugin, files) {
			var returnFiles = [];

			if ( !files ) {
				return false;
			}

			// If directory has a trailing slash, remove it.
			if ( plugin[plugin.length-1] !== '!' ) {
				plugin += '!';
			}

			for ( var f = 0, len = files.length; f < len; f += 1 ) {
				returnFiles.push( plugin + files[f] );
			}

			return returnFiles;
		}

		function _getPackage() {
			return Q.when(_packagePromise, function(package){

				_package = JSON.parse( package );

				console.log('Finished loading...');

				// Set Main Javascript file
				if ( _package.hasOwnProperty('main') ) {
					_main = _id + '/' + _package.main;
				}

				// Get HTML and CSS directories
				if ( _package.hasOwnProperty('directories') ) {
					_htmlDir = _package.directories.html + '/' || '';
					_cssDir = _package.directories.css + '/' || '';
				}

				// Get the HTML and CSS files
				if ( _package.hasOwnProperty('scripts') ) {
					_htmlFiles = _appendDirectory( _id + '/' + _htmlDir, _package.scripts.html ) || [];
					_cssFiles = _appendDirectory( _id + '/' + _cssDir, _package.scripts.css ) || [];
				}
			});
		}

		function _loadFiles() {
			var deferred = Q.defer();

			// Load JS, HTML and CSS files once the package has been setup.
			Q.when(_loadPromise, function(){

				// Load main JS
				Q.when(_loadJS(), function() {

					// Load the dependencies, HTML and CSS in parallel
					Q.join(_loadDependencies(), _loadHtmlFrags(), _loadCssFrags(), function() {
						console.log('html loaded...');
						console.log('css loaded...');
						deferred.resolve();
					});

				});
				
			});

			return deferred.promise;
		}

		function _loadDependencies() {
			var deferred = Q.defer()
				, a = 0;

			require(_getDependencyPaths(), function() {
				for ( var d in _dependencies ) {
					_componentDependencies[d] = arguments[a]

					a += 1;
				}

				deferred.resolve();
			});

			return deferred.promise;
		}

		function _loadJS() {
			var deferred = Q.defer();

			require([_main], function(CompontentClass) {
				_Component = CompontentClass;

				deferred.resolve();
			});

			return deferred.promise;
		}

		function _loadHtmlFrags() {
			var deferred = Q.defer()
				, identifier = '';

			require(_appendPlugin('text!', _htmlFiles), function() {
				_htmlFrags = arguments;

				for ( var f = 0, len = _htmlFiles.length; f < len; f += 1 ) {
					identifier = _package.scripts.html[f].replace('.html', '');

					// Load the HTML fragment
					_componentHtml[identifier] = frag.html(arguments[f], require.toUrl(_htmlFiles[f]));
				}

				deferred.resolve();
			});

			return deferred.promise;
		}

		function _loadCssFrags() {
			var deferred = Q.defer()
				, identifier = '';

			require(_appendPlugin('text!', _cssFiles), function() {
				for ( var a = 0, len = arguments.length; a < len; a += 1 ) {
					identifier = _package.scripts.css[a].replace('.css', '');

					// Load the CSS fragment
					_componentCss[identifier] = frag.css(arguments[a], require.toUrl(_cssFiles[a]));
				}

				deferred.resolve();
			});

			return deferred.promise;
		}


		/**
		 * Public API
		 * -------------------------
		 */

		 return {

		 	// Waits for the component to be loaded
		 	loaded: function(callback) {
		 		Q.when(_loadFilesPromise, function(){
		 			if ( _Component !== null ) {
		 				callback();
		 			} else {
		 				console.error('Could not load component');
		 			}
		 		});
		 	},

		 	// Returns a new instance of the component
		 	new: function() {
		 		if ( _Component !== null ) {
			 		var component = new _Component();

	 				// Attach HTML and CSS
	 				component.html = _componentHtml;
	 				component.css = _componentCss;

	 				// Attach dependencies
	 				for ( var d in _componentDependencies ) {
	 					component[d] = _componentDependencies[d];
	 				}

	 				return component;
	 			} else {
	 				console.error('Failed to get new instance of component');
	 			}
		 	}

		 };
	};

	return WebComponent;
	
});