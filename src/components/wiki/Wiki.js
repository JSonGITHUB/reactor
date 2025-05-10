import React, { useState } from 'react';

const Wiki = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchWikipedia = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&origin=*`
            );
            const data = await response.json();
            setResults(data.query.search);
        } catch (error) {
            console.error('Error fetching Wikipedia data:', error);
        }
        setLoading(false);
    };

    return (
        <div className='containerBox'>
            <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchWikipedia()}
                placeholder='Enter search term...'
                className='containerBox width--10'
            />
            {loading && <p className='mt-2'>Loading...</p>}

            <div className='containerBox'>
                {results.map((result) => (
                    <div key={result.pageid} className='containerBox'>
                        <a
                            href={`https://en.wikipedia.org/?curid=${result.pageid}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='containerDetail button'
                        >
                            <h3 className='columnLeftAlign color-yellow'>{result.title}</h3>
                        </a>
                        <div className='columnLeftAlign'>
                            <span dangerouslySetInnerHTML={{ __html: result.snippet }}></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wiki;
