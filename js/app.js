require.config({
	'paths': {
		'text' : 'require-text'
	},
	'packages': ['lib/webComponent']
});


require(['lib/webComponent'],
function(WebComponent) {

	var listComponent = new WebComponent('components/imageViewer', {
		'$': 'jquery'
	});

	listComponent.loaded(function() {
	
		list1 = listComponent.new();
		list1.init( document.getElementsByTagName('body')[0] );

	});

});