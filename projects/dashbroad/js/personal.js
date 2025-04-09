/**
 * 化學雲儀表板 - 個人化模組
 * 提供使用者自定義儀表板功能，可以把多個標籤頁中的卡片加入到個人專屬的儀表板中
 */

// 初始化個人化儀表板設置
let personalCards = [];
let personalSavedViews = [];
let defaultPersonalView = null;
let rightClickedCardInfo = null;

// DOM 載入完成後初始化
document.addEventListener("DOMContentLoaded", function() {
    // 監聽個人化標籤頁顯示事件
    document.getElementById('personal-tab').addEventListener('shown.bs.tab', function (e) {
        initPersonalDashboard();
    });

    // 初始化卡片右鍵選單
    initCardContextMenu();

    // 綁定個人化儀表板相關事件
    bindPersonalDashboardEvents();

    // 從 localStorage 載入儲存的個人化儀表板數據
    loadPersonalDashboardData();
});

/**
 * 初始化個人化儀表板
 */
function initPersonalDashboard() {
    updatePersonalDashboard();
    updatePersonalSavedViewsList();
}

/**
 * 綁定個人化儀表板相關事件
 */
function bindPersonalDashboardEvents() {
    // 綁定添加卡片按鈕事件
    document.getElementById('addCardToPersonal').addEventListener('click', function() {
        prepareAddCardModal();
        new bootstrap.Modal(document.getElementById('addCardModal')).show();
    });

    // 綁定儲存視圖按鈕事件
    document.getElementById('savePersonalView').addEventListener('click', function() {
        // 自動生成視圖名稱建議
        let suggestedName = '個人視圖 ' + (personalSavedViews.length + 1);
        document.getElementById('personalViewName').value = suggestedName;
        new bootstrap.Modal(document.getElementById('savePersonalViewModal')).show();
    });

    // 綁定確認添加卡片按鈕事件
    document.getElementById('confirmAddCard').addEventListener('click', function() {
        addSelectedCardToPersonal();
    });

    // 綁定確認儲存視圖按鈕事件
    document.getElementById('confirmSavePersonalView').addEventListener('click', function() {
        savePersonalView();
    });

    // 綁定來源標籤頁選擇事件
    document.getElementById('cardSourceTab').addEventListener('change', function() {
        updateCardSelectionOptions();
    });

    // 綁定卡片選擇事件
    document.getElementById('cardSelection').addEventListener('change', function() {
        updateCardPreview();
    });
}

/**
 * 初始化卡片右鍵選單
 */
function initCardContextMenu() {
    // 添加右鍵選單 CSS
    const style = document.createElement('style');
    style.textContent = `
        .card-context-menu {
            display: none;
            position: absolute;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            border-radius: 4px;
            z-index: 1000;
        }
        .card-context-menu ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .card-context-menu li {
            padding: 8px 12px;
            cursor: pointer;
        }
        .card-context-menu li:hover {
            background-color: #f5f5f5;
        }
    `;
    document.head.appendChild(style);

    // 創建右鍵選單
    const contextMenu = document.createElement('div');
    contextMenu.className = 'card-context-menu';
    contextMenu.innerHTML = `
        <ul>
            <li id="addToPersonal"><i class="bi bi-grid-3x3-gap me-2"></i>添加至個人化儀表板</li>
        </ul>
    `;
    document.body.appendChild(contextMenu);

    // 綁定卡片右鍵事件
    document.addEventListener('contextmenu', function(e) {
        // 檢查是否點擊在卡片上
        const card = findParentCard(e.target);
        if (card) {
            e.preventDefault();
            
            // 記錄被右鍵點擊的卡片信息
            const tabPane = findParentTabPane(card);
            if (tabPane) {
                const tabId = tabPane.id.replace('-dashboard', '');
                rightClickedCardInfo = {
                    tabId: tabId,
                    cardElement: card,
                    cardId: card.id || generateCardId(),
                    cardTitle: getCardTitle(card)
                };
                
                // 顯示右鍵選單
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
            }
        }
    });

    // 點擊頁面其他區域關閉右鍵選單
    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });

    // 綁定添加至個人化儀表板選項事件
    document.getElementById('addToPersonal').addEventListener('click', function() {
        if (rightClickedCardInfo) {
            addCardToPersonalFromContext(rightClickedCardInfo);
        }
    });
}

