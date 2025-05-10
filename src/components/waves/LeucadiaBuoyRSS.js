import React, { useState, useEffect } from 'react';
import fetchTimer from '../utils/FetchTimer';

const LeucadiaBuoyRSS = () => {
    /*
    const templateData = `<?xml version="1.0"?>
                            <?xml-stylesheet type="text/xsl" href="/rss/ndbcrss.xsl"?>
                            <rss version="2.0" xmlns:georss="http://www.georss.org/georss" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
                            <channel>
                                <title>NDBC - Station 46274 - Leucadia Nearshore, CA (262) Observations</title>
                                <description><![CDATA[This feed shows recent marine weather observations from Station 46274.]]></description>
                                <link>https://www.ndbc.noaa.gov/</link>
                                <pubDate>Sun, 14 Jan 2024 00:35:54 +0000</pubDate>
                                <lastBuildDate>Sun, 14 Jan 2024 00:35:54 +0000</lastBuildDate>
                                <ttl>30</ttl>
                                <language>en-us</language>
                                <managingEditor>webmaster.ndbc@noaa.gov (NDBC Webmaster)</managingEditor>
                                <webMaster>webmaster.ndbc@noaa.gov (NDBC Webmaster)</webMaster>
                                <image>
                                <url>https://www.ndbc.noaa.gov/images/noaa_nws_xml_logo.gif</url>
                                <title>NDBC - Station 46274 - Leucadia Nearshore, CA (262) Observations</title>
                                <link>https://www.ndbc.noaa.gov/</link>
                                </image>
                                <atom:link href="https://www.ndbc.noaa.gov/data/latest_obs/46274.rss" rel="self" type="application/rss+xml" />
                                <item>
                                <pubDate>Sun, 14 Jan 2024 00:35:54 +0000</pubDate>
                                <title>Station 46274 - Leucadia Nearshore, CA (262)</title>
                                <description><![CDATA[
                                    <strong>January 13, 2024 3:56 pm PST</strong><br />
                                    <strong>Location:</strong> 33.062N 117.314W<br />
                                    <strong>Significant Wave Height:</strong> 2.6 ft<br />
                                    <strong>Dominant Wave Period:</strong> 8 sec<br />
                                    <strong>Average Period:</strong> 6.8 sec<br />
                                    <strong>Mean Wave Direction:</strong> W (277&#176;) <br />
                                    <strong>Air Temperature:</strong> 59.2&#176;F (15.1&#176;C)<br />
                                    <strong>Water Temperature:</strong> 58.6&#176;F (14.8&#176;C)<br />
                                ]]></description>
                                <link>https://www.ndbc.noaa.gov/station_page.php?station=46274</link>
                                <guid isPermaLink="false">NDBC-46274-20240113235600</guid>
                                <georss:point>33.062 -117.314</georss:point>
                                </item>
                            </channel>
                            </rss>`;

    const [data, setData] = useState(templateData);

    useEffect(() => {

        const dataServer = 'https://www.ndbc.noaa.gov/data/latest_obs/46274.rss';

        const fetchBuoyRss = async (rss) => {
            try {
                const response = await fetch(rss);
                const data = await response.json();
                //alert(JSON.stringify(data.error.code, null, 2));
                console.log(`templateData: ${JSON.stringify(templateData, null, 2)}`);
                console.log(`data: ${JSON.stringify(data, null, 2)}`);
                setData(data);
                //setData(templateData);
            } catch (error) {
                console.error('USING TEMPLATE DATA! - Error fetching exchange rates:', error);
                setData(templateData);
            }
        };
        fetchTimer('LeucadiaBuoyRSS', dataServer, fetchBuoyRss);
    }, []);
    */
    const [rssData, setRssData] = useState(null);

    useEffect(() => {
        const fetchRssFeed = async () => {
            try {
                const response = await fetch('https://www.ndbc.noaa.gov/data/latest_obs/46274.rss');
                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

                const pubDate = xmlDoc.querySelector('pubDate').textContent;
                const title = xmlDoc.querySelector('item title').textContent;
                const description = xmlDoc.querySelector('item description').textContent;

                const locationMatch = /<strong>Location:<\/strong>\s*([\d.-]+ [NS]) ([\d.-]+ [EW])/.exec(description);
                const significantWaveHeightsMatch = /<strong>Significant Wave Height:<\/strong>\s*([\d.]+) ft/.exec(description);
                const dominantWavePeriodMatch = /<strong>Dominant Wave Period:<\/strong>\s*([\d.]+) sec/.exec(description);
                const averagePeriodMatch = /<strong>Average Period:<\/strong>\s*([\d.]+) sec/.exec(description);
                const meanWaveDirectionMatch = /<strong>Mean Wave Direction:<\/strong>\s*([NSEW]+) \((\d+)°\)/.exec(description);
                const airTemperatureMatch = /<strong>Air Temperature:<\/strong>\s*([\d.]+)°F/.exec(description);
                const waterTemperatureMatch = /<strong>Water Temperature:<\/strong>\s*([\d.]+)°F/.exec(description);

                const report = {
                    location: locationMatch ? `${locationMatch[1]} ${locationMatch[2]}` : '',
                    significantWaveHeights: significantWaveHeightsMatch ? parseFloat(significantWaveHeightsMatch[1]) : null,
                    dominantWavePeriod: dominantWavePeriodMatch ? parseFloat(dominantWavePeriodMatch[1]) : null,
                    averagePeriod: averagePeriodMatch ? parseFloat(averagePeriodMatch[1]) : null,
                    meanWaveDirection: meanWaveDirectionMatch ? { direction: meanWaveDirectionMatch[1], degrees: parseInt(meanWaveDirectionMatch[2]) } : null,
                    airTemperature: airTemperatureMatch ? parseFloat(airTemperatureMatch[1]) : null,
                    waterTemperature: waterTemperatureMatch ? parseFloat(waterTemperatureMatch[1]) : null,
                };

                const result = {
                    pubDate,
                    item: {
                        title,
                        description,
                        report,
                    },
                };

                setRssData(result);
            } catch (error) {
                console.error('Error fetching RSS feed:', error);
            }
        };

        fetchRssFeed();
        
    }, []);

    if (!rssData) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <h2>{rssData.item.title}</h2>
            <p>Publication Date: {rssData.pubDate}</p>
            <p>Description: {rssData.item.description}</p>
            <h3>Report:</h3>
            <ul>
                <li>Location: {rssData.item.report.location}</li>
                <li>Significant Wave Heights: {rssData.item.report.significantWaveHeights} ft</li>
                <li>Dominant Wave Period: {rssData.item.report.dominantWavePeriod} sec</li>
                <li>Average Period: {rssData.item.report.averagePeriod} sec</li>
                <li>Mean Wave Direction: {rssData.item.report.meanWaveDirection.direction} ({rssData.item.report.meanWaveDirection.degrees}°)</li>
                <li>Air Temperature: {rssData.item.report.airTemperature}°F</li>
                <li>Water Temperature: {rssData.item.report.waterTemperature}°F</li>
            </ul>
        </div>
    );

}

export default LeucadiaBuoyRSS;