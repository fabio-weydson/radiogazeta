<?php
$conn_id = ftp_connect("ftp.grupogazeta.com.br");
$login_result = ftp_login($conn_id, "fmweb", "FWB2002gazeta");
$contents = ftp_nlist($conn_id, "*.txt");
$faixaTitulo = str_replace('.txt', '', $contents[0]);
echo $faixaTitulo;
?>