function getCookie(e) {
    for (var t = e + "=", i = document.cookie.split(";"), o = 0; o < i.length; o++) {
        for (var a = i[o];
            " " == a.charAt(0);) a = a.substring(1);
        if (0 == a.indexOf(t)) return a.substring(t.length, a.length)
    }
    return ""
}

function setCookie(e, t) {
    document.cookie = e + "=" + t + ";"
}

function handleModal(e, t, i) {
    log(t + " " + e), "connectingModal" == e && (t || i.find(".checked").removeClass("checked"))
}

function stringContains(e, t) {
    return e.indexOf(t) >= 0
}

function parseUri(e) {
    for (var t = parseUri.options, i = t.parser[t.strictMode ? "strict" : "loose"].exec(e), o = {}, a = 14; a--;) o[t.key[a]] = i[a] || "";
    return o[t.q.name] = {}, o[t.key[12]].replace(t.q.parser, function (e, i, a) {
        i && (o[t.q.name][i] = a)
    }), o
}

function warpTo(e) {
    null != ws && ws.send((new Packets.WarpRequest).set(e).asJSON())
}

function log(msg) {
    console.log(msg);
    var logDiv = $("#debuglog");
    logDiv.html(logDiv.html() + msg + "<br/>");
    logDiv.scrollTop(logDiv.prop('scrollHeight'));
}

function startConnecting() {
	log("Hey, you! We're always looking for some new developers, and you seem interested! Contact us at dev@mcmagic.us.");
    if (null == ws)
        if (ModalHelper.open("#connectingModal"), "WebSocket" in window) {
            var e = !1;
            var t = "ws://198.24.161.34:" + port;
            log("Connecting to " + t), ws = new WebSocket(t), ws.onopen = function () {
                isChrome || (document.getElementById("important").className = "card"), log((new Packets.Login).set(asusername, asauth).asJSON()), ws.send((new Packets.Login).set(asusername, asauth).asJSON()), log("Connected!"), $("#clConnected").addClass("checked")
            }, ws.onmessage = function (t) {
                try {
                    var i = JSON.parse(t.data);
                    if ("undefined" == typeof i.id) throw ws.close(), log("Packet sent without ID: " + t.data), "Packet sent without ID";
                    if (i.id == PacketID.KICK) {
                        ModalHelper.close("#connectingModal");
                        e = !0;
                        var o = (new Packets.Kick).fromObject(i);
                        log("Kicked for [" + o.message + "]");
                        $("#disconnectReason").text(o.message);
                        ws.close();
                        setTimeout(function () {
                            window.close();
                        }, 3000)
                    } else if (i.id == PacketID.GLOBAL_PLAY_ONCE) {
                        var o = (new Packets.GlobalAudioPlayOnce).fromObject(i);
                        AudioManager.playOnce(o.audioid, o.name, o.volume), AudioManager.syncAudio(o.audioid, 0, 0), log("Playing once " + o.name)
                    } else if (i.id == PacketID.AREA_START) {
                        var o = (new Packets.AreaStart).fromObject(i);
                        AudioManager.startArea(o.audioid, o.name, o.volume, o.fadetime, o.repeat), log("Starting area " + o.audioid + " (" + o.name + ")")
                    } else if (i.id == PacketID.AREA_STOP) {
                        var o = (new Packets.AreaStop).fromObject(i);
                        AudioManager.stopArea(o.audioid, o.fadetime), log("Stopping area " + o.audioid)
                    } else if (i.id == PacketID.CLIENT_ACCEPTED) {
                        var o = (new Packets.ClientAccepted).fromObject(i);
                        $("#volumeholder").show();
                        $("#clAuthenticated").addClass("checked");
                        ModalHelper.close("#connectingModal");
                        log("Accepted at server " + o.servername);
                        AudioManager.playOnce(-1, "connected", .2);
                    } else if (i.id == PacketID.AUDIO_SYNC) {
                        var o = (new Packets.AudioSync).fromObject(i);
                        AudioManager.syncAudio(o.audioid, o.seconds, o.margin), log("ID: " + o.audioid + " Seconds: " + o.seconds)
                    } else if (i.id == PacketID.NOTIFICATION)(new Packets.Notification).fromObject(i).display();
                    else if (i.id == PacketID.EXEC_SCRIPT)(new Packets.ExecScript).fromObject(i).execute();
                    else if (i.id == PacketID.COMPUTER_SPEAK)(new Packets.ComputerSpeak).fromObject(i).execute();
                    else {
                        if (i.id != PacketID.SERVER_SWITCH) throw ws.close(), log("Unknown packet ID " + i.id), "Unknown packet ID";
                        AudioManager.cleanup(), log("Switched to server " + (new Packets.ServerSwitch).fromObject(i).servername)
                    }
                } catch (a) {
                    ws.close(), log("An error occured: " + a + "<br/>The sent data was " + t.data + ". Line number #" + a.lineNumber), $("#volumeholder").hide()
                }
            }, ws.onerror = function (e) {
                log(e), log("WebSocket error: " + e.data)
            }, ws.onclose = function () {
                log("Connection closed!");
                AudioManager.cleanup();
                e || $("#disconnectReason").text(CONNECTION_LOST_MESSAGE);
                ws = null;
                ModalHelper.close("#connectingModal");
                ModalHelper.open("#disconnectedModal")
            }
        } else log("Your browser doesn't support WebSockets.")
}
var zIndex = 1e3,
    durationLength = 300,
    ModalHelper = {};
