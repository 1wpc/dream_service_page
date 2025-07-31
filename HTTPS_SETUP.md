# HTTPS 配置指南

本指南将帮助您为 Dream App 账号删除页面配置 HTTPS 支持。

## 方法一：使用自签名证书（开发测试）

### 1. 生成自签名证书

在项目目录下运行以下命令：

```bash
# 生成私钥
openssl genrsa -out key.pem 2048

# 生成自签名证书（有效期365天）
openssl req -new -x509 -key key.pem -out cert.pem -days 365
```

在生成证书时，系统会要求您填写一些信息：
- Country Name: CN
- State: 您的省份
- City: 您的城市
- Organization: 您的组织名称
- Organizational Unit: 部门名称
- Common Name: **重要！** 填写您的域名或IP地址
- Email: 您的邮箱

### 2. 启用HTTPS

编辑 `server.py` 文件，将以下行：
```python
USE_HTTPS = False  # 设置为True启用HTTPS
```

改为：
```python
USE_HTTPS = True  # 设置为True启用HTTPS
```

### 3. 启动服务器

```bash
python server.py
```

现在您可以通过 `https://localhost:9990` 访问页面。

**注意：** 浏览器会显示安全警告，因为这是自签名证书。点击"高级"→"继续访问"即可。

## 方法二：使用有效的SSL证书（生产环境）

### 1. 获取SSL证书

您可以通过以下方式获取有效的SSL证书：
- **免费证书：** Let's Encrypt、ZeroSSL
- **付费证书：** DigiCert、Comodo、GeoTrust等
- **云服务商：** 阿里云、腾讯云、AWS等

### 2. 证书文件格式

确保您的证书文件格式正确：
- `cert.pem`: 包含证书链的PEM格式文件
- `key.pem`: 私钥的PEM格式文件

### 3. 部署证书

将证书文件放置在项目根目录下：
```
dream_service_page/
├── cert.pem
├── key.pem
├── server.py
├── index.html
└── app.js
```

## 方法三：使用反向代理（推荐生产环境）

对于生产环境，建议使用专业的Web服务器作为反向代理：

### Nginx 配置示例

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:9990;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Apache 配置示例

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    ProxyPass / http://localhost:9990/
    ProxyPassReverse / http://localhost:9990/
    ProxyPreserveHost On
</VirtualHost>
```

## 故障排除

### 常见问题

1. **证书文件不存在**
   - 确保 `cert.pem` 和 `key.pem` 文件在项目根目录
   - 检查文件权限

2. **浏览器显示"不安全"**
   - 自签名证书会显示此警告，这是正常的
   - 生产环境请使用有效的SSL证书

3. **无法启动HTTPS服务器**
   - 检查端口是否被占用
   - 确保证书文件格式正确
   - 查看控制台错误信息

4. **Mixed Content 错误**
   - 确保页面中所有资源都使用HTTPS
   - 检查 `app.js` 中的 `API_BASE_URL` 是否使用HTTPS

### 验证HTTPS配置

使用以下命令验证证书：
```bash
# 检查证书信息
openssl x509 -in cert.pem -text -noout

# 验证私钥和证书匹配
openssl x509 -noout -modulus -in cert.pem | openssl md5
openssl rsa -noout -modulus -in key.pem | openssl md5
```

两个命令的输出应该相同。

## 安全建议

1. **保护私钥文件**
   ```bash
   chmod 600 key.pem
   ```

2. **定期更新证书**
   - 监控证书过期时间
   - 设置自动续期（如使用Let's Encrypt）

3. **使用强加密**
   - 使用至少2048位RSA密钥
   - 配置安全的SSL/TLS设置

4. **HSTS配置**
   - 在生产环境中启用HTTP严格传输安全

---

如有问题，请检查服务器日志或联系技术支持。