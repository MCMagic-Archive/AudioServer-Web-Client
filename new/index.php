<!DOCTYPE HTML>
<html>
<?php
if(false){
	header("Location: https://mcmagic.us");
	exit();
}
function get_client_ip() {
    $ipaddress = '';
    if (getenv('HTTP_CLIENT_IP')){
        $ipaddress = getenv('HTTP_CLIENT_IP');
    }else if(getenv('HTTP_X_FORWARDED_FOR')){
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    }else if(getenv('HTTP_X_FORWARDED')){
        $ipaddress = getenv('HTTP_X_FORWARDED');
    }else if(getenv('HTTP_FORWARDED_FOR')){
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    }else if(getenv('HTTP_FORWARDED')){
        $ipaddress = getenv('HTTP_FORWARDED');
    }else if(getenv('REMOTE_ADDR')){
        $ipaddress = getenv('REMOTE_ADDR');
    }else{
        $ipaddress = 'UNKNOWN';
    }
    return $ipaddress;
}
    function random_pic() {
        $files = glob('/var/www/audio/backgrounds/*.png');
        $file = array_rand($files);
        $f = explode("/", $files[$file]);
        return $f[5];
    }
    $background = "https://i.imgur.com/1vlvMck.png";
    $background = "http://audio.mcmagic.us/backgrounds/" . random_pic();
?>

    <head>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
        <link rel="apple-touch-icon" sizes="57x57" href="https://mcmagic.us/ico/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="https://mcmagic.us/ico/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="https://mcmagic.us/ico/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="https://mcmagic.us/ico/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="https://mcmagic.us/ico/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="https://mcmagic.us/ico/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="https://mcmagic.us/ico/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="https://mcmagic.us/ico/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="https://mcmagic.us/ico/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192" href="https://mcmagic.us/ico/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="https://mcmagic.us/ico/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="https://mcmagic.us/ico/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="https://mcmagic.us/ico/favicon-16x16.png">
        <link href='https://fonts.googleapis.com/css?family=Alegreya+Sans:400,700|Roboto:400,700' rel='stylesheet' type='text/css'>
        <script type="text/javascript" src="https://code.jquery.com/jquery-latest.min.js"></script>
        <script src="https://www.youtube.com/iframe_api" type="text/javascript"></script>
        <script type="text/javascript" src="js/HackTimer.js"></script>
        <style>
            html, body{
                background-image: url("<?php echo $background; ?>");
            }
        </style>
        <link rel="stylesheet" type="text/css" href="style.css" />
        <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
        <title>MCMagic Audio Server</title>
        <script type="text/javascript">
            var asusername = "<?php echo $_GET['username']?>";
            var asauth = "<?php echo $_GET['auth']?>";
            var AUDIOSERVER_FLAGS = 0;
        </script>
        <script src="serverv17.js"></script>
    </head>

    <body>
        <nav id="topbar" class="shadowBox">
            <div>
                <span class="pageTitle parentTitle"><img src="logo.png" style="display: block; margin-left: auto; margin-right: auto;" alt="MCMagic Logo"></span>
            </div>
        </nav>
        <div id="loginModal" class="modalBox">
            <div class="modalBoxContentHolder shadowBox">
                <span class="title">Login to the Audio Server</span>

                <div class="modalBoxButtons">
                    <button id="loginCancel" class="buttonCancel">Cancel</button>
                    <button id="loginOk" class="buttonOk">Ok</button>
                </div>
            </div>
        </div>

        <div id="connectingModal" class="modalBox">
            <div class="modalBoxContentHolder shadowBox">
                <span class="title">Connecting to the server...</span>

                <div class="modelBoxContent">
                    <ul class="modelBoxChecklist">
                        <li id="clConnected">Connected</li>
                        <li id="clAuthenticated">Authenticated</li>
                    </ul>
                    <div class="spinner">
                        <div></div>
                    </div>
                </div>

                <div class="modalBoxButtons"></div>
            </div>
        </div>

        <div id="disconnectedModal" class="modalBox error">
            <div class="modalBoxContentHolder shadowBox">
                <span class="title">Disconnected</span>

                <div class="modelBoxContent">
                    <p id="disconnectReason"></p>
                </div>
            </div>
        </div>
        <section id="content">
            <section class="card">
		<noscript>
		    <b style="color:red">For the Audio Server to function properly, it is necessary to enable JavaScript. Here are <a href="http://www.enable-javascript.com/" target="_blank"> instructions how to enable JavaScript in your web browser</a>.</b>
		</noscript>
                <div id="welcome" class="invisible">
                    <h1>Welcome!</h1>
                    <p>This is MCMagic's newest feature, the Audio Server! Rather than spending so much time downloading huge Resource Packs, the Audio Server allows you to hear the same music <i>(and more!)</i> with no downloads required. This has been in development for a long time and we are very excited to finally bring it to you! If you have any issues with the Audio Server, please contact a Cast Member. They'll be happy to help!</p>
                </div>
            </section>
            <section id="volumeControl" class="card invisible">
                <div id="volumeholder">
                    <?php
        	$vol = $_COOKIE['volume'];
        	if(!isset($vol) || $vol == ""){
        		$vol = 50;
        	}
        ?>
                        <input id="volumeslider" type="range" min="0" max="100" value=<?php echo "\"" . $vol . "\"";?> step="1" onchange="AudioManager.updateVolumeFromSlider()">
                        <br/>Volume:
                        <output id="volumevalue">
                            <?php echo $vol;?>
                        </output>
                        %
                </div>
            </section>
	    <script>
                document.getElementById("welcome").className="";
		document.getElementById("volumeControl").className="card";
            </script>
            <section id="important" class="card wmedium hmedium invisible">
                <div>
                    <h1>Important:</h1>
                    <p>If you are having issues with the Audio Server, we recommend using the browser <a href="https://www.google.com/chrome/" target="_blank">Google Chrome.</a></p>
                </div>
            </section>
        </section>
    </body>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-65888998-1', 'auto');
  ga('send', 'pageview');

</script>
</html>
