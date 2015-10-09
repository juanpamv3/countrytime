var ctControllers = angular.module('ctControllers', ['ngSanitize']).factory('twitterService', function($q) {
	
	console.log('initializing');

    var authorizationResult = false;

    return {
        initialize: function() {
            //initialize OAuth.io with public key of the application
            OAuth.initialize('19gVB-kbrzsJWQs5o7Ha2LIeX4I', {cache:true});
            //try to create an authorization result when the page loads, this means a returning user won't have to click the twitter button again
            authorizationResult = OAuth.create('twitter');
        },
        isReady: function() {
            return (authorizationResult);
        },
        connectTwitter: function() {
            var deferred = $q.defer();
            OAuth.popup('twitter', {cache:true}, function(error, result) { //cache means to execute the callback if the tokens are already present
                if (!error) {
                    authorizationResult = result;
                    deferred.resolve();
                } else {
                    //do something if there's an error

                }
            });
            return deferred.promise;
        },
        clearCache: function() {
            OAuth.clearCache('twitter');
            authorizationResult = false;
        },
        getLatestTweets: function (maxId) {
            //create a deferred object using Angular's $q service
            var deferred = $q.defer();
      			var url='/1.1/statuses/home_timeline.json';
      			if(maxId){
      				url+='?include_entities=true&max_id='+maxId;
      			}
            var promise = authorizationResult.get(url).done(function(data) { //https://dev.twitter.com/docs/api/1.1/get/statuses/home_timeline
                //when the data is retrieved resolve the deferred object
				        deferred.resolve(data);
            }).fail(function(err) {
               //in case of any error we reject the promise with the error object
                deferred.reject(err);
            });
            //return the promise of the deferred object
            return deferred.promise;
        }
    }

});

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


var tweetsList = null;

/* === Twitter Feed === */
ctControllers.controller('TwitterController', function($scope, $q, twitterService) {
	console.log('activates the twitter controller');
    
    $scope.tweets=[]; //array of tweets

    twitterService.initialize();

    //using the OAuth authorization result get the latest 20 tweets from twitter for the user
    $scope.refreshTimeline = function(maxId) {
        twitterService.getLatestTweets(maxId).then(function(data) {
            $scope.tweets = $scope.tweets.concat(data);
            tweetsList = $scope.tweets.concat(data);

            console.log($scope.tweets.length);
            
        },function(){
            $scope.rateLimitError = true;
        });
    }

    twitterService.connectTwitter().then(function() {
        if (twitterService.isReady()) {
            //if the authorization is successful, hide the connect button and display the tweets
            $('#connectButton').fadeOut(function(){
                $('#getTimelineButton, #signOut').fadeIn();
                $scope.refreshTimeline();
				          $scope.connectedTwitter = true;
            });
        } else {
        }
    });

    //sign out clears the OAuth cache, the user will have to reauthenticate when returning
    $scope.signOut = function() {
        twitterService.clearCache();
        $scope.tweets.length = 0;
        $('#getTimelineButton, #signOut').fadeOut(function(){
            $('#connectButton').fadeIn();
			$scope.$apply(function(){$scope.connectedTwitter=false})
        });
        $scope.rateLimitError = false;    
    }

    //if the user is a returning user, hide the sign in button and display the tweets
    if (twitterService.isReady()) {
        $('#connectButton').hide();
        $('#getTimelineButton, #signOut').show();
     		$scope.connectedTwitter = true;
        $scope.refreshTimeline();
        console.log('will work');
    }

});

