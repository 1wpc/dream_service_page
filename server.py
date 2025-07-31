#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的HTTP/HTTPS服务器，用于测试Dream App账号删除页面
"""

import http.server
import socketserver
import ssl
import os
import webbrowser
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头部，允许跨域请求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # 自定义日志格式
        print(f"[{self.address_string()}] {format % args}")

def main():
    # 设置工作目录为当前脚本所在目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # 服务器配置
    PORT = 9990
    HOST = '0.0.0.0'
    
    # HTTPS配置 - 如果需要启用HTTPS，请设置以下路径
    USE_HTTPS = True  # 设置为True启用HTTPS
    CERT_FILE = '/root/cert.pem'  # SSL证书文件路径
    KEY_FILE = '/root/privkey.pem'   # SSL私钥文件路径
    
    # 创建服务器
    httpd = socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler)
    
    # 检查是否启用HTTPS且证书文件存在
    if USE_HTTPS and os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        # 配置SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(CERT_FILE, KEY_FILE)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        server_url = f"https://{HOST}:{PORT}"
        protocol = "HTTPS"
    else:
        server_url = f"http://{HOST}:{PORT}"
        protocol = "HTTP"
    
    with httpd:
        
        print("="*60)
        print(f"🌙 Dream App 账号删除页面服务器 ({protocol})")
        print("="*60)
        print(f"服务器地址: {server_url}")
        print(f"服务器端口: {PORT}")
        print(f"协议类型: {protocol}")
        print(f"工作目录: {script_dir}")
        print("="*60)
        print("\n📝 使用说明:")
        print("1. 请在 app.js 中修改 API_BASE_URL 为您的实际API地址")
        print("2. 确保您的API服务器支持CORS跨域请求")
        print("3. 在浏览器中访问上述地址开始测试")
        if not USE_HTTPS:
            print("\n🔒 HTTPS配置:")
            print("- 要启用HTTPS，请将 USE_HTTPS 设置为 True")
            print("- 并确保 cert.pem 和 key.pem 文件存在于当前目录")
        print("\n⚠️  注意事项:")
        print("- 这是一个测试服务器，仅用于开发和测试")
        print("- 生产环境请使用专业的Web服务器")
        print("- 按 Ctrl+C 停止服务器")
        print("="*60)
        
        try:
            # 自动打开浏览器
            print("\n🚀 正在启动浏览器...")
            webbrowser.open(server_url)
        except Exception as e:
            print(f"\n⚠️  无法自动打开浏览器: {e}")
            print(f"请手动在浏览器中访问: {server_url}")
        
        print("\n✅ 服务器已启动，等待连接...\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 服务器已停止")
            print("感谢使用 Dream App 账号删除服务！")

if __name__ == "__main__":
    main()