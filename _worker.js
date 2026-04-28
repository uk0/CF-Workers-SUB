
// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;
		//console.log(`${fakeUserID}\n${fakeHostName}`); // 打印fakeID

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); // 去重
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !isSubConverterRequest && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB  (https://github.com/cmliu/CF-Workers-SUB)' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			// 构建响应头对象
			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
				//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
			};

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });//订阅转换
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				// 只有非浏览器订阅才会返回SUBNAME
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html lang="zh-CN">
				<head>
					<title>${FileName}</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<style>
						*, *::before, *::after { box-sizing: border-box; }
						body {
							margin: 0;
							font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Roboto, sans-serif;
							background: linear-gradient(180deg, #f7f8fa 0%, #eef1f6 100%);
							min-height: 100vh;
							color: #1f2937;
							padding: 32px 16px;
							-webkit-font-smoothing: antialiased;
						}
						.container { max-width: 760px; margin: 0 auto; }
						.header {
							display: flex; align-items: baseline; justify-content: space-between;
							margin: 0 4px 20px;
						}
						.header h1 {
							margin: 0; font-size: 20px; font-weight: 600;
							color: #111827; letter-spacing: 0.2px;
						}
						.header .badge {
							font-size: 11px; color: #6b7280; padding: 3px 10px;
							background: #fff; border-radius: 999px; border: 1px solid #e5e7eb;
							letter-spacing: 0.3px;
						}
						.card {
							background: #fff;
							border: 1px solid #e5e7eb;
							border-radius: 12px;
							padding: 20px;
							margin-bottom: 16px;
							box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
						}
						.card-head {
							display: flex; align-items: center; justify-content: space-between;
							margin-bottom: 14px; gap: 12px; flex-wrap: wrap;
						}
						.card-title { font-size: 14px; font-weight: 600; color: #111827; }
						.switch {
							display: inline-flex; padding: 3px;
							background: #f3f4f6; border-radius: 8px; gap: 2px;
						}
						.switch button {
							border: 0; background: transparent; padding: 6px 14px;
							font-size: 12px; color: #6b7280; cursor: pointer; border-radius: 6px;
							transition: all 0.15s;
						}
						.switch button.active {
							background: #fff; color: #111827;
							box-shadow: 0 1px 2px rgba(0,0,0,0.06);
						}
						.formats {
							display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px;
							margin-bottom: 14px;
						}
						.formats button {
							border: 1px solid #e5e7eb;
							background: #fff;
							padding: 8px 6px;
							font-size: 12px; color: #4b5563; cursor: pointer;
							border-radius: 8px;
							transition: all 0.15s;
						}
						.formats button:hover { border-color: #c7d2fe; color: #4f46e5; }
						.formats button.active {
							background: #4f46e5; color: #fff; border-color: #4f46e5;
						}
						.url-row {
							display: flex; align-items: center; gap: 8px;
							background: #f9fafb;
							border: 1px solid #e5e7eb;
							border-radius: 8px;
							padding: 8px 8px 8px 12px;
						}
						.url-row input {
							flex: 1; min-width: 0; border: 0; background: transparent;
							font-size: 12px; color: #1f2937; outline: none;
							font-family: "SF Mono", Monaco, Consolas, "Courier New", monospace;
						}
						.url-row button {
							border: 0; background: #111827; color: #fff;
							padding: 6px 14px; border-radius: 6px;
							font-size: 12px; cursor: pointer;
							transition: background 0.15s;
						}
						.url-row button:hover { background: #4f46e5; }
						.qr-wrap {
							display: flex; justify-content: center;
							padding: 18px 0 4px;
						}
						.qr-wrap > div { padding: 8px; background: #fff; border-radius: 8px; border: 1px solid #f3f4f6; }
						.editor {
							width: 100%;
							min-height: 280px;
							padding: 12px 14px;
							border: 1px solid #e5e7eb;
							border-radius: 8px;
							font-size: 12px;
							font-family: "SF Mono", Monaco, Consolas, "Courier New", monospace;
							line-height: 1.6;
							resize: vertical;
							outline: none;
							background: #fcfcfd;
							color: #1f2937;
							transition: border-color 0.15s, box-shadow 0.15s;
						}
						.editor:focus {
							border-color: #4f46e5;
							box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
							background: #fff;
						}
						.save-row {
							display: flex; align-items: center; justify-content: space-between;
							margin-top: 12px; gap: 12px; flex-wrap: wrap;
						}
						.save-hint { font-size: 11px; color: #9ca3af; }
						.save-btn {
							padding: 8px 22px;
							color: #fff;
							background: #111827;
							border: 0;
							border-radius: 8px;
							cursor: pointer;
							font-size: 13px;
							transition: background 0.15s;
						}
						.save-btn:hover { background: #4f46e5; }
						.save-btn:disabled { background: #9ca3af; cursor: not-allowed; }
						.save-status { color: #9ca3af; font-size: 12px; }
						.empty-hint { color: #9ca3af; font-size: 13px; margin: 0; }
						.toast {
							position: fixed; bottom: 28px; left: 50%;
							transform: translateX(-50%) translateY(20px);
							background: #111827; color: #fff;
							padding: 9px 18px; border-radius: 999px;
							font-size: 12px; opacity: 0;
							transition: opacity 0.2s, transform 0.2s;
							pointer-events: none;
							box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
						}
						.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
						@media (max-width: 540px) {
							body { padding: 18px 12px; }
							.formats { grid-template-columns: repeat(3, 1fr); }
							.url-row { flex-wrap: wrap; padding: 10px 12px; }
							.url-row input { width: 100%; padding: 4px 0; }
							.url-row button { width: 100%; padding: 8px; }
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
				<div class="container">
					<div class="header">
						<h1>${FileName}</h1>
						<span class="badge">订阅聚合</span>
					</div>
					<div class="card">
						<div class="card-head">
							<div class="card-title">订阅地址</div>
							<div class="switch" id="modeSwitch">
								<button data-mode="owner" class="active">主订阅</button>
								<button data-mode="guest">访客</button>
							</div>
						</div>
						<div class="formats" id="formats">
							<button data-fmt="" class="active">自适应</button>
							<button data-fmt="b64">Base64</button>
							<button data-fmt="clash">Clash</button>
							<button data-fmt="sb">SingBox</button>
							<button data-fmt="surge">Surge</button>
							<button data-fmt="loon">Loon</button>
						</div>
						<div class="url-row">
							<input id="subUrl" readonly value="">
							<button onclick="copyUrl()">复制</button>
						</div>
						<div class="qr-wrap" id="qrcode"></div>
					</div>
					${hasKV ? `
					<div class="card">
						<div class="card-head">
							<div class="card-title">节点编辑</div>
							<span class="save-status" id="saveStatus"></span>
						</div>
						<textarea class="editor" id="content" placeholder="每行一个节点链接或订阅地址">${content}</textarea>
						<div class="save-row">
							<span class="save-hint">支持 vmess / vless / trojan / ss / hysteria 等节点链接和订阅地址</span>
							<button class="save-btn" onclick="saveContent(this)">保存</button>
						</div>
					</div>
					` : `
					<div class="card">
						<div class="card-head"><div class="card-title">节点编辑</div></div>
						<p class="empty-hint">请在 Workers 中绑定 KV 命名空间以启用在线编辑</p>
					</div>
					`}
				</div>
				<div class="toast" id="toast">已复制</div>
				<script>
					const ownerBase = 'https://${url.hostname}/${mytoken}';
					const guestBase = 'https://${url.hostname}/sub?token=${guest}';
					let mode = 'owner';
					let fmt = '';

					function buildUrl() {
						const base = mode === 'owner' ? ownerBase : guestBase;
						if (!fmt) return base;
						const sep = base.includes('?') ? '&' : '?';
						return base + sep + fmt;
					}

					function render() {
						const link = buildUrl();
						document.getElementById('subUrl').value = link;
						const qr = document.getElementById('qrcode');
						qr.innerHTML = '';
						new QRCode(qr, {
							text: link,
							width: 200,
							height: 200,
							colorDark: "#111827",
							colorLight: "#ffffff",
							correctLevel: QRCode.CorrectLevel.Q
						});
					}

					document.getElementById('modeSwitch').addEventListener('click', e => {
						const btn = e.target.closest('button');
						if (!btn) return;
						document.querySelectorAll('#modeSwitch button').forEach(b => b.classList.remove('active'));
						btn.classList.add('active');
						mode = btn.dataset.mode;
						render();
					});

					document.getElementById('formats').addEventListener('click', e => {
						const btn = e.target.closest('button');
						if (!btn) return;
						document.querySelectorAll('#formats button').forEach(b => b.classList.remove('active'));
						btn.classList.add('active');
						fmt = btn.dataset.fmt;
						render();
					});

					let toastTimer;
					function toast(msg) {
						const t = document.getElementById('toast');
						t.textContent = msg;
						t.classList.add('show');
						clearTimeout(toastTimer);
						toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
					}

					function copyUrl() {
						const link = document.getElementById('subUrl').value;
						const done = () => toast('已复制到剪贴板');
						if (navigator.clipboard && window.isSecureContext) {
							navigator.clipboard.writeText(link).then(done).catch(fallback);
						} else {
							fallback();
						}
						function fallback() {
							const tmp = document.createElement('textarea');
							tmp.value = link; tmp.style.position = 'fixed'; tmp.style.opacity = '0';
							document.body.appendChild(tmp); tmp.select();
							try { document.execCommand('copy'); done(); } catch (_) { toast('复制失败'); }
							document.body.removeChild(tmp);
						}
					}

					render();

					const textarea = document.getElementById('content');
					if (textarea) {
						let timer;
						function saveContent(button) {
							const status = document.getElementById('saveStatus');
							const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
							if (!isIOS) textarea.value = textarea.value.replace(/：/g, ':');
							const newContent = textarea.value || '';
							const originalContent = textarea.defaultValue || '';
							if (newContent === originalContent) {
								status.style.color = '#9ca3af';
								status.textContent = '内容未变化';
								return;
							}
							if (button) { button.disabled = true; button.textContent = '保存中…'; }
							status.style.color = '#9ca3af';
							status.textContent = '保存中…';
							fetch(window.location.href, {
								method: 'POST',
								body: newContent,
								headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
								cache: 'no-cache'
							}).then(r => {
								if (!r.ok) throw new Error('HTTP ' + r.status);
								const now = new Date().toLocaleTimeString();
								document.title = '已保存 ' + now;
								status.style.color = '#10b981';
								status.textContent = '已于 ' + now + ' 保存';
								textarea.defaultValue = newContent;
							}).catch(err => {
								status.style.color = '#dc2626';
								status.textContent = '保存失败: ' + err.message;
							}).finally(() => {
								if (button) { button.disabled = false; button.textContent = '保存'; }
							});
						}
						window.saveContent = saveContent;
						textarea.addEventListener('blur', () => saveContent());
						textarea.addEventListener('input', () => {
							clearTimeout(timer);
							timer = setTimeout(() => saveContent(), 5000);
						});
					}
				</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}