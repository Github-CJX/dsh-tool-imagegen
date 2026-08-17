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
