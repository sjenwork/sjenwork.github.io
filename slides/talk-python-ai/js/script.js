// 初始化Reveal.js
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Reveal.js
    Reveal.initialize({
        hash: true,
        controls: true,
        progress: true,
        center: true,
        transition: 'slide',
        // 更多設定
        plugins: []
    });

    // 模態視窗相關
    const infoTooltips = document.querySelectorAll('.info-tooltip');
    const modals = document.querySelectorAll('.modal-overlay');
    const closeBtns = document.querySelectorAll('.modal-close, .modal-btn');

    // 為所有提示工具添加點擊事件
    infoTooltips.forEach(tooltip => {
        tooltip.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止事件傳播到幻燈片，避免幻燈片切換
            const modalId = this.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'flex';
        });
    });

    // 為所有關閉按鈕添加點擊事件
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止事件傳播
            const modal = this.closest('.modal-overlay');
            modal.style.display = 'none';
        });
    });

    // 點擊模態視窗背景關閉
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });

    // 防止模態視窗內容點擊事件傳播
    const modalContainers = document.querySelectorAll('.modal-container');
    modalContainers.forEach(container => {
        container.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
});

// 匯出PDF功能
function exportToPDF() {
    alert('正在準備PDF，請稍候...');
    // 這裡可以添加實際的PDF匯出功能
    window.open('presentation.pdf', '_blank');
}

// 加載Python代碼函數
function loadPythonCode() {
    fetch('python/linear_regression.py')
        .then(response => {
            if (!response.ok) {
                throw new Error('無法加載Python代碼: ' + response.statusText);
            }
            return response.text();
        })
        .then(code => {
            // 獲取代碼區塊元素，使用正確的CSS選擇器
            const codeElements = document.querySelectorAll('.code-example pre code.language-python');
            
            if (codeElements.length === 0) {
                console.error('找不到匹配的代碼元素：.code-example pre code.language-python');
                // 嘗試使用舊的選擇器
                const oldCodeElements = document.querySelectorAll('.code-example pre code.python');
                
                if (oldCodeElements.length > 0) {
                    oldCodeElements.forEach(element => {
                        element.textContent = code;
                        // 使用Prism.js進行語法高亮
                        if (typeof Prism !== 'undefined') {
                            Prism.highlightElement(element);
                        } else {
                            console.error('Prism未定義，無法進行語法高亮');
                        }
                    });
                }
            } else {
                // 更新代碼區塊的內容
                codeElements.forEach(element => {
                    element.textContent = code;
                    // 使用Prism.js進行語法高亮
                    if (typeof Prism !== 'undefined') {
                        Prism.highlightElement(element);
                    } else {
                        console.error('Prism未定義，無法進行語法高亮');
                    }
                });
            }
        })
        .catch(error => {
            console.error('加載Python代碼時出錯:', error);
        });
} 