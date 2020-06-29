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
			hasItemAnyofTheseValues: function(itemValues, toSearchValues){
				var categories = itemValues.split(",");

				for( var i = 0; i < toSearchValues.length; i++ ) {
					if ( categories.indexOf( toSearchValues[i] ) > -1 ) {
						return true;
					}
				}

				return false;
			},
			filterAction: function( FilterSelected ){
				/*
				FilterSelected = [
					{
						name: "county",
						value: ["Orange", "Adams"]
					},
					{
						name: "topic",
						value: ["Aircraft, Allen"]
					}
				]
				 */

				var _this = this;
				this.FilteredItems = this.AllItems.filter( function( Item ){
					for( var i=0; i < FilterSelected.length; i++) {
						var itemValues = Item[ FilterSelected[i].name];
						var toSearchValues = FilterSelected[i].value;
						var hasAvalidValue = _this.hasItemAnyofTheseValues( itemValues , toSearchValues );
						if ( !hasAvalidValue ) {/* Item did not approved first filter */
							break;
						}
						if ( i === FilterSelected.length - 1 )/*If item has approved all filters, then the Item was found*/
							return Item;
					}
				} );

				console.log( "Results from filter: ", this.FilteredItems );
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
				var items = dropdownOptions.map( function(item){
					return item.split(",");
				} );

				var preCategories = items.join();
				var categories = preCategories.split(",");

				var dropdownCleaned = Utils.removeDuplicated( categories );
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
							id: Item.id.substr(0,1 ) === "#" ? Item.id.substr(1) : Item.id,
							allLabel: Item.allLabel,
							label: Item.label,
							propertyName: Item.propertyName,
							options: Item.options.sort(),
							numColumns: numberOfColumns
						};
						return ItemCleaned;
					} else {
						var ItemCleaned = {
							id: Item.id.substr(0,1 ) === "#" ? Item.id.substr(1) : Item.id,
							allLabel: Item.allLabel,
							label: Item.label,
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
			FiltersClicked: [],
			updateFiltersClicked: function( category, values ){
				var _this = this;
				if ( this.FiltersClicked.length === 0 ) {
					var valueFromDropdownSelected = {
						name: category,
						value: values
					};
					this.FiltersClicked.push(valueFromDropdownSelected);
				} else {
					for( var i = 0; i < this.FiltersClicked.length; i++ ) {
						if ( this.FiltersClicked[i].name === category ) {
							this.FiltersClicked[i].value = values;
							break;
						}

						if ( this.FiltersClicked[i].name !== category && i === this.FiltersClicked.length - 1 ) {
							var valueFromDropdownSelected = {
								name: category,
								value: values
							};
							this.FiltersClicked.push(valueFromDropdownSelected);
						}
					}
				}
			},
			prepareFiltersForTemplate: function( Filters ){
				return  MultipleFiltersDataLogic.prepareFiltersForTemplate( Filters );
			},
			setEventForDropdown: function( idFilter, category ){
				var _this = this;

				var id = idFilter.substr(0,1) === '#' ? idFilter : "#" + idFilter;

				$( id ).select2().on('change', function( event ) {
					event.preventDefault();
					var categoryArray = $(this).val();
					var lastCategorySelected = $('span.select2-selection[aria-owns="select2-js-select-' + category + '-results"]');
					var categoryLength = 0;

					if (categoryArray !== null) {
						categoryLength = categoryArray.length;
					}

					if (lastCategorySelected.length > 0) {
						lastCategorySelected = lastCategorySelected[0].getAttribute('aria-activedescendant').split('-').pop();
					} else if (categoryLength === 0) {
						categoryArray = [];
						categoryArray[0] = 'all';
						lastCategorySelected = 'all';
					}

					if (lastCategorySelected === 'all') {
						categoryArray = [];
						categoryArray[0] = 'all';
						$( id ).val(categoryArray).trigger('change.select2');
					} else {
						if (categoryArray !== null && categoryArray[0] === 'all' && (categoryLength > 1 || countiesLength > 1)) {
							categoryArray.splice(0, 1);
							$( id ).val(categoryArray).trigger('change.select2');
						}
					}

					_this.updateFiltersClicked( category, categoryArray );


					MultipleFiltersDataLogic.filterAction( _this.FiltersClicked );
				});
			},
			renderComponent: function(){
				var _this = this;

				MultipleFiltersDataLogic.getContentPiecesData().then( function( response ){
					console.log("The data: ", response );
					var Filters = _this.FilterInitialSettings.filters;
					_this.FiltersForTemplate = _this.prepareFiltersForTemplate( Filters );

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
						console.log('Filters Rendered!');

						_this.FiltersForTemplate.forEach( function( Filter ) {
							_this.setEventForDropdown( Filter.id, Filter.propertyName );
						} );

					});

					var templateItems = _this.WidgetSettings.templateItems;

					var Cards = new OhioToolkitWebComponent({
						element: "#cards-generic-wrapper",
						templateLocation: templateItems,
						data: {
							items: response
						}
					});

					Cards.render().then( function(  ) {
						console.log("Cards rendered");
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