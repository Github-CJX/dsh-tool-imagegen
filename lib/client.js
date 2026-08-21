window.__ModuleLoader__.load({
	id: "@local/dsh-tool-imagegen",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	Object.defineProperties(exports, {
		__esModule: { value: true },
		[Symbol.toStringTag]: { value: "Module" }
	});
	let react = require("react");
	let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
	let react_jsx_runtime = require("react/jsx-runtime");
	let _deepseek_ai_dsh_client_ui_attachment = require("@deepseek-ai/dsh-client-ui-attachment");
	let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
	//#region src/client/locales.ts
	const zh = {
		cardTitle: "生图插件",
		cardDescription: "OpenAI 兼容文生图：模型在对话中调用 generate_image，图片直接内联显示在对话框。",
		fieldEnabled: "启用",
		fieldEnabledHelp: "关闭后对话中的生图请求会被忽略。",
		fieldAnnounce: "向模型告知能力",
		fieldAnnounceHelp: "开启后会把生图用法写入系统提示，模型更可能自动调用。",
		fieldApiUrl: "接口地址",
		fieldApiUrlHelp: "OpenAI 兼容 /images/generations 的 base URL（如 https://api.ephone.ai/v1）。",
		fieldApiKey: "API 密钥",
		fieldApiKeyHelp: "仅保存在本机设置文件中，不会回显。",
		fieldModel: "模型",
		fieldModelHelp: "上游模型名，默认 gpt-image-2，可手写修改。",
		fieldSize: "尺寸",
		fieldSizeHelp: "gpt-image-2 官方尺寸下拉可选（auto = 上游默认），也可手写任意合法尺寸（最大边 ≤ 3840px）。",
		fieldCount: "张数",
		fieldCountHelp: "一次生成几张（1–4）。",
		fieldQuality: "画质",
		fieldQualityHelp: "low / medium / high，留空用上游默认。",
		fieldOutputFormat: "输出格式",
		fieldOutputFormatHelp: "png / jpeg / webp，留空用上游默认。",
		fieldBackground: "背景",
		fieldBackgroundHelp: "transparent / opaque / auto（图生图也适用），留空用上游默认。",
		fieldStyle: "风格",
		fieldStyleHelp: "vivid / natural（部分模型/网关支持），留空用上游默认。",
		fieldModeration: "审核档位",
		fieldModerationHelp: "low / medium / high（较新参数，部分网关不支持），留空用上游默认。",
		fieldWatermark: "水印",
		fieldWatermarkHelp: "triw / none / auto（较新参数，部分网关不支持），留空用上游默认。",
		fieldOptionalPlaceholder: "留空用上游默认",
		fieldGatedHint: "未勾选：此参数不发送给上游、模型也不可见。勾选后即可编辑使用。",
		fieldUnsupportedHint: "此参数大部分网关不支持，如果确认支持，请自行打开。",
		comboAria: "选项列表",
		comboEmpty: "无匹配选项",
		save: "保存",
		saving: "保存中…",
		discard: "放弃",
		unsaved: "有未保存的修改",
		saved: "已保存",
		failed: "保存失败",
		notServed: "当前环境不提供该设置",
		loading: "加载中…",
		expand: "展开",
		collapse: "收起",
		overridden: "已覆盖",
		reset: "重置",
		invalidNumber: "请输入有效数字",
		inherit: "继承",
		on: "开",
		off: "关",
		readOnly: "当前环境为只读，无法保存",
		notExposed: "此设置当前不可用（仅本机回环地址可访问）。",
		apiKeySet: "已保存（出于安全不显示内容，可留空表示不变）",
		apiKeyClear: "清除已保存的密钥",
		toolviewTitle: "生成图片",
		toolviewModel: "模型",
		toolviewPrompt: "提示词",
		toolviewRunning: "正在生成…",
		toolviewFailed: "生成失败",
		toolviewDownload: "下载图片",
		toolviewView: "全屏查看",
		toolviewOpen: "本地打开",
		toolviewOpening: "正在打开…",
		toolviewOpenFailed: "打开失败",
		toolviewEdit: "修改",
		toolviewEditing: "处理中…",
		toolviewEditReady: "已加入待发送：输入修改需求后发送",
		toolviewEditFailed: "操作失败",
		uploadTitle: "上传图片",
		uploadHelp: "当前模型不支持直接传图：点击上传参考图，模型会收到图片路径，可基于它生成或修改。",
		uploading: "上传中…",
		uploaded: "已上传",
		uploadFailed: "上传失败",
		uploadTooLarge: "图片超过 5MB 上限",
		uploadTypeRejected: "仅支持 PNG / JPEG / WebP / GIF",
		uploadSelected: "已选图片，输入消息后发送",
		uploadRemove: "移除图片",
		storageTitle: "生图存储",
		storageDescription: "上传参考图与生成图片的占用与清理。",
		storageUploads: "上传文件",
		storageAttachments: "附件对象",
		storageCleanup: "清理未引用文件",
		storageCleaning: "清理中…",
		storageCleanupDone: "已清理：上传 {uploads} 个、附件 {attachments} 个，共释放 {bytes}",
		storageFailed: "存储操作失败",
		"image.label": "图片",
		"image.openOriginal": "查看原图",
		"image.openOriginalLabel": "打开原图 {label}",
		"image.loading": "加载中…",
		"image.loadFailed": "加载失败",
		"image.preview": "图片预览",
		"image.closePreview": "关闭预览",
		"message.extraBlock": "附加内容",
		"json.truncated": "…已截断（共 {total} 项）",
		copy: "复制",
		copied: "已复制",
		"clock.md": "{m}月{d}日",
		"clock.ymd": "{y}年{m}月{d}日"
	};
	const en = {
		cardTitle: "Image Generator",
		cardDescription: "OpenAI-compatible text-to-image: the model calls generate_image in chat and images render inline in the conversation.",
		fieldEnabled: "Enabled",
		fieldEnabledHelp: "When off, image generation requests from chat are ignored.",
		fieldAnnounce: "Announce capability to model",
		fieldAnnounceHelp: "When on, image usage is written into the system prompt so the model is more likely to call it.",
		fieldApiUrl: "API URL",
		fieldApiUrlHelp: "OpenAI-compatible /images/generations base URL (e.g. https://api.ephone.ai/v1).",
		fieldApiKey: "API key",
		fieldApiKeyHelp: "Stored only in the local settings file; never echoed back.",
		fieldModel: "Model",
		fieldModelHelp: "Upstream model name; defaults to gpt-image-2, editable by hand.",
		fieldSize: "Size",
		fieldSizeHelp: "Official gpt-image-2 sizes in the dropdown (auto = upstream default); any legal size (max side ≤ 3840px) can also be typed.",
		fieldCount: "Count",
		fieldCountHelp: "How many images to generate (1–4).",
		fieldQuality: "Quality",
		fieldQualityHelp: "low / medium / high; leave empty for the upstream default.",
		fieldOutputFormat: "Output format",
		fieldOutputFormatHelp: "png / jpeg / webp; leave empty for the upstream default.",
		fieldBackground: "Background",
		fieldBackgroundHelp: "transparent / opaque / auto (also for image-to-image); leave empty for the upstream default.",
		fieldStyle: "Style",
		fieldStyleHelp: "vivid / natural (some models/gateways); leave empty for the upstream default.",
		fieldModeration: "Moderation",
		fieldModerationHelp: "low / medium / high (newer parameter, some gateways reject it); leave empty for the upstream default.",
		fieldWatermark: "Watermark",
		fieldWatermarkHelp: "triw / none / auto (newer parameter, some gateways reject it); leave empty for the upstream default.",
		fieldOptionalPlaceholder: "Upstream default if empty",
		fieldGatedHint: "Unchecked: not sent upstream, invisible to the model. Check to use this parameter.",
		fieldUnsupportedHint: "Most gateways do not support this parameter; enable it yourself only if you confirm yours does.",
		comboAria: "Options",
		comboEmpty: "No matching option",
		save: "Save",
		saving: "Saving…",
		discard: "Discard",
		unsaved: "You have unsaved changes",
		saved: "Saved",
		failed: "Save failed",
		notServed: "This setting is not available in this environment",
		loading: "Loading…",
		expand: "Expand",
		collapse: "Collapse",
		overridden: "Overridden",
		reset: "Reset",
		invalidNumber: "Enter a valid number",
		inherit: "Inherit",
		on: "On",
		off: "Off",
		readOnly: "Read-only in this environment; cannot save",
		notExposed: "This setting is unavailable (loopback only).",
		apiKeySet: "Saved (hidden for security; leave empty to keep)",
		apiKeyClear: "Clear the stored key",
		toolviewTitle: "Generated image",
		toolviewModel: "Model",
		toolviewPrompt: "Prompt",
		toolviewRunning: "Generating…",
		toolviewFailed: "Generation failed",
		toolviewDownload: "Download image",
		toolviewView: "View fullscreen",
		toolviewOpen: "Open locally",
		toolviewOpening: "Opening…",
		toolviewOpenFailed: "Open failed",
		toolviewEdit: "Edit",
		toolviewEditing: "Preparing…",
		toolviewEditReady: "Added as edit reference — type your request and send",
		toolviewEditFailed: "Edit failed",
		uploadTitle: "Upload image",
		uploadHelp: "This model cannot take images directly: upload a reference and the model receives its path for image-to-image.",
		uploading: "Uploading…",
		uploaded: "Uploaded",
		uploadFailed: "Upload failed",
		uploadTooLarge: "Image exceeds the 5MB limit",
		uploadTypeRejected: "Only PNG / JPEG / WebP / GIF are supported",
		uploadSelected: "Image selected — type a message and send",
		uploadRemove: "Remove image",
		storageTitle: "Image storage",
		storageDescription: "Space used by reference uploads and generated images, with orphan cleanup.",
		storageUploads: "Upload files",
		storageAttachments: "Attachment objects",
		storageCleanup: "Clean up unreferenced files",
		storageCleaning: "Cleaning…",
		storageCleanupDone: "Removed {uploads} upload(s) and {attachments} attachment(s), freeing {bytes}",
		storageFailed: "Storage operation failed",
		"image.label": "Image",
		"image.openOriginal": "Open original",
		"image.openOriginalLabel": "Open original {label}",
		"image.loading": "Loading…",
		"image.loadFailed": "Load failed",
		"image.preview": "Image preview",
		"image.closePreview": "Close preview",
		"message.extraBlock": "Additional content",
		"json.truncated": "…truncated ({total} total)",
		copy: "Copy",
		copied: "Copied",
		"clock.md": "{m}/{d}",
		"clock.ymd": "{y}-{m}-{d}"
	};
	//#endregion
	//#region src/client/settings-form.ts
	/**
	* Staged form model behind the plugin settings card. A card stages what the
	* user types and writes it only when they save — the settings write is a
	* durable, revision-fenced document mutation, so staging keeps what is on
	* screen exactly what a save would store. Self-contained slice of the same
	* pattern the dsh-web-ui family cards use (this package must not depend on a
	* sibling UI package).
	*/
	/** A free-text field. An empty draft clears the field. */
	function textField(field) {
		return {
			field,
			format: (value) => typeof value === "string" ? value : "",
			parse: (text) => {
				const trimmed = text.trim();
				return trimmed === "" ? { kind: "clear" } : {
					kind: "set",
					value: trimmed
				};
			}
		};
	}
	/** A boolean field, edited through true/false draft text. */
	function booleanField(field) {
		return {
			field,
			format: (value) => typeof value === "boolean" ? String(value) : "",
			parse: (text) => {
				if (text === "true") return {
					kind: "set",
					value: true
				};
				if (text === "false") return {
					kind: "set",
					value: false
				};
			}
		};
	}
	/** A numeric field, edited through a plain-text draft (invalid text blocks the save). */
	function numberField(field) {
		return {
			field,
			format: (value) => typeof value === "number" && Number.isFinite(value) ? String(value) : "",
			parse: (text) => {
				const trimmed = text.trim();
				if (trimmed === "") return { kind: "clear" };
				const value = Number(trimmed);
				if (!Number.isFinite(value)) return void 0;
				return {
					kind: "set",
					value
				};
			}
		};
	}
	/**
	* A secret field (role('secret') in the namespace schema). The stored value is
	* never rendered or returned by the redacted wire view, so:
	*  - an empty draft means "no change" (typing nothing must never clear an
	*    invisible stored key); the dedicated clear action stages an explicit clear;
	*  - a write's outcome is judged by the namespace's secrets sidecar through
	*    the {@link CardForm} `secretSettled` hook, never by the user layer.
	*/
	function secretField(field) {
		return {
			field,
			secret: true,
			format: () => "",
			parse: (text) => {
				const trimmed = text.trim();
				if (trimmed === "") return void 0;
				return {
					kind: "set",
					value: trimmed
				};
			}
		};
	}
	/**
	* Stages one card's edits over one settings scope and writes them on save.
	*
	* The Host is the only authority on whether a value was accepted — its
	* validators own the constraints no schema can express — so the outcome is
	* read back from the section rather than predicted here. A save that did not
	* land keeps its drafts, so the user can correct them instead of retyping.
	*/
	var CardForm = class {
		scope;
		options;
		specs;
		staged = /* @__PURE__ */ new Map();
		listeners = /* @__PURE__ */ new Set();
		saving = false;
		failed = false;
		/**
		* @param scope - the bound settings scope for this card's namespace.
		* @param specs - the fields this card edits.
		* @param options.secretSettled - for secret fields, whether the namespace
		*   currently holds a stored secret (the redacted view never round-trips the
		*   value, so a write's outcome is read from the secrets sidecar instead).
		*/
		constructor(scope, specs, options = {}) {
			this.scope = scope;
			this.options = options;
			this.specs = new Map(specs.map((spec) => [spec.field, spec]));
			scope.subscribe(() => {
				this.publish();
			});
		}
		/** Publish a projection of this form, rebuilt whenever the scope or a draft changes. */
		bind(project) {
			const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(project());
			this.listeners.add(() => {
				store.set(project());
			});
			return store;
		}
		/** Read the card-level state: what the Host serves, and what a save would do. */
		shell() {
			const snapshot = this.scope.getSnapshot();
			const plan = this.plan();
			return {
				available: snapshot.status !== "loading",
				exposed: snapshot.status === "ready",
				writable: snapshot.writable,
				dirty: plan.length > 0,
				invalid: plan.some((item) => item.run === void 0),
				saving: this.saving,
				failed: this.failed
			};
		}
		/** Read one field's state from the effective section and its staged draft. */
		field(field) {
			const spec = this.specOf(field);
			const staged = this.staged.get(field);
			if (staged === void 0) return {
				text: spec.format(this.sectionValue(field)),
				overridden: this.stored(field),
				invalid: false
			};
			const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
			return {
				text: staged.text,
				overridden: write?.kind === "set",
				invalid: write === void 0 && !(spec.secret === true && staged.text.trim() === "")
			};
		}
		/** The actions the card's slot registration injects. */
		actions() {
			return {
				edit: (field, text) => {
					this.stage(field, {
						text,
						clear: false
					});
				},
				resetField: (field) => {
					this.stage(field, {
						text: this.specOf(field).format(this.baseValue(field)),
						clear: true
					});
				},
				save: () => {
					this.save();
				},
				discard: () => {
					if (this.staged.size === 0 && !this.failed) return;
					this.staged.clear();
					this.failed = false;
					this.publish();
				}
			};
		}
		/**
		* Write every staged edit, then re-seed from what the Host accepted.
		* @returns settlement after every write and the read-back.
		*/
		async save() {
			const plan = this.plan();
			const writes = plan.flatMap((item) => item.run === void 0 ? [] : [item.run]);
			if (plan.length === 0 || this.saving || writes.length !== plan.length) return;
			this.saving = true;
			this.failed = false;
			this.publish();
			let landed = true;
			for (const write of writes) landed = await write() && landed;
			if (landed) this.staged.clear();
			this.saving = false;
			this.failed = !landed;
			this.publish();
		}
		/**
		* Every staged edit a save would write. An entry whose draft is not a value
		* its field accepts carries no write: the form is still dirty, and the save
		* refuses rather than dropping the edit. A staged edit that matches the
		* effective section is not a write at all.
		*/
		plan() {
			const plan = [];
			for (const [field, staged] of this.staged) {
				const spec = this.specOf(field);
				if (staged.clear) {
					if (spec.secret === true ? this.options.secretSettled?.(field) ?? false : this.stored(field)) plan.push({
						field,
						run: () => this.clear(field)
					});
					continue;
				}
				if (staged.text === spec.format(this.sectionValue(field))) continue;
				const write = spec.parse(staged.text);
				if (write === void 0) plan.push({
					field,
					run: void 0
				});
				else if (write.kind === "clear") plan.push({
					field,
					run: () => this.clear(field)
				});
				else plan.push({
					field,
					run: () => this.store(field, write.value)
				});
			}
			return plan;
		}
		async clear(field) {
			await this.scope.unset(field);
			if (this.specOf(field).secret === true) return !(this.options.secretSettled?.(field) ?? false);
			return !this.stored(field);
		}
		async store(field, value) {
			await this.scope.set(field, value);
			if (this.specOf(field).secret === true) return this.options.secretSettled?.(field) ?? true;
			return this.userLayer()?.[field] === value;
		}
		stage(field, edit) {
			this.staged.set(field, edit);
			this.failed = false;
			this.publish();
		}
		specOf(field) {
			const spec = this.specs.get(field);
			if (spec === void 0) throw new Error(`settings card has no field ${field}`);
			return spec;
		}
		snapshotOf() {
			return this.scope.getSnapshot();
		}
		sectionValue(field) {
			return this.snapshotOf().value?.[field];
		}
		baseValue(field) {
			return this.snapshotOf().base?.[field];
		}
		userLayer() {
			return this.snapshotOf().user;
		}
		stored(field) {
			const user = this.userLayer();
			return user !== void 0 && Object.hasOwn(user, field);
		}
		publish() {
			for (const listener of [...this.listeners]) listener();
		}
	};
	//#endregion
	//#region src/client/protocol.ts
	/** Same-origin route family (loopback-only, mirroring the dsh-ssh fence). */
	const SETTINGS_API = {
		describe: "/api/dsh-tool-imagegen/settings/describe",
		mutate: "/api/dsh-tool-imagegen/settings/mutate"
	};
	/**
	* Loopback bridge route serving generated-image bytes to the GUI. The
	* platform's own attachment authorization only recognizes `image` blocks
	* referenced by session events; this plugin deliberately never writes
	* `image` blocks (text-only model safety), so the inline view resolves
	* generated images through this route instead. The route re-checks the
	* session's events for a `generated-image` block referencing the id — the
	* same trust model as the platform route, over this plugin's block type.
	*/
	const ATTACHMENT_API = { path: "/api/dsh-tool-imagegen/attachment" };
	/**
	* Loopback bridge route accepting a text-model upload: the client POSTs the
	* image bytes (base64), the host stores them in the upload work dir + the
	* attachment store, then enqueues a user message ([uploaded-image] block +
	* model-facing text envelope) into the session so the image renders inline
	* while the model only ever sees the text envelope.
	*/
	const UPLOAD_API = { path: "/api/dsh-tool-imagegen/upload" };
	/**
	* Loopback bridge route answering whether a given provider/model accepts image
	* input. The client learns the selected model from its own session.models RPC
	* and asks here whether the plugin's custom upload button should be shown
	* (text-only) or the native composer upload used instead (image-capable).
	*/
	const CAPABILITY_API = { path: "/api/dsh-tool-imagegen/capability" };
	/** Storage-maintenance bridges (stats + orphan cleanup). */
	const MAINTENANCE_API = {
		stats: "/api/dsh-tool-imagegen/maintenance/stats",
		cleanup: "/api/dsh-tool-imagegen/maintenance/cleanup"
	};
	/**
	* Loopback bridge route opening one referenced image in the system's default
	* image viewer (the inline view's 本地打开 button). The host re-checks the
	* session's events — same authorization as ATTACHMENT_API — then copies the
	* bytes to a host-side temp file and hands it to the OS opener; the browser
	* never gets the bytes or a path.
	*/
	const OPEN_API = { path: "/api/dsh-tool-imagegen/open" };
	/** Third line of the envelope: the typed user request the host embedded. */
	const ENVELOPE_REQUEST_MARKER = "用户接下来的要求：";
	/** Placeholder the host writes when the upload carried no text. */
	const ENVELOPE_NO_REQUEST = "（暂无文字说明，请先向用户确认要如何修改或生成这张图）";
	/**
	* Extract the user's typed request from a model-facing upload envelope. The
	* bubble renderer filters envelope text out of the visible bubble — but the
	* user's own words live in the envelope's third line, so they are pulled out
	* and shown instead. Returns undefined when the text is not an envelope or
	* carries no request.
	*/
	function envelopeRequestText(envelope) {
		if (envelope.startsWith("【dsh-imagegen】") === false) return void 0;
		const index = envelope.lastIndexOf(ENVELOPE_REQUEST_MARKER);
		if (index < 0) return void 0;
		const request = envelope.slice(index + 9).trim();
		return request === "" || request === ENVELOPE_NO_REQUEST ? void 0 : request;
	}
	//#endregion
	//#region /0cssm:src/client/settings-card.module.css.js
	const css$3 = "/**\r\n * dsh-tool-imagegen settings card styles. Mirrors the official plugin-config\r\n * card chrome (@deepseek-ai/dsh-client-ui-settings-plugins PluginCard + fields)\r\n * so the card reads as a sibling of the bash / agent-loop / web-search cards;\r\n * colors ride the dsh --dsw-* tokens.\r\n */\r\n\r\n.dsh-tig_card_10gqfzv {\r\n  list-style: none;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 12px;\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  transition: border-color 0.16s, background 0.16s;\r\n}\r\n\r\n.dsh-tig_card_10gqfzv:hover {\r\n  border-color: var(--dsw-alias-label-dimmed);\r\n}\r\n\r\n/* An open card reads as the one being worked on, not merely taller. */\r\n.dsh-tig_card_10gqfzv:has(.dsh-tig_body_10gqfzv) {\r\n  background: var(--dsw-alias-bg-layer-2);\r\n  border-color: var(--dsw-alias-label-dimmed);\r\n}\r\n\r\n.dsh-tig_header_10gqfzv {\r\n  width: 100%;\r\n  appearance: none;\r\n  border: 0;\r\n  background: none;\r\n  font: inherit;\r\n  color: inherit;\r\n  text-align: left;\r\n  cursor: pointer;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n  padding: 14px 16px;\r\n  border-radius: 12px;\r\n}\r\n\r\n.dsh-tig_header_10gqfzv:focus-visible {\r\n  outline: 2px solid var(--dsw-alias-brand-primary);\r\n  outline-offset: -2px;\r\n}\r\n\r\n.dsh-tig_headText_10gqfzv {\r\n  flex: 1;\r\n  min-width: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 4px;\r\n}\r\n\r\n.dsh-tig_name_10gqfzv {\r\n  font-size: 15px;\r\n  font-weight: 600;\r\n  line-height: 1.4;\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n\r\n.dsh-tig_description_10gqfzv {\r\n  font-size: 13px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-tertiary);\r\n}\r\n\r\n.dsh-tig_chevron_10gqfzv,\r\n.dsh-tig_chevronOpen_10gqfzv {\r\n  flex: none;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  transition: transform 0.16s;\r\n}\r\n\r\n.dsh-tig_chevronOpen_10gqfzv {\r\n  transform: rotate(180deg);\r\n}\r\n\r\n/* Carried on the header so a collapsed card still says it holds edits. */\r\n.dsh-tig_pending_10gqfzv {\r\n  flex: none;\r\n  border-radius: 999px;\r\n  padding: 1px 8px;\r\n  font-size: 11px;\r\n  line-height: 17px;\r\n  font-weight: 500;\r\n  white-space: nowrap;\r\n  background: var(--dsw-alias-bg-module-platform);\r\n  color: var(--dsw-alias-label-secondary);\r\n}\r\n\r\n.dsh-tig_body_10gqfzv {\r\n  border-top: 1px solid var(--dsw-alias-border-l2);\r\n  margin: 0 16px;\r\n  padding-bottom: 8px;\r\n}\r\n\r\n/* --- fields (mirror of the official plugin-config fields) --------------------- */\r\n\r\n.dsh-tig_field_10gqfzv {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 6px;\r\n  padding: 12px 0;\r\n}\r\n\r\n.dsh-tig_field_10gqfzv + .dsh-tig_field_10gqfzv {\r\n  border-top: 1px solid var(--dsw-alias-border-l2);\r\n}\r\n\r\n.dsh-tig_head_10gqfzv {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.dsh-tig_label_10gqfzv {\r\n  flex: 1;\r\n  min-width: 0;\r\n  font-size: 13px;\r\n  font-weight: 500;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n\r\n.dsh-tig_badges_10gqfzv {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.dsh-tig_badge_10gqfzv {\r\n  border-radius: 999px;\r\n  padding: 1px 8px;\r\n  font-size: 11px;\r\n  line-height: 17px;\r\n  white-space: nowrap;\r\n  font-weight: 500;\r\n  background: var(--dsw-alias-bg-module-platform);\r\n  color: var(--dsw-alias-label-secondary);\r\n}\r\n\r\n.dsh-tig_reset_10gqfzv {\r\n  border: none;\r\n  background: none;\r\n  padding: 0;\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-secondary);\r\n  cursor: pointer;\r\n}\r\n\r\n.dsh-tig_reset_10gqfzv:hover:not(:disabled) {\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n\r\n.dsh-tig_reset_10gqfzv:disabled {\r\n  cursor: default;\r\n  opacity: 0.5;\r\n}\r\n\r\n.dsh-tig_input_10gqfzv,\r\n.dsh-tig_select_10gqfzv {\r\n  height: 34px;\r\n  padding: 0 12px;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 8px;\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  font: inherit;\r\n  font-size: 13px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-primary);\r\n  outline: none;\r\n}\r\n\r\n.dsh-tig_input_10gqfzv:focus-visible,\r\n.dsh-tig_select_10gqfzv:focus-visible {\r\n  border-color: var(--dsw-alias-brand-primary);\r\n}\r\n\r\n.dsh-tig_input_10gqfzv:disabled,\r\n.dsh-tig_select_10gqfzv:disabled {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  cursor: default;\r\n}\r\n\r\n.dsh-tig_inputInvalid_10gqfzv {\r\n  height: 34px;\r\n  padding: 0 12px;\r\n  border: 1px solid var(--dsw-alias-label-error);\r\n  border-radius: 8px;\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  font: inherit;\r\n  font-size: 13px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-primary);\r\n  outline: none;\r\n}\r\n\r\n/* --- editable combo (input + styled option panel, replaces the native\r\n     datalist popup that looked detached from the card) ------------------------ */\r\n\r\n/* One row: the parameter-enable checkbox in front of the combo/input. */\r\n.dsh-tig_comboRow_10gqfzv {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  width: 100%;\r\n}\r\n\r\n/* Plain (non-combo) inputs inside the row also fill the remaining width. */\r\n.dsh-tig_comboRow_10gqfzv .dsh-tig_input_10gqfzv,\r\n.dsh-tig_comboRow_10gqfzv .dsh-tig_inputInvalid_10gqfzv {\r\n  flex: 1;\r\n  min-width: 0;\r\n}\r\n\r\n.dsh-tig_combo_10gqfzv {\r\n  position: relative;\r\n  /* A flex item in .dsh-tig_comboRow_10gqfzv; flex:1 fills the row (min-width:0 stops the\r\n     input's intrinsic min-content from stretching the row past the card). */\r\n  flex: 1;\r\n  min-width: 0;\r\n}\r\n\r\n.dsh-tig_comboInput_10gqfzv,\r\n.dsh-tig_comboInputInvalid_10gqfzv {\r\n  /* width:100% + padding can overflow the card when the host CSS has no\r\n     global border-box reset — size the box explicitly instead. */\r\n  box-sizing: border-box;\r\n  width: 100%;\r\n  height: 34px;\r\n  padding: 0 34px 0 12px;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 8px;\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  font: inherit;\r\n  font-size: 13px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-primary);\r\n  outline: none;\r\n}\r\n\r\n.dsh-tig_comboInputInvalid_10gqfzv {\r\n  border-color: var(--dsw-alias-label-error);\r\n}\r\n\r\n.dsh-tig_comboInput_10gqfzv:focus-visible,\r\n.dsh-tig_comboInputInvalid_10gqfzv:focus-visible {\r\n  border-color: var(--dsw-alias-brand-primary);\r\n}\r\n\r\n.dsh-tig_comboInput_10gqfzv:disabled,\r\n.dsh-tig_comboInputInvalid_10gqfzv:disabled {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  cursor: default;\r\n}\r\n\r\n.dsh-tig_comboToggle_10gqfzv {\r\n  position: absolute;\r\n  top: 0;\r\n  right: 0;\r\n  height: 34px;\r\n  width: 32px;\r\n  border: none;\r\n  background: none;\r\n  padding: 0;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-size: 12px;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  cursor: pointer;\r\n  border-radius: 0 8px 8px 0;\r\n}\r\n\r\n.dsh-tig_comboToggle_10gqfzv:hover:not(:disabled) {\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n\r\n.dsh-tig_comboToggle_10gqfzv:disabled {\r\n  cursor: default;\r\n}\r\n\r\n.dsh-tig_comboToggle_10gqfzv:focus-visible {\r\n  outline: 2px solid var(--dsw-alias-brand-primary);\r\n  outline-offset: -2px;\r\n}\r\n\r\n.dsh-tig_comboPanel_10gqfzv {\r\n  box-sizing: border-box;\r\n  position: absolute;\r\n  z-index: 30;\r\n  top: calc(100% + 4px);\r\n  left: 0;\r\n  width: 100%;\r\n  max-height: 224px;\r\n  overflow-y: auto;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 8px;\r\n  background: var(--dsw-alias-bg-layer-2);\r\n  box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);\r\n  padding: 4px;\r\n}\r\n\r\n.dsh-tig_comboOption_10gqfzv,\r\n.dsh-tig_comboEmpty_10gqfzv {\r\n  appearance: none;\r\n  border: none;\r\n  background: none;\r\n  box-sizing: border-box;\r\n  width: 100%;\r\n  text-align: left;\r\n  font: inherit;\r\n  font-size: 13px;\r\n  line-height: 1.5;\r\n  padding: 6px 10px;\r\n  border-radius: 6px;\r\n}\r\n\r\n.dsh-tig_comboOption_10gqfzv {\r\n  /* Long option values must truncate, never stretch the panel wider than\r\n     the field. */\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  color: var(--dsw-alias-label-primary);\r\n  cursor: pointer;\r\n}\r\n\r\n.dsh-tig_comboOption_10gqfzv:hover,\r\n.dsh-tig_comboOptionSelected_10gqfzv {\r\n  background: var(--dsw-alias-bg-module-platform);\r\n}\r\n\r\n.dsh-tig_comboOption_10gqfzv:focus-visible {\r\n  outline: 2px solid var(--dsw-alias-brand-primary);\r\n  outline-offset: -1px;\r\n}\r\n\r\n.dsh-tig_comboEmpty_10gqfzv {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  cursor: default;\r\n}\r\n\r\n/* --- parameter-enable checkbox (field head, before the label) ---------------- */\r\n\r\n.dsh-tig_enableCheck_10gqfzv {\r\n  flex: none;\r\n  width: 16px;\r\n  height: 16px;\r\n  margin: 0;\r\n  accent-color: var(--dsw-alias-brand-primary, var(--dsw-static-deepseek-500));\r\n  cursor: pointer;\r\n}\r\n\r\n.dsh-tig_enableCheck_10gqfzv:disabled {\r\n  cursor: default;\r\n  opacity: 0.5;\r\n}\r\n\r\n.dsh-tig_hint_10gqfzv,\r\n.dsh-tig_invalid_10gqfzv {\r\n  margin: 0;\r\n  font-size: 12px;\r\n  line-height: 1.5;\r\n}\r\n\r\n.dsh-tig_hint_10gqfzv {\r\n  color: var(--dsw-alias-label-tertiary);\r\n}\r\n\r\n.dsh-tig_invalid_10gqfzv {\r\n  color: var(--dsw-alias-label-error);\r\n}\r\n\r\n.dsh-tig_readOnly_10gqfzv,\r\n.dsh-tig_notExposed_10gqfzv {\r\n  margin: 12px 0 0;\r\n  font-size: 12px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-tertiary);\r\n}\r\n\r\n/* --- footer (mirror of the official card footer) ------------------------------ */\r\n\r\n.dsh-tig_footer_10gqfzv {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: flex-end;\r\n  gap: 8px;\r\n  padding: 12px 0 4px;\r\n  border-top: 1px solid var(--dsw-alias-border-l2);\r\n}\r\n\r\n.dsh-tig_failed_10gqfzv {\r\n  flex: 1;\r\n  min-width: 0;\r\n  margin: 0;\r\n  font-size: 12px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-error);\r\n}\r\n\r\n/* Storage-maintenance section (embedded in the settings card body). */\r\n.dsh-tig_storageSection_10gqfzv {\r\n  margin-top: 14px;\r\n  padding-top: 12px;\r\n  border-top: 1px solid var(--dsw-alias-border-l2);\r\n}\r\n\r\n.dsh-tig_storageHeading_10gqfzv {\r\n  margin: 0 0 6px;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n\r\n/* Storage-maintenance lines (sizes / cleanup outcome). */\r\n.dsh-tig_storageLine_10gqfzv {\r\n  margin: 0 0 4px;\r\n  font-size: 13px;\r\n  line-height: 1.6;\r\n  color: var(--dsw-alias-label-secondary);\r\n}\r\n\r\n.dsh-tig_saved_10gqfzv {\r\n  flex: 1;\r\n  min-width: 0;\r\n  margin: 8px 0 0;\r\n  font-size: 12px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-state-success-primary, var(--dsw-static-deepseek-500));\r\n}\r\n\r\n.dsh-tig_discard_10gqfzv,\r\n.dsh-tig_save_10gqfzv {\r\n  appearance: none;\r\n  border: 1px solid transparent;\r\n  border-radius: 8px;\r\n  padding: 5px 14px;\r\n  font: inherit;\r\n  font-size: 13px;\r\n  line-height: 1.5;\r\n  cursor: pointer;\r\n}\r\n\r\n.dsh-tig_discard_10gqfzv {\r\n  border-color: var(--dsw-alias-border-l2);\r\n  background: none;\r\n  color: var(--dsw-alias-label-secondary);\r\n}\r\n\r\n.dsh-tig_discard_10gqfzv:hover:not(:disabled) {\r\n  color: var(--dsw-alias-label-primary);\r\n  border-color: var(--dsw-alias-label-dimmed);\r\n}\r\n\r\n.dsh-tig_save_10gqfzv {\r\n  background: var(--dsw-alias-label-primary);\r\n  color: var(--dsw-alias-bg-layer-3);\r\n}\r\n\r\n.dsh-tig_discard_10gqfzv:disabled,\r\n.dsh-tig_save_10gqfzv:disabled {\r\n  opacity: 0.4;\r\n  cursor: default;\r\n}\r\n\r\n.dsh-tig_discard_10gqfzv:focus-visible,\r\n.dsh-tig_save_10gqfzv:focus-visible {\r\n  outline: 2px solid var(--dsw-alias-brand-primary);\r\n  outline-offset: 1px;\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) {\r\n  .dsh-tig_card_10gqfzv, .dsh-tig_chevron_10gqfzv, .dsh-tig_chevronOpen_10gqfzv {\r\n    transition: none;\r\n  }\r\n}\r\n";
	const tagId$3 = "@local/dsh-tool-imagegen/src/client/settings-card.module.css";
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
		const tag = document.createElement("style");
		tag.dataset.pluginCss = tagId$3;
		tag.textContent = css$3;
		document.head.appendChild(tag);
	}
	var settings_card_module_css_default = {
		"card": "dsh-tig_card_10gqfzv",
		"body": "dsh-tig_body_10gqfzv",
		"header": "dsh-tig_header_10gqfzv",
		"headText": "dsh-tig_headText_10gqfzv",
		"name": "dsh-tig_name_10gqfzv",
		"description": "dsh-tig_description_10gqfzv",
		"chevron": "dsh-tig_chevron_10gqfzv",
		"chevronOpen": "dsh-tig_chevronOpen_10gqfzv",
		"pending": "dsh-tig_pending_10gqfzv",
		"field": "dsh-tig_field_10gqfzv",
		"head": "dsh-tig_head_10gqfzv",
		"label": "dsh-tig_label_10gqfzv",
		"badges": "dsh-tig_badges_10gqfzv",
		"badge": "dsh-tig_badge_10gqfzv",
		"reset": "dsh-tig_reset_10gqfzv",
		"input": "dsh-tig_input_10gqfzv",
		"select": "dsh-tig_select_10gqfzv",
		"inputInvalid": "dsh-tig_inputInvalid_10gqfzv",
		"comboRow": "dsh-tig_comboRow_10gqfzv",
		"combo": "dsh-tig_combo_10gqfzv",
		"comboInput": "dsh-tig_comboInput_10gqfzv",
		"comboInputInvalid": "dsh-tig_comboInputInvalid_10gqfzv",
		"comboToggle": "dsh-tig_comboToggle_10gqfzv",
		"comboPanel": "dsh-tig_comboPanel_10gqfzv",
		"comboOption": "dsh-tig_comboOption_10gqfzv",
		"comboEmpty": "dsh-tig_comboEmpty_10gqfzv",
		"comboOptionSelected": "dsh-tig_comboOptionSelected_10gqfzv",
		"enableCheck": "dsh-tig_enableCheck_10gqfzv",
		"hint": "dsh-tig_hint_10gqfzv",
		"invalid": "dsh-tig_invalid_10gqfzv",
		"readOnly": "dsh-tig_readOnly_10gqfzv",
		"notExposed": "dsh-tig_notExposed_10gqfzv",
		"footer": "dsh-tig_footer_10gqfzv",
		"failed": "dsh-tig_failed_10gqfzv",
		"storageSection": "dsh-tig_storageSection_10gqfzv",
		"storageHeading": "dsh-tig_storageHeading_10gqfzv",
		"storageLine": "dsh-tig_storageLine_10gqfzv",
		"saved": "dsh-tig_saved_10gqfzv",
		"discard": "dsh-tig_discard_10gqfzv",
		"save": "dsh-tig_save_10gqfzv"
	};
	//#endregion
	//#region src/client/MaintenanceCard.tsx
	/**
	* The dsh-tool-imagegen storage-maintenance section: shows how much space the
	* upload work dir and the attachment store occupy, and offers a one-click
	* orphan cleanup — files no session (live or persisted) references are
	* removed, and the freed space is reported.
	*
	* rc.7 keyed the `settings.plugin.item` slot by settings namespace (one entry
	* per key), so this is no longer a standalone card: it renders as a section
	* INSIDE the generator settings card (see SettingsCard.tsx), bound to the
	* same loopback maintenance bridge.
	*/
	/** Human-readable byte size (KiB / MiB). */
	function formatBytes(bytes) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KiB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
	}
	/** Line copy for one area (e.g. "上传文件 3 个 · 2.1 MiB"). */
	function areaLabel(t, area, key) {
		if (area === void 0) return `${t(key)} · ${t("loading")}`;
		return `${t(key)} ${area.count} · ${formatBytes(area.bytes)}`;
	}
	/**
	* Render the storage section inside the settings card body.
	* @param props - locale copy + the loopback fetch face.
	* @returns the section.
	*/
	function StorageSection({ t, fetchFn }) {
		const [uploads, setUploads] = (0, react.useState)(void 0);
		const [attachments, setAttachments] = (0, react.useState)(void 0);
		const [running, setRunning] = (0, react.useState)(false);
		const [report, setReport] = (0, react.useState)(void 0);
		const [error, setError] = (0, react.useState)(void 0);
		const refresh = (0, react.useCallback)(async () => {
			try {
				const body = await (await fetchFn(MAINTENANCE_API.stats, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: "{}"
				})).json();
				if (body.ok !== true) throw new Error(body.message ?? "maintenance unavailable");
				setUploads(body.uploads);
				setAttachments(body.attachments);
				setError(void 0);
			} catch (statsError) {
				setError(statsError instanceof Error && statsError.message !== "" ? statsError.message : t("storageFailed"));
			}
		}, [fetchFn, t]);
		(0, react.useEffect)(() => {
			refresh();
		}, [refresh]);
		const onCleanup = (0, react.useCallback)(async () => {
			setRunning(true);
			setError(void 0);
			setReport(void 0);
			try {
				const body = await (await fetchFn(MAINTENANCE_API.cleanup, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: "{}"
				})).json();
				if (body.ok !== true) throw new Error(body.message ?? "cleanup failed");
				const total = (body.uploads?.bytesFreed ?? 0) + (body.attachments?.bytesFreed ?? 0);
				setReport(t("storageCleanupDone", {
					uploads: body.uploads?.removed ?? 0,
					attachments: body.attachments?.removed ?? 0,
					bytes: formatBytes(total)
				}));
				refresh();
			} catch (cleanupError) {
				setError(cleanupError instanceof Error && cleanupError.message !== "" ? cleanupError.message : t("storageFailed"));
			} finally {
				setRunning(false);
			}
		}, [
			fetchFn,
			t,
			refresh
		]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: settings_card_module_css_default.storageSection,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: settings_card_module_css_default.storageHeading,
					children: t("storageTitle")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: settings_card_module_css_default.storageLine,
					children: areaLabel(t, uploads, "storageUploads")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: settings_card_module_css_default.storageLine,
					children: areaLabel(t, attachments, "storageAttachments")
				}),
				error !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: settings_card_module_css_default.failed,
					role: "status",
					children: error
				}) : null,
				report !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: settings_card_module_css_default.saved,
					role: "status",
					children: report
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: settings_card_module_css_default.footer,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: settings_card_module_css_default.save,
						disabled: running,
						onClick: () => {
							onCleanup();
						},
						children: t(running ? "storageCleaning" : "storageCleanup")
					})
				})
			]
		});
	}
	//#endregion
	//#region src/client/SettingsCard.tsx
	/**
	* The dsh-tool-imagegen settings card: api_url, api_key (secret, display-only
	* "set" state), model (default gpt-image-2, hand-editable), size, count, and
	* the plugin switches. Registers into the official `settings.plugin.item` slot
	* (the Settings → Plugins → Configurable tab), independent of the dsh-web-ui
	* family group, bound to the plugin's own bridge settings scope.
	*/
	/** Enum suggestion lists for the optional upstream parameters (editable, not enforced). */
	const ENUM_OPTIONS = {
		quality: [
			"low",
			"medium",
			"high"
		],
		output_format: [
			"png",
			"jpeg",
			"webp"
		],
		background: [
			"transparent",
			"opaque",
			"auto"
		],
		style: ["vivid", "natural"],
		moderation: [
			"low",
			"medium",
			"high"
		],
		watermark: [
			"triw",
			"none",
			"auto"
		]
	};
	/** Official gpt-image-2 canvas sizes (最大边 ≤ 3840px；'auto' = 上游默认).
	*  A suggestion list only — any size the upstream accepts can be typed. */
	const SIZE_OPTIONS = [
		"auto",
		"512x512",
		"1024x1024",
		"1536x1024",
		"1024x1536",
		"2048x2048",
		"2048x1152",
		"3840x2160",
		"2160x3840"
	];
	/** Bridges the imagegen scope onto the card's staged form. */
	var ImageGenSettingsCardController = class {
		scope;
		form;
		/** @param scope - the bound bridge scope for the dsh-imagegen namespace. */
		constructor(scope) {
			this.scope = scope;
			this.form = new CardForm(scope, [
				booleanField("enabled"),
				booleanField("announceToAgent"),
				textField("apiUrl"),
				secretField("apiKey"),
				textField("model"),
				textField("size"),
				numberField("n"),
				textField("quality"),
				textField("output_format"),
				textField("background"),
				textField("style"),
				textField("moderation"),
				textField("watermark"),
				booleanField("quality_enabled"),
				booleanField("output_format_enabled"),
				booleanField("background_enabled"),
				booleanField("style_enabled"),
				booleanField("moderation_enabled"),
				booleanField("watermark_enabled")
			], { secretSettled: () => this.scope.getKeySetSnapshot() });
		}
		projection() {
			return {
				...this.form.shell(),
				enabled: this.form.field("enabled"),
				announceToAgent: this.form.field("announceToAgent"),
				apiUrl: this.form.field("apiUrl"),
				apiKey: this.form.field("apiKey"),
				model: this.form.field("model"),
				size: this.form.field("size"),
				n: this.form.field("n"),
				quality: this.form.field("quality"),
				output_format: this.form.field("output_format"),
				background: this.form.field("background"),
				style: this.form.field("style"),
				moderation: this.form.field("moderation"),
				watermark: this.form.field("watermark"),
				quality_enabled: this.form.field("quality_enabled"),
				output_format_enabled: this.form.field("output_format_enabled"),
				background_enabled: this.form.field("background_enabled"),
				style_enabled: this.form.field("style_enabled"),
				moderation_enabled: this.form.field("moderation_enabled"),
				watermark_enabled: this.form.field("watermark_enabled")
			};
		}
		/**
		* Build the face the card's slot registration injects.
		* @returns the card's snapshot, the key-set flag, and the form actions.
		*/
		inject() {
			const cardStore = this.form.bind(() => this.projection());
			const keySetStore = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(this.scope.getKeySetSnapshot());
			this.scope.subscribeKeySet(() => {
				keySetStore.set(this.scope.getKeySetSnapshot());
			});
			return {
				hooks: {
					imageGenSettingsCard: cardStore,
					imageGenKeySet: keySetStore
				},
				...this.form.actions()
			};
		}
	};
	/**
	* Render the card.
	* @param props - locale copy, the card snapshot, and the form actions.
	* @returns the card, or nothing while the namespace is still loading.
	*/
	function ImageGenSettingsCard(props) {
		const { t, maintenance } = props;
		const state = props.useImageGenSettingsCard((snapshot) => snapshot);
		const keySet = props.useImageGenKeySet((snapshot) => snapshot);
		const [open, setOpen] = (0, react.useState)(false);
		if (!state.available) return null;
		const title = t("cardTitle");
		const blocked = !state.dirty || state.invalid || state.saving;
		const disabled = !state.writable;
		const fieldProps = {
			overriddenLabel: t("overridden"),
			resetLabel: t("reset"),
			invalidLabel: t("invalidNumber"),
			disabled,
			comboAriaLabel: t("comboAria"),
			comboEmptyLabel: t("comboEmpty")
		};
		if (!state.exposed) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
			className: settings_card_module_css_default.card,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: settings_card_module_css_default.header,
				"aria-expanded": open,
				"aria-label": `${t(open ? "collapse" : "expand")}: ${title}`,
				onClick: () => {
					setOpen(!open);
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: settings_card_module_css_default.headText,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.name,
						children: title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.description,
						children: t("cardDescription")
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: open ? settings_card_module_css_default.chevronOpen : settings_card_module_css_default.chevron,
					children: "▾"
				})]
			}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: settings_card_module_css_default.body,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: settings_card_module_css_default.notExposed,
					role: "status",
					children: t("notExposed")
				})
			}) : null]
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
			className: settings_card_module_css_default.card,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: settings_card_module_css_default.header,
				"aria-expanded": open,
				"aria-label": `${t(open ? "collapse" : "expand")}: ${title}`,
				onClick: () => {
					setOpen(!open);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.headText,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.name,
							children: title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.description,
							children: t("cardDescription")
						})]
					}),
					state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.pending,
						children: t("unsaved")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: open ? settings_card_module_css_default.chevronOpen : settings_card_module_css_default.chevron,
						children: "▾"
					})
				]
			}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: settings_card_module_css_default.body,
				children: [
					!state.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: settings_card_module_css_default.readOnly,
						role: "status",
						children: t("readOnly")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-apikey",
						label: t("fieldApiKey"),
						hint: keySet ? t("apiKeySet") : t("fieldApiKeyHelp"),
						placeholder: "sk-…",
						secret: true,
						...fieldProps,
						...state.apiKey,
						overridden: false,
						onEdit: (text) => {
							props.edit("apiKey", text);
						},
						onReset: () => {
							props.resetField("apiKey");
						},
						clearLabel: t("apiKeyClear"),
						onClear: () => {
							props.resetField("apiKey");
						},
						canClear: keySet
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-apiurl",
						label: t("fieldApiUrl"),
						hint: t("fieldApiUrlHelp"),
						placeholder: "https://api.ephone.ai/v1",
						...fieldProps,
						...state.apiUrl,
						onEdit: (text) => {
							props.edit("apiUrl", text);
						},
						onReset: () => {
							props.resetField("apiUrl");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-model",
						label: t("fieldModel"),
						hint: t("fieldModelHelp"),
						placeholder: "gpt-image-2",
						...fieldProps,
						...state.model,
						onEdit: (text) => {
							props.edit("model", text);
						},
						onReset: () => {
							props.resetField("model");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-size",
						label: t("fieldSize"),
						hint: t("fieldSizeHelp"),
						placeholder: "auto",
						comboOptions: SIZE_OPTIONS,
						...fieldProps,
						...state.size,
						onEdit: (text) => {
							props.edit("size", text);
						},
						onReset: () => {
							props.resetField("size");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-quality",
						label: t("fieldQuality"),
						hint: state.quality_enabled.text === "true" ? t("fieldQualityHelp") : t("fieldGatedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.quality,
						checked: state.quality_enabled.text === "true",
						onChecked: (checked) => {
							props.edit("quality_enabled", checked ? "true" : "false");
						},
						...fieldProps,
						...state.quality,
						locked: state.quality_enabled.text !== "true",
						onEdit: (text) => {
							props.edit("quality", text);
						},
						onReset: () => {
							props.resetField("quality");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-output-format",
						label: t("fieldOutputFormat"),
						hint: state.output_format_enabled.text === "true" ? t("fieldOutputFormatHelp") : t("fieldUnsupportedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.output_format,
						checked: state.output_format_enabled.text === "true",
						onChecked: (checked) => {
							props.edit("output_format_enabled", checked ? "true" : "false");
						},
						...fieldProps,
						...state.output_format,
						locked: state.output_format_enabled.text !== "true",
						onEdit: (text) => {
							props.edit("output_format", text);
						},
						onReset: () => {
							props.resetField("output_format");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-background",
						label: t("fieldBackground"),
						hint: state.background_enabled.text === "true" ? t("fieldBackgroundHelp") : t("fieldGatedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.background,
						checked: state.background_enabled.text === "true",
						onChecked: (checked) => {
							props.edit("background_enabled", checked ? "true" : "false");
						},
						...fieldProps,
						...state.background,
						locked: state.background_enabled.text !== "true",
						onEdit: (text) => {
							props.edit("background", text);
						},
						onReset: () => {
							props.resetField("background");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-style",
						label: t("fieldStyle"),
						hint: state.style_enabled.text === "true" ? t("fieldStyleHelp") : t("fieldUnsupportedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.style,
						checked: state.style_enabled.text === "true",
						onChecked: (checked) => {
							props.edit("style_enabled", checked ? "true" : "false");
						},
						...fieldProps,
						...state.style,
						locked: state.style_enabled.text !== "true",
						onEdit: (text) => {
							props.edit("style", text);
						},
						onReset: () => {
							props.resetField("style");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-moderation",
						label: t("fieldModeration"),
						hint: state.moderation_enabled.text === "true" ? t("fieldModerationHelp") : t("fieldGatedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.moderation,
						checked: state.moderation_enabled.text === "true",
						onChecked: (checked) => {
							props.edit("moderation_enabled", checked ? "true" : "false");
						},
						...fieldProps,
						...state.moderation,
						locked: state.moderation_enabled.text !== "true",
						onEdit: (text) => {
							props.edit("moderation", text);
						},
						onReset: () => {
							props.resetField("moderation");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-watermark",
						label: t("fieldWatermark"),
						hint: state.watermark_enabled.text === "true" ? t("fieldWatermarkHelp") : t("fieldUnsupportedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.watermark,
						checked: state.watermark_enabled.text === "true",
						onChecked: (checked) => {
							props.edit("watermark_enabled", checked ? "true" : "false");
						},
						...fieldProps,
						...state.watermark,
						locked: state.watermark_enabled.text !== "true",
						onEdit: (text) => {
							props.edit("watermark", text);
						},
						onReset: () => {
							props.resetField("watermark");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-count",
						label: t("fieldCount"),
						hint: t("fieldCountHelp"),
						placeholder: "1",
						...fieldProps,
						...state.n,
						onEdit: (text) => {
							props.edit("n", text);
						},
						onReset: () => {
							props.resetField("n");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BooleanField, {
						id: "dsh-imagegen-settings-enabled",
						label: t("fieldEnabled"),
						hint: t("fieldEnabledHelp"),
						inheritLabel: t("inherit"),
						onLabel: t("on"),
						offLabel: t("off"),
						...fieldProps,
						...state.enabled,
						onEdit: (text) => {
							props.edit("enabled", text);
						},
						onReset: () => {
							props.resetField("enabled");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BooleanField, {
						id: "dsh-imagegen-settings-announce",
						label: t("fieldAnnounce"),
						hint: t("fieldAnnounceHelp"),
						inheritLabel: t("inherit"),
						onLabel: t("on"),
						offLabel: t("off"),
						...fieldProps,
						...state.announceToAgent,
						onEdit: (text) => {
							props.edit("announceToAgent", text);
						},
						onReset: () => {
							props.resetField("announceToAgent");
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: settings_card_module_css_default.footer,
						children: [
							state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: settings_card_module_css_default.failed,
								role: "status",
								children: t("failed")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: settings_card_module_css_default.discard,
								disabled: !state.dirty || state.saving,
								onClick: props.discard,
								children: t("discard")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: settings_card_module_css_default.save,
								disabled: blocked,
								onClick: props.save,
								children: t(!state.saving ? "save" : "saving")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StorageSection, {
						t,
						fetchFn: maintenance.fetchFn
					})
				]
			}) : null]
		});
	}
	/** A staged value field; `secret` renders a password control and
	*  `comboOptions` renders a self-drawn editable combo (input + option panel
	*  styled as part of the card — the native datalist popup looked detached
	*  from the card). Suggestions are hints only: any typed value is kept,
	*  the panel filters by substring, and the current draft is marked. */
	function ValueField(props) {
		const [open, setOpen] = (0, react.useState)(false);
		const [focusIndex, setFocusIndex] = (0, react.useState)(0);
		const comboRef = (0, react.useRef)(null);
		(0, react.useEffect)(() => {
			if (!open) return;
			const onDown = (event) => {
				if (event.target instanceof Node && comboRef.current?.contains(event.target) === false) setOpen(false);
			};
			const onKey = (event) => {
				if (event.key === "Escape") setOpen(false);
			};
			document.addEventListener("pointerdown", onDown);
			document.addEventListener("keydown", onKey);
			return () => {
				document.removeEventListener("pointerdown", onDown);
				document.removeEventListener("keydown", onKey);
			};
		}, [open]);
		const needle = props.text.trim().toLowerCase();
		const exactMatch = props.comboOptions !== void 0 && props.comboOptions.includes(props.text.trim());
		const matches = props.comboOptions !== void 0 ? exactMatch ? props.comboOptions : props.comboOptions.filter((option) => option.toLowerCase().includes(needle)) : [];
		(0, react.useEffect)(() => {
			setFocusIndex(0);
		}, [needle]);
		const combo = props.comboOptions !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: settings_card_module_css_default.combo,
			ref: comboRef,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					id: props.id,
					className: props.invalid ? settings_card_module_css_default.comboInputInvalid : settings_card_module_css_default.comboInput,
					type: "text",
					autoComplete: "off",
					role: "combobox",
					"aria-expanded": open,
					"aria-controls": `${props.id}-options`,
					"aria-activedescendant": open && matches[focusIndex] !== void 0 ? `${props.id}-option-${focusIndex}` : void 0,
					...props.invalid ? { "aria-invalid": true } : {},
					value: props.text,
					placeholder: props.placeholder ?? "",
					disabled: props.disabled || props.locked === true,
					onChange: (event) => {
						props.onEdit(event.target.value);
					},
					onClick: () => {
						if (!props.disabled && props.locked !== true && !open) setOpen(true);
					},
					onFocus: () => {
						if (!props.disabled && props.locked !== true && props.text.trim() !== "") setOpen(true);
					},
					onKeyDown: (event) => {
						if (event.key === "ArrowDown") {
							event.preventDefault();
							setOpen(true);
							setFocusIndex(Math.min(focusIndex + 1, Math.max(matches.length - 1, 0)));
						} else if (event.key === "ArrowUp") {
							event.preventDefault();
							setOpen(true);
							setFocusIndex(Math.max(focusIndex - 1, 0));
						} else if (event.key === "Enter" && open && matches[focusIndex] !== void 0) {
							event.preventDefault();
							props.onEdit(matches[focusIndex]);
							setOpen(false);
						}
					}
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: settings_card_module_css_default.comboToggle,
					"aria-label": props.comboAriaLabel,
					"aria-expanded": open,
					disabled: props.disabled || props.locked === true,
					onClick: () => {
						setOpen(!open);
					},
					children: "▾"
				}),
				open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: settings_card_module_css_default.comboPanel,
					id: `${props.id}-options`,
					role: "listbox",
					children: matches.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: settings_card_module_css_default.comboEmpty,
						children: props.comboEmptyLabel
					}) : matches.map((option, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						id: `${props.id}-option-${index}`,
						role: "option",
						"aria-selected": option === props.text.trim(),
						className: option === props.text.trim() ? `${settings_card_module_css_default.comboOption} ${settings_card_module_css_default.comboOptionSelected}` : settings_card_module_css_default.comboOption,
						onMouseEnter: () => {
							setFocusIndex(index);
						},
						onMouseDown: (event) => {
							event.preventDefault();
						},
						onClick: () => {
							props.onEdit(option);
							setOpen(false);
						},
						children: option
					}, option))
				}) : null
			]
		}) : null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: settings_card_module_css_default.field,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.head,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: settings_card_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}),
						props.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: settings_card_module_css_default.badges,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: settings_card_module_css_default.badge,
								children: props.overriddenLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: settings_card_module_css_default.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null,
						props.secret === true && props.canClear === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: settings_card_module_css_default.reset,
							disabled: props.disabled,
							onClick: props.onClear,
							children: props.clearLabel ?? props.resetLabel
						}) : null
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.comboRow,
					children: [props.checked !== void 0 && props.onChecked !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						className: settings_card_module_css_default.enableCheck,
						"aria-label": props.label,
						checked: props.checked,
						disabled: props.disabled,
						onChange: (event) => {
							props.onChecked(event.target.checked);
						}
					}) : null, combo ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: props.id,
						className: props.invalid ? settings_card_module_css_default.inputInvalid : settings_card_module_css_default.input,
						type: props.secret === true ? "password" : "text",
						autoComplete: props.secret === true ? "off" : void 0,
						...props.invalid ? { "aria-invalid": true } : {},
						value: props.text,
						placeholder: props.placeholder ?? "",
						disabled: props.disabled || props.locked === true,
						onChange: (event) => {
							props.onEdit(event.target.value);
						}
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: props.invalid ? settings_card_module_css_default.invalid : settings_card_module_css_default.hint,
					children: props.invalid ? props.invalidLabel : props.hint
				})
			]
		});
	}
	/** A staged boolean field: 继承 / 开 / 关. */
	function BooleanField(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: settings_card_module_css_default.field,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.head,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						className: settings_card_module_css_default.label,
						htmlFor: props.id,
						children: props.label
					}), props.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.badges,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.badge,
							children: props.overriddenLabel
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: settings_card_module_css_default.reset,
							disabled: props.disabled,
							onClick: props.onReset,
							children: props.resetLabel
						})]
					}) : null]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
					id: props.id,
					className: settings_card_module_css_default.select,
					value: props.text,
					disabled: props.disabled,
					onChange: (event) => {
						props.onEdit(event.target.value);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: "",
							children: props.inheritLabel
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: "true",
							children: props.onLabel
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: "false",
							children: props.offLabel
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: settings_card_module_css_default.hint,
					children: props.hint
				})
			]
		});
	}
	//#endregion
	//#region src/client/settings-scope.ts
	/**
	* Browser-side settings scope for the dsh-imagegen namespace, served by the
	* plugin's own loopback bridge routes (/api/dsh-tool-imagegen/settings). The
	* official rc.6 settings scope answers "unavailable" for every third-party
	* namespace (the host-apiproxy allowlist is hard-coded), so this package
	* re-serves its namespace through the host settings seam over a same-origin,
	* loopback-only HTTP pair — the same pattern the dsh-web-ui family bridge
	* uses, self-contained per plugin.
	*/
	/** Settings wire face over the bridge routes (fetch-backed). */
	function createBridgeApi(fetchFn) {
		const post = async (path, body) => {
			try {
				const response = await fetchFn(path, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body)
				});
				if (!response.ok) return { result: {
					ok: false,
					code: "internal",
					message: `bridge HTTP ${response.status}`
				} };
				return { result: await response.json() };
			} catch {
				return { result: {
					ok: false,
					code: "internal",
					message: "settings bridge unreachable"
				} };
			}
		};
		return { settings: {
			describe: async (payload) => post(SETTINGS_API.describe, payload),
			mutate: async (payload) => post(SETTINGS_API.mutate, payload)
		} };
	}
	/**
	* A SettingsScope over the bridge face: serialized queue, revision-fenced
	* writes, recovery read after a refusal. Mirrors the official controller's
	* ordering but trusts the Host-seam value without re-running the wire-schema
	* validation — the seam already validated it.
	*/
	var BridgeScopeController = class {
		api;
		spec;
		store;
		/** Whether the namespace currently holds a stored secret (e.g. apiKey). */
		keySet;
		tail = Promise.resolve();
		disposed = false;
		constructor(api, spec) {
			this.api = api;
			this.spec = spec;
			this.store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)({
				status: "loading",
				value: void 0,
				base: void 0,
				user: void 0,
				revision: void 0,
				writable: false,
				mode: "host"
			});
			this.keySet = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(false);
		}
		getSnapshot() {
			return this.store.getSnapshot();
		}
		/** Whether a stored secret exists (from the redacted view's secrets list). */
		getKeySetSnapshot() {
			return this.keySet.getSnapshot();
		}
		/** Observe the secret-set flag. */
		subscribeKeySet(listener) {
			return this.keySet.subscribe(listener);
		}
		subscribe(listener) {
			return this.store.subscribe(listener);
		}
		/** Queue a bridge refresh. */
		load() {
			return this.enqueue(() => this.read());
		}
		set(field, value) {
			return this.enqueue(() => this.write({
				op: "set",
				path: [field],
				value
			}));
		}
		unset(field) {
			return this.enqueue(() => this.write({
				op: "unset",
				path: [field]
			}));
		}
		async dispose() {
			this.disposed = true;
			await this.tail;
		}
		enqueue(operation) {
			if (this.disposed) return Promise.resolve();
			const task = this.tail.then(async () => {
				if (this.disposed) return;
				await operation();
			});
			this.tail = task.catch(() => {});
			return task;
		}
		async read() {
			let response;
			try {
				response = await this.api.describe({});
			} catch {
				if (!this.disposed) this.store.update((draft) => {
					draft.status = "unavailable";
				});
				return;
			}
			if (!response.result.ok || this.disposed) {
				if (!this.disposed) this.store.update((draft) => {
					draft.status = "unavailable";
				});
				return;
			}
			const { namespaces, writable } = response.result.value;
			const view = namespaces?.find((candidate) => candidate.ns === this.spec.namespace);
			if (view === void 0) {
				this.store.update((draft) => {
					draft.status = "unavailable";
					draft.writable = writable === true;
				});
				this.keySet.set(false);
				return;
			}
			this.accept(view, writable);
		}
		async write(op) {
			const revision = this.getSnapshot().revision;
			let response;
			try {
				response = await this.api.mutate({
					ns: this.spec.namespace,
					ops: [op],
					...revision === void 0 ? {} : { expectedRevision: revision }
				});
			} catch {
				await this.read();
				return;
			}
			if (!response.result.ok || this.disposed) {
				await this.read();
				return;
			}
			this.accept(response.result.value, void 0);
		}
		accept(view, writable) {
			this.store.update((draft) => {
				draft.revision = view.revision;
				draft.base = view.base;
				draft.user = view.user;
				if (writable !== void 0) draft.writable = writable;
				draft.status = "ready";
				draft.value = view.value;
			});
			this.keySet.set(Array.isArray(view.secrets) && view.secrets.some((secret) => secret.set));
		}
	};
	/**
	* Bind the dsh-imagegen settings scope over the bridge routes and start its
	* initial read (the caller mounts nothing until the scope settles).
	* @param fetchFn - the fetch implementation (the global fetch on loopback).
	* @returns the scope; unavailable when the bridge is unreachable.
	*/
	function bindImageGenScope(fetchFn = fetch) {
		const controller = new BridgeScopeController(createBridgeApi(fetchFn).settings, { namespace: "dsh-imagegen" });
		controller.load();
		return controller;
	}
	//#endregion
	//#region /0cssm:src/client/generate-image-view.module.css.js
	const css$2 = "/**\r\n * dsh-tool-imagegen inline conversation view. Mirrors the platform tool-row\r\n * chrome so generated images read as a sibling of the bash/read/search rows,\r\n * riding the dsh --dsw-* tokens.\r\n */\r\n\r\n.dsh-tig_root_lw9tw4 {\r\n  display: flex;\r\n  flex-direction: column;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 12px;\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  overflow: hidden;\r\n}\r\n\r\n.dsh-tig_head_lw9tw4 {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  min-width: 0;\r\n  height: 40px;\r\n  padding: 0 14px;\r\n  border-bottom: 1px solid var(--dsw-alias-border-l2);\r\n}\r\n\r\n.dsh-tig_title_lw9tw4 {\r\n  color: var(--dsw-alias-label-secondary);\r\n  flex: none;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  line-height: 24px;\r\n}\r\n\r\n.dsh-tig_meta_lw9tw4 {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  flex: auto;\r\n  min-width: 0;\r\n  font-size: 12px;\r\n  line-height: 24px;\r\n  white-space: nowrap;\r\n  text-overflow: ellipsis;\r\n  overflow: hidden;\r\n}\r\n\r\n.dsh-tig_state_lw9tw4 {\r\n  color: var(--dsw-alias-state-error-primary);\r\n  flex: none;\r\n  font-size: 12px;\r\n  line-height: 24px;\r\n}\r\n\r\n.dsh-tig_body_lw9tw4 {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 14px;\r\n  padding: 14px;\r\n}\r\n\r\n.dsh-tig_image_lw9tw4 {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 6px;\r\n  min-width: 0;\r\n}\r\n\r\n.dsh-tig_frame_lw9tw4 {\r\n  position: relative;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 10px;\r\n  background: var(--dsw-alias-bg-layer-2);\r\n  overflow: hidden;\r\n}\r\n\r\n.dsh-tig_img_lw9tw4 {\r\n  display: block;\r\n  max-width: 100%;\r\n  max-height: 480px;\r\n  margin: 0 auto;\r\n}\r\n\r\n/* Action cluster (view / download / open) over the image corner, revealed on\r\n   hover or focus like the platform's own image overlays. */\r\n.dsh-tig_actions_lw9tw4 {\r\n  position: absolute;\r\n  right: 10px;\r\n  bottom: 10px;\r\n  display: flex;\r\n  gap: 6px;\r\n  opacity: 0;\r\n  transition: opacity 0.15s ease;\r\n}\r\n\r\n.dsh-tig_frame_lw9tw4:hover .dsh-tig_actions_lw9tw4,\r\n.dsh-tig_frame_lw9tw4:focus-within .dsh-tig_actions_lw9tw4 {\r\n  opacity: 1;\r\n}\r\n\r\n.dsh-tig_action_lw9tw4 {\r\n  padding: 4px 10px;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 6px;\r\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-3) 86%, transparent);\r\n  color: var(--dsw-alias-label-secondary);\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n  font-family: inherit;\r\n}\r\n\r\n.dsh-tig_action_lw9tw4:hover:not(:disabled) {\r\n  color: var(--dsw-alias-label-primary);\r\n  border-color: var(--dsw-alias-border-l1);\r\n}\r\n\r\n.dsh-tig_action_lw9tw4:disabled {\r\n  opacity: 0.6;\r\n  cursor: default;\r\n}\r\n\r\n/* Fullscreen image viewer overlay. */\r\n.dsh-tig_viewer_lw9tw4 {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 1000;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: rgb(0 0 0 / 72%);\r\n}\r\n\r\n.dsh-tig_viewerImg_lw9tw4 {\r\n  max-width: 92vw;\r\n  max-height: 92vh;\r\n  border-radius: 8px;\r\n  box-shadow: 0 12px 48px rgb(0 0 0 / 55%);\r\n}\r\n\r\n.dsh-tig_viewerClose_lw9tw4 {\r\n  position: absolute;\r\n  top: 14px;\r\n  right: 18px;\r\n  width: 36px;\r\n  height: 36px;\r\n  border: 1px solid rgb(255 255 255 / 28%);\r\n  border-radius: 50%;\r\n  background: rgb(0 0 0 / 45%);\r\n  color: var(--dsw-alias-label-primary, #fff);\r\n  font-size: 16px;\r\n  line-height: 1;\r\n  cursor: pointer;\r\n}\r\n\r\n.dsh-tig_viewerClose_lw9tw4:hover {\r\n  background: rgb(0 0 0 / 65%);\r\n}\r\n\r\n.dsh-tig_caption_lw9tw4 {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n  min-width: 0;\r\n}\r\n\r\n.dsh-tig_captionLine_lw9tw4 {\r\n  margin: 0;\r\n  font-size: 12px;\r\n  line-height: 1.5;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  white-space: nowrap;\r\n  text-overflow: ellipsis;\r\n  overflow: hidden;\r\n}\r\n\r\n.dsh-tig_captionPrompt_lw9tw4 {\r\n  color: var(--dsw-alias-label-secondary);\r\n}\r\n\r\n.dsh-tig_actionError_lw9tw4 {\r\n  color: var(--dsw-alias-state-error-primary);\r\n}\r\n\r\n.dsh-tig_editReady_lw9tw4 {\r\n  color: var(--dsw-alias-state-success-primary);\r\n}\r\n\r\n/* --- running / loading / error states ---------------------------------------- */\r\n\r\n.dsh-tig_running_lw9tw4 {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  min-height: 40px;\r\n  padding: 10px 14px;\r\n  color: var(--dsw-alias-label-secondary);\r\n  font-size: 13px;\r\n  line-height: 20px;\r\n}\r\n\r\n.dsh-tig_spinner_lw9tw4 {\r\n  flex: none;\r\n  width: 14px;\r\n  height: 14px;\r\n  border: 2px solid var(--dsw-alias-border-l2);\r\n  border-top-color: var(--dsw-alias-label-tertiary);\r\n  border-radius: 50%;\r\n  animation: dsh-tool-imagegen-spin 0.8s linear infinite;\r\n}\r\n\r\n@keyframes dsh-tool-imagegen-spin {\r\n  to { transform: rotate(360deg); }\r\n}\r\n\r\n.dsh-tig_loading_lw9tw4 {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  min-height: 120px;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  font-size: 12px;\r\n  line-height: 20px;\r\n}\r\n\r\n.dsh-tig_loadFailed_lw9tw4 {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  min-height: 120px;\r\n  padding: 0 14px;\r\n  color: var(--dsw-alias-state-error-primary);\r\n  font-size: 12px;\r\n  line-height: 20px;\r\n  text-align: center;\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) {\r\n  .dsh-tig_spinner_lw9tw4 {\r\n    animation: none;\r\n  }\r\n}\r\n";
	const tagId$2 = "@local/dsh-tool-imagegen/src/client/generate-image-view.module.css";
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
		const tag = document.createElement("style");
		tag.dataset.pluginCss = tagId$2;
		tag.textContent = css$2;
		document.head.appendChild(tag);
	}
	var generate_image_view_module_css_default = {
		"root": "dsh-tig_root_lw9tw4",
		"head": "dsh-tig_head_lw9tw4",
		"title": "dsh-tig_title_lw9tw4",
		"meta": "dsh-tig_meta_lw9tw4",
		"state": "dsh-tig_state_lw9tw4",
		"body": "dsh-tig_body_lw9tw4",
		"image": "dsh-tig_image_lw9tw4",
		"frame": "dsh-tig_frame_lw9tw4",
		"img": "dsh-tig_img_lw9tw4",
		"actions": "dsh-tig_actions_lw9tw4",
		"action": "dsh-tig_action_lw9tw4",
		"viewer": "dsh-tig_viewer_lw9tw4",
		"viewerImg": "dsh-tig_viewerImg_lw9tw4",
		"viewerClose": "dsh-tig_viewerClose_lw9tw4",
		"caption": "dsh-tig_caption_lw9tw4",
		"captionLine": "dsh-tig_captionLine_lw9tw4",
		"captionPrompt": "dsh-tig_captionPrompt_lw9tw4",
		"actionError": "dsh-tig_actionError_lw9tw4",
		"editReady": "dsh-tig_editReady_lw9tw4",
		"running": "dsh-tig_running_lw9tw4",
		"spinner": "dsh-tig_spinner_lw9tw4",
		"loading": "dsh-tig_loading_lw9tw4",
		"loadFailed": "dsh-tig_loadFailed_lw9tw4"
	};
	//#endregion
	//#region src/client/GenerateImageView.tsx
	/**
	* The inline conversation view for the `generate_image` tool, registered as the
	* keyed `tool.call.toolview` entry for that tool name. Because the entry is
	* keyed, it REPLACES the generic tool row for generate_image calls — so this
	* view must cover running, settled, and error states itself.
	*
	* The model never sees an `image` block from this tool (the render() output is
	* `generated-image` blocks, which the image-capability check ignores), so this
	* view is the ONLY place the pictures surface: it resolves each durable
	* attachment to a browser URL through the conversation service and renders
	* `<img>` inline.
	*/
	/** Narrow the settled content to this plugin's generated-image blocks. */
	function generatedImageBlocks(content) {
		return content.filter((block) => block !== null && typeof block === "object" && "type" in block && block.type === "generated-image");
	}
	/** Text blocks in the settled content (used as the error/summary envelope). */
	function textBlocks(content) {
		return content.filter((block) => block !== null && typeof block === "object" && "type" in block && block.type === "text" && typeof block.text === "string").map((block) => block.text);
	}
	/** Parse the running call's argsRaw for a readable prompt (best effort). */
	function promptFromArgs(argsRaw) {
		if (argsRaw === "") return void 0;
		try {
			const parsed = JSON.parse(argsRaw);
			return typeof parsed.prompt === "string" && parsed.prompt !== "" ? parsed.prompt : void 0;
		} catch {
			return;
		}
	}
	/**
	* Render the generate_image call inline.
	* @param props - the tool call's owner share, the locale seat, and loadImage.
	* @returns the inline card.
	*/
	function GenerateImageView(props) {
		const { t, block } = props;
		const settled = "content" in block;
		const images = settled ? generatedImageBlocks(block.content) : [];
		const isError = settled && "isError" in block && block.isError === true;
		const [viewing, setViewing] = (0, react.useState)(void 0);
		const runningPrompt = settled ? void 0 : promptFromArgs(block.argsRaw);
		const captionMeta = (image) => {
			const parts = [];
			if (typeof image.model === "string" && image.model !== "") parts.push(image.model);
			if (typeof image.size === "string" && image.size !== "") parts.push(image.size);
			return parts.join(" · ");
		};
		if (!settled) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: generate_image_view_module_css_default.root,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: generate_image_view_module_css_default.head,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: generate_image_view_module_css_default.title,
					children: t("toolviewTitle")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: generate_image_view_module_css_default.meta,
					children: runningPrompt ?? ""
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: generate_image_view_module_css_default.running,
				role: "status",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: generate_image_view_module_css_default.spinner,
					"aria-hidden": true
				}), t("toolviewRunning")]
			})]
		});
		if (images.length === 0) {
			const envelope = textBlocks(block.content).join("\n");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: generate_image_view_module_css_default.root,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: generate_image_view_module_css_default.head,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: generate_image_view_module_css_default.title,
						children: t("toolviewTitle")
					}), isError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: generate_image_view_module_css_default.state,
						children: t("toolviewFailed")
					}) : null]
				}), envelope !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: generate_image_view_module_css_default.running,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: generate_image_view_module_css_default.captionPrompt,
						children: envelope
					})
				}) : null]
			});
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: generate_image_view_module_css_default.root,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: generate_image_view_module_css_default.head,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: generate_image_view_module_css_default.title,
							children: t("toolviewTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: generate_image_view_module_css_default.meta,
							children: [images.length > 1 ? `${images.length} · ` : "", captionMeta(images[0])]
						}),
						isError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: generate_image_view_module_css_default.state,
							children: t("toolviewFailed")
						}) : null
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: generate_image_view_module_css_default.body,
					children: images.map((image, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImageRow, {
						image,
						loadImage: props.loadImage,
						openLocally: props.openLocally,
						stageEdit: props.stageEdit,
						onView: (url, name) => setViewing({
							url,
							name
						}),
						t: props.t,
						index
					}, image.attachment.attachmentId ?? `generated-${index}`))
				}),
				viewing !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FullscreenViewer, {
					url: viewing.url,
					name: viewing.name,
					onClose: () => setViewing(void 0)
				}) : null
			]
		});
	}
	/** Fullscreen image overlay: dark backdrop, Esc / backdrop-click closes. */
	function FullscreenViewer(props) {
		const { url, name, onClose } = props;
		(0, react.useEffect)(() => {
			const onKey = (event) => {
				if (event.key === "Escape") onClose();
			};
			window.addEventListener("keydown", onKey);
			return () => window.removeEventListener("keydown", onKey);
		}, [onClose]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: generate_image_view_module_css_default.viewer,
			role: "dialog",
			"aria-label": name,
			onClick: onClose,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: generate_image_view_module_css_default.viewerClose,
				"aria-label": "close",
				onClick: onClose,
				children: "✕"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				className: generate_image_view_module_css_default.viewerImg,
				src: url,
				alt: name,
				onClick: (event) => event.stopPropagation()
			})]
		});
	}
	/** A usable file name for one generated image (attachment name or fallback). */
	function fileNameOf(image, index) {
		const name = image.attachment.name;
		if (typeof name === "string" && name !== "") return name;
		const extension = (() => {
			switch (image.attachment.mediaType) {
				case "image/jpeg": return "jpg";
				case "image/webp": return "webp";
				case "image/gif": return "gif";
				default: return "png";
			}
		})();
		return `generated-${index + 1}.${extension}`;
	}
	/** One generated image: resolve its URL, then render the frame + caption. */
	function ImageRow(props) {
		const { image, loadImage, openLocally, stageEdit, onView, t, index } = props;
		const [url, setUrl] = (0, react.useState)(void 0);
		const [failed, setFailed] = (0, react.useState)(void 0);
		const [openState, setOpenState] = (0, react.useState)("idle");
		const [openError, setOpenError] = (0, react.useState)(void 0);
		const [editState, setEditState] = (0, react.useState)("idle");
		const [editError, setEditError] = (0, react.useState)(void 0);
		(0, react.useEffect)(() => {
			let alive = true;
			loadImage(image.attachment).then((resolved) => {
				if (alive) setUrl(resolved);
			}).catch((error) => {
				if (!alive) return;
				setFailed(error instanceof Error ? error.message : String(error));
			});
			return () => {
				alive = false;
			};
		}, [loadImage, image.attachment]);
		const handleOpen = () => {
			if (openState === "opening") return;
			setOpenState("opening");
			setOpenError(void 0);
			openLocally(image.attachment).then(() => setOpenState("idle")).catch((error) => {
				setOpenState("failed");
				setOpenError(error instanceof Error ? error.message : String(error));
			});
		};
		const handleEdit = () => {
			if (editState === "staging") return;
			setEditState("staging");
			setEditError(void 0);
			stageEdit(image.attachment).then(() => setEditState("staged")).catch((error) => {
				setEditState("failed");
				setEditError(error instanceof Error ? error.message : String(error));
			});
		};
		const meta = (() => {
			const parts = [];
			if (typeof image.model === "string" && image.model !== "") parts.push(`${image.model}`);
			if (typeof image.size === "string" && image.size !== "") parts.push(image.size);
			return parts.join(" · ");
		})();
		const name = fileNameOf(image, index);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: generate_image_view_module_css_default.image,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: generate_image_view_module_css_default.frame,
				children: url !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
					className: generate_image_view_module_css_default.img,
					src: url,
					alt: image.prompt,
					loading: "lazy"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: generate_image_view_module_css_default.actions,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: generate_image_view_module_css_default.action,
							onClick: () => onView(url, name),
							title: t("toolviewView"),
							children: t("toolviewView")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: generate_image_view_module_css_default.action,
							onClick: handleEdit,
							disabled: editState === "staging",
							title: t("toolviewEdit"),
							children: editState === "staging" ? t("toolviewEditing") : t("toolviewEdit")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							className: generate_image_view_module_css_default.action,
							href: url,
							download: name,
							title: t("toolviewDownload"),
							children: t("toolviewDownload")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: generate_image_view_module_css_default.action,
							onClick: handleOpen,
							disabled: openState === "opening",
							title: t("toolviewOpen"),
							children: openState === "opening" ? t("toolviewOpening") : t("toolviewOpen")
						})
					]
				})] }) : failed !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: generate_image_view_module_css_default.loadFailed,
					role: "status",
					children: failed
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: generate_image_view_module_css_default.loading })
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: generate_image_view_module_css_default.caption,
				children: [
					meta !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: generate_image_view_module_css_default.captionLine,
						children: meta
					}) : null,
					image.prompt !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: `${generate_image_view_module_css_default.captionLine} ${generate_image_view_module_css_default.captionPrompt}`,
						children: image.prompt
					}) : null,
					editState === "staged" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: `${generate_image_view_module_css_default.captionLine} ${generate_image_view_module_css_default.editReady}`,
						children: t("toolviewEditReady")
					}) : null,
					editState === "failed" && editError !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: `${generate_image_view_module_css_default.captionLine} ${generate_image_view_module_css_default.actionError}`,
						children: [
							t("toolviewEditFailed"),
							"：",
							editError
						]
					}) : null,
					openState === "failed" && openError !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: `${generate_image_view_module_css_default.captionLine} ${generate_image_view_module_css_default.actionError}`,
						children: [
							t("toolviewOpenFailed"),
							"：",
							openError
						]
					}) : null
				]
			})]
		});
	}
	//#endregion
	//#region src/client/pending-upload.ts
	const drafts = /* @__PURE__ */ new Map();
	const failures = /* @__PURE__ */ new Map();
	const draftListeners = /* @__PURE__ */ new Map();
	const failureListeners = /* @__PURE__ */ new Map();
	function notify(listeners, sessionId) {
		const set = listeners.get(sessionId);
		if (set === void 0) return;
		for (const listener of [...set]) listener();
	}
	/** The pending upload for one session, or undefined when none is held. */
	function getPending(sessionId) {
		return drafts.get(sessionId);
	}
	/** Replace (or clear, when undefined) the pending upload for one session. */
	function setPending(sessionId, draft) {
		if (draft === void 0) drafts.delete(sessionId);
		else drafts.set(sessionId, draft);
		notify(draftListeners, sessionId);
	}
	/** The last send-time upload failure for one session (clear with undefined). */
	function getPendingFailure(sessionId) {
		return failures.get(sessionId);
	}
	/** Record (or clear, when undefined) the send-time upload failure for one session. */
	function setPendingFailure(sessionId, message) {
		if (message === void 0) failures.delete(sessionId);
		else failures.set(sessionId, message);
		notify(failureListeners, sessionId);
	}
	/** Subscribe to pending-upload changes for one session. */
	function subscribePending(sessionId, listener) {
		let set = draftListeners.get(sessionId);
		if (set === void 0) {
			set = /* @__PURE__ */ new Set();
			draftListeners.set(sessionId, set);
		}
		set.add(listener);
		return () => {
			set.delete(listener);
			if (set.size === 0) draftListeners.delete(sessionId);
		};
	}
	/** Subscribe to send-time upload failure changes for one session. */
	function subscribePendingFailure(sessionId, listener) {
		let set = failureListeners.get(sessionId);
		if (set === void 0) {
			set = /* @__PURE__ */ new Set();
			failureListeners.set(sessionId, set);
		}
		set.add(listener);
		return () => {
			set.delete(listener);
			if (set.size === 0) failureListeners.delete(sessionId);
		};
	}
	//#endregion
	//#region /0cssm:src/client/upload-button.module.css.js
	const css$1 = "/**\r\n * Composer tool-row seat for the text-model upload button. Sits at the left\r\n * end of the tool row inside the composer card, beside the resident chrome\r\n * (access mode / plan / attach) — one compact always-visible control. Uses the\r\n * platform's own alias tokens so it reads as part of the bar.\r\n */\r\n\r\n.dsh-tig_wrap_1apho69 {\r\n  position: relative;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.dsh-tig_button_1apho69 {\r\n  height: 28px;\r\n  min-width: 68px;\r\n  padding: 0 10px;\r\n  border: none;\r\n  border-radius: 14px;\r\n  background: transparent;\r\n  color: var(--dsw-alias-label-secondary);\r\n  font-size: 13px;\r\n  line-height: 24px;\r\n  cursor: pointer;\r\n  white-space: nowrap;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\n\r\n.dsh-tig_button_1apho69:hover:not(:disabled) {\r\n  background: var(--dsw-alias-interactive-bg-hover);\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n\r\n.dsh-tig_button_1apho69:disabled {\r\n  cursor: default;\r\n  opacity: 0.7;\r\n}\r\n\r\n.dsh-tig_button_1apho69[data-state='done'] {\r\n  color: var(--dsw-alias-state-success-primary, var(--dsw-static-deepseek-500));\r\n}\r\n\r\n/* Pending-draft chip: the picked image waits for the user's message, then the\r\n * send submits it together with the typed text. */\r\n.dsh-tig_selected_1apho69 {\r\n  height: 28px;\r\n  max-width: 220px;\r\n  padding: 0 4px 0 10px;\r\n  border-radius: 14px;\r\n  background: var(--dsw-alias-interactive-bg-hover);\r\n  color: var(--dsw-alias-label-secondary);\r\n  font-size: 13px;\r\n  line-height: 24px;\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n}\r\n\r\n.dsh-tig_selected_1apho69:hover {\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n\r\n.dsh-tig_remove_1apho69 {\r\n  flex: none;\r\n  width: 20px;\r\n  height: 20px;\r\n  border: none;\r\n  border-radius: 10px;\r\n  background: transparent;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  font-size: 12px;\r\n  line-height: 20px;\r\n  cursor: pointer;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\n\r\n.dsh-tig_remove_1apho69:hover {\r\n  color: var(--dsw-alias-label-primary);\r\n  background: var(--dsw-alias-interactive-bg-hover);\r\n}\r\n\r\n.dsh-tig_hidden_1apho69 {\r\n  display: none;\r\n}\r\n\r\n/* Floating failure note below the row (the tool row is one line tall). */\r\n.dsh-tig_error_1apho69 {\r\n  position: absolute;\r\n  top: calc(100% + 6px);\r\n  left: 0;\r\n  z-index: 10;\r\n  max-width: 260px;\r\n  background: var(--dsw-specific-bubble);\r\n  color: var(--dsw-alias-state-error-primary);\r\n  border-radius: 8px;\r\n  padding: 6px 10px;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  box-shadow: var(--dsw-shadow-lv2);\r\n}\r\n";
	const tagId$1 = "@local/dsh-tool-imagegen/src/client/upload-button.module.css";
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
		const tag = document.createElement("style");
		tag.dataset.pluginCss = tagId$1;
		tag.textContent = css$1;
		document.head.appendChild(tag);
	}
	var upload_button_module_css_default = {
		"wrap": "dsh-tig_wrap_1apho69",
		"button": "dsh-tig_button_1apho69",
		"selected": "dsh-tig_selected_1apho69",
		"remove": "dsh-tig_remove_1apho69",
		"hidden": "dsh-tig_hidden_1apho69",
		"error": "dsh-tig_error_1apho69"
	};
	//#endregion
	//#region src/client/UploadButton.tsx
	/**
	* The composer tool-row upload button for TEXT-ONLY sessions, registered into
	* `conversation.input.left` (the left end of the tool row inside the composer
	* card — a small always-visible control).
	*
	* Why this exists: the platform's native composer upload is hard-rejected for
	* text-only models (apiproxy answers MODEL_DOES_NOT_SUPPORT_IMAGES for any
	* prompt whose content carries an `image` block), so this plugin offers its own
	* entry. The pick-file button is shown ONLY when the session's current model
	* cannot take images — capability is resolved host-side through the CAPABILITY
	* bridge, fed by the client's own session.models RPC (the catalog carries no
	* modality info). Image-capable sessions get no pick button: the native upload
	* works there and the model sees the picture itself.
	*
	* Picking a file does NOT submit anything: the bytes are held as a per-session
	* pending draft (see pending-upload.ts). When the user types a message and
	* sends, the conversation sendSession wrapper (see index.ts) consumes the
	* draft — POSTing it to the UPLOAD bridge together with the typed text, so the
	* host enqueues ONE user message ([uploaded-image] block + model-facing
	* envelope carrying the text). The picture renders inline in the conversation
	* while the text-only model only ever sees the envelope telling it the
	* work-dir path to feed back through generate_image's `image` parameter.
	*
	* The pending-draft "selected" chip renders for ANY session holding a draft —
	* including image-capable ones, where the pick button itself is hidden: the
	* generated-image toolview's 修改 button (stageEdit) writes the same store, so
	* edit references stay visible in the composer for both model kinds.
	*/
	/** Accepted image media types (mirrored from the host attachment limits). */
	const ACCEPT_TYPES = [
		"image/png",
		"image/jpeg",
		"image/webp",
		"image/gif"
	];
	/** Per-upload byte cap (the host attachment service's maxImageBytes). */
	const MAX_BYTES = 5242880;
	/** Read a File as a base64 data URL (best-effort; callers re-validate). */
	function readAsDataUrl(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
			reader.onerror = () => reject(/* @__PURE__ */ new Error("file read failed"));
			reader.readAsDataURL(file);
		});
	}
	/**
	* Render the text-model upload button, or nothing for image-capable sessions.
	* @param props - the input-left owner share + standard seats (sessionId) + face.
	* @returns the button cell (empty for capable/unknown sessions).
	*/
	function UploadButton(props) {
		const { t, sessionId, fetchFn, connection } = props;
		const inputRef = (0, react.useRef)(null);
		const [capable, setCapable] = (0, react.useState)(void 0);
		const draft = (0, react.useSyncExternalStore)((0, react.useCallback)((listener) => subscribePending(sessionId, listener), [sessionId]), (0, react.useCallback)(() => getPending(sessionId), [sessionId]));
		const failure = (0, react.useSyncExternalStore)((0, react.useCallback)((listener) => subscribePendingFailure(sessionId, listener), [sessionId]), (0, react.useCallback)(() => getPendingFailure(sessionId), [sessionId]));
		(0, react.useEffect)(() => {
			let alive = true;
			const check = async () => {
				let provider = "";
				let model = "";
				try {
					const { result } = await connection.api.sessions.models({ sessionId });
					const current = result?.ok === true ? result.value?.current : void 0;
					provider = typeof current?.provider === "string" ? current.provider : "";
					model = typeof current?.model === "string" ? current.model : "";
				} catch {}
				if (provider === "" || model === "") {
					if (alive) setCapable(true);
					return;
				}
				try {
					const body = await (await fetchFn(CAPABILITY_API.path, {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							sessionId,
							provider,
							model
						})
					})).json();
					if (alive) setCapable(body.ok === true ? body.imageCapable === true : true);
				} catch {
					if (alive) setCapable(true);
				}
			};
			check();
			return () => {
				alive = false;
			};
		}, [
			sessionId,
			connection,
			fetchFn
		]);
		const onPick = (0, react.useCallback)(async (file) => {
			if (ACCEPT_TYPES.includes(file.type) === false) {
				setPendingFailure(sessionId, t("uploadTypeRejected"));
				return;
			}
			if (file.size > MAX_BYTES) {
				setPendingFailure(sessionId, t("uploadTooLarge"));
				return;
			}
			try {
				const dataUrl = await readAsDataUrl(file);
				const comma = dataUrl.indexOf(",");
				const data = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
				setPending(sessionId, {
					mediaType: file.type,
					data,
					name: file.name
				});
				setPendingFailure(sessionId, void 0);
			} catch (pickError) {
				setPendingFailure(sessionId, pickError instanceof Error && pickError.message !== "" ? pickError.message : t("uploadFailed"));
			}
			if (inputRef.current !== null) inputRef.current.value = "";
		}, [sessionId, t]);
		if (draft !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: upload_button_module_css_default.wrap,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: upload_button_module_css_default.selected,
				title: t("uploadHelp"),
				children: [t("uploadSelected"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: upload_button_module_css_default.remove,
					onClick: () => {
						setPending(sessionId, void 0);
						setPendingFailure(sessionId, void 0);
					},
					"aria-label": t("uploadRemove"),
					children: "✕"
				})]
			}), failure !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: upload_button_module_css_default.error,
				role: "status",
				children: failure
			}) : null]
		});
		if (capable !== false) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: upload_button_module_css_default.wrap,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: upload_button_module_css_default.button,
					onClick: () => inputRef.current?.click(),
					title: t("uploadHelp"),
					"aria-label": t("uploadTitle"),
					children: t("uploadTitle")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					className: upload_button_module_css_default.hidden,
					accept: ACCEPT_TYPES.join(","),
					onChange: (event) => {
						const file = event.target.files?.[0];
						if (file !== void 0) onPick(file);
					}
				}),
				failure !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: upload_button_module_css_default.error,
					role: "status",
					children: failure
				}) : null
			]
		});
	}
	//#endregion
	//#region /0cssm:src/client/uploaded-image-bubble.module.css.js
	const css = "/**\r\n * Faithful replica of the shipped user-message bubble chrome (captured from\r\n * the platform's MessageItem stylesheet), used by this plugin's shadowed\r\n * `user` node renderer. Registering the `user` key at a lower priority makes\r\n * this view render EVERY user message, so the rules must look native: same\r\n * row/stack/bubble tokens, same hover-revealed clock, same copy action.\r\n */\r\n\r\n.dsh-tig_userRow_x0891e {\r\n  flex-direction: column;\r\n  align-items: flex-end;\r\n  gap: 6px;\r\n  display: flex;\r\n}\r\n\r\n.dsh-tig_userStack_x0891e {\r\n  flex-direction: column;\r\n  align-items: flex-end;\r\n  gap: 8px;\r\n  min-width: 0;\r\n  max-width: min(525px, 82%);\r\n  display: flex;\r\n}\r\n\r\n.dsh-tig_bubble_x0891e {\r\n  background: var(--dsw-specific-bubble);\r\n  max-width: 100%;\r\n  color: var(--dsw-alias-label-primary);\r\n  border-radius: 22px;\r\n  padding: 10px 16px;\r\n  font-size: 16px;\r\n  line-height: 24px;\r\n}\r\n\r\n/* Decorated /name and @name tokens inside the bubble text. */\r\n.dsh-tig_refChip_x0891e {\r\n  color: var(--dsw-alias-label-primary);\r\n  white-space: nowrap;\r\n  vertical-align: baseline;\r\n  background: #6187d838;\r\n  border-radius: 6px;\r\n  margin: 0 2px;\r\n  padding: 0 8px;\r\n  font-size: 0.85em;\r\n  line-height: 1.6;\r\n  display: inline-block;\r\n}\r\n\r\n/* Hover actions column: clock (hover-revealed) + copy button. */\r\n.dsh-tig_actions_x0891e {\r\n  flex: none;\r\n  align-items: center;\r\n  gap: 10px;\r\n  height: 28px;\r\n  display: flex;\r\n}\r\n\r\n.dsh-tig_action_x0891e {\r\n  width: 28px;\r\n  height: 28px;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  cursor: pointer;\r\n  background: 0 0;\r\n  border: none;\r\n  border-radius: 28px;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 6px;\r\n  display: inline-flex;\r\n}\r\n\r\n.dsh-tig_action_x0891e:hover {\r\n  color: var(--dsw-alias-label-primary);\r\n  background: var(--dsw-alias-interactive-bg-hover);\r\n}\r\n\r\n/* Same hover-reveal as the shipped row (its selector targets its own scoped\r\n * classes; ours is scoped per build, so the rule is re-declared here). */\r\n.dsh-tig_timeStart_x0891e {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  white-space: nowrap;\r\n  padding-right: 12px;\r\n  font-size: 14px;\r\n  line-height: 24px;\r\n  opacity: 0;\r\n  transition: opacity 80ms;\r\n}\r\n\r\n.dsh-tig_userRow_x0891e:hover .dsh-tig_timeStart_x0891e,\r\n.dsh-tig_userRow_x0891e:focus-within .dsh-tig_timeStart_x0891e {\r\n  opacity: 1;\r\n}\r\n";
	const tagId = "@local/dsh-tool-imagegen/src/client/uploaded-image-bubble.module.css";
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
		const tag = document.createElement("style");
		tag.dataset.pluginCss = tagId;
		tag.textContent = css;
		document.head.appendChild(tag);
	}
	var uploaded_image_bubble_module_css_default = {
		"userRow": "dsh-tig_userRow_x0891e",
		"userStack": "dsh-tig_userStack_x0891e",
		"bubble": "dsh-tig_bubble_x0891e",
		"refChip": "dsh-tig_refChip_x0891e",
		"actions": "dsh-tig_actions_x0891e",
		"action": "dsh-tig_action_x0891e",
		"timeStart": "dsh-tig_timeStart_x0891e"
	};
	//#endregion
	//#region src/client/UploadedImageBubble.tsx
	/**
	* The shadowed `user` node renderer, registered into `conversation.chat.node`
	* for key 'user' at priority -1 (the platform's UserMessageNodeView sits at
	* priority 0; the lowest priority wins, so every user message flows through
	* this view).
	*
	* It is a faithful replica of the shipped user bubble — same row/stack/bubble
	* chrome, same hover clock + copy actions — extended with this plugin's
	* `uploaded-image` blocks (text-model uploads): those render inline through
	* the plugin's own loopback attachment bridge (the platform's loadImage only
	* authorizes `image` blocks). The model-facing envelope text (prefixed with
	* UPLOAD_ENVELOPE_PREFIX) is filtered out of the bubble; the user sees the
	* picture and their own words.
	*/
	/** Two-digit zero pad for the clock. */
	function pad2(n) {
		return n < 10 ? `0${n}` : String(n);
	}
	/**
	* Format a message time as a clock (same-day) or date + clock (older), with
	* the same calendar-day grouping as the shipped bubble.
	*/
	function formatClock(time, t) {
		if (time === void 0) return void 0;
		const date = new Date(time);
		if (Number.isNaN(date.getTime())) return void 0;
		const now = /* @__PURE__ */ new Date();
		const clock = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
		if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) return clock;
		const params = {
			y: date.getFullYear(),
			m: date.getMonth() + 1,
			d: date.getDate()
		};
		return `${date.getFullYear() === now.getFullYear() ? t("clock.md", params) : t("clock.ymd", params)} ${clock}`;
	}
	/**
	* Display projection of reference forms in a user bubble — the shipped
	* projectUserText replication: plain-text `/name` / `@name` word-boundary
	* tokens decorate as chips, everything else stays plain text.
	*/
	function projectUserText(text) {
		const pattern = /(^|\s)([/@][\w-]+)(?=\s|$)/g;
		const parts = [];
		let cursor = 0;
		let match;
		while ((match = pattern.exec(text)) !== null) {
			const tokenStart = match.index + (match[1]?.length ?? 0);
			const label = match[2] ?? "";
			if (tokenStart > cursor) parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MessageText, { text: text.slice(cursor, tokenStart) }, cursor));
			parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: uploaded_image_bubble_module_css_default.refChip,
				"data-ref-chip": label.startsWith("@") ? "subagent" : "skill",
				children: label
			}, tokenStart));
			cursor = tokenStart + label.length;
		}
		if (parts.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MessageText, { text });
		if (cursor < text.length) parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MessageText, { text: text.slice(cursor) }, cursor));
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: parts });
	}
	/** The hover copy action (shipped MessageIconActions replication, copy only). */
	function CopyAction({ text, t }) {
		const [copied, setCopied] = (0, react.useState)(false);
		const pending = (0, react.useRef)(false);
		const timer = (0, react.useRef)(null);
		const epoch = (0, react.useRef)(0);
		(0, react.useEffect)(() => () => {
			epoch.current += 1;
			pending.current = false;
			if (timer.current !== null) window.clearTimeout(timer.current);
		}, []);
		const onCopy = (0, react.useCallback)(() => {
			if (copied || pending.current) return;
			const generation = epoch.current;
			pending.current = true;
			(0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(text).then((ok) => {
				if (generation !== epoch.current) return;
				pending.current = false;
				if (!ok) return;
				setCopied(true);
				timer.current = window.setTimeout(() => {
					timer.current = null;
					setCopied(false);
				}, 1e3);
			});
		}, [copied, text]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
			label: copied ? t("copied") : t("copy"),
			side: "bottom",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: uploaded_image_bubble_module_css_default.action,
				"aria-label": copied ? t("copied") : t("copy"),
				onClick: onCopy,
				children: copied ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutline16, {})
			})
		});
	}
	/** Narrow one content block to a text block. */
	function isTextBlock(block) {
		return block !== null && typeof block === "object" && "type" in block && block.type === "text" && typeof block.text === "string";
	}
	/** Narrow one content block to a platform `image` block. */
	function isImageBlock(block) {
		return block !== null && typeof block === "object" && "type" in block && block.type === "image" && block.attachment !== void 0;
	}
	/** Narrow one content block to this plugin's uploaded-image block. */
	function isUploadedImageBlock(block) {
		return block !== null && typeof block === "object" && "type" in block && block.type === "uploaded-image" && block.attachment !== void 0;
	}
	/**
	* Render one user message: images (platform `image` + plugin `uploaded-image`)
	* above the text bubble, then the hover actions column.
	* @param props - the chat-node owner share, standard seats, and locale seat.
	* @returns the user bubble row.
	*/
	const UploadedImageBubble = (0, react.memo)(function UploadedImageBubble(props) {
		const { node, loadImage, t, sessionId } = props;
		const data = node?.data;
		const content = Array.isArray(data?.content) ? data.content : [];
		const time = data?.time;
		const texts = [];
		const platformImages = [];
		const uploadedImages = [];
		const rest = [];
		for (const block of content) {
			if (isTextBlock(block)) {
				if (block.text.startsWith("【dsh-imagegen】")) {
					const request = envelopeRequestText(block.text);
					if (request !== void 0) texts.push(request);
					continue;
				}
				texts.push(block.text);
				continue;
			}
			if (isImageBlock(block)) {
				platformImages.push(block.attachment);
				continue;
			}
			if (isUploadedImageBlock(block)) {
				uploadedImages.push(block);
				continue;
			}
			rest.push(block);
		}
		const text = texts.join("");
		const showBubble = text !== "" || rest.length > 0;
		const items = (0, react.useMemo)(() => [...platformImages, ...uploadedImages.map((block) => block.attachment)].map((attachment) => ({ attachment })), [platformImages, uploadedImages]);
		const pluginIds = (0, react.useMemo)(() => new Set(uploadedImages.map((block) => String(block.attachment.attachmentId))), [uploadedImages]);
		const load = (0, react.useCallback)((attachment) => {
			if (pluginIds.has(String(attachment.attachmentId))) return Promise.resolve(`${ATTACHMENT_API.path}?session=${encodeURIComponent(String(sessionId))}&id=${encodeURIComponent(String(attachment.attachmentId))}`);
			return loadImage(attachment);
		}, [
			pluginIds,
			sessionId,
			loadImage
		]);
		const labels = (0, react.useMemo)(() => ({
			image: t("image.label"),
			open: t("image.openOriginal"),
			openNamed: (label) => t("image.openOriginalLabel", { label }),
			loading: t("image.loading"),
			loadFailed: t("image.loadFailed"),
			lightbox: {
				dialog: t("image.preview"),
				close: t("image.closePreview")
			}
		}), [t]);
		const clock = (0, react.useMemo)(() => formatClock(time, t), [time, t]);
		const truncated = (0, react.useCallback)((total) => t("json.truncated", { total }), [t]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: uploaded_image_bubble_module_css_default.userRow,
			"data-time-hover-root": true,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: uploaded_image_bubble_module_css_default.userStack,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_attachment.ImageGallery, {
					images: items,
					load,
					align: "end",
					labels
				}), showBubble && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: uploaded_image_bubble_module_css_default.bubble,
					children: [projectUserText(text), rest.map((block, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
						label: t("message.extraBlock"),
						payload: block,
						truncatedLabel: truncated
					}, index))]
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: uploaded_image_bubble_module_css_default.actions,
				children: [clock !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: uploaded_image_bubble_module_css_default.timeStart,
					children: clock
				}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyAction, {
					text,
					t
				})]
			})]
		});
	});
	//#endregion
	//#region src/client/index.ts
	/** Per-image byte cap for staging an edit reference (host maxImageBytes). */
	const MAX_EDIT_BYTES = 5242880;
	/** Read a Blob as a base64 data URL (mirrors the upload button's File path). */
	function blobToDataUrl(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
			reader.onerror = () => reject(/* @__PURE__ */ new Error("image read failed"));
			reader.readAsDataURL(blob);
		});
	}
	/** Locale namespace this plugin owns. */
	const NS = "dsh-imagegen";
	/** Required services (fiber inject waiting — the runtime must be up first). */
	const inject = [
		"slots",
		"locale",
		"connection",
		"conversation"
	];
	/**
	* Mount the settings card and the inline generated-image view.
	* @param ctx - client root context (services: slots, locale, connection).
	*/
	function apply(ctx) {
		ctx.effect(() => ctx.locale.register(NS, {
			zh,
			en
		}), "dsh-tool-imagegen: dictionaries");
		const connection = ctx.get("connection");
		const bridgeFetch = connection?.isLoopback === true ? (input, init) => fetch(input, init) : () => {
			throw new Error("plugin bridge is loopback-only");
		};
		const scope = bindImageGenScope(bridgeFetch);
		ctx.effect(() => {
			const disposers = [ctx.on("connection/reset", () => {
				scope.load();
			})];
			return () => {
				for (const dispose of disposers) dispose();
			};
		}, "dsh-tool-imagegen: settings scope invalidation");
		try {
			const settingsCard = new ImageGenSettingsCardController(scope);
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				key: NS,
				order: 30,
				locale: NS,
				inject: () => ({
					...settingsCard.inject(),
					maintenance: { fetchFn: bridgeFetch }
				})
			}, ImageGenSettingsCard));
		} catch (error) {
			console.warn("[dsh-tool-imagegen] settings card registration failed:", error);
		}
		try {
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "generate_image",
				locale: NS,
				inject: (sessionId) => ({
					loadImage: (attachment) => Promise.resolve(`${ATTACHMENT_API.path}?session=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(attachment.attachmentId)}`),
					openLocally: (attachment) => bridgeFetch(OPEN_API.path, {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							sessionId,
							attachmentId: attachment.attachmentId
						})
					}).then(async (response) => {
						const body = await response.json();
						if (body.ok !== true) throw new Error(body.message !== void 0 && body.message !== "" ? body.message : "open failed");
					}),
					stageEdit: async (attachment) => {
						if ((typeof attachment.bytes === "number" ? attachment.bytes : Number.POSITIVE_INFINITY) > MAX_EDIT_BYTES) throw new Error("图片超过 5MB 上限，无法作为修改参考");
						const response = await bridgeFetch(`${ATTACHMENT_API.path}?session=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(attachment.attachmentId)}`);
						if (response.ok !== true) throw new Error(`无法读取图片：HTTP ${response.status}`);
						const dataUrl = await blobToDataUrl(await response.blob());
						const comma = dataUrl.indexOf(",");
						setPending(sessionId, {
							mediaType: typeof attachment.mediaType === "string" && attachment.mediaType !== "" ? attachment.mediaType : "image/png",
							data: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl,
							name: typeof attachment.name === "string" && attachment.name !== "" ? attachment.name : "generated-image.png"
						});
						setPendingFailure(sessionId, void 0);
					}
				})
			}, GenerateImageView));
		} catch (error) {
			console.warn("[dsh-tool-imagegen] toolview registration failed:", error);
		}
		const uploadFace = {
			fetchFn: bridgeFetch,
			connection
		};
		try {
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "imagegen-upload",
				order: 10,
				locale: NS,
				inject: () => uploadFace
			}, UploadButton));
		} catch (error) {
			console.warn("[dsh-tool-imagegen] upload button registration failed:", error);
		}
		try {
			const conversation = ctx.get("conversation");
			if (conversation !== void 0 && typeof conversation.sendSession === "function") {
				const originalSend = conversation.sendSession.bind(conversation);
				conversation.sendSession = (async (session, text, imageIds, mode) => {
					const sessionId = session?.sessionId;
					const draft = typeof sessionId === "string" && sessionId !== "" ? getPending(sessionId) : void 0;
					if (draft === void 0) return originalSend(session, text, imageIds, mode);
					let response;
					try {
						response = await uploadFace.fetchFn(UPLOAD_API.path, {
							method: "POST",
							headers: { "content-type": "application/json" },
							body: JSON.stringify({
								sessionId,
								mediaType: draft.mediaType,
								data: draft.data,
								name: draft.name,
								text
							})
						});
					} catch (error) {
						setPendingFailure(sessionId, error instanceof Error && error.message !== "" ? error.message : "upload bridge unreachable");
						throw error;
					}
					const body = await response.json();
					if (body.ok !== true) {
						const message = body.message !== void 0 && body.message !== "" ? body.message : "upload failed";
						setPendingFailure(sessionId, message);
						throw new Error(message);
					}
					setPending(sessionId, void 0);
					setPendingFailure(sessionId, void 0);
					return { ok: true };
				});
			}
		} catch (error) {
			console.warn("[dsh-tool-imagegen] sendSession wrapper failed:", error);
		}
		try {
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "user",
				priority: -1,
				locale: NS
			}, UploadedImageBubble));
		} catch (error) {
			console.warn("[dsh-tool-imagegen] user bubble registration failed:", error);
		}
	}
	//#endregion
	exports.apply = apply;
	exports.inject = inject;
	
		return module.exports;
	}
});
