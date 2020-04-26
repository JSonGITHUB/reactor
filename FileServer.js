var http = require('http');
var url = require('url');
var fs = require('fs');

const surfLogFile= "surfLog.json"
const surfData = {
    "Day":{
        "Date":"2019-08-21T07:00:00.000Z",
        "Day":17,
        "Month":7,
        "Year":2019
    },
    "Location":{
        "Break":"Panga Drops"
    },
    "Swell":{
        "Direction":"W",
        "Height":"head high",
        "Report":"4ft"
    },
    "Wind":{
        "Direction":"N",
        "Orientation":"Offshore",
        "MPH":"2mph",
        "Surface":"Glassy"
    },
    "Tide":{
        "Phase":"Low => High",
        "Height":"1ft"
    },
    "Conditions":{
        "Conditions":"Firing"
    },
    "Comments":{
        "notes":"It was raining the whole time, sometimes pouring. Crossed up swell made it peaky and it was barreling. The crowd was spread out and we found peaks to ourselves most of the time. We surfed for almost 3 hours and just as we were feeling pretty tired we started joking about how the wind never got bad like the report said it would. 5 minutes later the wind got really bad. Even worse than the forecast mentioned. We were gripping our boards as we ran back to the truck so they wouldn't fly away. We learned from locals later that it was one of the best sessions in HB in a while."
    }
}
const functionalWrite = (filename, data) => {
    console.log(`*STARTING*`);
    const dataTemplate = fs.readFileSync("surfLog.json", "utf8");
    console.log(`Start Data: ${dataTemplate}`);
    const writeData = `${JSON.stringify(data, null, 2)},
${dataTemplate}`;
    fs.writeFile(filename, writeData, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  console.log(`q: ${JSON.stringify(q, null, 2)}`)
  var filename = "." + q.pathname;
  console.log(`filename: ${filename}`)
  fs.readFile(filename, function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("44 Not Found");
    } 
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
  if (filename == "./writeSurfLog.json") {
      console.log(`Write the SURFLOG => ${surfLogFile}`)
    functionalWrite(surfLogFile, surfData)
  }
  
}).listen(8080);