ModalHelper.open = function (e) {
    var t = $(e);
    t.show(), t.fadeTo(durationLength, 1), t.css("z-index", "" + zIndex);
    var i = t.children(".modalBoxContentHolder");
    i.css("top", "80px"), handleModal(t.attr("id"), !0, t), zIndex++
}, ModalHelper.close = function (e) {
    var t = $(e),
        i = t.children(".modalBoxContentHolder");
    i.css("top", "-" + i.outerHeight() + "10px"), t.fadeTo(durationLength, 0, function () {
        t.hide()
    }), handleModal(t.attr("id"), !1, t)
}, ModalHelper.closeAll = function () {
    var e = $(".modalBox");
    e.children(".modalBoxContentHolder").each(function () {
        $(this).css("top", "-" + $(this).outerHeight() + "10px")
    }), e.css("opacity", 0), e.hide(), e.each(function () {
        var e = $(this);
        handleModal(e.attr("id"), !1, e)
    })
};
var isOpera = !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0,
    isFirefox = "undefined" != typeof InstallTrigger,
    isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0,
    isChrome = !!window.chrome && !isOpera,
    isIE = !!document.documentMode,
    AUDIO_SOURCE = {
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
    },
    AudioManager = {};
AudioManager._tabActive = !0, AudioManager._volume = .5, AudioManager._areas = [], AudioManager._fadeSteps = 10, AudioManager._extension = isIE || isSafari ? ".mp3" : ".ogg", AudioManager._folder_prefix = isIE || isSafari ? "mp3/" : "ogg/", AudioManager.locateFile = function (e) {
    return "http://audio.mcmagic.us/files/" + AudioManager._folder_prefix + e + AudioManager._extension
}, AudioManager.updateVolumesTask = function () {
	/*setInterval(function () {
		for (var e in AudioManager._areas){
			var pb = AudioManager._areas[e];
			if(pb.hastask){
				continue;
			}
			pb.hastask = true;
			setInterval(function () {
				var prevol = pb._audioelement.get(0).volume;
				var vol = pb._audioelement.get(0).volume;
				var step = vol / (pb.fadetime / 10);
				if(pb.targetvolume > vol){
					vol += step;
				}else if(pb.targetvolume == 0){
					var step = vol / (pb.fadetime / 10);
					vol -= step;
				}else if(pb.targetvolume < vol){
					vol -= step;
				}
				if(prevol != vol){
					pb.updateVolumeInstant();
				}
				log(pb.id + " updated");
			}, pb.fadetime / 10);
		}
	}, 100);*/
}, AudioManager.cleanup = function () {
    AudioManager._areas = [], $("audio").remove(), $("iframe").remove()
}, AudioManager.syncAudio = function (e, t, i) {
    var o = AudioManager.getAreaByID(e);
    null != o && (void 0 !== i && 0 != i ? o.seekMargin(t, i) : o.seek(t))
}, AudioManager.updateVolumeFromSlider = function () {
    AudioManager.updateVolume($("#volumeslider").val())
}, AudioManager.updateVolume = function (e) {
    var t = $("#volumeslider");
    t.css("background", "-webkit-gradient(linear, left top, right top, color-stop(" + e / 100 + ", #aba19e), color-stop(" + e / 100 + ", #191919))"), t.css("background", "-moz-gradient(linear, left top, right top, color-stop(" + e / 100 + ", #aba19e), color-stop(" + e / 100 + ", #191919))"), $("#volumevalue").val(e), AudioManager._volume = e / 100;
    for (var i in AudioManager._areas) AudioManager._areas[i].updateVolumeInstant()
}, AudioManager.getAreaByID = function (e) {
    return void 0 !== this._areas[e] && null != this._areas[e] ? this._areas[e] : null
}, AudioManager.removeAreaByID = function (e) {
    return this._areas[e] = null, this
}, AudioManager.startArea = function (e, t, i, o, a) {
    var n = AudioManager.getAreaByID(e);
    null != n ? (n.setTargetVolume(i, o), n.setRepeat(a), n.play()) : (n = new AudioPlayback(e, t, i, o, a), n.play());
    var sound = document.getElementById("audio_" + e);
    var target = i * AudioManager._volume;
    var time = o * .01;
    var step = target * .01;
    log(target + " " + time + " " + step);
    var done = false;
    var fadeAudio = setInterval(function () {
    	if(sound.volume + step >= target){
    		sound.volume = target;
    	}else{
        	sound.volume += step;
        }
        if (sound.volume >= target) {
            clearInterval(fadeAudio);
        }
    }, time);
}, AudioManager.stopArea = function (e, t) {
    var i = AudioManager.getAreaByID(e);
    null != i && i.setTargetVolume(0, t);
    var sound = document.getElementById("audio_" + e);
    if(sound == null){
    	return;
    }
    var target = 0;
    var time = t * .01;
    var step = sound.volume * .01;
    log(target + " " + time + " " + step);
    var fadeAudio = setInterval(function () {
    	if(sound.volume - step <= target){
    		sound.volume = target;
    	}else{
        	sound.volume -= step;
        }
        if (sound.volume <= target) {
            clearInterval(fadeAudio);
        }
    }, time);
};
var AudioPlayback = function (e, t, i, o, a) {
    var n = this;
    var hastask = false;
    if (this._ytplayer = null, this._audioelement = null, this.id = e, this.sourceprovider = AUDIO_SOURCE.MP3, this.targetvolume = i, this.fadetime = o, this.repeat = a, this.playing = !0, this.startTime = (new Date).getTime(), stringContains(t, "soundcloud") ? this.sourceprovider = AUDIO_SOURCE.SOUNDCLOUD : stringContains(t, "v=") && (this.sourceprovider = AUDIO_SOURCE.YOUTUBE), this.sourceprovider == AUDIO_SOURCE.YOUTUBE) {
        var s = $("<div></div>").attr({
            id: "audio_" + e,
            "class": "nothingtoseehere"
        });
        s.appendTo("body"), this._ytplayer = new YT.Player("audio_" + e, {
            height: "200",
            width: "200",
            videoId: t.replace("v=", ""),
            events: {
                onReady: function (e) {
                    var t = e.target;
                    t.setPlaybackQuality("small"), n.playing ? t.playVideo() : t.pauseVideo(), t.unMute(), t.setVolume(0)
                },
                onStateChange: function (e) {
                    var t = e.target;
                    e.data == YT.PlayerState.ENDED && (n.repeat && (t.seekTo(0, !0), t.playVideo()), n.onStop())
                }
            }
        })
    } else {
        var r = this.sourceprovider == AUDIO_SOURCE.SOUNDCLOUD || t.indexOf(":") >= 0 ? t : AudioManager.locateFile(t);
        log(r);
        var u = $("<audio></audio>").attr({
            src: r,
            id: "audio_" + e
        });
        1 == a && u.attr({
            loop: "loop"
        }), u.get(0).volume = 0, u.bind("canplaythrough", function () {
            n.playing && u.get(0).play()
        }), u.bind("ended", function () {
            n.onStop()
        }), u.bind("error", function () {
            u.remove()
        }), u.appendTo("body"), this._audioelement = u
    }
    for (var c = 0, d = 0; d < AudioManager._areas.length; d++) {
        var l = AudioManager._areas[d];
        null != l && c++
    }
    if (c >= 5) {
        for (var h = 0, g = (new Date).getTime(), d = 0; d < AudioManager._areas.length; d++) {
            var l = AudioManager._areas[d];
            null != l && l.startTime < g && (h = l.id, g = l.startTime)
        }
        $("#audio_" + h).remove(), delete AudioManager._areas[h]
    }
    AudioManager._areas[e] = this, this.seek = function (e) {
        try {
            this.sourceprovider == AUDIO_SOURCE.YOUTUBE ? this._ytplayer.seekTo(e, !0) : this._audioelement.get(0).currentTime = e
        } catch (t) {}
    }, this.seekMargin = function (e, t) {
        try {
            this.sourceprovider == AUDIO_SOURCE.YOUTUBE ? (this._ytplayer.getCurrentTime() < e - t || this._ytplayer.getCurrentTime() > e + t) && (this._ytplayer.seekTo(e, !0), log("Area " + this.id + ": Time = " + this._ytplayer.getCurrentTime() + " while syncing to " + e + " with a margin of " + t + "(" + (e - t) + " to " + (e + t) + ")")) : (this._audioelement.get(0).currentTime < e - t || this._audioelement.get(0).currentTime > e + t) && (this._audioelement.get(0).currentTime = e, log("Area " + this.id + ": Time = " + this._audioelement.get(0).currentTime + " while syncing to " + e + " with a margin of " + t + "(" + (e - t) + " to " + (e + t) + ")"))
        } catch (i) {}
    }, this.updateVolumeInstant = function () {
        try {
            var e = this.targetvolume * AudioManager._volume;
            this.sourceprovider == AUDIO_SOURCE.YOUTUBE ? this._ytplayer.setVolume(100 * e) : this._audioelement.get(0).volume = e
        } catch (t) {}
    }, this.updateVolume = function () {
        if (!AudioManager._tabActive) return void this.updateVolumeInstant();
        try {
            var e = this.targetvolume * AudioManager._volume,
                t = 1e3 / AudioManager._fadeSteps / this.fadetime,
                i = -1;
            if (i = this.sourceprovider == AUDIO_SOURCE.YOUTUBE ? this._ytplayer.getVolume() / 100 : this._audioelement.get(0).volume, i >= 0 && i != e) {
                var o = -1;
                e != i && (o = e > i ? i + t > e ? e : i + t : e > i - t ? e : i - t), o >= 0 && (o > 1 ? o = 1 : 0 > o && (o = 0), this.sourceprovider == AUDIO_SOURCE.YOUTUBE ? this._ytplayer.setVolume(100 * o) : this._audioelement.get(0).volume = o)
            }
        } catch (a) {}
    }, this.getVolume = function () {
        return this.sourceprovider == AUDIO_SOURCE.YOUTUBE ? this._ytplayer.getVolume() : this._audioelement.get(0).volume
    }, this.setRepeat = function (e) {
        this.repeat = e, this.sourceprovider == AUDIO_SOURCE.YOUTUBE || (this.repeat ? this._audioelement.attr({
            loop: "loop"
        }) : this._audioelement.removeAttr("loop"))
    }, this.setTargetVolume = function (e, t) {
        this.targetvolume = e, this.fadetime = t
    }, this.pause = function () {
        this.playing = !1;
        try {
            this.sourceprovider == AUDIO_SOURCE.YOUTUBE ? this._ytplayer.pauseVideo() : this._audioelement.get(0).pause()
        } catch (e) {}
    }, this.play = function () {
        try {
            this.playing = !0, this.sourceprovider != AUDIO_SOURCE.YOUTUBE ? this._audioelement.get(0).play() : this._ytplayer.playVideo()
        } catch (e) {}
    }, this.onStop = function () {}
};
AudioManager.setMaximumVolume = function (e) {}, AudioManager.fadeTo = function (e, t, i) {}, AudioManager.playOnce = function (e, t, i) {
    var o = AudioManager.getAreaByID(e);
    null != o ? (o.setTargetVolume(i, 0), o.setRepeat(!1), o.play()) : (o = new AudioPlayback(e, t, i, 0, !1), o.play()), o.onStop = function () {
        $("#audio_" + o.id).remove(), delete AudioManager._areas[o.id]
    }
    var sound = document.getElementById("audio_" + e);
    var target = i * AudioManager._volume;
    var time = o * .01;
    var step = target * .01;
    log(target + " " + time + " " + step);
    var fadeAudio = setInterval(function () {
    	if(sound.volume + step >= target){
    		sound.volume = target;
    	}else{
        	sound.volume += step;
        }
        if (sound.volume >= target) {
            clearInterval(fadeAudio);
        }
    }, time);
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
    },
    Packets = {};
