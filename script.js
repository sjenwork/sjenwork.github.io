// 等待DOM内容加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 注册GSAP插件
    gsap.registerPlugin(ScrollTrigger);
    
    // 创建随机视差元素
    createParallaxElements();
    
    // 初始化动画
    initAnimations();
    
    // 设置首个幻灯片立即可见
    document.querySelector('.slide').classList.add('active');
    
    // 添加键盘导航
    setupKeyboardNavigation();
    
    // 处理内部滚动
    setupInternalScrolling();
    
    // 添加触摸屏导航
    setupTouchNavigation();
});

// 创建随机视差元素 - 优化视差元素的分布和动画效果
function createParallaxElements() {
    const slides = document.querySelectorAll('.slide');
    
    slides.forEach(slide => {
        // 为每个幻灯片创建背景视差层
        const parallaxBg = document.createElement('div');
        parallaxBg.classList.add('parallax-bg');
        slide.appendChild(parallaxBg);
        
        // 添加发光效果 - 减少数量并优化位置
        // 第一个发光效果
        const glowEffect1 = document.createElement('div');
        glowEffect1.classList.add('glow-effect');
        // 使发光效果位置更加分散
        glowEffect1.style.left = `${20 + Math.random() * 20}%`;
        glowEffect1.style.top = `${20 + Math.random() * 20}%`;
        parallaxBg.appendChild(glowEffect1);
        
        // 第二个发光效果
        const glowEffect2 = document.createElement('div');
        glowEffect2.classList.add('glow-effect');
        glowEffect2.style.left = `${60 + Math.random() * 20}%`;
        glowEffect2.style.top = `${60 + Math.random() * 20}%`;
        parallaxBg.appendChild(glowEffect2);
        
        // 添加浮动粒子 - 减少数量并调整透明度
        for (let i = 0; i < 12; i++) { // 减少粒子数量
            const particle = document.createElement('div');
            particle.classList.add('floating-particle');
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${2 + Math.random() * 3}px`; // 减小粒子尺寸
            particle.style.height = particle.style.width;
            particle.style.opacity = (0.1 + Math.random() * 0.2).toString(); // 降低透明度
            parallaxBg.appendChild(particle);
            
            // 给粒子添加更平滑的随机动画
            gsap.to(particle, {
                y: `${-30 + Math.random() * 60}`, // 减小移动幅度
                x: `${-30 + Math.random() * 60}`,
                duration: 15 + Math.random() * 15, // 增加动画时间，使移动更平滑
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
        
        // 给发光效果添加更平滑的视差动画
        gsap.to(glowEffect1, {
            y: 50, // 减少移动幅度
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

// 初始化所有动画 - 优化过渡效果
function initAnimations() {
    // 为每个幻灯片设置更平滑的入场动画
    gsap.utils.toArray('.slide').forEach((slide, i) => {
        // 创建时间轴
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: slide,
                start: "top 85%", // 提前触发
                end: "top 15%",
                toggleActions: "play none none reverse",
                // markers: true, // 调试时可开启
            }
        });
        
        // 幻灯片入场动画 - 使用更平滑的过渡
        tl.to(slide, {
            opacity: 1,
            y: 0,
            duration: 1.2, // 延长过渡时间
            ease: "power1.out", // 使用更平滑的缓动
        });
        
        // 特殊处理feature-list，确保其子项正确显示
        const featureItems = slide.querySelectorAll('.feature-list li');
        if (featureItems.length > 0) {
            tl.from(featureItems, {
                y: 20, // 减少移动幅度
                opacity: 0,
                duration: 0.8,
                stagger: 0.08, // 特性项的交错效果
                ease: "power2.out",
                clearProps: "transform" // 完成后清除transform属性
            }, "-=0.8");
        }
        
        // 其他内容元素的交错动画 - 排除feature-list li
        const contentElements = slide.querySelectorAll('h2, h3, h4, p, .two-columns > div, .examples, .level, .type, .example-card, .component, .workflow-step, .what-is-rag, .point, .application');
        
        tl.from(contentElements, {
            y: 30, // 减少移动幅度
            opacity: 0,
            duration: 0.8,
            stagger: 0.05, // 减少元素间隔时间
            ease: "power2.out", // 使用更平滑的缓动
        }, "-=0.8");
        
        // 为幻灯片添加更柔和的视差滚动效果
        gsap.to(slide.querySelector('.content'), {
            y: -30, // 减少移动幅度
            scrollTrigger: {
                trigger: slide,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5, // 增加平滑度
            }
        });
    });
    
    // 为第一个幻灯片特殊处理 - 使初始动画更平滑
    const titleSlide = document.querySelector('.title-slide');
    if (titleSlide) {
        const titleTl = gsap.timeline({delay: 0.3}); // 减少延迟
        
        // 标题和装饰特效 - 修改为更好的重叠效果
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
        }, "-=1.5"); // 让标题和装饰一起出现
        
        // 演讲者信息淡入
        titleTl.from('.presenter-info', {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: "power2.out"
        }, "-=0.8");
        
        // 键盘提示淡入
        titleTl.from('.keyboard-hint', {
            opacity: 0,
            y: 10,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.5");
    }
    
    // 为工作流程步骤添加连接线动画
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
    
    // 为基础概念添加悬停效果
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
    
    // 为核心特点添加点击交互
    const features = document.querySelectorAll('.feature-list li');
    features.forEach(feature => {
        // 确保初始状态是正确的
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
                    // 动画完成后重置transform
                    gsap.set(feature, {
                        clearProps: "transform"
                    });
                }
            });
        });
    });
    
    // 为例子卡片添加随机浮动动画
    const exampleCards = document.querySelectorAll('.example-card');
    exampleCards.forEach(card => {
        gsap.to(card, {
            y: -3 + Math.random() * 6, // 减小移动幅度，范围从-3到+3像素
            duration: 3 + Math.random(), // 增加动画时间，让动作更加缓慢
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });
    
    // 为页面滚动添加导航功能
    setupScrollNavigation();
}

// 高亮当前工作流程步骤
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
    
    // 如果是第5步，突出显示第2步，以表示循环
    if (index === 4) {
        setTimeout(() => {
            gsap.to(steps[1], {
                backgroundColor: "rgba(121, 40, 202, 0.3)",
                duration: 0.3
            });
        }, 1000);
    }
}

// 设置滚动导航
function setupScrollNavigation() {
    // 在页面上创建一个神秘的小导航点
    const nav = document.createElement('div');
    nav.className = 'scroll-nav';
    document.body.appendChild(nav);
    
    // 为每个幻灯片添加导航点
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
        
        // 点击导航点时滚动到对应幻灯片
        dot.addEventListener('click', () => {
            slide.scrollIntoView({ behavior: 'smooth' });
        });
        
        // 设置滚动触发器以高亮当前导航点
        ScrollTrigger.create({
            trigger: slide,
            start: "top center",
            end: "bottom center",
            onEnter: () => highlightDot(index),
            onEnterBack: () => highlightDot(index)
        });
    });
    
    // 初始高亮第一个点
    highlightDot(0);
}

// 高亮当前导航点
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

// 设置键盘导航
function setupKeyboardNavigation() {
    const slides = document.querySelectorAll('.slide');
    let currentSlideIndex = 0;
    
    // 添加键盘事件监听
    document.addEventListener('keydown', (e) => {
        // 左箭头或上箭头 - 前一页
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                navigateToSlide(currentSlideIndex);
            }
        }
        // 右箭头或下箭头 - 后一页
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentSlideIndex < slides.length - 1) {
                currentSlideIndex++;
                navigateToSlide(currentSlideIndex);
            }
        }
    });
    
    // 滚动监听，更新当前幻灯片索引
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

// 导航到指定幻灯片
function navigateToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (index >= 0 && index < slides.length) {
        // 平滑滚动到目标幻灯片
        slides[index].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // 高亮对应的导航点
        highlightDot(index);
    }
}

// 设置内部滚动
function setupInternalScrolling() {
    // 处理所有可滚动内容区域
    const scrollableAreas = document.querySelectorAll('.content-scrollable');
    
    scrollableAreas.forEach(area => {
        // 阻止滚轮事件冒泡到页面，防止切换幻灯片
        area.addEventListener('wheel', (e) => {
            const deltaY = e.deltaY;
            const scrollTop = area.scrollTop;
            const scrollHeight = area.scrollHeight;
            const clientHeight = area.clientHeight;
            
            // 当滚动到底部或顶部时不阻止事件
            if ((scrollTop <= 0 && deltaY < 0) || 
                (scrollTop + clientHeight >= scrollHeight && deltaY > 0)) {
                // 滚动到边界，不阻止事件，但需要一定延迟避免立即切换幻灯片
                setTimeout(() => {
                    return;
                }, 300);
            } else {
                // 未滚动到边界，阻止事件冒泡，防止切换幻灯片
                e.stopPropagation();
            }
        }, { passive: false });
    });
    
    // 转换所有幻灯片为内部滚动结构
    document.querySelectorAll('.slide').forEach(slide => {
        const content = slide.querySelector('.content');
        
        // 如果尚未设置内部滚动结构，则转换
        if (content && !content.querySelector('.content-scrollable')) {
            // 找到内容标题
            const title = content.querySelector('h2');
            
            if (title) {
                // 创建标题容器
                const titleContainer = document.createElement('div');
                titleContainer.className = 'content-title';
                
                // 移除原标题并添加到标题容器
                title.parentNode.insertBefore(titleContainer, title);
                titleContainer.appendChild(title);
                
                // 创建可滚动容器
                const scrollableContainer = document.createElement('div');
                scrollableContainer.className = 'content-scrollable';
                
                // 将剩余内容移到可滚动容器
                while (content.children.length > 1) {
                    scrollableContainer.appendChild(content.children[1]);
                }
                
                content.appendChild(scrollableContainer);
            }
        }
    });
    
    // 修复视差动画和滚动
    fixParallaxForScrollable();
}

// 修复滚动内容的视差效果
function fixParallaxForScrollable() {
    // 重新设置幻灯片内容的视差效果
    document.querySelectorAll('.slide').forEach(slide => {
        const content = slide.querySelector('.content');
        const scrollable = slide.querySelector('.content-scrollable');
        
        if (content && scrollable) {
            // 清除原有内容的视差效果
            const contentTween = gsap.getTweensOf(content);
            if (contentTween.length > 0) {
                contentTween.forEach(tween => tween.kill());
            }
            
            // 设置滚动容器的视差效果
            gsap.to(scrollable, {
                y: -20, // 减小移动幅度
                scrollTrigger: {
                    trigger: slide,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.5,
                }
            });
        }
    });
    
    // 防止键盘导航与内部滚动冲突
    document.querySelectorAll('.content-scrollable').forEach(scrollable => {
        scrollable.addEventListener('keydown', (e) => {
            // 拦截方向键，防止触发页面切换
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.stopPropagation();
            }
        });
    });
    
    // 修改 ScrollTrigger 设置，使得内部滚动更顺滑
    ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });
    
    // 刷新ScrollTrigger
    ScrollTrigger.refresh();
}

// 设置触摸屏导航
function setupTouchNavigation() {
    const slides = document.querySelectorAll('.slide');
    let currentSlideIndex = 0;
    
    // 创建左右触摸区域
    const leftTouchArea = document.createElement('div');
    leftTouchArea.className = 'touch-nav-area left-nav';
    
    const rightTouchArea = document.createElement('div');
    rightTouchArea.className = 'touch-nav-area right-nav';
    
    document.body.appendChild(leftTouchArea);
    document.body.appendChild(rightTouchArea);
    
    // 左侧区域点击 - 前一页
    leftTouchArea.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            navigateToSlide(currentSlideIndex);
        }
    });
    
    // 右侧区域点击 - 后一页
    rightTouchArea.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            navigateToSlide(currentSlideIndex);
        }
    });
    
    // 监听触摸事件，防止内容区域触摸冒泡到导航区域
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
    
    // 更新当前幻灯片索引的监听 (复用键盘导航的监听)
    slides.forEach((slide, index) => {
        ScrollTrigger.create({
            trigger: slide,
            start: "top center",
            end: "bottom center",
            onEnter: () => { currentSlideIndex = index; },
            onEnterBack: () => { currentSlideIndex = index; }
        });
    });
    
    // 添加触摸指示器
    addTouchIndicators();
}

// 添加触摸指示器
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
    
    // 移动设备才显示指示器
    if (isMobileDevice()) {
        const showIndicators = () => {
            gsap.to([indicators.left, indicators.right], {
                opacity: 0.7,
                duration: 0.3
            });
            
            // 短暂显示后隐藏
            setTimeout(() => {
                gsap.to([indicators.left, indicators.right], {
                    opacity: 0,
                    duration: 0.5
                });
            }, 1500);
        };
        
        // 初始显示指示器
        showIndicators();
        
        // 滚动时再次显示
        window.addEventListener('scroll', showIndicators, { passive: true });
        
        // 点击时也显示
        document.addEventListener('click', showIndicators);
    }
}

// 检测是否为移动设备
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
} 