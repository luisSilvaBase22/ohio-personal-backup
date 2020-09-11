var AccessibillityScriptsForFilter = {
	idFilter: undefined,
	$dropdown: undefined,
	removeEmptyOptionFromDropdown: function(){
		this.$dropdown = document.querySelector('ul.select2-results__options');
		var $options = this.$dropdown.querySelectorAll('li.select2-results__option');
		if ( $options.length > 0 ) {
			if ( $options[1].hasAttribute('role') && $options[1].getAttribute('role') === "treeitem" ) {
				$options[1].remove();
			}
		}
	},
	forceFocusArticle: function(){
		$('.select2-container.select2-container--default').focus();
	},
	forceFocusAfterDropdownSelection: function(){
		var $results = $('.js-b22-results-number');
		$results.focus();
	},
	listenerDropdown: function(){
		var _this = this;

		this.removeEmptyOptionFromDropdown();

		//var $select = $('#js-select-topics');
		var select2Id = this.idFilter;
		var $select = $( select2Id );
		$select.on('select2:select', function( e ) {
			console.log("SELECTED", e);
			//_this.forceFocusAfterDropdownSelection();
			_this.forceFocusArticle();
			$select.select2('close');
		});
		$select.on('change', function( ev ){
			console.log("DO", ev);
			//_this.forceFocusAfterDropdownSelection();
			$select.select2('close');
		});

	},
	watcherDropdown: function(){
		var _this = this;
		var elemToObserve = document.querySelector('span.select2-container--default');
		var prevClassState = elemToObserve.classList.contains('select2-container--below');
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if(mutation.attributeName == "class"){
					var currentClassState = mutation.target.classList.contains('select2-container--open');
					if(prevClassState !== currentClassState)    {
						prevClassState = currentClassState;
						if(currentClassState)
							_this.listenerDropdown();//console.log("class added!");
						else
							console.log("class removed!");
					}
				}
			});
		});

		observer.observe(elemToObserve, {attributes: true});
	},
	start: function( articleId ){
		this.idFilter = articleId;
		//var $filterWrapper = document.querySelector('article' + articleId );

		//$filterWrapper.setAttribute('aria-label', 'Press space key to display dropdown options');

		$('.select2-container.select2-container--default').attr('aria-label', 'Press space key to display dropdown options or tab key twice to go to the number of results');


		var $inputBox = $('.select2.select2-container');
		$inputBox.attr('tabindex', "0");//Input box

		$inputBox.on('focus', function(){
			console.log("Running screen");
			var $dropdown = $('.select2-results__options');

			$dropdown.attr('aria-labelledby', 'topic-sr');

			$dropdown.attr('tabindex', "-1");
		});


		this.watcherDropdown();

		$inputBox.on('keyup', function( eventInput ){
			console.log("Pressed");
			if ( eventInput.which === 32 ) {
				console.log("SPACE");
			}

			//Move input out of the list in order to be found by the Screen Reader
			var $input = '<input class="select2-search__field" type="search" tabindex="0" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" aria-autocomplete="list" style="width: 0.75em;">';

			var $span = $('.select2-search');

			if ( $span.length < 1 ) {
				$('.selection .select2-selection').append( '<span class="select2-search select2-search--inline">' + $input + '</span>' );
			}

			var $listItemAndInput = $('li.select2-search.select2-search--inline');
			$listItemAndInput.remove();


		});
	}
};