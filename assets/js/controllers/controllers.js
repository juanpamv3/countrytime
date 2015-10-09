var ctControllers = angular.module('ctControllers', ['ngSanitize']);

ctControllers.controller("MainCtrl", ['$scope', function($scope) {
    var self = this;

    /* ---------------------------------------------------------------------
    Test window size (desktop/mobile break)
    ------------------------------------------------------------------------ */    
    self.isDesktop = true;
    
    function testWindow(e) {
        _w = $(window).width();
        
		if (e) {
			$scope.$apply(function() {
                self.isDesktop = _w >= 768;
			});
		} else {
			self.isDesktop = _w >= 768;
		}
    };  
        
    $(window).resize(testWindow);
    
    testWindow();

    /* ---------------------------------------------------------------------
    Burger menu
    ------------------------------------------------------------------------ */    
    self.menuActive = false;
    
    /* ---------------------------------------------------------------------
    Scroll to video
    ------------------------------------------------------------------------ */    
    self.scrollTop = function(){
        $('html, body').animate({
            scrollTop: $('.mod-how').offset().top
        }, 1000);       
    };
    
    /* ---------------------------------------------------------------------
    Loop video, initiate full video
    ------------------------------------------------------------------------ */    
    self.videoStart = function(){    
        // pause loop and hide
        $('.intro-video-loop').toggleClass('loop-hide');
        $('.intro-video-loop').trigger('pause');
        
        // show video and begin
        $('.intro-video').toggleClass('video-show');
        $('.intro-video').trigger('play');
        
        // hide start button
        $('.intro-link').fadeOut( "slow" );
        
        self.videoEnd();
    };
    
    /* ---------------------------------------------------------------------
    Video end callback function
    ------------------------------------------------------------------------ */    
    self.videoEnd = function(){
        $('.intro-video').on('ended',function(){
            $('.ct-external').addClass('video-end');
        });   
    }

    /* ---------------------------------------------------------------------
    Pitcher animation
    ------------------------------------------------------------------------ */    
    self.introSprite = function(){
        $('.intro-sprite').sprite({fps: 24, no_of_frames: 28});
    }

    /* ---------------------------------------------------------------------
    Night and day
    ------------------------------------------------------------------------ */    
    var d = new Date().getHours();
    self.isMorning = d >= 7 && d <= 20;

}])

/* === Feed === */
ctControllers.controller("FeatureCtrl", ['$scope', '$http', function($scope, $http) {
	$scope.handleClick = function(evt, params) {
		var windowParams = 'height=320, width=640, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, directories=no, status=no',
			shareURL = '',
			windowName = '';

		switch(params.type) {
			case "Facebook" :
				shareURL = 'https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2F'+window.location.hostname;
				windowName = 'facebook_share';
				break;
			case "Twitter" :
				shareURL = 'https://twitter.com/share?url=http%3A%2F%2F'+window.location.hostname+'&text=Tag your family\'s lemonade stand %23countrytime, %23famtastic, %23standtacular or %23lemonade and spot it on';
				windowName = 'twitter_share';
				break;
		}

		window.open(shareURL, windowName, windowParams);
	};
}]);

/* === Products === */
ctControllers.controller("ProductCtrl", ['$scope', '$http', function($scope, $http) {
	var _products = [];

	$http.get(window.location.href + "data/products.json").success(function(data) {
		_products = data[0].products;
/* 		testMatches(); */
        $scope.products=_products;
	});


}]);


