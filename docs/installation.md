# 安装文档

把 `dsh-tool-imagegen` 装进 DSH Desktop 的 `desktop` profile。

## 前置要求

- **DSH Desktop 0.2.0-rc.2 或更新**。本版插件用的是当前的「配置表单」契约：一个插件的 `Config` schema 就是注册本身，GUI 表单由 schema 里带 `.volatile()` 的字段生成，配置卡注册进 Plugins 页的 `plugins.item` 槽。旧版的 `settings.plugin.item` 槽、`installSettingsSection` / `settingsNamespace` 导出在新客户端里**已不存在**，旧版插件在 0.2.0-rc.2 上会直接加载失败。
- 一个 OpenAI 兼容的图像接口（`/images/generations`，图生图另需 `/images/edits`）及其密钥。
- 安装动作由 DSH 自带的 pnpm 完成，**不需要**你手动改 profile、也不需要全局装 pnpm。

## 安装

三种等价入口，任选其一。三者做的都是同一件事：在 profile 目录里 `pnpm add`，再把包名追加到 profile 的 `dsh.profile.bundles`。

### 方式 A — GUI（推荐）

DSH → 侧栏 **插件** → **添加插件** → 填入以下任一种 spec：

| spec 形式 | 例子 |
|---|---|
| 本地绝对路径 | `D:\dsh-work\imagegen-repo` |
| npm 包名（± 版本） | `dsh-tool-imagegen@0.2.0` |
| git 地址 | `github:Github-CJX/dsh-tool-imagegen` |
| tarball | `D:\dist\dsh-tool-imagegen-0.2.0.tgz` |

> 本地路径**必须是绝对路径**（相对路径会被拒绝）。

### 方式 B — 命令行

```powershell
# $boot 是 Desktop 自带的 CLI 引导文件；DSH Desktop 里带 dsh 命令时直接用 `dsh`。
& $exe --expose-internals $boot plugin --profile desktop add 'D:\dsh-work\imagegen-repo'
```

### 方式 C — Agent 工具

`plugin_manager` 的 `install_bundle`，`target` 传插件目录的绝对路径。

装完之后 profile 的 `package.json` 会长这样：

```jsonc
{
  "dependencies": { "@local/dsh-tool-imagegen": "link:D:/dsh-work/imagegen-repo" },
  "dsh": { "profile": { "bundles": [ "...", "@local/dsh-tool-imagegen" ] } }
}
```

> **本地路径装成 `link:`，不是拷贝。** DSH 直接加载你给的那个目录（`lib/index.js` 与已构建的 `lib/client.js`），所以改宿主侧代码只需要重启，不需要重新安装。这也是为什么仓库里提交了构建产物 `lib/client.js`——客户端 bundle 必须在启动前就存在。

## 配置

侧栏 **插件** → 本插件卡片（标题「对话内联生图」/ *Inline image generation*）：

| 字段 | 说明 |
|---|---|
| 启用 | 插件总开关；关闭后对话里的生图请求被忽略，但配置卡仍在（否则没法再打开） |
| 向模型告知能力 | 是否把插件写进系统提示，让模型更愿意自动调用 `generate_image` |
| 接口地址 | OpenAI 兼容 base URL，如 `https://api.ephone.ai/v1` |
| API 密钥 | 只存本机，响应里永不回显；留空表示保持当前密钥 |
| 模型 | 上游模型名，默认 `gpt-image-2` |
| 尺寸 / 张数 | 默认出图参数，可被模型调用时覆盖 |
| 画质 / 输出格式 / 背景 / 风格 / 审核 / 水印 | 每个都是「勾选框 + 可输入下拉」：勾选才生效 |

点 **保存** 写入，即时生效，无需重启。

**配置存在哪里**：profile 的补丁文件 `C:\Users\CJX\.dsh\profiles\desktop\cordis.patch.yml`，对应 `id: dsh-imagegen` 那一行的 `config` 段。它不再写 `settings.yaml`。

> **从旧版本迁移**：插件行的 id 就是旧插件用的设置命名空间 `dsh-imagegen`。DSH 启动时会把 `~/.dsh/settings.yaml` 里同名的段按行 id 导入，所以旧插件留下的 `dsh-imagegen:` 段（`apiUrl` / `apiKey` 等）会被自动折进这一行，无需手动迁移；导入后原文件被改名为 `settings.yaml.imported`。

也可以直接在 `cordis.patch.yml` 里写（GUI 未打开时的冷配置）：

```yaml
- id: dsh-imagegen
  name: '@local/dsh-tool-imagegen'
  config:
    apiUrl: https://api.ephone.ai/v1
    model: gpt-image-2
    size: 1024x1024
    n: 1
```

## 重启并验证

**完全退出** DSH（含托盘/后台进程）再启动，然后逐项检查：

1. **启动无报错** —— 日志里没有 `Failed to load plugins` / `client bundle not found` 之类错误。
2. **卡片出现** —— 侧栏「插件」页里出现本插件卡片；展开后有上面那张表单，接口地址/密钥状态正确。
3. **生图内联** —— 说「帮我画一只戴帽子的橘猫，油画风格」→ 模型调用 `generate_image` → 图片内联显示在对话中，悬停有 全屏查看 / 修改 / 下载 / 本地打开。
4. **纯文本模型安全** —— 生成后继续对话（「再画一张」）→ 不出现 `UNSUPPORTED_CONTENT`。
5. **设置即时生效** —— 改模型/尺寸保存后，下一次生成即用新值（宿主侧监听 `loader/volatile-update` 重建工具 schema）。
6. **存储清理** —— 同一个卡片里有「生图存储」区块，显示占用并可一键清理孤儿文件。

## 开发时的改动生效路径

| 改了什么 | 要做什么 |
|---|---|
| `lib/*.js`（宿主侧） | 重启 DSH |
| `src/client/*`（浏览器侧） | `node build-client.mjs` → 重启 DSH |
| `package.json` / `cordis.patch.yml` | 重启 DSH（必要时重新 `add`） |

验证一条命令跑完全部测试：

```bash
node test-settings.mjs && node test-engine.mjs && node test-maintenance.mjs \
  && node test-routes-open.mjs && node test-session-events.mjs
node build-client.mjs && node smoke-client.mjs
```

## 卸载

任一入口：

- GUI：插件卡片 → 卸载；
- 命令行：`dsh plugin --profile desktop remove @local/dsh-tool-imagegen`；
- Agent 工具：`plugin_manager` 的 `remove_bundle`。

之后 profile 的 `dependencies` 与 `dsh.profile.bundles` 都会被清理；重启 DSH 生效。

## 常见问题

见 [troubleshooting.md](troubleshooting.md)。
