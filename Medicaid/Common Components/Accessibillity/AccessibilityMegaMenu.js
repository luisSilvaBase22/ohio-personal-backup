var AcccessibilityMegaMenu = {
	focusHelp: function(){
		hideAllSections();
		hideAllImages();

		var $linkHelp = document.querySelector('#js-go-help');
		$linkHelp.focus();
	},
	listenerLastItemFromSubsection: function( selectorSection, nextSection,  callback ){
		var _this = this;
		var $megaMenu = document.querySelector('.b-mega-menu');

		var $subsectionWrapper = $megaMenu.querySelector( selectorSection );
		var $subsectionLinks = $subsectionWrapper.querySelectorAll( '.b-section__secondary-pages-list' );
		var $lastLinkFromCurrentSubSection = $subsectionLinks[ $subsectionLinks.length -1 ];
		$lastLinkFromCurrentSubSection.addEventListener('keypress', function(){
			if ( nextSection !== undefined ) {
				_this.focusSubsection( nextSection );

			}

			callback();
		});
	},
	focusSubsection: function( selectorSection ){
		var $megaMenu = document.querySelector('.b-mega-menu');

		var $subsectionWrapper = $megaMenu.querySelector( selectorSection );
		var $firstLink = $subsectionWrapper.querySelector( '.b-section__secondary-pages-list li a' );
		$firstLink.focus();
	},
	addAriasToMegaMenu: function( $aboutUs, $medicaid, $providers, $individuals ){
		$aboutUs.setAttribute('aria-hidden', 'true');
		$aboutUs.setAttribute('aria-label', 'Our Structure section');
		$aboutUs.setAttribute('role', 'button');
		$aboutUs.setAttribute('aria-expanded', 'false');
		$aboutUs.setAttribute('tabindex', '0' );

		$medicaid.setAttribute('aria-hidden', 'true');
		$medicaid.setAttribute('aria-label', 'About Medicaid section');
		$medicaid.setAttribute('role', 'button');
		$medicaid.setAttribute('aria-expanded', 'false');
		$medicaid.setAttribute('tabindex', '0' );

		$providers.setAttribute('aria-hidden', 'true');
		$providers.setAttribute('aria-label', 'Providers section');
		$providers.setAttribute('role', 'button');
		$providers.setAttribute('aria-expanded', 'false');
		$providers.setAttribute('tabindex', '0' );

		$individuals.setAttribute('aria-hidden', 'true');
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

		/*
		var $linkAbout = $aboutUs.querySelector('a');
		$linkAbout.setAttribute('aria-label', "About us section, press enter to see section");
		$linkAbout.setAttribute('role', 'button');
		$linkAbout.setAttribute('aria-pressed', 'false');
		$linkAbout.setAttribute('aria-expanded', 'false');

		 */

		$aboutUs.addEventListener('keydown', function( event ) {
			console.log("PRESSED", event.keyCode );
			event.preventDefault();
			event.stopPropagation();
			console.log("PRESSED", event.keyCode );

			event.stopImmediatePropagation();

			$aboutUs.setAttribute('aria-expanded', 'true');
			$aboutUs.setAttribute('aria-hidden', 'false');

			if ( event.keyCode === KEYS.ENTER || event.keyCode === KEYS.SPACE ) {
				event.preventDefault();
				event.stopImmediatePropagation();
				console.log("SUCCESS");
				toggleAboutUsSection();
				_this.focusSubsection( selectorAboutSection );
				//_this.listenerLastItemFromSubsection( selectorAboutSection, selectorMedicaidSection, toggleMedicaidSection() );
			}
			/*
			var $link = $aboutUs.querySelector('a');

			$link.addEventListener( 'keydown' , function( e ) {
				e.preventDefault();
				console.log("CLICK REDIRECT", e.keyCode);
				if ( e.keyCode === KEYS.ENTER ) {
					e.preventDefault();
				}

				toggleAboutUsSection();

				_this.focusSubsection( selectorAboutSection );
				_this.listenerLastItemFromSubsection( selectorAboutSection, selectorMedicaidSection, toggleMedicaidSection() );
			});

			 */

		});

		$medicaid.addEventListener( 'keyup', function( event ) {
			event.preventDefault();
			console.log("PRESSED", event.keyCode );

			$medicaid.setAttribute('aria-expanded', 'true');
			$medicaid.setAttribute('aria-hidden', 'false');

			if ( event.keyCode === KEYS.ENTER ) {
				event.preventDefault();
				console.log("SUCCESS");
			}
			/*
			var $link = $aboutUs.querySelector('a');

			$link.addEventListener( 'keydown' , function( e ) {
				e.preventDefault();
				toggleMedicaidSection();

				_this.focusSubsection( selectorMedicaidSection );
				_this.listenerLastItemFromSubsection( selectorMedicaidSection, selectorProvidersSection, toggleProviders() );

			});

			 */
		} );

		$providers.addEventListener( 'keyup', function( event ) {
			event.preventDefault();
			var $link = $aboutUs.querySelector('a');

			$link.addEventListener( 'keydown' , function( e ) {
				e.preventDefault();
				toggleMedicaidSection();

				_this.focusSubsection( selectorProvidersSection );
				_this.listenerLastItemFromSubsection( selectorProvidersSection, selectorFamAndIndividualsSection, toggleFamiliesAndIndividuals() );

			});
		} );

		$individuals.addEventListener( 'keyup', function( event ) {
			event.preventDefault();
			var $link = $aboutUs.querySelector('a');

			$link.addEventListener( 'keydown' , function( e ) {
				e.preventDefault();
				toggleMedicaidSection();

				_this.focusSubsection( selectorFamAndIndividualsSection );
				_this.listenerLastItemFromSubsection( selectorFamAndIndividualsSection, undefined, _this.focusHelp() );

			});
		} );

	}
};