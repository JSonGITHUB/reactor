import React, { useEffect, useState } from 'react';
import parser from 'xml2js';

const RssFeedComponent = () => {
    const [rssData, setRssData] = useState(null);

    useEffect(() => {
        const fetchRssData = async () => {
            try {
                // Using cors-anywhere to avoid CORS issues
                const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
                const rssUrl = 'https://www.ndbc.noaa.gov/data/latest_obs/46274.rss';

                const response = await fetch(`${corsAnywhereUrl}${rssUrl}`);
                const xmlText = await response.text();

                // Parse the XML data using xml2js
                parser.parseString(xmlText, (err, result) => {
                    if (err) {
                        console.error('Error parsing XML:', err);
                        // Use template data in case of an error
                        setRssData(templateData);
                    } else {
                        setRssData(result);
                    }
                });
            } catch (error) {
                console.error('Error fetching RSS data:', error);
                // Use template data in case of an error
                setRssData(templateData);
            }
        };

        fetchRssData();
    }, []);

    useEffect(() => {
        if (rssData !== null) {
            console.log(`RssFeedComponent => rssData: ${rssData.rss.channel[0].title[0]}`);
        }
    }, [rssData]);

    // Template data in case of an error or while loading
    const templateData = `
    <?xml version="1.0"?>
    <?xml-stylesheet type="text/xsl" href="/rss/ndbcrss.xsl"?>
    <rss version="2.0" xmlns:georss="http://www.georss.org/georss" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>NDBC - Station 46274 - Leucadia Nearshore, CA (262) Observations</title>
        <description><![CDATA[This feed shows recent marine weather observations from Station 46274.]]></description>
        <link>https://www.ndbc.noaa.gov/</link>
        <pubDate>Mon, 04 Mar 2024 22:30:43 +0000</pubDate>
        <lastBuildDate>Mon, 04 Mar 2024 22:30:43 +0000</lastBuildDate>
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
          <pubDate>Mon, 04 Mar 2024 22:30:43 +0000</pubDate>
          <title>Station 46274 - Leucadia Nearshore, CA (262)</title>
          <description><![CDATA[
            <strong>March 4, 2024 1:56 pm PST</strong><br />
            <strong>Location:</strong> 33.062N 117.314W<br />
            <strong>Significant Wave Height:</strong> 4.6 ft<br />
            <strong>Dominant Wave Period:</strong> 13 sec<br />
            <strong>Average Period:</strong> 6.8 sec<br />
            <strong>Mean Wave Direction:</strong> W (263&#176;) <br />
            <strong>Air Temperature:</strong> 59.9&#176;F (15.5&#176;C)<br />
            <strong>Water Temperature:</strong> 62.2&#176;F (16.8&#176;C)<br />
          ]]></description>
          <link>https://www.ndbc.noaa.gov/station_page.php?station=46274</link>
          <guid isPermaLink="false">NDBC-46274-20240304215600</guid>
          <georss:point>33.062 -117.314</georss:point>
        </item>
      </channel>
    </rss>
  `;

    return (
        <div>
            <h1>NDBC RSS Feed</h1>
            {rssData && (
                <div>
                    <h2>{rssData.rss.channel[0].title[0]}</h2>
                    <p>{rssData.rss.channel[0].description[0]}</p>
                    <ul>
                        {rssData.rss.channel[0].item.map((item, index) => (
                            <li key={index}>
                                <h3>{item.title[0]}</h3>
                                <div dangerouslySetInnerHTML={{ __html: item.description[0] }} />
                                <p>Link: <a href={item.link[0]}>{item.link[0]}</a></p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default RssFeedComponent;
