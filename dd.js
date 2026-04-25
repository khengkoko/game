let currentSlide = 1;
const totalSlides = 3;

function nextSlide() {
    if (currentSlide >= totalSlides) return;
    
    const overlay = document.getElementById('transition-overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';

    // 🌸 触发密集的花瓣雨（利用你现有的 confetti 库）
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#ffb7c5', '#ff99aa', '#ffffff'], // 樱花色系
        shapes: ['circle']
    });

    // 在花瓣漫天飞舞的瞬间（0.5秒后）切换内容
    setTimeout(() => {
        document.getElementById(`slide-${currentSlide}`).classList.remove('active');
        currentSlide++;
        document.getElementById(`slide-${currentSlide}`).classList.add('active');
        
        // 渐隐遮罩层
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 500);
        }, 300);
    }, 500);
}

// 绑定键盘右键或点击事件
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
});
