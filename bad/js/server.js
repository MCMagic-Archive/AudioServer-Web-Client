var zIndex = 1000;
var durationLength = 300;
var ModalHelper = {};
ModalHelper.open = function(selector) {
    var modal = $(selector);
    modal.show();
    modal.fadeTo(durationLength, 1);
    modal.css("z-index", "" + zIndex);
    var holder = modal.children(".modalBoxContentHolder");
    holder.css("top", "80px");
    handleModal(modal.attr("id"), true, modal);
    zIndex++;
};
ModalHelper.close = function(selector) {
    var modal = $(selector);
    var holder = modal.children(".modalBoxContentHolder");
    holder.css("top", "-" + holder.outerHeight() + 10 + "px");
    modal.fadeTo(durationLength, 0, function() {
        modal.hide();
    });
    handleModal(modal.attr("id"), false, modal);
};
ModalHelper.closeAll = function() {
    var modal = $(".modalBox");
    modal.children(".modalBoxContentHolder").each(function() {
        $(this).css("top", "-" + $(this).outerHeight() + 10 + "px");
    });
    modal.css("opacity", 0);
    modal.hide();
    modal.each(function() {
        var newModal = $(this);
        handleModal(newModal.attr("id"), false, newModal);
    });
};

function handleModal(name, isOpening, object) {
    console.log(isOpening + " " + name);
    if (name == "connectingModal") {
        if (!isOpening) {
            object.find(".checked").removeClass("checked");
        }
    }
}

