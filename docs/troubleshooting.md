# 常见问题与解决方案

按症状排查。每条都给出**原因**和**解决**，标注了对应的已修复版本状态。

## 0. 升级 DSH 后插件整个加载失败，或设置卡消失

- **症状**（0.2.0-rc.2 起）：
  - 启动日志里 `dsh-imagegen` 那一行是 `failed`，错误形如 `The requested module '@deepseek-ai/dsh-settings' does not provide an export named 'installSettingsSection'`；
  - 或者插件加载正常，但**任何地方都找不到配置卡**（旧版在「设置 → 插件 → 可配置」，新版在侧栏「插件」页）。
- **原因**：0.2.0-rc.2 换掉了整套插件配置契约，旧写法全部失效：

  | 旧 API | 0.2.0-rc.2 |
  |---|---|
  | `@deepseek-ai/dsh-settings` 的 `installSettingsSection` / `settingsNamespace` | 已删除（导入它会直接抛错，插件整体加载失败） |
  | 槽 `settings.plugin.item`（按设置命名空间 keyed） | 已删除，换成 Plugins 页的列表槽 `plugins.item` |
  | 任意字符串当设置命名空间 | 命名空间**只能是**插件在 profile 里的**行 id**（`cordis.patch.yml` 的 `id:`） |
  | schema 字段自动可编辑 | **只有带 `.volatile()` 的字段**会进表单；一个 volatile 字段都没有时整条 entry 被丢弃，卡片完全不出现 |
  | 浏览器侧自带 HTTP 设置桥 | 平台自己的 `configForms` 服务（`ctx.configForms.get(行id)`）负责读写、版本栅栏、冲突检测与密钥脱敏 |

- **解决**：**当前版本已适配 0.2.0-rc.2**。要点（自改代码时同样适用）：
  1. 宿主侧删掉 `installSettingsSection` / `settingsNamespace`，改成导出一个 `Config` schema，**每个想在 GUI 里编辑的字段都加 `.volatile()`**；
  2. 读配置必须走引用解包（`config.apiUrl.get()`，本仓库封装为 `liveValue()`）——volatile 字段在 `apply(ctx, config)` 里是**引用对象**，不是值；
  3. 想让保存后立刻生效，监听 `loader/volatile-update` 并重建依赖配置的注册（本插件的系统提示 + 工具 schema）；
  4. 浏览器侧把设置卡注册进 `plugins.item`（`id` / `order` / `label` / `locale` / `inject`），并用 `ctx.configForms.whileServed([行id], …)` 包住，**卡片组件必须先判断 `props.view`**：`'summary'` 只返回那一行说明文字，`'page'` 才渲染表单；
  5. 密钥字段写成 `z.string().role('secret').volatile()`，且**不要给 default**——`role('secret')` 字段靠 `value !== undefined` 判断「是否已配置」，给了 `''` 默认值会导致从没配过密钥也显示「已配置」。
- **回归保护**：`test-settings.mjs` 会断言「序列化后的 schema 里恰好是工具读取的那批字段、且全部 volatile」，并带一个反例（非 volatile 字段不进表单）；`smoke-client.mjs` 会断言卡片在 `view: 'summary'` 下只渲染一行、在 `'page'` 下才渲染表单。

## 1. 启动报错 `loaded without registering "@dickpy/dsh-imagegen"`

- **原因**：旧插件 `@dickpy/dsh-imagegen` 仍残留在 desktop profile 的依赖 / bundles 列表里（它的客户端 bundle 不符合 dsh client-modules 契约，DSH 自检会报错）。
- **解决**：从 `profiles/desktop/package.json` 删除 `@dickpy/dsh-imagegen` 的依赖项与 `dsh.profile.bundles` 条目，`pnpm install` 后重启。本插件完全替代它，且复用它的设置命名空间（见安装文档 §4）。

## 2. 报错 `Error: generate_image 需要非空 prompt`

- **原因**：模型偶尔会发起一次参数为空的探测调用（空 prompt 被插件拒绝）。属于模型行为，非插件 bug。
- **解决**：直接重试即可；下一次调用会带上完整 prompt。若频繁出现，可在设置页关闭「向模型告知能力」再重新打开，刷新模型的工具理解。

## 3. 报错 `Invalid schema for function 'generate_image': schema must be a JSON Schema of 'type: "object"', got 'type: null'`

