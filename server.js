// creating variables
const http = require('http'),
fs = require('fs'),
url = require('url'); 

// function calls the "request handler"
// this funciton is called every time an HTTP request is made against this server
http.createServer((request, response) => {
    // request.url allows you to get the URL from the request
    let addr = request.url,
    q = url.parse(addr, true),
    filePath = '';
    
    // fs module logs the URL and timestamp to the “log.txt” file
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });
    
    //   whether or not a variable includes a specific value or string ('documentation)
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }
        
        // tells server to add a header to the response
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        // ends the response and sends message
        response.end('Hello Node!\n');
    });
    
    // server listens for request on port 8080
}).listen(8080);
console.log('My first Node test server is running on Port 8080.');

