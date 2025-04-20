// 添加回到頂部按鈕
function addBackToTopButton() {
    const button = document.createElement('button');
    button.className = 'back-to-top glass-effect';
    button.innerHTML = '<i class="fa fa-arrow-up"></i>';
    document.body.appendChild(button);
    
    // 滾動時顯示/隱藏按鈕
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // 點擊回到頂部
    button.addEventListener('click', function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
}

document.addEventListener('DOMContentLoaded', function() {
    addBackToTopButton();
});