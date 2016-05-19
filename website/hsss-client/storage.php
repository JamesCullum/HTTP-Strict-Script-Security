<?php
error_reporting(0);

$storage = realpath(__DIR__)."/storage";
$bookName = preg_replace('/[^\w]/','', $_POST["book"]);
$bookPath = $storage."/".$bookName;

switch($_POST["action"])
{
	case "read":
	{
		echo file_get_contents($bookPath);
		break;
	}
	case "write":
	{
		$data = $_POST["data"];
		$checkData = json_decode($data);
		if(!$checkData || empty($checkData->iv) || empty($checkData->salt) || empty($checkData->ct)) $data = "";
		
		if(empty($data)) @unlink($bookPath);
		else file_put_contents($bookPath, $data);
		
		echo "1";
		break;
	}
}
?>