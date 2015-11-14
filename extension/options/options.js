

(function () {

	var settings;

	$(document).ready(function () {

		// Load settings.
		settings = Utils.SettingsManager.getInstance();
		settings.loadSettings(function() {

			//restore_options();
			$('input').each(function(index, elem) {

				elem = $(elem);
				elem.val(settings.getGlobalSetting(elem.data('storage')));
			}).on('keyup', function(event) {

				var target = $(event.target);
				settings.setGlobalSetting(target.data('storage'), target.val());
			}).on('paste', function (event) {
				setTimeout(function () {

					var target = $(event.target);
					settings.setGlobalSetting(target.data('storage'), target.val());
				}, 100);
			});
		});

	});


})();
