// 扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed/updated');
});
