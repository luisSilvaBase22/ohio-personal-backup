var AcccessibilityCommonQuestions = {
	$elements: {
		$root: undefined,
		$tabsContainer: {
			$root: undefined,
			$tabs: undefined
		},
		$cards: {
			$root: undefined,
			$sections: undefined
		},
		$cardAnswer: {
			$container: undefined,
			$title: undefined,
			$close: undefined,
			$description: undefined
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
		this.$elements.$cards.$root = _el.$root.querySelector('.row section.iop-faqs-tabs__cards-box');
		this.$elements.$cards.$sections = _el.$cards.$root.querySelectorAll('.iop-faqs-tabs__cards-faqs .row.iop-faqs-tabs__cards-container');
		this.$elements.$otherQuestions.$root = _el.$cards.$root.querySelector('.iop-faqs-tabs__card-question-link');
		this.$elements.$otherQuestions.$link = this.$elements.$otherQuestions.$root.querySelector('a');
		this.$elements.$cardAnswer.$container = this.$elements.$root.querySelector('.iop-faqs-tabs__card-answer');
		this.$elements.$cardAnswer.$title = this.$elements.$cardAnswer.$container.querySelector('.iop-faqs-tabs__card-answer-title');
		this.$elements.$cardAnswer.$description = this.$elements.$cardAnswer.$container.querySelector('.iop-faqs-tabs__card-answer-body');
		this.$elements.$cardAnswer.$close = this.$elements.$cardAnswer.$container.querySelector('.iop-faqs-tabs__card-answer-close button');
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
		var _$sections = this.$elements.$cards.$sections;

		for ( var i = 0; i < _$sections.length; i++ ) {
			if ( _$sections[i].id === dataId ) {
				this.focusFirstQuestionInActiveSection( _$sections[i] );
				break;
			}
		}
	},
	focusFirstQuestionInActiveSection: function( $wrapperSection ){
		var _this = this;
		var _$itemsInCurrentSection = $wrapperSection.querySelectorAll('.iop-faqs-tabs__card-item');
		_$itemsInCurrentSection.forEach( function( item ) {
			item.setAttribute('aria-hidden', 'false');
			item.addEventListener('click', function( event ) {
				event.currentTarget.classList.add('active');
			});

		} );

		if ( _$itemsInCurrentSection.length > 0 )
			_$itemsInCurrentSection[0].focus();
	},
	focusOpenedQuestion: function(){
		var el = this.$elements;
		var $title = el.$cardAnswer.$title;
		var $answer = el.$cardAnswer.$description;
		$title.setAttribute('aria-hidden', 'false');
		$title.setAttribute('tabindex', '0');

		$answer.setAttribute('aria-hidden', 'false');
		$answer.setAttribute('tabindex', '0');

		this.addEventOnLeaveAnswer();

		$title.focus();
		//Force screen reader to follow this workflow: title -> description -> close
		$title.addEventListener('focusout', function() {
			$answer.focus();
		});
	},
	addEventOnLeaveAnswer: function(){
		var el = this.$elements;
		var $answer = el.$cardAnswer.$description;
		var $closeButton = el.$cardAnswer.$close;
		$answer.addEventListener('focusout', function( event ) {
			$closeButton.focus();
		})
	},
	focusRightQuestionAfterCloseAnswer: function( $wrapperActiveSection ){
		var el = this.$elements;
		var $title = el.$cardAnswer.$title;
		var $answer = el.$cardAnswer.$description;

		var $activeQuestion = $wrapperActiveSection.querySelector('.iop-faqs-tabs__card-item.active');
		if ( $activeQuestion !== null ) {
			$activeQuestion.classList.remove('active');

			$title.removeAttribute('aria-hidden');
			$title.removeAttribute('tabindex');

			$answer.removeAttribute('aria-hidden');
			$answer.removeAttribute('tabindex');

			var $rightQuestion = $activeQuestion.nextElementSibling;
			if ($rightQuestion !== null) {
				$rightQuestion.focus();
			} else {
				this.getActiveTab();
			}
		}

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
