var AccessibillityScriptsForFilter = {
	forceFocusAfterDropdownSelection: function(){
		var $results = $('.js-b22-results-number');
		$results.focus();
	},
	listenerDropdown: function(){
		var _this = this;
		console.log("Detecting events for dropdown");
		var $dropdown = document.querySelector('.select2-results__options');
		var $itemsFromDropdown = $('.select2-results__option');

		$dropdown.addEventListener( 'click', function( event ) {
			if ( event.target.classList.contains('select2-results__option') ) {
				console.log("CLICK");
			}
			/*
			if ( event.which == 13 || event.which == 32 ) { enter or space keys
				console.log("FOCUS");
			}
			*/
		} );

		var $select = $('#js-select-topics');
		$select.on('select2:select', function( e ) {
			console.log("SELECTED", e);
			_this.forceFocusAfterDropdownSelection();
			$select.select2('close');
		});
		$select.on('change', function( ev ){
			console.log("DO", ev);
			_this.forceFocusAfterDropdownSelection();
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
		var $filterWrapper = document.querySelector('article' + articleId );

		$filterWrapper.setAttribute('aria-label', 'Press space key to display dropdown options');


		var $inputBox = $('.select2.select2-container');
		$inputBox.attr('tabindex', "0");//Input box

		$inputBox.on('focus', function(){
			console.log("Runing screen");
			var $dropdown = $('.select2-results__options');

			$dropdown.attr('aria-labelledby', 'topic-sr');

			$dropdown.attr('tabindex', "-1");
		});

		$inputBox.on('keydown', function(){
			console.log("KEYDOWN");
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