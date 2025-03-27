// 13D代币合约地址
const TOKEN_ADDRESS = 'Kf2UHsG9N617Nu6egFneDYH8WUZ45Y4WDV5NbzZEQ4L';

// 支持的代币及其合约地址
const SUPPORTED_TOKENS = {
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    BTC: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    ETH: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'
};

// 汇率 (示例值，实际需要从API获取)
const EXCHANGE_RATES = {
    USDT: 1.0,
    USDC: 1.0,
    BTC: 50000.0,
    ETH: 3000.0
};

// 初始化Solana连接
const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl('mainnet-beta'),
    'confirmed'
);

// 钱包适配器
const wallet = new solanaWeb3.Wallet();

// DOM元素
const connectWalletBtn = document.getElementById('connectWallet');
const fromTokenSelect = document.getElementById('fromToken');
const fromAmountInput = document.getElementById('fromAmount');
const toAmountInput = document.getElementById('toAmount');
const swapBtn = document.getElementById('swapBtn');

// 连接钱包
connectWalletBtn.addEventListener('click', async () => {
    try {
        // 使用Phantom钱包
        const provider = window.solana;
        if (provider) {
            await provider.connect();
            wallet.publicKey = provider.publicKey;
            connectWalletBtn.textContent = `已连接: ${wallet.publicKey.toString().slice(0, 4)}...${wallet.publicKey.toString().slice(-4)}`;
            connectWalletBtn.classList.add('wallet-connected');
            swapBtn.disabled = false;
        } else {
            alert('请安装Phantom钱包!');
        }
    } catch (error) {
        console.error('连接钱包失败:', error);
        alert('连接钱包失败: ' + error.message);
    }
});

// 计算兑换金额
fromAmountInput.addEventListener('input', updateToAmount);
fromTokenSelect.addEventListener('change', updateToAmount);

function updateToAmount() {
    const fromToken = fromTokenSelect.value;
    const fromAmount = parseFloat(fromAmountInput.value) || 0;
    const rate = EXCHANGE_RATES[fromToken];
    const toAmount = fromAmount * rate;
    toAmountInput.value = toAmount.toFixed(2);
}

// 执行兑换
swapBtn.addEventListener('click', async () => {
    if (!wallet.publicKey) {
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

        // 1. 获取用户代币账户
        const fromTokenAccount = await getTokenAccount(wallet.publicKey, SUPPORTED_TOKENS[fromToken]);
        
        // 2. 获取13D代币账户
        const toTokenAccount = await getOrCreateTokenAccount(wallet.publicKey, TOKEN_ADDRESS);
        
        // 3. 构建交易
        const transaction = new solanaWeb3.Transaction();
        
        // 4. 添加转账指令
        transaction.add(
            splToken.Token.createTransferInstruction(
                splToken.TOKEN_PROGRAM_ID,
                fromTokenAccount.address,
                toTokenAccount.address,
                wallet.publicKey,
                [],
                fromAmount * Math.pow(10, 9) // 假设代币有9位小数
            )
        );
        
        // 5. 发送交易
        const signature = await wallet.sendTransaction(transaction, connection);
        
        // 6. 确认交易
        await connection.confirmTransaction(signature);
        
        alert('兑换成功! 交易ID: ' + signature);
    } catch (error) {
        console.error('兑换失败:', error);
        alert('兑换失败: ' + error.message);
    } finally {
        swapBtn.disabled = false;
        swapBtn.textContent = '兑换';
    }
});

// 获取代币账户
async function getTokenAccount(owner, mint) {
    const accounts = await connection.getTokenAccountsByOwner(owner, { mint });
    if (accounts.value.length === 0) {
        throw new Error('未找到代币账户');
    }
    return {
        address: accounts.value[0].pubkey,
        account: splToken.AccountLayout.decode(accounts.value[0].account.data)
    };
}

// 获取或创建代币账户
async function getOrCreateTokenAccount(owner, mint) {
    try {
        return await getTokenAccount(owner, mint);
    } catch {
        // 如果账户不存在则创建
        const transaction = new solanaWeb3.Transaction();
        const newAccount = solanaWeb3.Keypair.generate();
        
        transaction.add(
            splToken.Token.createInitAccountInstruction(
                splToken.TOKEN_PROGRAM_ID,
                new solanaWeb3.PublicKey(mint),
                newAccount.publicKey,
                owner
            )
        );
        
        const signature = await wallet.sendTransaction(transaction, connection, {
            signers: [newAccount]
        });
        
        await connection.confirmTransaction(signature);
        
        return {
            address: newAccount.publicKey,
            account: null // 新账户，暂无数据
        };
    }
}
