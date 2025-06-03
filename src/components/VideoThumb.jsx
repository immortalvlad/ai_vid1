// components/VideoThumb.jsx
import React, { useRef } from 'react';

function VideoThumb({ src, onSelect }) {
  const videoRef = useRef();
  let updateTimeout;

  const handleMouseMove = (e) => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      const video = videoRef.current;
      const rect = video.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      if (video.duration) {
        video.currentTime = percent * video.duration;
      }
    }, 20);
  };

  return (
    <div
      className="video-thumb"
      onMouseEnter={() => videoRef.current.play()}
      onMouseLeave={() => {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }}
      onMouseMove={handleMouseMove}
      onClick={() => onSelect({ src, time: videoRef.current.currentTime })}
    >
      <video ref={videoRef} src={src} muted preload="metadata" />
    </div>
  );
}

export default VideoThumb;
