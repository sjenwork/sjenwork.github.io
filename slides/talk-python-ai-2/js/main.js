// main.js - 簡報互動與動畫控制

document.addEventListener('DOMContentLoaded', function() {
    // 初始化變量
    let currentSlide = 1;
    const totalSlides = document.querySelectorAll('.slide').length;
    
    // 更新進度條
    function updateProgressBar() {
        const progressPercentage = (currentSlide / totalSlides) * 100;
        document.querySelector('.progress-bar').style.width = `${progressPercentage}%`;
    }
    
    // 更新頁面指示器
    function updatePageIndicator() {
        document.querySelector('.current-page').textContent = currentSlide;
        document.querySelector('.total-pages').textContent = totalSlides;
    }
    
    // 更新垂直導航點
    function updateNavDots() {
        // 移除所有點的active類
        document.querySelectorAll('.nav-dot').forEach(dot => {
            dot.classList.remove('active');
        });
        
        // 為當前頁面的點添加active類
        const currentDot = document.querySelector(`.nav-dot[data-slide="${currentSlide}"]`);
        if (currentDot) {
            currentDot.classList.add('active');
        }
    }
    
    // 切換幻燈片時觸發動畫效果
    function triggerAnimations(slideNumber) {
        // 根據幻燈片編號啟動對應的動畫
        if (slideNumber ) {
            // 先確保所有內容塊可見
            const contentBlocks = document.querySelectorAll('.slide .content-block');
            contentBlocks.forEach(block => {
                block.style.opacity = '1'; // 確保內容可見
                block.style.transform = 'translateX(0)'; // 確保位置正確
            });

            // 確保分隔線可見
            const dividers = document.querySelectorAll('.slide .section-divider');
            dividers.forEach(divider => {
                divider.style.opacity = '1';
                divider.style.transform = 'scale(1)';
            });

            // 確保角落圖標可見
            const cornerIcon = document.querySelector('.slide .corner-icon');
            if (cornerIcon) {
                cornerIcon.style.opacity = '1';
            }
            
            // 為內容塊添加邊框發光效果
            setTimeout(() => {
                contentBlocks.forEach((block, index) => {
                    setTimeout(() => {
                        block.style.animation = 'borderGlow 10s ease-in-out infinite';
                    }, index * 300);
                });
            }, 1000);
        }
    }
    
    // 重置所有動畫狀態，但不隱藏元素
    function resetAnimations() {
        document.querySelectorAll('.slide:not(.active) .content-block').forEach(el => {
            el.style.animation = '';
        });
    }
    
    // 切換幻燈片
    function showSlide(slideNumber) {
        // 隱藏所有幻燈片
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });
        
        // 重置舊幻燈片的動畫
        resetAnimations();
        
        // 顯示目標幻燈片
        const targetSlide = document.getElementById(`slide-${slideNumber}`);
        if (targetSlide) {
            targetSlide.classList.add('active');
            currentSlide = slideNumber;
            updateProgressBar();
            updatePageIndicator();
            updateNavDots();
            
            // 觸發新頁面的動畫效果
            triggerAnimations(slideNumber);
        }
    }
    
    // 下一張幻燈片
    function nextSlide() {
        if (currentSlide < totalSlides) {
            showSlide(currentSlide + 1);
        }
    }
    
    // 上一張幻燈片
    function prevSlide() {
        if (currentSlide > 1) {
            showSlide(currentSlide - 1);
        }
    }
    
    // 綁定事件：鍵盤導航
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });
    
    // 綁定事件：導航點點擊
    document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const slideNumber = parseInt(this.getAttribute('data-slide'));
            showSlide(slideNumber);
        });
    });
    
    // 設置初始狀態
    updateProgressBar();
    updatePageIndicator();
    updateNavDots();
    
    // 如果頁面中有URL參數指定頁碼，則跳轉到該頁
    const urlParams = new URLSearchParams(window.location.search);
    const slideParam = urlParams.get('slide');
    if (slideParam) {
        const slideNum = parseInt(slideParam);
        if (!isNaN(slideNum) && slideNum > 0 && slideNum <= totalSlides) {
            showSlide(slideNum);
        }
    } else {
        // 如果沒有URL參數，默認觸發當前頁面的動畫
        triggerAnimations(currentSlide);
    }
}); 