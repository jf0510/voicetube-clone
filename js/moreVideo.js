$(document).ready(function() {
    var pageCounter = 0; //for counting now page
    var loadMoreVideoLock = false; //lock function when now is loading
    function loadMoreVideo() {
        //lock when loading new video
        loadMoreVideoLock = true;
        $.ajax({
            type: "POST",
            url: "data.php",
            dataType: "json",
            data: { 'pageCounter': pageCounter },
            success: function(data) {

                var back = data;
                //since we don't have playtimes in database, using random number for showing
                var randomPlaytimes = Math.ceil(Math.random() * 10000);

                //add each video info to page
                for (var i = back.length - 1; i >= 0; i--) {
                    //link part and preview picture part
                    var appendText = "<div class='col-sm-3 col-xs-12'><div class='thumbnail'><a href='./videopage/playpage.html?video_id=" + back[i]["video_id"] + "'><img src='http://img.youtube.com/vi/" + back[i]["video_id"] + "/0.jpg' class='img-responsive'></a><div class='caption'><div class='caption-title'><p>" + back[i]["title"] + "</p></div><p><span class='glyphicon glyphicon-headphones' aria-hidden='true'></span> " + randomPlaytimes + "</p><p>";
                    //since we don't have level in database, using random number for showing
                    if (Math.random() * 10 > 5) {

                        appendText = appendText + "<p><span class='label label-success'>Basic</span>";

                    } else {
                        appendText = appendText + "<p><span class='label label-primary'>Int</span>";
                    }
                    //since we don't have accent in database, using random number for showing
                    if (Math.random() * 10 > 5) {
                        appendText = appendText + "<span class='label label-warning'>US</span>";
                    } else {
                        appendText = appendText + "<span class='label label-warning'>UK</span>";
                    }
                    appendText = appendText + "</p></div></div></div>";

                    $("#thumbnail-container").append(appendText);

                }
            },
            error: function(data) {
                //if there is error
                console.log(data.responseText);
            }
        });
        //after loading new page, update the page counter
        pageCounter = pageCounter + 1;
        //unlock when loading end
        loadMoreVideoLock = false;
    };
    //init page with same function
    loadMoreVideo();

    //you can also click the button if the scroll not working;
    $("#more-video").click(function() {
        loadMoreVideo();
    });

    //load more video when scroll to page bottom 
    $(window).scroll(function() {
        //ref: https://pjchender.blogspot.tw/2015/04/jquery.html
        last = $("body").height() - $(window).height() - 50
        if ($(window).scrollTop() >= last) {
            //lock the function before the loading end
            if (!loadMoreVideoLock) {
                loadMoreVideo();
            }
        }
    })
});