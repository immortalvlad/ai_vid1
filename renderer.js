const container = document.getElementById('video-container');
let updateTimeout
document.getElementById('load-folder').addEventListener('click', async () => {
    const videos = await window.electronAPI.selectFolder();
    container.innerHTML = '';
    videos.forEach(src => {
        const wrapper = document.createElement('div');
        wrapper.className = 'video-thumb';

        const video = document.createElement('video');
        video.src = src;
        video.muted = true;
        video.preload = 'metadata';

        let interval;

        wrapper.addEventListener('mousemove', (e) => {
            console.log('mousemove', e);
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                console.log('mousemove action');
                const rect = wrapper.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = x / rect.width;

                if (video.duration) {
                    // video.pause();
                    video.currentTime = percent * video.duration;
                }
            }, 20); // 50 мс задержка
        });

        wrapper.addEventListener('mouseenter', () => {
            video.muted = true;
            video.play().catch(() => { });
        });

        wrapper.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });

        wrapper.addEventListener('click', () => {
            const popupVideo = document.getElementById('popup-video');
            popupVideo.src = video.src;
            popupVideo.currentTime = video.currentTime;
            popupVideo.play();
            popup.style.display = 'flex';
        });

        wrapper.appendChild(video);
        container.appendChild(wrapper);
    });
});

const popup = document.createElement('div');

popup.id = 'video-popup';
popup.innerHTML = `
  <div class="popup-overlay"></div>
  <div class="popup-content">
    <button id="close-popup">✖</button>
    <video id="popup-video" controls autoplay></video>
    <video id="preview-video" muted style="display: none;"></video>
    <canvas id="thumb-canvas" width="160" height="90" 
      style="display: none; position: fixed; border: 1px solid white; z-index: 2000;"></canvas>
  </div>
`;
document.body.appendChild(popup);



// Закрытие попапа
document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('popup-video').pause();
    popup.style.display = 'none';
});

const popupVideo = document.getElementById('popup-video');
const previewVideo = document.getElementById('preview-video');
const canvas = document.getElementById('thumb-canvas');
const ctx = canvas.getContext('2d');

// Синхронизируем видео для предпросмотра
popupVideo.addEventListener('loadedmetadata', () => {
    previewVideo.src = popupVideo.src;
    previewVideo.load();
});

popupVideo.addEventListener('mousemove', (e) => {
    const rect = popupVideo.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const timelineHeight = 30;

    if (y >= rect.height - timelineHeight) {
        const percent = x / rect.width;
        const previewTime = percent * popupVideo.duration;

        previewVideo.currentTime = previewTime;

        const drawPreview = () => {
            ctx.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
            canvas.style.display = 'block';
            canvas.style.left = `${e.clientX - canvas.width / 2}px`;
            canvas.style.top = `${rect.bottom - 140}px`; // позиция над таймлайном
            previewVideo.removeEventListener('seeked', drawPreview);
        };

        previewVideo.addEventListener('seeked', drawPreview);
    } else {
        canvas.style.display = 'none';
    }
});

popupVideo.addEventListener('mouseleave', () => {
    canvas.style.display = 'none';
});