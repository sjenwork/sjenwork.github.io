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
    
    // 加載參考資料
    loadReferences();
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

// 時間軸案例展示功能
document.addEventListener('DOMContentLoaded', function() {
    const showTimelineBtn = document.getElementById('showTimelineBtn');
    const timelinePanel = document.getElementById('timelinePanel');
    const timelineOverlay = document.getElementById('timelineOverlay');
    const timelinePanelClose = document.getElementById('timelinePanelClose');
    
    if (showTimelineBtn && timelinePanel && timelineOverlay && timelinePanelClose) {
        // 顯示時間軸面板
        showTimelineBtn.addEventListener('click', function() {
            timelinePanel.classList.add('active');
            timelineOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滾動
            
            // 初始化工作流程 Canvas
            setTimeout(initWorkflowCanvas, 500);
        });
        
        // 關閉時間軸面板的方法
        const closeTimelinePanel = function() {
            timelinePanel.classList.remove('active');
            timelineOverlay.classList.remove('active');
            document.body.style.overflow = ''; // 恢復背景滾動
        };
        
        // 點擊關閉按鈕
        timelinePanelClose.addEventListener('click', closeTimelinePanel);
        
        // 點擊遮罩層關閉
        timelineOverlay.addEventListener('click', closeTimelinePanel);
        
        // ESC 鍵關閉
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && timelinePanel.classList.contains('active')) {
                closeTimelinePanel();
            }
        });
        
        // 時間軸項目動畫
        const animateTimelineItems = function() {
            const timelineItems = document.querySelectorAll('.timeline-item');
            timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 200 * index);
            });
        };
        
        // 初始化時間軸項目樣式
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'all 0.5s ease';
        });
        
        // 打開面板時執行動畫
        showTimelineBtn.addEventListener('click', function() {
            setTimeout(animateTimelineItems, 300);
        });
        
        // 處理窗口大小變化
        window.addEventListener('resize', function() {
            if (timelinePanel.classList.contains('active')) {
                initWorkflowCanvas();
            }
        });
    }
});

// 初始化工作流程 Canvas
function initWorkflowCanvas() {
    const canvas = document.getElementById('workflowCanvas');
    if (!canvas) return;
    
    // 高解析度支持 - 適配Retina顯示
    setupHiDPICanvas(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // 計算合適的節點位置 - 修改以確保在可見範圍內
    const centerY = canvas.originalHeight * 0.35; // 稍微往上移動
    const nodes = [
        { id: 1, x: canvas.originalWidth * 0.06, y: centerY, radius: 15, color: '#4A5568', text: '收到郵件', type: 'email', description: '新電子郵件' },
        { id: 2, x: canvas.originalWidth * 0.33, y: centerY, radius: 15, color: '#7928CA', text: 'LLM分析', type: 'ai', description: '解析郵件\n內容與意圖' },
        { id: 3, x: canvas.originalWidth * 0.60, y: centerY, radius: 15, color: '#7928CA', text: '判斷類型', type: 'ai', description: '郵件分類\n決定處理方式' },
        { id: 4, x: canvas.originalWidth * 0.87, y: centerY, radius: 15, color: '#0987A0', text: '執行動作', type: 'action', description: '轉發郵件、歸檔\n或生成摘要' }
    ];
    
    // 清空畫布
    ctx.clearRect(0, 0, canvas.originalWidth, canvas.originalHeight);
    
    // 繪製連接線和箭頭
    for (let i = 0; i < nodes.length - 1; i++) {
        const startNode = nodes[i];
        const endNode = nodes[i + 1];
        drawConnection(ctx, startNode, endNode);
    }
    
    // 繪製節點
    nodes.forEach((node, index) => {
        drawNode(ctx, node, index);
    });
    
    // 添加動畫效果
    animateNodes(ctx, nodes, canvas);
    
    // 添加點擊放大功能
    setupZoomFeature(canvas, nodes);
}

// 高解析度Canvas設置
function setupHiDPICanvas(canvas) {
    // 獲取容器尺寸
    const container = canvas.parentElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // 獲取設備像素比
    const dpr = window.devicePixelRatio || 1;
    
    // 設置Canvas顯示尺寸
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';
    
    // 設置Canvas繪圖緩衝區尺寸 (更高分辨率)
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    
    // 縮放Canvas上下文以匹配設備像素比
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // 為後續使用存儲原始尺寸
    canvas.originalWidth = containerWidth;
    canvas.originalHeight = containerHeight;
}

// 繪製節點之間的連接線
function drawConnection(ctx, startNode, endNode) {
    ctx.beginPath();
    
    // 線條漸變色
    const gradient = ctx.createLinearGradient(startNode.x, startNode.y, endNode.x, endNode.y);
    gradient.addColorStop(0, hexToRgba(startNode.color, 0.8));
    gradient.addColorStop(1, hexToRgba(endNode.color, 0.8));
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3; // 增加線寬
    
    // 計算箭頭點
    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const angle = Math.atan2(dy, dx);
    
    // 避開節點
    const startX = startNode.x + (startNode.radius + 3) * Math.cos(angle);
    const startY = startNode.y + (startNode.radius + 3) * Math.sin(angle);
    const endX = endNode.x - (endNode.radius + 9) * Math.cos(angle);
    const endY = endNode.y - (endNode.radius + 9) * Math.sin(angle);
    
    // 繪製線條
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // 繪製箭頭
    const arrowSize = 8; // 增大箭頭
    ctx.beginPath();
    ctx.fillStyle = hexToRgba(endNode.color, 0.9);
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 7),
        endY - arrowSize * Math.sin(angle - Math.PI / 7)
    );
    ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 7),
        endY - arrowSize * Math.sin(angle + Math.PI / 7)
    );
    ctx.closePath();
    ctx.fill();
}

