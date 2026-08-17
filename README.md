# dsh-tool-imagegen

**DeepSeek Harness Desktop 对话内联生图插件** — 模型在对话中自动调用 `generate_image` 工具，图片直接内联显示在对话框里，无需外部面板、无需手动切换。

对接任意 OpenAI 兼容的 `/images/generations` 接口（默认 `gpt-image-2`），当前模型是纯文本输入也能正常使用。

![plugin type](https://img.shields.io/badge/plugin-host%20%2B%20client-blue) ![model](https://img.shields.io/badge/text--only%20%2F%20image--capable%20%2F%20both-green)

<img width="1920" height="1017" alt="image" src="https://github.com/user-attachments/assets/e5b19ba2-04b7-4b07-90e0-418475920856" />

<img width="1920" height="1017" alt="image" src="https://github.com/user-attachments/assets/0db997cc-378a-43c7-8a75-5956fdb1971f" />


## 特性

- **纯对话触发** — 模型听到「帮我画 / 生图 / 生成插画」等请求时自动调用 `generate_image`，参数（prompt / size / n）由模型自己组织
- **对话内联显示** — 生成的图片以卡片形式直接出现在对话流中，带 **下载按钮**；不是外部面板，不弹新窗口
- **双模型兼容** — 通过自定义 `generated-image` 内容块展示图片，**模型侧永远看不到图片块**（`contentHasImage` 只匹配 `image` 块）：
  - 纯文本输入模型：不会触发 `UNSUPPORTED_CONTENT`，生成后可以继续正常对话
  - 图像输入模型：同样正常工作，无需任何配置
- **设置页可配置** — 设置 → 插件 → 可配置 中的「生图插件」卡片：接口地址、API 密钥、模型名、默认尺寸、默认张数、启用开关
- **零配置迁移** — 复用旧插件 `@dickpy/dsh-imagegen` 的 `dsh-imagegen` 设置命名空间，已存在的 `apiUrl` / `apiKey` 自动继承
- **安全设计** —
  - API 密钥只在宿主侧保存（settings.yaml），绝不进入浏览器，设置页不回显
  - 设置桥与附件桥均为 **loopback 围栏**，仅本机浏览器可访问
  - 附件桥按「会话事件里是否存在引用该附件的 `generated-image` 块」授权，与平台自身的附件授权模型一致

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
                   附件桥做会话引用检查后返回图片字节 → 内联显示 + 下载按钮
```

三个关键设计：

1. **`generated-image` 块**（而非平台惯用的 `image` 块）
   模型层的图片检测 `contentHasImage` 只匹配 `type: 'image'`，`generated-image` 块对模型完全不可见 —— 这是 text-only 模型能安全使用的根本原因。

2. **插件自带 loopback 附件桥**
   平台的附件授权（`referencedImage`）只扫描会话事件里的 `image` 块，而本插件出于上面第 1 点**故意不写 `image` 块**，所以图片字节由插件自己的桥提供：
   `GET /api/dsh-tool-imagegen/attachment?session=<会话>&id=<附件ID>`
   桥会重新扫描该会话的事件，确认存在引用此附件的 `generated-image` 块才返回字节 —— 与平台授权同一套信任模型，只是换成了本插件的块类型。

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

## 仓库结构

```
dsh-tool-imagegen/
├── lib/                    # 宿主侧（Node ESM）
│   ├── index.js            # 插件入口：设置段、工具注册、附件桥挂载
│   ├── engine.js           # 上游 /images/generations 调用
│   ├── routes.js           # 设置桥 + 附件桥路由（loopback 围栏）
│   └── protocol.js         # 与客户端共享的路径/命名空间常量
├── src/client/             # 客户端（浏览器侧，rolldown 打包）
│   ├── index.ts            # 入口：设置卡片 + toolview 注册
│   ├── GenerateImageView.tsx    # 内联图片卡片（含下载按钮）
│   ├── SettingsCard.tsx    # 设置页卡片
│   └── locales.ts          # zh / en 文案
├── build-client.mjs        # 客户端构建脚本
├── smoke-client.mjs        # 客户端冒烟测试
└── cordis.patch.yml        # profile bundle 注册补丁
```

## 开发

```bash
# 宿主侧改动直接生效（重启 DSH）
# 客户端改动需要重建：
node build-client.mjs && node smoke-client.mjs
```

## 兼容性

- 插件工作目录：`C:\Users\CJX\.dsh\plugins\dsh-tool-imagegen`
- 平台包路径：DSH Desktop `resources/app.asar.unpacked/node_modules/@deepseek-ai/`
- 不依赖旧插件 `@dickpy/dsh-imagegen`（已彻底移除）
