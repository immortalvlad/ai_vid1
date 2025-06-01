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
            }, 50); // 50 мс задержка
        });

        wrapper.addEventListener('mouseenter', () => {
            video.muted = true;
            video.play().catch(() => { });
        });

        wrapper.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });

        wrapper.appendChild(video);
        container.appendChild(wrapper);
    });
});
