#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的HTTP服务器，用于测试Dream App账号删除页面
"""

import http.server
import socketserver
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
    PORT = 8000
    HOST = 'localhost'
    
    # 创建服务器
    with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
        server_url = f"http://{HOST}:{PORT}"
        
        print("="*60)
        print("🌙 Dream App 账号删除页面服务器")
        print("="*60)
        print(f"服务器地址: {server_url}")
        print(f"服务器端口: {PORT}")
        print(f"工作目录: {script_dir}")
        print("="*60)
        print("\n📝 使用说明:")
        print("1. 请在 app.js 中修改 API_BASE_URL 为您的实际API地址")
        print("2. 确保您的API服务器支持CORS跨域请求")
        print("3. 在浏览器中访问上述地址开始测试")
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