<?php
//connect using the same file
include "connect.php";

header("Content-Type:application/json; charset=utf-8");
$POST = json_decode(file_get_contents("php://input"));
$video_id = $POST->v;
$playlist_id = $POST->p;

//get video timetext
function youtube_Timetext($id) {
    //seting url with id
    $url = "http://video.google.com/timedtext?lang=en&v=" . $id;
    $video_Timetext = file_get_contents($url);
    //check if getting english sub success
    if(!$video_Timetext){
        //if not, get chinese subtitle
        $url = "http://video.google.com/timedtext?lang=zh-TW&v=" . $id;
        $video_Timetext = file_get_contents($url);
    }
    //check if there is subtitle
    if($video_Timetext){
        //if yes, reformate the subtitle as JSON and return back
        $subtitles = array();
        $index = 1;
        $xml = simplexml_load_string($video_Timetext);
        $xml_json = json_encode($xml);
        $xml_array = json_decode($xml_json,TRUE);

        foreach($xml->text as $line){
            $start = floatval($line['start']) * 1000;
            $end = $start + floatval($line['dur']) * 1000; 
            $subtitle = array("index"=> $index, "start_time"=> $start, "end_time" => $end, "text" => $xml_array['text'][$index-1]);
            array_push($subtitles, $subtitle);
            $index += 1;
        }

        $subtitle_json = json_encode($subtitles);
        $subtitle_array = json_decode($subtitle_json,TRUE);
        return $subtitle_array;
    } else {
        //if no, send back the "no subtitles"
        $subtitle = array();
        array_push($subtitle, array("index"=> "0", "start_time"=> "0", "end_time" => "0", "text" => "No subtitles"));
        $subtitle_json = json_encode($subtitle);
        $subtitle_array = json_decode($subtitle_json,TRUE);
        return $subtitle_array;
    }
}

//get video title
function youtube_Title($id) {
	// $id = 'YOUTUBE_ID';
    // returns a single line of JSON that contains the video title. Not a giant request.
	$videoTitle = file_get_contents("https://www.googleapis.com/youtube/v3/videos?id=".$id."&key=AIzaSyC8O_VAWWHLHbStWbX-2wNzr8FrRTkI16w&fields=items(id,snippet(title),statistics)&part=snippet,statistics");
	// despite @ suppress, it will be false if it fails
	if ($videoTitle) {
		$json = json_decode($videoTitle, true);
		return $json['items'][0]['snippet']['title'];
	} else {
		return false;
	}
}

//get playlist items info
function youtube_Playlist($id, $page) {
    //$id is the playlist id
    //because the throttle only give 40 data for once
    //we need $page as page token to load next 40 data
    if ($page == null){
        $videoPlaylist = file_get_contents("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=".$id."&key=AIzaSyC8O_VAWWHLHbStWbX-2wNzr8FrRTkI16w");
    }else{
        $videoPlaylist = file_get_contents("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=".$id."&key=AIzaSyC8O_VAWWHLHbStWbX-2wNzr8FrRTkI16w&pageToken=".$page);        
    }
    //check if success
	if ($videoPlaylist) {
		$json = json_decode($videoPlaylist, true);
        return $json;
	} else {
		return false;
	}
}

//get playlist self info
function youtube_Playlist_Self($id) {
    $videoPlaylist = file_get_contents("https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=".$id."&key=AIzaSyC8O_VAWWHLHbStWbX-2wNzr8FrRTkI16w");
    //check if success
	if ($videoPlaylist) {
		$json = json_decode($videoPlaylist, true);
        //return info and add \ before " ' / NULL
        return addslashes($json['items'][0]['snippet']['title']);
	} else {
		return false;
	}
}

//store subtitle json file
function save_json($filename, $data){
    $fp = fopen('json/'.$filename.'.json', 'w');
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
    fclose($fp);
}

