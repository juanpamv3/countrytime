<?php
//We use already made Twitter OAuth library
//https://github.com/mynetx/codebird-php
require_once ('codebird.php');

//Twitter OAuth Settings, enter your settings here:
$CONSUMER_KEY = 'fWUoMA042a6EyUWQZnYqPkCcA';
$CONSUMER_SECRET = 'qHbqjGKjCqPJKYpKBM3koFL2EK0vlHXlZNtb5f8daHljv6i1qL';
$ACCESS_TOKEN = '226205342-WIqTtD3b8zy8oelc2Ntjp2YwUAGRdV0cXzUkQEmS';
$ACCESS_TOKEN_SECRET = 'tRO66XFbco37qh4zFX1wKZbmiTMqTh7DNaR1rUWnMQAs9';

//Get authenticated
Codebird::setConsumerKey($CONSUMER_KEY, $CONSUMER_SECRET);
$cb = Codebird::getInstance();
$cb->setToken($ACCESS_TOKEN, $ACCESS_TOKEN_SECRET);


//retrieve posts
$q = $_POST['q'];
$count = $_POST['count'];
$api = $_POST['api'];

//https://dev.twitter.com/docs/api/1.1/get/statuses/user_timeline
//https://dev.twitter.com/docs/api/1.1/get/search/tweets
$params = array(
	'screen_name' => $q,
	'q' => $q,
	'count' => $count
);

//Make the REST call
$data = (array) $cb->$api($params);

//Output result in JSON, getting it ready for jQuery to process
echo json_encode($data);

?>