/**
 * 尋找父級卡片元素
 */
function findParentCard(element) {
    while (element && element !== document) {
        if (element.classList.contains('card') && !element.classList.contains('modal-content')) {
            return element;
        }
        element = element.parentElement;
    }
    return null;
}

/**
 * 尋找父級標籤頁面板
 */
function findParentTabPane(element) {
    while (element && element !== document) {
        if (element.classList.contains('tab-pane')) {
            return element;
        }
        element = element.parentElement;
    }
    return null;
}

/**
 * 獲取卡片標題
 */
function getCardTitle(cardElement) {
    // 嘗試從卡片頭部獲取標題
    const header = cardElement.querySelector('.card-header');
    if (header) {
        return header.textContent.trim();
    }
    
    // 嘗試從標題元素獲取
    const titleElement = cardElement.querySelector('h5, h4, h3');
    if (titleElement) {
        return titleElement.textContent.trim();
    }
    
    // 預設標題
    return '未命名卡片';
}

/**
 * 生成卡片 ID
 */
function generateCardId() {
    return 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

/**
 * 準備添加卡片模態框
 */
function prepareAddCardModal() {
    // 重置模態框
    document.getElementById('cardSourceTab').value = 'account';
    document.getElementById('cardSelection').innerHTML = '<option value="">請先選擇來源標籤頁</option>';
    document.getElementById('cardPreviewArea').innerHTML = '<p class="text-muted text-center">請選擇卡片以預覽</p>';
    
    // 更新卡片選擇選項
    updateCardSelectionOptions();
}

/**
 * 更新卡片選擇選項
 */
function updateCardSelectionOptions() {
    const sourceTab = document.getElementById('cardSourceTab').value;
    const cardSelection = document.getElementById('cardSelection');
    
    // 清空現有選項
    cardSelection.innerHTML = '';
    
    // 獲取來源標籤頁中的所有卡片
    const sourceTabPane = document.getElementById(sourceTab + '-dashboard');
    if (sourceTabPane) {
        const cards = sourceTabPane.querySelectorAll('.card');
        
        if (cards.length === 0) {
            cardSelection.innerHTML = '<option value="">此標籤頁無可用卡片</option>';
        } else {
            // 添加預設選項
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '請選擇卡片';
            cardSelection.appendChild(defaultOption);
            
            // 添加卡片選項
            cards.forEach((card, index) => {
                const cardId = card.id || 'card_' + sourceTab + '_' + index;
                const cardTitle = getCardTitle(card);
                
                const option = document.createElement('option');
                option.value = cardId;
                option.textContent = cardTitle;
                option.dataset.cardIndex = index;
                
                cardSelection.appendChild(option);
            });
        }
    }
}

/**
 * 更新卡片預覽
 */
function updateCardPreview() {
    const cardSelection = document.getElementById('cardSelection');
    const cardPreviewArea = document.getElementById('cardPreviewArea');
    const sourceTab = document.getElementById('cardSourceTab').value;
    
    if (!cardSelection.value) {
        cardPreviewArea.innerHTML = '<p class="text-muted text-center">請選擇卡片以預覽</p>';
        return;
    }
    
    // 查找選定的卡片
    const sourceTabPane = document.getElementById(sourceTab + '-dashboard');
    if (sourceTabPane) {
        const selectedIndex = cardSelection.selectedOptions[0].dataset.cardIndex;
        const cards = sourceTabPane.querySelectorAll('.card');
        
        if (selectedIndex && cards[selectedIndex]) {
            // 創建預覽
            cardPreviewArea.innerHTML = '';
            const previewCard = document.createElement('div');
            previewCard.className = 'card-preview';
            previewCard.innerHTML = cards[selectedIndex].outerHTML;
            
            // 縮小預覽尺寸
            const previewCardElement = previewCard.firstElementChild;
            if (previewCardElement) {
                previewCardElement.style.transform = 'scale(0.8)';
                previewCardElement.style.transformOrigin = 'top left';
                previewCardElement.style.margin = '0';
                previewCardElement.style.width = '100%';
            }
            
            cardPreviewArea.appendChild(previewCard);
        }
    }
}

/**
 * 添加選定的卡片到個人化儀表板
 */
function addSelectedCardToPersonal() {
    const cardSelection = document.getElementById('cardSelection');
    const sourceTab = document.getElementById('cardSourceTab').value;
    
    if (!cardSelection.value) {
        alert('請選擇要添加的卡片');
        return;
    }
    
    // 獲取選定的卡片
    const sourceTabPane = document.getElementById(sourceTab + '-dashboard');
    if (sourceTabPane) {
        const selectedIndex = cardSelection.selectedOptions[0].dataset.cardIndex;
        const cards = sourceTabPane.querySelectorAll('.card');
        
        if (selectedIndex && cards[selectedIndex]) {
            const selectedCard = cards[selectedIndex];
            const cardId = selectedCard.id || generateCardId();
            
            // 檢查是否已經添加過此卡片
            const existingCard = personalCards.find(card => card.cardId === cardId);
            if (existingCard) {
                alert('此卡片已經添加到個人化儀表板中');
                return;
            }
            
            // 添加卡片到個人化儀表板
            personalCards.push({
                cardId: cardId,
                tabId: sourceTab,
                cardIndex: selectedIndex,
                cardTitle: getCardTitle(selectedCard),
                cardHtml: selectedCard.outerHTML
            });
            
            // 更新個人化儀表板
            updatePersonalDashboard();
            
            // 儲存個人化儀表板數據
            savePersonalDashboardData();
            
            // 關閉模態框
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCardModal'));
            if (modal) {
                modal.hide();
            }
        }
    }
}

/**
 * 從右鍵選單添加卡片到個人化儀表板
 */
function addCardToPersonalFromContext(cardInfo) {
    // 檢查是否已經添加過此卡片
    const existingCard = personalCards.find(card => card.cardId === cardInfo.cardId);
    if (existingCard) {
        alert('此卡片已經添加到個人化儀表板中');
        return;
    }
    
    // 添加卡片到個人化儀表板
    personalCards.push({
        cardId: cardInfo.cardId,
        tabId: cardInfo.tabId,
        cardIndex: -1, // 使用 cardId 查找而不是索引
        cardTitle: cardInfo.cardTitle,
        cardHtml: cardInfo.cardElement.outerHTML
    });
    
    // 更新個人化儀表板
    updatePersonalDashboard();
    
    // 儲存個人化儀表板數據
    savePersonalDashboardData();
    
    // 顯示成功消息
    showAlert('卡片已添加到個人化儀表板', 'success');
}

/**
 * 更新個人化儀表板
 */
function updatePersonalDashboard() {
    const container = document.getElementById('personalCardsContainer');
    const emptyState = document.getElementById('personalEmptyState');
    
    // 檢查是否有卡片
    if (personalCards.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    // 隱藏空狀態
    emptyState.style.display = 'none';
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加卡片
    personalCards.forEach((card, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        // 創建卡片容器
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.style.position = 'relative';
        
        // 創建移除按鈕
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-sm btn-danger position-absolute';
        removeBtn.style.top = '5px';
        removeBtn.style.right = '5px';
        removeBtn.style.zIndex = '10';
        removeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
        removeBtn.addEventListener('click', function() {
            removePersonalCard(index);
        });
        
        // 加入卡片 HTML
        cardContainer.innerHTML = card.cardHtml;
        
        // 獲取卡片元素
        const cardElement = cardContainer.querySelector('.card');
        if (cardElement) {
            // 為卡片添加標識符
            cardElement.dataset.personalCardIndex = index;
            
            // 添加移除按鈕
            cardContainer.appendChild(removeBtn);
            
            // 移除卡片中可能的交互式元素的功能
            disableCardInteractiveElements(cardElement);
        }
        
        col.appendChild(cardContainer);
        container.appendChild(col);
    });
}

/**
 * 移除個人化儀表板中的卡片
 */
function removePersonalCard(index) {
    personalCards.splice(index, 1);
    updatePersonalDashboard();
    savePersonalDashboardData();
}

/**
 * 禁用卡片中的交互式元素
 */
function disableCardInteractiveElements(cardElement) {
    // 禁用按鈕
    const buttons = cardElement.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
    });
    
    // 禁用連結
    const links = cardElement.querySelectorAll('a');
    links.forEach(link => {
        link.style.pointerEvents = 'none';
    });
    
    // 禁用輸入框
    const inputs = cardElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.disabled = true;
    });
}

