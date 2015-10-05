// @codekit-prepend '../bower_components/angular/angular.min.js'
// @codekit-prepend '../bower_components/angular-sanitize/angular-sanitize.min.js'
// @codekit-prepend '../bower_components/ngInfiniteScroll/ng-infinite-scroll.js'
// @codekit-prepend '../bower_components/imagesloaded/imagesloaded.pkgd.min.js'
// @codekit-prepend 'vendor/bootstrap.min.js'
// @codekit-prepend 'vendor/packery.pkgd.min.js'
// @codekit-prepend 'plugins.js'

// @codekit-append 'controllers/controllers.js'
// @codekit-append 'directives/directives.js'

var ctApp = ctApp || angular.module('ctApp', ['ngSanitize', 'ctControllers', 'ctDirectives']);
var VSA = VSA || {};

var packeryContainer = document.querySelector("#ct-feed > .container");

VSA.packery = new Packery(packeryContainer, {gutter:16, isLayoutInstant: true, transitionDuration: "0"});
VSA.packery.bindResize();
VSA.packery.items.splice(1,1);

window.onload = function() {
	VSA.packery.layout();
};

/* ---------------------------------------------------------------------
Global JavaScript & jQuery
------------------------------------------------------------------------ */
var VSA = VSA || {};

(function($) {

    $(function() {

        // Initialize fastclick (remove 300ms delay)
        VSA.FastClick.init();
        
    });

}(jQuery));

/* ---------------------------------------------------------------------
FastClick
Author: @codingstandard ftlabs-jsv2

FastClick: polyfill to remove click delays on browsers with touch UIs.
------------------------------------------------------------------------ */
VSA.FastClick = {

    init: function() {
    
        FastClick.attach(document.body);
        
    }
    
};

/* ---------------------------------------------------------------------
Avoid `console` errors in browsers that lack a console.
------------------------------------------------------------------------ */
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());