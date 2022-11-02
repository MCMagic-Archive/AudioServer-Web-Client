<?php
$link = mysql_connect("mcmagic2", "root", "MCgek5eMsLAH34MJ");
if(!$link) {
        die('Failed to connect to server: ' . mysql_error());
}
$db = mysql_select_db("MainServer");
if(!$db) {
        die("Unable to select database");
}
$uuids = array();
$res = mysql_query("SELECT uuid FROM player_data limit 0,600");
if($res){
        while ($row = mysql_fetch_array($res)){
                array_push($uuids, $row['uuid']);
        }
}
$namemap = array();
foreach ($uuids as $uuid){
        $username = "";
        $json = file_get_contents("https://api.mojang.com/user/profiles/" . str_replace('-','',$uuid) . "/names");
        $data = json_decode($json);
        $username = end($data)->{'name'};
        $namemap[$uuid] = $username;
}
foreach ($uuids as $uuid){
	echo $uuid . ' ' . $namemap[$uuid] . '<br>';
}
