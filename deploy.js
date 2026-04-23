const https = require('https');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q) {
    return new Promise(resolve => rl.question(q, resolve));
}

function apiRequest(method, path, token, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'holland-deploy',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    console.log('========================================');
    console.log('  GitHub Pages 自动部署工具');
    console.log('========================================\n');

    const username = (await ask('请输入你的 GitHub 用户名: ')).trim();
    if (!username) {
        console.log('错误: 用户名不能为空');
        rl.close();
        return;
    }

    const token = (await ask('请输入你的 GitHub Personal Access Token: ')).trim();
    if (!token) {
        console.log('错误: Token 不能为空');
        rl.close();
        return;
    }

    console.log('\n正在验证 Token...');
    const userRes = await apiRequest('GET', '/user', token);
    if (userRes.status !== 200) {
        console.log('Token 验证失败:', userRes.data.message || '未知错误');
        rl.close();
        return;
    }
    console.log(`Token 验证通过! 用户: ${userRes.data.login}\n`);

    const repoName = 'holland-career-test';

    console.log(`正在创建仓库 ${repoName}...`);
    const createRes = await apiRequest('POST', '/user/repos', token, {
        name: repoName,
        description: '霍兰德职业兴趣测评 - 基于RIASEC模型',
        private: false,
        auto_init: false
    });

    if (createRes.status === 422 && createRes.data.errors?.some(e => e.message?.includes('already exists'))) {
        console.log('仓库已存在，将推送到现有仓库...\n');
    } else if (createRes.status !== 201) {
        console.log('创建仓库失败:', createRes.data.message || JSON.stringify(createRes.data));
        rl.close();
        return;
    } else {
        console.log('仓库创建成功!\n');
    }

    const remoteUrl = `https://${username}:${token}@github.com/${username}/${repoName}.git`;

    console.log('正在配置 Git 远程仓库...');
    try {
        execSync('git branch -M main', { stdio: 'inherit' });
        execSync(`git remote add origin ${remoteUrl} 2>nul || git remote set-url origin ${remoteUrl}`, { stdio: 'pipe' });
    } catch (e) {
        console.log('配置远程仓库时出错:', e.message);
    }

    console.log('\n正在推送代码到 GitHub...');
    try {
        execSync('git push -u origin main --force', { stdio: 'inherit' });
    } catch (e) {
        console.log('\n推送失败，请检查网络或权限。');
        rl.close();
        return;
    }

    console.log('\n正在开启 GitHub Pages...');
    const pagesRes = await apiRequest('POST', `/repos/${username}/${repoName}/pages`, token, {
        source: { branch: 'main', path: '/' }
    });

    if (pagesRes.status === 201 || pagesRes.status === 204) {
        console.log('GitHub Pages 已开启!');
    } else if (pagesRes.status === 409) {
        console.log('GitHub Pages 可能已开启。');
    } else {
        console.log('开启 Pages 时出现问题:', pagesRes.data.message || '');
    }

    const siteUrl = `https://${username}.github.io/${repoName}/`;

    console.log('\n========================================');
    console.log('  部署完成!');
    console.log('========================================');
    console.log(`\n公网链接: ${siteUrl}`);
    console.log('\n注意: GitHub Pages 首次部署可能需要 1-5 分钟生效。');
    console.log('========================================\n');

    rl.close();
}

main().catch(err => {
    console.error('发生错误:', err.message);
    rl.close();
});
