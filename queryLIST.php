<?php
header("Content-Type:application/json; charset=utf-8");
include "connect.php";
$playlist_id = $_GET['playlist_id'];
$playlist_detail = NULL;
$video_ids = array();
$video_titles = array();
$playlist_ids = array();
$playlist_titles = array();


function fetch_titles($conn, $video_ids){
    $titles = array();
    foreach($video_ids as $id){
        $sql = "SELECT * FROM youtube_cc WHERE video_id = '". $id ."'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $video_detail = $result->fetch_assoc();
            array_push($titles, $video_detail['title']);
        }else{
            array_push($titles, "None");
        }
    }
    return $titles;
}

if ($conn->connect_error || is_null($conn)) {
    var_dump($conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}else{
    if($playlist_id === "all"){
        $sql = "SELECT * FROM youtube_list ORDER BY id DESC";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            while($playlist_detail = $result->fetch_assoc()) {
                //var_dump($playlist_detail['playlist_title']);
                array_push($playlist_ids, $playlist_detail['playlist_id']);
                array_push($playlist_titles, $playlist_detail['playlist_title']);
                $temparray = unserialize($playlist_detail['video_ids']);
                array_push($video_ids, $temparray[0]);
            }
        }
        $arr = array('playlist_ids'=> $playlist_ids, 'playlist_titles'=> $playlist_titles, 'video_ids'=> $video_ids, 'video_titles'=> $video_titles);
    }else{
        $sql = "SELECT * FROM youtube_list WHERE playlist_id = '". $playlist_id ."'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $playlist_detail = $result->fetch_assoc();
            $playlist_title = $playlist_detail['playlist_title'];
            $video_ids = unserialize($playlist_detail['video_ids']);
            $video_titles = unserialize($playlist_detail['video_titles']);
            if($video_titles == false){
                $video_titles = fetch_titles($conn, $video_ids);
            }
        }
        $arr = array('playlist_id'=> $playlist_id, 'playlist_title'=> $playlist_title, 'video_ids'=> $video_ids, 'video_titles'=> $video_titles);
    }
}
$conn->close();

//var_dump($arr);
echo json_encode($arr);
?>
