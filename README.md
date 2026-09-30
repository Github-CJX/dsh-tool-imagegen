# dsh-tool-imagegen

**DeepSeek Harness Desktop 对话内联生图插件** — 模型在对话中自动调用 `generate_image` 工具，图片直接内联显示在对话框里，无需外部面板、无需手动切换。

对接任意 OpenAI 兼容的 `/images/generations` 接口（默认 `gpt-image-2`），当前模型是纯文本输入也能正常使用（含上传参考图 + 图生图）。

> **图生图说明**：带参考图的「图生图」请求走标准 OpenAI 兼容 **`/images/edits`**（multipart form-data），文生图走 `/images/generations`（JSON）。对接网关时需确认上游**两个接口都支持**——只实现 `generations` 的上游可以用文生图，但图生图会失败。

> ### ⚠️ 只支持官方 DSH
>
> 本插件**只支持官方 DSH**，即 **DeepSeek Harness Desktop 的官方发行版**。
>
> 它直接依赖官方发行版内部的插件实现细节：`.volatile()` 配置表单契约与 `configForms` 服务、`slots` 座位表（含 `conversation.chat.turnTail` 这类轮次级座位）、客户端模块加载器（`window.__ModuleLoader__`、`react` / `react-dom` 由宿主提供）、`uiConversation` 的回合定义注册表，以及会话事件的 `image` 块与附件授权口径。这些**都不是公开稳定 API**，官方随时可能在版本之间改动。
>
> 因此：**不保证**兼容任何第三方分支、魔改版、旧版本，或其它 harness 实现；在这些环境里出现的加载失败、白屏、座位不渲染、`UNSUPPORTED_CONTENT` 一类问题，都不在本插件的支持范围内。请使用官方发行版，并保持其为官方更新通道上的版本。

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
- **适配器安全的内容块** — 生图结果只使用平台自己的 `image` 块（外加文本信封），**不再引入任何插件私有块类型**：
  - 平台的消息适配器**不会跳过**未知块类型：DeepSeek Messages 适配器遇到不认识的块会直接让整个回合失败（`UNSUPPORTED_CONTENT: cannot represent user/tool-result content …`）。旧版用私有 `generated-image` 块渲染结果，正是「生成成功但回合报错」的根因
  - `image` 块对纯文本模型是安全的：平台在派发前把每个 `image` 块替换成一段占位文本（`[image omitted because this model accepts text only; …]`）
  - 因此纯文本输入模型与图像输入模型共用同一条链路，无需任何配置
- **图片出现在最终回复里，而不是工具调用记录里** — 图片在两处渲染，各司其职：
  - 回合进行中：`generate_image` 卡片内直接显示（此时工具组还在正文流里）
  - 回合结束后：同一批图片由轮次级卡片渲染在**该回合收尾正文的下方、可折叠工具组的之外**（`conversation.chat.turnTail`），所以生成的图读起来是答案的一部分，而不是工具调用的细节。默认「紧凑」会话视图会把已结束回合的工具调用折叠进过程组，只有轮次级卡片能在折叠状态下依然可见
  - 该卡片有两个数据来源：优先用客户端侧的 Turn Definition 折叠（零请求）；当它对本回合没有数据时（Definition 只看得见「注册之后」匹配到的事件，也可能有回合不在已加载窗口内）回退到宿主自己的 `GET /api/dsh-tool-imagegen/images?session=…`，由宿主从该会话**完整**日志里投影出「哪一回合的哪次调用产出了哪些图」
