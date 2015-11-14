
/**
 * Handlers event and behavior specific to the xmlDisplay component once it has been loaded.
 */
(function() {

	$(document).ready(function () {

		// Even though the script is inside the shadow-node, it is still globally scoped, meaning we have to pierce the
		// shadow dom to bind to the correct elements (without event retargeting).
		var modal = document.getElementById('xmldisplay').shadowRoot.getElementById('xmldisplay-modal'),
				backdrop = 	document.getElementById('xmldisplay').shadowRoot.getElementById('xmldisplay-modal-backdrop');


		//
		// Event handlers
		//

		// Bind close modal behaviour
		$(backdrop).on('click', function () {
			$('#xmldisplay').remove();
		});

		// Trap mouse scrolling inside the modal
		$('#xmldisplay-content', modal).bind( 'mousewheel DOMMouseScroll', function (e) {

			var delta = e.originalEvent.wheelDelta || -e.detail;
			this.scrollTop += ( delta < 0 ? 1 : -1 ) * 150;

			e.preventDefault();
		});

		// Open and close xml branches.
		$('#xmldisplay-content li, #xmldisplay-content ul', modal).on('dblclick', function(event) {
			var target = $(event.target);

			// Prevent double clicking selecting text.
			window.getSelection().removeAllRanges();

			// Ignore spans, find containing li.
			if (target.is('span')) {
				target = target.closest('li');
			}

			// Leaf level list item, close containing list.
			if (target.is('li') && !target.siblings('ul').length) {
				target = target.closest('ul').prev().toggleClass('closed');
				return false;
			}
			//List item with children, close list.
			if (target.is('li') && target.next().is('ul')) {
				target.toggleClass('closed');
				return false;
			}
			// Closing tag of a list, close list.
			if (target.is('li') && target.prev().is('ul')) {
				target.prev().prev().toggleClass('closed');
				return false;
			}

			// Closed list.
			if (target.is('ul') && target.prev().is('li') && target.prev().hasClass('closed')) {
				target.prev().toggleClass('closed');
				return false;
			}
		});
	});

})();

