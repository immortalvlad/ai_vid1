import React, { useRef, useEffect, useState } from 'react';

// Вставляем обновлённый CustomTimeline с превью прямо сюда,
// или импортируем из отдельного файла
function CustomTimeline({ videoRef }) {
    const [progress, setProgress] = useState(0);
    const timelineRef = useRef(null);
    const previewVideoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        console.log('CustomTimeline mounted');
        if (!videoRef.current) return;

        const updateProgress = () => {
            if (!isDragging) {
                const current = videoRef.current.currentTime;
                const duration = videoRef.current.duration || 1;
                setProgress((current / duration) * 100);
            }
        };

        videoRef.current.addEventListener('timeupdate', updateProgress);

        return () => {
            if (videoRef.current)
                videoRef.current.removeEventListener('timeupdate', updateProgress);
        };
    }, [videoRef]);

    const seek = (e) => {
        if (!videoRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
        videoRef.current.currentTime = percent * videoRef.current.duration;
        setProgress(percent * 100);
    };

    const onMouseDown = (e) => {
        setIsDragging(true);
        seek(e);

        // window.addEventListener('mousemove', onMouseMove);
        // window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        // if (!timelineRef.current || !videoRef.current || !previewVideoRef.current || !canvasRef.current) return;
        if (isDragging) {
            seek(e);
        }

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        if (x < 0 || x > rect.width) {
            setShowPreview(false);
            return;
        }

        setShowPreview(true);

        const percent = x / rect.width;
        const previewTime = percent * videoRef.current.duration;

        console.log('Mouse X:', x, 'Preview time:', previewTime);

        const previewVideo = previewVideoRef.current;
        previewVideo.currentTime = previewTime;

        const onSeeked = () => {
            console.log('Seeked to:', previewVideo.currentTime);
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(previewVideo, 0, 0, canvasRef.current.width, canvasRef.current.height);

            canvasRef.current.style.left = `${e.clientX - canvasRef.current.width / 2}px`;
            canvasRef.current.style.top = `${rect.top - canvasRef.current.height - 10}px`;
        };

        previewVideo.addEventListener('seeked', onSeeked, { once: true });
    };

    const onMouseLeave = () => {
        setShowPreview(false);
    };

    const onMouseUp = (e) => {
        if (isDragging) {
            setIsDragging(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
    };

    // Отрисовка превью на canvas после seeked
    useEffect(() => {
        const canvas = canvasRef.current;
        const previewVideo = previewVideoRef.current;
        if (!canvas || !previewVideo) return;

        const ctx = canvas.getContext('2d');

        const drawFrame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
        };

        previewVideo.addEventListener('seeked', drawFrame);

        return () => {
            previewVideo.removeEventListener('seeked', drawFrame);
        };
    }, []);

    useEffect(() => {
        if (previewVideoRef.current) {
            previewVideoRef.current.muted = true;
            previewVideoRef.current.preload = 'metadata';
            previewVideoRef.current.src = videoRef.current?.src || '';
            previewVideoRef.current.load();
        }
    }, [videoRef.current?.src]);

    return (
        <>
            <div
                className="custom-timeline"
                ref={timelineRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                style={{ userSelect: 'none' }}
            >
                <div className="progress" style={{ width: `${progress}%` }} />
                <div className="thumb" style={{ left: `${progress}%` }} />
            </div>
            {showPreview && (
                <canvas
                    ref={canvasRef}
                    width={160}
                    height={90}
                    className="preview-canvas"
                    style={{
                        position: 'fixed',
                        pointerEvents: 'none',
                        left: previewPos.x - 80,
                        top: previewPos.y - 100,
                        border: '1px solid white',
                        borderRadius: 4,
                        backgroundColor: 'black',
                        zIndex: 10000,
                    }}
                />
            )}
            <video
                ref={previewVideoRef}
                src={videoRef.current?.src}
                muted
                playsInline
                preload="metadata"
                style={{ display: 'none' }}
            />
        </>
    );
}

function PopupPlayer({ video, onClose }) {
    const popupVideoRef = useRef();
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const videoEl = popupVideoRef.current;
        if (!videoEl) return;  // <-- Проверка, чтобы не было null

        const updateTime = () => setCurrentTime(videoEl.currentTime);
        const updateDuration = () => setDuration(videoEl.duration);

        videoEl.addEventListener('timeupdate', updateTime);
        videoEl.addEventListener('loadedmetadata', updateDuration);

        // Устанавливаем текущее время при монтировании
        videoEl.currentTime = video.time;

        return () => {
            videoEl.removeEventListener('timeupdate', updateTime);
            videoEl.removeEventListener('loadedmetadata', updateDuration);
        };
    }, [video]);

    const togglePlay = () => {
        const videoEl = popupVideoRef.current;
        if (!videoEl) return;
        if (videoEl.paused) {
            videoEl.play();
            setIsPlaying(true);
        } else {
            videoEl.pause();
            setIsPlaying(false);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <div className="popup">
            <div className="popup-overlay" onClick={onClose}></div>
            <div className="popup-content">
                <button onClick={onClose}>✖</button>
                <video
                    ref={popupVideoRef}
                    src={video.src}
                    autoPlay
                    onClick={togglePlay}
                    className="popup-video"
                />
                <div className="timeline-controls">
                    <span>{formatTime(currentTime)}</span>
                    <CustomTimeline videoRef={popupVideoRef} />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}

export default PopupPlayer;
