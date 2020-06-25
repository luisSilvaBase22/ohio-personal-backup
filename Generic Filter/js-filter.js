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

})();