- **原因**：工具注册时 `parameters` 必须是**完整 JSON Schema**（顶层 `type: 'object'` + `properties` + 对象级 `required` 数组）。裸属性表（无顶层 type）会被原样投影进模型请求，严格的上游网关直接拒绝。**本插件当前版本已修复**。
- **解决**：确认插件目录 `lib/index.js` 是最新版（`parameters` 含 `type: 'object'`），重启 DSH。若自改代码，注意不要退回属性表形态，也**不要**在属性里写 `required: true`（平台子集校验会拒绝）。

## 4. 图片卡片报 `attachment-error: Image is not referenced by this session`

- **原因**：旧版本通过平台 `conversation.resolveImage` 取图，而平台附件授权只扫描会话事件里的 `image` 块——本插件为兼容 text-only 模型故意不写 `image` 块，导致授权永远不通过。**本插件当前版本已修复**：改为插件自带的 loopback 附件桥（`/api/dsh-tool-imagegen/attachment`），桥会按 `generated-image` 块做会话引用检查。
- **解决**：确认插件为最新版（`lib/routes.js` 存在 `makeAttachmentRoute`），重启 DSH。若仍然出现，检查浏览器是否通过本机地址访问（附件桥仅限 loopback）。
- **注意**：同一条报错文案在 DSH 2.0.10+ 还有一个**不同成因**的复现（inject face 字段被 owner props 覆盖），排查见第 13 条。

## 5. 模型不调用 generate_image（对话里直接说"我无法生成图片"）

- **原因**：
  - 插件被禁用：设置页「启用」为关
  - 「向模型告知能力」为关（系统提示里没有生图指引）
  - 模型上下文里工具列表未刷新
- **解决**：依次检查设置页两个开关 → 重启 DSH（或新建会话）→ 明确说「用生图工具画…」。提示词里出现「画 / 生图 / 生成图片 / 插画 / 海报 / 头像」等词时模型最可能自动调用。

## 6. 上游报 400（模型不存在 / 参数错误）

- **原因**：`model` 字段与上游接口不匹配（比如上游模型名不是 `gpt-image-2`），或尺寸非法。
- **解决**：侧栏 **插件** → 本插件卡片 → 修改「模型」为上游实际支持的模型名（如 `gpt-image-1`、`dall-e-3` 或接口方提供的名称），尺寸改回 `1024x1024` 等常见值，保存后重试。错误信息里会带上 HTTP 状态码与上游返回内容。

## 7. 图片不显示 / 一直转圈 / 显示加载失败

- **原因**：附件桥拿不到图。常见情况：
  - 浏览器不是本机访问（附件桥是 loopback 围栏，远端一律 403）
  - 会话事件里找不到引用该附件的 `generated-image` 块（比如会话被清空/重建）
  - 插件未加载（见第 5 条）
  - 附件桥在宿主侧抛错（见第 14 条：DSH 2.0.10 的会话事件 API 变更）
- **解决**：确认用本机地址（127.0.0.1）访问；重启 DSH 后在新会话重新生成一次。旧会话里非常久远的图片可能已随附件库清理而失效，属预期行为。

## 8. 找得到卡片但控件是灰的 / 卡片根本不出现

- **卡片不出现**：说明宿主没有把这条 entry 报成「可配置」。按顺序查：
  1. 插件行是否在 profile 的 `dsh.profile.bundles` 里、且宿主加载成功（见第 0 条）；
  2. `Config` 里是否**至少有一个** `.volatile()` 字段——一个都没有时 `settings.describe()` 直接跳过这条 entry，`whileServed` 不会触发，于是卡片完全不注册（表现为「什么都没有」，不是「卡片报错」）；
  3. 行 id 是否唯一：profile 里重复的 entry id 会被排掉。
- **控件灰掉（只读）**：宿主设置文档不可写。远端（非 loopback）浏览器访问时，客户端配置表单以 `memory` 模式运行，不跨网线，卡片自然不出现——这是设计如此，配置只在**本机**可改。
- **保存失败**：多半是版本栅栏冲突（表单打开期间设置被别处改过）。保存失败的草稿会被保留，重新保存即可。

## 9. 报 `UNSUPPORTED_CONTENT`（整轮失败）

典型原文：`DeepSeek Messages cannot represent user/tool-result content …`

