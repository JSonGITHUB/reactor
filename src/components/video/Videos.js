import React, { useState, useEffect } from 'react';
//import VideoDetail from './VideoDetail';

//const KEY = config.youtubeAPI_KEY;
//const api = config.youtubeAPI_BASE_URL;
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const PLAYLISTS_KEY = 'video_playlists_v1';

const COLLAPSE_STORAGE_KEY = 'videViewCollapsed';


const Videos = () => {

  // State to toggle playlist delete buttons
  const [showPlaylistDelete, setShowPlaylistDelete] = useState(false);

  const loadJson = (key, fallback) => {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null');
        return parsed || fallback;
    } catch {
        return fallback;
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [addVideo, setAddVideo] = useState(false);
  // Ref for video player
  const videoPlayerRef = React.useRef(null);
  const [collapseState, setCollapseState] = useState(() => {
      const saved = loadJson(COLLAPSE_STORAGE_KEY, {});
      return {
          playlists: saved.playlists ?? false
      };
  });
  const playlistsCollapsed = collapseState.playlists;
  // Playlist state
  const [playlists, setPlaylists] = useState(() => {
    try {
      const raw = localStorage.getItem(PLAYLISTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistCategory, setNewPlaylistCategory] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [addingPlaylist, setAddingPlaylist] = useState(false);  
  const [newVideoUrl, setNewVideoUrl] = useState('');
    // Persist playlists to localStorage
    useEffect(() => {
      try {
        localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
      } catch {}
    }, [playlists]);
    // Add a new playlist
    const handleAddPlaylist = () => {
      setAddingPlaylist(false)
      if (!newPlaylistName.trim()) return;
      setPlaylists(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newPlaylistName.trim(),
          category: newPlaylistCategory.trim(),
          videos: []
        }
      ]);
      setNewPlaylistName('');
      setNewPlaylistCategory('');
    };
    
    const toggleCollapse = (key) =>
    setCollapseState((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
        return next;
    });

    // Add a video link to a playlist
    const handleAddVideoToPlaylist = async () => {
      setAddVideo(false);
      if (!selectedPlaylist || !newVideoUrl.trim()) return;
      // Prevent duplicate links
      const alreadyExists = selectedPlaylist.videos.some(v => v.url.trim() === newVideoUrl.trim());
      if (alreadyExists) {
        alert('This video link is already in the playlist.');
        setNewVideoUrl('');
        return;
      }

      // Try to fetch video title from YouTube if possible
      let videoName = '';
      let url = newVideoUrl.trim();
      // Extract YouTube video ID
      let videoId = '';
      const shortMatch = url.match(/^https?:\/\/youtu\.be\/([\w-]+)/);
      const longMatch = url.match(/[?&]v=([\w-]+)/);
      if (shortMatch) {
        videoId = shortMatch[1];
      } else if (longMatch) {
        videoId = longMatch[1];
      } else {
        videoId = url.split('/').pop().split('?')[0];
      }
      if (videoId && YOUTUBE_API_KEY) {
        try {
          const resp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
          const data = await resp.json();
          videoName = data?.items?.[0]?.snippet?.title || '';
        } catch {}
      }
      if (!videoName) {
        // fallback: use URL as name
        videoName = url;
      }
      // Prompt user to confirm or edit the name
      // eslint-disable-next-line no-alert
      const userName = window.prompt('Enter a name for this video:', videoName);
      if (!userName) {
        setNewVideoUrl('');
        return;
      }
      const updatedPlaylists = playlists.map(pl =>
        pl.id === selectedPlaylist.id
          ? { ...pl, videos: [...pl.videos, { url, name: userName.trim(), added: Date.now() }] }
          : pl
      );
      setPlaylists(updatedPlaylists);
      // Update selectedPlaylist to reflect the new video immediately
      const updated = updatedPlaylists.find(pl => pl.id === selectedPlaylist.id);
      setSelectedPlaylist(updated);
      setNewVideoUrl('');
    };

    // Remove a video from a playlist
    const handleRemoveVideoFromPlaylist = (playlistId, url) => {
      const updatedPlaylists = playlists.map(pl =>
        pl.id === playlistId
          ? { ...pl, videos: pl.videos.filter(v => v.url !== url) }
          : pl
      );
      setPlaylists(updatedPlaylists);
      // Update selectedPlaylist to reflect the new video list immediately
      if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        const updated = updatedPlaylists.find(pl => pl.id === playlistId);
        setSelectedPlaylist(updated);
      }
    };

    // Remove a playlist
    const handleRemovePlaylist = (playlistId) => {
      setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
      if (selectedPlaylist && selectedPlaylist.id === playlistId) setSelectedPlaylist(null);
    };
  
  useEffect(() => {
    if (selectedVideo && videoPlayerRef.current) {
      // Scroll the video player into view smoothly
      videoPlayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedVideo]);

  const fetchVideos = async () => {
    if (!searchTerm) return;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          searchTerm
        )}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      setVideos(data.items || []);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    }
  };

  return (
    <div className='mt--30'>
      {/* Playlist Management UI */}
      <div className='containerDetail bg-lite color-lite m-5 p-10'>
        <div
            className='p-10 size25 color-yellow mb-5 contentLeft'
            onClick={() => toggleCollapse('playlists')}
        >
            {playlistsCollapsed ? '▸' : '▾'} 📺 Playlists
        </div> 
        {(playlistsCollapsed) 
          ? null
          : <div className='mb-10'>
            {
              (addingPlaylist)
              ? <div className=''>
                <input
                  type='text'
                  placeholder='Playlist name'
                  className='containerDetail p-10 mt-5 inputField mr-5 size20'
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                />
                <input
                  type='text'
                  placeholder='Icon/Category (optional)'
                  className='containerDetail p-10 mt-5 inputField mr-5 size20'
                  value={newPlaylistCategory}
                  onChange={e => setNewPlaylistCategory(e.target.value)}
                />
                </div>
              : null
            }
            <div className='flexContainer'>
              <div 
                className='containerDetail button bg-green color-yellow p-10 width-100-percent mt-15 ml--1 size20 mb-15 flex2Column' 
                onClick={() => (addingPlaylist) ? handleAddPlaylist() : setAddingPlaylist(true)}
              >
                  ➕ Playlist
              </div>
              {
                (addingPlaylist)
                ? null
                : <div
                    className='containerDetail button bg-yellow color-dark p-10 width-100-percent mt-15 ml-5 size20 mb-15 flex2Column'
                    onClick={() => setShowPlaylistDelete(prev => !prev)}
                    style={{minWidth: '120px'}}
                  >
                    {
                      (showPlaylistDelete) ? '🚫✏️ Playlists' : '✏️ Playlists'
                    }
                  </div>
              }
            </div>
            <div className=''>
              {playlists.length === 0 && <div className='color-lite'>No playlists yet.</div>}
              {playlists.map(pl => (
                <div 
                  key={pl.id} 
                  className='containerDetail flexContainer bg-dark color-lite m-5 p-20 contentLeft flexContainer button size20' 
                  onClick={() => setSelectedPlaylist(pl)}
                >
                  <div className='color-yellow flex2Column size30'>{pl.category} {pl.name}</div>
                  {showPlaylistDelete && (
                    <div 
                      className='flexColumn button' 
                      onClick={e => { e.stopPropagation(); handleRemovePlaylist(pl.id); }}>
                        🗑️
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        }
      </div>

      {/* Playlist Detail UI */}
      {selectedPlaylist && (
        <div className='containerDetail bg-lite color-lite m-5 p-5'>
          <div className='containerDetail flexContainer mb-10'>
            <div className='size30 color-yellow flex2Column contentLeft pl-20 pt-20 pb-20'>
              {selectedPlaylist.category} {selectedPlaylist.name}
            </div>
            <div className='flexColumn'>
              <div 
                className='containerDetail button p-20 size20' 
                onClick={() => setSelectedPlaylist(null)}
              >
                  ❌
              </div>
            </div>
          </div>
          <div className='flexContainer mb-10'>
            {
              (!addVideo)
              ? null
              : <input
                  type='text'
                  placeholder='Paste video link (YouTube, etc)'
                  className='inputField mr-5'
                  value={newVideoUrl}
                  onChange={e => setNewVideoUrl(e.target.value)}
                />
            }
            <div 
              className='containerDetail width-100-percent bg-green color-lite p-10' 
              onClick={() => (addVideo) ? handleAddVideoToPlaylist() : setAddVideo(true)}
            >
              ➕
            </div>
          </div>
          <div className=''>
            {selectedPlaylist.videos.length === 0 && <div className='color-lite'>No videos in this playlist.</div>}
            <div className='ht-200'>
              {selectedPlaylist.videos.map((v, idx) => (
                <div key={v.url + '-' + idx} className='containerDetail bg-dark color-lite p-10 flexContainer mt-5'>
                  <div className='flex2Column'>
                    <div 
                      className='contentLeft color-yellow pl-10 mt-5'
                      onClick={() => {(!playlistsCollapsed) && toggleCollapse('playlists'); setSelectedVideo(v.url.toString().replace('https://youtu.be/','').split('?')[0])}}
                    >
                      <div className='bold'>{v.name || v.url.toString().replace('https://youtu.be/','').split('?')[0]}</div>
                      <div className='mt--5 copyright color-orange'>{v.url.toString().replace('https://youtu.be/','').split('?')[0]}</div>
                    </div>
                  </div>
                  <div className='containerDetail button color-lite p-5 flexColumn' onClick={() => handleRemoveVideoFromPlaylist(selectedPlaylist.id, v.url)}>
                    🗑️
                  </div>
                </div>
            ))}
            </div>
          </div>
        </div>
      )}
      {/* Video Search/Playback UI */}
      {selectedVideo && (
          <div className='width--10 mb--5' ref={videoPlayerRef}>
            <div
              onClick={() => setSelectedVideo(null)}
              className='containerDetail color-lite absolute rt-0 m-5 text-white'
            >
              ✕
            </div>
            <iframe
              title='Selected YouTube video'
              width='100%'
              height='400'
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              frameBorder='0'
              allowFullScreen
              className='containerDetail size20 bg-lite m-5 color-lite'
            ></iframe>
          </div>
      )}
      <div className='containerDetail size20 bg-lite m-5 color-lite bg-lite'>
        <input
          type='text'
          placeholder='Enter video search...'
          className='containerDetail size20 m-5 p-10 color-yellow width--10'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchVideos()}
        />
        {/* <div
          onClick={fetchVideos}
          className='containerDetail p-10 m-5 flex13Column button bg-green'
        >
          Search
        </div> */}
      </div>
      <div className='grid'>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            className='containerDetail size20 m-5 color-lite button'
            onClick={() => setSelectedVideo(video.id.videoId)}
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              className='containerDetail bg-dark color-lite width-100-percent'
            />
            <div className='containerDetail size15 color-yellow columnLeftAlign p-15'>
              {video.snippet.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Videos;