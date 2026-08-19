# 安装文档

将 `dsh-tool-imagegen` 挂载到 DSH Desktop（DeepSeek Harness）desktop profile。

## 前置要求

- 已安装 DSH Desktop（插件目录 `C:\Users\CJX\.dsh\plugins\`、profile 目录 `C:\Users\CJX\.dsh\profiles\desktop\`）
- `node` / `pnpm` 可用（desktop profile 内自带 pnpm registry 配置）
- 一个 OpenAI 兼容的文生图接口（默认 `https://api.ephone.ai/v1`）及 API 密钥

## 安装步骤

### 1. 放置插件

把 `dsh-tool-imagegen` 整个目录拷贝到 DSH 插件目录：

```bash
cp -r dsh-tool-imagegen C:/Users/CJX/.dsh/plugins/
```

最终路径：`C:\Users\CJX\.dsh\plugins\dsh-tool-imagegen\`（含 `lib/`、`src/`、`package.json`、`cordis.patch.yml` 等）。

### 2. 挂载到 desktop profile

编辑 `C:\Users\CJX\.dsh\profiles\desktop\package.json`：

```jsonc
{
  "dependencies": {
    // 添加（如已存在则跳过）：
    "@local/dsh-tool-imagegen": "file:../../plugins/dsh-tool-imagegen"
  },
  "dsh": {
    "profile": {
      "bundles": [
        // 添加：
        "@local/dsh-tool-imagegen"
      ]
    }
  }
}
```

> 如果 profile 里仍残留旧插件 `@dickpy/dsh-imagegen`，请同时删除它的依赖项与 bundles 条目（本插件完全替代它）。

### 3. 安装依赖

```bash
cd C:/Users/CJX/.dsh/profiles/desktop
pnpm install
```

> **注意：`file:` 依赖安装为实体拷贝，不是符号链接。** pnpm 把 `dsh-tool-imagegen` 整个目录拷贝到 `node_modules/@local/dsh-tool-imagegen`，DSH 实际加载的是**这份拷贝**。因此修改插件源目录后，必须重新同步拷贝才能生效（见下文「升级 / 重装」），改源码不重启不会生效——这是预期行为，不是 bug。

### 4. 配置

两种方式任选：

**方式 A — GUI（推荐）**：打开 DSH → 设置 → 插件 → 可配置 →「生图插件」卡片，填写：

| 字段 | 说明 |
|---|---|
| 接口地址 | OpenAI 兼容 base URL，如 `https://api.ephone.ai/v1` |
| API 密钥 | 只存本机，不回显；留空表示不变 |
| 模型 | 上游模型名，默认 `gpt-image-2` |
| 尺寸 / 张数 | 默认出图参数（工具调用时可被模型覆盖） |

保存后立即生效，无需重启。

**方式 B — 直接编辑 settings.yaml**：`C:\Users\CJX\.dsh\settings.yaml` 中维护 `dsh-imagegen:` 段：

```yaml
dsh-imagegen:
  apiUrl: https://api.ephone.ai/v1
  apiKey: <你的密钥>
  model: gpt-image-2
  size: 1024x1024
  n: 1
  enabled: true
  announceToAgent: true
```

> 如果之前用过旧插件 `@dickpy/dsh-imagegen`，这段配置已存在且**自动继承**，无需迁移。

### 5. 重启并验证

重启 DSH，按顺序检查：

1. **启动无报错** — 日志里不应再有 `Failed to load plugins ... __ModuleLoader__.load` 之类错误
2. **设置页** — 设置 → 插件 → 可配置 出现「生图插件」卡片，apiUrl / apiKey 已自动填好（继承自旧配置）
3. **生图内联** — 对话输入「帮我画一只戴帽子的橘猫，油画风格」→ 模型自动调用 `generate_image` → 图片内联显示在对话中，右上角有下载按钮
4. **text-only 安全** — 生成后继续对话（"再画一张""说说这是什么"）→ 不出现 `UNSUPPORTED_CONTENT`
5. **设置即时生效** — 改 model / size 保存后，下一次生成即用新值

## 升级 / 重装

插件仓库自带同步脚本，一条命令完成「清掉拷贝 → 重装 → 校验」：

```bash
cd C:/Users/CJX/.dsh/plugins/dsh-tool-imagegen
node sync-profile.mjs                # 默认 profile；可用 --profile <path> 指定
# 重启 DSH（必须完全退出所有进程）
```

手动操作等价的步骤：

```bash
rm -rf node_modules/@local/dsh-tool-imagegen   # 清掉旧拷贝
cd C:/Users/CJX/.dsh/profiles/desktop && pnpm install
# 重启 DSH
```

客户端部分修改后需要重建（`node build-client.mjs`）再同步；宿主侧（lib/）修改直接生效。

## 卸载

1. `package.json` 删除依赖项与 bundles 条目
2. `pnpm install`
3. 删除插件目录 `C:\Users\CJX\.dsh\plugins\dsh-tool-imagegen`
4. 可选：删除 `settings.yaml` 中的 `dsh-imagegen:` 段

## 常见问题

见 [troubleshooting.md](troubleshooting.md)。