- **上传参考图（用对话自带的附件按钮）** — 直接用输入框的**原生附件上传**（回形针）：图片作为平台原生 `image` 块进入会话，多模态模型可直接看图。插件**不再提供自己的上传按钮**（旧版为纯文本模型另做了一套「待发送暂存」通道，现已移除，避免输入框出现两个上传入口）。上传后让模型「基于这张图改…」即可，模型也可以直接用 `generate_image(image=<附件 id 或工作目录路径>)`。
- **一键修改 / 连续修改** — 任何一张生成图都能点「修改」直接变成待发送参考图，输入需求发送后生成新图；对新图再点「修改」即可无限连续改。对两类模型同一机制
- **模型直接图生图（无需手动上传）** — 每次生成的图片会自动在工作目录保存一份，信封把「参考图路径」告知模型；用户说「把这张图改成…」时模型直接用该路径调用 `generate_image(image=路径)`，无需点「修改」重新上传。路径仅用于工具参数，模型被明确禁止在回复中展示
- **存储清理** — 设置卡内嵌的「生图存储」区块：显示上传文件与附件对象占用，一键清理不被任何会话引用的孤儿文件（含已删除会话的历史图片）
- **设置页可配置** — 侧栏 **插件** 页里的「对话内联生图」卡片：接口地址、API 密钥、模型名、默认尺寸（官方尺寸下拉）、默认张数，以及 6 个可选参数（画质/格式/背景/风格/审核/水印），每项 = **勾选框 + 可输入下拉**：勾选才使用，未勾选不发送上游、模型也不可见（默认全不勾）。参数优先级：模型显式传参 > 设置页默认 > 留空用上游默认
- **走官方配置契约** — 设置不再由插件自建 HTTP 桥承载：`Config` schema 里带 `.volatile()` 的字段就是 GUI 表单，读写、版本栅栏、冲突检测、密钥脱敏全部由平台的 `configForms` 服务负责。保存后宿主靠 `loader/volatile-update` 重建系统提示与工具 schema，**无需重启**
- **零配置迁移** — 插件行 id 就是旧插件用的设置命名空间 `dsh-imagegen`；旧 `settings.yaml` 里的 `dsh-imagegen:` 段由平台自带的迁移逻辑按行 id 自动折入，`apiUrl` / `apiKey` 无需手抄
- **安全设计** —
  - API 密钥是 `role('secret')` 字段，只在宿主侧保存，平台在每次响应里结构化剥掉，浏览器永远拿不到原值、设置页不回显
  - 本地打开桥、上传桥、存储桥、生图图片路由均为 **loopback 围栏**，仅本机浏览器可访问；配置走平台设置服务，非本机页面自动降级为只读且不出现卡片
  - 生图图片路由按「该会话自己的 `tool/result` 事件里是否存在引用这些图片的 `image` 块」授权，与平台自身的附件授权模型一致；本地打开桥复用同一套授权

## 快速开始

在 DSH Desktop 里，侧栏 **插件** → **添加插件** → 填入插件目录的**绝对路径**（如 `D:\dsh-work\imagegen-repo`），安装后**完全重启** DSH，然后：

1. 侧栏 **插件** 页出现「对话内联生图」卡片 → 展开 → 填接口地址与 API 密钥 → 保存；
2. 在对话里说「生成一个猫咪的图片」。

命令行等价写法：

```bash
& $exe --expose-internals $boot plugin --profile desktop add 'D:\dsh-work\imagegen-repo'
```

本地路径装成 `link:`，DSH 直接加载该目录，所以改宿主侧代码只需重启、不必重装。

完整安装步骤见 [docs/installation.md](docs/installation.md)，问题排查见 [docs/troubleshooting.md](docs/troubleshooting.md)。

## 工作原理

```
用户: "帮我画一只戴帽子的橘猫"
  │
  ▼
模型 ──调用 generate_image──▶ 插件宿主侧 execute()
  │                              │  读取实时设置（apiUrl / apiKey / model）
  │                              │  volatile 字段经 liveValue() 解包
  │                              ▼
  │                        OpenAI 兼容 /images/generations
  │                              │  返回 b64 图片
  │                              ▼
  │                    ctx.attachments.saveImage() 存入本机附件库
  │                              │
  │                              ▼
  │              render() 产出文本信封 + 平台原生 image 块
  │              （per-call 事实另存 presentationMeta → tool/result.data.meta）
  │                              │
  ▼                              ▼
模型只看到随附的文本信封         客户端两处渲染同一批图片：
（"已生成 1 张图片…"）           ① 回合进行中 → generate_image 卡片（走平台会话授权
                                 的 loadImage，与内置 read_image 卡片同一条路）
                                 ② 回合结束后 → 轮次级卡片，位于收尾正文下方、
                                 可折叠工具组之外（走插件自己的图片路由取字节）
```

> 关于 `image` 块与纯文本模型：平台在把消息派发给模型前，会把每个 `image` 块替换为
> `[image omitted because this model accepts text only; attachment sha256:…]`。
> 所以结果里带 `image` 块不会让纯文本模型的回合失败 —— 而这正是旧版私有
> `generated-image` 块出问题的地方（适配器不会跳过未知块，直接让整回合失败）。

