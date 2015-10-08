<?php
require_once('TwitterAPIExchange.php');
/** Set access tokens here - see: https://dev.twitter.com/apps/ **/
$settings = array(
'oauth_access_token' => "226205342-WIqTtD3b8zy8oelc2Ntjp2YwUAGRdV0cXzUkQEmS",
'oauth_access_token_secret' => "tRO66XFbco37qh4zFX1wKZbmiTMqTh7DNaR1rUWnMQAs9",
'consumer_key' => "yHOm5YxWPAgDO75MfTAdL6lk5",
'consumer_secret' => "sAccjbeSRn7yM59dUqKt56ESKZvLMOFesOEft4Kyuh1bGzcP9v"
);
$url = "https://api.twitter.com/1.1/statuses/home_timeline.json";
$requestMethod = "GET";
if (isset($_GET['user'])) {$user = $_GET['user'];} else {$user = "iagdotme";}
if (isset($_GET['count'])) {$count = $_GET['count'];} else {$count = 20;}
$getfield = "?include_entities=true";
$twitter = new TwitterAPIExchange($settings);

echo $twitter;
/*$string = json_decode($twitter->setGetfield($getfield)
->buildOauth($url, $requestMethod)
->performRequest(),$assoc = TRUE);
if($string["errors"][0]["message"] != "") {echo "<h3>Sorry, there was a problem.</h3><p>Twitter returned the following error message:</p><p><em>".$string[errors][0]["message"]."</em></p>";exit();}
foreach($string as $items)
    {
        echo "Time and Date of Tweet: ".$items['created_at']."<br />";
        echo "Tweet: ". $items['text']."<br />";
        echo "Tweeted by: ". $items['user']['name']."<br />";
        echo "Screen name: ". $items['user']['screen_name']."<br />";
        echo "Followers: ". $items['user']['followers_count']."<br />";
        echo "Friends: ". $items['user']['friends_count']."<br />";
        echo "Listed: ". $items['user']['listed_count']."<br />";
        echo "Test: ". $items['entities']."<br /><hr />";
    }*/
?>
