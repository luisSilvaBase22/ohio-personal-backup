var AcccessibilityMegaMenu = {
	$megaMenu: document.querySelector('.b-mega-menu'),
	focusHelp: function(){
		hideAllSectionsAndMegaMenuContainer();

		var $linkHelp = document.querySelector('#js-go-help');
		$linkHelp.focus();
	},
	listenerLastItemFromSubsection: function( selectorSublinks, $currentSection, $nextSection ){
		var _this = this;
		//var $megaMenu = document.querySelector('.b-mega-menu');

		var $subsectionWrapper = this.$megaMenu.querySelector( selectorSublinks );
		var $subsectionLinks = $subsectionWrapper.querySelectorAll( '.b-section__secondary-pages-list a' );
		var $lastLinkFromCurrentSubSection = $subsectionLinks[ $subsectionLinks.length -1 ];

		$lastLinkFromCurrentSubSection.addEventListener('focusout', function(){
			if ( $nextSection ) {
				$nextSection.focus();
				_this.focusMainNavigation();
				hideAllSectionsAndMegaMenuContainer();
				$currentSection.setAttribute('aria-expanded', 'false');
			} else {
				_this.focusHelp();
				hideAllSectionsAndMegaMenuContainer();
				$currentSection.setAttribute('aria-expanded', 'false');
			}
		});
	},
	focusSubsection: function( selectorSection ){
		//var $megaMenu = document.querySelector('.b-mega-menu');

		var $subsectionWrapper = this.$megaMenu.querySelector( selectorSection );
		var $firstLink = $subsectionWrapper.querySelector( '.b-section__title a' );
		$firstLink.focus();
	},
	focusMainNavigation: function(){
		var $headerAnchors = document.querySelector('.awesome-navigator.navList1');
		var $aboutUs = $headerAnchors.querySelector('li:nth-child(2) a');
		var $medicaid = $headerAnchors.querySelector('li:nth-child(3) a');
		var $providers = $headerAnchors.querySelector('li:nth-child(4) a');
		var $individuals = $headerAnchors.querySelector('li:nth-child(5) a');

		$medicaid.focus();
	},
	addAriasToMegaMenu: function( $aboutUs, $medicaid, $providers, $individuals ){
		//var $megaMenu = document.querySelector('.b-mega-menu');

		this.$megaMenu.setAttribute('aria-expanded', 'false');
		this.$megaMenu.setAttribute('aria-hidden', 'false');
		this.$megaMenu.setAttribute('role', 'region');

		$aboutUs.setAttribute('aria-hidden', 'false');
		$aboutUs.setAttribute('aria-label', 'Our Structure section');
		$aboutUs.setAttribute('role', 'button');
		$aboutUs.setAttribute('aria-expanded', 'false');
		$aboutUs.setAttribute('tabindex', '0' );

		$medicaid.setAttribute('aria-hidden', 'false');
		$medicaid.setAttribute('aria-label', 'About Medicaid section');
		$medicaid.setAttribute('role', 'button');
		$medicaid.setAttribute('aria-expanded', 'false');
		$medicaid.setAttribute('tabindex', '0' );

		$providers.setAttribute('aria-hidden', 'false');
		$providers.setAttribute('aria-label', 'Providers section');
		$providers.setAttribute('role', 'button');
		$providers.setAttribute('aria-expanded', 'false');
		$providers.setAttribute('tabindex', '0' );

		$individuals.setAttribute('aria-hidden', 'false');
		$individuals.setAttribute('aria-label', 'Individuals section');
		$individuals.setAttribute('role', 'button');
		$individuals.setAttribute('aria-expanded', 'false');
		$individuals.setAttribute('tabindex', '0' );

	},
	init: function() {
		var $headerAnchors = document.querySelector('.awesome-navigator.navList1');
		var $aboutUs = $headerAnchors.querySelector('li:nth-child(2) a');
		var $medicaid = $headerAnchors.querySelector('li:nth-child(3) a');
		var $providers = $headerAnchors.querySelector('li:nth-child(4) a');
		var $individuals = $headerAnchors.querySelector('li:nth-child(5) a');

		this.addAriasToMegaMenu( $aboutUs, $medicaid, $providers, $individuals );

		var selectorAboutSection = '[data-section = "Our Structure about us" ]';
		var selectorMedicaidSection = '[data-section = "Learn About Medicaid" ]';
		var selectorProvidersSection = '[data-section = "Resources for Providers" ]';
		var selectorFamAndIndividualsSection = '[data-section = "Individuals & Families" ]';

		var KEYS = {
			SPACE: 32,
			ENTER: 13,
			TAB: 9
		};

		var _this = this;

		$aboutUs.addEventListener('click', function( event ) {
			console.log("PRESSED", event );
			event.preventDefault();
			event.stopPropagation();

			//event.stopImmediatePropagation();

			$aboutUs.setAttribute('aria-expanded', 'true');

			toggleAboutUsSection();
			_this.focusSubsection( selectorAboutSection );
			_this.listenerLastItemFromSubsection( selectorAboutSection, $aboutUs, $medicaid );


		});

		$medicaid.addEventListener( 'click', function( event ) {
			event.preventDefault();
			event.stopPropagation();

			$medicaid.setAttribute('aria-expanded', 'true');

			toggleMedicaidSection();

			_this.focusSubsection( selectorMedicaidSection );
			_this.listenerLastItemFromSubsection( selectorMedicaidSection, $medicaid, $providers );

		} );

		$providers.addEventListener( 'click', function( event ) {
			event.preventDefault();
			event.stopPropagation();

			$providers.setAttribute('aria-expanded', 'true');

			toggleProviders();

			_this.focusSubsection( selectorProvidersSection );
			_this.listenerLastItemFromSubsection( selectorProvidersSection, $providers, $individuals );

		} );

		$individuals.addEventListener( 'click', function( event ) {
			event.preventDefault();
			event.stopPropagation();

			$individuals.setAttribute('aria-expanded', 'true');

			toggleFamiliesAndIndividuals();

			_this.focusSubsection( selectorFamAndIndividualsSection );
			_this.listenerLastItemFromSubsection( selectorFamAndIndividualsSection, $individuals, undefined );

		} );

	}
};