function stringContains(input, find) {
    return (input.indexOf(find) >= 0);
}
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = typeof InstallTrigger !== 'undefined';
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isChrome = !!window.chrome && !isOpera;
var isIE = false || !!document.documentMode;
var AUDIO_SOURCE = {
    MP3: {
        value: 0,
        name: "MP3"
    },
    YOUTUBE: {
        value: 1,
        name: "YouTube"
    },
    SOUNDCLOUD: {
        value: 2,
        name: "SoundCloud"
    }
};
var AudioManager = {};
AudioManager._tabActive = true;
AudioManager._volume = 0.5;
AudioManager._areas = [];
AudioManager._fadeSteps = 10;
AudioManager._extension = (isIE || isSafari) ? ".mp3" : ".ogg";
AudioManager._folder_prefix = (isIE || isSafari) ? "mp3/" : "ogg/";
AudioManager.locateFile = function(name) {
    return "audio/" + AudioManager._folder_prefix + name + AudioManager._extension;
};
AudioManager.updateVolumesTask = setInterval(function() {
    for (var currentArea in AudioManager._areas) {
        AudioManager._areas[currentArea].updateVolume();
    }
}, 1000 / AudioManager._fadeSteps);
AudioManager.cleanup = function() {
    AudioManager._areas = [];
    $("audio").remove();
    $("iframe").remove();
};
AudioManager.syncAudio = function(audioid, seconds, margin) {
    var area = AudioManager.getAreaByID(audioid);
    if (area != null)
        if (margin !== undefined && margin != 0)
            area.seekMargin(seconds, margin);
        else
            area.seek(seconds);
};
AudioManager.updateVolumeFromSlider = function() {
    AudioManager.updateVolume($("#volumeslider").val());
};
AudioManager.updateVolume = function(volume) {
    var slider = $("#volumeslider");
    slider.css("background", '-webkit-gradient(' + 'linear, ' + 'left top, ' + 'right top, ' + 'color-stop(' + volume / 100 + ', #aba19e), ' + 'color-stop(' + volume / 100 + ', #191919)' + ')');
    slider.css("background", '-moz-gradient(' + 'linear, ' + 'left top, ' + 'right top, ' + 'color-stop(' + volume / 100 + ', #aba19e), ' + 'color-stop(' + volume / 100 + ', #191919)' + ')');
    $("#volumevalue").val(volume);
    AudioManager._volume = volume / 100;
    for (var currentArea in AudioManager._areas)
        AudioManager._areas[currentArea].updateVolumeInstant();
};
AudioManager.getAreaByID = function(id) {
    if (this._areas[id] !== undefined && this._areas[id] != null)
        return this._areas[id];
    return null;
};
AudioManager.removeAreaByID = function(id) {
    this._areas[id] = null;
    return this;
};
AudioManager.startArea = function(audioid, source, volume, fadetime, repeat) {
    var area = AudioManager.getAreaByID(audioid);
    if (area != null) {
        area.setTargetVolume(volume, fadetime);
        area.setRepeat(repeat);
        area.play();
    } else {
        area = new AudioPlayback(audioid, source, volume, fadetime, repeat);
        area.play();
    }
};
AudioManager.stopArea = function(audioid, fadetime) {
    var area = AudioManager.getAreaByID(audioid);
    if (area != null) {
        area.setTargetVolume(0, fadetime);
    }
};
var AudioPlayback = function(id, source, volume, fadetime, repeat) {
    {
        var thisRef = this;
        this._ytplayer = null;
        this._audioelement = null;
        this.id = id;
        this.sourceprovider = AUDIO_SOURCE.MP3;
        this.targetvolume = volume;
        this.fadetime = fadetime;
        this.repeat = repeat;
        this.playing = true;
        if (stringContains(source, "soundcloud"))
            this.sourceprovider = AUDIO_SOURCE.SOUNDCLOUD;
        else if (stringContains(source, "v="))
            this.sourceprovider = AUDIO_SOURCE.YOUTUBE;
        if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE) {
            var audiodiv = $("<div></div>").attr({
                'id': "audio_" + id,
                'class': 'nothingtoseehere'
            });
            audiodiv.appendTo("body");
            this._ytplayer = new YT.Player("audio_" + id, {
                height: '200',
                width: '200',
                videoId: source.replace("v=", ""),
                events: {
                    'onReady': function(event) {
                        var player = event.target;
                        player.setPlaybackQuality("small");
                        if (thisRef.playing)
                            player.playVideo();
                        else
                            player.pauseVideo();
                        player.unMute();
                        player.setVolume(0);
                    },
                    'onStateChange': function(event) {
                        var player = event.target;
                        if (event.data == YT.PlayerState.ENDED) {
                            if (thisRef.repeat) {
                                player.seekTo(0, true);
                                player.playVideo();
                            }
                            thisRef.onStop();
                        }
                    }
                }
            });
        } else {
            var resolvedSource = (this.sourceprovider == AUDIO_SOURCE.SOUNDCLOUD || source.indexOf(":") >= 0) ? source : AudioManager.locateFile(source);
            console.log(resolvedSource);
            var audio = $("<audio></audio>").attr({
                'src': resolvedSource,
                'id': "audio_" + id
            });
            if (repeat == true)
                audio.attr({
                    'loop': 'loop'
                });
            audio.get(0).volume = 0;
            audio.bind("canplaythrough", function() {
                if (thisRef.playing)
                    audio.get(0).play();
            });
            audio.bind("ended", function() {
                thisRef.onStop();
            });
            audio.bind("error", function() {
                audio.remove();
            });
            audio.appendTo("body");
            this._audioelement = audio;
        }
        AudioManager._areas[id] = this;
    }
    this.seek = function(seconds) {
        try {
            if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE)
                this._ytplayer.seekTo(seconds, true);
            else
                this._audioelement.get(0).currentTime = seconds;
        } catch (e) {}
    };
    this.seekMargin = function(seconds, margin) {
        try {
            if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE)
                if (this._ytplayer.getCurrentTime() < seconds - margin || this._ytplayer.getCurrentTime() > seconds + margin) {
                    this._ytplayer.seekTo(seconds, true);
                    console.log("Area " + this.id + ": Time = " + this._ytplayer.getCurrentTime() + " while syncing to " + seconds + " with a margin of " + margin + "(" + (seconds - margin) + " to " + (seconds + margin) + ")");
                } else
            if (this._audioelement.get(0).currentTime < seconds - margin || this._audioelement.get(0).currentTime > seconds + margin) {
                this._audioelement.get(0).currentTime = seconds;
                console.log("Area " + this.id + ": Time = " + this._audioelement.get(0).currentTime + " while syncing to " + seconds + " with a margin of " + margin + "(" + (seconds - margin) + " to " + (seconds + margin) + ")");
            }
        } catch (e) {}
    };
    this.updateVolumeInstant = function() {
        try {
            var newVolume = (this.targetvolume * AudioManager._volume);
            if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE)
                this._ytplayer.setVolume(newVolume * 100);
            else
                this._audioelement.get(0).volume = newVolume;
        } catch (e) {}
    };
    this.updateVolume = function() {
        if (!AudioManager._tabActive) {
            this.updateVolumeInstant();
            return;
        }
        try {
            var newVolume = (this.targetvolume * AudioManager._volume);
            var volumeDelta = (1000 / AudioManager._fadeSteps) / this.fadetime;
            var curVolume = -1;
            if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE)
                curVolume = this._ytplayer.getVolume() / 100;
            else
                curVolume = this._audioelement.get(0).volume;
            if (curVolume >= 0 && curVolume != newVolume) {
                var changedVolume = -1;
                if (newVolume != curVolume) {
                    if (newVolume > curVolume) {
                        if (curVolume + volumeDelta > newVolume) {
                            changedVolume = newVolume;
                        } else {
                            changedVolume = curVolume + volumeDelta;
                        }
                    } else {
                        if (curVolume - volumeDelta < newVolume) {
                            changedVolume = newVolume;
                        } else {
                            changedVolume = curVolume - volumeDelta;
                        }
                    }
                }
                if (changedVolume >= 0) {
                    if (changedVolume > 1)
                        changedVolume = 1;
                    else if (changedVolume < 0)
                        changedVolume = 0;
                    if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE)
                        this._ytplayer.setVolume(changedVolume * 100);
                    else
                        this._audioelement.get(0).volume = changedVolume;
                }
            }
        } catch (e) {}
    };
    this.getVolume = function() {
        if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE) {
            return this._ytplayer.getVolume();
        } else {
            return this._audioelement.get(0).volume;
        }
    };
    this.setRepeat = function(repeat) {
        this.repeat = repeat;
        if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE) {} else {
            if (this.repeat)
                this._audioelement.attr({
                    'loop': 'loop'
                });
            else
                this._audioelement.removeAttr('loop');
        }
    };
    this.setTargetVolume = function(volume, fadetime) {
        this.targetvolume = volume;
        this.fadetime = fadetime;
    };
    this.pause = function() {
        this.playing = false;
        try {
            if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE)
                this._ytplayer.pauseVideo();
            else
                this._audioelement.get(0).pause();
        } catch (e) {}
    };
    this.play = function() {
        try {
            this.playing = true;
            if (this.sourceprovider == AUDIO_SOURCE.YOUTUBE)
                this._ytplayer.playVideo();
            else
                this._audioelement.get(0).play();
        } catch (e) {}
    };
    this.onStop = function() {};
};
AudioManager.setMaximumVolume = function(volume) {};
AudioManager.fadeTo = function(audioelement, volumeto, fadetime) {};
AudioManager.playOnce = function(audioid, source, volume) {
    var area = AudioManager.getAreaByID(audioid);
    if (area != null) {
        area.setTargetVolume(volume, 0);
        area.setRepeat(false);
        area.play();
    } else {
        area = new AudioPlayback(audioid, source, volume, 0, false);
        area.play();
    }
    area.onStop = function() {
        $("#audio_" + area.id).remove();
        delete AudioManager._areas[area.id];
    }
};
var PacketID = {
    HEARTBEAT: 0,
    LOGIN: 1,
    KICK: 2,
    GLOBAL_PLAY_ONCE: 3,
    AREA_START: 4,
    AREA_STOP: 5,
    CLIENT_ACCEPTED: 6,
    AUDIO_SYNC: 7,
    NOTIFICATION: 8,
    EXEC_SCRIPT: 9,
    COMPUTER_SPEAK: 10,
    WARP: 11,
    SERVER_SWITCH: 12
};
var Packets = {};
Packets.protocolVersion = 8;
Packets.Login = function() {
    this.version = Packets.protocolVersion;
    this.playername = "";
    this.auth = "";
    this.set = function(playername, auth) {
        this.playername = playername;
        this.auth = auth;
        return this;
    };
    this.fromObject = function(obj) {
        this.playername = obj.playername;
        this.auth = obj.auth;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.LOGIN,
            version: this.version,
            playername: this.playername,
            auth: this.auth
        });
    };
};
Packets.Kick = function() {
    this.message = "";
    this.reason = "";
    this.set = function(message, reason) {
        this.message = message;
        this.reason = reason;
        return this;
    };
    this.fromObject = function(obj) {
        this.message = obj.message;
        this.reason = obj.reason;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.KICK,
            message: this.message,
            reason: this.reason
        });
    };
};
Packets.GlobalAudioPlayOnce = function() {
    this.audioid = "";
    this.name = "";
    this.volume = 1.0;
    this.set = function(audioid, name) {
        this.audioid = audioid;
        this.name = name;
        return this;
    };
    this.fromObject = function(obj) {
        this.audioid = obj.audioid;
        this.name = obj.name;
        this.volume = obj.volume;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.GLOBAL_PLAY_ONCE,
            audioid: this.audioid,
            file: this.file
        });
    };
};
Packets.AreaStart = function() {
    this.audioid = "";
    this.name = "";
    this.fadetime = 0;
    this.volume = 1.0;
    this.repeat = true;
    this.set = function(audioid, name, fadetime, volume, repeat) {
        this.audioid = audioid;
        this.name = name;
        this.fadetime = fadetime;
        this.volume = volume;
        this.repeat = repeat;
        return this;
    };
    this.fromObject = function(obj) {
        this.audioid = obj.audioid;
        this.name = obj.name;
        this.fadetime = obj.fadetime;
        this.volume = obj.volume;
        this.repeat = obj.repeat;
        return this;
    };
};
Packets.AreaStop = function() {
    this.audioid = "";
    this.fadetime = 0;
    this.set = function(audioid, fadetime) {
        this.audioid = audioid;
        this.fadetime = fadetime;
        return this;
    };
    this.fromObject = function(obj) {
        this.audioid = obj.audioid;
        this.fadetime = obj.fadetime;
        return this;
    };
};
Packets.ClientAccepted = function() {
    this.servername = "";
    this.set = function(servername) {
        this.servername = servername;
        return this;
    };
    this.fromObject = function(obj) {
        this.servername = obj.servername;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.CLIENT_ACCEPTED,
            servername: this.servername
        });
    };
};
Packets.AudioSync = function() {
    this.audioid = "";
    this.seconds = 1.0;
    this.margin = 0;
    this.set = function(audioid, seconds, margin) {
        this.audioid = audioid;
        this.seconds = seconds;
        this.margin = margin;
        return this;
    };
    this.fromObject = function(obj) {
        this.audioid = obj.audioid;
        this.seconds = obj.seconds;
        this.margin = obj.margin;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.AUDIO_SYNC,
            seconds: this.seconds,
            margin: this.margin
        });
    };
};
Packets.Notification = function() {
    this.text = "";
    this.body = 1.0;
    this.icon = null;
    this.display = function() {
        log("-----------------------------");
        log("Displaying notification from Packet");
        log("Text: " + this.text);
        log("Body: " + this.body);
        log("-----------------------------");
        Notif.display(this.text, this.body, this.icon);
    };
    this.set = function(text, body, icon) {
        this.text = text;
        this.body = body;
        this.icon = icon;
        return this;
    };
    this.fromObject = function(obj) {
        this.text = obj.text;
        this.body = obj.body;
        this.icon = obj.icon;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.NOTIFICATION,
            text: this.text,
            body: this.body
        });
    };
};
Packets.ExecScript = function() {
    this.script = "";
    this.execute = function() {
        log("-----------------------------");
        log("Executing commands received by the server");
        eval(this.script);
        log("-----------------------------");
    };
    this.set = function(script) {
        this.script = script;
        return this;
    };
    this.fromObject = function(obj) {
        this.script = obj.script;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.EXEC_SCRIPT,
            script: this.script
        });
    };
};
Packets.ComputerSpeak = function() {
    this.voicetext = "";
    this.execute = function() {
        log("Speaking [" + this.voicetext + "]");
        try {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(this.voicetext));
        } catch (e) {
            log("Error occured while trying speech");
            log(e);
        }
    };
    this.set = function(voicetext) {
        this.voicetext = voicetext;
        return this;
    };
    this.fromObject = function(obj) {
        this.voicetext = obj.voicetext;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.COMPUTER_SPEAK,
            voicetext: this.voicetext
        });
    };
};
Packets.WarpRequest = function() {
    this.warp = "";
    this.set = function(warp) {
        this.warp = warp;
        return this;
    };
    this.fromObject = function(obj) {
        this.warp = obj.warp;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.WARP,
            warp: this.warp
        });
    };
};
Packets.ServerSwitch = function() {
    this.servername = "";
    this.set = function(servername) {
        this.servername = servername;
        return this;
    };
    this.fromObject = function(obj) {
        this.servername = obj.servername;
        return this;
    };
    this.asJSON = function() {
        return JSON.stringify({
            id: PacketID.SERVER_SWITCH,
            servername: this.servername
        });
    };
};

