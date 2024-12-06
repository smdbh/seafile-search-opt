// 处理URL的函数
function processUrl(url) {
    try {
        const urlObj = new URL(url);
        let pathParts = urlObj.pathname.split('/');
        if (pathParts[1] === 'lib') {
            pathParts[1] = 'library';
        }
        pathParts.pop();
        urlObj.pathname = pathParts.join('/');
        return urlObj.toString();
    } catch (e) {
        console.error('URL处理错误:', e);
        return url;
    }
}

// 处理链接的函数
function handleLink(url) {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        const processedUrl = processUrl(url);
        window.open(processedUrl, '_blank');
    } else {
        alert('未找到有效的链接！');
    }
}

// 应用基本样式
function applyBaseStyles(element, styles) {
    const currentStyle = element.getAttribute('style') || '';
    element.style.cssText = `${currentStyle}${styles}`;
}

// 设置表格样式
function setTableStyle() {
    const modalContent = document.querySelector('div.modal-content');
    if (!modalContent) return;

    // 设置模态框样式
    applyBaseStyles(modalContent, `
        width: 80vw !important;
        height: 90vh !important;
        margin: 0 auto !important;
        position: relative !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        overflow: hidden !important;
    `);

    const modalBody = modalContent.querySelector('.modal-body');
    if (!modalBody) return;

    // 设置模态框body样式
    applyBaseStyles(modalBody, `
        max-height: calc(90vh - 120px) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding: 15px !important;
    `);

    // 更新行数显示（即使没有表格也要更新）
    updateRowCount(modalContent, modalContent.querySelector('table'));

    const table = modalContent.querySelector('table');
    if (!table) return;

    // 设置表格基本样式
    applyBaseStyles(table, `
        width: 100% !important;
        table-layout: fixed !important;
        margin: 0 !important;
        border-collapse: collapse !important;
        line-height: 1 !important;
        font-size: 12px !important;
    `);

    // 处理表格行和单元格
    setupTableCells(table);
}

// 更新行数显示
function updateRowCount(modalContent, table) {
    const totalRows = table ? Math.max(0, table.rows.length - 1) : 0;
    let rowCountDiv = modalContent.querySelector('.table-row-count');
    const modalHeader = modalContent.querySelector('.modal-header');
    
    if (modalHeader) {
        const title = modalHeader.querySelector('.modal-title');
        if (title) {
            if (!rowCountDiv) {
                title.style.cssText += ';display: flex !important;align-items: center !important;';
                rowCountDiv = document.createElement('div');
                rowCountDiv.className = 'table-row-count';
                applyBaseStyles(rowCountDiv, `
                    margin-left: 15px !important;
                    background-color: #f8f9fa !important;
                    padding: 2px 8px !important;
                    border-radius: 4px !important;
                    font-size: 12px !important;
                    color: #666 !important;
                    border: 1px solid #ddd !important;
                `);
                title.appendChild(rowCountDiv);
            }
            rowCountDiv.textContent = `共 ${totalRows} 行`;
        }
    }
}

// 设置表格单元格
function setupTableCells(table) {
    const rows = Array.from(table.rows);
    const columnCount = rows[0]?.cells.length || 0;
    
    // 设置列宽
    if (rows[0]) {
        Array.from(rows[0].cells).forEach((cell, index) => {
            const width = index === 0 ? '5%' : 
                         index === 1 ? '45%' : 
                         `${50 / (columnCount - 2)}%`;
            applyBaseStyles(cell, `width: ${width} !important;`);
        });
    }

    // 处理数据行
    rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // 跳过表头

        const cells = Array.from(row.cells);
        cells.forEach((cell, cellIndex) => {
            // 基本单元格样式
            const baseStyles = `
                padding: 2px 4px !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                border: 1px solid #ddd !important;
                vertical-align: middle !important;
                height: 18px !important;
            `;

            // 第二列特殊处理
            if (cellIndex === 1) {
                if (!cell.hasAttribute('data-click-handler')) {
                    cell.setAttribute('data-click-handler', 'true');
                    applyBaseStyles(cell, baseStyles + 'cursor: pointer !important;');
                    
                    // 添加点击事件
                    cell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (e.target.tagName === 'A') {
                            e.preventDefault();
                        }
                        
                        const link = cell.querySelector('a');
                        const url = link?.href || cell.textContent.trim();
                        handleLink(url);
                    }, { once: true });
                }
            } else {
                applyBaseStyles(cell, baseStyles);
            }
        });
    });
}

