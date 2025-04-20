// 使用共享的Firebase配置
firebase.initializeApp(window.firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// DOM元素
const loginContainer = document.getElementById('loginContainer');
const appContainer = document.getElementById('appContainer');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const categoryList = document.getElementById('categoryList');
const postList = document.getElementById('postList');
const contentArea = document.getElementById('contentArea');
const pageTitle = document.getElementById('pageTitle');
const postEditor = document.getElementById('postEditor');
const categoryEditor = document.getElementById('categoryEditor');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const addPostBtn = document.getElementById('addPostBtn');

// 表单元素
const postForm = document.getElementById('postForm');
const categoryForm = document.getElementById('categoryForm');
const categorySelect = document.getElementById('category');

// 编辑状态变量
let blogData = [];
let activeSidebarItem = null;

// 初始化样式
document.querySelectorAll('.collapsible-section .sidebar-list').forEach(list => {
    list.style.maxHeight = list.scrollHeight + 'px';
});

// 检查并设置侧边栏状态
function checkAndSetSidebarState() {
    // 如果网页宽度小于768px，自动折叠侧边栏
    if (window.innerWidth < 768) {
        sidebar.classList.add('collapsed');
    }
}

// 页面加载完成后和窗口尺寸变化时检查侧边栏状态
window.addEventListener('load', checkAndSetSidebarState);
window.addEventListener('resize', checkAndSetSidebarState);

// 侧边栏折叠切换
sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    
    // 添加过渡结束后的处理，以避免布局问题
    const handleTransitionEnd = () => {
        // 重新调整任何依赖于侧边栏宽度的布局
        window.dispatchEvent(new Event('resize'));
        sidebar.removeEventListener('transitionend', handleTransitionEnd);
    };
    sidebar.addEventListener('transitionend', handleTransitionEnd);
    
    // 保存状态到localStorage
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
});

// 阻止添加按钮的点击事件冒泡
addCategoryBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    addNewCategory();
});

addPostBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    addNewPost();
});

// 分类和文章部分的折叠/展开
document.querySelectorAll('.collapsible-section .section-header').forEach(header => {
    header.addEventListener('click', function(e) {
        // 如果点击的是按钮，不处理折叠
        if (e.target.closest('.section-actions')) return;
        
        const section = this.closest('.collapsible-section');
        section.classList.toggle('collapsed');
        
        // 添加动画效果
        const list = section.querySelector('.sidebar-list');
        if (!section.classList.contains('collapsed')) {
            // 展开时的动画
            setTimeout(() => {
                list.style.maxHeight = list.scrollHeight + 'px';
            }, 10);
        } else {
            // 折叠时的动画
            list.style.maxHeight = '0px';
        }
        
        // 保存状态到localStorage
        const sectionId = section.querySelector('.section-title span').textContent.trim();
        localStorage.setItem(`section_${sectionId}_collapsed`, section.classList.contains('collapsed'));
    });
});

// 恢复上次访问时的折叠状态
function restoreSidebarState() {
    // 恢复侧边栏状态 - 但在移动设备上强制折叠
    if (window.innerWidth < 768) {
        sidebar.classList.add('collapsed');
    } else {
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }
    
    // 延迟处理分类和文章部分的折叠状态，确保DOM已完全加载
    setTimeout(() => {
        document.querySelectorAll('.collapsible-section').forEach(section => {
            const sectionId = section.querySelector('.section-title span').textContent.trim();
            const isCollapsed = localStorage.getItem(`section_${sectionId}_collapsed`) === 'true';
            if (isCollapsed) {
                section.classList.add('collapsed');
            }
        });
    }, 100);
}

// 登入逻辑
loginBtn.addEventListener('click', function() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // 登入成功
            loginContainer.style.display = 'none';
            appContainer.style.display = 'flex';
            loginError.textContent = '';
            loadData();
            // 恢复侧边栏状态
            restoreSidebarState();
        })
        .catch((error) => {
            // 登入失败
            loginError.textContent = `登入失敗: ${error.message}`;
        });
});

// 登出
logoutBtn.addEventListener('click', function() {
    auth.signOut().then(() => {
        loginContainer.style.display = 'block';
        appContainer.style.display = 'none';
    });
});

