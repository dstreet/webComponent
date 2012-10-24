define(function(){

	var ListWidget = function() {

	};

	ListWidget.prototype.init = function(attachTo) {
		var $ = this.$
			, $containerEl = $( this.html.container.firstChild )
			, $listEl = $( this.html.list.firstChild );

		// Attach HTML
		$containerEl.append($listEl);
		$(attachTo).append($containerEl);

		// Attach CSS
		this.css.style.attach();

		// Events
		$listEl.find('li').on('click', function() {
			window.alert( "Image #" + $(this).find('img').attr('data-id') );
		});

	};

	return ListWidget;

});