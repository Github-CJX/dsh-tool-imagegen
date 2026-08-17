# Security

## 密钥处理(API key handling)

本插件涉及用户的上游 API 密钥,安全边界如下:

- **密钥只存宿主侧**:写入本机 `settings.yaml` 的 `dsh-imagegen:` 段,绝不进入浏览器
  - 设置页**不回显**已保存的密钥(secret 字段只显示「已保存」)
  - 插件设置桥(`/api/dsh-tool-imagegen/settings/describe`)走 `redactSecrets`,响应中不输出密钥
- **loopback 围栏**:设置桥与附件桥均只接受本机 loopback 请求(`isLoopbackRequest`),远端一律 403
- **附件授权**:附件桥按「会话事件中存在引用该附件的 `generated-image` 块」授权,与平台附件授权模型一致
- **仓库不含密钥**:`settings.yaml` 与 `*.local.yaml` 在 `.gitignore` 中;仓库内所有文档示例使用占位符

## 报告安全漏洞(Reporting a vulnerability)

上游接口域名、密钥、图片内容均属用户自有资源,不在本仓库控制范围。

如发现本插件代码本身的安全问题(密钥泄露路径、授权绕过、注入等),请通过
[GitHub Issues](https://github.com/Github-CJX/dsh-tool-imagegen/issues) 提交,
并附上复现步骤与影响描述。