// 检查用户登录状态
auth.onAuthStateChanged(function(user) {
    if (user) {
        // 用户已登录
        loginContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        loadData();
        // 恢复侧边栏状态
        restoreSidebarState();
    } else {
        // 用户未登录
        loginContainer.style.display = 'block';
        appContainer.style.display = 'none';
    }
});

// 加载博客数据
function loadData() {
    const blogRef = database.ref('blog-posts');
    
    blogRef.once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                blogData = snapshot.val();
            } else {
                blogData = [];
            }
            
            // 渲染分类列表
            renderCategoryList();
            
            // 渲染文章列表
            renderPostList();
            
            // 渲染分类下拉列表
            renderCategoryOptions();
        })
        .catch(error => {
            console.error('載入資料失敗:', error);
            alert('載入資料失敗，請檢查網路連線');
        });
}

// 渲染分类列表
function renderCategoryList() {
    categoryList.innerHTML = '';
    
    if (!blogData || blogData.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'sidebar-item';
        emptyItem.innerHTML = '<span class="item-title">暫無分類</span>';
        categoryList.appendChild(emptyItem);
        return;
    }
    
    blogData.forEach((category, index) => {
        const li = document.createElement('li');
        li.className = 'sidebar-item';
        li.dataset.type = 'category';
        li.dataset.index = index;
        
        // 添加文章计数
        const postCount = category.items ? category.items.length : 0;
        
        li.innerHTML = `
            <span class="item-title">${category.category} <small style="opacity: 0.6;">(${postCount})</small></span>
            <div class="item-actions">
                <button class="btn-icon edit-category" data-index="${index}" title="編輯">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-category" data-index="${index}" title="刪除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        categoryList.appendChild(li);
        
        // 点击分类查看该分类下的文章
        li.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-icon')) {
                setActiveSidebarItem(this);
                filterPostsByCategory(index);
            }
        });
    });
    
    // 绑定编辑和删除按钮事件
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = this.dataset.index;
            editCategory(index);
        });
    });
    
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = this.dataset.index;
            deleteCategory(index);
        });
    });
}

// 渲染文章列表
function renderPostList(categoryFilter = null) {
    postList.innerHTML = '';
    
    let hasAnyPosts = false;
    
    // 添加分类标题，仅当过滤特定分类时显示
    if (categoryFilter !== null) {
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'sidebar-category-title';
        categoryTitle.style.padding = '5px 15px';
        categoryTitle.style.fontSize = '12px';
        categoryTitle.style.color = 'var(--text-muted)';
        categoryTitle.style.fontWeight = '500';
        categoryTitle.style.textTransform = 'uppercase';
        categoryTitle.style.letterSpacing = '1px';
        categoryTitle.style.marginTop = '5px';
        categoryTitle.textContent = blogData[categoryFilter].category;
        postList.appendChild(categoryTitle);
    }
    
    blogData.forEach((category, categoryIndex) => {
        // 如果指定了分类过滤，只显示该分类的文章
        if (categoryFilter !== null && categoryFilter != categoryIndex) {
            return;
        }
        
        if (category.items && category.items.length > 0) {
            hasAnyPosts = true;
            
            // 添加分类标题，仅当没有过滤时显示
            if (categoryFilter === null) {
                const categoryTitle = document.createElement('div');
                categoryTitle.className = 'sidebar-category-title';
                categoryTitle.style.padding = '5px 15px';
                categoryTitle.style.fontSize = '12px';
                categoryTitle.style.color = 'var(--text-muted)';
                categoryTitle.style.fontWeight = '500';
                categoryTitle.style.textTransform = 'uppercase';
                categoryTitle.style.letterSpacing = '1px';
                categoryTitle.style.marginTop = '10px';
                categoryTitle.textContent = category.category;
                postList.appendChild(categoryTitle);
            }
            
            category.items.forEach((post, postIndex) => {
                const li = document.createElement('li');
                li.className = 'sidebar-item';
                li.dataset.type = 'post';
                li.dataset.categoryIndex = categoryIndex;
                li.dataset.postIndex = postIndex;
                
                li.innerHTML = `
                    <span class="item-title">${post.title}</span>
                    <div class="item-actions">
                        <button class="btn-icon edit-post" data-category="${categoryIndex}" data-post="${postIndex}" title="編輯">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-post" data-category="${categoryIndex}" data-post="${postIndex}" title="刪除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                postList.appendChild(li);
                
                // 点击文章查看/编辑文章
                li.addEventListener('click', function(e) {
                    if (!e.target.closest('.btn-icon')) {
                        setActiveSidebarItem(this);
                        editPost(categoryIndex, postIndex);
                    }
                });
            });
        }
    });
    
    if (!hasAnyPosts) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'sidebar-item';
        emptyItem.innerHTML = '<span class="item-title">暫無文章</span>';
        postList.appendChild(emptyItem);
    }
    
    // 绑定编辑和删除按钮事件
    document.querySelectorAll('.edit-post').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const categoryIndex = this.dataset.category;
            const postIndex = this.dataset.post;
            editPost(categoryIndex, postIndex);
        });
    });
    
    document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const categoryIndex = this.dataset.category;
            const postIndex = this.dataset.post;
            deletePost(categoryIndex, postIndex);
        });
    });
}