function parseUri(str) {
    var o = parseUri.options,
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i = 14;
    while (i--) uri[o.key[i]] = m[i] || "";
    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });
    return uri;
};
parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};
var CONNECTION_LOST_MESSAGE = "Connection with the server was lost";
var port = 8887;
var ws = null;
var FlagBits = {
    AUTO_DEBUG: 0x2,
    DEBUG_POPUPS: 0x4
};
var Icons = {
    DEFAULT: {
        internalname: "default",
        icon: "http://craftventure.net/wp-content/uploads/2014/04/server-icon1.png"
    }
};

function warpTo(warpname) {
    if (ws != null)
        ws.send(new Packets.WarpRequest().set(warpname).asJSON());
}
var Notif = {};
Notif.display = function(title, body, icon) {};

function log(msg) {
    console.log(msg);
    var logDiv = $("#debuglog");
    logDiv.html(logDiv.html() + msg + "<br/>");
    logDiv.scrollTop(logDiv.prop('scrollHeight'));
}

function startConnecting() {
    if (ws != null) {
        return;
    }
    ModalHelper.open("#connectingModal");
    if ("WebSocket" in window) {
        var kicked = false;
        var serverAddress = "ws://play.craftventure.net:" + port;
        if (AUDIOSERVER_LOCAL) {
            serverAddress = "ws://127.0.0.1:" + port;
            log("Using local connection");
        }
        log("Connecting to " + serverAddress);
        ws = new WebSocket(serverAddress);
        ws.onopen = function() {
            console.log(new Packets.Login().set($("#username").val(), $("#authcode").val()).asJSON());
            ws.send(new Packets.Login().set($("#username").val(), $("#authcode").val()).asJSON());
            log("Connected!");
            $("#clConnected").addClass("checked");
        };
        ws.onmessage = function(evt) {
            try {
                var data = JSON.parse(evt.data);
                if (typeof(data.id) !== 'undefined') {
                    if (data.id == PacketID.KICK) {
                        kicked = true;
                        var packet = new Packets.Kick().fromObject(data);
                        log("Kicked for [" + packet.message + "]");
                        $("#disconnectReason").text(packet.message);
                        ws.close();
                    } else if (data.id == PacketID.GLOBAL_PLAY_ONCE) {
                        var packet = new Packets.GlobalAudioPlayOnce().fromObject(data);
                        AudioManager.playOnce(packet.audioid, packet.name, packet.volume);
                        log("Playing once " + packet.name);
                    } else if (data.id == PacketID.AREA_START) {
                        var packet = new Packets.AreaStart().fromObject(data);
                        AudioManager.startArea(packet.audioid, packet.name, packet.volume, packet.fadetime, packet.repeat);
                        log("Starting area " + packet.audioid + " (" + packet.name + ")");
                    } else if (data.id == PacketID.AREA_STOP) {
                        var packet = new Packets.AreaStop().fromObject(data);
                        AudioManager.stopArea(packet.audioid, packet.fadetime);
                        log("Stopping area " + packet.audioid);
                    } else if (data.id == PacketID.CLIENT_ACCEPTED) {
                        var packet = new Packets.ClientAccepted().fromObject(data);
                        $("#volumeholder").show();
                        $("#clAuthenticated").addClass("checked");
                        ModalHelper.close("#connectingModal");
                        log("Accepted at server " + packet.servername);
                    } else if (data.id == PacketID.AUDIO_SYNC) {
                        var packet = new Packets.AudioSync().fromObject(data);
                        AudioManager.syncAudio(packet.audioid, packet.seconds, packet.margin);
                        log("ID: " + packet.audioid + " Seconds: " + packet.seconds);
                    } else if (data.id == PacketID.NOTIFICATION) {
                        new Packets.Notification().fromObject(data).display();
                    } else if (data.id == PacketID.EXEC_SCRIPT) {
                        new Packets.ExecScript().fromObject(data).execute();
                    } else if (data.id == PacketID.COMPUTER_SPEAK) {
                        new Packets.ComputerSpeak().fromObject(data).execute();
                    } else if (data.id == PacketID.SERVER_SWITCH) {
                        AudioManager.cleanup();
                        log("Switched to server " + new Packets.ServerSwitch().fromObject(data).servername);
                    } else {
                        ws.close();
                        log("Unknown packet ID " + data.id);
                        throw "Unknown packet ID";
                    }
                } else {
                    ws.close();
                    log("Packet sent without ID: " + evt.data);
                    throw "Packet sent without ID";
                }
            } catch (err) {
                ws.close();
                log("An error occured: " + err + "<br/>The sent data was " + evt.data + ". Line number #" + err.lineNumber);
                $("#volumeholder").hide();
            }
        };
        ws.onerror = function(error) {
            console.log(error);
            log("WebSocket error: " + error.data);
        };
        ws.onclose = function() {
            log("Connection closed!");
            AudioManager.cleanup();
            if (!kicked) {
                $("#disconnectReason").text(CONNECTION_LOST_MESSAGE);
            }
            ws = null;
            ModalHelper.close("#connectingModal");
            ModalHelper.open("#disconnectedModal");
        };
    } else {
        log("Your browser doesn't support WebSockets.");
    }
}
$(document).ready(function() {
    AudioManager.updateVolume(50);
    $("#username").val(AUDIOSERVER_USERNAME);
    $("#authcode").val(AUDIOSERVER_AUTH);
    $("#debugbtn").click(function() {
        $("#debuglog").toggle();
    });
    $("#loginCancel").click(function() {
        window.location.href = "http://www.craftventure.net";
    });
    $("#loginOk").click(function() {
        ModalHelper.close("#loginModal");
        startConnecting();
    });
    $("#retryButton").click(function() {
        ModalHelper.closeAll();
        ModalHelper.open("#loginModal");
    });
    $("#volumeslider").mousemove(function(e) {
        AudioManager.updateVolume($(this).val());
    });
    $("#volumeslider").change(function(e) {
        AudioManager.updateVolume($(this).val());
    });
    $("#debuglog").click(function() {
        var el = $(this)[0];
        if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.select();
        }
    });
    if (AUDIOSERVER_USERNAME != "" && AUDIOSERVER_AUTH != null) {
        startConnecting();
    } else {
        ModalHelper.open("#loginModal");
    }
});
