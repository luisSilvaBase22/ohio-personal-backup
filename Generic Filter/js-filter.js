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
	window.MultipleFilters = function( cmpntid ){

		//var LocalOptions = Options || DefaultOptions;
		var LocalOptions = DefaultOptions;
		LocalOptions.AjaxParameters.cmpntid = cmpntid;


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


				return this.FilteredItems;
			},
			sortAction: function( Sorting, sortAllItems ){
				var SortedItems = [];
				if ( sortAllItems && sortAllItems === true ) {

					this.FilteredItems = this.AllItems.slice();

					var UnsortedItems = this.FilteredItems.slice();

					Sorting.forEach( function( SortObj ) {
						SortedItems = SortObj.sortInst( UnsortedItems );
						UnsortedItems = SortedItems;
					} );

					if ( SortedItems !== undefined )
						this.FilteredItems =  SortedItems.slice();

					if ( Sorting.length === 0 ) {
						this.FilteredItems = this.AllItems;
					}

				} else {
					var UnsortedItems = this.FilteredItems.slice();

					Sorting.forEach( function( SortObj ) {
						SortedItems = SortObj.sortInst( UnsortedItems );
						UnsortedItems = SortedItems;
					} );

					if ( SortedItems !== undefined )
						this.FilteredItems =  SortedItems.slice();
				}

				console.log( "Results sorted: ", this.FilteredItems );

				return this.FilteredItems;

			},
			filterByKeyword: function( keyword, Filters, noFiltersApplied ){
				var FoundItems = [];

				var categories = Filters.map( function( Filter ) {
					return Filter.propertyName;
				} );

				if ( noFiltersApplied && noFiltersApplied === true ) {
					this.FilteredItems = this.AllItems.slice();
					FoundItems = this.FilteredItems = this.searchTerms( this.FilteredItems,  keyword, categories );
				} else {
					FoundItems = this.FilteredItems = this.searchTerms( this.FilteredItems, keyword, categories );
				}

				console.log( "Results sorted: ", FoundItems );

				return FoundItems;
			},
			searchTerms: function( Items, keyword, categories ){
				var _this = this;

				var FoundItems = Items.map(function( Item ){
					var title = Item.title.toLowerCase();
					title = title + _this.getCategoriesFromItem( Item, categories  );
					if (title.indexOf(keyword)>=0)
						return Item;
				}).filter(function( Item ){
					return Item !== undefined;
				});

				return FoundItems;
			},
			getCategoriesFromItem: function( Item, categories ){
				var allCategoriesFromItem = "";

				categories.forEach( function( category ) {
					allCategoriesFromItem = allCategoriesFromItem + Item[category];
				} );

				return allCategoriesFromItem.toLowerCase();
			},
			resetFilters: function(){
				this.FilteredItems = this.AllItems;
				return this.FilteredItems;
			},
			getOptionsFromContentToFillDropdown: function( propertyName ){

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
			preProcessFilters: function( Filters ){
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

				var FiltersWithColumnsAndOptions = Filters.map(function( Item ){
					if ( Item.hasOwnProperty("options") ) {
						Item.id = Item.id.substr(0,1 ) === "#" ? Item.id.substr(1) : Item.id;
						Item.options = Item.options.sort();
						Item.numColumns = numberOfColumns;
						return Item;
					} else {
						Item.id = Item.id.substr(0,1 ) === "#" ? Item.id.substr(1) : Item.id;
						Item.options = _this.getOptionsFromContentToFillDropdown( Item.propertyName );
						Item.numColumns = numberOfColumns;
						return Item;
					}
				});

				return FiltersWithColumnsAndOptions;
			},
			getContentPiecesData: function( mappingFunction ){
				var _this = this;
				var serviceURL = Utils.configureAjaxParameters();
				return OHIO.ODX.actions.getAjaxDataFromURL(serviceURL).then(function( response ){
					var resources = JSON.parse(response);
					var ContentPieces = resources.filter( function( Item, index ){
						Item.uuid = Utils.generatePieceId();
						return Item;
					} );

					if ( mappingFunction ) {
						ContentPieces = mappingFunction( ContentPieces );
					}

					return _this.AllItems = _this.FilteredItems = ContentPieces;
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

	window.FiltersWidget = function( componentID ){

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
		var MultipleFiltersDataLogic = Utils.inject('MultipleFilters(componentID)', console.log);

		var Instance = {
			elements: {},
			FilterInitialSettings: undefined,
			DropDownOptions: undefined,
			WidgetSettings: undefined,
			Filters: undefined,
			FiltersClicked: [],
			SortingClicked: [],
			totalResources: undefined,
			setElements: function(){
				var els = this.elements;
				var idRoot = this.WidgetSettings.root;

				els.$root = $( idRoot ) || $emptyDiv;//'#opd-filter'

				els.input = els.$root.find('.iop-filter__input-filter');
				els.searchButton = els.$root.find('.iop-filter__input-filter-btn');

				var $cards = els.$root.find('.odx-topic__cards');
				els.$cards = {
					root: $cards,
					items: $cards.find('.ohio-cards-container-grid')
				};

				els.resultsNumber = els.$root.find('.iop-filter__results-number');
				els.resetButton = els.$root.find('.iop-filter__reset-btn');

				els.pagination = els.$root.find('.odx-topic-hub-filter__pagination');
				els.anchorPagination = els.$root.find('#js-events-search-pagination--gov a');
				els.visibleItems = $cards.find('.ohio-card--visible'); //.iop-filter__item--visible

				els.noResultsImage = els.$root.find('.odx-events__img-no-results');

			},
			setPagination: function(){
				var _this = this;
				var els = this.elements;

				var $allItems = els.$cards.items;
				var $visibleItems = $('.odx-topic__cards .ohio-card--visible');//els.visibleItems;
				var visibleItemsNumber = $visibleItems.length;
				var $pagination = els.pagination;

				var elementsPerPage = this.WidgetSettings.elementsPerPage;

				$allItems.attr('data-page', '');
				$allItems.attr('data-column', '');

				$visibleItems.each(function (index) {
					var $item = $(this);
					index++;
					var page = Math.ceil(index / elementsPerPage);
					$item.attr('data-page', page);
				});

				$pagination.twbsPagination('destroy');

				var $noResults = els.noResultsImage;
				$noResults.hide();
				if (visibleItemsNumber <= 0) {
					$noResults.show();
					return;
				}

				$pagination.twbsPagination({
					totalPages: Math.ceil(visibleItemsNumber / elementsPerPage),
					visiblePages: 7,
					first: null,
					prev: '<i class="fa fa-caret-left"></i>',
					next: '<i class="fa fa-caret-right"></i>',
					last: null,
					onPageClick: function (event, page) {
						_this.paginateResults(page);
					}
				});

				var $anchorPagination = els.anchorPagination;
				$anchorPagination.attr('aria-label', 'resources-search-pagination');
				$anchorPagination.attr('href', '#top');
			},
			paginateResults: function(page) {
				var els = this.elements;
				var cardsContainer = els.$cards.root;
				var visibleItems = els.visibleItems;

				visibleItems.hide();

				//Show card per page number assigned
				var itemInPage = cardsContainer.find('.ohio-card--visible[data-page="'+page+'"]');
				itemInPage.show();

			},
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
			updateSortingOptionsSelected: function( SelectorId, SortItem ){//Insert or remove to the array, the Sorting function clicked by the user

				var sortingFunction;

				if ( SortItem.hasOwnProperty('sortFn') && SortItem.sortFn !== undefined ) {
					sortingFunction = SortItem.sortFn;
				} else if ( SortItem.hasOwnProperty('order') ) {
					//Add sorting methods
					sortingFunction = this.addDefaultSortingFunction( SortItem );
				}

				//Search to include or remove SortingClicked

				if ( this.SortingClicked.length === 0 ) {
					var SortMethod = {
						name: SelectorId,
						sortInst: sortingFunction
					};
					this.SortingClicked.push(SortMethod);
				} else {
					for( var i = 0; i < this.SortingClicked.length; i++ ) {
						//If I've found the item then I remove it
						if ( this.SortingClicked[i].name === SelectorId ) {
							this.SortingClicked.splice( i, 1 );
							break;
						}

						//If last element and item was not found, then I add it
						if (  this.SortingClicked[i].name !== SelectorId && this.SortingClicked.length - 1 === i ) {

							var SortMethod = {
								name: SelectorId,
								sortInst: sortingFunction
							};

							this.SortingClicked.push( SortMethod );
						}
					}
				}

				// this.SortingClicked updated
			},
			addDefaultSortingFunction: function( SortItem ){

				var ascendingOrDescendigSortFunction;

				if ( SortItem.order.toUpperCase() === "ASC" ) {

					ascendingOrDescendigSortFunction = function( ItemsToSort ) {
						ItemsToSort.sort( function( a, b ) {
							var titleA = a.title;
							var titleB = b.title;
							return titleA.localeCompare(titleB);
						} );

						return ItemsToSort;
					};
				}

				if ( SortItem.order.toUpperCase() === "DESC" ) {

					ascendingOrDescendigSortFunction = function( ItemsToSort ) {
						ItemsToSort.sort( function( a, b ) {
							var titleA = a.title;
							var titleB = b.title;
							return titleB.localeCompare(titleA);
						} );

						return ItemsToSort;
					};
				}

				return ascendingOrDescendigSortFunction;
			},

			allCategoriesFrom: function( taxonomy ){

				var allOptions;

				for ( var i = 0; i < this.Filters.length; i++ ) {
					if ( this.Filters[i].propertyName === taxonomy ) {
						allOptions = this.Filters[i].options;
					}
				}

				if ( allOptions[0] === "all" )
					allOptions.splice(0, 1);

				return allOptions;
			},
			addPropertiesToFiltersForTemplate: function( Filters ){
				//Infer number of columns for Bootstrap and get options from content if not specified in the FILTER
				var ProcessedFilters = MultipleFiltersDataLogic.preProcessFilters( Filters );
				return ProcessedFilters;
			},
			hideAllCards: function(){
				var els = this.elements;
				var $cards = els.$cards.items;

				var numberOfCards = $cards.length;

				for ( var i=0; i < numberOfCards; i++ ) {
					$( $cards[i] ).hide();
					$( $cards[i] ).removeClass('ohio-card--visible');
				}

			},
			showCards: function( uuidsToMap ){
				var els = this.elements;
				var $cards = els.$cards.items;

				this.hideAllCards();

				uuidsToMap.forEach( function( uuid ) {
					var numberOfCards = $cards.length;

					for ( var i=0; i < numberOfCards; i++ ) {
						if ( uuid === $cards[i].id ) {
							$( $cards[i] ).show();
							if ( ! $( $cards[i] ).hasClass('ohio-card--visible') )
								$( $cards[i] ).addClass('ohio-card--visible');
						}
					}
				} );
			},
			renderShowResults: function( numberResults ) {
				var els = this.elements;
				var resultsParagraph = els.resultsNumber;
				//var filterShowing = OHIO.Utils.actions.getMultilingualLabelByWCMKey('odx-filter-showing');
				//var results = OHIO.Utils.actions.getMultilingualLabelByWCMKey('odx-results');

				//resultsParagraph.text('We found ' + numberResults + ' ' + results);
				resultsParagraph.text('We found ' + numberResults + ' ' + 'results');
			},
			setEventForDropdown: function( idFilter, taxonomy ){
				var _this = this;

				var id = idFilter.substr(0,1) === '#' ? idFilter : "#" + idFilter;

				$( id ).select2().on('change', function( event ) {
					event.preventDefault();
					var categoriesSelectedFromDropdown = $(this).val();
					var lastCategorySelected = $('span.select2-selection[aria-owns="select2-js-select-' + taxonomy + '-results"]');
					var numberOfSelectedCategories = 0;

					if (categoriesSelectedFromDropdown !== null) {
						numberOfSelectedCategories = categoriesSelectedFromDropdown.length;
					}

					if (lastCategorySelected.length > 0) {
						lastCategorySelected = lastCategorySelected[0].getAttribute('aria-activedescendant').split('-').pop();
					} else if (numberOfSelectedCategories === 0) {
						categoriesSelectedFromDropdown = [];
						categoriesSelectedFromDropdown[0] = 'all';
						lastCategorySelected = 'all';
					}

					if (lastCategorySelected === 'all') {
						categoriesSelectedFromDropdown = [];
						categoriesSelectedFromDropdown[0] = 'all';
						$( id ).val(categoriesSelectedFromDropdown).trigger('change.select2');
					} else {
						if (categoriesSelectedFromDropdown !== null && categoriesSelectedFromDropdown[0] === 'all' && ( numberOfSelectedCategories > 1 )) {
							categoriesSelectedFromDropdown.splice(0, 1);
							$( id ).val(categoriesSelectedFromDropdown).trigger('change.select2');
						}
					}

					var filterAll = false;

					//Fix when removing more than 2 box and input left empty
					if ( categoriesSelectedFromDropdown === null ) {
						categoriesSelectedFromDropdown = [];
						categoriesSelectedFromDropdown.push('all');
						$( id ).val(categoriesSelectedFromDropdown).trigger('change.select2');
					}

					for (var i=0; i<categoriesSelectedFromDropdown.length; i++){
						if (categoriesSelectedFromDropdown[i] === "all") {
							filterAll = true;
							break;
						}
					}

					if (filterAll) {
						categoriesSelectedFromDropdown =_this.allCategoriesFrom( taxonomy );
					}

					_this.updateFiltersClicked( taxonomy, categoriesSelectedFromDropdown );


					//Return Items completed
					var FilteredItems = MultipleFiltersDataLogic.filterAction( _this.FiltersClicked );

					var isAnySortingActive = _this.SortingClicked.length > 0;

					if ( isAnySortingActive ) {
						FilteredItems = MultipleFiltersDataLogic.sortAction( _this.SortingClicked );
					}

					var uuidsToMap = FilteredItems.map( function( Item ) {
						return Item.uuid;
					} );

					var numberOfResults = uuidsToMap.length;

					_this.showCards( uuidsToMap );
					_this.renderShowResults( numberOfResults );
					_this.setPagination();

					/*
					if ( removedAllCategoriesFromBox && isAnySortingActive ) {
						_this.renderCards( FilteredItems );
						_this.renderShowResults( numberOfResults );
					} else {
						_this.showCards( uuidsToMap );
						_this.renderShowResults( numberOfResults );
						_this.setPagination();
					}
					*/


				});
			},
			setEventForSorting: function( sortingSelector, propertyName, SortObject ){

				var _this = this;
				var SortedItems = [];
				var FilteredItems = [];
				var SortObj = SortObject;

				$( sortingSelector ).on( "click", function(){
					_this.updateSortingOptionsSelected( sortingSelector, SortObj );//Update sort function for filtering global variable
					var sortAllItems = true; //To render all and not just those from last filtered applied
					SortedItems = MultipleFiltersDataLogic.sortAction( _this.SortingClicked, sortAllItems );
					var deferred = $.Deferred();
					_this.renderCards( SortedItems, deferred ).done( function(){

						var uuidsToMap = [];

						var filteredWasApplied = _this.FiltersClicked.length > 0;
						if ( filteredWasApplied ) {
							FilteredItems = MultipleFiltersDataLogic.filterAction( _this.FiltersClicked );
							uuidsToMap = FilteredItems.map( function( el ) {
								return el.uuid;
							} );

							var numberOfResults = uuidsToMap.length;
							_this.showCards( uuidsToMap );
							_this.renderShowResults( numberOfResults );
							_this.setPagination();

						}

					} );

					//_this.renderShowResults( numberOfResults );
					//_this.renderCards( FilteredItems );

				} );

			},
			setEventForInput: function(){
				var _this = this;

				var els = this.elements;
				var searchButton = els.searchButton;
				var input = els.input;

				searchButton.on('click', function(){
					var keyword = input.val();
					keyword.trim().toLowerCase();

					var hasAnyFilterBeingApplied = _this.FiltersClicked.length;

					var FilteredItems = [];

					if ( hasAnyFilterBeingApplied === 0 ) {
						var noFiltersApplied = true;
						FilteredItems = MultipleFiltersDataLogic.filterByKeyword( keyword, _this.Filters, noFiltersApplied );
					} else {
						FilteredItems = MultipleFiltersDataLogic.filterByKeyword( keyword, _this.Filters );
					}

					var uuidsToMap = FilteredItems.map( function( el ) {
						return el.uuid;
					} );

					var numberOfResults = uuidsToMap.length;

					_this.renderShowResults( numberOfResults );
					_this.showCards( uuidsToMap );
					_this.setPagination();

				});
			},
			setResetActions: function(){

				var _this = this;

				var els = this.elements;
				var resetButton = els.resetButton;

				resetButton.on('click', function(){
					console.log("RESET button");
					_this.resetAll();
				});
			},
			resetAll: function(){
				var _this = this;
				var els = this.elements;
				var allResultsNumber;
				var inputBox = els.input;

				inputBox.val('');

				var categoriesId = this.Filters.map( function( Filter ) {
					return Filter.id;
				} );

				categoriesId.forEach( function( idFilter ) {
					var id = idFilter.substr(0,1) === '#' ? idFilter : "#" + idFilter;
					$( id ).val( ["all"] ).trigger( 'change.select2' );
				} );

				if ( this.FilterInitialSettings.hasOwnProperty('sorting')  ) {
					this.FilterInitialSettings.sorting.forEach( function( Sort ) {
						_this.updateSortingOptionsSelected( Sort.id, Sort );
					} );
				}

				//Return Items completed
				//var FilteredItems = MultipleFiltersDataLogic.filterAction( this.FiltersClicked );
				var FilteredItems = MultipleFiltersDataLogic.resetFilters();
				this.FiltersClicked.splice(0);
				this.SortingClicked.splice(0);

				/*
				if ( this.SortingClicked.length > 0 ) {
					FilteredItems = MultipleFiltersDataLogic.sortAction( this.SortingClicked );
				}
				 */

				var uuidsToMap = FilteredItems.map( function( el ) {
					return el.uuid;
				} );

				//To render all cards and not just the few results from last sorting
				if ( uuidsToMap.length === this.totalResources ) {
					this.renderCards( FilteredItems );
				}

				allResultsNumber = this.totalResources;

				this.renderShowResults( allResultsNumber );
				this.setPagination();

			},
			renderComponent: function(){
				var _this = this;

				var mappingFunction;

				if ( this.FilterInitialSettings.hasOwnProperty('itemsMapping') && typeof this.FilterInitialSettings.itemsMapping === "function" ) {
					mappingFunction = this.FilterInitialSettings.itemsMapping;
				}

				MultipleFiltersDataLogic.getContentPiecesData( mappingFunction ).then( function( response ){
					console.log("The data: ", response );

					var Filters = _this.FilterInitialSettings.filters;
					var container = _this.WidgetSettings.root;
					var template = _this.WidgetSettings.template;
					var Sorting = _this.FilterInitialSettings.sorting;

					_this.Filters = _this.addPropertiesToFiltersForTemplate( Filters );
					_this.totalResources = response.length;

					if ( Sorting ) {
						for( var i=0; i<Sorting.length; i++ ) {
							if ( Sorting[i].id.substr(0,1) === '#' ) {
								Sorting[i].id = Sorting[i].id.substr(1);
							}
						}
					}

					var WebComponent = new OhioToolkitWebComponent({
						element: container, //'#id-container',
						templateLocation: template,
						data: {
							Filters: _this.Filters,
							sorting: Sorting
						}
					});

					WebComponent.render().then(function() {
						console.log('Filters Rendered!');

						_this.Filters.forEach( function( Filter ) {
							var categorySelector = Filter.id;
							var taxonomy = Filter.propertyName;
							_this.setEventForDropdown( categorySelector, taxonomy );
						} );

						//validate if defined
						if ( Sorting  ) {
							Sorting.forEach( function( SortObject ) {
								var sortSelector = SortObject.id.substr(0,1) === '#' ? SortObject.id : "#" + SortObject.id;
								var sortName = SortObject.propertyName;
								_this.setEventForSorting( sortSelector, sortName, SortObject );
							} );
						}
						_this.renderCards( response );

					});

					//_this.renderCards( response );

				});
			},
			renderCards: function( response, deferred ){
				var _this = this;
				var templateItems = _this.WidgetSettings.templateItems;
				var imageNoResults = _this.WidgetSettings.imageNoResults;
				var idTemplateItems = _this.WidgetSettings.idTemplateItems;

				var Cards = new OhioToolkitWebComponent({
					element: idTemplateItems,
					templateLocation: templateItems,
					data: {
						items: response,
						noResultsImgPath: imageNoResults
					}
				});

				Cards.render().then( function() {
					console.log("Cards rendered");
					_this.setElements();
					_this.setEventForInput();
					_this.setResetActions();
					_this.setPagination();

					if (deferred)
						deferred.resolve();
				} );

				return deferred;
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