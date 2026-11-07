import React, { useState, useEffect } from 'react';
import './News.css';
import { requestProvider } from '../../services/providerApi';


const API_OPTIONS = [
  {
    label: 'Mediastack',
    value: 'mediastack',
  },
];

const CATEGORIES = [
  'general', 'technology', 'sports', 'business', 'entertainment', 'health', 'science', 'world'
];

const COUNTRIES = [
  { code: 'us', name: 'USA' },
  { code: 'gb', name: 'UK' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'in', name: 'India' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
];

const News = () => {
  const [articles, setArticles] = useState([]);
  const [selectedApi, setSelectedApi] = useState(API_OPTIONS[0].value);
  const [category, setCategory] = useState('general');
  const [country, setCountry] = useState('us');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [view, setView] = useState('list');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [trending, setTrending] = useState([]);

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await requestProvider('news', { category, country, search });
      const articles = data.data || [];
      setArticles(articles);
      setTrending(getTrendingTopics(articles));
    } catch (e) {
      setError('Failed to fetch news.');
      console.error('News fetch error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line
  }, [category, country, selectedApi]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews();
  };

  const handleBookmark = (article) => {
    setBookmarks((prev) => {
      if (prev.find((a) => a.url === article.url)) return prev;
      return [article, ...prev];
    });
  };

  const getTrendingTopics = (articles) => {
    const wordCount = {};
    articles.forEach(a => {
      (a.title + ' ' + (a.description || '')).split(/\W+/).forEach(word => {
        if (word.length > 3) wordCount[word.toLowerCase()] = (wordCount[word.toLowerCase()] || 0) + 1;
      });
    });
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };
  const cleanUpArticle = (articleDescription = '') => {
    return articleDescription
      .replace(/&#39;/g, "'")
      .replace(/&#8217;/g, "'")
  };
    const cleanUpTitle = (title = '') => {
        return title
            .replace(/&#39;/g, "'")
            .replace(/&#8217;/g, "'")
    };

  return (
    <div className='containerDetail color-lite mt--25 contentLeft'>
      <div className='news-header'>
        <div className='containerDetail bg-lite color-yellow size25 p-20 mb-5'>
            📰 Current News
        </div>
        <form onSubmit={handleSearch} className='containerDetail bg-lite color-yellow size20 mb-5 flexContainer'>
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search news...'
            className='flex2Column containerDetail bg-dark p-10 color-lite mr-5'
          />
          <button type='submit' className='containerDetail color-lite pt-15 pb-15 button bg-green ml-5 flexColumn'>
            Search
          </button>
        </form>
        <div className='containerDetail bg-lite color-yellow size20 mb-5 flexContainer'>
          <select
            value={selectedApi}
            onChange={e => setSelectedApi(e.target.value)}
            className='containerDetail color-lite flex2Column mr-5'
          >
            {API_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className='containerDetail color-lite flex2Column'
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
          </select>
          <select 
            value={country} 
            onChange={e => setCountry(e.target.value)}
            className='containerDetail color-lite flex2Column ml-5'
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
        <div className='containerDetail bg-lite color-yellow size20 mb-5 flexContainer'>
          <div 
            onClick={fetchNews}
            className='containerDetail color-lite button bg-green p-20 flex2Column'
            >
                Refresh
            </div>
          <div 
            onClick={() => setView(view === 'list' ? 'compact' : 'list')}
            className='containerDetail color-lite bg-green p-20 ml-5 button flex2Column'
            >
                {view === 'list' ? 'Compact' : 'List'} View
            </div>
        </div>
        <div className='containerDetail bg-lite p-10 mb-5 color-lite'>
          <span>Trending: </span>
          {trending.map(word => <span key={word} className='news-trend'>#{word} </span>)}
        </div>
      </div>
      {loading && <div className='news-loading'>Loading...</div>}
      {error && <div className='news-error'>{error}</div>}
      <div className={`news-articles news-${view}`}>
        {articles.map((a, idx) => (
        <div 
            key={a.url || idx} 
            className='containerDetail bg-lite button color-lite mb--10' 
        >
            <div className='flexContainer'>
                <div className='containerDetail bg-lite pl-10 pr-10 color-yellow flex2Column p-10'>
                    {cleanUpTitle(a.title)}
                </div>
                {a.urlToImage && <img src={a.urlToImage} alt='' className='news-img flex4Column' />}
                <div className='news-bookmark-btn button flex4Column' onClick={e => { e.stopPropagation(); handleBookmark(a); }}>
                    🔖
                </div>
            </div>
            <div className='news-info p-10'>
              <div className='copyright color-orange'>
                {a.source} &middot; {new Date(a.published_at).toLocaleString()}
                </div>
              <div className=''>{cleanUpArticle(a.description)}</div>
              <a href={a.url} target='_blank' rel='noopener noreferrer' className='news-link'>Read full article</a>
            </div>
          </div>
        ))}
      </div>
      {selectedArticle && (
        <div className='news-modal' onClick={() => setSelectedArticle(null)}>
          <div className='news-modal-content' onClick={e => e.stopPropagation()}>
            <h3>{selectedArticle.title}</h3>
            {selectedArticle.urlToImage && <img src={selectedArticle.urlToImage} alt='' className='news-img-lg' />}
            <div className='news-meta'>{selectedArticle.source?.name} &middot; {new Date(selectedArticle.publishedAt).toLocaleString()}</div>
            <div className='news-desc'>{selectedArticle.content || selectedArticle.description}</div>
            <a href={selectedArticle.url} target='_blank' rel='noopener noreferrer' className='news-link'>Read full article</a>
            <button onClick={() => setSelectedArticle(null)} className='news-close-btn'>Close</button>
          </div>
        </div>
      )}
      <div className='news-bookmarks'>
        <h4>Bookmarked Articles</h4>
        {bookmarks.length === 0 && <div>No bookmarks yet.</div>}
        {bookmarks.map((a, idx) => (
          <div key={a.url || idx} className='news-article news-bookmarked'>
            {a.urlToImage && <img src={a.urlToImage} alt='' className='news-img' />}
            <div className='news-info'>
              <div className='news-title'>{a.title}</div>
              <div className='news-meta'>{a.source?.name} &middot; {new Date(a.publishedAt).toLocaleString()}</div>
            </div>
            <a href={a.url} target='_blank' rel='noopener noreferrer' className='news-link'>Read</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
