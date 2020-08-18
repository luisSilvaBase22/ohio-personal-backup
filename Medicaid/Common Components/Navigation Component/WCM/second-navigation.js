document.addEventListener('DOMContentLoaded', function(  ) {
	var $headerAnchors = document.querySelector('.awesome-navigator.navList1');

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
		$megaMenuContainer.addEventListener('mouseleave', function(  ) {
			hideAllSections();
			hideAllImages();
			$megaMenuContainer.style.display = "none";
		})
	};

	var showMegaMenu = function(){
		$megaMenuContainer.style.display = "block";
		console("Displaying");
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

	$anchorIndividuals.hover(function() {
		console.log('Display Mega Menu');
		//Quitar todos los blocks de los demás
		hideAllSections();
		hideAllImages();
		//Mostrar el block del mio

		$imageSectionIndividuals.style.display = "block";

		$containerSectionIndividuals.style.display = "block";
		showMegaMenu();
	} );

	$anchorAboutUs.hover(function() {
		console.log('Display Mega Menu');
		//Quitar todos los blocks de los demás
		hideAllSections();
		hideAllImages();
		//Mostrar el block del mio

		$imageSectionAboutUs.style.display = "block";

		$containerSectionAboutUs.style.display = "block";
		showMegaMenu();
	} );

	hideMegaMenu();

	//Crear método watcher que al hacer focus fuera de b-mega-menu, éste se oculte y eliminar los blocks abiertos
});