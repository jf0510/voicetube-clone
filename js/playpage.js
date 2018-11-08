// some var
var player;
var timeoutMillsec = 0;
var timer;
var stopTime = -1;
var startTime = -1;
var subClicked = false;
var v_id;
var v_id_arr;
var s_id = -1; // colored sub id
var url;
var repeat = false;

// get video id
request_url = window.location.href;


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

p_id = getParameterByName('playlist_id',request_url);
v_id = getParameterByName('video_id',request_url);
if(p_id != null && v_id == null){
    get_1st_id(p_id);
}

//url = url.replace('#', '');
/*for (var i = url.length, ref = url.length; i >= 0; i = i - 1) {
  if (url[i] == '/') {
    v_id = url.substring(i + 1, ref - 5);
    break;
  }
}*/


// load video's subtitles
var content = null;

/*$(window).on('load', function () {
  content.forEach(function (element, index) {
    $("#subtitle_block").append("<tr><td>" + "<a id='" + index + "'' class='subtitle' href='#' >" + "<i class='far fa-play-circle fa-lg'></i>" + "</a></td>" + "<td><a id='" + index + "'' class='subtitle' href='#' ><span id='subtitle_text_" + index + "' >" + element["text"] + "</span></a></td></tr>");
  });
});*/

// initial youtube iframe api
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: v_id,
        events: {
            //'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    clearTimeout(timer);
    if (event.data == YT.PlayerState.PLAYING) {
        var currentTime = player.getCurrentTime();
        if (currentTime * 1000 >= startTime && currentTime * 1000 <= stopTime) {
            timeoutMillsec = stopTime - currentTime * 1000;
            if (subClicked) {
                if (repeat) {
                    timer = setTimeout(repeatVideo, timeoutMillsec);
                } else {
                    timer = setTimeout(pauseVideo, timeoutMillsec);
                }
            }
        } else {
            subClicked = false;
            id = whichSub(currentTime * 1000);
            stopTime = content[id]["end_time"];
            timeoutMillsec = stopTime - currentTime * 1000;
            colorSub(id);
            scrollSub(id);
            timer = setTimeout(function() { sequenceSub(id + 1); }, timeoutMillsec);
        }
    }
}

// listen if subtitle is clicked
$(document).on('click', '.subtitle', function() {
    startTime = content[this.id]["start_time"]
    stopTime = content[this.id]["end_time"]
    subClicked = true;
    colorSub(this.id);
    scrollSub(this.id);
    clearTimeout(timer);
    player.pauseVideo();
    player.seekTo(startTime / 1000);
    player.playVideo();
});

// handle subtitle's color
function colorSub(new_id) {
    if (s_id != -1) {
        $("#subtitle_text_" + s_id).css("background-color", "");
    }
    $("#subtitle_text_" + new_id).css("background-color", "#ccc");
    s_id = new_id;
}

// pause video
function pauseVideo() {
    player.pauseVideo();
    subClicked = false;
}

// repeat video
function repeatVideo() {
    player.pauseVideo();
    player.seekTo(startTime / 1000);
    player.playVideo();
}

// find sub id by time
function whichSub(currentTime) {
    var time = 0;
    var id = 0;
    while (time < currentTime) {
        time = content[id]["end_time"];
        id += 1;
    }
    id -= 1;
    return id
}

// sequency change sub color by time
function sequenceSub(id) {
    startTime = content[id]["start_time"];
    stopTime = content[id]["end_time"];
    timeoutMillsec = stopTime - startTime;
    colorSub(id);
    scrollSub(id);
    timer = setTimeout(function() { sequenceSub(id + 1); }, timeoutMillsec);
}

// scroll sub to top
function scrollSub(id) {
    var topPos = document.getElementById(id).parentNode.parentNode.offsetTop;
    $("#subtitle-container").animate({
        scrollTop: topPos
    }, 250)
}

