# 常见问题与解决方案

按症状排查。每条都给出**原因**和**解决**，标注了对应的已修复版本状态。

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
- **解决**：设置 → 插件 → 可配置 → 修改「模型」为上游实际支持的模型名（如 `gpt-image-1`、`dall-e-3` 或接口方提供的名称），尺寸改回 `1024x1024` 等常见值，保存后重试。错误信息里会带上 HTTP 状态码与上游返回内容。

## 7. 图片不显示 / 一直转圈 / 显示加载失败

- **原因**：附件桥拿不到图。常见情况：
  - 浏览器不是本机访问（附件桥是 loopback 围栏，远端一律 403）
  - 会话事件里找不到引用该附件的 `generated-image` 块（比如会话被清空/重建）
  - 插件未加载（见第 5 条）
  - 附件桥在宿主侧抛错（见第 14 条：DSH 2.0.10 的会话事件 API 变更）
- **解决**：确认用本机地址（127.0.0.1）访问；重启 DSH 后在新会话重新生成一次。旧会话里非常久远的图片可能已随附件库清理而失效，属预期行为。

## 8. 设置页卡片打不开 / 保存失败 / 提示仅本机可访问

- **原因**：设置桥是 loopback 围栏（与旧插件相同的安全设计），非本机浏览器无法读写；或设置文件处于只读状态。
- **解决**：用本机浏览器访问。密钥字段「已保存」说明已写入，留空保存表示不变；「清除已保存的密钥」会删掉密钥。

## 9. 生成后继续对话报 `UNSUPPORTED_CONTENT`

- **原因**：理论上不应发生——本插件的图片以 `generated-image` 块展示，模型层图片检测只匹配 `type: 'image'`，会话历史里永远没有 `image` 块。
- **解决**：若出现，几乎可以肯定是插件版本过旧（旧版可能向会话写过 `image` 块或事件）。升级插件，并删除该会话历史重开新会话。

## 10. `pnpm install` 之后工具消失 / 行为异常

- **原因**：`pnpm install` 可能把 `node_modules/@local/dsh-tool-imagegen` 的符号链接替换成插件目录的**旧拷贝**，导致宿主代码与插件目录不一致。
- **解决**：
  ```bash
  rm -rf node_modules/@local/dsh-tool-imagegen
  pnpm install
  ls -la node_modules/@local/   # 确认是指向 ../../plugins/dsh-tool-imagegen 的链接
  ```
  重启 DSH。

## 11. API 密钥安全问题

- 密钥只保存在本机 `settings.yaml` 的 `dsh-imagegen:` 段；设置页**不回显**、插件桥路由**不输出**密钥（describe 走 `redactSecrets`）。
- 不要把 settings.yaml 或密钥提交进 GitHub 仓库；本仓库的文档示例一律使用占位符。

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
- **解决**：**当前版本已修复**——新增 `lib/session-events.js`（优先 `snapshotEvents()`，兼容旧 `events` 数组，最后回退 `ownEvents()`，异常形状退化为空列表即 404 而非 500），`routes.js` / `index.js` / `maintenance.js` 全部改用它；回归测试 `test-session-events.mjs` 用 2.0.10 的会话形状直接驱动真实路由，断言 200 + 字节。改完必须 `node sync-profile.mjs` 并**完全重启** DSH（宿主侧代码不热重载）。

## 15. 找不到生图插件的上传按钮

- **原因**：这不是故障，而是**有意移除**。插件早期为纯文本模型自带了一个 composer 上传按钮（选图后暂存、「待发送」，经插件自己的上传桥投递信封）。平台现已支持原生附件上传，两个入口重复，故插件不再注册 `conversation.input.left`。
- **解决**：直接用输入框的原生附件按钮上传参考图（多模态模型可直接看图）。生成图仍可点「修改」——它走插件自己的暂存通道（`pending-upload` store + `sendSession` 包装 + 上传桥），对两类模型都有效。

## 16. 用户气泡里出现 `【dsh-imagegen】…` 提示词和「附加内容块」JSON

- **症状**：点「修改」发图后，用户气泡不显示图片，而是把**给模型看的信封文字**整段显示出来，下面还挂着一块「附加内容块」的 JSON（`uploaded-image` 块的原始内容）。期望的形态是：图片气泡在上、用户自己输入的文字气泡在下。
- **原因**：插件把 `conversation.chat.node` 的 `user` 键**遮蔽**（priority -1）成自己的气泡渲染器，用来过滤信封并内联显示图片。该渲染器从 `@deepseek-ai/dsh-client-ui-primitives` **按名导入 `MessageText`**，而 **DSH 2.0.10 的 primitives 已不再导出该名字**（改为 `projectUserText` + `MarkdownText`）。缺失的具名导出在运行时是 `undefined`，渲染 `<undefined>` 触发 React error #130 → slot 层把崩溃的遮蔽项 **abdicate**（永久剔除，回退平台原生气泡）→ 信封文字与原始块被原样显示。这条错误只在**浏览器控制台**，宿主日志里没有。
- **解决**：**当前版本已修复**——所有 primitives 改为**防御式解析**（`primitive(name, fallback)`）：缺失的图标不渲染、Tooltip 透传、JsonBlock 退化为 `<details>` JSON、剪贴板退化用 `navigator.clipboard`；用户文本直接以纯文本渲染，不再依赖任何可能消失的文本组件；设置卡的 chevron 图标同样加固。`smoke-client.mjs` 新增断言：**不得访问 `.MessageText`**、必须保留防御式兜底。刷新页面即可恢复（客户端 bundle 变更不需要重启宿主）。
- **自改代码时注意**：外部 client 包的具名导出会随 DSH 版本变动，**不要**按名导入后直接渲染——少一个组件就会把整个遮蔽项打掉，而且只在浏览器控制台报错。要么命名空间 + 兜底查找，要么用原生元素自己实现。