图生图 / 修改链路（参考图来源有两种，处理完全一致）：

```
来源 A：输入框原生附件上传 → 平台 image 块（多模态模型直接看图）
来源 B：生成图点「修改」→ 暂存为待发送参考图 → 输入需求发送
  │
  ▼
（来源 B）宿主上传桥：字节存入附件库 + 上传工作目录，向会话投递一条用户消息
  [平台 image 块 + 文字信封（含本机路径）]
  注：必须是平台自己的 image 块——私有块类型会让严格适配器拒绝整个请求，
      而且这条消息是持久的，会让之后的回合接连失败（见「已知限制」）
  │
  ▼
模型读到图片 / 信封 → 调用 generate_image 且 image=<路径 或 附件 id>
  │
  ▼
引擎走 multipart POST /images/edits（model / prompt / image 文件）
  │
  ▼
新图以平台原生 image 块内联显示 —— 对新图再点「修改」→ 无限连续改
```

三个关键设计：

1. **插件只写入平台自己的块类型**
   适配器**不会跳过**未知块类型：DeepSeek Messages 适配器遇到不认识的块会直接让整个回合失败（`UNSUPPORTED_CONTENT`）。所以生图结果 = 文本信封 + 平台 `image` 块；「修改」上传桥投递的参考图消息同样改用平台 `image` 块。纯文本模型由平台的投影逻辑替换为占位文本，图像模型直接看图，两类模型共用同一套机制。
   （`uploaded-image` 只作为**只读遗留类型**保留：早期版本写过它，旧会话里仍可能出现，客户端继续把它渲染成图片而不是原始 JSON。）

2. **图片字节的两条读取路径**
   - 回合进行中的工具卡片：走**平台会话授权加载器**（`ToolCallOwnerProps.loadImage`，与内置 `read_image` 卡片同一条路），插件自身不提供字节；
   - 回合结束后的轮次级卡片：该座位没有平台的会话授权加载器，改由插件自己的路由供字节
     `GET /api/dsh-tool-imagegen/images?session=<会话>&call=<调用>&index=<序号>`
     授权与平台同一套规则 —— 字节来自该调用的内存留存，或该会话自身 `tool/result` 事件里引用的那个附件，绝不会暴露会话未引用的对象。

3. **工具 schema 使用完整 JSON Schema 形态**
   注册时 `parameters` 必须是对象根 schema（`{ type: 'object', properties, required }`），平台会原样投影进模型请求，上游网关对缺失 `type: 'object'` 的 schema 会直接拒绝。

## 设置项

| 字段 | 默认值 | 说明 |
|---|---|---|
| 启用 | 开 | 关闭后对话中的生图请求被忽略 |
| 向模型告知能力 | 开 | 写入系统提示，模型更可能自动调用 |
| 接口地址 | `https://api.ephone.ai/v1` | OpenAI 兼容 base URL |
| API 密钥 | （继承旧配置） | `role('secret')` 字段：只存宿主侧，平台结构化脱敏，永不出现在任何响应里；留空保存＝保持不变 |
| 模型 | `gpt-image-2` | 上游模型名，可手写修改 |
| 尺寸 | `1024x1024` | 官方 gpt-image-2 尺寸下拉（`auto` = 上游默认），可手写任意合法尺寸（最大边 ≤ 3840px） |
| 张数 | `1` | 一次生成几张（1–4） |
| 画质（勾选启用） | 未勾选 | 勾选后用 `low / medium / high`，留空用上游默认 |
| 输出格式（勾选启用） | 未勾选 | 勾选后用 `png / jpeg / webp`（当前网关不兼容，勾选前请确认上游支持） |
| 背景（勾选启用） | 未勾选 | 勾选后用 `transparent / opaque / auto`（图生图也适用） |
| 风格（勾选启用） | 未勾选 | 勾选后用 `vivid / natural`（当前网关不兼容，勾选前请确认上游支持） |
| 审核档位（勾选启用） | 未勾选 | 勾选后用 `low / medium / high` |
| 水印（勾选启用） | 未勾选 | 勾选后用 `triw / none / auto`（当前网关不兼容，勾选前请确认上游支持） |

