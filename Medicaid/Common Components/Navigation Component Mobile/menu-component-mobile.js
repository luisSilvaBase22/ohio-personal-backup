(function(){
	var $secondNavigationMobileContainer = document.querySelector('.b-mega-menu-mobile');
	var $secondNavigationButton = document.querySelector('.js-btn-display-secondary-pages');
	var $containerSecondaryPages = document.querySelector('.b-mega-menu-mobile__secondary-pages');


	$secondNavigationButton.addEventListener('click', function( e ) {
		var target = e.target;

		var $bottomLine = $secondNavigationMobileContainer.querySelector('.b-mega-menu-mobile__bottom-line');

		var $iconButton = $secondNavigationButton.querySelector('i');

		if ( $containerSecondaryPages.style.display === "none" ) {
			$containerSecondaryPages.style.display = "block";

			$bottomLine.style.display = "block";

			$iconButton.classList.toggle('fa-minus-circle');
			$iconButton.classList.toggle('fa-plus-circle');

			$secondNavigationMobileContainer.classList.toggle('js-shadow-box');
		} else {
			$containerSecondaryPages.style.display = "none";

			$bottomLine.style.display = "none";

			$iconButton.classList.toggle('fa-plus-circle');
			$iconButton.classList.toggle('fa-minus-circle');

			$secondNavigationMobileContainer.classList.toggle('js-shadow-box');
		}


	});
})();