import React, { useState, useEffect } from 'react';
import Parser from 'rss-parser';

const LeucadiaRSS = () => {
  const feedUrl = 'https://www.ndbc.noaa.gov/data/latest_obs/46274.rss';
  const [feedData, setFeedData] = useState(null);

  useEffect(() => {
    const parseRSSFeed = async () => {
      try {
        const parser = new Parser();
        const parsedFeed = await parser.parseURL(feedUrl);
        setFeedData(parsedFeed);
      } catch (error) {
        console.error('Error parsing RSS feed:', error);
      }
    };

    parseRSSFeed();
  }, []);

  if (!feedData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{feedData.title}</h2>
      <p>{feedData.description}</p>
      <ul>
        {feedData.items.map((item) => (
          <li key={item.guid}>
            <h3>{item.title}</h3>
            <p>{item.contentSnippet}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeucadiaRSS;
