/**
 * Locale dictionary for dsh-tool-imagegen — the settings card and the inline
 * generated-image toolview. Registered under this plugin's own namespace; the
 * Host locale layer merges it with the core dictionaries.
 */

/** The locale keys this plugin's UI reads. */
export type ImageGenLocaleKey =
  | 'cardTitle'
  | 'cardDescription'
  | 'fieldEnabled'
  | 'fieldEnabledHelp'
  | 'fieldAnnounce'
  | 'fieldAnnounceHelp'
  | 'fieldApiUrl'
  | 'fieldApiUrlHelp'
  | 'fieldApiKey'
  | 'fieldApiKeyHelp'
  | 'fieldModel'
  | 'fieldModelHelp'
  | 'fieldSize'
  | 'fieldSizeHelp'
  | 'fieldCount'
  | 'fieldCountHelp'
  | 'save'
  | 'saving'
  | 'discard'
  | 'unsaved'
  | 'saved'
  | 'failed'
  | 'notServed'
  | 'loading'
  | 'expand'
  | 'collapse'
  | 'overridden'
  | 'reset'
  | 'invalidNumber'
  | 'inherit'
  | 'on'
  | 'off'
  | 'readOnly'
  | 'notExposed'
  | 'apiKeySet'
  | 'apiKeyClear'
  | 'toolviewTitle'
  | 'toolviewModel'
  | 'toolviewPrompt'
  | 'toolviewRunning'
  | 'toolviewFailed'
  | 'toolviewDownload'

export const zh: Record<ImageGenLocaleKey, string> = {
  cardTitle: '生图插件',
  cardDescription: 'OpenAI 兼容文生图：模型在对话中调用 generate_image，图片直接内联显示在对话框。',
  fieldEnabled: '启用',
  fieldEnabledHelp: '关闭后对话中的生图请求会被忽略。',
  fieldAnnounce: '向模型告知能力',
  fieldAnnounceHelp: '开启后会把生图用法写入系统提示，模型更可能自动调用。',
  fieldApiUrl: '接口地址',
  fieldApiUrlHelp: 'OpenAI 兼容 /images/generations 的 base URL（如 https://api.ephone.ai/v1）。',
  fieldApiKey: 'API 密钥',
  fieldApiKeyHelp: '仅保存在本机设置文件中，不会回显。',
  fieldModel: '模型',
  fieldModelHelp: '上游模型名，默认 gpt-image-2，可手写修改。',
  fieldSize: '尺寸',
  fieldSizeHelp: '如 1024x1024 / 1024x1792 / 1792x1024，留空用上游默认。',
  fieldCount: '张数',
  fieldCountHelp: '一次生成几张（1–4）。',
  save: '保存',
  saving: '保存中…',
  discard: '放弃',
  unsaved: '有未保存的修改',
  saved: '已保存',
  failed: '保存失败',
  notServed: '当前环境不提供该设置',
  loading: '加载中…',
  expand: '展开',
  collapse: '收起',
  overridden: '已覆盖',
  reset: '重置',
  invalidNumber: '请输入有效数字',
  inherit: '继承',
  on: '开',
  off: '关',
  readOnly: '当前环境为只读，无法保存',
  notExposed: '此设置当前不可用（仅本机回环地址可访问）。',
  apiKeySet: '已保存（出于安全不显示内容，可留空表示不变）',
  apiKeyClear: '清除已保存的密钥',
  toolviewTitle: '生成图片',
  toolviewModel: '模型',
  toolviewPrompt: '提示词',
  toolviewRunning: '正在生成…',
  toolviewFailed: '生成失败',
  toolviewDownload: '下载图片',
}

export const en: Record<ImageGenLocaleKey, string> = {
  cardTitle: 'Image Generator',
  cardDescription: 'OpenAI-compatible text-to-image: the model calls generate_image in chat and images render inline in the conversation.',
  fieldEnabled: 'Enabled',
  fieldEnabledHelp: 'When off, image generation requests from chat are ignored.',
  fieldAnnounce: 'Announce capability to model',
  fieldAnnounceHelp: 'When on, image usage is written into the system prompt so the model is more likely to call it.',
  fieldApiUrl: 'API URL',
  fieldApiUrlHelp: 'OpenAI-compatible /images/generations base URL (e.g. https://api.ephone.ai/v1).',
  fieldApiKey: 'API key',
  fieldApiKeyHelp: 'Stored only in the local settings file; never echoed back.',
  fieldModel: 'Model',
  fieldModelHelp: 'Upstream model name; defaults to gpt-image-2, editable by hand.',
  fieldSize: 'Size',
  fieldSizeHelp: 'e.g. 1024x1024 / 1024x1792 / 1792x1024; leave empty for the upstream default.',
  fieldCount: 'Count',
  fieldCountHelp: 'How many images to generate (1–4).',
  save: 'Save',
  saving: 'Saving…',
  discard: 'Discard',
  unsaved: 'You have unsaved changes',
  saved: 'Saved',
  failed: 'Save failed',
  notServed: 'This setting is not available in this environment',
  loading: 'Loading…',
  expand: 'Expand',
  collapse: 'Collapse',
  overridden: 'Overridden',
  reset: 'Reset',
  invalidNumber: 'Enter a valid number',
  inherit: 'Inherit',
  on: 'On',
  off: 'Off',
  readOnly: 'Read-only in this environment; cannot save',
  notExposed: 'This setting is unavailable (loopback only).',
  apiKeySet: 'Saved (hidden for security; leave empty to keep)',
  apiKeyClear: 'Clear the stored key',
  toolviewTitle: 'Generated image',
  toolviewModel: 'Model',
  toolviewPrompt: 'Prompt',
  toolviewRunning: 'Generating…',
  toolviewFailed: 'Generation failed',
  toolviewDownload: 'Download image',
}
