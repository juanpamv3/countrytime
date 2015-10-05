var ctDirectives = angular.module('ctDirectives', []);

ctDirectives.directive("ctPackery", [function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attr) {
			VSA.packery.appended(elem[0]);
		}
	};
}]);

ctDirectives.directive("ctShareClick", [function() {
	var linkFunc = function(scope, elem, attr) {
		elem.on("click", function(evt) {
			evt.preventDefault();
			scope.handleClick(evt, {type:attr.ctShareClick});
		});
	};

	return { restrict: 'A', link: linkFunc };
}]);

ctDirectives.directive("ctToggle", [function() {
	var linkFunc = function(scope, elem, attr) {
		elem.on("click", function(evt) {
			evt.preventDefault();
			var targ = attr.ctToggleId ? $("#"+attr.ctToggleId) : elem;
			targ.toggleClass(attr.ctToggle);
		});
	};

	return { restrict: 'A', link: linkFunc };
}]);

ctDirectives.directive("ctStickyScroll", [function() {
	var linkFunc = function(scope, elem, attr) {
		scope.$window = $(window),
		scope.elTop = 1600 - window.innerHeight + elem.outerHeight();

		scope.$window.on("scroll", function(e) {
			elem.toggleClass("ct-sticky", scope.$window.scrollTop() > scope.elTop);
		});
	};

	return { restrict: 'A', link: linkFunc };
}]);

ctDirectives.directive("ctTrack", [function() {
	var linkFunc = function(scope, elem, attr) {
		elem.on("click", function(evt) {
			ga('send', 'event', 'button', 'click', attr.ctTrack);
		});
	};

	return { restrict: 'A', link: linkFunc };
}]);

ctDirectives.directive("feedItemVideo", [function() {
	return {
		restrict: 'A',
		scope: {'feedItemVideo': '@'},
		link: function(scope, elem, attrs) {
			var playing = false;
			elem.find('a').click(function() {
				elem.find('video').trigger(playing ? 'pause' : 'play');
				playing = !playing;
			});

			var item = scope.$eval(scope.feedItemVideo);
			var inner = '<video width="302" preload="none" poster="'+item.poster+'">'+
				'<source src="assets/video/'+item.video+'.webm" type="video/webm">'+
				'<source src="assets/video/'+item.video+'.ogv" type="video/ogg">'+
				'<source src="assets/video/'+item.video+'.mp4" type="video/mp4">'+
				'</video>';

			elem.find('a').html(inner);
		}
	};
}]);