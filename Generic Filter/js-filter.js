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
			sortAction: function( Sorting, noFiltersApplied ){

				var _this = this;

				//no filter, just do sorting
				if ( noFiltersApplied && noFiltersApplied === true ) {
					var SortedItems = [];

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

					console.log( "Results sorted: ", this.FilteredItems );
					return this.FilteredItems;
				}

				//If Filters, then do filters and sort

				var UnsortedItems = this.FilteredItems.slice();

				Sorting.forEach( function( SortObj ) {
					SortedItems = SortObj.sortInst( UnsortedItems );
					UnsortedItems = SortedItems;
				} );

				if ( SortedItems !== undefined )
					this.FilteredItems =  SortedItems.slice();

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
			getContentPiecesData: function( itemsMapping ){
				var _this = this;
				var serviceURL = Utils.configureAjaxParameters();
				return OHIO.ODX.actions.getAjaxDataFromURL(serviceURL).then(function( response ){
					var resources = JSON.parse(response);
					var ContentPieces = resources.filter( function( Item, index ){
						Item.uuid = Utils.generatePieceId();
						return Item;
					} );

					if ( itemsMapping ) {
						ContentPieces = itemsMapping( ContentPieces );
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
			FiltersForTemplate: undefined,
			FiltersClicked: [],
			SortingClicked: [],
			uuidsToMap: [],
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
			updateSortingOptionsSelected: function( id, SortItem ){//Inserta o remueve la function de sorting clickead por el usuario

				var sortingFunction;

				if ( SortItem.hasOwnProperty('sortFn') && SortItem.sortFn !== undefined ) {
					sortingFunction = SortItem.sortFn;
				} else if ( SortItem.hasOwnProperty('order') ) {
					//Add sorting methods
					if ( SortItem.order === "ASC" ) {

						sortingFunction = function( ItemsToSort ) {
							ItemsToSort.sort( function( a, b ) {
								var titleA = a.title;
								var titleB = b.title;
								return titleA.localeCompare(titleB);
							} );

							return ItemsToSort;
						};
					}

					if ( SortItem.order === "DESC" ) {

						sortingFunction = function( ItemsToSort ) {
							ItemsToSort.sort( function( a, b ) {
								var titleA = a.title;
								var titleB = b.title;
								return titleB.localeCompare(titleA);
							} );

							return ItemsToSort;
						};
					}
				}

				//Search to include or remove SortingClicked

				if ( this.SortingClicked.length === 0 ) {
					var SortMethod = {
						name: id,
						sortInst: sortingFunction
					};
					this.SortingClicked.push(SortMethod);
				} else {
					for( var i = 0; i < this.SortingClicked.length; i++ ) {
						//If I've found the item then I remove it
						if ( this.SortingClicked[i].name === id ) {
							this.SortingClicked.splice( i, 1 );
							break;
						}

						//If last element and item was not found, then I add it
						if (  this.SortingClicked[i].name !== id && this.SortingClicked.length - 1 === i ) {

							var SortMethod = {
								name: id,
								sortInst: sortingFunction
							};

							this.SortingClicked.push( SortMethod );
						}
					}
				}

				// this.SortingClicked updated no return
			},
			allTypesFilter: function( category ){

				var allOptions;

				for ( var i = 0; i < this.FiltersForTemplate.length; i++ ) {
					if ( this.FiltersForTemplate[i].propertyName === category ) {
						allOptions = this.FiltersForTemplate[i].options;
					}
				}

				if ( allOptions[0] === "all" )
					allOptions.splice(0, 1);

				return allOptions;
			},
			prepareFiltersForTemplate: function( Filters ){
				return  MultipleFiltersDataLogic.prepareFiltersForTemplate( Filters );
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
			showCards: function(){
				var els = this.elements;
				var $cards = els.$cards.items;

				this.hideAllCards();

				//if ( this.uuidsToMap )

				this.uuidsToMap.forEach( function( uuid ) {
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

					var filterAll = false;

					//Fix when removing more than 2 box and input left empty
					if ( categoryArray === null ) {
						categoryArray.push('all');
					}

					for (var i=0; i<categoryArray.length; i++){
						if (categoryArray[i] === "all") {
							filterAll = true;
							break;
						}
					}

					if (filterAll) {
						categoryArray =_this.allTypesFilter( category );
					}

					_this.updateFiltersClicked( category, categoryArray );


					//Return Items completed
					var FilteredItems = MultipleFiltersDataLogic.filterAction( _this.FiltersClicked );
					if ( _this.SortingClicked.length > 0 ) {
						FilteredItems = MultipleFiltersDataLogic.sortAction( _this.SortingClicked );
					}

					_this.uuidsToMap = FilteredItems.map( function( el ) {
						return el.uuid;
					} );

					//To render all cards and not just the few results from last sorting
					if ( _this.uuidsToMap.length === _this.totalResources ) {
						_this.renderCards( FilteredItems );
					}

					var numberOfResults = _this.uuidsToMap.length;

					_this.showCards();
					_this.renderShowResults( numberOfResults );
					_this.setPagination();
				});
			},
			setEventForSorting: function( idSortEl, propertyName, SortObj ){

				var _this = this;

				var id = idSortEl.substr(0,1) === '#' ? idSortEl : "#" + idSortEl;

				var FilteredItems = [];
				var SortObj = SortObj;

				$( id ).on( "click", function(){
					_this.updateSortingOptionsSelected( id, SortObj );//Update sort function for filtering global variable
					var hasAnyFilterBeingApplied = _this.FiltersClicked.length;
					if ( hasAnyFilterBeingApplied === 0 ) {
						var noFiltersApplied = true;
						FilteredItems = MultipleFiltersDataLogic.sortAction( _this.SortingClicked, noFiltersApplied );
					} else {
						FilteredItems = MultipleFiltersDataLogic.filterAction( _this.FiltersClicked );
						FilteredItems = MultipleFiltersDataLogic.sortAction( _this.SortingClicked );
					}

					_this.uuidsToMap = FilteredItems.map( function( el ) {
						return el.uuid;
					} );
					//_this.showCards();
					//_this.setPagination();

					var numberOfResults = _this.uuidsToMap.length;

					_this.renderShowResults( numberOfResults );
					_this.renderCards( FilteredItems );

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
						FilteredItems = MultipleFiltersDataLogic.filterByKeyword( keyword, _this.FiltersForTemplate, noFiltersApplied );
					} else {
						FilteredItems = MultipleFiltersDataLogic.filterByKeyword( keyword, _this.FiltersForTemplate );
					}

					_this.uuidsToMap = FilteredItems.map( function( el ) {
						return el.uuid;
					} );

					var numberOfResults = _this.uuidsToMap.length;

					_this.renderShowResults( numberOfResults );
					_this.showCards();
					_this.setPagination();

				});
			},
			renderComponent: function(){
				var _this = this;

				var itemsMapping;

				if ( this.FilterInitialSettings.hasOwnProperty('itemsMapping') && typeof this.FilterInitialSettings.itemsMapping === "function" ) {
					itemsMapping = this.FilterInitialSettings.itemsMapping;
				}

				MultipleFiltersDataLogic.getContentPiecesData( itemsMapping ).then( function( response ){
					console.log("The data: ", response );
					var Filters = _this.FilterInitialSettings.filters;
					_this.totalResources = response.length;
					_this.FiltersForTemplate = _this.prepareFiltersForTemplate( Filters );

					var sorting = _this.FilterInitialSettings.sorting;

					if ( sorting ) {
						for( var i=0; i<sorting.length; i++ ) {
							if ( sorting[i].id.substr(0,1) === '#' ) {
								sorting[i].id = sorting[i].id.substr(1);
							}
						}
					}

					var wrapper = _this.WidgetSettings.root;
					var template = _this.WidgetSettings.template;

					var WebComponent = new OhioToolkitWebComponent({
						element: wrapper, //'#id-container',
						templateLocation: template,
						data: {
							Filters: _this.FiltersForTemplate,
							sorting: sorting
						}
					});

					WebComponent.render().then(function() {
						console.log('Filters Rendered!');

						_this.FiltersForTemplate.forEach( function( Filter ) {
							_this.setEventForDropdown( Filter.id, Filter.propertyName );
						} );

						//validate if defined
						if ( _this.FilterInitialSettings.hasOwnProperty('sorting')  ) {
							_this.FilterInitialSettings.sorting.forEach( function( Sort ) {
								_this.setEventForSorting( Sort.id, Sort.propertyName, Sort );
							} );
						}
						_this.renderCards( response );

					});

					//_this.renderCards( response );

				});
			},
			renderCards: function( response ){
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
					_this.setPagination();
				} );
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