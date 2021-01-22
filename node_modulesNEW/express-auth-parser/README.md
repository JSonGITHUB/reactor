# express-auth-parser

Express based middleware, can be used to parse any Basic like authorization headers.

## Installation

    npm install express-auth-parser

## Usage

    var express = require('express')
    var authParser = require('express-auth-parser');
    
    var app = express();
    
    app.use(authParser);
    
    app.get('/', function (req, res) {
        // Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
        console.log(req.authorization)
        
        { 
            scheme: 'Basic',
            credentials: 'dXNlcm5hbWU6cGFzc3dvcmQ=',
            basic: { username: 'username', password: 'password' }
        }
    
        // Authorization: Bearer ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SjFjMlZ5Ym1GdFpTST...
        { 
            scheme: 'Bearer',
            credentials: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1l...' 
        }
        
        res.send('Hello World');
    });
    
    app.listen(3000);