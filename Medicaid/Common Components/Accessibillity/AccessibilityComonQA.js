var AcccessibilityCommonQuestions = {
	$elements: {
		$root: undefined,
		$tabsContainer: {
			$root: undefined,
			$tabs: undefined
		},
		$cardsContainer: {
			$root: undefined,
			$sections: undefined
		},
		$otherQuestions: {
			$root: undefined,
			$link: undefined
		}
	},
	setElements: function( containerId ){
		var _el = this.$elements;
		this.$elements.$root = document.querySelector( '#' + containerId );

		this.$elements.$tabsContainer.$root = _el.$root.querySelector( '.row.' + containerId );
		this.$elements.$tabsContainer.$tabs = _el.$tabsContainer.$root.querySelectorAll('button[data-tab]');
		this.$elements.$cardsContainer.$root = _el.$root.querySelector('.row section.iop-faqs-tabs__cards-box');
		this.$elements.$cardsContainer.$sections = _el.$cardsContainer.$root.querySelectorAll('.iop-faqs-tabs__cards-faqs .row.iop-faqs-tabs__cards-container');
		this.$elements.$otherQuestions.$root = _el.$cardsContainer.$root.querySelector('.iop-faqs-tabs__card-question-link');
		this.$elements.$otherQuestions.$link = this.$elements.$otherQuestions.$root.querySelector('a');
	},
	addListenerTabs: function(){
		var _this = this;
		var _$tabsButtons = this.$elements.$tabsContainer.$tabs;
		var _dataTab;
		
		_$tabsButtons.forEach( function( tab ){
			tab.addEventListener( 'click', function( event ) {
				var currentButtonClicked = event.currentTarget;
				_dataTab = currentButtonClicked.dataset.tab;

				_this.searchActiveSection( _dataTab );
			} );
		} );
	},
	searchActiveSection: function( dataId ){
		var _$sections = this.$elements.$cardsContainer.$sections;

		for ( var i = 0; i < _$sections.length; i++ ) {
			if ( _$sections[i].id === dataId ) {
				this.focusFirstQuestionInActiveSection( _$sections[i] );
				break;
			}
		}
	},
	focusFirstQuestionInActiveSection: function( $wrapperSection ){
		var _$itemsInCurrentSection = $wrapperSection.querySelectorAll('.iop-faqs-tabs__card-item');
		_$itemsInCurrentSection.forEach( function( item ) {
			item.setAttribute('aria-hidden', 'false');
		} );

		if ( _$itemsInCurrentSection.length > 0 )
			_$itemsInCurrentSection[0].focus();
	},
	addListenerOtherQuestions: function(){
		var _this = this;
		var _$otherQuestionsWrapper = this.$elements.$otherQuestions.$root;

		var _template = '<span tabindex="0" class="js-next-tab" style="width: 0"></span>';

		//To avoid creating multiple closure spans
		if ( ! _$otherQuestionsWrapper.lastElementChild.classList.contains('js-next-tab') )
			_$otherQuestionsWrapper.insertAdjacentHTML('beforeend', _template );

		var $nextTabSpan = _$otherQuestionsWrapper.querySelector('.js-next-tab');
		$nextTabSpan.addEventListener('focus', function(  ) {
			_this.getActiveTab();
		});

	},
	getActiveTab: function(){
		var _$tabsButtons = this.$elements.$tabsContainer.$tabs;
		var $rightTab;

		for (var i = 0; i < _$tabsButtons.length; i++) {
			if ( _$tabsButtons[i].classList.contains('active') ) {
				if ( i + 1 < _$tabsButtons.length ) {
					$rightTab = _$tabsButtons[i + 1];
					this.focusNextTabAfterBeingInCommonQuestionsLink( $rightTab );
				}
				break;
			}
		}
	},
	focusNextTabAfterBeingInCommonQuestionsLink: function( $rightTab ){
		$rightTab.focus();
	},
	init: function( containerId ) {
		this.setElements( containerId );
		this.addListenerTabs();
		this.addListenerOtherQuestions();
	}
};
