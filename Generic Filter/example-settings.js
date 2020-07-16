var FILTERS = {
	alpha: "#selector", //Alpha List Selector
	filters: [
		{
			id: "#js-select-topics", //Select2 Selector
			propertyName: 'topics' //Property to filter
			allLabel: "All Topics"
			label: "By Topic"
			options: ["Topic 1", "Topic2"] //Optional, if empty, select2 options will be based on items.
		},
		{
			id: "#js-select-county", //Select2 Selector
			propertyName: 'county' //Property to filter
			allLabel: "All Counties"
			label: "By County"
		}
	],
	sorting: [
		{
			id: "#sort-by-number", //Click listener will be added to this selector
			sortFn: sortFn //Optional, a sorting function
			propertyName: "value", // Property Name, applies only if sortFn is not defined
			order: "ASC" //ASC,DESC Applies only if sortFn is not defined
		}
	],
	events: {
		formName: '[Element key="formName" type="content" context="selected" name="ohio content english/puco/forms/calendar-field-2"]',
		id: 'calendar-field'//optional, by default in the template it is defined as "calendar-field"
		startTimeSelector: '.selector',
		endTimeSelector: '.selector'
	},
	itemsMapping: mappingFunction, // A function excecuted after the data AJAX retrieval
	customFilter: [
		{
			id: "#sort-by-number", //Click listener will be added to this selector
			eventName: "click", // "click" default
			urlParam: "by-something", // This will allow the user to set URL paramaters, #by-something=value
			filterFn: filterFn // A function to be excecuted after settings filters are applied, this function will receive the filtered items and must return the new array of items.
		}
	]
};

var WIDGET_SETTINGS = {
	root: "#id-container"
	menuCmponent: "[Component bla bla]",
	template: "[Element bla bla]",
	idTemplateItems: "#cards-generic-wrapper",
	templateItems: '[Element key="templateFile" type="content" context="selected" name="ohio design/component-templates/agencies/opd/alphabetical-items"]',
	imageNoResults: '[Component name="ohio design/agencies/odh/no-results.png" rendition="auto" format="url"]',
	elementsPerPage: 3,
	Labels: {
		filterTitleFirstSection: 'opd-filter-by-name',
		filterButton: 'opd-filter-title',
		inputPlaceholder: 'opd-filter-placeholder',
		filterTitleSecondSection: '',
		allTypeIndexButton: '',
		resetFiltersButton: 'opd-reset-filters',
		noResultsText: 'odx-no-results-image'
	}
};

document.addEventListener( 'DOMContentLoaded', function() {
	var multiplesFiltersInstance = window.FiltersWidget( WIDGET_SETTINGS.menuComponentId );
	multiplesFiltersInstance.start( FILTERS, WIDGET_SETTINGS ).done( function( response ) {
		console.log("Rendered");
		updateSortingIcon();//Custom listener
	} );
} );