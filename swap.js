// 13D代币合约地址
const TOKEN_ADDRESS = 'Kf2UHsG9N617Nu6egFneDYH8WUZ45Y4WDV5NbzZEQ4L';

// 支持的代币及其合约地址
const SUPPORTED_TOKENS = {
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    BTC: '9n4nbM75f5UiussK8cChQ6xcc8WFY64FVf8sB25TKc1y',
    ETH: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'
};

// 初始化Reown AppKit
const appkit = window.Reown.AppKit;

// 获取实时汇率
async function getExchangeRate(fromToken) {
    try {
        const response = await fetch(`https://api.reown.com/swap/rate?from=${SUPPORTED_TOKENS[fromToken]}&to=${TOKEN_ADDRESS}`);
        const data = await response.json();
        return data.rate;
    } catch (error) {
        console.error('获取汇率失败:', error);
        // 返回默认汇率
        return {
            USDT: 0.1,
            USDC: 0.1,
            BTC: 50000,
            ETH: 3000
        }[fromToken];
    }
}

// 交易历史记录
window.swapHistory = [];

// DOM元素
const connectWalletBtn = document.getElementById('connectWallet');
const fromTokenSelect = document.getElementById('fromToken');
const fromAmountInput = document.getElementById('fromAmount');
const toAmountInput = document.getElementById('toAmount');
const swapBtn = document.getElementById('swapBtn');

// 钱包连接状态
let walletConnected = false;
let publicKey = null;

// 初始化钱包连接
async function initWallet() {
    try {
        // 使用Reown AppKit连接钱包
        const wallet = await appkit.connectWallet();
        publicKey = wallet.publicKey;
        walletConnected = true;
        
        connectWalletBtn.textContent = `已连接: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
        connectWalletBtn.classList.add('wallet-connected');
        swapBtn.disabled = false;
        
        console.log('钱包连接成功:', publicKey.toString());
    } catch (error) {
        console.error('钱包连接失败:', error);
        alert('钱包连接失败: ' + error.message);
    }
}

// 计算兑换金额
async function calculateSwapAmount() {
    const fromToken = fromTokenSelect.value;
    const fromAmount = parseFloat(fromAmountInput.value) || 0;
    
    if (fromAmount <= 0) {
        toAmountInput.value = '0.00';
        return;
    }

    try {
        const rate = await getExchangeRate(fromToken);
        const toAmount = fromAmount * rate;
        toAmountInput.value = toAmount.toFixed(2);
    } catch (error) {
        console.error('计算金额失败:', error);
        toAmountInput.value = '0.00';
    }
}

// 执行代币兑换
async function executeSwap() {
    if (!walletConnected || !publicKey) {
        alert('请先连接钱包');
        return;
    }

    const fromToken = fromTokenSelect.value;
    const fromAmount = parseFloat(fromAmountInput.value);
    
    if (!fromAmount || fromAmount <= 0) {
        alert('请输入有效数量');
        return;
    }

    try {
        swapBtn.disabled = true;
        swapBtn.textContent = '处理中...';

        // 使用Reown AppKit执行代币兑换
        const result = await appkit.executeSwap({
            fromToken: SUPPORTED_TOKENS[fromToken],
            toToken: TOKEN_ADDRESS,
            amount: fromAmount,
            slippage: 0.5 // 0.5%滑点
        });

        // 记录交易历史
        swapHistory.push({
            txHash: result.txHash,
            fromToken,
            fromAmount,
            toToken: '13D',
            toAmount: toAmountInput.value,
            timestamp: new Date().toISOString()
        });

        // 显示交易详情
        const txUrl = `https://solscan.io/tx/${result.txHash}`;
        alert(`兑换成功!\n交易哈希: ${result.txHash}\n查看详情: ${txUrl}`);
        console.log('兑换成功:', result);

        // 更新UI
        fromAmountInput.value = '';
        toAmountInput.value = '0.00';

    } catch (error) {
        console.error('兑换失败:', error);
        
        // 更详细的错误处理
        let errorMsg = '兑换失败';
        if (error.message.includes('insufficient funds')) {
            errorMsg = '余额不足';
        } else if (error.message.includes('user rejected')) {
            errorMsg = '用户取消交易';
        } else {
            errorMsg = error.message;
        }
        
        alert(`兑换失败: ${errorMsg}`);
    } finally {
        swapBtn.disabled = false;
        swapBtn.textContent = '兑换';
    }
}

// 显示交易历史
function showSwapHistory() {
    if (swapHistory.length === 0) {
        console.log('暂无交易历史');
        return;
    }
    
    console.log('交易历史:');
    swapHistory.forEach(tx => {
        console.log(`[${new Date(tx.timestamp).toLocaleString()}] ${tx.fromAmount} ${tx.fromToken} → ${tx.toAmount} ${tx.toToken} (${tx.txHash})`);
    });
}

// 事件监听
connectWalletBtn.addEventListener('click', initWallet);
fromTokenSelect.addEventListener('change', calculateSwapAmount);
fromAmountInput.addEventListener('input', calculateSwapAmount);
swapBtn.addEventListener('click', executeSwap);

// 初始化
console.log('代币兑换界面已加载');

// 定期检查钱包状态和更新UI
setInterval(() => {
    if (walletConnected && publicKey) {
        appkit.getWalletBalance(publicKey)
            .then(balance => {
                console.log('当前钱包余额:', balance);
                // 触发UI更新
                if (typeof updateWalletInfo === 'function') {
                    updateWalletInfo(balance);
                }
            })
            .catch(console.error);
            
        // 触发交易历史更新
        if (typeof updateSwapHistory === 'function' && window.swapHistory) {
            updateSwapHistory(window.swapHistory);
        }
    }
}, 10000); // 每10秒检查一次
