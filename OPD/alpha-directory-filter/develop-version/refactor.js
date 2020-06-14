(function(){
	var DefaultOptions = {
		Environment: {
			wcmLibraryLanguage: 'en',
			context: 'gov'
		},
		AjaxParameters: {
			source: 'library',
			srv: 'cmpnt',
			cmpntid: '[Component name="ohio design/agencies/odh/filter/locations/location-directory-json" resultsPerPage="" startPage="" format="id"]',
			'WCM_Page.ResetAll': 'TRUE',
			CACHE: 'NONE',
			CONTENTCACHE: 'NONE',
			CONNECTORCACHE: 'NONE',
		}
	};

	window.AlphadirectoryLocationsData = function( Options ){

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
			removeDuplicatedIndex: function( items ){
				var noRepeatedLetter = '';
				if ( items.length > 1 ) {
					for (var i = 1; i < items.length; i++) {
						if ( items[i].hasOwnProperty('index') ) {
							var currItemIndex = items[i].index;
							if(items[i-1].hasOwnProperty('index')) {
								var prevItemIndex = items[i-1].index;
								if ( currItemIndex === prevItemIndex ) {
									noRepeatedLetter = currItemIndex;
									delete items[i].index;
								}
							} else {
								if ( noRepeatedLetter === currItemIndex )
									delete items[i].index;
							}
						}
					}
					return items;
				} else {
					return items;
				}
			},
			isPair: function( indexAlphabet ){
				return ( indexAlphabet > 1 && (indexAlphabet % 2 === 0) ) ? true : false;
			},
			addIndexToItems: function( items ){
				var indexedItems = items.filter( function(el, index){
					var indexAlphabet = el.name.substring(0, 1);
					Object.assign(el, {index: indexAlphabet});
					if ( Utils.isPair(index) )
						Object.assign(el, {pairItem: true});
					return el;
				});
				var removedDuplicatedItems = Utils.removeDuplicatedIndex( indexedItems );

				return removedDuplicatedItems;
			}
		};

		return {
			Counties: undefined,
			filterByTitle: function( title ){
				var keyword = title.trim().toLowerCase();
				var currentTopics = [];
				return this.Counties.map(function( Item, index ){
					var title = Item.name.toLowerCase();
					if (title.indexOf(keyword)>=0)
						return index;
				}).filter(function( Item ){
					return Item !== undefined;
				});

			},
			filterByAlphaIndex: function( letterIndexes ){//input an array of selected letters sorted alphabetically: ["a", "d", "f"].sort()
				var resultIndexes = [];
				var curPosition = 0;

				for(var i=0; i<letterIndexes.length;i++){
					var letterIndex = letterIndexes[i];

					for(var j=curPosition; j<this.Counties.length;j++){
						var countyFirstLetter = this.Counties[j].name.substring(0, 1).toLowerCase();
						if( letterIndex === countyFirstLetter ) {
							resultIndexes.push(j);
							curPosition = j;
						}
						if (countyFirstLetter>letterIndex) {
							curPosition = j;
							break;
						}
					}

				}

				return resultIndexes;
				//returns an array with the indexes of the items to show
			},
			getCountiesData: function(){
				var _this = this;
				var serviceURL = Utils.configureAjaxParameters();
				return OHIO.ODX.actions.getAjaxDataFromURL(serviceURL).then(function( response ){
					var resources = JSON.parse(response);
					return _this.Counties = Utils.addIndexToItems( resources );
				},function( error ){
					console.error(error);
				});
			},
			start: function(){
				var _this = this;
				return this.getCountiesData().then(function( response ){
					console.log(response);
					return _this.Counties = response;
				});
			}
		};
	};

	//Set here the UI methods
	//Set a promise to wait until data are retrieved and then render the data
	window.AlphadirectoryLocationsRender = function(){
		var InstanceAlphaData = AlphadirectoryLocationsData();
		var $emptyDiv = document.createElement( 'div' );

		var Instance = {
			elements: {},
			setElements: function(){
				var els = this.elements;

				els.$root = $('#opd-filter') || $emptyDiv;

				var $filterByName = els.$root.find( '.iop-filter__first-section-container' );
				els.$filterByName = {
					root: $filterByName,
					title: $filterByName.find('.iop-filter__title-container'),
					label: $filterByName.find('.iop-filter__input-container label'),
					input: $filterByName.find('#iop-input-search'),
					button: $filterByName.find('.iop-filter__input-filter-btn')
				};

				var $filterByAlphaindex = els.$root.find('.js-opd-alphabet-container');
				els.$filterByAlphaindex = {
					root: $filterByAlphaindex,
					allTypeButton: $filterByName.find('.js-opd-alphabet-button-all')
				};

				els.resultsNumber = els.$root.find('.iop-filter__results-number');
				els.resetButton = els.$root.find('.iop-filter__reset-btn');

				var $cards = els.$root.find('#iop-filter-cards-container');
				els.$cards = {
					root: $cards,
					headerIndexes: $cards.find('.iop-filter__item'),
					items: $cards.find('.iop-filter__item')
				};

			},
			setInputActions: function(){
				//On click filter button, get the string
				var els = this.elements;
				var inputBox = els.$filterByName;

				var indexOfFoundItems;

				inputBox.button.on('click', function(){
					var queryString = inputBox.input.val();

					//Hide all the cards
					els.$cards.items.removeClass('iop-filter__item--visible');

					indexOfFoundItems = InstanceAlphaData.filterByTitle( queryString );
					indexOfFoundItems.forEach(function( idx ){
						els.$cards.items[idx].classList.add('iop-filter__item--visible');
					});
				});



			},
			renderComponent: function(){
				InstanceAlphaData.getCountiesData().then(function( response ){
					console.log("These are the Counties:", response);
					/*
					var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
					var component = new OhioToolkit.components.WebComponent({
						element: '#opd-filter',
						templateLocation:
							'[Element key="templateFile" type="content" context="selected" name="ohio design/component-templates/agencies/opd/opd-locations-cards-filter.hbs.html"]',
						data: {
							items: response,
							noResultsImgPath: '[Component name="ohio design/agencies/opd/default-images/no-results.png" rendition="auto" format="url"]',
							FilterTitle: 'opd-filter-by-name',
							InputPlaceholder: 'opd-filter-placeholder',
							Filter: 'opd-filter-title',
							Results: 'odx-results',
							FilterShowing: 'odx-filter-showing',
							alphabetIndex: alphabet,
							ResetFilters: 'opd-reset-filters',
							NoResultsText: 'odx-no-results-image'
						}
					});
					*/
				});
			},
			start: function(){
				this.setElements();
				this.renderComponent();
				this.setInputActions();
			}
		};

		return Instance;
	};
})();