> **参数优先级**：模型调用时显式传入的参数 > 设置页填写的值 > 留空则由上游默认。6 个可选参数（画质/格式/背景/风格/审核/水印）统一为「**勾选框 + 可输入下拉**」形态：下拉框前有勾选框，**勾选 = 使用此参数**。未勾选时：设置值不可编辑、不给上游发送、工具 schema 不向模型开放（模型看不到也传不了）；勾选后：设置值生效、可手写自定义值（兼容非标准网关）、模型也能在 `generate_image` 里透传同名参数。当前网关不兼容 `output_format`（忽略声明格式）/ `style`（Unknown parameter）/ `watermark`（按布尔解析），只有换用支持它们的上游后才应勾选。

配置写入 profile 的补丁文件 `C:\Users\CJX\.dsh\profiles\desktop\cordis.patch.yml` 中 `id: dsh-imagegen` 那一行的 `config` 段（不再写 `settings.yaml`），保存后立即生效，无需重启：宿主监听 `loader/volatile-update` 重建系统提示与工具 schema。

## 常见问题与解决方案

| 现象 | 原因 | 解决 |
|---|---|---|
| 升级 DSH 后插件整个加载失败，或配置卡完全不出现 | 0.2.0-rc.2 换掉了插件配置契约（`installSettingsSection` / `settings.plugin.item` 已删除；现在靠 `Config` 的 `.volatile()` 字段 + Plugins 页的 `plugins.item` 槽 + 平台的 `configForms` 服务） | 用最新版插件（本版已适配）；细节与自改注意事项见 [troubleshooting.md 第 0 条](docs/troubleshooting.md) |
| 改了插件源码，重启后功能没变 | 装成了实体拷贝，或依赖指向的不是你在编辑的目录 | 本地路径装成 `link:` 时 DSH 直接加载源目录，重启即可；确认 `profiles/desktop/package.json` 的依赖是 `link:<你的目录>` |
| 图生图报 `Unknown parameter: 'input_image'` | 旧版引擎把参考图塞进 `/images/generations` 的 JSON body，OpenAI 兼容网关拒绝 | 升级插件到最新版（图生图已改走标准 `/images/edits` multipart） |
| 点「本地打开」报 **Windows 找不到文件** | 旧版临时文件名直接用了 `sha256:...` 附件 id，冒号被 NTFS 当作数据流分隔符 | 升级插件；新版文件名已清洗（`sha256_...`） |
| 图生图失败 / 报错提到 edits | 上游只实现了 `/images/generations`，不支持 `/images/edits` | 换支持 `/images/edits` 的网关；这是上游能力问题，插件无法绕过 |
| 上游返回 HTTP 4xx（如模型不存在） | 模型名 / 尺寸不匹配上游 | 设置页改 model / size。4xx **不会自动重试**——这是设计行为，重试无法修复参数或鉴权错误 |
| 网络抖动 / 网关 5xx 导致生成失败 | 瞬时故障 | 插件会自动重试最多 3 次（指数退避）；重试耗尽后错误信息会注明「已自动重试 3 次」 |
| 模型不自动调用 `generate_image` | 模型没意识到有这个工具 | 明说「用生图工具画…」，或检查设置页「向模型告知能力」开关 |
| 选了图片但没有上传 | 原生附件上传会立刻进入待发送区（回形针 → 缩略图）；生成图的「修改」是**待发送**设计，点了只暂存，必须输入消息一起发送 | 直接发送即可；「修改」暂存后输入需求再发送 |
| 想上传参考图但找不到生图插件的上传按钮 | 新版**有意移除**了插件自带的上传按钮（纯文本模型时代的「待发送暂存」通道），改用输入框的原生附件上传，避免两个上传入口 | 直接用输入框的附件（回形针）按钮；多模态模型可直接看图，纯文本模型请改说「把这张图改成…」并让模型用工作目录路径（生成图点「修改」也仍走插件自己的暂存通道） |
| 生图卡片显示破图（一个加载失败的小图标 + 提示词文字），没有图片 | 旧版桥读取 `session.events`；DSH 2.0.10 的会话服务把事件日志改为私有（`snapshotEvents()` / `ownEvents()`），`session.events` 是 `undefined`，桥内直接抛 `TypeError: events is not iterable`，请求 500 | 升级插件到最新版（`lib/session-events.js` 兼容两种会话 API，并加回归测试 `test-session-events.mjs`），**完全重启** DSH |
| 生成成功但回合报错 `UNSUPPORTED_CONTENT: cannot represent user/tool-result content generated-image` | 旧版把结果写成插件私有 `generated-image` 块；适配器不会跳过未知块，直接让整回合失败 | 升级插件到最新版（结果改用平台 `image` 块）；**重启 DSH** 让宿主侧新代码生效 |
| 修改已生成图时气泡里出现 `【dsh-imagegen】…` 长段说明文字 + 「附加内容块」JSON | 旧版气泡渲染器按名导入了 primitives 的 `MessageText`；DSH 2.0.10 已移除该导出 → `undefined` → React error #130 → 遮蔽项被 slot 层 abdicate，永久回退平台原生气泡 | 升级到最新版：所有 primitives 改为防御式解析 + 内联兜底（缺组件也不会崩溃），用户文本纯文本渲染；刷新页面即可 |
| 生成图收进可折叠的通用工具行（要点开才见） | 工具视图对调用块形状判断失败而崩溃，keyed 视图被剔除回退到通用卡片 | 升级到新版：工具视图兼容 `content` 与嵌套 `result.content` 两种块形态，任何形状都不会崩溃回退 |
| 生成图超过 5MB 无法点「修改」 | 平台附件上限 5MB | 换小尺寸重试（`1024x1024` 通常 <5MB）；这是平台硬限制 |
| 找不到存储清理入口 | 它不再是独立卡片 | 侧栏 **插件** → 本插件卡片 → 展开 → 底部「生图存储」区块，可见占用与「清理未引用文件」按钮 |
| 清理后历史会话里的图还在 | 被任何会话（含已关闭但持久化的会话）引用的文件**永不删除** | 设计如此：清理只删孤儿文件，正在被引用的图安全保留 |
| 清理后刚生成的图没了（重启后变破图） | 旧版的两个 bug：c7 的会话日志是**多帧 zstd 容器**，整包解压只读到第一帧（引用全漏）；且附件对象文件名是纯 sha256 而事件里带 `sha256:` 前缀，判定永远匹配不上 | 升级插件到最新版（已修复：逐帧解码 + 双拼写匹配，并加回归测试）。被误删的历史图无法找回，新版本清理只删真孤儿 |
| 升级 DSH 到 rc.7 后设置里的两张卡（生图插件 / 生图存储）消失了 | rc.7 把 `settings.plugin.item` 槽改为按设置命名空间 keyed（一个 key 一张卡），旧版用 `id` 注册被静默拒绝 | 升级插件到最新版（存储清理并入设置卡内嵌区块）。rc.7 的 `key` 形态在 **0.2.0-rc.2 又整体作废**，见上面第一行 |
| 生成图时对话里多出一张毫不相干的图片 | c7 的 markdown 渲染器开始渲染 `![...](http(s)://...)`；模型从信封得知「图片已生成」后自己写 markdown 图片引用（URL 为模型幻觉） | 升级插件到最新版（信封与系统提示已明确告知模型「图片已直接显示，请勿在回复中引用图片」） |
| 对话出现 `UNSUPPORTED_CONTENT` 报错 | 本插件永不产生 `image` 块；此报错来自平台原生图片上传或其他图像插件 | 检查是否在文本模型会话用了平台自带的上传/其他图像插件；本插件的生成/上传/修改均不会触发 |

