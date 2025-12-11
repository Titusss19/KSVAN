<?php
// logout.php
session_start();
session_destroy();
setcookie('rememberedEmail', '', time() - 3600, '/');
header('Location: Login.php');
exit();
?>