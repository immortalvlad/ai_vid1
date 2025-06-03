// App.jsx
import React, { useState, useRef, useEffect } from 'react';
import VideoThumb from './components/VideoThumb';
import PopupPlayer from './components/PopupPlayer';
import './App.css';

function App() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    window.electronAPI?.selectFolder?.().then(setVideos);
  }, []);

  return (
    <div className="app">
      <div className="video-container">
        {videos.map((src, i) => (
          <VideoThumb key={i} src={src} onSelect={setCurrentVideo} />
        ))}
      </div>

      {currentVideo && (
        <PopupPlayer video={currentVideo} onClose={() => setCurrentVideo(null)} />
      )}
    </div>
  );
}

export default App;
