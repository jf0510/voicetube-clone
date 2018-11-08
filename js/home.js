// Scroll navbar
function checkScroll() {
    var startY = $('.navbar').height() * 2; //The point where the navbar changes in px

    if ($(window).scrollTop() > startY) {
        $('.navbar').addClass("scrolled");
    } else {
        $('.navbar').removeClass("scrolled");
    }
}

if ($('.navbar').length > 0) {
    $(window).on("scroll load resize", function() {
        checkScroll();
    });
}


//carousel
$(window).resize(function() {
        console.log('resize called');
        var width = $(window).width();
        if (width >= 768) {
            $('.carousel-add').addClass('carousel-inner');
        } else {
            $('.carousel-add').removeClass('carousel-inner');
        }
    })
    .resize();

$('.carousel').carousel({
    interval: false
})

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


$("#add-new-video").click(function() {
    //console.log($("#new-video-href").val());
    // get video id
    var value = $("#new-video-href").val();
    console.log(value);
    var video_id = getParameterByName('v', value);
    var playlist_id = getParameterByName('list', value);
    console.log(video_id);
    console.log(playlist_id);
    var id_JSON = JSON.stringify({
        v: video_id,
        p: playlist_id
    });
    $.ajax({
        type: "POST",
        url: "youtubeAPI.php",
        data: id_JSON,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        processData: false,
        success: function(data) {
            console.log(data);
            debugger;
            //if do not contain this video info in server, then back to home page
            if (data.legal == false) {
                alert('Not a valid youtube video or playlist url. \n This request will be IGNORED');
            } else {
                if (data.title === null || data.status === "failed...") {
                    window.location = "index.html";
                } else {
                    if (playlist_id == null) {
                        window.location = "videopage/playpage.html?video_id=" + video_id;
                    } else {
                        window.location = "videopage/playlist.html?playlist_id=" + playlist_id + "&video_id=" + video_id;
                    }
                }
            }
        },
        error: function() {
            console.log("error");
        }
    });
});


//dynamic load playlist
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "queryLIST.php",
        dataType: "json",
        data: { 'playlist_id': "all" },
        success: function(msg) {
            console.log(msg);
            console.log(msg.playlist_ids.length);
            //each page has 4 items
            var pages = Math.floor(msg.playlist_ids.length / 4) + 1;
            console.log(pages);
            //add each playlist info to page
            for (var i = 0; i < pages; i++) {
                if (i == 0) {
                    var appendText = "<div class='row'>";
                } else {
                    var appendText = "<div class='item'> <div class='row'>";
                }

                for (var j = i * 4; j < i * 4 + 4; j++) {
                    if (j < msg.playlist_ids.length) {
                        appendText += "<div class='col-sm-3 col-xs-12'>"
                        appendText += "<div class='thumbnail'><a href='./videopage/playlist.html?playlist_id=" + msg.playlist_ids[j] + "&video_id=" + msg.video_ids[j] + "'>"
                        appendText += "<img src='http://img.youtube.com/vi/" + msg.video_ids[j] + "/0.jpg' class='img-responsive'></a><div class='caption'><div class='caption-title'><p>" + msg.playlist_titles[j];
                        appendText += "</p></div></div></div></div>";
                    }
                }
                if (i == 0) {
                    appendText += "</div>";
                    $(".item.active.carousel-box").append(appendText);
                } else {
                    appendText += "</div></div>";
                    $(".carousel-add").append(appendText);
                }
            }
        },

        error: function(msg) {
            //if there is error
            console.log(msg.responseText);
        }
    });
});