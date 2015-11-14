(function() {

	var settings,
		stylesheet;

	$(document).ready(function() {

		// Load settings.
		settings = Utils.SettingsManager.getInstance();
		settings.loadSettings(function() {

			// Set the correct state of the extensions icon.
			if ($(settings.getGlobalSetting('target')).length) {
				chrome.runtime.sendMessage({"newIconPath": 'icons/icon-highlighted.png'});
			}

			chrome.runtime.onMessage.addListener(
				function (request) {
					if (request.action === 'toggle') {
						toggle();
					}
				}
			);
		});

	});


	/**
	 * If the results modal has already been created, show it, otherwise create it.
	 */
	function toggle() {
		if ($('#xmldisplay').length) {
			$('#xmldisplay').remove();
		} else {

			// Fetch any required resources before loading.
			// Fetch stylesheet.
			$.ajax({
				url: chrome.extension.getURL('/xmlDisplay.css'),
				success: function(response) {
					stylesheet = response;

					// Create modal.
					create();
				}
			});

		}
	}


	function create() {
		var targetElement = settings.getGlobalSetting('target'),
			splitter = settings.getGlobalSetting('splitter') || '',
			input = $(targetElement).text();

		// Ensure previous modal is no longer present.
		$('#xmldisplay-template').remove();
		$('#xmldisplay').remove();

		// Create a component we will later use in creating a shadow dom node, allowing us to isolate the styling of
		// the component from the rest of the display.
		$('body').append(
			$('<template/>', {id: 'xmldisplay-template'}).append(
				$('<style></style>', {text: stylesheet})
			).append(
				$('<script/>', {'type': 'text/javascript', src: chrome.extension.getURL('/libs/jquery-2.0.3.min.js')})
			).append(
				$('<script/>', {'type': 'text/javascript', src: chrome.extension.getURL('/xmlDisplay.js')})
			).append(
					$('<div/>')
			)
		).append(
			$('<aside/>', {id: 'xmldisplay'})
		);

		var container = $('#xmldisplay-template div');

		// Split and retrieve the part of the target element that we actually want.
		if (splitter) {
			var split = input.split(splitter);
			input = split[split.length - 1];
		}

		// Remove excess whitespace.
		input = input.trim().replace(/>\s*</, '><');

		// Remove comments.
		input = input.replace(/(\r\n|\n|\r)/gm,'');
		input = input.replace(/<\!--.*?-->/g, '');

		// Get formatted Xml.
		var formatter = new Utils.XmlFormatter({
			maxAttributeLength: settings.getGlobalSetting('maxAttributeLength'),
			maxIndent: settings.getGlobalSetting('maxIndent'),
			elementsToCollapse: settings.getGlobalSetting('elementsToCollapse')
		});
		var output = formatter.getFormattedXml(input);

		// Create elements and append to our template.
		var modalBackdrop = $('<div/>', { id: 'xmldisplay-modal-backdrop'}).height($(document).height());
		var modal = $('<div/>', { id: 'xmldisplay-modal' }).html('' +
			'<section id="xmldisplay-container">' +
			'<section id="xmldisplay-content"></section>' +
			'</section>'
		);
		container
			.append(modalBackdrop)
			.append(modal);

		// Inject formatted xml into display.
		$('#xmldisplay-content', container).html(output);

		// Copy content into the shadow dom.
		var shadow = $('#xmldisplay')[0].createShadowRoot();
		var	template = $('#xmldisplay-template');
		$(shadow).append($(template).children());

		template.remove();

	}

})();