// 繪製節點
function drawNode(ctx, node, index) {
    // 繪製發光效果
    const glowRadius = node.radius * 1.8;
    const gradient = ctx.createRadialGradient(
        node.x, node.y, node.radius * 0.5,
        node.x, node.y, glowRadius
    );
    gradient.addColorStop(0, hexToRgba(node.color, 0.8));
    gradient.addColorStop(1, hexToRgba(node.color, 0));
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 繪製節點主體
    ctx.beginPath();
    ctx.fillStyle = node.color;
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 繪製節點邊框
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba('#ffffff', 0.3);
    ctx.lineWidth = 2;
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 如果是AI節點，添加特殊標記
    if (node.type === 'ai') {
        ctx.beginPath();
        ctx.fillStyle = '#FF0080';
        ctx.arc(node.x + node.radius * 0.6, node.y - node.radius * 0.6, node.radius / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加AI文字
        ctx.font = 'bold 8px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI', node.x + node.radius * 0.6, node.y - node.radius * 0.6);
    }
    
    // 繪製節點名稱
    ctx.font = '13px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.text, node.x, node.y);
    
    // 繪製節點描述 (多行文字) - 修改文字位置確保在可見範圍內
    if (node.description) {
        drawMultilineText(
            ctx,
            node.description,
            node.x,
            node.y + node.radius * 1.7, // 減少與節點的距離
            13,
            120, // 最大寬度
            'center',
            '#ffffff',
            'rgba(0, 0, 0, 0.3)',
            8
        );
    }
}

// 多行文字繪製函數
function drawMultilineText(ctx, text, x, y, lineHeight, maxWidth, align, textColor, bgColor, padding) {
    const lines = text.split('\n');
    const totalHeight = lineHeight * lines.length;
    
    // 計算背景矩形的尺寸
    let maxLineWidth = 0;
    ctx.font = '11px "Noto Sans TC", sans-serif';
    
    for (const line of lines) {
        const lineWidth = ctx.measureText(line).width;
        if (lineWidth > maxLineWidth) {
            maxLineWidth = lineWidth;
        }
    }
    
    // 限制最大寬度
    maxLineWidth = Math.min(maxLineWidth, maxWidth);
    
    // 繪製背景
    const bgWidth = maxLineWidth + padding * 2;
    const bgHeight = totalHeight + padding * 2;
    let bgX = x;
    
    if (align === 'center') {
        bgX = x - bgWidth / 2;
    } else if (align === 'right') {
        bgX = x - bgWidth;
    }
    
    // 確保背景在可見範圍內
    let bgY = y - padding;
    
    // 檢查是否超出下邊界，如果是則向上移動
    const containerHeight = ctx.canvas.originalHeight || ctx.canvas.height;
    const bottomEdge = bgY + bgHeight;
    if (bottomEdge > containerHeight - 10) {
        // 改為在節點上方顯示
        const nodeRadius = 15; // 使用一個合理的預設值
        const newBgY = y - bgHeight - nodeRadius * 2;
        if (newBgY > 10) { // 確保不會超出上邊界
            bgY = newBgY;
            y = y - bgHeight - nodeRadius * 2 + padding;
        }
    }
    
    // 繪製圓角矩形背景
    ctx.beginPath();
    ctx.fillStyle = bgColor;
    ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 5);
    ctx.fill();
    
    // 繪製多行文字
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    lines.forEach((line, i) => {
        const lineY = y + i * lineHeight;
        ctx.fillText(line, x, lineY);
    });
}

// 添加節點動畫效果
function animateNodes(ctx, nodes, canvas) {
    let time = 0;
    const animate = () => {
        time += 0.01;
        
        // 清空畫布
        ctx.clearRect(0, 0, canvas.originalWidth, canvas.originalHeight);
        
        // 重新繪製連接線
        for (let i = 0; i < nodes.length - 1; i++) {
            const startNode = nodes[i];
            const endNode = nodes[i + 1];
            drawConnection(ctx, startNode, endNode);
        }
        
        // 繪製帶有微小運動的節點
        nodes.forEach((node, index) => {
            const nodeWithOffset = { ...node };
            
            // 添加微小的上下移動
            nodeWithOffset.y = node.y + Math.sin(time + index * 0.5) * 2;
            
            drawNode(ctx, nodeWithOffset, index);
        });
        
        // 如果Canvas不在文檔中，則停止動畫
        if (!document.body.contains(canvas)) {
            return;
        }
        
        requestAnimationFrame(animate);
    };
    
    animate();
}

