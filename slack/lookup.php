<?php
	header('Content-Type: application/json');
	$token = $_POST['token'];
	if($token!="K2KyMoRldGfL7S5eFLGfwbP0"){
		die("");
	}
	$text = $_POST['text'];
	if(!isset($text)||$text==""||strpos($text, ' ') !== false){
		echo "Whoops, you made a typo! Just do /lookup [Username/UUID]";
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
		$qry="SELECT uuid,username,rank,ipAddress,lastseen,balance,tokens from player_data WHERE username=\"" . $text . "\";";
	}else{
 		$qry="SELECT uuid,username,rank,ipAddress,lastseen,balance,tokens from player_data WHERE uuid=\"" . $text . "\";";
	}
	$res=mysql_query($qry);
	if(!$res){
		echo "No Player Data has been found for that Player!";
		die("");
	}
    $c = 0;
    $bal = 0;
    $rank = "";
    $rcolor = "";
    $ls = "";
    $token = 0;
	while ($row = mysql_fetch_array($res)) {
        $c = 1;
		$name = $row['username'];
		$uuid = $row['uuid'];
		$rank = "Guest";
		$rcolor = "#00AAAA";
		switch($row['rank']){
			case "owner":
				$rank = "Owner";
				$rcolor = "#FFAA00";
				break;
			case "mayor":
				$rank = "Mayor";
				$rcolor = "#FFAA00";
				break;
			case "manager":
				$rank = "Manager";
				$rcolor = "#FFAA00";
				break;
			case "developer":
				$rank = "Developer";
				$rcolor = "#FFAA00";
				break;
			case "coordinator":
				$rank = "Coordinator";
				$rcolor = "#55FF55";
				break;
			case "castmember":
				$rank = "Cast Member";
				$rcolor = "#55FF55";
				break;
			case "intern":
				$rank = "Intern";
				$rcolor = "#00AA00";
				break;
			case "character":
				$rank = "Character";
				$rcolor = "#5555FF";
				break;
			case "characterguest":
				$rank = "Character (Guest)";
				$rcolor = "#55FFFF";
				break;
			case "specialguest":
				$rank = "Special Guest";
				$rcolor = "#AA00AA";
				break;
			case "mcprohosting":
				$rank = "MCProHosting";
				$rcolor = "#FF5555";
				break;
			case "minedisney":
				$rank = "MineDisney";
				$rcolor = "#AA00AA";
				break;
			case "magicaldreams":
				$rank = "MagicalDreams";
				$rcolor = "#AA00AA";
				break;
			case "craftventure":
				$rank = "Craftventure";
				$rcolor = "#AA00AA";
				break;
			case "adventureridge":
				$rank = "AdventureRidge";
				$rcolor = "#AA00AA";
				break;
			case "anchornetwork":
				$rank = "AnchorNetwork";
				$rcolor = "#AA00AA";
				break;
			case "shareholder":
				$rank = "Shareholder";
				$rcolor = "#FF55FF";
				break;
			case "dvc":
				$rank = "DVC";
				$rcolor = "#55FFFF";
				break;
		}
		$ip = $row['ipAddress'];
		$diff = abs(time() - strtotime($row['lastseen']));
		$years = floor($diff / (365*60*60*24));
		$months = floor(($diff - $years * 365*60*60*24) / (30*60*60*24));
		$days = floor(($diff - $years * 365*60*60*24 - $months*30*60*60*24)/ (60*60*24));
		$hours = floor(($diff - $years * 365*60*60*24 - $months*30*60*60*24 - $days*60*60*24)/ (60*60));
		$minutes = floor(($diff - $years * 365*60*60*24 - $months*30*60*60*24 - $days*60*60*24 - $hours*60*60)/ 60);
		$ls = ($years>0?($years . " Years "):"") . ($months>0?($months . " Months "):"") . ($days>0?($days . " Days "):"") . ($hours>0?($hours . " Hours "):"") . ($minutes>0?($minutes . " Minutes "):"");
        $bal = $row['balance'];
        $token = $row['tokens'];
		break;
	}
	if($c!=1){
		echo "No Player Data has been found for that Player!";
        die("");
	}
    $qry = "SELECT COUNT(*) FROM banned_players WHERE uuid=\"" . $uuid . "\"";
    $res = mysql_query($qry);
    if(!$res){
        echo "No Player Data has been found for that Player!";
        die("");
    }
    $c = 0;
    $bcou = 0;
    while ($row = mysql_fetch_array($res)) {
        $bcou = $row['COUNT(*)'];
        break;
    }
    $qry = "SELECT COUNT(*) FROM muted_players WHERE uuid=\"" . $uuid . "\"";
    $res = mysql_query($qry);
    if(!$res){
        echo "No Player Data has been found for that Player!";
        die("");
    }
    $c = 0;
    $mcou = 0;
    while ($row = mysql_fetch_array($res)) {
        $mcou = $row['COUNT(*)'];
        break;
    }
    $qry = "SELECT COUNT(*) FROM kicks WHERE uuid=\"" . $uuid . "\"";
    $res = mysql_query($qry);
    if(!$res){
        echo "No Player Data has been found for that Player!";
        die("");
    }
    $c = 0;
    $kcou = 0;
    while ($row = mysql_fetch_array($res)) {
        $kcou = $row['COUNT(*)'];
        break;
    }
    if($bcou > 0){
        if($bcou > 2){
            $bcolor = "danger";
        }else{
            $bcolor = "warning";
        }
    }else{
        $bcolor = "good";
    }
    if($mcou > 0){
        if($mcou > 3){
            $mcolor = "danger";
        }else{
            $mcolor = "warning";
        }
    }else{
        $mcolor = "good";
    }
    if($kcou > 0){
        if($kcou > 2){
            $kcolor = "danger";
        }else{
            $kcolor = "warning";
        }
    }else{
        $kcolor = "good";
    }
    if($bcou == 0){
        $bcou = "No";
    }
    if($mcou == 0){
        $mcou = "No";
    }
    if($kcou == 0){
        $kcou = "No";
    }
    $resp = array(
		"text" => "Player Lookup for " . $name,
		"response_type" => "ephemeral",
		"attachments" => array(
            array(
                "title" => "Rank",
                "text" => $rank,
				"color" => $rcolor
            ),
			array(
				"title" => "IP Address",
				"text" => $ip,
				"color" => "good"
			),
			array(
				"title" => "Last Seen",
				"text" => $ls,
				"color" => "good"
			),
			array(
				"title" => "Economy",
				"text" => "$" . $bal . "\n" . $token . " Tokens",
				"color" => "good"
			),
            array(
                "title" => "Bans",
                "text" => $bcou . " bans",
                "color" => $bcolor
            ),
            array(
                "title" => "Mutes",
                "text" => $mcou . " mutes",
                "color" => $mcolor
            ),
            array(
                "title" => "Kicks",
                "text" => $kcou . " kicks",
                "color" => $kcolor
            )
        )
    );
	echo json_encode($resp);
?>
