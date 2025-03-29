// 等待DOM內容載入完成
document.addEventListener('DOMContentLoaded', () => {
    // 註冊GSAP插件
    gsap.registerPlugin(ScrollTrigger);
    
    // 創建隨機視差元素
    createParallaxElements();
    
    // 初始化動畫
    initAnimations();
    
    // 設置首個幻燈片立即可見
    document.querySelector('.slide').classList.add('active');
    
    // 添加鍵盤導航
    setupKeyboardNavigation();
    
    // 處理內部滾動
    setupInternalScrolling();
    
    // 添加觸摸屏導航
    setupTouchNavigation();
});

// 創建隨機視差元素 - 優化視差元素的分佈和動畫效果
function createParallaxElements() {
    const slides = document.querySelectorAll('.slide');
    
    slides.forEach(slide => {
        // 為每個幻燈片創建背景視差層
        const parallaxBg = document.createElement('div');
        parallaxBg.classList.add('parallax-bg');
        slide.appendChild(parallaxBg);
        
        // 添加發光效果 - 減少數量並優化位置
        // 第一個發光效果
        const glowEffect1 = document.createElement('div');
        glowEffect1.classList.add('glow-effect');
        // 使發光效果位置更加分散
        glowEffect1.style.left = `${20 + Math.random() * 20}%`;
        glowEffect1.style.top = `${20 + Math.random() * 20}%`;
        parallaxBg.appendChild(glowEffect1);
        
        // 第二個發光效果
        const glowEffect2 = document.createElement('div');
        glowEffect2.classList.add('glow-effect');
        glowEffect2.style.left = `${60 + Math.random() * 20}%`;
        glowEffect2.style.top = `${60 + Math.random() * 20}%`;
        parallaxBg.appendChild(glowEffect2);
        
        // 添加浮動粒子 - 減少數量並調整透明度
        for (let i = 0; i < 12; i++) { // 減少粒子數量
            const particle = document.createElement('div');
            particle.classList.add('floating-particle');
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${2 + Math.random() * 3}px`; // 減小粒子尺寸
            particle.style.height = particle.style.width;
            particle.style.opacity = (0.1 + Math.random() * 0.2).toString(); // 降低透明度
            parallaxBg.appendChild(particle);
            
            // 給粒子添加更平滑的隨機動畫
            gsap.to(particle, {
                y: `${-30 + Math.random() * 60}`, // 減小移動幅度
                x: `${-30 + Math.random() * 60}`,
                duration: 15 + Math.random() * 15, // 增加動畫時間，使移動更平滑
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
        
        // 給發光效果添加更平滑的視差動畫
        gsap.to(glowEffect1, {
            y: 50, // 減少移動幅度
            x: 30,
            scrollTrigger: {
                trigger: slide,
                start: "top bottom",
                end: "bottom top",
                scrub: 2.5, // 增加平滑度
            }
        });
        
        gsap.to(glowEffect2, {
            y: -50,
            x: -30,
            scrollTrigger: {
                trigger: slide,
                start: "top bottom",
                end: "bottom top",
                scrub: 3, // 增加平滑度
            }
        });
    });
}

// 初始化所有動畫 - 優化過渡效果
function initAnimations() {
    // 為每個幻燈片設置更平滑的入場動畫
    gsap.utils.toArray('.slide').forEach((slide, i) => {
        // 創建時間軸
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: slide,
                start: "top 85%", // 提前觸發
                end: "top 15%",
                toggleActions: "play none none reverse",
                // markers: true, // 調試時可開啟
            }
        });
        
        // 幻燈片入場動畫 - 使用更平滑的過渡
        tl.to(slide, {
            opacity: 1,
            y: 0,
            duration: 1.2, // 延長過渡時間
            ease: "power1.out", // 使用更平滑的緩動
        });
        
        // 特殊處理feature-list，確保其子項正確顯示
        const featureItems = slide.querySelectorAll('.feature-list li');
        if (featureItems.length > 0) {
            tl.from(featureItems, {
                y: 20, // 減少移動幅度
                opacity: 0,
                duration: 0.8,
                stagger: 0.08, // 特性項的交錯效果
                ease: "power2.out",
                clearProps: "transform" // 完成後清除transform屬性
            }, "-=0.8");
        }
        
        // 其他內容元素的交錯動畫 - 排除feature-list li
        const contentElements = slide.querySelectorAll('h2, h3, h4, p, .two-columns > div, .examples, .level, .type, .example-card, .component, .workflow-step, .what-is-rag, .point, .application');
        
        tl.from(contentElements, {
            y: 30, // 減少移動幅度
            opacity: 0,
            duration: 0.8,
            stagger: 0.05, // 減少元素間隔時間
            ease: "power2.out", // 使用更平滑的緩動
        }, "-=0.8");
        
        // 為幻燈片添加更柔和的視差滾動效果
        gsap.to(slide.querySelector('.content'), {
            y: -30, // 減少移動幅度
            scrollTrigger: {
                trigger: slide,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5, // 增加平滑度
            }
        });
    });
    
    // 為第一個幻燈片特殊處理 - 使初始動畫更平滑
    const titleSlide = document.querySelector('.title-slide');
    if (titleSlide) {
        const titleTl = gsap.timeline({delay: 0.3}); // 減少延遲
        
        // 標題和裝飾特效 - 修改為更好的重疊效果
        titleTl.from('.decoration', {
            scale: 0.3, 
            opacity: 0,
            duration: 2,
            ease: "power2.out"
        });
        
        titleTl.from('.title', {
            opacity: 0,
            scale: 0.9,
            duration: 1.5,
            ease: "power2.out"
        }, "-=1.5"); // 讓標題和裝飾一起出現
        
        // 演講者信息淡入
        titleTl.from('.presenter-info', {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: "power2.out"
        }, "-=0.8");
        
        // 鍵盤提示淡入
        titleTl.from('.keyboard-hint', {
            opacity: 0,
            y: 10,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.5");
    }
    
    // 為工作流程步驟添加連接線動畫
    const workflowSteps = document.querySelectorAll('.workflow-step');
    workflowSteps.forEach((step, index) => {
        if (index < workflowSteps.length - 1) {
            gsap.to(step, {
                scrollTrigger: {
                    trigger: step,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                    onEnter: () => highlightStep(index)
                }
            });
        }
    });
    
    // 為基礎概念添加懸停效果
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.addEventListener('mouseenter', () => {
            gsap.to(column, {
                scale: 1.03,
                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.4)",
                duration: 0.3
            });
        });
        
        column.addEventListener('mouseleave', () => {
            gsap.to(column, {
                scale: 1,
                boxShadow: "none",
                duration: 0.3
            });
        });
    });
    
    // 為核心特點添加點擊交互
    const features = document.querySelectorAll('.feature-list li');
    features.forEach(feature => {
        // 確保初始狀態是正確的
        gsap.set(feature, {
            clearProps: "transform"
        });
        
        feature.addEventListener('click', () => {
            gsap.to(feature, {
                scale: 1.1,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    // 動畫完成後重置transform
                    gsap.set(feature, {
                        clearProps: "transform"
                    });
                }
            });
        });
    });
    
    // 為例子卡片添加隨機浮動動畫
    const exampleCards = document.querySelectorAll('.example-card');
    exampleCards.forEach(card => {
        gsap.to(card, {
            y: -3 + Math.random() * 6, // 減小移動幅度，範圍從-3到+3像素
            duration: 3 + Math.random(), // 增加動畫時間，讓動作更加緩慢
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });
    
    // 為頁面滾動添加導航功能
    setupScrollNavigation();
}

// 高亮當前工作流程步驟
function highlightStep(index) {
    const steps = document.querySelectorAll('.workflow-step');
    
    gsap.to(steps, {
        backgroundColor: "var(--light-bg)",
        color: "var(--text)",
        duration: 0.3
    });
    
    gsap.to(steps[index], {
        backgroundColor: "var(--medium-bg)",
        color: "#fff",
        duration: 0.3
    });
    
    // 如果是第5步，突出顯示第2步，以表示循環
    if (index === 4) {
        setTimeout(() => {
            gsap.to(steps[1], {
                backgroundColor: "rgba(121, 40, 202, 0.3)",
                duration: 0.3
            });
        }, 1000);
    }
}

// 設置滾動導航
function setupScrollNavigation() {
    // 在頁面上創建一個神秘的小導航點
    const nav = document.createElement('div');
    nav.className = 'scroll-nav';
    document.body.appendChild(nav);
    
    // 為每個幻燈片添加導航點
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        const dot = document.createElement('div');
        dot.className = 'nav-dot';
        dot.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        nav.appendChild(dot);
        
        // 點擊導航點時滾動到對應幻燈片
        dot.addEventListener('click', () => {
            slide.scrollIntoView({ behavior: 'smooth' });
        });
        
        // 設置滾動觸發器以高亮當前導航點
        ScrollTrigger.create({
            trigger: slide,
            start: "top center",
            end: "bottom center",
            onEnter: () => highlightDot(index),
            onEnterBack: () => highlightDot(index)
        });
    });
    
    // 初始高亮第一個點
    highlightDot(0);
}

// 高亮當前導航點
function highlightDot(index) {
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, i) => {
        if (i === index) {
            gsap.to(dot, {
                backgroundColor: "var(--accent)",
                scale: 1.3,
                boxShadow: "0 0 10px var(--accent)",
                duration: 0.3
            });
        } else {
            gsap.to(dot, {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                scale: 1,
                boxShadow: "none",
                duration: 0.3
            });
        }
    });
}

// 設置鍵盤導航
function setupKeyboardNavigation() {
    const slides = document.querySelectorAll('.slide');
    let currentSlideIndex = 0;
    
    // 添加鍵盤事件監聽
    document.addEventListener('keydown', (e) => {
        // 左箭頭或上箭頭 - 前一頁
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                navigateToSlide(currentSlideIndex);
            }
        }
        // 右箭頭或下箭頭 - 後一頁
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentSlideIndex < slides.length - 1) {
                currentSlideIndex++;
                navigateToSlide(currentSlideIndex);
            }
        }
    });
    
    // 滾動監聽，更新當前幻燈片索引
    slides.forEach((slide, index) => {
        ScrollTrigger.create({
            trigger: slide,
            start: "top center",
            end: "bottom center",
            onEnter: () => { currentSlideIndex = index; },
            onEnterBack: () => { currentSlideIndex = index; }
        });
    });
}

// 導航到指定幻燈片
function navigateToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (index >= 0 && index < slides.length) {
        // 平滑滾動到目標幻燈片
        slides[index].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // 高亮對應的導航點
        highlightDot(index);
    }
}

// 設置內部滾動
function setupInternalScrolling() {
    // 處理所有可滾動內容區域
    const scrollableAreas = document.querySelectorAll('.content-scrollable');
    
    scrollableAreas.forEach(area => {
        // 阻止滾輪事件冒泡到頁面，防止切換幻燈片
        area.addEventListener('wheel', (e) => {
            const deltaY = e.deltaY;
            const scrollTop = area.scrollTop;
            const scrollHeight = area.scrollHeight;
            const clientHeight = area.clientHeight;
            
            // 當滾動到底部或頂部時不阻止事件
            if ((scrollTop <= 0 && deltaY < 0) || 
                (scrollTop + clientHeight >= scrollHeight && deltaY > 0)) {
                // 滾動到邊界，不阻止事件，但需要一定延遲避免立即切換幻燈片
                setTimeout(() => {
                    return;
                }, 300);
            } else {
                // 未滾動到邊界，阻止事件冒泡，防止切換幻燈片
                e.stopPropagation();
            }
        }, { passive: false });
    });
    
    // 轉換所有幻燈片為內部滾動結構
    document.querySelectorAll('.slide').forEach(slide => {
        const content = slide.querySelector('.content');
        
        // 如果尚未設置內部滾動結構，則轉換
        if (content && !content.querySelector('.content-scrollable')) {
            // 找到內容標題
            const title = content.querySelector('h2');
            
            if (title) {
                // 創建標題容器
                const titleContainer = document.createElement('div');
                titleContainer.className = 'content-title';
                
                // 移除原標題並添加到標題容器
                title.parentNode.insertBefore(titleContainer, title);
                titleContainer.appendChild(title);
                
                // 創建可滾動容器
                const scrollableContainer = document.createElement('div');
                scrollableContainer.className = 'content-scrollable';
                
                // 將剩餘內容移到可滾動容器
                while (content.children.length > 1) {
                    scrollableContainer.appendChild(content.children[1]);
                }
                
                content.appendChild(scrollableContainer);
            }
        }
    });
    
    // 修復視差動畫和滾動
    fixParallaxForScrollable();
}

// 修復滾動內容的視差效果
function fixParallaxForScrollable() {
    // 重新設置幻燈片內容的視差效果
    document.querySelectorAll('.slide').forEach(slide => {
        const content = slide.querySelector('.content');
        const scrollable = slide.querySelector('.content-scrollable');
        
        if (content && scrollable) {
            // 清除原有內容的視差效果
            const contentTween = gsap.getTweensOf(content);
            if (contentTween.length > 0) {
                contentTween.forEach(tween => tween.kill());
            }
            
            // 設置滾動容器的視差效果
            gsap.to(scrollable, {
                y: -20, // 減小移動幅度
                scrollTrigger: {
                    trigger: slide,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.5,
                }
            });
        }
    });
    
    // 防止鍵盤導航與內部滾動衝突
    document.querySelectorAll('.content-scrollable').forEach(scrollable => {
        scrollable.addEventListener('keydown', (e) => {
            // 攔截方向鍵，防止觸發頁面切換
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.stopPropagation();
            }
        });
    });
    
    // 修改 ScrollTrigger 設置，使得內部滾動更順滑
    ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });
    
    // 刷新ScrollTrigger
    ScrollTrigger.refresh();
}

// 設置觸摸屏導航
function setupTouchNavigation() {
    const slides = document.querySelectorAll('.slide');
    let currentSlideIndex = 0;
    
    // 創建左右觸摸區域
    const leftTouchArea = document.createElement('div');
    leftTouchArea.className = 'touch-nav-area left-nav';
    
    const rightTouchArea = document.createElement('div');
    rightTouchArea.className = 'touch-nav-area right-nav';
    
    document.body.appendChild(leftTouchArea);
    document.body.appendChild(rightTouchArea);
    
    // 左側區域點擊 - 前一頁
    leftTouchArea.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            navigateToSlide(currentSlideIndex);
        }
    });
    
    // 右側區域點擊 - 後一頁
    rightTouchArea.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            navigateToSlide(currentSlideIndex);
        }
    });
    
    // 監聽觸摸事件，防止內容區域觸摸冒泡到導航區域
    document.querySelectorAll('.content-scrollable').forEach(scrollable => {
        scrollable.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });
        
        scrollable.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
        
        scrollable.addEventListener('touchend', (e) => {
            e.stopPropagation();
        });
    });
    
    // 更新當前幻燈片索引的監聽 (複用鍵盤導航的監聽)
    slides.forEach((slide, index) => {
        ScrollTrigger.create({
            trigger: slide,
            start: "top center",
            end: "bottom center",
            onEnter: () => { currentSlideIndex = index; },
            onEnterBack: () => { currentSlideIndex = index; }
        });
    });
    
    // 添加觸摸指示器
    addTouchIndicators();
}

// 添加觸摸指示器
function addTouchIndicators() {
    // 左右指示器
    const indicators = {
        left: document.createElement('div'),
        right: document.createElement('div')
    };
    
    indicators.left.className = 'touch-indicator left';
    indicators.left.innerHTML = '<span>◀</span>';
    
    indicators.right.className = 'touch-indicator right';
    indicators.right.innerHTML = '<span>▶</span>';
    
    document.body.appendChild(indicators.left);
    document.body.appendChild(indicators.right);
    
    // 移動設備才顯示指示器
    if (isMobileDevice()) {
        const showIndicators = () => {
            gsap.to([indicators.left, indicators.right], {
                opacity: 0.7,
                duration: 0.3
            });
            
            // 短暫顯示後隱藏
            setTimeout(() => {
                gsap.to([indicators.left, indicators.right], {
                    opacity: 0,
                    duration: 0.5
                });
            }, 1500);
        };
        
        // 初始顯示指示器
        showIndicators();
        
        // 滾動時再次顯示
        window.addEventListener('scroll', showIndicators, { passive: true });
        
        // 點擊時也顯示
        document.addEventListener('click', showIndicators);
    }
}

// 檢測是否為移動設備
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
} 