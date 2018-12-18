<?php

$phpInput = file_get_contents('php://input');
$post = json_decode($phpInput, true);

$response = [
    'error' => 0,
    'time' => null,
    'length' => null,
    'lengthCharacters' => null,
];

function builtInEval(string $code) : ?string{
    ob_start();
    eval($code);
    return ob_get_clean();    
}


/*
from http://php.net/manual/en/function.eval.php#121190
returns array:
 [
    output => string, 
    time => (float) time in seconds,
    length => lenght in bytes (not characters)
 ]
time is float (seconds), ACCURATE to the nearest MICROSECOND
*/
function betterEval($code) {
    $result = [];
    $tmp = tmpfile ();//file resource
    //we'll need to uri to include the file:
    $tmpMeta = stream_get_meta_data ( $tmp );
    $uri = $tmpMeta ['uri'];
    fwrite ( $tmp, $code );
    
    ob_start();
    $start = microtime(true);
    //anonymously, so our scope will not be polluted (very optimistic here, ofc)
    call_user_func(function() use ($uri) {
        include ($uri);
    });    
    
    $result['time'] = microtime(true) - $start;
    $result['output'] = ob_get_clean();    
    $result['length'] = strlen($result['output']);
    $result['lengthCharacters'] = mb_strlen($result['output']);
    $result['dbg'] = [
        'fileUri' => $uri
    ];
    fclose ( $tmp );
    return $result;
}

if($post['command']??null === 'eval'){
    $code = $post['code'];
    try {
        $response = betterEval($code);
        
    } catch (Throwable $t) {
        //$content = null;
        $response['error'] = $response['output'] = $t->getMessage();
    }    
    
}
die(json_encode($response));