/**
 * 儲存個人化視圖
 */
function savePersonalView() {
    const viewName = document.getElementById('personalViewName').value.trim();
    const setAsDefault = document.getElementById('setAsDefaultPersonalView').checked;
    
    if (!viewName) {
        alert('請輸入視圖名稱');
        return;
    }
    
    // 檢查名稱是否重複
    const existingView = personalSavedViews.find(view => view.name === viewName);
    if (existingView) {
        if (confirm('已存在同名視圖，是否覆蓋？')) {
            // 更新現有視圖
            existingView.cards = [...personalCards];
            
            if (setAsDefault) {
                defaultPersonalView = viewName;
            }
        } else {
            return;
        }
    } else {
        // 添加新視圖
        personalSavedViews.push({
            name: viewName,
            cards: [...personalCards],
            timestamp: new Date().toISOString()
        });
        
        if (setAsDefault || personalSavedViews.length === 1) {
            defaultPersonalView = viewName;
        }
    }
    
    // 更新視圖列表
    updatePersonalSavedViewsList();
    
    // 儲存數據
    savePersonalDashboardData();
    
    // 關閉模態框
    const modal = bootstrap.Modal.getInstance(document.getElementById('savePersonalViewModal'));
    if (modal) {
        modal.hide();
    }
    
    // 顯示成功消息
    showAlert('視圖已儲存', 'success');
}

