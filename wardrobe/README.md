# 私人智能衣橱

一个功能完整的智能衣橱管理应用，使用纯 HTML、CSS 和 JavaScript 开发，可在浏览器中直接运行。

## 功能特点

### 1. 我的衣橱
- 查看所有已添加的衣物
- 支持按类别和季节筛选
- 显示衣物照片、名称、类别、颜色、品牌等信息
- 双击衣物卡片可删除

### 2. 添加衣物
- 记录衣物详细信息（名称、类别、颜色、品牌等）
- 上传衣物照片
- 选择适用季节（春、夏、秋、冬、四季）
- 添加风格标签（休闲、正式、运动、时尚、简约、复古）

### 3. 购买记录
- 记录每次购买衣物的详细信息
- 包括购买日期、价格、购买地点、备注
- 自动关联到对应的衣物

### 4. 穿衣风格
- 设置个人穿衣风格偏好
- 选择喜欢的风格标签
- 设置颜色偏好

### 5. 今日推荐
- 根据当前天气、季节和温度推荐穿搭
- 结合个人风格偏好进行智能推荐
- 提供基础搭配和完整搭配方案

## 使用方法

1. 直接在浏览器中打开 `index.html` 文件
2. 所有数据会保存在浏览器的 localStorage 中，无需服务器
3. 开始添加你的衣物和购买记录吧！

## 技术说明

- **数据存储**: 使用浏览器 localStorage 存储数据
- **照片存储**: 照片以 Base64 格式存储在 localStorage 中
- **响应式设计**: 支持桌面和移动设备
- **纯前端**: 无需后端服务器，完全在浏览器中运行

## 注意事项

- 由于使用 localStorage 存储，数据仅保存在当前浏览器中
- 照片以 Base64 格式存储，建议照片不要太大（建议小于 1MB）
- 清除浏览器数据会删除所有保存的衣物信息

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge 等）

---

## 🚀 部署到 Vercel

Vercel 是一个免费的静态网站托管平台，非常适合部署这个项目。以下是详细的部署步骤。

### 方法一：通过 GitHub 部署（推荐）

#### 步骤 1: 注册 Vercel 账号