//insert youtube_cc table
function insert_youtube_cc($conn, $id, $t){
    //$conn mean the connection of DB
    //$id is the youtube video id
    //$t is ...
    $query = "SELECT * FROM youtube_cc WHERE video_id = '$id'";
    $result = $conn->query($query);
    $t = addslashes($t);
    if ($result->num_rows == 0 && $id != "") 
    {
        $sql = "INSERT INTO youtube_cc(video_id, title) VALUES('$id' , '$t')";
        if ($conn->query($sql) !== FALSE) {
            $status = "success!";
        } else {
            $status = "failed...";
            //$status = $conn->error;
        }
    }else{
        $status = "already exist!";
    }
    return $status;
}

//insert youtube_list table
function insert_youtube_list($conn, $p_id, $p_t, $v_ids, $v_ts){
    //$p_id playlist id
    //$p_t playlist title
    //$v_ids video ids
    //$v_ts video titles
    //reformate the video ids and video titles
    $v_ids = serialize($v_ids);
    $v_ts = serialize($v_ts);
    $query = "SELECT * FROM youtube_list WHERE playlist_id = '$p_id'";
    $result = $conn->query($query);
    //check if there is already having this list info
    if ($result->num_rows == 0) {
        //if no, insert to DB
        $sql = "INSERT INTO youtube_list(playlist_id, playlist_title, video_ids, video_titles) VALUES('$p_id' , '$p_t', '$v_ids' , '$v_ts')";
        //check is success
        if ($conn->query($sql) !== FALSE) {
            $status = "success!";
        } else {
            $status = "failed...";
            //$status = $conn->error;
        }
    }else{
        //if yes, update the data
        $sql = "UPDATE youtube_list SET playlist_title ='$p_t', video_ids= '$v_ids', video_titles= '$v_ts' WHERE playlist_id= '$p_id'";
        //check is success
        if ($conn->query($sql) !== FALSE) {
            $status = "success!";
        } else {
            $status = "failed...";
            //$status = $conn->error;
        }
    }
    //return the result is success or not
    return $status;
}

function check_legal($v_id, $p_id){
    $url = "https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=".$v_id."&list=".$p_id;
    $result = file_get_contents($url);    
    if($result){
        return true;
    }else{
        return false;
    }
}


//Check connection
if ($conn->connect_error) {
    var_dump($conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}else{
    //connect success
    //init the page info
    $legal = check_legal($video_id, $playlist_id);
    //check href
    if($playlist_id == null){
        //href without playlist id
        //show only one video page
        if ($legal){
            $title = youtube_Title($video_id);
            //$title = addslashes($title);
            $timetext = youtube_Timetext($video_id);
            save_json($video_id, $timetext);
            $status = insert_youtube_cc($conn, $video_id, $title);
        }
    }else{
        //there is playlist id
        if ($legal){
            $page_token = null;
            $video_num = PHP_INT_MAX;
            $video_ids = array();
            $video_titles = array();

            //since the number is MAX means that it will do at least once in while loop.
            //because of the throttle we need to check if there is more video or not.
            while (count($video_titles) < $video_num){
                $playlist_info = youtube_Playlist($playlist_id, $page_token);
                //first page
                if($video_num == PHP_INT_MAX){
                    //updata the number
                    $playlist_title = youtube_Playlist_Self($playlist_id);
                    $video_num = intval($playlist_info['pageInfo']['totalResults']);
                }
                //add info into array
                foreach($playlist_info['items'] AS $item){
                    $video_id = $item['snippet']['resourceId']['videoId'];
                    $title = $item['snippet']['title'];
                    $timetext = youtube_Timetext($video_id);
                    save_json($video_id, $timetext);
                    $status = insert_youtube_cc($conn, $video_id, $title);
                    array_push($video_ids, $video_id);
                    array_push($video_titles, addslashes($title));
                }
                $page_token = $playlist_info['nextPageToken'];
            }
            //end while
            //insert all data into DB
            $status = insert_youtube_list($conn, $playlist_id, $playlist_title, $video_ids, $video_titles);
        }
    }
}

$conn->close();
//return subtitle and video info
$arr = array('video_id'=> $video_id, 'title'=> $title, 'status'=>$status, 'timetext'=> $timetext, 'legal'=> $legal);
echo json_encode($arr);
?>