## 仓库结构

```
dsh-tool-imagegen/
├── lib/                        # 宿主侧（Node ESM）
│   ├── index.js                # 插件入口：Config schema、工具注册、各桥挂载
│   ├── engine.js               # 上游调用：/images/generations + /images/edits（含自动重试）
│   ├── routes.js               # 生图图片路由 + 上传 / 能力 / 存储 / 本地打开 桥（loopback 围栏）
│   ├── maintenance.js          # 孤儿文件收集与清理（含 zstd 持久化会话扫描）
│   ├── session-events.js       # 会话事件读取（兼容旧 events 数组与新 snapshotEvents API）
│   ├── uploads.js              # 上传工作目录管理
│   ├── protocol.js             # 与客户端共享的路径/命名空间常量
│   └── client.js               # 预构建客户端 bundle（提交以便克隆即用）
├── src/client/                 # 客户端（浏览器侧，rolldown 打包）
│   ├── index.ts                # 入口：设置卡片 + toolview + 轮次级卡片 + sendSession 包装
│   ├── GenerateImageView.tsx   # 回合进行中的工具卡片（含图片与四个操作）+ 复用的画廊组件
│   ├── GeneratedTurnTail.tsx   # 轮次级卡片：收尾正文下方、工具组之外渲染同一批图片
│   ├── turn-definition.ts      # Turn Definition：从持久化会话事件折叠出每回合的生图结果
│   ├── UploadedImageBubble.tsx # 「修改」暂存图片的用户气泡渲染
│   ├── MaintenanceCard.tsx     # 设置卡内嵌的存储清理区块
│   ├── SettingsCard.tsx        # 设置卡片（plugins.item 槽）
│   ├── settings-scope.ts       # 把平台 configForms 适配成本卡片用的 scope
│   ├── settings-form.ts        # 暂存式表单模型（CardForm / 字段规格）
│   ├── pending-upload.ts       # 每会话「修改」暂存草稿 store
│   ├── protocol.ts             # 共享常量 + 块类型定义
│   └── locales.ts              # zh / en 文案
├── locale/                     # 插件管理页展示元数据（en/zh 标题与简介）
├── build-client.mjs            # 客户端构建脚本
├── check-profile.mjs           # 校验 profile 指向本目录 + 包满足平台的启动契约
├── smoke-client.mjs            # 客户端冒烟测试（含 Turn Definition 折叠与轮次级卡片渲染）
├── test-settings.mjs           # 设置契约 + 工具结果块类型（无插件私有块）
├── test-engine.mjs             # 引擎测试（请求形态 + 重试）
├── test-maintenance.mjs        # 存储清理测试
├── test-session-events.mjs     # 会话事件兼容 + 生图图片路由授权/字节测试
├── test-routes-open.mjs        # 本地打开桥临时文件命名测试
└── cordis.patch.yml            # profile bundle 注册补丁（行 id = dsh-imagegen = 设置命名空间）
```

