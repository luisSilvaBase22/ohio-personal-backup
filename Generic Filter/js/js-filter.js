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
			'WCM_Page.ResetAll': 'TRUE'
		}
	};

	//Logic part from component, gets the data to fill the cards
	window.MultipleFilters = function( ComponentToGetData ){

		//var LocalOptions = Options || DefaultOptions;
		var LocalOptions = DefaultOptions;

		if ( typeof ComponentToGetData === "object" && ComponentToGetData.id ) {
			LocalOptions.AjaxParameters.cmpntid = ComponentToGetData.id;
			if (ComponentToGetData.location)
				LocalOptions.AjaxParameters.location = ComponentToGetData.location;

		} else {
			LocalOptions.AjaxParameters.cmpntid = ComponentToGetData;
		}

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
					location: LocalOptions.AjaxParameters.location ? LocalOptions.AjaxParameters.location : LibrarySettings.wcmLibrary + '/' + LibrarySettings.location,
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
				return array.filter( function( a, b ){
					return array.indexOf( a ) === b;
				} );
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
					FoundItems = this.FilteredItems = this.searchTerms( this.FilteredItems,  keyword.toLowerCase(), categories );
				} else {
					FoundItems = this.FilteredItems = this.searchTerms( this.FilteredItems, keyword.toLowerCase(), categories );
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
			filterByDate: function( startTimeInput, endTimeInput, noFiltersApplied ){
				var FoundItems = [];

				if ( noFiltersApplied && noFiltersApplied === true ) {
					this.FilteredItems = this.AllItems.slice();
					FoundItems = this.FilteredItems = this.searchEventWithDate( this.FilteredItems,  startTimeInput, endTimeInput );
				} else {
					FoundItems = this.FilteredItems = this.searchEventWithDate( this.FilteredItems, startTimeInput, endTimeInput );
				}

				console.log( "Results sorted: ", FoundItems );

				return FoundItems;

			},
			searchEventWithDate: function( Events, startTimeInput, endTimeInput ){
				var FoundEvents = Events.map( function( Event ){
					var startTime = new Date ( Event.startTimeWCM );
					if ( ((startTime >= startTimeInput && startTimeInput !== '') &&
						(startTime <= endTimeInput && endTimeInput !== '')) ) {
						return Event;
					}
				} ).filter(function( Item ){
					return Item !== undefined;
				});

				return FoundEvents;
			},
			filterCustom: function( filterFn ){
				var FoundItems = filterFn( this.FilteredItems );
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
			sortByDateForEventsTypeContentOnly: function( a, b ){
				var aDate = new Date( a.startTimeWCM );
				var bDate = new Date( b.startTimeWCM );
				return ((aDate < bDate) ? -1 : ((aDate > bDate) ? 1 : 0));
			},
			filterByAlphaIndex: function( letterIndexes, propertyName ){//input an array of selected letters sorted alphabetically: ["a", "d", "f"].sort()
				var resultUuids = [];
				var resultItems = [];//Used only for debugging
				var curPosition = 0;

				for(var i=0; i<letterIndexes.length;i++){
					var letterIndex = letterIndexes[i];

					for(var j=curPosition; j<this.AllItems.length;j++){
						var CurrentItem = this.AllItems[j];
						var countyFirstLetter = CurrentItem[propertyName].substring(0, 1).toLowerCase();
						if( letterIndex === countyFirstLetter ) {
							resultUuids.push( CurrentItem.uuid );
							resultItems.push( CurrentItem );
							curPosition = j;
						}
						/* Compares lexicographically "a">"c" */
						if ( countyFirstLetter !== "" && countyFirstLetter>letterIndex) {
							curPosition = j;
							break;
						}
					}

				}
				console.log("Filtered by alphabetic selection: ", resultItems );
				return resultUuids;
				//returns an array with the indexes of the items to show
			},
			addIndexToItems: function( Items, propertyName ){
				var indexedItems = Items.filter( function(el, index){
					var indexAlphabet = el[propertyName].substring(0, 1);
					el.index = indexAlphabet;
					if ( Utils.isPair(index) )
						el.pairItem = true;
					return el;
				});
				var removedDuplicatedItems = Utils.removeDuplicatedIndex( indexedItems );

				return removedDuplicatedItems;
			},
			removeCurrentContentPiece: function( ContentPieces ){
				//Remove content piece from where the filter is being referenced

				var indexOfItemToRemove;

				for( var i = 0; i < ContentPieces.length; i++ ){
					if ( ContentPieces[i].uuid === '[Property field="id" type="content" context="current"]' ){
						indexOfItemToRemove = i;
						break;
					}
				}

				if ( indexOfItemToRemove ) {
					ContentPieces.splice( indexOfItemToRemove, 1 );
				}
			},
			getContentPiecesData: function( mappingFunction, sortByDate, AlphabeticalFilter ){
				var _this = this;
				var serviceURL = Utils.configureAjaxParameters();
				return OHIO.ODX.actions.getAjaxDataFromURL(serviceURL).then(function( response ){
					var resources = JSON.parse(response);
					var ContentPieces = resources.filter( function( Item ){
						if ( ! Item.hasOwnProperty('uuid') ) {
							Item.uuid = Utils.generatePieceId();
						}
						return Item;
					} );

					_this.removeCurrentContentPiece( ContentPieces );

					if ( mappingFunction ) {
						ContentPieces = mappingFunction( ContentPieces );
					}

					if ( sortByDate ) {
						ContentPieces = ContentPieces.sort(_this.sortByDateForEventsTypeContentOnly);
					}

					if ( AlphabeticalFilter ) {
						var _propertyName = AlphabeticalFilter.hasOwnProperty('propertyName') ? AlphabeticalFilter.propertyName : 'title';
						ContentPieces = _this.addIndexToItems( ContentPieces, _propertyName );
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

	//UI part
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
		var MultipleFiltersDataLogic = Utils.inject('MultipleFilters(componentID)', console.log );
		var FormioInstance = Utils.inject('Formio', console.log );

		var Instance = {
			elements: {},
			FilterInitialSettings: undefined,
			DropDownOptions: undefined,
			WidgetSettings: undefined,
			Filters: undefined,
			FiltersClicked: [],
			SortingClicked: [],
			multipleLettersClicked: [],
			totalResources: undefined,
			setElements: function(){
				var els = this.elements;
				var idRoot = this.WidgetSettings.root;

				els.$root = $( idRoot ) || $emptyDiv;//'#opd-filter'

				els.input = els.$root.find('.js-b22-input');
				els.searchButton = els.$root.find('.js-b22-filter-button');

				var $cards = els.$root.find('.js-b22-items-container');
				els.$cards = {
					root: $cards,
					headerIndexes: $cards.find('.js-b22-item-header'),
					groupHeaders: $cards.find('.js-b22-index-header'),
					items: $cards.find('.js-b22-item')
				};

				els.$collapsibleFirstSectionFiltersMobile = els.$root.find('.js-b22-hide-first-section-filters-mobile');
				els.$collapsibleSecondSectionFiltersMobile  = els.$root.find('.js-b22-filter__second-section');
				els.$collapseButton = els.$root.find('.js-b22-collapse-btn');

				var $filterByAlphaindex = els.$root.find('.js-b22-alphabet-container');
				els.$filterByAlphaindex = {
					root: $filterByAlphaindex,
					allTypeButton: $filterByAlphaindex.find('.js-b22-alphabet-button-all'),
					letters: $filterByAlphaindex.find('.js-b22-indexes')
				};

				els.resultsNumber = els.$root.find('.js-b22-results-number');
				els.resetButton = els.$root.find('.js-b22-reset-button');

				els.pagination = els.$root.find('.js-b22-filter-pagination');//odx-topic-hub-filter__pagination
				els.anchorPagination = els.$root.find('.js-b22-filter-pagination a');
				els.visibleItems = $cards.find('.js-b22-item--visible'); //.iop-filter__item--visible
				els.visibleGroupHeaders = $cards.find('.js-b22-index-header--visible');
				els.noResultsImage = els.$root.find('.js-b22-image-no-results');//odx-events__img-no-results

			},
			setPagination: function(){
				var _this = this;
				var els = this.elements;

				var $allItems = els.$cards.items;
				var $allHeaders = els.$cards.groupHeaders;
				var $visibleItems = $('.js-b22-items-container .js-b22-item--visible');//els.visibleItems;
				var visibleItemsNumber = $visibleItems.length;
				var $pagination = els.pagination;

				var elementsPerPage = this.WidgetSettings.elementsPerPage;

				$allHeaders.attr('data-page', '');
				$allItems.attr('data-page', '');
				$allItems.attr('data-column', '');

				$visibleItems.each(function (index) {
					var $item = $(this);
					index++;
					var page = Math.ceil(index / elementsPerPage);
					$item.attr('data-page', page);

					if( $item.attr('data-first-item') ) {
						var keyHeader = $item.attr('data-first-item');
						var header = els.$cards.root.find('.' + keyHeader);//$("h3."+keyHeader);
						header.attr('data-page', page);
					}

				});

				$pagination.twbsPagination('destroy');

				var $noResults = els.noResultsImage;
				$noResults.hide();
				if (visibleItemsNumber <= 0) {
					$noResults.show();
					$allHeaders.hide();
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

				var $pages = $pagination.find('.page-link');
				$pages.each(function(){
					var $page = $(this);
					var pageNumber = $page.text();
					$page.attr('aria-label',"Page Number "+pageNumber);
				});

				$pages.first().attr('aria-label',"Previous page");
				$pages.last().attr('aria-label',"Next page");

				var $anchorPagination = els.anchorPagination;
				$anchorPagination.attr('aria-label', 'resources-search-pagination');
				$anchorPagination.attr('href', '#top');
			},
			paginateResults: function(page) {
				var _this = this;
				var els = this.elements;
				var cardsContainer = els.$cards.root;
				var visibleItems = els.visibleItems;
				var headers = els.visibleGroupHeaders;

				visibleItems.hide();
				headers.hide();

				//Show card per page number assigned
				var itemInPage = cardsContainer.find('.js-b22-item--visible[data-page="'+page+'"]');
				itemInPage.show();

				//Show index header per page number assigned
				var headerInPage = cardsContainer.find('.js-b22-index-header[data-page="' + page + '"]');
				headerInPage.show();

				this.removeAriaAttributesFromItemsDisplayed();
				this.focusFirstItemAfterPagination( itemInPage );

				var $activePage = els.pagination.find('.page-item.active');
				$activePage.on('click', function() {
					_this.focusFirstItemAfterPagination( itemInPage );
				});

			},
			removeAriaAttributesFromItemsDisplayed: function(){
				//Accessibility
				var els = this.elements;
				var $items = els.$cards.items;

				$items.each( function() {
					this.removeAttribute('tabindex');
					this.removeAttribute('aria-hidden');
				} );
			},
			focusFirstItemAfterPagination: function( $items ){
				//Accessibility
				if ( $items.length > 0 ) {
					$items[0].setAttribute('tabindex', '0');
					$items[0].setAttribute('aria-hidden', 'false');
					$items[0].focus();
				}
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
			updateSortingOptionsSelected: function( SelectorId, SortItem, propertyName ){//Insert or remove to the array, the Sorting function clicked by the user

				var sortingFunction;

				if ( SortItem.hasOwnProperty('sortFn') && SortItem.sortFn !== undefined ) {
					sortingFunction = SortItem.sortFn;
				} else if ( SortItem.hasOwnProperty('order') ) {
					//Add sorting methods
					sortingFunction = this.addDefaultSortingFunction( SortItem, propertyName );
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
			addDefaultSortingFunction: function( SortItem, propertyName ){

				var ascendingOrDescendigSortFunction;

				if ( SortItem.order.toUpperCase() === "ASC" ) {

					ascendingOrDescendigSortFunction = function( ItemsToSort ) {
						ItemsToSort.sort( function( a, b ) {
							var propertyItemA = a[propertyName];
							var propertyItemB = b[propertyName];
							return propertyItemA.localeCompare( propertyItemB );
						} );

						return ItemsToSort;
					};
				}

				if ( SortItem.order.toUpperCase() === "DESC" ) {

					ascendingOrDescendigSortFunction = function( ItemsToSort ) {
						ItemsToSort.sort( function( a, b ) {
							var propertyItemA = a[propertyName];
							var propertyItemB = b[propertyName];
							return propertyItemB.localeCompare( propertyItemA );
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
					$( $cards[i] ).removeClass('js-b22-item--visible');
				}

			},
			hideGroupHeaders: function(){
				var els = this.elements;
				els.$cards.groupHeaders.each(function(){
					var $header = $(this);
					$header.hide();
				});
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
							if ( ! $( $cards[i] ).hasClass('js-b22-item--visible') )
								$( $cards[i] ).addClass('js-b22-item--visible');
						}
					}
				} );
			},
			showAllHeaders: function(){
				var els = this.elements;
				els.$cards.groupHeaders.each(function(){
					var $header = $(this);
					$header.show();
					$header.addClass('js-b22-index-header--visible');
				});
			},
			renderShowResults: function( numberResults ) {
				var els = this.elements;
				var resultsParagraph = els.resultsNumber;
				//var filterShowing = OHIO.Utils.actions.getMultilingualLabelByWCMKey('odx-filter-showing');
				//var results = OHIO.Utils.actions.getMultilingualLabelByWCMKey('odx-results');

				//resultsParagraph.text('We found ' + numberResults + ' ' + results);
				resultsParagraph.text('We found ' + numberResults + ' ' + 'results');
				this.focusResults();
			},
			setListenerForDropdown: function( idFilter, taxonomy ){
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

					var hashParam = _this.getHashParameters();
					hashParam[ taxonomy ] = categoriesSelectedFromDropdown.join( ',' );
					_this.setHashParameters( hashParam );

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
					_this.focusResults();
				});
			},
			setListenerForSorting: function( sortingSelector, propertyName, SortObject ){

				var _this = this;
				var SortedItems = [];
				var FilteredItems = [];
				var SortObj = SortObject;

				$( sortingSelector ).on( "click", function(){
					_this.updateSortingOptionsSelected( sortingSelector, SortObj, propertyName );//Update sort function for filtering global variable
					var sortAllItems = true; //To render all and not just those from last filtered applied
					SortedItems = MultipleFiltersDataLogic.sortAction( _this.SortingClicked, sortAllItems );

					var filteredWasApplied = _this.FiltersClicked.length > 0;

					var deferred = $.Deferred();
					_this.renderCards( SortedItems, deferred ).done( function(){

						var uuidsToMap = [];

						if ( filteredWasApplied ) {
							FilteredItems = MultipleFiltersDataLogic.filterAction( _this.FiltersClicked );
							uuidsToMap = FilteredItems.map( function( el ) {
								return el.uuid;
							} );

							var numberOfResults = uuidsToMap.length;
							_this.showCards( uuidsToMap );
							_this.renderShowResults( numberOfResults );
							//_this.setPagination();

						}

					} );

					//_this.renderShowResults( numberOfResults );
					//_this.renderCards( FilteredItems );

				} );

			},
			setListenerForInput: function(){
				var _this = this;

				var els = this.elements;
				var searchButton = els.searchButton;
				var input = els.input;

				input.on('keypress', function( event ){
					var keyCode = event.which;
					if (keyCode == 13) {
						searchButton.trigger('click');
					}
				});

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
			setListenerForDateFilter: function( EventFilter ){
				var _this = this;

				var els = this.elements;
				var searchButton = els.searchButton;
				var input = els.input;

				var startTimeSelector = EventFilter.startTimeSelector;
				var endTimeSelector = EventFilter.endTimeSelector;

				searchButton.on('click', function(){
					var keyword = input.val();
					keyword.trim().toLowerCase();

					var startTimeInput = $( startTimeSelector + ' .flatpickr-input' ).val();
					var endTimeInput = $( endTimeSelector + ' .flatpickr-input' ).val();

					if ( startTimeInput != '') {
						startTimeInput = new Date ( startTimeInput ) || '';
					} else {
						startTimeInput = '';
					}
					if ( endTimeInput != '') {
						endTimeInput = new Date ( endTimeInput ) || '';
					} else {
						endTimeInput = '';
					}

					var hasAnyFilterBeingApplied = _this.FiltersClicked.length;

					var FilteredItems = [];

					if ( startTimeInput != '' && endTimeInput != '' ) {
						if ( hasAnyFilterBeingApplied === 0 ) {
							var noFiltersApplied = true;
							FilteredItems = MultipleFiltersDataLogic.filterByDate( startTimeInput, endTimeInput, noFiltersApplied );
						} else {
							FilteredItems = MultipleFiltersDataLogic.filterByDate( startTimeInput, endTimeInput );
						}
					} else {
						if ( hasAnyFilterBeingApplied === 0 ) {
							var noFiltersApplied = true;
							FilteredItems = MultipleFiltersDataLogic.filterByKeyword( keyword, _this.Filters, noFiltersApplied );
						} else {
							FilteredItems = MultipleFiltersDataLogic.filterByKeyword( keyword, _this.Filters );
						}
					}

					var uuidsToMap = FilteredItems.map( function( el ) {
						return el.uuid;
					} );

					var numberOfResults = uuidsToMap.length;

					//var hashParam = _this.getHashParameters();
					//hashParam[ startTime ] = startTimeInput;
					//hashParam[ endTime ] = endTimeInput;
					//_this.setHashParameters( hashParam );

					_this.renderShowResults( numberOfResults );
					_this.showCards( uuidsToMap );
					_this.setPagination();

				});
			},
			setListenerCustom: function( id, eventName, filterFn, urlParam ){
				var _this = this;
				$( id ).on( eventName, function( event ) {
					//event.preventDefault();
					console.log("Click custom");
					var FilteredItems;

					FilteredItems = MultipleFiltersDataLogic.filterCustom( filterFn );

					var uuidsToMap = FilteredItems.map( function( el ) {
						return el.uuid;
					} );

					var numberOfResults = uuidsToMap.length;

					var deferred = $.Deferred();
					_this.renderCards( FilteredItems, deferred ).done( function() {
						_this.renderShowResults( numberOfResults );
						//_this.setPagination();
					} );

					//_this.renderShowResults( numberOfResults );
					//_this.showCards( uuidsToMap );
					//_this.setPagination();
					var hashParam = _this.getHashParameters();
					hashParam[ urlParam ] = 'value X';
					_this.setHashParameters( hashParam );

				} );
			},
			setListenerCollapseFiltersWhenMobile: function(){

				var els = this.elements;
				var $collapseButton = els.$collapseButton;
				var $containerFiltersFirstSection = els.$collapsibleFirstSectionFiltersMobile;
				var $containerFiltersSecondSection = els.$collapsibleSecondSectionFiltersMobile;

				$collapseButton.on('click', function( event ){
					var $iconArrow = $collapseButton.find('i');
					if ( $containerFiltersFirstSection.css('display') !== 'none' ) {
						//If visible then Hide
						$iconArrow.toggleClass('fa-chevron-up');
						$iconArrow.toggleClass('fa-chevron-down');
						$containerFiltersFirstSection.hide();
						$containerFiltersSecondSection.hide();
					} else {
						//If hidden then show
						$iconArrow.toggleClass('fa-chevron-down');
						$iconArrow.toggleClass('fa-chevron-up');
						$containerFiltersFirstSection.show();
						$containerFiltersSecondSection.show();
					}
				});

			},
			focusResults: function(){
				var els = this.elements;

				var $resultsParagraph = els.resultsNumber;
				$resultsParagraph.attr('tabindex','0');
				$resultsParagraph.focus();
			},
			removeActiveIndexes: function(){
				var els = this.elements;

				var alphadirectoryContainer = els.$filterByAlphaindex.letters;
				var letters = alphadirectoryContainer.find('li');

				letters.each(function() {
					var letter = $(this);
					var activeIndex = letter.find('span');
					activeIndex.removeClass('js-b22-filter-index--active');
				});
			},
			setIndexFilterActions: function( propertyName ){
				var els = this.elements;
				var directory = els.$filterByAlphaindex.letters;
				var indexOfFoundItems;

				var _this = this;

				directory.on('click', function( event ) {
					event.preventDefault();
					var target = event.target;
					var parentTarget = target.parentElement;
					if ( target.localName === "span" && parentTarget.classList.contains( 'js-b22-alphabet-char' ))
						target.classList.add('js-b22-filter-index--active');
					var letter = parentTarget.getAttribute('data-target');

					var wasTheLetterSelectedBefore = _this.multipleLettersClicked.indexOf(letter);
					if ( wasTheLetterSelectedBefore >= 0 ) {
						_this.multipleLettersClicked.splice( wasTheLetterSelectedBefore, 1);
						target.classList.remove('js-b22-filter-index--active');
					} else {
						if (letter!== null) {
							_this.multipleLettersClicked.push(letter);
						} else {
							if ( parentTarget.classList.contains('js-b22-alphabet-button-all') )
								_this.resetAll();
						}
					}

					if( _this.multipleLettersClicked.length > 0 ) {
						//Hide all the cards
						_this.hideAllCards();
						//Hide headers
						_this.hideGroupHeaders();
						//Show group headers that matches the cards group
						els.$cards.groupHeaders.each(function() {
							var $header = $(this);
							_this.multipleLettersClicked.forEach(function( el, index ) {
								if( $header.attr('data-index') === el ) {
									$header.show();
									$header.addClass('js-b22-index-header--visible');
								}
							});

						});

						var selectedLettersOrdered = _this.multipleLettersClicked.sort();
						indexOfFoundItems = MultipleFiltersDataLogic.filterByAlphaIndex(selectedLettersOrdered, propertyName);
						//Show cards matches the filter
						/*indexOfFoundItems.forEach(function( idx ){
							els.$cards.items[idx].classList.add('js-b22-item--visible');
							$(els.$cards.items[idx]).show();
							var numberResults = indexOfFoundItems.length;
							_this.renderShowResults( numberResults );
						});
						 */
						_this.showCards( indexOfFoundItems );
						var numberResults = indexOfFoundItems.length;
						_this.renderShowResults( numberResults );
						_this.setPagination();
					} else {
						_this.multipleLettersClicked.splice(0);
						_this.resetAll();
					}
				});
			},
			getHashParameters: function(){
				var hash = window.location.href.split( "#" );
				hash = hash[ 1 ] ? hash[ 1 ] : "";
				var hashParameters = '';
				hashParameters = hash.split( '&' ).reduce( function( hashParameters, item ) {
					var parts = item.split( '=' );
					hashParameters[ parts[ 0 ] ] = decodeURI( parts[ 1 ] );
					return hashParameters;
				}, {} );
				return hashParameters;
			},
			setHashParameters: function( params ){
				params = params || {};
				params.page = params.page || 1;
				var stringParameters = [];

				var $charsActive = $( '.js-resources-alphabet-list li.isActive' );
				var charActiveArray = '';

				$charsActive.each( function() {
					charActiveArray += $( this ).attr( 'id' ) + '_';
				} );

				params.alpha = charActiveArray;

				for( var param in params ) {
					if( ! params.hasOwnProperty( param ) ) continue;
					if( param && params[ param ] ) stringParameters.push( param + "=" + params[ param ] );
				}

				stringParameters = stringParameters.length > 0 ? '#' + stringParameters.join( "&" ) : "";

				window.location.href = window.location.href.split( '#' )[ 0 ] + stringParameters;
			},
			addingAriaLabels: function(){
				$(".select2-search__field").attr("aria-label", function () {
					return $(this).closest("article").attr("id")
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

				// If alphabetic list filter is set then do this reset:
				if (this.FilterInitialSettings.alpha) {
					this.multipleLettersClicked.splice(0);
					this.removeActiveIndexes();
					this.showAllHeaders();
				}
				//End if

				var uuidsToMap = FilteredItems.map( function( el ) {
					return el.uuid;
				} );

				//To render all cards and not just the few results from last sorting
				if ( uuidsToMap.length === this.totalResources ) {
					var deferred = $.Deferred();
					this.renderCards( FilteredItems, deferred ).done( function(  ) {
						allResultsNumber = _this.totalResources;

						_this.renderShowResults( allResultsNumber );
						//_this.setPagination();
					} );
				}

				this.setHashParameters( {} );

			},
			buildFieldsForEventPicker: function( EventFilter ){
				if ( EventFilter.hasOwnProperty('id') && EventFilter.id !== undefined ) {
					var id = EventFilter.id.substr(0,1) === '#' ? EventFilter.id.substr(1) : EventFilter.id;
					this.getForm( EventFilter.formName, id );
				} else {
					this.getForm( EventFilter.formName, "calendar-field" );
				}
			},
			getForm: function( formName, container ){
				// 1) Render the instance of Formio

				var formURL = global.formioBaseURL + '/' + global.formioProject + '/' + formName;

				try {
					FormioInstance.createForm(document.getElementById(container), formURL, {
						hooks: {
							beforeSubmit: function(submission, next) {
								// Alter the submission
								// Only call next when we are ready to submit
								console.log(submission.data);
								next();
								console.log('Current State: Before Summit');
							}
						}
					}).then(function(form) {
						// Adding required structure to wrap the email validation control
						form.nosubmit = true;

						form.on('submit', function(submission) {
							console.log('Current State:  Sbmitted!');
							//console.log(submission.data);
						});
					});
				} catch( e ) {
					console.error( "ID for event picker was not found in the template or div" );
					console.error( e );
				}
			},
			renderComponent: function( deferredStart ){
				var _this = this;

				var mappingFunction;

				if ( this.FilterInitialSettings.hasOwnProperty('itemsMapping') && typeof this.FilterInitialSettings.itemsMapping === "function" ) {
					mappingFunction = this.FilterInitialSettings.itemsMapping;
				}

				var EventFilter = _this.FilterInitialSettings.events;
				var sortByDate = false;

				if ( EventFilter ) {
					sortByDate = true;
				}

				var AlphabeticalFilter = _this.FilterInitialSettings.alpha;

				var alphabet = undefined;

				if ( AlphabeticalFilter ) {
					alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
				}

				MultipleFiltersDataLogic.getContentPiecesData( mappingFunction, sortByDate, AlphabeticalFilter ).then( function( response ){
					console.log("The data: ", response );

					var Filters = _this.FilterInitialSettings.filters;
					var container = _this.WidgetSettings.root;
					var template = _this.WidgetSettings.template;
					var Sorting = _this.FilterInitialSettings.sorting;
					var CustomFilters = _this.FilterInitialSettings.customFilter;

					var Labels = _this.WidgetSettings.Labels;
					if (Labels === undefined) {
						Labels = {};
						Labels.filterTitleFirstSection = undefined;
						Labels.filterButton = undefined;
						Labels.inputPlaceholder = undefined;
						Labels.filterTitleSecondSection = undefined;
						Labels.allTypeIndexButton = undefined;
						Labels.resetFiltersButton = undefined;
					}

					_this.Filters = _this.addPropertiesToFiltersForTemplate( Filters );
					_this.totalResources = response.length;

					if ( Sorting ) {
						for( var i=0; i<Sorting.length; i++ ) {
							if ( Sorting[i].id.substr(0,1) === '#' ) {
								Sorting[i].id = Sorting[i].id.substr(1);
							}
						}
					}

					var FiltersComponent = new OhioToolkitWebComponent({
						element: container, //'#id-container',
						templateLocation: template,
						data: {
							Filters: _this.Filters,
							sorting: Sorting,
							eventFilter: EventFilter,
							alphabeticalList: alphabet,
							CustomFilter: CustomFilters,
							filterTitleFirstSection: Labels.filterTitleFirstSection,
							filterButton: Labels.filterButton,
							inputPlaceholder: Labels.inputPlaceholder,
							filterTitleSecondSection: Labels.filterTitleSecondSection,
							allTypeIndexButton: Labels.allTypeIndexButton,
							resetFiltersButton: Labels.resetFiltersButton
						}
					});


					FiltersComponent.render().then(function() {
						console.log('Filters Rendered!');

						_this.Filters.forEach( function( Filter ) {
							var categorySelector = Filter.id;
							var taxonomy = Filter.propertyName;
							_this.setListenerForDropdown( categorySelector, taxonomy );
						} );

						//validate if defined
						if ( Sorting  ) {
							Sorting.forEach( function( SortObject ) {
								var sortSelector = SortObject.id.substr(0,1) === '#' ? SortObject.id : "#" + SortObject.id;
								var propertyName = SortObject.propertyName;
								_this.setListenerForSorting( sortSelector, propertyName, SortObject );
							} );
						}

						if ( CustomFilters ) {
							CustomFilters.forEach( function( CstmFilter ) {
								_this.setListenerCustom( CstmFilter.id, CstmFilter.eventName, CstmFilter.filterFn, CstmFilter.urlParam );
							} );
						}

						if ( EventFilter ) {//To render the events input at same time filters template do
							_this.buildFieldsForEventPicker( EventFilter );
						}

						var deferred = $.Deferred();
						_this.renderCards( response, deferred ).done( function() {
							//_this.setElements();
							if ( EventFilter ) {//To add listener to events input once elements are rendered
								_this.setListenerForDateFilter( EventFilter );
							} else {
								_this.setListenerForInput();
							}

							if ( AlphabeticalFilter ) {
								var propertyName = AlphabeticalFilter.propertyName;
								_this.setIndexFilterActions( propertyName );
							}

							_this.setResetActions();
							//_this.setPagination();

							if (deferredStart)
								deferredStart.resolve();

						} );

						_this.addingAriaLabels();

					});

					//_this.renderCards( response );

				});

				if (deferredStart)
					return deferredStart.promise();
				return deferredStart;
			},
			renderCards: function( response, deferred ){
				var _this = this;
				var templateItems = _this.WidgetSettings.templateItems;
				var imageNoResults = _this.WidgetSettings.imageNoResults;
				var idTemplateItems = _this.WidgetSettings.idTemplateItems;
				var noResultsText = _this.WidgetSettings.Labels;

				var CardsComponent = new OhioToolkitWebComponent({
					element: idTemplateItems,
					templateLocation: templateItems,
					data: {
						items: response,
						noResultsImgPath: imageNoResults,
						noResultsText: noResultsText
					}
				});

				CardsComponent.render().then( function() {
					console.log("Cards rendered");

					_this.setElements();
					_this.setListenerCollapseFiltersWhenMobile();
					_this.setPagination();
					_this.removeAriaAttributesFromItemsDisplayed();
					if (deferred)
						deferred.resolve();
				} );

				if (deferred)
					return deferred.promise();
				return deferred;
			},
			start: function( Filters, WidgetSettings ) {
				this.FilterInitialSettings = Filters;
				this.WidgetSettings = WidgetSettings;
				var deferred = $.Deferred();
				return this.renderComponent( deferred ).done(function( response ) {
					console.log("Hi", response);
					var promiseDef = $.Deferred();
					deferred.resolve();
					return deferred.promise();
				});
			}
		};

		return Instance;
	};

})();