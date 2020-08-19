document.addEventListener('DOMContentLoaded', function(  ) {
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

	var toggleShowHideSections = function( $imageSection, $containerSection ){
		hideAllSections();
		hideAllImages();

		if ( $megaMenuContainer.style.display === "none" ) {
			$imageSection.style.display = "block";
			$containerSection.style.display = "block";
			showMegaMenu();
		} else {
			hideAllSections();
			hideAllImages();
			hideMegaMenu
		}
	};

	$anchorAboutUs.click(function() {

		hideAllSections();
		hideAllImages();

		if ( $megaMenuContainer.style.display === "none" ) {
			$imageSectionAboutUs.style.display = "block";
			$containerSectionAboutUs.style.display = "block";
			showMegaMenu();
		} else {
			hideAllSections();
			hideAllImages();
			hideMegaMenu
		}
	} );

	$anchorMedicaid.click(function() {

		toggleShowHideSections( $imageSectionMedicaid, $containerSectionMedicaid );
	} );

	$anchorProviders.click(function() {

		toggleShowHideSections( $imageSectionProviders, $containerSectionProviders );
	} );

	$anchorIndividuals.click(function() {

		toggleShowHideSections( $imageSectionIndividuals, $containerSectionIndividuals );
	} );

	hideMegaMenu();

});