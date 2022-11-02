<?php
	header('Content-Type: application/json');
	$token = $_POST['token'];
	if($token!="lypPWIhApucerz6YFqMZgEhH"){
		die("");
	}
	$text = $_POST['text'];
	if(!isset($text)||$text==""||strpos($text, ' ') !== false){
		echo "Whoops, you made a typo! Just do /mutes [Username/UUID]";
		die("");
	}
	$link = mysql_connect("db.mcmagic.us", "root", "cQr4qKQdkVQNFDrT");
	if(!$link) {
		echo "There was an error connecting to the database, try again later!";
		die("");
	}
	$db=mysql_select_db("MainServer");
	if(!$db){
		echo "There was an error connecting to the database, try again later!";
		die("");
	}
	$qry="";
	if(strlen($text)<20){
		$qry="SELECT uuid,username from player_data WHERE username=\"" . $text . "\";";
	}else{
 		$qry="SELECT uuid,username from player_data WHERE uuid=\"" . $text . "\";";
	}
	$res=mysql_query($qry);
	if(!$res){
		echo "No Player Data has been found for that Player! (Maybe you made a typo?)";
		die("");
	}
    $c = 0;
	while ($row = mysql_fetch_array($res)) {
        $c = 1;
		$name = $row['username'];
		$uuid = $row['uuid'];
		break;
	}
	if($c!=1){
		echo "No Player Data has been found for that Player!";
        die("");
	}
    $qry = "SELECT * FROM muted_players WHERE uuid=\"" . $uuid . "\" ORDER BY id DESC";
    $res = mysql_query($qry);
    if(!$res){
        echo "No Player Data has been found for that Player!";
        die("");
    }
    $attachments = array();
	while ($row = mysql_fetch_array($res)) {
        array_push($attachments, array(
            "title" => "Mute",
            "color" => "warning",
            "fields" => array(
                array(
                    "title" => "Reason",
                    "value" => $row['reason'],
                    "short" => true
                ),
                array(
                    "title" => "Source",
                    "value" => $row['source'],
                    "short" => true
                ),
                array(
                    "title" => "Active",
                    "value" => ($row['active'] == 1 ? "True" : "False"),
                    "short" => true
                ),
                array(
                    "title" => ($row['permanent'] == 0 ? "Release" : ($row['active'] == 1 ? "Created" : "Release")),
                    "value" => date('n-j-Y g:i:s A', strtotime($row['release'])),
                    "short" => true
                )
            )
        ));
    }
    if(empty($attachments)){
        echo "No mutes found for this player!";
        die("");
    }
    $resp = array(
		"text" => "Mute History for " . $name,
		"response_type" => "ephemeral",
		"attachments" => $attachments
    );
	echo json_encode($resp);
?>