/* === Feed === */
ctControllers.controller("FeedCtrl", ['$scope', '$http', '$sce', function($scope, $http, $sce, $q, twitterService) {
	var entityIDs = {good:0, better:0, best:0},
	locked = false,
	tips = [],
	tweets = [],
	count = 0,
	facebookReady = false,
	twitterReady = false;

	var accessToken = 'CAAVTzGZBPtgoBAEB0XtA4brt6Rt4wwElZBe9rhZCkGvkMwdqshZCjCHe90Pu4r5hK0xCtgtKFZBvNEMjfC2sqliHpwbIQXuH0u24nEXZBgTvXx0JrG31JZCAde74iFuEuECsWI1t4B2yJvEAunTUYPOCs7fZCAeSFTEgLrzKbwsZCYXDbDEu0tJGz5CEs7wpyocUZD';
	
	$http.get('https://graph.facebook.com/166348773401455/posts?fields=id,link,full_picture,description,name,message&limit=10&access_token='+accessToken)
	.success(function(fbinfo) {
		//console.log(fbinfo.data);
		for(var i = 0, max = fbinfo.data.length; i < max; i+=1){
			tips.push({image: fbinfo.data[i].full_picture, link: fbinfo.data[i].link, id: fbinfo.data[i].id, tracking: null, network:'facebook', message: fbinfo.data[i].message, name: fbinfo.data[i].name})
		}

		facebookReady = true;
	})
	.then(function(){
		//$scope.loadItems();
		console.log('facebook is ready');
	});


	// HELPER FOR FILTER FUNCTION
	function hasImage(x){
		if(x.entities && x.entities.media){
			if (x.entities.media[0].media_url){
				return true;
			}
		}
	}


	//GETTING INFO FROM TWITTER
	var authorizationResult = false,
	url='1.1/statuses/user_timeline.json?user_id=226205342&count=100',
	//access = {oauth_token: "226205342-WIqTtD3b8zy8oelc2Ntjp2YwUAGRdV0cXzUkQEmS", oauth_token_secret: "tRO66XFbco37qh4zFX1wKZbmiTMqTh7DNaR1rUWnMQAs9"}
    
	OAuth.initialize('b2hNLGBMN5K8xGXCBLKuxe5scnY');

	/*OAuth.popup('twitter').done(function(result) {
	    console.log(result)
	    // do some stuff with result
	});*/

	'https://api.twitter.com/oauth/authenticate'
	
	authorizationResult = OAuth.create('twitter');

	console.log(authorizationResult);

	authorizationResult.get(url).done(function(data){
		//console.log(data);
		getTwitterImages(data);
	});

	function getTwitterImages(tweet){
		// CREATES NEW ARRAY WITH ONLY THE OBJECTS THAT HAVE IMAGES
		var imagesTweets = tweet.filter(hasImage);

		console.log(imagesTweets.length);
		//console.log(imagesTweets);

		for(var i = 0, max = imagesTweets.length; i < max; i+=1){

			tweets.push({image: imagesTweets[i].entities.media[0].media_url, userImg: imagesTweets[i].user.profile_image_url, userId: imagesTweets[i].user.id, userName: imagesTweets[i].user.screen_name, id: imagesTweets[i].id_str, network:'twitter'});
			
			//console.log(tweets);

			if(i === 10){
				console.log('last image done');
				twitterReady = true;
				//$scope.loadItems();
			} else {
				console.log('not the same #');
			}
		}
		console.log('end');
		
	}

	// HELPER FOR FILTER FUNCTION
	function hasImage(x){
		if(x.entities && x.entities.media){
			if (x.entities.media[0].media_url){
				return true;
			}
		}
	}
	
	var expect = setInterval(function() {
		count+=1;
    	if(twitterReady && facebookReady){
    		console.log('all set');

    		$scope.loadItems(tweets,tips);
   //  		console.log('latest test');
   //  		console.log(tweets);
			// console.log(tips);

    		clearInterval(expect);
    	} else {
    		console.log('not yet');
    		if (count === 10){
    			clearInterval(expect);
    		}
    	}
	}, 1000);


	// shuffle(tips);

	$scope.items = [];

	var videos = [
		//{video: 'caterpillar', poster: 'assets/img/posters/video-anthem.jpg', network: 'video'},
		//{video: 'caterpillar', poster: 'assets/img/posters/video-caterpillar.jpg', network: 'video'},
		//{video: 'run', poster: 'assets/img/posters/video-run.jpg', network: 'video'},
		//{video: 'sunscreen', poster: 'assets/img/posters/video-sunscreen.jpg', network: 'video'}
	];

	// shuffle(videos);

	$scope.loadItems = function(tweets,tips) {
		console.log("--Llegamos - load items");
  		var all = tips.concat(tweets);

  		shuffle(all);

  		console.log(all);
  		
  		$scope.items = $scope.items.concat(all);

		imagesLoaded(document.querySelector("#ct-feed > .container"), function() {
			VSA.packery.layout();
		});

	};

	$scope.getTemplate = function(item) {
		return "partials/feed-"+item.network+".html";
	};

	$scope.linkifiedTextURL = function(item) {
		var txt = item.message || item.story || item.name || "";
		txt = txt.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
		return txt.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');;
	};

	$scope.linkifiedText = function(item) {
		var txt = item.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
		txt = txt.replace(/\B@([a-z0-9_-]+)/gi, '<a href="http://twitter.com/$1" target="_blank">@$1</a>');
		return txt.replace(/#(\S*)/g, '<a href="http://twitter.com/#!/search/$1" target="_blank">#$1</a>');
	};

	$scope.twitterTimestamp = function(timestamp) {
		// return "Timestamp";
		return dateFormat(new Date(timestamp), "h:mm TT - d mmm yyyy");
	};

	$scope.facebookPicture = function(item) {
		return item.picture.replace(/_s.jpg/, "_o.jpg");
	};

	$scope.getInstagramTags = function(item) {
		var tagsArray = [];
		for (var tag in item.tags) {
			tagsArray.push("#"+item.tags[tag]);
		}
		return tagsArray.join(" ");
	};

	$scope.getPlayerURL = function(item) {
		if (item.type != "video") return;
		var url = "https://up.massrelevance.com/massrel-products/player/index.html?width=480&amp;mp4="+item.videos.low_resolution.url+"&amp;height=480&amp;poster="+item.images.low_resolution.url+"&amp;schema=instagram";
		return $sce.trustAsResourceUrl(url);
	};

	$scope.templateLoaded = function() {
		setTimeout(function() {
			FB.XFBML.parse();
			VSA.packery.layout();
		}, 100);
	};

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	// $scope.loadItems();
}]);


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}