Packets.protocolVersion = 8, Packets.Login = function () {
    this.version = Packets.protocolVersion, this.playername = "", this.auth = "", this.set = function (e, t) {
        return this.playername = e, this.auth = t, this
    }, this.fromObject = function (e) {
        return this.playername = e.playername, this.auth = e.auth, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.LOGIN,
            version: this.version,
            playername: this.playername,
            auth: this.auth
        })
    }
}, Packets.Kick = function () {
    this.message = "", this.reason = "", this.set = function (e, t) {
        return this.message = e, this.reason = t, this
    }, this.fromObject = function (e) {
        return this.message = e.message, this.reason = e.reason, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.KICK,
            message: this.message,
            reason: this.reason
        })
    }
}, Packets.GlobalAudioPlayOnce = function () {
    this.audioid = "", this.name = "", this.volume = 1, this.set = function (e, t) {
        return this.audioid = e, this.name = t, this
    }, this.fromObject = function (e) {
        return this.audioid = e.audioid, this.name = e.name, this.volume = e.volume, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.GLOBAL_PLAY_ONCE,
            audioid: this.audioid,
            file: this.file
        })
    }
}, Packets.AreaStart = function () {
    this.audioid = "", this.name = "", this.fadetime = 0, this.volume = 1, this.repeat = !0, this.set = function (e, t, i, o, a) {
        return this.audioid = e, this.name = t, this.fadetime = i, this.volume = o, this.repeat = a, this
    }, this.fromObject = function (e) {
        return this.audioid = e.audioid, this.name = e.name, this.fadetime = e.fadetime, this.volume = e.volume, this.repeat = e.repeat, this
    }
}, Packets.AreaStop = function () {
    this.audioid = "", this.fadetime = 0, this.set = function (e, t) {
        return this.audioid = e, this.fadetime = t, this
    }, this.fromObject = function (e) {
        return this.audioid = e.audioid, this.fadetime = e.fadetime, this
    }
}, Packets.ClientAccepted = function () {
    this.servername = "", this.set = function (e) {
        return this.servername = e, this
    }, this.fromObject = function (e) {
        return this.servername = e.servername, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.CLIENT_ACCEPTED,
            servername: this.servername
        })
    }
}, Packets.AudioSync = function () {
    this.audioid = "", this.seconds = 1, this.margin = 0, this.set = function (e, t, i) {
        return this.audioid = e, this.seconds = t, this.margin = i, this
    }, this.fromObject = function (e) {
        return this.audioid = e.audioid, this.seconds = e.seconds, this.margin = e.margin, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.AUDIO_SYNC,
            seconds: this.seconds,
            margin: this.margin
        })
    }
}, Packets.Notification = function () {
    this.text = "", this.body = 1, this.icon = null, this.display = function () {
        log("-----------------------------"), log("Displaying notification from Packet"), log("Text: " + this.text), log("Body: " + this.body), log("-----------------------------"), Notif.display(this.text, this.body, this.icon)
    }, this.set = function (e, t, i) {
        return this.text = e, this.body = t, this.icon = i, this
    }, this.fromObject = function (e) {
        return this.text = e.text, this.body = e.body, this.icon = e.icon, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.NOTIFICATION,
            text: this.text,
            body: this.body
        })
    }
}, Packets.ExecScript = function () {
    this.script = "", this.execute = function () {
        log("-----------------------------"), log("Executing commands received by the server"), eval(this.script), log("-----------------------------")
    }, this.set = function (e) {
        return this.script = e, this
    }, this.fromObject = function (e) {
        return this.script = e.script, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.EXEC_SCRIPT,
            script: this.script
        })
    }
}, Packets.ComputerSpeak = function () {
    this.voicetext = "", this.execute = function () {
        log("Speaking [" + this.voicetext + "]");
        try {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(this.voicetext))
        } catch (e) {
            log("Error occured while trying speech"), log(e)
        }
    }, this.set = function (e) {
        return this.voicetext = e, this
    }, this.fromObject = function (e) {
        return this.voicetext = e.voicetext, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.COMPUTER_SPEAK,
            voicetext: this.voicetext
        })
    }
}, Packets.WarpRequest = function () {
    this.warp = "", this.set = function (e) {
        return this.warp = e, this
    }, this.fromObject = function (e) {
        return this.warp = e.warp, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.WARP,
            warp: this.warp
        })
    }
}, Packets.ServerSwitch = function () {
    this.servername = "", this.set = function (e) {
        return this.servername = e, this
    }, this.fromObject = function (e) {
        return this.servername = e.servername, this
    }, this.asJSON = function () {
        return JSON.stringify({
            id: PacketID.SERVER_SWITCH,
            servername: this.servername
        })
    }
}, parseUri.options = {
    strictMode: !1,
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
var CONNECTION_LOST_MESSAGE = "Connection with the server was lost",
    port = 8886,
    ws = null,
    FlagBits = {
        AUTO_DEBUG: 2,
        DEBUG_POPUPS: 4
    },
    Notif = {};
Notif.display = function (e, t, i) {}, $(document).ready(function () {
    var e = getCookie("volume");
    "" == e && (e = 50), AudioManager.updateVolume(e), "undefined" == typeof asusername || "undefined" == typeof asauth || "" == asusername || "" == asauth ? setTimeout(function () {
        kicked = !0, $("#disconnectReason").text("There was an error connecting to the Audio Server!\nReconnect by typing /audio in Minecraft."), ModalHelper.open("#disconnectedModal")
    }, 1e3) : "" != asusername && "" != asauth && startConnecting(), $("#debugbtn").click(function () {
        $("#debuglog").toggle()
    }), $("#retryButton").click(function () {
        ModalHelper.closeAll(), ModalHelper.open("#loginModal")
    }), $("#volumeslider").mousemove(function (e) {
        AudioManager.updateVolume($(this).val()), setCookie("volume", $(this).val())
    }), $("#volumeslider").change(function (e) {
        AudioManager.updateVolume($(this).val()), setCookie("volume", $(this).val())
    }), $("#debuglog").click(function () {
        var e = $(this)[0];
        if ("undefined" != typeof window.getSelection && "undefined" != typeof document.createRange) {
            var t = document.createRange();
            t.selectNodeContents(e);
            var i = window.getSelection();
            i.removeAllRanges(), i.addRange(t)
        } else if ("undefined" != typeof document.selection && "undefined" != typeof document.body.createTextRange) {
            var o = document.body.createTextRange();
            o.moveToElementText(e), o.select()
        }
    })
});
