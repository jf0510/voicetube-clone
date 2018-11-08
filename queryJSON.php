<?php
header("Content-Type:application/json; charset=utf-8");
include "connect.php";
$video_id = $_GET['video_id'];
$json = NULL;
$video_detail = NULL;
if ($conn->connect_error || is_null($conn)) {
    var_dump($conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}else{
    $sql = "SELECT * FROM youtube_cc WHERE video_id = '". $video_id ."'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
		$video_detail = $result->fetch_assoc();
		$path = 'json/'.$video_id.'.json';
		$json = file_get_contents($path);
    }
}
$conn->close();

$arr = array('video_id'=> $video_id, 'title'=> $video_detail['title'], 'json'=>$json);
echo json_encode($arr);
?>
