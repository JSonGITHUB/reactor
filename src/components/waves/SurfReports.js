import React from 'react';
//import cheerio from 'cheerio';
//import got from 'got';
import axios from 'axios';

class SurfReports extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            oSideBuoyData: {}
        }
    }
    getOsideAxios = async() => {
        const reponse = await axios.get('https://www.ndbc.noaa.gov/data/realtime2/46224.txt');
        alert(reponse);
        this.setState({ oSideBuoyData: reponse });
    }
    getOside = () => {
        let data;
        const returnText = (response) => response.text();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnText(response) : returnRejection(response);
        const myHeaders = new Headers();
        //const uri = new Request('localhost:8080/', {
        const uri = new Request('https://www.ndbc.noaa.gov/data/realtime2/46224.txt', {
            method: 'GET',
            mode: 'no-cors'
        })
       //const uri = new Request('http://localhost:8080/');
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                console.log(`SurfReport => `)
                /*this.props.setWind(data.data[0].dr, data.data[0].d, data.data[0].s, data.data[0].g)
                this.setState({
                    station: data.metadata.name,
                    speed: data.data[0].s,
                    angle: data.data[0].d,
                    direction: data.data[0].dr,
                    gusts: data.data[0].g
                })
                */
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${JSON.stringify(uri, null, 2)} \npath: ${window.location.pathname}\n`, err));

    }
    getBuoy = () => {
        const myHeaders = new Headers();
        const myRequest = new Request('https://www.ndbc.noaa.gov/data/realtime2/46224.txt', {
        method: 'GET',
        headers: myHeaders,
        mode: 'no-cors',
        cache: 'default',
        });

        fetch(myRequest)
            .then(response => response.text())
            .then(data => console.log(`SSSURF: ${data}`));
    }
    getSwellData = () => {
        const unirest = require("unirest");
        const req = unirest("GET", "https://stormglass.p.rapidapi.com/forecast");
        req.headers({
            "x-rapidapi-host": "stormglass.p.rapidapi.com",
            "x-rapidapi-key": "cd590b7832msheb65a284b1083a6p112e16jsn24ac4a11b813",
            "useQueryString": true
        });
        req.end(function (res) {
            if (res.error) throw new Error(res.error);
            console.log(`getSwellData => ${res.body}`);
        });

    }
    getRapidData = () => {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://community-open-weather-map.p.rapidapi.com/weather?q=san%20francisco%2Cus",
            "method": "GET",
            "headers": {
              "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
              "x-rapidapi-key": "SIGN-UP-FOR-KEY"
            }
          }
          
                        var xhttp = new XMLHttpRequest();
                        xhttp.onreadystatechange = function() {
                            if (this.readyState === 4 && this.status === 200) {
                                console.log(`getRapidData: ${this.responseText}`);
                            } else {
                                console.log(`getRapidData: ${this.status}`)
                            }
                        };
                        xhttp.open("GET", settings, true);
                        xhttp.send();
          /*
          $.ajax(settings).done(function (response) {
            console.log(`getRapidData: ${response}`);
          });
          */
    }
/*
    getBuoyData = () => {
        const buoyUrl= 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224';
        got(buoyUrl).then(response => {
            const $ = cheerio.load(response.body);
            const primarySwellHeight = $('p')[3].children[6].data.replace("Swell: ", "").replace(" ft", "");
            const primarySwellInterval = $('p')[3].children[8].data.replace("Period: ", "").replace(" sec", "");
            const primarySwellDirection = $('p')[3].children[10].data.replace("Direction: ", "");
            const secondarySwellHeight = $('p')[3].children[12].data.replace("Wind Wave: ", "").replace(" ft", "");
            const secondarySwellInterval = $('p')[3].children[14].data.replace("Period: ", "").replace(" sec", "");
            const secondarySwellDirection = $('p')[3].children[16].data.replace("Direction: ", "");
            const buoyData = {
                primarySwellHeight: primarySwellHeight.replace("\n", ""), 
                primarySwellInterval: primarySwellInterval.replace("\n", ""), 
                primarySwellDirection: primarySwellDirection.replace("\n", ""), 
                secondarySwellHeight: secondarySwellHeight.replace("\n", ""), 
                secondarySwellInterval: secondarySwellInterval.replace("\n", ""),
                secondarySwellDirection: secondarySwellDirection.replace("\n", "")
            }
            console.log(JSON.stringify(buoyData, null, 2));
        }).catch(err => {
            console.log(err);
        });
    }
*/
    render() {
//        this.getOsideAxios();
        //this.getOside();
//        const osideBuoy = `http://localhost:8080/`;

        //this.getBuoy();
        //this.getSwellData();
        //this.getRapidData();
//        this.getBuoyData();
        return <div>
            {/*https://www.ndbc.noaa.gov/data/realtime2/46224.spec
            <iframe id="Oside" title="surf report" src={osideBuoy} className="bg-neogreen"></iframe><br/>*/}
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46225" ></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46266"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46254"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJAC1"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJPC1"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46232"></iframe><br/>
        </div>
    };
}

export default SurfReports;