// 按分类过滤文章
function filterPostsByCategory(categoryIndex) {
    pageTitle.textContent = `分類：${blogData[categoryIndex].category}`;
    renderPostList(categoryIndex);
    
    // 隐藏编辑区域，显示分类信息
    postEditor.style.display = 'none';
    categoryEditor.style.display = 'none';
    
    // 可以在这里显示分类的统计信息等
}

// 设置侧边栏激活项
function setActiveSidebarItem(item) {
    // 移除之前的激活状态
    if (activeSidebarItem) {
        activeSidebarItem.classList.remove('active');
    }
    
    // 设置新的激活状态
    item.classList.add('active');
    activeSidebarItem = item;
}

// 渲染分类选项
function renderCategoryOptions() {
    categorySelect.innerHTML = '';
    
    blogData.forEach((category, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = category.category;
        categorySelect.appendChild(option);
    });
}

// 编辑文章
function editPost(categoryIndex, postIndex) {
    const post = blogData[categoryIndex].items[postIndex];
    
    // 设置标题
    pageTitle.textContent = `編輯文章: ${post.title}`;
    document.getElementById('editorTitle').textContent = '編輯文章';
    
    // 填充表单
    document.getElementById('title').value = post.title;
    document.getElementById('category').value = categoryIndex;
    document.getElementById('date').value = formatDate(post.date);
    document.getElementById('description').value = post.description;
    document.getElementById('tags').value = post.tags.join(', ');
    document.getElementById('filePath').value = post.file_path;
    document.getElementById('coverImage').value = post.cover_image;
    
    document.getElementById('editingId').value = 'editing';
    document.getElementById('editingCategoryIndex').value = categoryIndex;
    document.getElementById('editingPostIndex').value = postIndex;
    
    // 显示编辑区域
    postEditor.style.display = 'block';
    categoryEditor.style.display = 'none';
}

// 新增文章
function addNewPost() {
    // 设置标题
    pageTitle.textContent = '新增文章';
    document.getElementById('editorTitle').textContent = '新增文章';
    
    // 重置表单
    postForm.reset();
    document.getElementById('editingId').value = '';
    document.getElementById('editingCategoryIndex').value = '';
    document.getElementById('editingPostIndex').value = '';
    
    // 设置默认日期为今天
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // 显示编辑区域
    postEditor.style.display = 'block';
    categoryEditor.style.display = 'none';
}

// 删除文章
function deletePost(categoryIndex, postIndex) {
    if (confirm('確定要刪除這篇文章嗎？此操作不可撤銷。')) {
        blogData[categoryIndex].items.splice(postIndex, 1);
        
        // 保存到Firebase
        saveData();
    }
}

// 编辑分类
function editCategory(categoryIndex) {
    const category = blogData[categoryIndex];
    
    // 设置标题
    pageTitle.textContent = `編輯分類: ${category.category}`;
    document.getElementById('categoryEditorTitle').textContent = '編輯分類';
    
    // 填充表单
    document.getElementById('categoryName').value = category.category;
    document.getElementById('editingCategoryId').value = categoryIndex;
    
    // 显示编辑区域
    categoryEditor.style.display = 'block';
    postEditor.style.display = 'none';
}

