(function(){
	var DefaultOptions = {
		Environment: {
			wcmLibraryLanguage: 'en',
			context: 'gov'
		},
		AjaxParameters: {
			source: 'library',
			srv: 'cmpnt',
			cmpntid: '[Component name="ohio design/agencies/odh/filter/generic-filter/json-data-getter" resultsPerPage="" startPage="" format="id"]',
			'WCM_Page.ResetAll': 'TRUE',
			CACHE: 'NONE',
			CONTENTCACHE: 'NONE',
			CONNECTORCACHE: 'NONE',
		}
	};

	//Logic part from component, gets the data to fill the cards
	window.MultipleFilters = function( Options ){

		var LocalOptions = Options || DefaultOptions;


		var Utils = {
			prepareLibrary: function(){
				// 1) Get all variables to support multilingual content
				var currentLanguage = OHIO.ODX.actions.getUserLanguageByCookie();
				// Get the library according to the user's language
				var wcmLibrary = (typeof window.WCMLibraries !== "undefined") ? window.WCMLibraries[currentLanguage] : window.WCMLibraries[ LocalOptions.Environment.wcmLibraryLanguage ];
				var virtualPortal = (window.portalContext !== 'none') ? window.portalContext + '/' : LocalOptions.Environment.context;
				var currentCluster = '';
				var urlString = window.location.href;
				var urlArray = urlString.split('/');
				var index = urlArray.indexOf(window.siteId);
				if (index > 0 && urlArray[index]) {
					currentCluster = urlArray[index + 1];
				}

				var currentPathArray = decodeURIComponent("[URLCmpnt type="sitearea" context="current" mode="current"]").split("/");
				var location = "";
				var length = currentPathArray.length;
				currentPathArray.forEach(function (element, index) {
					if (index > 1) {
						location += "/" + element;
					}
				});

				var LibrarySettings = {
					virtualPortal: virtualPortal,
					wcmLibrary: wcmLibrary,
					location: location
				};

				return LibrarySettings;
			},
			configureAjaxParameters: function(){
				var LibrarySettings = this.prepareLibrary();
				// 2) Configure parameters for AJAX call
				var Params = {
					source: LocalOptions.AjaxParameters.source,
					srv: LocalOptions.AjaxParameters.srv,
					cmpntid: LocalOptions.AjaxParameters.cmpntid,
					'WCM_Page.ResetAll': 'TRUE',
					CACHE: LocalOptions.AjaxParameters.CACHE,
					CONTENTCACHE: LocalOptions.AjaxParameters.CONTENTCACHE,
					CONNECTORCACHE: LocalOptions.AjaxParameters.CONNECTORCACHE,
					location: LibrarySettings.wcmLibrary + '/' + LibrarySettings.location,
				};

				var serviceURL = '/wps/wcm/connect/' + LibrarySettings.virtualPortal + LibrarySettings.wcmLibrary + '/' + window.siteId + '?' + $.param(Params);
				return serviceURL;
			},
			generatePieceId: function(){
				function s4() {
					return Math.floor( (1 + Math.random()) * 0x10000 ).toString( 16 ).substring( 1 );
				}

				return 'b' + s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
			},
			removeDuplicated: function( array ) {
				return array.filter((a, b) => array.indexOf(a) === b)
			}
		};
		return {
			AllItems: undefined,
			FilteredItems: undefined,
			filterAction: function( FilterSelected ){
				/*filter is an object
					{
						name: "topic|county|utility",
						value: "Aircraft|Allen"
					}
				*/

				this.FilteredItems = this.FilteredItems.filter( function( Item ){
					var filtersName = FilterSelected.name;
					if( Item.hasOwnProperty(filtersName) ) {
						if ( Item[filtersName] === FilterSelected.value ) {
							return Item;
						}
					}
				} );
			},
			resetFilters: function(){
				this.FilteredItems = this.AllItems;
			},
			getOptionsFromContent: function( propertyName ){

				var dropdownOptions = this.AllItems.map( function( Item ){
					if( Item.hasOwnProperty(propertyName) ) {
						return Item[propertyName];
					}
				} );

				var dropdownCleaned = Utils.removeDuplicated( dropdownOptions );
				return dropdownCleaned.sort();
			},
			prepareFiltersForTemplate: function( Filters ){
				var _this = this;

				var numberOfFilters = Filters.length;
				var numberOfColumns;

				switch( numberOfFilters ) {
					case 3:
						numberOfColumns = 4;
						break;
					case 2:
						numberOfColumns = 6;
						break;
					default:
						numberOfColumns = 12;
				}

				var DropDownOptions = Filters.map(function( Item ){
					if ( Item.hasOwnProperty("options") ) {
						var ItemCleaned = {
							propertyName: Item.propertyName,
							options: Item.options,
							numColumns: numberOfColumns
						};
						return ItemCleaned;
					} else {
						var ItemCleaned = {
							propertyName: Item.propertyName,
							options: _this.getOptionsFromContent( Item.propertyName ),
							numColumns: numberOfColumns
						};
						return ItemCleaned;
					}
				});

				return DropDownOptions;
			},
			getContentPiecesData: function(){
				var _this = this;
				var serviceURL = Utils.configureAjaxParameters();
				return OHIO.ODX.actions.getAjaxDataFromURL(serviceURL).then(function( response ){
					var resources = JSON.parse(response);
					var contentPieces = resources.filter( function( Item, index ){
						Item.uuid = Utils.generatePieceId();
						return Item;
					} );
					return _this.AllItems = _this.FilteredItems = contentPieces;
				},function( error ){
					console.error(error);
				});
			},
			start: function(){
				var _this = this;
				return this.getContentPiecesData().then(function( response ){
					console.log(response);
					var filterOne = {
						name: "county",
						value: "Allen"
					};

					var filterTwo = {
						name: "topics",
						value: "Aircraft"
					};

					_this.filterAction( filterOne );
					_this.filterAction( filterTwo );
				});
			}
		};
	};
	
	window.FiltersWidget = function(){

		var Utils  = {
			inject: function( path, fallback ) {
				try {
					return eval( 'window.' + path );
				} catch( e ) {
					console.warn( 'Dependency not found: ', path );
					return fallback;
				}
			}
		};

		var OhioToolkitWebComponent = Utils.inject('OhioToolkit.components.WebComponent', console.log );
		var MultipleFiltersDataLogic = Utils.inject('MultipleFilters()', console.log);
		
		var Instance = {
			FilterInitialSettings: undefined,
			DropDownOptions: undefined,
			WidgetSettings: undefined,
			FiltersForTemplate: undefined,
			getDropdownOptions: function( Filters ){
				return  MultipleFiltersDataLogic.prepareFiltersForTemplate( Filters );
			},
			renderComponent: function(){
				var _this = this;

				MultipleFiltersDataLogic.getContentPiecesData().then( function( response ){
					console.log("The data: ", response );
					var Filters = _this.FilterInitialSettings.filters;
					_this.FiltersForTemplate = _this.getDropdownOptions( Filters );
					var numberOfFilters = _this.FiltersForTemplate.length;

					var wrapper = _this.WidgetSettings.root;
					var template = _this.WidgetSettings.template;

					var WebComponent = new OhioToolkitWebComponent({
						element: wrapper, //'#id-container',
						templateLocation: template,
						data: {
							items: response,
							Filters: _this.FiltersForTemplate
						}
					});

					WebComponent.render().then(function(  ) {
						console.log('Rendered!');
					});
				});
			},
			start: function( Filters, WidgetSettings ) {
				this.FilterInitialSettings = Filters;
				this.WidgetSettings = WidgetSettings;
				this.renderComponent();
			}
		};
		
		return Instance;
	};

})();