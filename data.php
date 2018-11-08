<?php
//connect using the same file
include "connect.php";
//how many video in one page
$length = 16;
// Check connection
if ($conn->connect_error) {
    var_dump($conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}else{
    //select all col in youtube_cc and filter the blank & 18+ title and limit the number and start point
    //$sql = "SELECT * FROM youtube_cc WHERE title <> '' and title NOT LIKE '%porn%' LIMIT ". ($_POST['pageCounter'] * $length).",". $length;
    $sql = "SELECT * FROM youtube_cc WHERE title <> '' and title NOT LIKE '%porn%' ORDER BY id DESC LIMIT " . ($_POST['pageCounter'] * $length).",". $length;
    $result = $conn->query($sql);
    if (!$result) {
        printf("Errormessage: %s\n", $conn->error);
    }else{
    //there is more than one result
        $send_back_video_info = array();

    if ($result->num_rows > 0) {
    // output data of each row
        while($row = $result->fetch_assoc()) {
          array_push($send_back_video_info, $row);
        }
    }

    //newest first
    $reversed = array_reverse($send_back_video_info);
    
    //send back with json
    echo json_encode($reversed);
        
    }
}
$conn->close();

?>