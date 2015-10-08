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

	$http.get("data/products.json").success(function(data) {
		_products = data[0].products;
/* 		testMatches(); */
        $scope.products=_products;
	});

/*
	function testMatches(e) {
		var keys = ["sm", "md", "lg"], i = 0, cs = null, _w = $(window).width();

		if (_w > 1024) {
			cs = "lg";
		} else if (_w >= 640) {
			cs = "md";
		} else {
			cs = "sm";
		}

		if (e) {
			$scope.$apply(function() {
				$scope.contentScale = cs;
				$scope.products = cs == "sm" ? [] : _products;
			});
		} else {
			$scope.contentScale = cs;
			$scope.products = cs == "sm" ? [] : _products;
		}
	}

	$(window).resize(testMatches);
*/
}]);

/* === Feed === */
ctControllers.controller("FeedCtrl", ['$scope', '$http', '$sce', function($scope, $http, $sce) {
	var entityIDs = {good:0, better:0, best:0},
	locked = false,
	tips = [],
	tweets = [];

	var accessToken = 'CAAVTzGZBPtgoBAEB0XtA4brt6Rt4wwElZBe9rhZCkGvkMwdqshZCjCHe90Pu4r5hK0xCtgtKFZBvNEMjfC2sqliHpwbIQXuH0u24nEXZBgTvXx0JrG31JZCAde74iFuEuECsWI1t4B2yJvEAunTUYPOCs7fZCAeSFTEgLrzKbwsZCYXDbDEu0tJGz5CEs7wpyocUZD';
	
	$http.get('https://graph.facebook.com/166348773401455/posts?fields=id,link,full_picture,description,name,message&limit=10&access_token='+accessToken)
		.success(function(fbinfo) {
			//console.log(fbinfo.data);

			for(var i = 0, max = fbinfo.data.length; i < max; i+=1){
				tips.push({image: fbinfo.data[i].full_picture, link: fbinfo.data[i].link, id: fbinfo.data[i].id, tracking: null, network:'facebook', category:'tip', message: fbinfo.data[i].message, name: fbinfo.data[i].name})
			}
		})
		.then(function(){
			$scope.loadItems();
		});

		// TWITTER GET
		var twitterGet = {
			method: 'GET',
			url: 'data/twitter-posts.json',
			headers: {
				'Access-Control-Allow-Origin': 'http://stg.seetheworlddigital.com:7008/',
			    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
			    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
				'Authorization': 'OAuth oauth_consumer_key="Xf6eQrmUbzRSRJpp4qt7vuMbk", oauth_nonce="94d998441ab1709d28c672c90067f2f4", oauth_signature="X1MYa8%2FeN2lz8HFVcUZP7qFrP7s%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1444248207", oauth_token="226205342-HYuvoXmHTlSo7fdvawKXTnj8Fbp5DOPWkv65D8fg", oauth_version="1.0"'
			}
		};

		// HELPER FOR FILTER FUNCTION
		function hasImage(x){
			if(x.entities && x.entities.media){
				if (x.entities.media[0].media_url){
					return true;
				}
			}
		}

		/// TRYING TO GET DATA FROM TWITTER - CURRENT OAUTH LAST ONLY 15 MINUTES WE NEED TO UPDATE THEM 
		/*$.ajax({
			type: 'GET',
		     beforeSend: function (request){
                request.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:9000');
                request.setRequestHeader('Authorization',' Authorization: OAuth oauth_consumer_key="Xf6eQrmUbzRSRJpp4qt7vuMbk", oauth_nonce="ed68555efcd6035e15816c914c3410f6", oauth_signature="Vi6Slkm0ueovLnqCDg1oCpIQUHw%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1444310951", oauth_token="226205342-HYuvoXmHTlSo7fdvawKXTnj8Fbp5DOPWkv65D8fg", oauth_version="1.0"');
            },

			url: 'https://api.twitter.com/1.1/', //?user_id=226205342&include_entities=true',
			contentType: "application/json",
           	dataType: "jsonp",
			success: function(data){
				console.log('WORKED');
				console.log(data);
			},
			error: function(e){
				console.log('NOT WORKING');
			  	console.log(e);
			}
		});*/





		///// ALREADY USED <<<<<<<<<<<<<<<<<<<<<<<<<<<<<
		$http(twitterGet)
		.then(function(tweet){
			//console.log(tweet.data);
			// CREATES NEW ARRAY WITH ONLY THE OBJECTS THAT HAVE IMAGES
			var imagesTweets = tweet.data.filter(hasImage);

			for(var i = 0, max = imagesTweets.length; i < max; i+=1){

				tweets.push({image: imagesTweets[i].entities.media[0].media_url, userImg: imagesTweets[i].user.profile_image_url, userId: imagesTweets[i].user.id, userName: imagesTweets[i].user.screen_name, id: imagesTweets[i].id_str, network:'twitter'})

			}

			//$scope.loadItems();

		});









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

/*
	function getFromURL(url, params, idStore, callback) {
		var paramArr = [];
		for (var param in params) {
			if (params[param] != 0) {
				paramArr.push(param+"="+params[param]);
			}
		}
		if (paramArr.length > 0) {
			url = url+"?"+paramArr.join("&");
		}
		
		$http.jsonp("http://api.massrelevance.com/countrytimemr/"+url).success(function(data) {
			if (data.length) entityIDs[idStore] = data[data.length-1].entity_id;
			callback(data);
		});
	}
*/

	$scope.loadItems = function() {
		// if (locked) return;
		// locked = true;

		// var _newData = [];

		// //for (var i = 0; i<4; i++) {
		// for (var i = 0; i<tips.length; i++) {
		// 	var tip = {
		// 		image: "assets/img/tips/"+tips[0].image,
		// 		link: tips[0].link,
		// 		tracking: tips[0].tracking,
		// 		network: "sip",
		// 		category: "tip"
		// 	};
		// 	_newData.push(tip);
		// 	tips.push(tips.shift());
		// }
        
  //       $scope.items = $scope.items.concat(_newData);	
        
  //       locked = false;
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