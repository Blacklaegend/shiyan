# 部署指南

项目英文名：**shiyan**  
仓库：<https://github.com/Blacklaegend/shiyan>  
页面：纯静态单文件 `index.html`，没有构建步骤。

已包含：

- `.github/workflows/pages.yml`：GitHub Pages 自动部署
- `.nojekyll`：GitHub Pages 跳过 Jekyll
- `wrangler.toml`：Cloudflare Pages / Wrangler 配置，项目名 `shiyan`
- `_headers`：Cloudflare Pages 安全响应头与字体缓存
- `fonts/`：内置 Noto Serif SC 子集（移动端衬线字体，OFL 授权）
- `.gitignore`

> 仓库里不包含任何 API Key。Key 只保存在访问者浏览器的 `localStorage`。

---

## 一、仓库

仓库已经创建：

```text
https://github.com/Blacklaegend/shiyan
```

以后本地修改后推送到 `main`：

```powershell
git clone https://github.com/Blacklaegend/shiyan.git
cd shiyan

# 修改文件后
git add .
git commit -m "update shiyan"
git push
```

`index.html` 必须在仓库根目录。当前仓库就是这种结构。

---

## 二、部署到 GitHub Pages

1. 打开 <https://github.com/Blacklaegend/shiyan>
2. **Settings** → **Pages**
3. **Build and deployment** → **Source** 选择 **GitHub Actions**
4. 到 **Actions** 页面运行或重新运行 `Deploy static site to GitHub Pages`
5. 发布地址：

```text
https://blacklaegend.github.io/shiyan/
```

也可以不用 Actions：Pages 里选择 **Deploy from a branch**，Branch 选 `main`，目录选 `/(root)`。

> 如果之前已经用旧仓库名开过 Pages，请重新确认新地址 `.../shiyan/`。旧地址和新地址是两个不同的浏览器源，`localStorage` 数据不互通。

---

## 三、部署到 Cloudflare Pages

### 方式 A：连接 GitHub（推荐）

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择 `Blacklaegend/shiyan`
3. 构建设置：
   - Framework preset：**None**
   - Build command：留空
   - Build output directory：`/`（如果面板不接受，填 `.`）
4. 点击 **Save and Deploy**
5. 默认地址：

```text
https://shiyan.pages.dev/
```

之后每次 push 到 `main` 都会自动重新部署。

如果之前已经创建过旧名字的 Cloudflare 项目，建议新建一个名为 `shiyan` 的项目；Cloudflare Pages 项目名不等于 GitHub 仓库名，旧项目不会自动改名。

### 方式 B：Wrangler 直接上传

```powershell
npx wrangler login
npx wrangler pages project create shiyan
npx wrangler pages deploy . --project-name shiyan
```

`wrangler.toml` 里的 `name` 也已经是 `shiyan`。

`_headers` 会由 Cloudflare Pages 自动读取；GitHub Pages 会忽略它。

---

## 四、部署后检查

- 打开首页，看到随机一言和「心境 / AI 解读」按钮
- 浏览器控制台无 404、无脚本错误
- 在设置里填自己的 API 地址、模型、Key，点「测试连接」
- 点一次「AI 解读」，确认 AI 面板底部的本轮 token / 费用出现
- 打开右上角用量按钮，确认累计记录正常

## 五、访问统计（D1）

页面底部访问量来自：

```text
functions/api/visit.js
counter-schema.sql
```

GitHub Pages 和 Cloudflare Pages 都请求同一个接口：

```text
https://shiyan-9ee.pages.dev/api/visit
```

因此两个域名的访问量会合并计算。这个接口只返回累计 PV，不保存每日历史。

### 1. 创建 D1 数据库

在 Cloudflare 控制台：

1. **Storage & Databases** → **D1 SQL Database** → **Create**
2. 数据库名填 `shiyan-counter`
3. 创建后进入数据库 → **Console**，执行 `counter-schema.sql` 里的 SQL

或者用 Wrangler：

```powershell
npx wrangler d1 create shiyan-counter
npx wrangler d1 execute shiyan-counter --remote --file=./counter-schema.sql
```

### 2. 给 Pages 项目绑定 D1

1. Cloudflare Dashboard → **Workers & Pages**
2. 打开 `shiyan-9ee` 这个 Pages 项目
3. **Settings** → **Functions** → **D1 database bindings**
4. 添加：
   - Variable name：`DB`
   - D1 database：`shiyan-counter`
   - 同时给 Production 和 Preview 配置
5. 保存并重新部署一次

### 3. 验证

浏览器打开：

```text
https://shiyan-9ee.pages.dev/api/visit
```

应返回类似：

```json
{"count":1}
```

POST 会 +1，GET 只读：

```powershell
curl.exe -X POST https://shiyan-9ee.pages.dev/api/visit
```

如果页面底部一直显示 `—`，通常是 D1 变量名不是 `DB`，或 Pages 项目尚未重新部署。

> 页面里的接口地址写在 `index.html` 的 `VISIT_ENDPOINT` 常量里。如果以后 Cloudflare 项目改名或绑定自定义域名，需要同步改这个地址。

## 六、本地数据说明

GitHub Pages / Cloudflare Pages 都只是静态托管，没有服务器端数据库。页面的 API 配置、心境、句子历史、保存的对话和用量全部保存在浏览器的 `localStorage`：

- 同一台电脑、同一浏览器、同一域名下，下次打开会自动恢复。
- `github.io` 和 `pages.dev` 是不同域名，各自有一份独立数据。
- 换浏览器、换设备、无痕窗口、清空网站数据都会丢失。
- 不需要、也不应该把 API Key 写进仓库。

## 七、常见问题

### 页面能打开，但 AI 请求失败

这是浏览器直连第三方 API 的 CORS 限制，不是部署失败。换一个允许浏览器直连的接口，或自己加一层代理。GitHub Pages / Cloudflare Pages 本身不代理 API 请求。

### GitHub Pages 显示 404

确认 `index.html` 在仓库根目录，且 Pages 的 Source / 分支 / 目录设置正确。首次发布需要等 Actions 完成。

### Cloudflare 部署后没有样式

确认 Build output directory 指向包含 `index.html` 的目录（本仓库根目录为 `/` 或 `.`），并且没有把子目录当成输出目录。

### 费用和官方账单不完全一致

DeepSeek 官方价格会区分高峰/空闲、缓存命中和未命中。页面按官方公开价自动计算，法定节假日未单独识别；实际金额以 DeepSeek 平台账单为准。自定义接口需要在用量面板里填写自己的输入/输出单价。
