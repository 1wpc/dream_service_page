# Dream App 账号删除页面

这是一个为Dream App创建的账号删除网页，用于响应Google Play商店的上架政策要求，为用户提供删除账号的功能。

## 功能特性

✅ **用户登录** - 支持用户名/邮箱 + 密码登录  
✅ **账号信息展示** - 显示用户的基本信息和积分余额  
✅ **双重验证** - 支持邮箱验证码和短信验证码两种验证方式  
✅ **安全确认** - 多步骤确认流程，防止误操作  
✅ **响应式设计** - 适配桌面和移动设备  
✅ **现代化UI** - 美观的渐变设计和流畅的交互动画  

## 文件结构

```
dream_service_page/
├── index.html          # 主页面文件
├── app.js             # JavaScript逻辑文件
├── server.py          # 测试服务器（可选）
└── README.md          # 说明文档
```

## 快速开始

### 方法1: 使用Python测试服务器

1. 确保已安装Python 3.6+
2. 在项目目录下运行:
   ```bash
   python server.py
   ```
3. 浏览器会自动打开 `http://localhost:8000`

### 方法2: 直接部署到Web服务器

1. 将 `index.html` 和 `app.js` 上传到您的Web服务器
2. 在浏览器中访问对应的URL

## 配置说明

### API配置

在 `app.js` 文件中修改以下配置:

```javascript
// 修改为您的实际API域名
const API_BASE_URL = 'https://your-api-domain.com';
```

### API接口要求

本页面需要以下API接口支持:

1. **用户登录**: `POST /api/v1/users/login`
2. **获取用户信息**: `GET /api/v1/users/me`
3. **发送邮箱验证码**: `POST /api/v1/users/send-verification-code`
4. **发送短信验证码**: `POST /api/v1/users/send-sms-verification-code`
5. **验证邮箱验证码**: `POST /api/v1/users/verify-email-code`
6. **验证短信验证码**: `POST /api/v1/users/verify-sms-code`
7. **删除用户**: `DELETE /api/v1/users/{user_id}`

### CORS配置

确保您的API服务器支持CORS跨域请求，需要设置以下响应头:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 使用流程

1. **用户登录** - 输入用户名/邮箱和密码
2. **确认删除** - 查看账号信息，确认是否删除
3. **选择验证方式** - 选择邮箱验证或短信验证
4. **输入验证码** - 输入收到的6位验证码
5. **完成删除** - 账号删除成功

## 安全特性

- 🔐 **JWT Token认证** - 使用Bearer Token进行API认证
- 📧 **双重验证** - 邮箱或短信验证码确认
- ⚠️ **多重确认** - 多步骤确认流程防止误操作
- 🕐 **验证码倒计时** - 60秒倒计时防止频繁发送
- 🚫 **输入验证** - 前端表单验证和后端API验证

## 自定义样式

页面使用了现代化的CSS设计，您可以根据需要修改 `index.html` 中的样式:

- 主色调: `#667eea` (蓝紫色)
- 危险操作: `#ff6b6b` (红色)
- 背景渐变: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ 移动端浏览器

## 注意事项

1. **生产环境部署**:
   - 使用HTTPS协议
   - 配置适当的CSP策略
   - 启用GZIP压缩

2. **API安全**:
   - 确保API接口有适当的权限验证
   - 验证码应有过期时间限制
   - 删除操作应记录日志

3. **用户体验**:
   - 提供清晰的错误提示
   - 确保验证码能正常发送和接收
   - 考虑添加多语言支持

## 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **API**: RESTful API (基于Dream Backend)
- **认证**: JWT Bearer Token
- **验证**: 邮箱/短信验证码

## 许可证

本项目仅用于Dream App的账号删除功能，请根据您的项目需求进行适当的修改和使用。

## 支持

如有问题或建议，请联系开发团队。