- **原因**：会话历史里出现了**插件私有的内容块**。消息适配器不会跳过不认识的块类型，它会直接拒绝整个请求。历史上有两个来源：
  - 旧版本的**生图结果**写成 `generated-image` 块（现在改为平台原生 `image` 块）；
  - 旧版本的**「修改」上传桥**把参考图写成 `uploaded-image` 块（现在改为平台原生 `image` 块）。
- **为什么「之后每轮都失败」**：这些块所在的消息（尤其是用户消息）是**持久**的。只要它还在模型可见历史里，之后的回合就会以同样方式失败——看起来就像「对话被弄坏了」。历史往后推进（压缩/裁剪）后会自动恢复。
- **解决**：
  1. 升级插件到修复版（结果与「修改」链路都只写平台 `image` 块）；
  2. **重启 DSH**，宿主侧改动才会生效；
  3. 已经被写脏的旧会话：如果重启后仍然每轮失败，用「分支」在出问题那条消息**之前**的助手回复上开一个新会话，或直接新建会话。旧会话本身不用删，历史推进后也能恢复。
- **自查**：控制台无相关输出时，可在会话日志里搜 `uploaded-image` / `generated-image`，命中说明是修复前写下的历史。

## 10. `pnpm install` 之后工具消失 / 行为异常

- **原因**：profile 的依赖被换成了别的形态（例如从本地路径装成拷贝、或指向了一个已被移动/删除的目录），DSH 加载的就不再是你当前编辑的那份代码。
- **解决**：
  ```bash
  # 确认装的是 link: 且指向你正在编辑的目录
  node -e "console.log(require('C:/Users/CJX/.dsh/profiles/desktop/package.json').dependencies)"
  ls C:/Users/CJX/.dsh/profiles/desktop/node_modules/@local/
  ```
  指向不对就重新 `add` 一次（见安装文档），然后重启 DSH。

## 11. API 密钥安全问题

- 密钥是 schema 里的 `role('secret')` 字段，**只存在于宿主**：平台在每次响应里结构化剥掉它（`redactSecrets`），只回一个 `{ path, set }` 的侧车告诉界面「配没配」，所以设置页**永远不回显**密钥。密钥字段留空保存＝保持当前密钥不变。
- 存放位置：profile 的补丁文件 `C:\Users\CJX\.dsh\profiles\desktop\cordis.patch.yml`（`id: dsh-imagegen` 那一行的 `config`）。**不再**写 `settings.yaml`。
- 不要把 profile 补丁或密钥提交进 GitHub 仓库；本仓库的文档示例一律使用占位符。

## 12. 改了设置但不生效

- 设置保存后**下一次生成即生效**（execute 每次读取实时配置），无需重启。若确实没变，检查是否保存成功（页面显示「已保存」），或确认改的是否为「生图插件」卡片（命名空间 `dsh-imagegen`）。

## 13. 生成的图片框里显示 `session/attachment-invalid: Image is not referenced by this session.`（无图）

- **症状**：`generate_image` 卡片有边框「图片框」，框内是红色报错文案，图片始终不出现；会话事件里 `generated-image` 块与附件对象都正常存在。
- **原因**：toolview 通过 inject face 注入的取图函数**曾经叫 `loadImage`**。slot 渲染器组合一个 entry 的顺序是 `{...kit, ...injected, ...slotProps, ...contextual, ...ownerProps}`（见 `@deepseek-ai/dsh-client-ui-renderer` 的 `renderEntry`/`ContextualEntry`），即 **owner props 覆盖 inject face**；而 `tool.call.toolview` 的 owner props 本身带有平台自己的 `loadImage`（`ToolCallOwnerProps.loadImage`，会话授权取图）。于是本插件的桥 URL 被静默覆盖，卡片改走平台路由，而平台只认 `image` 块 → 必然报 `session/attachment-invalid`。
- **解决**：**当前版本已修复**——face 字段改名为 `bridgeImageUrl`（不与任何 owner prop 重名），`GenerateImageView` 直接使用它（`smoke-client.mjs` 增加了「face 不得暴露 `loadImage`」的回归断言）。刷新页面（或重启 DSH）后即可看到图片。
- **自改代码时注意**：给 `tool.call.toolview` / `conversation.chat.node` 这类 slot 写 inject face 时，**不要**用 owner props 已有的名字（`loadImage`、`block`、`openFile`、`cwd`、`home`、`sessionId`、`t` 等）——被覆盖时不会报错，只会在运行期静默走错分支。