## 开发

```bash
# 宿主侧改动（CI 同样会跑这几套，Node 22）
node test-settings.mjs && node test-engine.mjs && node test-maintenance.mjs \
  && node test-routes-open.mjs && node test-session-events.mjs && node test-upload.mjs

# 客户端改动：重建 + 冒烟（CI 会 diff lib/client.js，忘记重建会红）
node build-client.mjs && node smoke-client.mjs

# 确认 profile 真的指向这份工作目录、且包满足平台的两条启动契约
node check-profile.mjs

# 生效：本地路径装成 link:，DSH 直接加载源目录 —— 完全退出并重启即可，不必重装。
# （若是从 tarball / npm 装的拷贝，则要重新 add 覆盖。）
```

## 已知限制

- **插件不再写入任何私有内容块**（历史遗留会话除外）。上传桥过去把「修改」参考图写成插件私有
  `uploaded-image` 块，而平台的消息适配器不会跳过未知块类型——严格路由（DeepSeek Messages）会直接
  拒绝整个请求：`UNSUPPORTED_CONTENT: cannot represent user/tool-result content uploaded-image`。
  由于那条用户消息是持久的，凡是模型可见历史里仍包含它的回合都会同样失败。现在上传桥改用平台自己的
  `image` 块：图片能力模型直接看图，纯文本模型由平台的投影替换成占位文本，而旁边的文字信封照旧携带
  工作目录路径。`uploaded-image` 只作为「只读遗留类型」保留，用于让旧会话里的图片仍能正常渲染。
- **轮次级卡片只在回合结束后出现**：`conversation.chat.turnTail` 座位只对已完成的回合存在。
  回合进行中的图片由 `generate_image` 工具卡片显示；若回合被中断且没有收尾节点，图片仍留在工具卡片里。

## 兼容性

- 目标客户端：**官方 DSH Desktop 0.2.0-rc.2 及更新**（本插件只支持官方发行版，见页首「⚠️ 只支持官方 DSH」）。
- 插件以 `link:` 装在 `C:\Users\CJX\.dsh\profiles\desktop`，行 id `dsh-imagegen`。
- 唯一运行时依赖：`@deepseek-ai/schemastery`（`Config` schema 用；其余 `@deepseek-ai/dsh-*` 服务由宿主提供，客户端用到的都是平台 seed 模块或 cordis 服务）。
- 不依赖旧插件 `@dickpy/dsh-imagegen`（已彻底移除；行 id / 设置命名空间 `dsh-imagegen` 保留以自动继承旧配置）。

## License

[MIT](LICENSE) © 2026 CJX
