# dsh-tool-imagegen

**DeepSeek Harness Desktop 对话内联生图插件** — 模型在对话中自动调用 `generate_image` 工具，图片直接内联显示在对话框里，无需外部面板、无需手动切换。

对接任意 OpenAI 兼容的 `/images/generations` 接口（默认 `gpt-image-2`），当前模型是纯文本输入也能正常使用（含上传参考图 + 图生图）。

> **图生图说明**：带参考图的「图生图」请求走标准 OpenAI 兼容 **`/images/edits`**（multipart form-data），文生图走 `/images/generations`（JSON）。对接网关时需确认上游**两个接口都支持**——只实现 `generations` 的上游可以用文生图，但图生图会失败。

![plugin type](https://img.shields.io/badge/plugin-host%20%2B%20client-blue) ![model](https://img.shields.io/badge/text--only%20%2F%20image--capable%20%2F%20both-green) ![license](https://img.shields.io/badge/license-MIT-blue)

<img width="1920" height="1017" alt="image" src="https://github.com/user-attachments/assets/e5b19ba2-04b7-4b07-90e0-418475920856" />

<img width="1920" height="1017" alt="image" src="https://github.com/user-attachments/assets/0db997cc-378a-43c7-8a75-5956fdb1971f" />

<img width="1920" height="1039" alt="image" src="https://github.com/user-attachments/assets/ddd551d4-0b1f-4dfb-ac68-a4cda361c129" />

<img width="1920" height="1041" alt="image" src="https://github.com/user-attachments/assets/f8f1abc3-5d47-4ca9-977d-7f39af08d9b6" />

## 特性

- **纯对话触发** — 模型听到「帮我画 / 生图 / 生成插画」等请求时自动调用 `generate_image`，参数（prompt / size / n）由模型自己组织
- **对话内联显示** — 生成的图片以卡片形式直接出现在对话流中；悬停提供 **全屏查看 / 修改 / 下载 / 本地打开** 四个操作：
  - 全屏查看：应用内大图查看（Esc / 点击背景关闭）
  - 本地打开：走系统默认图片查看器，无需先下载再找文件
  - 修改：一键把这张图作为参考图，输入需求即可连续修改（图生图）
- **网络自动重试** — 上游网络错误 / 超时 / 5xx 网关故障自动重试（指数退避，最多 3 次）；4xx 与参数错误不重试（重试无意义），重试耗尽后错误信息注明已重试次数
- **双模型兼容** — 通过自定义 `generated-image` / `uploaded-image` 内容块展示图片，**模型侧永远看不到图片块**（`contentHasImage` 只匹配 `image` 块）：
  - 纯文本输入模型：不会触发 `UNSUPPORTED_CONTENT`，生成后可以继续正常对话
  - 图像输入模型：同样正常工作，无需任何配置
- **上传参考图（纯文本模型专用通道）** — 对话框上传按钮（仅文本模型会话显示）：选择文件后**不立即提交**，先出现「已选图片」标记，等你输入消息后图文**一并发送**；模型收到信封里的图片路径，可基于它图生图
- **一键修改 / 连续修改** — 任何一张生成图都能点「修改」直接变成待发送参考图，输入需求发送后生成新图；对新图再点「修改」即可无限连续改。对两类模型同一机制
- **存储清理卡片** — 设置 → 插件 → 可配置 →「生图存储」：显示上传文件与附件对象占用，一键清理不被任何会话引用的孤儿文件（含已删除会话的历史图片）
- **设置页可配置** — 设置 → 插件 → 可配置 中的「生图插件」卡片：接口地址、API 密钥、模型名、默认尺寸、默认张数、启用开关
- **零配置迁移** — 复用旧插件 `@dickpy/dsh-imagegen` 的 `dsh-imagegen` 设置命名空间，已存在的 `apiUrl` / `apiKey` 自动继承
- **安全设计** —
  - API 密钥只在宿主侧保存（settings.yaml），绝不进入浏览器，设置页不回显
  - 设置桥、附件桥、本地打开桥、存储桥均为 **loopback 围栏**，仅本机浏览器可访问
  - 附件桥按「会话事件里是否存在引用该附件的 `generated-image` 块」授权，与平台自身的附件授权模型一致；本地打开桥复用同一套授权

## 快速开始

```bash
# 1. 把插件目录放到 DSH 插件目录
cp -r dsh-tool-imagegen C:/Users/CJX/.dsh/plugins/

# 2. 在 desktop profile 挂载（见 docs/installation.md 的完整步骤）
#    package.json 添加依赖 + bundles，然后：
cd C:/Users/CJX/.dsh/profiles/desktop
pnpm install

# 3. 重启 DSH，在对话里说「生成一个猫咪的图片」
```

完整安装步骤见 [docs/installation.md](docs/installation.md)，问题排查见 [docs/troubleshooting.md](docs/troubleshooting.md)。

## 工作原理

```
用户: "帮我画一只戴帽子的橘猫"
  │
  ▼
模型 ──调用 generate_image──▶ 插件宿主侧 execute()
  │                              │  读取设置（apiUrl / apiKey / model）
  │                              ▼
  │                        OpenAI 兼容 /images/generations
  │                              │  返回 b64 图片
  │                              ▼
  │                    ctx.attachments.saveImage() 存入本机附件库
  │                              │
  │                              ▼
  │              render() 产出 { type: 'generated-image', attachment, prompt, ... }
  │                              │
  ▼                              ▼
模型只看到随附的文本信封         客户端 keyed toolview 卡片
（"已生成 1 张图片…"）            │
                                 ▼
                   <img src="/api/dsh-tool-imagegen/attachment?session=…&id=…">
                   附件桥做会话引用检查后返回图片字节 → 内联显示
```

图生图 / 修改链路（参考图来源有两种，处理完全一致）：

```
来源 A：上传按钮选文件 → 暂存 → 输入消息一起发送
来源 B：生成图点「修改」→ 直接暂存为参考图 → 输入需求发送
  │
  ▼
宿主上传桥：字节存入附件库 + 上传工作目录，向会话投递一条用户消息
  [uploaded-image 块（模型不可见）+ 文字信封（含本机路径）]
  │
  ▼
模型读到信封 → 调用 generate_image 且 image=<路径>
  │
  ▼
引擎走 multipart POST /images/edits（model / prompt / image 文件）
  │
  ▼
新图以 generated-image 块内联显示 —— 对新图再点「修改」→ 无限连续改
```

三个关键设计：

1. **`generated-image` / `uploaded-image` 块**（而非平台惯用的 `image` 块）
   模型层的图片检测 `contentHasImage` 只匹配 `type: 'image'`，这两个自定义块对模型完全不可见 —— 这是 text-only 模型能安全使用（生成、上传、修改）的根本原因，也是两类模型共用同一套机制的原因。

2. **插件自带 loopback 附件桥**
   平台的附件授权（`referencedImage`）只扫描会话事件里的 `image` 块，而本插件出于上面第 1 点**故意不写 `image` 块**，所以图片字节由插件自己的桥提供：
   `GET /api/dsh-tool-imagegen/attachment?session=<会话>&id=<附件ID>`
   桥会重新扫描该会话的事件，确认存在引用此附件的 `generated-image` / `uploaded-image` 块才返回字节 —— 与平台授权同一套信任模型，只是换成了本插件的块类型。

3. **工具 schema 使用完整 JSON Schema 形态**
   注册时 `parameters` 必须是对象根 schema（`{ type: 'object', properties, required }`），平台会原样投影进模型请求，上游网关对缺失 `type: 'object'` 的 schema 会直接拒绝。

## 设置项

| 字段 | 默认值 | 说明 |
|---|---|---|
| 启用 | 开 | 关闭后对话中的生图请求被忽略 |
| 向模型告知能力 | 开 | 写入系统提示，模型更可能自动调用 |
| 接口地址 | `https://api.ephone.ai/v1` | OpenAI 兼容 base URL |
| API 密钥 | （继承旧配置） | 仅存本机设置文件，不回显 |
| 模型 | `gpt-image-2` | 上游模型名，可手写修改 |
| 尺寸 | `1024x1024` | 如 `1024x1792` / `1792x1024` |
| 张数 | `1` | 一次生成几张（1–4） |

设置保存在本机 `settings.yaml` 的 `dsh-imagegen:` 段，保存后立即生效，无需重启。

## 常见问题与解决方案

| 现象 | 原因 | 解决 |
|---|---|---|
| 改了插件源码，重启后功能没变 | `file:` 依赖是**实体拷贝**，DSH 从 `node_modules/@local/...` 的拷贝加载，不是源目录 | 跑 `node sync-profile.mjs`（清拷贝 → 重装 → 校验），然后**完全退出** DSH 再启动 |
| 图生图报 `Unknown parameter: 'input_image'` | 旧版引擎把参考图塞进 `/images/generations` 的 JSON body，OpenAI 兼容网关拒绝 | 升级插件到最新版（图生图已改走标准 `/images/edits` multipart） |
| 点「本地打开」报 **Windows 找不到文件** | 旧版临时文件名直接用了 `sha256:...` 附件 id，冒号被 NTFS 当作数据流分隔符 | 升级插件；新版文件名已清洗（`sha256_...`） |
| 图生图失败 / 报错提到 edits | 上游只实现了 `/images/generations`，不支持 `/images/edits` | 换支持 `/images/edits` 的网关；这是上游能力问题，插件无法绕过 |
| 上游返回 HTTP 4xx（如模型不存在） | 模型名 / 尺寸不匹配上游 | 设置页改 model / size。4xx **不会自动重试**——这是设计行为，重试无法修复参数或鉴权错误 |
| 网络抖动 / 网关 5xx 导致生成失败 | 瞬时故障 | 插件会自动重试最多 3 次（指数退避）；重试耗尽后错误信息会注明「已自动重试 3 次」 |
| 模型不自动调用 `generate_image` | 模型没意识到有这个工具 | 明说「用生图工具画…」，或检查设置页「向模型告知能力」开关 |
| 选了图片但没有上传 | 上传是**待发送**设计：选图只暂存，必须输入消息一起发送（避免空文本消息） | 输入文字后发送即可；「已选图片」标记带 ✕ 可取消 |
| 上传按钮消失了 | 当前模型支持图像输入（多模态） | 正常：多模态模型走平台原生上传；生成图的「修改」按钮两类模型都可用 |
| 生成图超过 5MB 无法点「修改」 | 平台附件上限 5MB | 换小尺寸重试（`1024x1024` 通常 <5MB）；这是平台硬限制 |
| 找不到存储清理卡片 | 卡片在设置页第二张 | 设置 → 插件 → 可配置 →「生图存储」卡片，展开可见占用与「清理未引用文件」按钮 |
| 清理后历史会话里的图还在 | 被任何会话（含已关闭但持久化的会话）引用的文件**永不删除** | 设计如此：清理只删孤儿文件，正在被引用的图安全保留 |
| 清理后刚生成的图没了（重启后变破图） | 旧版的两个 bug：c7 的会话日志是**多帧 zstd 容器**，整包解压只读到第一帧（引用全漏）；且附件对象文件名是纯 sha256 而事件里带 `sha256:` 前缀，判定永远匹配不上 | 升级插件到最新版（已修复：逐帧解码 + 双拼写匹配，并加回归测试）。被误删的历史图无法找回，新版本清理只删真孤儿 |
| 升级 DSH 到 rc.7 后设置里的两张卡（生图插件 / 生图存储）消失了 | rc.7 把 `settings.plugin.item` 槽改为**按设置命名空间 keyed**（一个 key 一张卡），旧版用 `id` 注册被静默拒绝 | 升级插件到最新版（注册改为 `key: dsh-imagegen`，存储清理并入设置卡内嵌区块） |
| 生成图时对话里多出一张毫不相干的图片 | c7 的 markdown 渲染器开始渲染 `![...](http(s)://...)`；模型从信封得知「图片已生成」后自己写 markdown 图片引用（URL 为模型幻觉） | 升级插件到最新版（信封与系统提示已明确告知模型「图片已直接显示，请勿在回复中引用图片」） |
| 对话出现 `UNSUPPORTED_CONTENT` 报错 | 本插件永不产生 `image` 块；此报错来自平台原生图片上传或其他图像插件 | 检查是否在文本模型会话用了平台自带的上传/其他图像插件；本插件的生成/上传/修改均不会触发 |
| 设置卡片提示「当前环境不提供该设置」 | 浏览器不是通过本机回环地址访问 | 设置桥仅限 loopback；远程访问 DSH 时设置只读，密钥永远不出本机 |

## 仓库结构

```
dsh-tool-imagegen/
├── lib/                        # 宿主侧（Node ESM）
│   ├── index.js                # 插件入口：设置段、工具注册、各桥挂载
│   ├── engine.js               # 上游调用：/images/generations + /images/edits（含自动重试）
│   ├── routes.js               # 设置 / 附件 / 上传 / 能力 / 存储 / 本地打开 桥（loopback 围栏）
│   ├── maintenance.js          # 孤儿文件收集与清理（含 zstd 持久化会话扫描）
│   ├── uploads.js              # 上传工作目录管理
│   ├── protocol.js             # 与客户端共享的路径/命名空间常量
│   └── client.js               # 预构建客户端 bundle（提交以便克隆即用）
├── src/client/                 # 客户端（浏览器侧，rolldown 打包）
│   ├── index.ts                # 入口：设置卡片 + toolview + 上传按钮 + sendSession 包装
│   ├── GenerateImageView.tsx   # 内联图片卡片（全屏查看 / 修改 / 下载 / 本地打开）
│   ├── UploadButton.tsx        # 上传按钮 + 已选 chip（待发送）
│   ├── UploadedImageBubble.tsx # 上传图片的用户气泡渲染
│   ├── MaintenanceCard.tsx     # 存储清理卡片
│   ├── SettingsCard.tsx        # 设置页卡片
│   ├── pending-upload.ts       # 每会话待发送草稿 store
│   ├── protocol.ts             # 共享常量 + 块类型定义
│   └── locales.ts              # zh / en 文案
├── build-client.mjs            # 客户端构建脚本
├── sync-profile.mjs            # 同步插件到 profile（清拷贝 + 重装 + 校验）
├── smoke-client.mjs            # 客户端冒烟测试
├── test-engine.mjs             # 引擎测试（请求形态 + 重试）
├── test-maintenance.mjs        # 存储清理测试
├── test-routes-open.mjs        # 本地打开桥临时文件命名测试
└── cordis.patch.yml            # profile bundle 注册补丁
```

## 开发

```bash
# 宿主侧改动：直接跑测试 + 重启 DSH
node test-engine.mjs && node test-maintenance.mjs && node test-routes-open.mjs

# 客户端改动：重建 + 冒烟
node build-client.mjs && node smoke-client.mjs

# 改动生效：同步到 profile 拷贝（file: 依赖是实体拷贝，必须同步）
node sync-profile.mjs
# 然后完全退出并重启 DSH
```

## 兼容性

- 插件工作目录：`C:\Users\CJX\.dsh\plugins\dsh-tool-imagegen`
- 平台包路径：DSH Desktop `resources/app.asar.unpacked/node_modules/@deepseek-ai/`
- 不依赖旧插件 `@dickpy/dsh-imagegen`（已彻底移除；配置命名空间 `dsh-imagegen` 保留以自动继承旧配置）

## License

[MIT](LICENSE) © 2026 CJX
