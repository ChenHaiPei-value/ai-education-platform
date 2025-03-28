// 13D代币合约地址
const TOKEN_ADDRESS = 'Kf2UHsG9N617Nu6egFneDYH8WUZ45Y4WDV5NbzZEQ4L';

// 支持的代币及其合约地址
const SUPPORTED_TOKENS = {
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    BTC: '9n4nbM75f5UiussK8cChQ6xcc8WFY64FVf8sB25TKc1y',
    ETH: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'
};

// 汇率 (示例值，实际应从API获取)
const EXCHANGE_RATES = {
    USDT: 0.1,  // 1 USDT = 0.1 13D
    USDC: 0.1,
    BTC: 50000, // 1 BTC = 50000 13D
    ETH: 3000   // 1 ETH = 3000 13D
};

// 初始化Reown AppKit
const appkit = window.Reown.AppKit;

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
function calculateSwapAmount() {
    const fromToken = fromTokenSelect.value;
    const fromAmount = parseFloat(fromAmountInput.value) || 0;
    const rate = EXCHANGE_RATES[fromToken];
    const toAmount = fromAmount * rate;
    toAmountInput.value = toAmount.toFixed(2);
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

        alert(`兑换成功! 交易哈希: ${result.txHash}`);
        console.log('兑换成功:', result);

    } catch (error) {
        console.error('兑换失败:', error);
        alert(`兑换失败: ${error.message}`);
    } finally {
        swapBtn.disabled = false;
        swapBtn.textContent = '兑换';
    }
}

// 事件监听
connectWalletBtn.addEventListener('click', initWallet);
fromTokenSelect.addEventListener('change', calculateSwapAmount);
fromAmountInput.addEventListener('input', calculateSwapAmount);
swapBtn.addEventListener('click', executeSwap);

// 初始化
console.log('代币兑换界面已加载');