// 添加输入框自动提交功能
function setupAutoSubmit() {
    const searchInput = document.querySelector('.form-control.mr-2');
    if (!searchInput || searchInput.hasAttribute('data-auto-submit')) return;

    searchInput.setAttribute('data-auto-submit', 'true');
    let timer = null;

    const submitSearch = () => {
        const submitButton = searchInput.nextElementSibling;
        if (submitButton?.tagName === 'BUTTON') {
            submitButton.click();
        }
    };

    searchInput.addEventListener('input', () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(submitSearch, 1000);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (timer) clearTimeout(timer);
            submitSearch();
        }
    });
}

// 添加右键菜单功能
function addContextMenu() {
    // 清理所有已存在的右键菜单
    function clearAllContextMenus() {
        document.querySelectorAll('.custom-context-menu').forEach(menu => menu.remove());
    }

    // 为第二列的单元格添加右键菜单事件
    document.addEventListener('contextmenu', function(e) {
        const cell = e.target.closest('td');
        if (!cell) return;
        
        const row = cell.closest('tr');
        if (!row) return;
        
        const cells = Array.from(row.cells);
        const cellIndex = cells.indexOf(cell);
        if (cellIndex !== 1) return;
        
        e.preventDefault();
        clearAllContextMenus();
        
        const menu = document.createElement('div');
        menu.className = 'custom-context-menu';
        applyBaseStyles(menu, `
            position: fixed !important;
            z-index: 10000 !important;
            background: white !important;
            border: 1px solid #ccc !important;
            border-radius: 4px !important;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2) !important;
            padding: 4px 0 !important;
            min-width: 120px !important;
            left: ${e.pageX}px !important;
            top: ${e.pageY}px !important;
        `);
        
        const menuItem = document.createElement('div');
        menuItem.textContent = '定位文件夹';
        applyBaseStyles(menuItem, `
            padding: 4px 12px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            color: #333 !important;
        `);
        
        menuItem.onmouseover = () => menuItem.style.backgroundColor = '#f0f0f0';
        menuItem.onmouseout = () => menuItem.style.backgroundColor = 'transparent';
        
        menuItem.onclick = () => {
            const link = cell.querySelector('a');
            const url = link?.href || cell.textContent.trim();
            handleLink(url);
            clearAllContextMenus();
        };
        
        menu.appendChild(menuItem);
        document.body.appendChild(menu);
        
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                clearAllContextMenus();
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('contextmenu', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            document.addEventListener('contextmenu', closeMenu);
        }, 0);
    });
}

// 使用防抖函数优化更新
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 更新所有功能
const updateAll = debounce(() => {
    setTableStyle();
    setupAutoSubmit();
}, 100);

// 创建观察器
const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    for (const mutation of mutations) {
        if (mutation.type === 'childList' && 
            (mutation.target.matches('table') || 
             mutation.target.closest('table') || 
             mutation.target.querySelector('table'))) {
            shouldUpdate = true;
            break;
        }
    }
    if (shouldUpdate) {
        updateAll();
    }
});

// 启动观察器
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
});

// 初始化
document.addEventListener('DOMContentLoaded', updateAll);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    setTableStyle();
    addContextMenu();
    setupAutoSubmit(); 
});

// 为了处理动态加载的内容，每秒检查一次
setInterval(() => {
    setTableStyle();
    addContextMenu();
    setupAutoSubmit(); 
}, 1000);
