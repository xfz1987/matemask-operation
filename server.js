import http from 'http';
import { ethers } from 'ethers';
import 'dotenv/config';

// 环境变量配置（可以创建 .env 文件或直接在这里修改）
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const NETWORK = process.env.NETWORK || 'sepolia';
const PORT = process.env.PORT || 3000;

// 验证 Project ID
if (!INFURA_PROJECT_ID) {
	console.error('❌ 错误: 未设置 INFURA_PROJECT_ID 环境变量');
	console.error('');
	console.error('请按以下步骤操作:');
	console.error('1. 访问 https://infura.io/register 注册账号（免费）');
	console.error('2. 创建新项目，获取 Project ID');
	console.error('3. 设置环境变量后启动服务器:');
	console.error('');
	console.error('   INFURA_PROJECT_ID=你的项目ID node server.js');
	console.error('');
	process.exit(1);
}

const provider = new ethers.JsonRpcProvider(
	`https://${NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`
);

const server = http.createServer(async (req, res) => {
	// 添加CORS头，允许跨域请求
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	// 处理OPTIONS预检请求
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}

	// 使用WHATWG URL API替代url.parse()
	const url = new URL(req.url, `http://${req.headers.host}`);
	const path = url.pathname;

	console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);

	// 只处理 /tx/:hash
	if (path.startsWith('/tx/')) {
		const txHash = path.split('/tx/')[1];
		if (!txHash) {
			res.writeHead(400, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: '缺少交易哈希' }));
			return;
		}

		try {
			// 先确认网络连接正常
			const network = await provider.getNetwork();
			console.log(
				`Connected to network: ${network.name} (chainId: ${network.chainId})`
			);

			// provider
			// 	.getBlockNumber()
			// 	.then((blockNumber) => {
			// 		console.log(blockNumber);
			// 	})
			// 	.catch((error) => {
			// 		console.error(error);
			// 	});

			const tx = await provider.getTransaction(txHash);
			if (!tx) {
				res.writeHead(404, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: '交易不存在或尚未确认' }));
				return;
			}

			const receipt = await provider.getTransactionReceipt(txHash);

			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(
				JSON.stringify(
					{ tx, receipt },
					(_key, value) => {
						if (value && value._isBigNumber) return value.toString();
						return value;
					},
					2
				)
			);
		} catch (e) {
			console.error(`[ERROR] ${e.message}`);

			// 特别处理Infura的403错误
			if (e.message.includes('403') || e.message.includes('Forbidden')) {
				res.writeHead(403, { 'Content-Type': 'application/json' });
				res.end(
					JSON.stringify({
						error: 'Infura访问被拒绝',
						message:
							'请检查Infura项目设置：1. 确保项目处于活动状态；2. 检查allowlist设置；3. 验证API密钥限制',
						details: e.message,
					})
				);
			} else {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: e.message }));
			}
		}
	} else {
		// 其他路径
		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'Not Found' }));
	}
});

server.on('error', (e) => {
	if (e.code === 'EADDRINUSE') {
		console.error(
			`❌ 错误: 端口 ${PORT} 已被占用，请尝试其他端口或关闭占用进程。`
		);
		process.exit(1);
	}
});

server.listen(PORT, () => {
	console.log(`✅ Server running on port ${PORT}`);
	console.log(`📡 Network: ${NETWORK}`);
	if (INFURA_PROJECT_ID) {
		console.log(
			`🔗 Infura Project ID: ${INFURA_PROJECT_ID.substring(0, 8)}...`
		);
	} else {
		console.log(`❌ Infura Project ID: 未设置`);
	}
	console.log(`\n访问示例: http://localhost:${PORT}/tx/0x<交易哈希>\n`);
});
