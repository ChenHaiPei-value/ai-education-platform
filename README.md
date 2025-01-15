# AI教育平等平台

## 项目简介
本项目旨在通过AI技术推动教育平等，提供专业的智能机器人和具身AI解决方案。未来将转型为非营利性基金会，100%由基金会控制。

## 主要功能
- 提供Android和iOS APP下载
- 展示项目使命和愿景
- 微信公众号关注和联系方式
- 响应式网页设计

## 技术栈
- HTML5
- CSS3
- JavaScript
- Vercel部署

## Windows 部署指南

### 准备工作
1. 安装Node.js（包含npm）：
   - 访问 https://nodejs.org/ 下载最新LTS版本
   - 运行安装程序，确保勾选以下选项：
     * [x] Node.js runtime
     * [x] npm package manager
     * [x] Add to PATH
   - 安装完成后，重启电脑
   - 验证安装：
     ```cmd
     node -v
     npm -v
     ```
     应该显示版本号，如：
     v18.12.1
     8.19.2

2. 安装Git：
   - 访问 https://git-scm.com/ 下载最新版本
   - 运行安装程序，保持默认设置

### 部署步骤
1. 打开命令提示符（cmd）或Windows Terminal
2. 安装Vercel CLI：
   ```cmd
   npm install -g vercel
   ```
   如果安装失败，请尝试以下方法：
   - 以管理员身份运行命令提示符
   - 清除npm缓存：
     ```cmd
     npm cache clean --force
     ```
   - 设置npm代理：
     ```cmd
     npm config set registry https://registry.npmjs.org/
     ```
   - 如果提示权限问题，请修改npm全局安装目录权限：
     ```cmd
     npm config set prefix "C:\Program Files\nodejs\node_global"
     npm config set cache "C:\Program Files\nodejs\node_cache"
     ```
     然后添加环境变量：
     1. 右键点击"此电脑" -> 属性 -> 高级系统设置
     2. 环境变量 -> 系统变量 -> Path -> 编辑
     3. 添加新路径：C:\Program Files\nodejs\node_global
3. 登录Vercel：
   ```cmd
   vercel login
   ```
4. 进入项目目录：
   ```cmd
   cd path\to\ai-education-platform
   ```
5. 部署项目：
   ```cmd
   vercel
   ```
6. 生产环境部署：
   ```cmd
   vercel --prod
   ```

### 注意事项
- 确保Windows Defender防火墙允许Node.js和Vercel CLI的网络访问
- 如果遇到权限问题，请以管理员身份运行命令提示符
- 部署过程中可能需要输入Vercel账户信息

## 维护说明
- 定期更新APP下载链接
- 维护微信公众号二维码
- 更新项目进展和新闻
