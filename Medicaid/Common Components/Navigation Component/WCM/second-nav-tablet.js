document.addEventListener('DOMContentLoaded', function(  ) {

	var userAgent = navigator.userAgent.toLowerCase();
	var isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
	console.log(isTablet);

	if ( isTablet ) {
		var $headerAnchors = document.querySelector('.awesome-navigator.navList1');

		//var $allNavigationAnchors = $headerAnchors.querySelectorAll('li a');

		var $anchorAboutUs = $('.awesome-navigator.navList1 li:nth-child(2)');
		var $anchorMedicaid = $('.awesome-navigator.navList1 li:nth-child(3)');
		var $anchorProviders = $('.awesome-navigator.navList1 li:nth-child(4)');
		var $anchorIndividuals = $('.awesome-navigator.navList1 li:nth-child(5)');

		var $megaMenuContainer = document.querySelector('.b-mega-menu');

		var $imageSectionAboutUs = $megaMenuContainer.querySelector('.b-mega-menu-images .b-mega-menu__image-section[data-section="Our Structure about us"]');
		var $imageSectionMedicaid = $megaMenuContainer.querySelector('.b-mega-menu-images .b-mega-menu__image-section[data-section="Learn About Medicaid"]');
		var $imageSectionProviders = $megaMenuContainer.querySelector('.b-mega-menu-images .b-mega-menu__image-section[data-section="Resources for Providers"]');
		var $imageSectionIndividuals = $megaMenuContainer.querySelector('.b-mega-menu-images .b-mega-menu__image-section[data-section="Individuals & Families"]');

		var $containerSectionAboutUs = $megaMenuContainer.querySelector('.b-mega-menu__section .b-section[data-section="Our Structure about us"]');
		var $containerSectionMedicaid = $megaMenuContainer.querySelector('.b-mega-menu__section .b-section[data-section="Learn About Medicaid"]');
		var $containerSectionProviders = $megaMenuContainer.querySelector('.b-mega-menu__section .b-section[data-section="Resources for Providers"]');
		var $containerSectionIndividuals = $megaMenuContainer.querySelector('.b-mega-menu__section .b-section[data-section="Individuals & Families"]');

		var hideMegaMenu = function(){
			hideAllSections();
			hideAllImages();
			$megaMenuContainer.style.display = "none";
		};

		var showMegaMenu = function(){
			$megaMenuContainer.style.display = "block";
		};

		var hideAllSections = function(){
			$containerSectionAboutUs.style.display = "none";
			$containerSectionMedicaid.style.display = "none";
			$containerSectionProviders.style.display = "none";
			$containerSectionIndividuals.style.display = "none";
		};

		var hideAllImages = function(){
			$imageSectionAboutUs.style.display = "none";
			$imageSectionMedicaid.style.display = "none";
			$imageSectionProviders.style.display = "none";
			$imageSectionIndividuals.style.display = "none";
		};

		var lastVisitedSection = "";

		var toggleShowHideSections = function( $imageSection, $containerSection ){

			hideAllSections();
			hideAllImages();
			//hideMegaMenu();

			if ( $megaMenuContainer.style.display === "none" ) {
				$imageSection.style.display = "block";
				$containerSection.style.display = "block";
				lastVisitedSection = $containerSection.dataset.section;
				showMegaMenu();
			} else {
				if ($containerSection.dataset.section !== lastVisitedSection ) {
					//Switch section in case mega menu is open
					$imageSection.style.display = "block";
					$containerSection.style.display = "block";
					lastVisitedSection = $containerSection.dataset.section;
				} else {
					//Close mega menu
					hideAllSections();
					hideAllImages();
					hideMegaMenu();
					lastVisitedSection = "";
				}
			}
		};

		$anchorAboutUs.click(function( event ) {

			event.preventDefault();
			toggleShowHideSections( $imageSectionAboutUs, $containerSectionAboutUs );
		} );

		$anchorMedicaid.click(function( event ) {

			event.preventDefault();
			toggleShowHideSections( $imageSectionMedicaid, $containerSectionMedicaid );
		} );

		$anchorProviders.click(function( event ) {

			event.preventDefault();
			toggleShowHideSections( $imageSectionProviders, $containerSectionProviders );
		} );

		$anchorIndividuals.click(function( event ) {

			event.preventDefault();
			toggleShowHideSections( $imageSectionIndividuals, $containerSectionIndividuals );
		} );

		hideMegaMenu();

		var odxScroll = function() {

			if( document.documentElement.scrollTop > 30 ) {
				$megaMenuContainer.style.top = "104px";
			} else {
				$megaMenuContainer.style.top = "140px";
			}
		};

		window.addEventListener("scroll", function() {
			odxScroll();
		})
	}

});