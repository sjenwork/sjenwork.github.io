// AI 實驗室功能
function initPlaygroundFeatures() {
    // 模擬延遲時間 (500-2000ms)
    function getRandomDelay() {
        return Math.floor(Math.random() * 1500) + 500;
    }
    
    // 顯示加載動畫
    function showLoading(resultElement) {
        const placeholder = resultElement.querySelector('.result-placeholder');
        const content = resultElement.querySelector('.result-content');
        
        placeholder.innerHTML = '<i class="fa fa-spinner fa-spin"></i> AI 處理中...';
        placeholder.style.display = 'block';
        content.style.display = 'none';
    }
    
    // 顯示結果
    function showResult(resultElement, resultText) {
        const placeholder = resultElement.querySelector('.result-placeholder');
        const content = resultElement.querySelector('.result-content');
        
        content.textContent = resultText;
        placeholder.style.display = 'none';
        content.style.display = 'block';
    }
    
    // 文本生成功能
    const textGenerationButtons = document.querySelectorAll('[data-function="text-generation"]');
    textGenerationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.playground-card');
            const input = card.querySelector('.playground-input').value.trim();
            const resultElement = card.querySelector('.playground-result');
            
            if (!input) {
                alert('請輸入提示詞以生成文本！');
                return;
            }
            
            showLoading(resultElement);
            
            // 模擬AI處理
            setTimeout(() => {
                let generatedText = '';
                
                // 根據不同提示詞生成不同類型的示例文本
                if (input.includes('詩') || input.includes('poem')) {
                    generatedText = "流光溢彩的科技海洋，\n智慧如浪潮翻湧不息，\n人類的思維與機器交融，\n開創萬物互聯的新紀元。\n\n在數據的星空中漫遊，\n我們共譜未來的序章，\n讓創新引領前行的步伐，\n在無限可能中綻放希望。";
                } else if (input.includes('故事') || input.includes('story')) {
                    generatedText = "在2050年的台北，老陳是一位退休工程師，他的家中有一個名叫「小智」的AI助手。某天早晨，小智突然向老陳展示了一段他從未見過的童年影像。「這怎麼可能？」老陳驚訝地問道，這些是他五歲時的畫面，而那時數碼相機還未普及。\n\n小智解釋說它通過分析老陳的記憶描述和家族照片，利用神經網絡重建了這些珍貴瞬間。老陳看著屏幕上自己和早已離世母親的互動，淚水盈眶。科技不僅連接了現在和未來，也成為連接過去的橋樑。";
                } else if (input.includes('報告') || input.includes('report')) {
                    generatedText = "人工智能發展趨勢報告\n\n近年來，人工智能技術呈現以下五大趨勢：\n\n1. 多模態模型的崛起：結合文本、圖像、聲音等多種數據類型的AI模型正成為主流。\n\n2. 智能體(Agent)技術的發展：具有自主決策能力的AI系統顯示出解決複雜問題的潛力。\n\n3. 邊緣計算與AI結合：將AI計算能力部署到終端設備，減少延遲並增強隱私保護。\n\n4. 個性化定制模型：小型專業化模型在特定領域超越通用大模型。\n\n5. AI民主化工具：低代碼/無代碼平台使更多非技術人員能夠開發AI應用。";
                } else {
                    generatedText = "感謝您的提示！基於您的輸入，我生成了以下內容：\n\n" + input + "是一個引人深思的話題。在現代社會中，我們不斷探索和發展這一領域，尋求突破和創新。從歷史角度來看，這一概念經歷了多次演變，如今已形成了完整的理論體系和應用框架。\n\n未來，隨著技術的進步和人們認識的深入，我們有理由相信這一領域將迎來更廣闊的發展前景，為人類社會帶來更多正面影響和價值。";
                }
                
                showResult(resultElement, generatedText);
            }, getRandomDelay());
        });
    });
    
    // 圖片上傳預覽
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageUpload && imagePreview) {
        imageUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file && file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    
                    // 啟用分析按鈕
                    const analyzeButton = document.querySelector('[data-function="image-description"]');
                    if (analyzeButton) {
                        analyzeButton.disabled = false;
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 圖像描述功能
    const imageDescriptionButtons = document.querySelectorAll('[data-function="image-description"]');
    imageDescriptionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.playground-card');
            const resultElement = card.querySelector('.playground-result');
            
            showLoading(resultElement);
            
            // 模擬AI處理
            setTimeout(() => {
                // 預設的圖片描述示例
                const descriptions = [
                    "這張圖片展示了一個城市景觀，具有現代化的高樓大廈和繁忙的街道。在前景中可以看到一些行人，背景則是藍天和幾朵白雲。整體氛圍顯得生機勃勃且充滿都市活力。",
                    "這是一張自然風景照，展現了壯麗的山脈和茂密的森林。前景有一條蜿蜒的小溪，水面反射著周圍的綠色植被。遠處的山峰覆蓋著白雪，與藍天形成鮮明對比。",
                    "圖片中是一盤精美的食物，看起來像是一道亞洲風格的料理。盤中有各種新鮮的蔬菜、肉類和一些調味料。食物的擺盤非常講究，色彩豐富且充滿誘人的質感。",
                    "這張圖片顯示的是一個科技產品，可能是最新款的智能手機或平板設備。該設備具有時尚的設計、光滑的表面和大型顯示屏。背景是簡潔的，突出了產品本身的細節和特點。"
                ];
                
                // 隨機選擇一個描述
                const randomIndex = Math.floor(Math.random() * descriptions.length);
                showResult(resultElement, descriptions[randomIndex]);
            }, getRandomDelay());
        });
    });
    
    // 情感分析功能
    const sentimentAnalysisButtons = document.querySelectorAll('[data-function="sentiment-analysis"]');
    sentimentAnalysisButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.playground-card');
            const input = card.querySelector('.playground-input').value.trim();
            const resultElement = card.querySelector('.playground-result');
            
            if (!input) {
                alert('請輸入文字以進行情感分析！');
                return;
            }
            
            showLoading(resultElement);
            
            // 模擬AI處理
            setTimeout(() => {
                // 簡單的情感分析邏輯
                const positiveWords = ['喜歡', '開心', '高興', '優秀', '美好', '讚', '棒', '好', '愛', '感謝'];
                const negativeWords = ['討厭', '傷心', '難過', '糟糕', '失望', '差', '壞', '恨', '憤怒', '不滿'];
                
                let positiveScore = 0;
                let negativeScore = 0;
                
                // 計算正面和負面詞語出現的次數
                positiveWords.forEach(word => {
                    if (input.includes(word)) {
                        positiveScore += 1;
                    }
                });
                
                negativeWords.forEach(word => {
                    if (input.includes(word)) {
                        negativeScore += 1;
                    }
                });
                
                // 根據分數判斷情感傾向
                let sentiment = '';
                let explanation = '';
                
                if (positiveScore > negativeScore) {
                    sentiment = '正面情感 😊';
                    explanation = `分析結果顯示，您的文本整體呈現正面情感傾向。識別到 ${positiveScore} 個正面情感詞彙，相比之下只有 ${negativeScore} 個負面情感詞彙。文本表達的態度積極樂觀，給人以正能量。`;
                } else if (negativeScore > positiveScore) {
                    sentiment = '負面情感 😔';
                    explanation = `分析結果顯示，您的文本整體呈現負面情感傾向。識別到 ${negativeScore} 個負面情感詞彙，相比之下只有 ${positiveScore} 個正面情感詞彙。文本表達的態度較為消極，可能反映了某種擔憂或不滿。`;
                } else if (positiveScore === 0 && negativeScore === 0) {
                    sentiment = '中性情感 😐';
                    explanation = '分析結果顯示，您的文本情感傾向中性。未識別到明顯的情感詞彙，內容可能偏向客觀陳述或事實描述，沒有表達明確的情感傾向。';
                } else {
                    sentiment = '混合情感 🤔';
                    explanation = `分析結果顯示，您的文本同時包含正面和負面情感。識別到 ${positiveScore} 個正面情感詞彙和 ${negativeScore} 個負面情感詞彙，表明內容中存在情感的複雜性和多樣性。`;
                }
                
                showResult(resultElement, `${sentiment}\n\n${explanation}`);
            }, getRandomDelay());
        });
    });
    
    // 聊天機器人功能
    const chatSendButtons = document.querySelectorAll('[data-function="chatbot"]');
    chatSendButtons.forEach(button => {
        button.addEventListener('click', function() {
            sendChatMessage(this);
        });
    });
    
    // 聊天輸入框回車鍵發送
    const chatInputs = document.querySelectorAll('.chat-input');
    chatInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const sendButton = this.nextElementSibling;
                sendChatMessage(sendButton);
            }
        });
    });
    
    function sendChatMessage(sendButton) {
        const chatContainer = sendButton.closest('.chat-container');
        const messageInput = chatContainer.querySelector('.chat-input');
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        // 添加用戶消息
        addMessage(messagesContainer, message, 'user');
        messageInput.value = '';
        
        // 滾動到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // 模擬AI處理
        setTimeout(() => {
            // 預設的回應列表
            const responses = [
                "我理解您的問題。根據我的分析，這涉及到多個方面的考量。您可以從以下幾個角度思考這個問題...",
                "謝謝您的提問！這是一個有趣的話題。基於最新研究，我可以告訴您...",
                "您提到的情況很常見。許多人都有類似的疑問，我建議您可以嘗試...",
                "這個問題確實值得深入討論。從技術角度來看，主要有以下幾個關鍵點需要注意...",
                "我需要更多信息來全面回答您的問題。例如，您能否提供更多背景或具體細節？",
                "您的問題很有見地！實際上，這個領域最近有很多新的發展，包括..."
            ];
            
            // 根據用戶輸入選擇響應
            let response = '';
            
            if (message.includes('你好') || message.includes('嗨') || message.includes('hi') || message.includes('hello')) {
                response = "你好！很高興與您交流。我是您的AI助手，有什麼我可以幫助您的嗎？";
            } else if (message.includes('謝謝') || message.includes('感謝') || message.includes('thank')) {
                response = "不客氣！能夠幫助到您是我的榮幸。如果還有其他問題，隨時可以向我提問。";
            } else if (message.includes('再見') || message.includes('拜拜') || message.includes('bye')) {
                response = "再見！祝您有愉快的一天。期待下次再與您交流！";
            } else if (message.includes('?') || message.includes('？') || message.includes('什麼') || message.includes('如何') || message.includes('為什麼')) {
                // 針對問題的響應
                const questionResponses = [
                    "這是一個很好的問題。根據我的理解，",
                    "關於這個問題，有幾種不同的觀點：",
                    "讓我為您解答這個問題。基於目前的資訊，",
                    "這個問題很有深度。簡單來說，"
                ];
                const randomIndex = Math.floor(Math.random() * questionResponses.length);
                response = questionResponses[randomIndex] + responses[Math.floor(Math.random() * responses.length)].toLowerCase();
            } else {
                // 隨機響應
                const randomIndex = Math.floor(Math.random() * responses.length);
                response = responses[randomIndex];
            }
            
            // 添加機器人回應
            addMessage(messagesContainer, response, 'bot');
            
            // 滾動到底部
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, getRandomDelay());
    }
    
    function addMessage(container, message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        contentElement.textContent = message;
        
        messageElement.appendChild(contentElement);
        container.appendChild(messageElement);
    }
}

// 初始化AI實驗室功能
document.addEventListener('DOMContentLoaded', function() {
    initPlaygroundFeatures();
}); 