//dynamic subtitle adding
function queryJSON(id) {
    /*var v_id_JSON = JSON.stringify({
        video_id: v_id
    });*/
    $.ajax({
        url: "../queryJSON.php",
        type: "GET",
        data: {
            video_id: id,
        },
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(msg) {
            debugger;
            //if do not contain this video info in server, then back to home page
            if (msg.title === null) {
                window.location = "../index.html";
            } else {
                $("#video_title").html(msg.title);
                document.title = msg.title;

                content = jQuery.parseJSON(msg.json);
                content.forEach(function(element, index) {
                    $("#subtitle_block").append("<tr><td>" + "<a id='" + index + "'' class='subtitle' href='#' >" + "<i class='far fa-play-circle fa-lg'></i>" + "</a></td>" + "<td><a id='" + index + "'' class='subtitle' href='#' ><span id='subtitle_text_" + index + "' >" + element["text"] + "</span></a></td></tr>");
                });
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            //debugger;
            alert(xhr.status);
            alert(xhr.responseText);
        }
    });
}

function queryLIST(id) {
    debugger;
    $.ajax({
        url: "../queryLIST.php",
        type: "GET",
        data: {
            playlist_id: id,
        },
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(msg) {
            debugger;
            //if do not contain this video info in server, then back to home page
            if (msg.playlist_title === null) {
                window.location = "../index.html";
            } else {
                //$("#video_title").html(msg.video_titles[0]);
                v_id_arr = msg.video_ids;
                debugger;
                //document.title = msg.title;
                console.log(msg);
                playlistInfo = msg;
                var playingId = 0;
                var listLength = playlistInfo['video_ids'].length;
                for (var i = 0; i < listLength; i++) {
                    if (playlistInfo['video_ids'][i] == v_id) {
                        playingId = i;
                        $("#playlist-block").append("<tr id='list-" + i + "' class='playing videos'><td>" + (i+1) + "</td><td><img src='http://img.youtube.com/vi/" + playlistInfo['video_ids'][i] + "/0.jpg' class='img-responsive'></td><td><p class='video-title'>" + playlistInfo['video_titles'][i] + "</p></td></tr>");

                    } else {

                        $("#playlist-block").append("<tr id='list-" + i + "'class='videos'><td>" + (i+1) + "</td><td><img src='http://img.youtube.com/vi/" + playlistInfo['video_ids'][i] + "/0.jpg' class='img-responsive'></td><td><p class='video-title'>" + playlistInfo['video_titles'][i] + "</p></td></tr>");
                    }
                }

                //move to the video is playing
                var topPos = document.getElementById("list-"+playingId).parentNode.parentNode.offsetTop;
                debugger;
                console.log("playing: topPos: "+topPos);
                $("#playlist-container").animate({
                    scrollTop: topPos
                }, 250)
                debugger;
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            debugger;
            alert(xhr.status);
            alert(xhr.responseText);
        }
    });
}

function get_1st_id(id) {
    $.get("../queryLIST.php", { playlist_id: id})
    .done(function(data) {
        v_id = data.video_ids[0];
    });
    // $.ajax({
    //     url: "../queryLIST.php",
    //     type: "GET",
    //     data: {
    //         playlist_id: id,
    //     },
    //     dataType: "json",
    //     contentType: "application/json; charset=utf-8",
    //     success: function(msg) {
    //         debugger;
    //         //if do not contain this video info in server, then back to home page
    //         if (msg.playlist_title === null) {
    //             window.location = "../index.html";
    //         } else {
    //             v_id = msg.video_ids[0];
    //         }
    //     },
    //     error: function(xhr, ajaxOptions, thrownError) {
    //         alert(xhr.status);
    //         alert(xhr.responseText);
    //     }
    // });
}

// listen if subtitle is clicked
$(document).on('click', '.videos', function() {
    var index = this.id;
    debugger;
    index = index.split('-')[1];
    change_video(v_id_arr[index]);
});

function change_video(v_id){
    debugger;
    window.location = window.location.href.split('?')[0] + "?playlist_id=" + p_id + "&video_id=" + v_id;
}

$(document).ready(function() {
    if (p_id !== null){
        queryLIST(p_id);
    }
    queryJSON(v_id);
});