/**
 * 更新個人化儲存視圖列表
 */
function updatePersonalSavedViewsList() {
    const container = document.getElementById('personalSavedViews');
    
    if (personalSavedViews.length === 0) {
        container.innerHTML = '<span class="text-muted">尚未儲存視圖</span>';
        return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 創建視圖列表
    const viewList = document.createElement('div');
    viewList.className = 'd-flex flex-wrap gap-2';
    
    personalSavedViews.forEach(view => {
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-outline-primary btn-sm';
        viewBtn.dataset.viewName = view.name;
        
        // 如果是預設視圖，添加星號標記
        if (view.name === defaultPersonalView) {
            viewBtn.innerHTML = `<i class="bi bi-star-fill me-1 text-warning"></i> ${view.name}`;
        } else {
            viewBtn.textContent = view.name;
        }
        
        // 綁定應用視圖事件
        viewBtn.addEventListener('click', function() {
            applyPersonalView(view.name);
        });
        
        // 創建視圖操作下拉選單
        const viewDropdown = document.createElement('div');
        viewDropdown.className = 'btn-group';
        viewDropdown.appendChild(viewBtn);
        
        const dropdownBtn = document.createElement('button');
        dropdownBtn.className = 'btn btn-outline-primary btn-sm dropdown-toggle dropdown-toggle-split';
        dropdownBtn.setAttribute('data-bs-toggle', 'dropdown');
        dropdownBtn.setAttribute('aria-expanded', 'false');
        
        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu';
        
        // 添加選單項目
        const setDefaultItem = document.createElement('li');
        const setDefaultLink = document.createElement('a');
        setDefaultLink.className = 'dropdown-item';
        setDefaultLink.href = '#';
        setDefaultLink.innerHTML = '<i class="bi bi-star me-2"></i>設為預設';
        setDefaultLink.addEventListener('click', function(e) {
            e.preventDefault();
            setDefaultPersonalView(view.name);
        });
        setDefaultItem.appendChild(setDefaultLink);
        
        const deleteItem = document.createElement('li');
        const deleteLink = document.createElement('a');
        deleteLink.className = 'dropdown-item text-danger';
        deleteLink.href = '#';
        deleteLink.innerHTML = '<i class="bi bi-trash me-2"></i>刪除';
        deleteLink.addEventListener('click', function(e) {
            e.preventDefault();
            deletePersonalView(view.name);
        });
        deleteItem.appendChild(deleteLink);
        
        dropdownMenu.appendChild(setDefaultItem);
        dropdownMenu.appendChild(deleteItem);
        
        viewDropdown.appendChild(dropdownBtn);
        viewDropdown.appendChild(dropdownMenu);
        
        viewList.appendChild(viewDropdown);
    });
    
    container.appendChild(viewList);
}

/**
 * 應用個人化視圖
 */
function applyPersonalView(viewName) {
    const view = personalSavedViews.find(v => v.name === viewName);
    if (view) {
        personalCards = [...view.cards];
        updatePersonalDashboard();
        showAlert(`已套用「${viewName}」視圖`, 'info');
    }
}

/**
 * 設置預設個人化視圖
 */
function setDefaultPersonalView(viewName) {
    defaultPersonalView = viewName;
    updatePersonalSavedViewsList();
    savePersonalDashboardData();
    showAlert(`已將「${viewName}」設為預設視圖`, 'success');
}

/**
 * 刪除個人化視圖
 */
function deletePersonalView(viewName) {
    if (confirm(`確定要刪除視圖「${viewName}」嗎？`)) {
        // 移除視圖
        personalSavedViews = personalSavedViews.filter(v => v.name !== viewName);
        
        // 如果刪除的是預設視圖，重設預設視圖
        if (defaultPersonalView === viewName) {
            defaultPersonalView = personalSavedViews.length > 0 ? personalSavedViews[0].name : null;
        }
        
        // 更新視圖列表
        updatePersonalSavedViewsList();
        
        // 儲存數據
        savePersonalDashboardData();
        
        showAlert(`已刪除視圖「${viewName}」`, 'info');
    }
}

/**
 * 儲存個人化儀表板數據到 localStorage
 */
function savePersonalDashboardData() {
    const data = {
        cards: personalCards,
        savedViews: personalSavedViews,
        defaultView: defaultPersonalView
    };
    
    localStorage.setItem('personalDashboardData', JSON.stringify(data));
}

/**
 * 從 localStorage 載入個人化儀表板數據
 */
function loadPersonalDashboardData() {
    const data = localStorage.getItem('personalDashboardData');
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            personalCards = parsedData.cards || [];
            personalSavedViews = parsedData.savedViews || [];
            defaultPersonalView = parsedData.defaultView || null;
            
            // 如果有默認視圖，應用它
            if (defaultPersonalView) {
                const defaultView = personalSavedViews.find(v => v.name === defaultPersonalView);
                if (defaultView) {
                    personalCards = [...defaultView.cards];
                }
            }
        } catch (error) {
            console.error('載入個人化儀表板數據失敗：', error);
        }
    }
}

/**
 * 顯示提示消息
 */
function showAlert(message, type = 'info') {
    // 創建提示元素
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertElement.style.top = '20px';
    alertElement.style.right = '20px';
    alertElement.style.zIndex = '9999';
    alertElement.role = 'alert';
    
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到頁面
    document.body.appendChild(alertElement);
    
    // 設置定時器自動關閉
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            alertElement.remove();
        }, 150);
    }, 3000);
} 