/* === Feed === */
ctControllers.controller("FeedCtrl", ['$scope', '$http', '$sce', function($scope, $http, $sce, $q, twitterService) {
	var entityIDs = {good:0, better:0, best:0},
	locked = false,
	tips = [],
	tweets = [],
	facebookReady = false,
	twitterReady = false;


	var accessToken = 'CAAVTzGZBPtgoBAEB0XtA4brt6Rt4wwElZBe9rhZCkGvkMwdqshZCjCHe90Pu4r5hK0xCtgtKFZBvNEMjfC2sqliHpwbIQXuH0u24nEXZBgTvXx0JrG31JZCAde74iFuEuECsWI1t4B2yJvEAunTUYPOCs7fZCAeSFTEgLrzKbwsZCYXDbDEu0tJGz5CEs7wpyocUZD';
	
	$http.get('https://graph.facebook.com/166348773401455/posts?fields=id,link,full_picture,description,name,message&limit=10&access_token='+accessToken)
	.success(function(fbinfo) {
		//console.log(fbinfo.data);
		for(var i = 0, max = fbinfo.data.length; i < max; i+=1){
			tips.push({image: fbinfo.data[i].full_picture, link: fbinfo.data[i].link, id: fbinfo.data[i].id, tracking: null, network:'facebook', category:'tip', message: fbinfo.data[i].message, name: fbinfo.data[i].name})
		}

		facebookReady = true;
	})
	.then(function(){
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



	var countLoop = 0;

	var lookForData = setInterval(function() {

		countLoop+=1;

		if(tweetsList && tweetsList.length > 0){
			console.log('tweets are here');

			console.log(tweetsList);

			getTwitterImages(tweetsList);

			clearInterval(lookForData);
		} else {
			console.log('not yet');
			if(countLoop === 10){
				clearInterval(lookForData);
			}
		}
	}, 1000);

	
	function getTwitterImages(tweetData){
		var imagesTweets = tweetData.filter(hasImage);
		console.log(imagesTweets.length);

		for(var i = 0, max = imagesTweets.length; i < max; i+=1){

			tweets.push({image: imagesTweets[i].entities.media[0].media_url, userImg: imagesTweets[i].user.profile_image_url, userId: imagesTweets[i].user.id, userName: imagesTweets[i].user.screen_name, id: imagesTweets[i].id_str, network:'twitter'});
			console.log(tweets);
			
			if(facebookReady && i > 3){
				console.log('sending images');
				$scope.loadItems();
			}
		}
	}


		///// ALREADY USED <<<<<<<<<<<<<<<<<<<<<<<<<<<<<
		/*$http(twitterGet)
		.then(function(tweet){
			console.log(tweet.data);
			// CREATES NEW ARRAY WITH ONLY THE OBJECTS THAT HAVE IMAGES
			//var imagesTweets = tweet.data.filter(hasImage);

			
			//$scope.loadItems();
		});*/



		// TO TEST IF TWITTER IS RECEAVING INFO
		/*http(twitterGet)
		.then(function(tweet){
			console.log(tweet);
		}, function(){
			console.log(':(');
		});*/


	// });




	// shuffle(tips);

	$scope.items = [];

	var videos = [
		//{video: 'caterpillar', poster: 'assets/img/posters/video-anthem.jpg', network: 'video'},
		//{video: 'caterpillar', poster: 'assets/img/posters/video-caterpillar.jpg', network: 'video'},
		//{video: 'run', poster: 'assets/img/posters/video-run.jpg', network: 'video'},
		//{video: 'sunscreen', poster: 'assets/img/posters/video-sunscreen.jpg', network: 'video'}
	];

	// shuffle(videos);

	$scope.loadItems = function() {
  		var all = tips.concat(tweets);
  		shuffle(all);

  		$scope.items = $scope.items.concat(all);

		imagesLoaded(document.querySelector("#ct-feed > .container"), function() {
			VSA.packery.layout();
		});
        					
/*
		getFromURL("standtacular-good.json", {limit:6, start:entityIDs.good, callback:"JSON_CALLBACK"}, "good", function(goodData) {
			$.each(goodData, function(idx, elem) {
				elem.category = "good";
				//_newData.push(elem);
			});

			if (goodData.length) {
				// Add sip tips
			}

			getFromURL("standtacular-better.json", {limit:3, start:entityIDs.better, callback:"JSON_CALLBACK"}, "better", function(betterData) {
				$.each(betterData, function(idx, elem) {
					elem.category = "better";
					//_newData.push(elem);
				});
				shuffle(_newData);

				getFromURL("standtacular-best.json", {limit:1, start:entityIDs.best, callback:"JSON_CALLBACK"}, "best", function(bestData) {
					$.each(bestData, function(idx, elem) {
						elem.category = "best";
						//_newData.unshift(elem);
					});

					locked = false;

				});
			});
		});
*/

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