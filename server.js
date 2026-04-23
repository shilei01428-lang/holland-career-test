const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLanIps() {
    const ips = [];
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('127.')) {
                ips.push({ name: name, ip: iface.address });
            }
        }
    }
    return ips;
}

const lanIps = getLanIps();
const ipListJson = JSON.stringify(lanIps);

const server = http.createServer((req, res) => {
    const filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath);
    const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
    }[ext] || 'text/plain';

    fs.readFile(fullPath, 'utf-8', (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        // Inject LAN IPs for index.html
        if (filePath === '/index.html' || filePath === '/') {
            data = data.replace('<head>', `<head>\n    <script>window.lanIps = ${ipListJson};</script>`);
        }

        res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
        res.end(data);
    });
});

server.listen(8080, '0.0.0.0', () => {
    console.log('==================================');
    console.log('  霍兰德测评服务器已启动');
    console.log('==================================');
    console.log('');
    console.log('本机访问: http://localhost:8080');
    lanIps.forEach(item => {
        console.log(`${item.name}: http://${item.ip}:8080`);
    });
    console.log('');
    console.log('请确保手机和电脑连接同一个WiFi');
    console.log('==================================');
});