1. 访问 [Vercel 官网](https://vercel.com)
2. 点击右上角的 **"Sign Up"** 或 **"登录"** 按钮
3. 选择使用 **GitHub** 账号登录（推荐，因为后续可以直接连接 GitHub 仓库）
   - 如果没有 GitHub 账号，也可以使用邮箱注册
4. 授权 Vercel 访问你的 GitHub 账号（如果使用 GitHub 登录）

#### 步骤 2: 准备 GitHub 仓库

1. **创建 GitHub 账号**（如果还没有）
   - 访问 [GitHub](https://github.com) 注册账号

2. **创建新仓库**
   - 登录 GitHub，点击右上角的 **"+"** → **"New repository"**
   - 仓库名称填写：`wardrobe-app`（或任意名称）
   - 选择 **Public**（公开）或 **Private**（私有）
   - 勾选 **"Add a README file"**（可选）
   - 点击 **"Create repository"**

3. **上传项目文件到 GitHub**
   
   方法 A：使用 GitHub 网页上传
   - 进入刚创建的仓库页面
   - 点击 **"uploading an existing file"** 或 **"Add file"** → **"Upload files"**
   - 将项目文件夹 `wardrobe` 中的所有文件拖拽到上传区域：
     - `index.html`
     - `styles.css`
     - `app.js`
     - `README.md`
   - 在页面底部填写提交信息（如："Initial commit"）
   - 点击 **"Commit changes"**

   方法 B：使用 Git 命令行（如果你熟悉 Git）
   ```bash
   cd wardrobe
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/wardrobe-app.git
   git push -u origin main
   ```

#### 步骤 3: 在 Vercel 中导入项目

1. 登录 Vercel 后，进入 [Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → **"Project"**
3. 在 **"Import Git Repository"** 页面，你会看到你的 GitHub 仓库列表
4. 找到并点击你的 `wardrobe-app` 仓库旁边的 **"Import"** 按钮

#### 步骤 4: 配置项目

1. **项目设置页面**会显示：
   - **Project Name**: 可以修改项目名称（如：`my-wardrobe`）
   - **Framework Preset**: 选择 **"Other"** 或 **"Other"**（因为这是纯 HTML 项目）
   - **Root Directory**: 如果项目在子文件夹中，填写 `wardrobe`，否则留空
   - **Build Command**: 留空（纯静态项目不需要构建）
   - **Output Directory**: 留空或填写 `.`（当前目录）

2. **环境变量**：本项目不需要环境变量，可以跳过

3. 点击 **"Deploy"** 按钮

#### 步骤 5: 等待部署完成

1. Vercel 会自动开始部署
2. 部署过程通常需要 1-2 分钟
3. 部署完成后，你会看到 **"Congratulations!"** 页面

#### 步骤 6: 获取访问链接

部署成功后，你会看到：
- **生产环境链接**：`https://你的项目名.vercel.app`
  - 例如：`https://wardrobe-app.vercel.app`
- 这个链接就是你的应用访问地址，可以分享给任何人

#### 步骤 7: 自定义域名（可选）

1. 在项目 Dashboard 中，点击 **"Settings"** → **"Domains"**
2. 输入你的域名（如果有）
3. 按照提示配置 DNS 记录

---

### 方法二：直接上传部署（无需 GitHub）

如果你不想使用 GitHub，也可以直接上传文件：

#### 步骤 1: 注册 Vercel 账号

同方法一的步骤 1

#### 步骤 2: 安装 Vercel CLI

1. **安装 Node.js**（如果还没有）
   - 访问 [Node.js 官网](https://nodejs.org/) 下载并安装
   - 安装完成后，打开命令行工具验证：
     ```bash
     node --version
     npm --version
     ```

2. **安装 Vercel CLI**
   - 打开命令行工具（Windows: PowerShell 或 CMD，Mac/Linux: Terminal）
   - 运行以下命令：
     ```bash
     npm install -g vercel
     ```

#### 步骤 3: 登录 Vercel

在命令行中运行：
```bash
vercel login
```
按照提示在浏览器中完成登录

#### 步骤 4: 部署项目

1. **进入项目目录**
   ```bash
   cd wardrobe
   ```

2. **运行部署命令**
   ```bash
   vercel
   ```

3. **按照提示操作**
   - 是否要部署到当前目录？输入 `Y`
   - 是否要修改设置？通常输入 `N`
   - 等待部署完成

4. **获取链接**
   - 部署完成后，命令行会显示你的访问链接
   - 例如：`https://wardrobe-app.vercel.app`

---

### 部署后的更新

#### 如果使用 GitHub 部署：

1. **更新代码**
   - 在本地修改代码
   - 提交到 GitHub：
     ```bash
     git add .
     git commit -m "更新描述"
     git push
     ```

2. **自动部署**
   - Vercel 会自动检测到 GitHub 的更新
   - 自动触发新的部署（通常 1-2 分钟完成）
   - 你可以在 Vercel Dashboard 中查看部署状态

#### 如果使用 CLI 部署：

1. **更新代码后，重新运行**：
   ```bash
   vercel --prod
   ```

---

### 常见问题

#### Q1: 部署后摄像头功能无法使用？
**A**: 确保你的网站使用 HTTPS（Vercel 默认提供 HTTPS），摄像头功能需要安全连接。

#### Q2: 如何查看部署日志？
**A**: 在 Vercel Dashboard 中，点击项目 → **"Deployments"** → 选择某个部署 → 查看日志

#### Q3: 如何回滚到之前的版本？
**A**: 在 **"Deployments"** 页面，找到之前的部署，点击右侧的 **"..."** → **"Promote to Production"**

#### Q4: 免费版有什么限制？
**A**: Vercel 免费版包括：
- 无限带宽
- 100GB 流量/月
- 自动 HTTPS
- 全球 CDN
- 对于这个项目完全够用

#### Q5: 如何删除部署？
**A**: 在项目 Dashboard → **"Settings"** → 滚动到底部 → **"Delete Project"**

---

### 部署检查清单

部署前确保：
- [ ] 所有文件都在项目目录中（index.html, styles.css, app.js）
- [ ] 文件路径正确（CSS 和 JS 文件能正确引用）
- [ ] 在本地测试过，功能正常
- [ ] 已准备好 GitHub 账号（如果使用方法一）

---

### 技术支持

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
- [项目 Issues](https://github.com/你的用户名/wardrobe-app/issues)

---

**部署完成后，你的智能衣橱应用就可以通过互联网访问了！** 🎉