// 新增分类
function addNewCategory() {
    // 设置标题
    pageTitle.textContent = '新增分類';
    document.getElementById('categoryEditorTitle').textContent = '新增分類';
    
    // 重置表单
    categoryForm.reset();
    document.getElementById('editingCategoryId').value = '';
    
    // 显示编辑区域
    categoryEditor.style.display = 'block';
    postEditor.style.display = 'none';
}

// 删除分类
function deleteCategory(categoryIndex) {
    if (confirm('確定要刪除這個分類嗎？該分類下的所有文章也將被刪除。此操作不可撤銷。')) {
        blogData.splice(categoryIndex, 1);
        
        // 保存到Firebase
        saveData();
    }
}

// 保存数据到Firebase
function saveData() {
    const blogRef = database.ref('blog-posts');
    
    blogRef.set(blogData)
        .then(() => {
            // 重新加载数据
            loadData();
            
            // 重置视图
            postEditor.style.display = 'none';
            categoryEditor.style.display = 'none';
            pageTitle.textContent = '儀表板';
        })
        .catch(error => {
            console.error('儲存資料失敗:', error);
            alert('儲存資料失敗，請檢查網路連線');
        });
}

// 文章表单提交
postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const categoryIndex = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const tagsStr = document.getElementById('tags').value;
    const filePath = document.getElementById('filePath').value;
    const coverImage = document.getElementById('coverImage').value;
    
    // 处理标签
    const tags = tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    // 创建文章对象
    const post = {
        title,
        date: formatDateForDisplay(date),
        description,
        tags,
        file_path: filePath,
        cover_image: coverImage
    };
    
    // 判断是新增还是编辑
    const editingId = document.getElementById('editingId').value;
    
    if (editingId === 'editing') {
        // 编辑现有文章
        const editingCategoryIndex = document.getElementById('editingCategoryIndex').value;
        const editingPostIndex = document.getElementById('editingPostIndex').value;
        
        // 如果分类发生变化
        if (editingCategoryIndex !== categoryIndex) {
            // 从原分类中删除
            blogData[editingCategoryIndex].items.splice(editingPostIndex, 1);
            
            // 添加到新分类
            if (!blogData[categoryIndex].items) {
                blogData[categoryIndex].items = [];
            }
            blogData[categoryIndex].items.push(post);
        } else {
            // 在原分类中更新
            blogData[categoryIndex].items[editingPostIndex] = post;
        }
    } else {
        // 新增文章
        if (!blogData[categoryIndex].items) {
            blogData[categoryIndex].items = [];
        }
        blogData[categoryIndex].items.push(post);
    }
    
    // 保存到Firebase
    saveData();
});

// 分类表单提交
categoryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const categoryName = document.getElementById('categoryName').value;
    const editingCategoryId = document.getElementById('editingCategoryId').value;
    
    if (editingCategoryId !== '') {
        // 编辑现有分类
        blogData[editingCategoryId].category = categoryName;
    } else {
        // 新增分类
        blogData.push({
            category: categoryName,
            items: []
        });
    }
    
    // 保存到Firebase
    saveData();
});

// 取消编辑按钮
document.getElementById('cancelPostEdit').addEventListener('click', function() {
    postEditor.style.display = 'none';
    pageTitle.textContent = '儀表板';
    postForm.reset();
});

document.getElementById('cancelCategoryEdit').addEventListener('click', function() {
    categoryEditor.style.display = 'none';
    pageTitle.textContent = '儀表板';
    categoryForm.reset();
});

// 日期格式化工具函数
function formatDate(dateStr) {
    // 将YYYY-MM-DD格式转换为yyyy-mm-dd格式
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${year}-${month}-${day}`;
    }
    return dateStr;
}

// 日期格式化工具函数(用于显示)
function formatDateForDisplay(dateStr) {
    // 将yyyy-mm-dd格式转换为YYYY-MM-DD格式
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 点击遮罩层关闭侧边栏
sidebarOverlay.addEventListener('click', function() {
    sidebar.classList.add('collapsed');
    localStorage.setItem('sidebarCollapsed', true);
}); 