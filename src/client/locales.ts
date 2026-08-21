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
  | 'fieldQuality'
  | 'fieldQualityHelp'
  | 'fieldOutputFormat'
  | 'fieldOutputFormatHelp'
  | 'fieldBackground'
  | 'fieldBackgroundHelp'
  | 'fieldStyle'
  | 'fieldStyleHelp'
  | 'fieldModeration'
  | 'fieldModerationHelp'
  | 'fieldWatermark'
  | 'fieldWatermarkHelp'
  | 'fieldOptionalPlaceholder'
  | 'fieldOutputFormatEnable'
  | 'fieldOutputFormatEnableHelp'
  | 'fieldStyleEnable'
  | 'fieldStyleEnableHelp'
  | 'fieldWatermarkEnable'
  | 'fieldWatermarkEnableHelp'
  | 'fieldGatedHint'
  | 'comboAria'
  | 'comboEmpty'
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
  | 'toolviewView'
  | 'toolviewOpen'
  | 'toolviewOpening'
  | 'toolviewOpenFailed'
  | 'toolviewEdit'
  | 'toolviewEditing'
  | 'toolviewEditReady'
  | 'toolviewEditFailed'
  | 'uploadTitle'
  | 'uploadHelp'
  | 'uploading'
  | 'uploaded'
  | 'uploadFailed'
  | 'uploadTooLarge'
  | 'uploadTypeRejected'
  | 'uploadSelected'
  | 'uploadRemove'
  | 'storageTitle'
  | 'storageDescription'
  | 'storageUploads'
  | 'storageAttachments'
  | 'storageCleanup'
  | 'storageCleaning'
  | 'storageCleanupDone'
  | 'storageFailed'
  | 'image.label'
  | 'image.openOriginal'
  | 'image.openOriginalLabel'
  | 'image.loading'
  | 'image.loadFailed'
  | 'image.preview'
  | 'image.closePreview'
  | 'message.extraBlock'
  | 'json.truncated'
  | 'copy'
  | 'copied'
  | 'clock.md'
  | 'clock.ymd'

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
  fieldSizeHelp: 'gpt-image-2 官方尺寸下拉可选（auto = 上游默认），也可手写任意合法尺寸（最大边 ≤ 3840px）。',
  fieldCount: '张数',
  fieldCountHelp: '一次生成几张（1–4）。',
  fieldQuality: '画质',
  fieldQualityHelp: 'low / medium / high，留空用上游默认。',
  fieldOutputFormat: '输出格式',
  fieldOutputFormatHelp: 'png / jpeg / webp，留空用上游默认。',
  fieldBackground: '背景',
  fieldBackgroundHelp: 'transparent / opaque / auto（图生图也适用），留空用上游默认。',
  fieldStyle: '风格',
  fieldStyleHelp: 'vivid / natural（部分模型/网关支持），留空用上游默认。',
  fieldModeration: '审核档位',
  fieldModerationHelp: 'low / medium / high（较新参数，部分网关不支持），留空用上游默认。',
  fieldWatermark: '水印',
  fieldWatermarkHelp: 'triw / none / auto（较新参数，部分网关不支持），留空用上游默认。',
  fieldOptionalPlaceholder: '留空用上游默认',
  fieldOutputFormatEnable: '启用输出格式参数',
  fieldOutputFormatEnableHelp: '默认关闭：当前网关不兼容 output_format，传了会报「图片字节与声明格式不符」。开启后模型可传、设置可编辑、会发送给上游。',
  fieldStyleEnable: '启用风格参数',
  fieldStyleEnableHelp: '默认关闭：当前网关不兼容 style，直接报 Unknown parameter。开启后模型可传、设置可编辑、会发送给上游。',
  fieldWatermarkEnable: '启用水印参数',
  fieldWatermarkEnableHelp: '默认关闭：当前网关把 watermark 当布尔值解析，不接受 triw/none/auto。开启后模型可传、设置可编辑、会发送给上游。',
  fieldGatedHint: '默认关闭（当前网关不兼容），开启上方开关后此参数才会发送给上游并开放给模型。',
  comboAria: '选项列表',
  comboEmpty: '无匹配选项',
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
  toolviewView: '全屏查看',
  toolviewOpen: '本地打开',
  toolviewOpening: '正在打开…',
  toolviewOpenFailed: '打开失败',
  toolviewEdit: '修改',
  toolviewEditing: '处理中…',
  toolviewEditReady: '已加入待发送：输入修改需求后发送',
  toolviewEditFailed: '操作失败',
  uploadTitle: '上传图片',
  uploadHelp: '当前模型不支持直接传图：点击上传参考图，模型会收到图片路径，可基于它生成或修改。',
  uploading: '上传中…',
  uploaded: '已上传',
  uploadFailed: '上传失败',
  uploadTooLarge: '图片超过 5MB 上限',
  uploadTypeRejected: '仅支持 PNG / JPEG / WebP / GIF',
  uploadSelected: '已选图片，输入消息后发送',
  uploadRemove: '移除图片',
  storageTitle: '生图存储',
  storageDescription: '上传参考图与生成图片的占用与清理。',
  storageUploads: '上传文件',
  storageAttachments: '附件对象',
  storageCleanup: '清理未引用文件',
  storageCleaning: '清理中…',
  storageCleanupDone: '已清理：上传 {uploads} 个、附件 {attachments} 个，共释放 {bytes}',
  storageFailed: '存储操作失败',
  'image.label': '图片',
  'image.openOriginal': '查看原图',
  'image.openOriginalLabel': '打开原图 {label}',
  'image.loading': '加载中…',
  'image.loadFailed': '加载失败',
  'image.preview': '图片预览',
  'image.closePreview': '关闭预览',
  'message.extraBlock': '附加内容',
  'json.truncated': '…已截断（共 {total} 项）',
  copy: '复制',
  copied: '已复制',
  'clock.md': '{m}月{d}日',
  'clock.ymd': '{y}年{m}月{d}日',
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
  fieldSizeHelp: 'Official gpt-image-2 sizes in the dropdown (auto = upstream default); any legal size (max side ≤ 3840px) can also be typed.',
  fieldCount: 'Count',
  fieldCountHelp: 'How many images to generate (1–4).',
  fieldQuality: 'Quality',
  fieldQualityHelp: 'low / medium / high; leave empty for the upstream default.',
  fieldOutputFormat: 'Output format',
  fieldOutputFormatHelp: 'png / jpeg / webp; leave empty for the upstream default.',
  fieldBackground: 'Background',
  fieldBackgroundHelp: 'transparent / opaque / auto (also for image-to-image); leave empty for the upstream default.',
  fieldStyle: 'Style',
  fieldStyleHelp: 'vivid / natural (some models/gateways); leave empty for the upstream default.',
  fieldModeration: 'Moderation',
  fieldModerationHelp: 'low / medium / high (newer parameter, some gateways reject it); leave empty for the upstream default.',
  fieldWatermark: 'Watermark',
  fieldWatermarkHelp: 'triw / none / auto (newer parameter, some gateways reject it); leave empty for the upstream default.',
  fieldOptionalPlaceholder: 'Upstream default if empty',
  fieldOutputFormatEnable: 'Enable output format',
  fieldOutputFormatEnableHelp: 'Off by default: the current gateway rejects output_format ("declared type does not match its bytes"). When on, the model can pass it, the setting becomes editable, and it is sent upstream.',
  fieldStyleEnable: 'Enable style',
  fieldStyleEnableHelp: 'Off by default: the current gateway rejects style ("Unknown parameter"). When on, the model can pass it, the setting becomes editable, and it is sent upstream.',
  fieldWatermarkEnable: 'Enable watermark',
  fieldWatermarkEnableHelp: 'Off by default: the current gateway parses watermark as a boolean and rejects triw/none/auto. When on, the model can pass it, the setting becomes editable, and it is sent upstream.',
  fieldGatedHint: 'Off by default (the current gateway rejects it); flip the switch above to send it upstream and expose it to the model.',
  comboAria: 'Options',
  comboEmpty: 'No matching option',
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
  toolviewView: 'View fullscreen',
  toolviewOpen: 'Open locally',
  toolviewOpening: 'Opening…',
  toolviewOpenFailed: 'Open failed',
  toolviewEdit: 'Edit',
  toolviewEditing: 'Preparing…',
  toolviewEditReady: 'Added as edit reference — type your request and send',
  toolviewEditFailed: 'Edit failed',
  uploadTitle: 'Upload image',
  uploadHelp: 'This model cannot take images directly: upload a reference and the model receives its path for image-to-image.',
  uploading: 'Uploading…',
  uploaded: 'Uploaded',
  uploadFailed: 'Upload failed',
  uploadTooLarge: 'Image exceeds the 5MB limit',
  uploadTypeRejected: 'Only PNG / JPEG / WebP / GIF are supported',
  uploadSelected: 'Image selected — type a message and send',
  uploadRemove: 'Remove image',
  storageTitle: 'Image storage',
  storageDescription: 'Space used by reference uploads and generated images, with orphan cleanup.',
  storageUploads: 'Upload files',
  storageAttachments: 'Attachment objects',
  storageCleanup: 'Clean up unreferenced files',
  storageCleaning: 'Cleaning…',
  storageCleanupDone: 'Removed {uploads} upload(s) and {attachments} attachment(s), freeing {bytes}',
  storageFailed: 'Storage operation failed',
  'image.label': 'Image',
  'image.openOriginal': 'Open original',
  'image.openOriginalLabel': 'Open original {label}',
  'image.loading': 'Loading…',
  'image.loadFailed': 'Load failed',
  'image.preview': 'Image preview',
  'image.closePreview': 'Close preview',
  'message.extraBlock': 'Additional content',
  'json.truncated': '…truncated ({total} total)',
  copy: 'Copy',
  copied: 'Copied',
  'clock.md': '{m}/{d}',
  'clock.ymd': '{y}-{m}-{d}',
}
