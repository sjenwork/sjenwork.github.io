// 初始化手機手勢
function initMobileGestures() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mainContent = document.getElementById('mainContent');
    const activeSection = document.querySelector('.section.active');
    
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    
    // 最小滑動距離 (px)
    const minSwipeDistance = 50;
    
    // 滑動時間閾值 (ms)
    const maxSwipeTime = 300;
    
    // 添加顯示手勢提示按鈕
    addGestureTipsButton();
    
    // 捕獲開始觸摸事件
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = new Date().getTime();
    }, { passive: true });
    
    // 捕獲觸摸結束事件
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const touchEndTime = new Date().getTime();
        
        // 計算水平和垂直滑動距離
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = touchEndY - touchStartY;
        const swipeTime = touchEndTime - touchStartTime;
        
        // 計算滑動角度，確定是水平還是垂直滑動
        const swipeAngle = Math.abs(Math.atan2(swipeDistanceY, swipeDistanceX) * 180 / Math.PI);
        const isHorizontalSwipe = (swipeAngle < 45 || swipeAngle > 135);
        
        // 只處理快速滑動
        if (swipeTime > maxSwipeTime) return;
        
        // 處理雙指手勢 (如果可用)
        if (e.touches && e.touches.length > 1) {
            // 雙指向下滑動返回頂部
            if (!isHorizontalSwipe && swipeDistanceY > minSwipeDistance) {
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        }
        
        // 當側邊欄關閉時，處理左右滑動切換頁面功能
        if (isHorizontalSwipe && Math.abs(swipeDistanceX) > minSwipeDistance * 1.5 && !sidebar.classList.contains('open')) {
            const currentSection = document.querySelector('.section.active');
            const currentItem = document.querySelector('.sidebar-item.active');
            
            if (currentItem) {
                const allItems = Array.from(document.querySelectorAll('.sidebar-item'));
                const currentIndex = allItems.indexOf(currentItem);
                
                // 向左滑動，顯示下一個部分
                if (swipeDistanceX < 0 && currentIndex < allItems.length - 1) {
                    showPageTransition();
                    setTimeout(() => {
                        allItems[currentIndex + 1].click();
                    }, 100);
                }
                // 向右滑動，顯示上一個部分
                else if (swipeDistanceX > 0 && currentIndex > 0) {
                    showPageTransition();
                    setTimeout(() => {
                        allItems[currentIndex - 1].click();
                    }, 100);
                }
            }
        }
    });
    
    // 添加雙指左右滑動手勢處理
    let multiTouchStartX = 0;
    
    document.addEventListener('touchstart', function(e) {
        // 檢測是否是雙指觸摸
        if (e.touches.length === 2) {
            // 記錄雙指觸摸的起始X坐標（使用兩指的平均位置）
            multiTouchStartX = (e.touches[0].screenX + e.touches[1].screenX) / 2;
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        // 檢測是否由雙指觸摸結束（通過originalEvent）
        if (e.changedTouches.length === 2 || 
            (e.changedTouches.length === 1 && e.touches.length === 0 && multiTouchStartX !== 0)) {
            
            // 計算雙指滑動的結束X坐標（使用結束時的平均位置）
            const multiTouchEndX = (e.changedTouches[0].screenX + 
                                   (e.changedTouches[1] ? e.changedTouches[1].screenX : e.changedTouches[0].screenX)) / 2;
            
            // 計算雙指水平滑動距離
            const multiSwipeDistance = multiTouchEndX - multiTouchStartX;
            
            // 判斷是左滑還是右滑，並且設置最小滑動距離門檻
            if (Math.abs(multiSwipeDistance) > minSwipeDistance * 1.2) {
                // 雙指向右滑動 - 打開側邊欄
                if (multiSwipeDistance > 0 && !sidebar.classList.contains('open')) {
                    sidebar.classList.add('open');
                    menuToggle.classList.add('open');
                    menuToggle.querySelector('i').className = 'fa fa-times';
                    
                    // 在大屏幕上移動主內容區
                    if (window.innerWidth > 768) {
                        mainContent.classList.add('shifted');
                    }
                    
                    // 添加振動反饋
                    if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(50);
                    }
                }
                // 雙指向左滑動 - 關閉側邊欄
                else if (multiSwipeDistance < 0 && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    menuToggle.classList.remove('open');
                    menuToggle.querySelector('i').className = 'fa fa-bars';
                    
                    // 添加振動反饋
                    if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(50);
                    }
                }
            }
            
            // 重置雙指起始位置
            multiTouchStartX = 0;
        }
    }, { passive: true });
    
    // 處理頁面切換動畫
    function showPageTransition() {
        const overlay = document.querySelector('.page-transition-overlay');
        overlay.classList.add('active');
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 500);
    }
    
    // 添加手勢提示按鈕和對話框
    function addGestureTipsButton() {
        // 創建手勢提示按鈕
        const tipsButton = document.createElement('button');
        tipsButton.className = 'gesture-tips-button glass-effect';
        tipsButton.innerHTML = '<i class="fa fa-hand-pointer"></i>';
        tipsButton.setAttribute('title', '手勢操作說明');
        document.body.appendChild(tipsButton);
        
        // 創建手勢提示對話框
        const tipsDialog = document.createElement('div');
        tipsDialog.className = 'gesture-tips-dialog';
        tipsDialog.innerHTML = `
            <div class="tips-header">
                <h3>手勢操作指南</h3>
                <button class="tips-close"><i class="fa fa-times"></i></button>
            </div>
            <div class="tips-content">
                <div class="gesture-item">
                    <div class="gesture-icon"><i class="fa fa-arrow-circle-right"></i></div>
                    <div class="gesture-desc">
                        <h4>雙指向右滑動</h4>
                        <p>使用兩根手指向右滑動可打開側邊欄</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <div class="gesture-icon"><i class="fa fa-arrow-circle-left"></i></div>
                    <div class="gesture-desc">
                        <h4>雙指向左滑動</h4>
                        <p>側邊欄開啟時，使用兩根手指向左滑動可關閉側邊欄</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <div class="gesture-icon"><i class="fa fa-exchange"></i></div>
                    <div class="gesture-desc">
                        <h4>左右滑動切換頁面</h4>
                        <p>在主內容區域左右滑動可切換不同頁面</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <div class="gesture-icon"><i class="fa fa-arrows-v"></i></div>
                    <div class="gesture-desc">
                        <h4>雙指下滑</h4>
                        <p>使用兩根手指向下滑動可快速回到頁面頂部</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(tipsDialog);
        
        // 顯示/隱藏提示對話框
        tipsButton.addEventListener('click', function() {
            tipsDialog.classList.toggle('active');
        });
        
        // 關閉按鈕事件
        tipsDialog.querySelector('.tips-close').addEventListener('click', function() {
            tipsDialog.classList.remove('active');
        });
        
        // 點擊其他區域關閉提示
        document.addEventListener('click', function(e) {
            if (!tipsDialog.contains(e.target) && !tipsButton.contains(e.target) && tipsDialog.classList.contains('active')) {
                tipsDialog.classList.remove('active');
            }
        });
        
        // 在首次訪問時顯示手勢提示
        if (!localStorage.getItem('gesture-tips-shown')) {
            setTimeout(() => {
                tipsDialog.classList.add('active');
                localStorage.setItem('gesture-tips-shown', 'true');
            }, 2000);
        }
    }
}

// 初始化手機手勢功能
// document.addEventListener('DOMContentLoaded', function() {
//     initMobileGestures();
// }); 