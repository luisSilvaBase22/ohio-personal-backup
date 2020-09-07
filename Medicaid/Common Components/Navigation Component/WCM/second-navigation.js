document.addEventListener('DOMContentLoaded', function(  ) {

	var currentDevice = navigator.userAgent.toLowerCase();
	var isTabletDevice = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(currentDevice);
	var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(currentDevice);

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


	var updateMenuHeightWhenThreeRows = function( $containerSection, $imageSection ) {
		var listOfSubsections = $containerSection.querySelectorAll('.row:nth-child(2) .col-md-3');
		var numberOfSubsections = listOfSubsections.length;

		if ( numberOfSubsections > 12 ) {
			setMegaMenuImageHeight( $imageSection );
		}
	};

	var setMegaMenuImageHeight  = function( $imageSectionWrapper ) {
		var $image = $imageSectionWrapper.querySelector('img');

		$imageSectionWrapper.style.maxHeight = '355px';
		$image.style.maxWidth = '65vh';
	};

	var hideAllSectionsAndMegaMenuContainer = function(){
		hideAllSections();
		hideAllImages();
		$megaMenuContainer.style.display = "none";
	};

	var hideMegaMenu = function(){
		$megaMenuContainer.addEventListener('mouseleave', function(  ) {
			hideAllSectionsAndMegaMenuContainer();
		})
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

	var showSectionSelected = function($imageSection, $containerSection) {
		$imageSection.style.display = "block";
		$containerSection.style.display = "block";

		updateMenuHeightWhenThreeRows( $containerSection, $imageSection );
	};

	var toggleAboutUsSection = function(){
		hideAllSections();
		hideAllImages();

		showSectionSelected( $imageSectionAboutUs , $containerSectionAboutUs );

		showMegaMenu();
	};

	var toggleMedicaidSection = function(){
		hideAllSections();
		hideAllImages();

		showSectionSelected( $imageSectionMedicaid, $containerSectionMedicaid );

		showMegaMenu();
	};

	var toggleProviders = function(){
		hideAllSections();
		hideAllImages();

		showSectionSelected( $imageSectionProviders, $containerSectionProviders );

		showMegaMenu();
	};

	var toggleFamiliesAndIndividuals = function(){
		hideAllSections();
		hideAllImages();

		showSectionSelected( $imageSectionIndividuals, $containerSectionIndividuals );

		showMegaMenu();
	};

	/*
		Validation added because in mobile, when clicking inside any section from blue right bubble, before redirecting the desktop mega menu
		was displayed, apparently the hover was triggered
	*/
	if ( !isTabletDevice && !isMobileDevice ){
		$anchorAboutUs.hover(function() {
			toggleAboutUsSection();
		} );

		$anchorMedicaid.hover(function() {
			toggleMedicaidSection();
		} );

		$anchorProviders.hover(function() {
			toggleProviders();
		} );

		$anchorIndividuals.hover(function() {
			toggleFamiliesAndIndividuals();
		} );
	}

	hideMegaMenu();

	/*START:  Definition of script for Screen reader */
	[Component name="ohio design/agencies/medicaid/global-components/mega-menu/accessibilitymegamenuscript"]
	/*END:  Definition of script for Screen reader */

	//So click event does not trigger desktop mega menu in mobile devices
	if( ! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		AcccessibilityMegaMenu.init();
	}

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

});