// 輔助函數：十六進制顏色轉換為 rgba
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 添加 roundRect 方法 (如果瀏覽器不支援)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}

// 設置放大功能
function setupZoomFeature(canvas, nodes) {
    // 獲取DOM元素
    const container = canvas.parentElement;
    const zoomOverlay = document.getElementById('workflowZoomOverlay');
    const zoomCanvas = document.getElementById('workflowZoomCanvas');
    const closeBtn = document.getElementById('workflowZoomClose');
    
    if (!zoomOverlay || !zoomCanvas || !closeBtn) return;
    
    // 點擊Canvas打開放大視圖
    container.addEventListener('click', () => {
        // 顯示放大層
        zoomOverlay.classList.add('active');
        
        // 設置放大Canvas
        setupHiDPICanvas(zoomCanvas);
        
        // 重新計算節點位置，使其適應放大Canvas
        const scaledNodes = nodes.map(node => {
            const scaleFactorX = zoomCanvas.originalWidth / canvas.originalWidth;
            const scaleFactorY = zoomCanvas.originalHeight / canvas.originalHeight;
            
            return {
                ...node,
                x: node.x * scaleFactorX,
                y: node.y * scaleFactorY,
                radius: node.radius * 1.5, // 放大節點
            };
        });
        
        // 繪製放大的工作流程圖
        const zoomCtx = zoomCanvas.getContext('2d');
        
        // 清空畫布
        zoomCtx.clearRect(0, 0, zoomCanvas.originalWidth, zoomCanvas.originalHeight);
        
        // 繪製連接線
        for (let i = 0; i < scaledNodes.length - 1; i++) {
            drawConnection(zoomCtx, scaledNodes[i], scaledNodes[i + 1]);
        }
        
        // 繪製節點
        scaledNodes.forEach((node, index) => {
            drawNode(zoomCtx, node, index);
        });
        
        // 添加節點動畫
        animateNodes(zoomCtx, scaledNodes, zoomCanvas);
        
        // 阻止頁面滾動
        document.body.style.overflow = 'hidden';
    });
    
    // 點擊關閉按鈕關閉放大視圖
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止事件冒泡
        zoomOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 點擊背景關閉放大視圖
    zoomOverlay.addEventListener('click', (e) => {
        if (e.target === zoomOverlay) {
            zoomOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // ESC 鍵關閉放大視圖
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && zoomOverlay.classList.contains('active')) {
            zoomOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// 處理窗口大小變化，重新初始化Canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('workflowCanvas');
    const zoomCanvas = document.getElementById('workflowZoomCanvas');
    const zoomOverlay = document.getElementById('workflowZoomOverlay');
    
    // 重新初始化普通Canvas
    if (canvas && canvas.parentElement.offsetWidth > 0) {
        initWorkflowCanvas();
    }
    
    // 如果放大視圖已打開，也重新初始化放大Canvas
    if (zoomCanvas && zoomOverlay && zoomOverlay.classList.contains('active')) {
        // 在此處可以調用特定函數重新繪製放大視圖
        // 或者直接關閉放大視圖
        zoomOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// 加載參考資料
async function loadReferences() {
    try {
        const response = await fetch('references.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        renderReferences(data);
    } catch (error) {
        console.error('加載參考資料時發生錯誤:', error);
        document.getElementById('referencesContainer').innerHTML = 
            '<p class="error">加載參考資料時發生錯誤。請刷新頁面或稍後再試。</p>';
    }
}

// 渲染參考資料
function renderReferences(data) {
    const container = document.getElementById('referencesContainer');
    container.innerHTML = '';
    
    data.categories.forEach(category => {
        // 創建類別區域
        const sectionEl = document.createElement('div');
        sectionEl.className = 'ref-section';
        
        // 創建標題
        const titleEl = document.createElement('h3');
        titleEl.className = category.id;
        titleEl.textContent = category.title;
        sectionEl.appendChild(titleEl);
        
        // 創建引用網格
        const gridEl = document.createElement('div');
        gridEl.className = 'ref-grid';
        
        // 添加每個引用
        category.references.forEach(ref => {
            const cardEl = document.createElement('div');
            cardEl.className = `ref-card ${category.id}`;
            
            const authorEl = document.createElement('strong');
            authorEl.textContent = ref.author;
            
            const linkEl = document.createElement('a');
            linkEl.href = ref.url;
            linkEl.target = '_blank';
            linkEl.textContent = ref.title;
            
            cardEl.appendChild(authorEl);
            cardEl.appendChild(linkEl);
            gridEl.appendChild(cardEl);
        });
        
        sectionEl.appendChild(gridEl);
        container.appendChild(sectionEl);
    });
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initWorkflowCanvas();
});

// 滾動指示器處理
document.addEventListener('DOMContentLoaded', function() {
    const contentScrollables = document.querySelectorAll('.content-scrollable');
    
    contentScrollables.forEach(scrollable => {
        scrollable.addEventListener('scroll', function() {
            if (this.scrollTop > 20) {
                this.classList.add('scrolled');
            } else {
                this.classList.remove('scrolled');
            }
        });
    });
}); 