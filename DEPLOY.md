# 部署指南

这是一个纯静态页面，没有构建步骤。把本目录（`yiyan`）里的全部文件作为一个仓库的根目录即可。

已包含：

- `.github/workflows/pages.yml`：GitHub Pages 自动部署
- `.nojekyll`：GitHub Pages 跳过 Jekyll
- `wrangler.toml`：Cloudflare Pages / Wrangler 配置
- `_headers`：Cloudflare Pages 安全响应头
- `.gitignore`

> 不要把 API Key 写进文件。页面的 Key 存在访问者自己的浏览器 `localStorage` 里。

---

## 一、先推到 GitHub

在 `yiyan` 目录执行（把地址换成你自己的空仓库）：

```powershell
git init
git add .
git commit -m "feat: shiyan quote page"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

也可以使用 GitHub CLI：

```powershell
gh repo create shiyan --public --source=. --remote=origin --push
```

---

## 二、部署到 GitHub Pages

### 方式 A：GitHub Actions（推荐，仓库已带 workflow）

1. 打开 GitHub 仓库 → **Settings** → **Pages**
2. **Build and deployment** → **Source** 选择 **GitHub Actions**
3. 推送 `main` 后，Actions 会自动运行 `Deploy static site to GitHub Pages`
4. 在 Actions 或 Pages 设置里看到地址，通常是：

```text
https://<用户名>.github.io/<仓库名>/
```

### 方式 B：直接从分支发布

如果不想用 Actions：

1. **Settings** → **Pages** → **Source** 选择 **Deploy from a branch**
2. Branch 选 `main`，目录选 `/(root)`
3. 保存后等待发布

> `index.html` 必须在仓库根目录。如果你把整个 `yiyan` 文件夹放进了仓库，而不是把文件夹里的内容作为根目录，请把 workflow 的 `path: .` 改成 `path: yiyan`，或在 Pages 里选择 `/yiyan`。

---

## 三、部署到 Cloudflare Pages

### 方式 A：连接 GitHub 自动部署（推荐）

1. 先把仓库推到 GitHub（上面的步骤）
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择刚创建的仓库
4. 构建设置：
   - Framework preset：**None**
   - Build command：留空
   - Build output directory：`/`（如果面板不接受，填 `.`）
5. 点击 **Save and Deploy**
6. 发布地址通常是：

```text
https://<项目名>.pages.dev/
```

之后每次 push 到 `main` 都会自动重新部署。

### 方式 B：Wrangler 直接上传

适合不想在 Cloudflare 面板里点选、或想从本地直接发布：

```powershell
npx wrangler login
npx wrangler pages project create shiyan
npx wrangler pages deploy . --project-name shiyan
```

如果项目名 `shiyan` 已被占用，换一个名字，并同步修改 `wrangler.toml` 里的 `name`。

`_headers` 会由 Cloudflare Pages 自动读取；GitHub Pages 会忽略它。

---

## 四、部署后检查

- 打开首页，看到随机一言和「心境 / AI 解读」按钮
- 浏览器控制台无 404、无脚本错误
- 在设置里填自己的 API 地址、模型、Key，点「测试连接」
- 点一次「AI 解读」，确认 AI 面板底部的本轮 token / 费用出现
- 打开右上角用量按钮，确认累计记录正常

## 五、本地数据说明

GitHub Pages / Cloudflare Pages 都只是静态托管，没有服务器端数据库。页面的 API 配置、心境、句子历史、保存的对话和用量全部保存在浏览器的 `localStorage`：

- 同一台电脑、同一浏览器、同一域名下，下次打开会自动恢复。
- `github.io` 和 `pages.dev` 是不同域名，各自有一份独立数据。
- 换浏览器、换设备、无痕窗口、清空网站数据都会丢失。
- 不需要、也不应该把 API Key 写进仓库。

## 六、常见问题

### 页面能打开，但 AI 请求失败

这是浏览器直连第三方 API 的 CORS 限制，不是部署失败。换一个允许浏览器直连的接口，或自己加一层代理。GitHub Pages / Cloudflare Pages 本身不代理 API 请求。

### GitHub Pages 显示 404

确认 `index.html` 在仓库根目录，且 Pages 的 Source / 分支 / 目录设置正确。首次发布需要等 Actions 完成。

### Cloudflare 部署后没有样式

确认 Build output directory 指向包含 `index.html` 的目录（本仓库根目录为 `/` 或 `.`），并且没有把 `yiyan` 子目录当成输出目录。

### 费用和官方账单不完全一致

DeepSeek 官方价格会区分高峰/空闲、缓存命中和未命中。页面按官方公开价自动计算，法定节假日未单独识别；实际金额以 DeepSeek 平台账单为准。自定义接口需要在用量面板里填写自己的输入/输出单价。