## 14. 图片框里是「破图图标 + 提示词文字」（宿主侧 `TypeError: events is not iterable`）

- **症状**：`generate_image` 卡片有边框，框内显示浏览器默认的**加载失败图标**加一段 alt 文字（就是提示词），既没有图片也没有红色文案。同一现象也可能表现为「一直转圈」。
- **原因**：附件桥（`/api/dsh-tool-imagegen/attachment`）读取 `session.events` 做会话引用授权。**DSH 2.0.10 的会话服务把事件日志改为私有**：`Session` 只提供 `snapshotEvents(from, to)` / `ownEvents()` / `eventAt(seq)`，`session.events` 是 `undefined`，于是 `referencedImageRef()` 在 `for (const event of events)` 处抛 `TypeError: events is not iterable`，路由 500。宿主日志会明确记录这条栈（`%APPDATA%\DSH Desktop\logs\host\dsh-<日期>.log`，`[desktop-web-server] TypeError: events is not iterable`）。
- **解决**：**当前版本已修复**——新增 `lib/session-events.js`（优先 `snapshotEvents()`，兼容旧 `events` 数组，最后回退 `ownEvents()`，异常形状退化为空列表即 404 而非 500），`routes.js` / `index.js` / `maintenance.js` 全部改用它；回归测试 `test-session-events.mjs` 用 2.0.10 的会话形状直接驱动真实路由，断言 200 + 字节。改完**完全重启** DSH（宿主侧代码不热重载）；本地路径装成 `link:` 时不需要重新安装。

## 15. 找不到生图插件的上传按钮

- **原因**：这不是故障，而是**有意移除**。插件早期为纯文本模型自带了一个 composer 上传按钮（选图后暂存、「待发送」，经插件自己的上传桥投递信封）。平台现已支持原生附件上传，两个入口重复，故插件不再注册 `conversation.input.left`。
- **解决**：直接用输入框的原生附件按钮上传参考图（多模态模型可直接看图）。生成图仍可点「修改」——它走插件自己的暂存通道（`pending-upload` store + `sendSession` 包装 + 上传桥），对两类模型都有效。

## 16. 用户气泡里出现 `【dsh-imagegen】…` 提示词和「附加内容块」JSON

- **症状**：点「修改」发图后，用户气泡不显示图片，而是把**给模型看的信封文字**整段显示出来，下面还挂着一块「附加内容块」的 JSON（`uploaded-image` 块的原始内容）。期望的形态是：图片气泡在上、用户自己输入的文字气泡在下。
- **原因**：插件把 `conversation.chat.node` 的 `user` 键**遮蔽**（priority -1）成自己的气泡渲染器，用来过滤信封并内联显示图片。该渲染器从 `@deepseek-ai/dsh-client-ui-primitives` **按名导入 `MessageText`**，而 **DSH 2.0.10 的 primitives 已不再导出该名字**（改为 `projectUserText` + `MarkdownText`）。缺失的具名导出在运行时是 `undefined`，渲染 `<undefined>` 触发 React error #130 → slot 层把崩溃的遮蔽项 **abdicate**（永久剔除，回退平台原生气泡）→ 信封文字与原始块被原样显示。这条错误只在**浏览器控制台**，宿主日志里没有。
- **解决**：**当前版本已修复**——所有 primitives 改为**防御式解析**（`primitive(name, fallback)`）：缺失的图标不渲染、Tooltip 透传、JsonBlock 退化为 `<details>` JSON、剪贴板退化用 `navigator.clipboard`；用户文本直接以纯文本渲染，不再依赖任何可能消失的文本组件；设置卡的 chevron 图标同样加固。`smoke-client.mjs` 新增断言：**不得访问 `.MessageText`**、必须保留防御式兜底。刷新页面即可恢复（客户端 bundle 变更不需要重启宿主）。
- **自改代码时注意**：外部 client 包的具名导出会随 DSH 版本变动，**不要**按名导入后直接渲染——少一个组件就会把整个遮蔽项打掉，而且只在浏览器控制台报错。要么命名空间 + 兜底查找，要么用原生元素自己实现。
