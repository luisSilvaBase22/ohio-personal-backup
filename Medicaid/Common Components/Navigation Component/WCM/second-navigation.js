(function(){

	var $headerAnchors = document.querySelector('.awesome-navigator.navList1');

	var $anchorAboutUs = $('.awesome-navigator.navList1 li:nth-child(2)');
	var $anchorMedicaid = $('.awesome-navigator.navList1 li:nth-child(3)');
	var $anchorProviders = $('.awesome-navigator.navList1 li:nth-child(4)');
	var $anchorIndividuals = $('.awesome-navigator.navList1 li:nth-child(5)');

	var $megaMenu = document.querySelector('.b-mega-menu');

	var $imageSectionAboutUs = $megaMenu.querySelector('.b-mega-menu-images .b-mega-menu__image-section[data-section="Our Structure about us"]');
	var $imageSectionMedicaid = $megaMenu.querySelector('.b-mega-menu-images .b-mega-menu__image-section[data-section="Learn About Medicaid"]');
	var $imageSectionProviders = $megaMenu.querySelector('.b-mega-menu-images .b-mega-menu__image-section[data-section="Resources for Providers"]');
	var $imageSectionIndividuals = $megaMenu.querySelector('.b-mega-menu-images .b-mega-menu__image-section[data-section="Individuals & Families"]');

	var $containerSectionAboutUs = $megaMenu.querySelector('.b-mega-menu__section .b-section[data-section="Our Structure about us"]');
	var $containerSectionMedicaid = $megaMenu.querySelector('.b-mega-menu__section .b-section[data-section="Learn About Medicaid"]');
	var $containerSectionProviders = $megaMenu.querySelector('.b-mega-menu__section .b-section[data-section="Resources for Providers"]');
	var $containerSectionIndividuals = $megaMenu.querySelector('.b-mega-menu__section .b-section[data-section="Individuals & Families"]');

	$anchorAboutUs.hover(function() {
		$imageSectionAboutUs.style.display = "block";
		$imageSectionIndividuals.style.display = "block";

		$containerSectionAboutUs.style.display = "block";
		$containerSectionIndividuals.style.display = "block";
	});

})();