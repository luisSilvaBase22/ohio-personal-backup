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
					el.index = indexAlphabet;
					if ( Utils.isPair(index) )
						el.pairItem = true;
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
				var titlesIndexes = [];
				titlesIndexes = this.Counties.map(function( Item, index ){
					var title = Item.name.toLowerCase();
					if (title.indexOf(keyword)>=0)
						return index;
				}).filter(function( Item ){
					return Item !== undefined;
				});
				return titlesIndexes;
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
		var AlphadirectoryData = AlphadirectoryLocationsData();
		var $emptyDiv = document.createElement( 'div' );
		var elementsPerPage = 3;
		var multipleLettersClicked = [];

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
					allTypeButton: $filterByName.find('.js-opd-alphabet-button-all'),
					letters: $filterByAlphaindex.find('.js-opd-indexes')
				};

				els.resultsNumber = els.$root.find('.iop-filter__results-number');
				els.resetButton = els.$root.find('.iop-filter__reset-btn');

				var $cards = els.$root.find('#iop-filter-cards-container');
				els.$cards = {
					root: $cards,
					headerIndexes: $cards.find('.ohio-card-content-header'),
					groupHeaders: $cards.find('.ohio-odx-alpha-directory__group-title'),
					items: $cards.find('.iop-filter__item')
				};

				els.pagination = els.$root.find('.odx-topic-hub-filter__pagination');
				els.anchorPagination = els.$root.find('#js-events-search-pagination--gov a');
				els.visibleItems = $cards.find('.iop-filter__item--visible');
				els.visibleGroupHeaders = $cards.find('.ohio-odx-alpha-directory__group-title--visible');
				els.noResultsImage = els.$root.find('.odx-events__img-no-results');

			},
			hideCards: function(){
				var els = this.elements;
				els.$cards.items.each(function(){
					var $item = $(this);
					$item.removeClass('iop-filter__item--visible');
					$item.hide();
				});
			},
			hideGroupHeaders: function(){
				var els = this.elements;
				els.$cards.groupHeaders.each(function(){
					var $header = $(this);
					$header.hide();
				});
			},
			showAllCards: function(){
				var els = this.elements;
				els.$cards.items.each(function(){
					var $item = $(this);
					$item.addClass('iop-filter__item--visible');
					$item.show();
				});
			},
			showAllHeaders: function(){
				var els = this.elements;
				els.$cards.groupHeaders.each(function(){
					var $header = $(this);
					$header.show();
					$header.addClass('ohio-odx-alpha-directory__group-title--visible');
				});
			},
			removeActiveIndexes: function(){
				var els = this.elements;

				var alphadirectoryContainer = els.$filterByAlphaindex.letters;
				var letters = alphadirectoryContainer.find('li');

				letters.each(function() {
					var letter = $(this);
					var activeIndex = letter.find('span');
					activeIndex.removeClass('opd-index--active');
				});
			},
			setPagination: function(){
				var _this = this;
				var els = this.elements;

				var $allItems = els.$cards.items;
				var $allHeaders = els.$cards.groupHeaders;
				var $visibleItems = els.visibleItems;
				var $visibleHeaders = els.visibleGroupHeaders;
				var visibleItemsNumber = $visibleItems.length;

				var $pagination = els.pagination;

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
						_this.paginateResults(page, elementsPerPage);
					}
				});
				var $anchorPagination = els.anchorPagination;
				$anchorPagination.attr('aria-label', 'resources-search-pagination');
				$anchorPagination.attr('href', '#top');
			},
			paginateResults: function(page, elementsPerPage) {
				var els = this.elements;
				var cardsContainer = els.$cards.root;
				var visibleItems = els.visibleItems;
				var headers = els.visibleGroupHeaders;

				visibleItems.hide();
				headers.hide();

				//Show card per page number assigned
				var itemInPage = cardsContainer.find('.iop-filter__item--visible[data-page="'+page+'"]');
				itemInPage.show();

				//Show index header per page number assigned
				var headerInPage = cardsContainer.find('.ohio-odx-alpha-directory__group-title--visible[data-page="' + page + '"]');
				headerInPage.show();
			},
			setInputFilterActions: function(){
				//On click filter button, get the string
				var els = this.elements;
				var inputBox = els.$filterByName;

				var indexOfFoundItems;
				var _this = this;

				inputBox.button.on('click', function(){

					var queryString = inputBox.input.val();

					//Hide all the cards
					_this.hideCards();
					//Hide headers
					_this.hideGroupHeaders();

					var firstChar;
					indexOfFoundItems = AlphadirectoryData.filterByTitle( queryString );
					indexOfFoundItems.forEach(function( idx ){

						//Show group headers that matches the cards group
						var titleHeader = $(els.$cards.headerIndexes[idx]).text();
						firstChar = titleHeader.toLowerCase().substring(0,1);
						els.$cards.groupHeaders.each(function(){
							var $header = $(this);

							if ($header.attr('data-index') === firstChar ) {
								$header.show();
								$header.addClass('ohio-odx-alpha-directory__group-title--visible');
							}
						});

						//Show cards matches the filter
						els.$cards.items[idx].classList.add('iop-filter__item--visible');
						$(els.$cards.items[idx]).show();
						var numberResults = indexOfFoundItems.length;
						_this.renderShowResults( numberResults );

					});

				});

			},
			setIndexFilterActions: function(){
				var els = this.elements;
				var directory = els.$filterByAlphaindex.letters;
				var indexOfFoundItems;

				var _this = this;

				directory.on('click', function( event ) {
					event.preventDefault();
					var target = event.target;
					var parentTarget = target.parentElement;
					if ( target.localName === "span" && parentTarget.classList.contains( 'ohio-odx-alpha-directory__alphabet-char' ))
						target.classList.add('opd-index--active');
					var letter = parentTarget.getAttribute('data-target');

					var wasTheLetterSelectedBefore = multipleLettersClicked.indexOf(letter);
					if ( wasTheLetterSelectedBefore >= 0 ) {
						multipleLettersClicked.splice( wasTheLetterSelectedBefore, 1);
						target.classList.remove('opd-index--active');
					} else {
						if (letter!== null)
							multipleLettersClicked.push(letter);
					}

					if( multipleLettersClicked.length > 0 ) {
						//Hide all the cards
						_this.hideCards();
						//Hide headers
						_this.hideGroupHeaders();
						//Show group headers that matches the cards group
						els.$cards.groupHeaders.each(function() {
							var $header = $(this);
							multipleLettersClicked.forEach(function( el, index ) {
								if( $header.attr('data-index') === el ) {
									$header.show();
									$header.addClass('ohio-odx-alpha-directory__group-title--visible');
								}
							});

						});

						var selectedLettersOrdered = multipleLettersClicked.sort();
						indexOfFoundItems = AlphadirectoryData.filterByAlphaIndex(selectedLettersOrdered);
						//Show cards matches the filter
						indexOfFoundItems.forEach(function( idx ){
							els.$cards.items[idx].classList.add('iop-filter__item--visible');
							$(els.$cards.items[idx]).show();
							var numberResults = indexOfFoundItems.length;
							_this.renderShowResults( numberResults );
						});
					} else {
						multipleLettersClicked.splice(0);
						//Show all the cards
						_this.showAllCards();

						//Show headers
						_this.showAllHeaders();
					}
				});
			},
			setResetActions: function(){
				var els = this.elements;
				var resetButton = els.resetButton;
				var allTypesButton = els.$filterByAlphaindex.allTypeButton;

				var allResultsNumber;
				var inputBox = els.$filterByName;

				var _this = this;

				resetButton.on('click', function(){
					//Show all the cards
					_this.showAllCards();

					//Show headers
					_this.showAllHeaders();

					allResultsNumber = AlphadirectoryData.Counties.length;
					inputBox.input.value = '';

					multipleLettersClicked.splice(0);
					_this.removeActiveIndexes();
					_this.renderShowResults( allResultsNumber );
					_this.setPagination();
				});

				allTypesButton.on('click', function(){
					//Show all the cards
					_this.showAllCards();

					//Show headers
					_this.showAllHeaders();

					allResultsNumber = AlphadirectoryData.Counties.length;
					inputBox.input.value = '';

					multipleLettersClicked.splice(0);
					_this.removeActiveIndexes();
					_this.renderShowResults( allResultsNumber );
					_this.setPagination();
				});

			},
			renderShowResults: function( numberResults ) {
				var els = this.elements;
				var resultsParagraph = els.resultsNumber;
				//var filterShowing = OHIO.Utils.actions.getMultilingualLabelByWCMKey('odx-filter-showing');
				var results = OHIO.Utils.actions.getMultilingualLabelByWCMKey('odx-results');

				resultsParagraph.text('We found ' + numberResults + ' ' + results);
			},
			renderComponent: function(){
				var _this = this;
				Handlebars.registerHelper('lowercase', function (str) {
					if(str && typeof str === "string") {
						return str.toLowerCase();
					}
					return '';
				});
				AlphadirectoryData.getCountiesData().then(function( response ){
					console.log("These are the Counties:", response);

					var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
					var component = new OhioToolkit.components.WebComponent({
						element: '#opd-filter',
						templateLocation:
							'[Element key="templateFile" type="content" context="selected" name="ohio design/component-templates/agencies/odh/odh-locations-contact-cards-filter.hbs.html"]',
						data: {
							items: response,
							noResultsImgPath: '[Component name="ohio design/agencies/odh/no-results.png" rendition="auto" format="url"]',
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
					component.render().then(function(){
						console.log('Rendered!');
						if (!jQuery.fn.select2) {
							return;
						}
						_this.setElements();
						_this.setInputFilterActions();
						_this.setIndexFilterActions();
						_this.setResetActions();
						_this.setPagination();
					});
				});
			},
			start: function(){
				this.renderComponent();
			}
		};

		return Instance;
	};
})();