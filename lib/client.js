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
	let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
	let react_jsx_runtime = require("react/jsx-runtime");
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
		toolviewSize: "尺寸",
		toolviewDetails: "详情",
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
		toolviewSize: "Size",
		toolviewDetails: "Details",
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
			const store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(project());
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
	const css$3 = "/**\n * dsh-tool-imagegen settings card styles. Mirrors the official plugin-config\n * card chrome (@deepseek-ai/dsh-client-ui-settings-plugins PluginCard + fields)\n * so the card reads as a sibling of the bash / agent-loop / web-search cards;\n * colors ride the dsh --dsw-* tokens.\n */\n\n.dsh-tig_card_10gqfzv {\n  list-style: none;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 12px;\n  background: var(--dsw-alias-bg-layer-3);\n  transition: border-color 0.16s, background 0.16s;\n}\n\n.dsh-tig_card_10gqfzv:hover {\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n/* An open card reads as the one being worked on, not merely taller. */\n.dsh-tig_card_10gqfzv:has(.dsh-tig_body_10gqfzv) {\n  background: var(--dsw-alias-bg-layer-2);\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n.dsh-tig_header_10gqfzv {\n  width: 100%;\n  appearance: none;\n  border: 0;\n  background: none;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 14px 16px;\n  border-radius: 12px;\n}\n\n.dsh-tig_header_10gqfzv:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: -2px;\n}\n\n.dsh-tig_headText_10gqfzv {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.dsh-tig_name_10gqfzv {\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 1.4;\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_description_10gqfzv {\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dsh-tig_chevron_10gqfzv,\n.dsh-tig_chevronOpen_10gqfzv {\n  flex: none;\n  color: var(--dsw-alias-label-tertiary);\n  transition: transform 0.16s;\n}\n\n.dsh-tig_chevronOpen_10gqfzv {\n  transform: rotate(180deg);\n}\n\n/* Carried on the header so a collapsed card still says it holds edits. */\n.dsh-tig_pending_10gqfzv {\n  flex: none;\n  border-radius: 999px;\n  padding: 1px 8px;\n  font-size: 11px;\n  line-height: 17px;\n  font-weight: 500;\n  white-space: nowrap;\n  background: var(--dsw-alias-bg-module-platform);\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dsh-tig_body_10gqfzv {\n  border-top: 1px solid var(--dsw-alias-border-l2);\n  margin: 0 16px;\n  padding-bottom: 8px;\n}\n\n/* --- fields (mirror of the official plugin-config fields) --------------------- */\n\n.dsh-tig_field_10gqfzv {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  padding: 12px 0;\n}\n\n.dsh-tig_field_10gqfzv + .dsh-tig_field_10gqfzv {\n  border-top: 1px solid var(--dsw-alias-border-l2);\n}\n\n.dsh-tig_head_10gqfzv {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.dsh-tig_label_10gqfzv {\n  flex: 1;\n  min-width: 0;\n  font-size: 13px;\n  font-weight: 500;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_badges_10gqfzv {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.dsh-tig_badge_10gqfzv {\n  border-radius: 999px;\n  padding: 1px 8px;\n  font-size: 11px;\n  line-height: 17px;\n  white-space: nowrap;\n  font-weight: 500;\n  background: var(--dsw-alias-bg-module-platform);\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dsh-tig_reset_10gqfzv {\n  border: none;\n  background: none;\n  padding: 0;\n  font: inherit;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n}\n\n.dsh-tig_reset_10gqfzv:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_reset_10gqfzv:disabled {\n  cursor: default;\n  opacity: 0.5;\n}\n\n.dsh-tig_input_10gqfzv,\n.dsh-tig_select_10gqfzv {\n  height: 34px;\n  padding: 0 12px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-layer-3);\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n  outline: none;\n}\n\n.dsh-tig_input_10gqfzv:focus-visible,\n.dsh-tig_select_10gqfzv:focus-visible {\n  border-color: var(--dsw-alias-brand-primary);\n}\n\n.dsh-tig_input_10gqfzv:disabled,\n.dsh-tig_select_10gqfzv:disabled {\n  color: var(--dsw-alias-label-tertiary);\n  cursor: default;\n}\n\n.dsh-tig_inputInvalid_10gqfzv {\n  height: 34px;\n  padding: 0 12px;\n  border: 1px solid var(--dsw-alias-label-error);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-layer-3);\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n  outline: none;\n}\n\n/* --- editable combo (input + styled option panel, replaces the native\n     datalist popup that looked detached from the card) ------------------------ */\n\n/* One row: the parameter-enable checkbox in front of the combo/input. */\n.dsh-tig_comboRow_10gqfzv {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n/* Plain (non-combo) inputs inside the row also fill the remaining width. */\n.dsh-tig_comboRow_10gqfzv .dsh-tig_input_10gqfzv,\n.dsh-tig_comboRow_10gqfzv .dsh-tig_inputInvalid_10gqfzv {\n  flex: 1;\n  min-width: 0;\n}\n\n.dsh-tig_combo_10gqfzv {\n  position: relative;\n  /* A flex item in .dsh-tig_comboRow_10gqfzv; flex:1 fills the row (min-width:0 stops the\n     input's intrinsic min-content from stretching the row past the card). */\n  flex: 1;\n  min-width: 0;\n}\n\n.dsh-tig_comboInput_10gqfzv,\n.dsh-tig_comboInputInvalid_10gqfzv {\n  /* width:100% + padding can overflow the card when the host CSS has no\n     global border-box reset — size the box explicitly instead. */\n  box-sizing: border-box;\n  width: 100%;\n  height: 34px;\n  padding: 0 34px 0 12px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-layer-3);\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n  outline: none;\n}\n\n.dsh-tig_comboInputInvalid_10gqfzv {\n  border-color: var(--dsw-alias-label-error);\n}\n\n.dsh-tig_comboInput_10gqfzv:focus-visible,\n.dsh-tig_comboInputInvalid_10gqfzv:focus-visible {\n  border-color: var(--dsw-alias-brand-primary);\n}\n\n.dsh-tig_comboInput_10gqfzv:disabled,\n.dsh-tig_comboInputInvalid_10gqfzv:disabled {\n  color: var(--dsw-alias-label-tertiary);\n  cursor: default;\n}\n\n.dsh-tig_comboToggle_10gqfzv {\n  position: absolute;\n  top: 0;\n  right: 0;\n  height: 34px;\n  width: 32px;\n  border: none;\n  background: none;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 12px;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  border-radius: 0 8px 8px 0;\n}\n\n.dsh-tig_comboToggle_10gqfzv:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_comboToggle_10gqfzv:disabled {\n  cursor: default;\n}\n\n.dsh-tig_comboToggle_10gqfzv:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: -2px;\n}\n\n.dsh-tig_comboPanel_10gqfzv {\n  box-sizing: border-box;\n  position: absolute;\n  z-index: 30;\n  top: calc(100% + 4px);\n  left: 0;\n  width: 100%;\n  max-height: 224px;\n  overflow-y: auto;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-layer-2);\n  box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);\n  padding: 4px;\n}\n\n.dsh-tig_comboOption_10gqfzv,\n.dsh-tig_comboEmpty_10gqfzv {\n  appearance: none;\n  border: none;\n  background: none;\n  box-sizing: border-box;\n  width: 100%;\n  text-align: left;\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  padding: 6px 10px;\n  border-radius: 6px;\n}\n\n.dsh-tig_comboOption_10gqfzv {\n  /* Long option values must truncate, never stretch the panel wider than\n     the field. */\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  color: var(--dsw-alias-label-primary);\n  cursor: pointer;\n}\n\n.dsh-tig_comboOption_10gqfzv:hover,\n.dsh-tig_comboOptionSelected_10gqfzv {\n  background: var(--dsw-alias-bg-module-platform);\n}\n\n.dsh-tig_comboOption_10gqfzv:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: -1px;\n}\n\n.dsh-tig_comboEmpty_10gqfzv {\n  color: var(--dsw-alias-label-tertiary);\n  cursor: default;\n}\n\n/* --- parameter-enable checkbox (field head, before the label) ---------------- */\n\n.dsh-tig_enableCheck_10gqfzv {\n  flex: none;\n  width: 16px;\n  height: 16px;\n  margin: 0;\n  accent-color: var(--dsw-alias-brand-primary, var(--dsw-static-deepseek-500));\n  cursor: pointer;\n}\n\n.dsh-tig_enableCheck_10gqfzv:disabled {\n  cursor: default;\n  opacity: 0.5;\n}\n\n.dsh-tig_hint_10gqfzv,\n.dsh-tig_invalid_10gqfzv {\n  margin: 0;\n  font-size: 12px;\n  line-height: 1.5;\n}\n\n.dsh-tig_hint_10gqfzv {\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dsh-tig_invalid_10gqfzv {\n  color: var(--dsw-alias-label-error);\n}\n\n.dsh-tig_readOnly_10gqfzv,\n.dsh-tig_notExposed_10gqfzv {\n  margin: 12px 0 0;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* --- footer (mirror of the official card footer) ------------------------------ */\n\n.dsh-tig_footer_10gqfzv {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 8px;\n  padding: 12px 0 4px;\n  border-top: 1px solid var(--dsw-alias-border-l2);\n}\n\n.dsh-tig_failed_10gqfzv {\n  flex: 1;\n  min-width: 0;\n  margin: 0;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-error);\n}\n\n/* Storage-maintenance section (embedded in the settings card body). */\n.dsh-tig_storageSection_10gqfzv {\n  margin-top: 14px;\n  padding-top: 12px;\n  border-top: 1px solid var(--dsw-alias-border-l2);\n}\n\n.dsh-tig_storageHeading_10gqfzv {\n  margin: 0 0 6px;\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n}\n\n/* Storage-maintenance lines (sizes / cleanup outcome). */\n.dsh-tig_storageLine_10gqfzv {\n  margin: 0 0 4px;\n  font-size: 13px;\n  line-height: 1.6;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dsh-tig_saved_10gqfzv {\n  flex: 1;\n  min-width: 0;\n  margin: 8px 0 0;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-state-success-primary, var(--dsw-static-deepseek-500));\n}\n\n.dsh-tig_discard_10gqfzv,\n.dsh-tig_save_10gqfzv {\n  appearance: none;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  padding: 5px 14px;\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  cursor: pointer;\n}\n\n.dsh-tig_discard_10gqfzv {\n  border-color: var(--dsw-alias-border-l2);\n  background: none;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dsh-tig_discard_10gqfzv:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n.dsh-tig_save_10gqfzv {\n  background: var(--dsw-alias-label-primary);\n  color: var(--dsw-alias-bg-layer-3);\n}\n\n.dsh-tig_discard_10gqfzv:disabled,\n.dsh-tig_save_10gqfzv:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.dsh-tig_discard_10gqfzv:focus-visible,\n.dsh-tig_save_10gqfzv:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: 1px;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-tig_card_10gqfzv, .dsh-tig_chevron_10gqfzv, .dsh-tig_chevronOpen_10gqfzv {\n    transition: none;\n  }\n}\n";
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
	let statsCache;
	const STATS_TTL_MS = 1e4;
	const StorageSection = (0, react.memo)(function StorageSection({ t, fetchFn }) {
		const [uploads, setUploads] = (0, react.useState)(void 0);
		const [attachments, setAttachments] = (0, react.useState)(void 0);
		const [running, setRunning] = (0, react.useState)(false);
		const [report, setReport] = (0, react.useState)(void 0);
		const [error, setError] = (0, react.useState)(void 0);
		const refresh = (0, react.useCallback)(async () => {
			if (statsCache !== void 0 && Date.now() - statsCache.at < STATS_TTL_MS) {
				setUploads(statsCache.uploads);
				setAttachments(statsCache.attachments);
				setError(void 0);
				return;
			}
			try {
				const body = await (await fetchFn(MAINTENANCE_API.stats, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: "{}"
				})).json();
				if (body.ok !== true) throw new Error(body.message ?? "maintenance unavailable");
				if (body.uploads !== void 0 && body.attachments !== void 0) statsCache = {
					at: Date.now(),
					uploads: body.uploads,
					attachments: body.attachments
				};
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
				statsCache = void 0;
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
	});
	//#endregion
	//#region src/client/SettingsCard.tsx
	/**
	* The dsh-tool-imagegen settings card: api_url, api_key (secret, display-only
	* "set" state), model (default gpt-image-2, hand-editable), size, count, and
	* the plugin switches. Registers into the official `settings.plugin.item` slot
	* (the Settings → Plugins → Configurable tab), independent of the dsh-web-ui
	* family group, bound to the plugin's own bridge settings scope.
	*
	* Performance: the card subscribes to the whole staged-form snapshot, so every
	* keystroke rebuilds it. To keep typing smooth the field controls are memoized
	* and every per-field handler is referentially stable (built once from the
	* stable form actions) — a keystroke in one field re-renders only that field,
	* not all twenty.
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
			const keySetStore = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.scope.getKeySetSnapshot());
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
		const handlers = (0, react.useMemo)(() => {
			const text = (field) => ({
				onEdit: (value) => {
					props.edit(field, value);
				},
				onReset: () => {
					props.resetField(field);
				},
				onClear: () => {
					props.resetField(field);
				}
			});
			const gated = (field) => ({
				onEdit: (value) => {
					props.edit(field, value);
				},
				onReset: () => {
					props.resetField(field);
				},
				onChecked: (checked) => {
					props.edit(`${field}_enabled`, checked ? "true" : "false");
				}
			});
			const flag = (field) => ({
				onEdit: (value) => {
					props.edit(field, value);
				},
				onReset: () => {
					props.resetField(field);
				}
			});
			return {
				apiKey: text("apiKey"),
				apiUrl: text("apiUrl"),
				model: text("model"),
				size: text("size"),
				quality: gated("quality"),
				output_format: gated("output_format"),
				background: gated("background"),
				style: gated("style"),
				moderation: gated("moderation"),
				watermark: gated("watermark"),
				n: text("n"),
				enabled: flag("enabled"),
				announceToAgent: flag("announceToAgent")
			};
		}, [props.edit, props.resetField]);
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
						onEdit: handlers.apiKey.onEdit,
						onReset: handlers.apiKey.onReset,
						clearLabel: t("apiKeyClear"),
						onClear: handlers.apiKey.onClear,
						canClear: keySet
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-apiurl",
						label: t("fieldApiUrl"),
						hint: t("fieldApiUrlHelp"),
						placeholder: "https://api.ephone.ai/v1",
						...fieldProps,
						...state.apiUrl,
						onEdit: handlers.apiUrl.onEdit,
						onReset: handlers.apiUrl.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-model",
						label: t("fieldModel"),
						hint: t("fieldModelHelp"),
						placeholder: "gpt-image-2",
						...fieldProps,
						...state.model,
						onEdit: handlers.model.onEdit,
						onReset: handlers.model.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-size",
						label: t("fieldSize"),
						hint: t("fieldSizeHelp"),
						placeholder: "auto",
						comboOptions: SIZE_OPTIONS,
						...fieldProps,
						...state.size,
						onEdit: handlers.size.onEdit,
						onReset: handlers.size.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-quality",
						label: t("fieldQuality"),
						hint: state.quality_enabled.text === "true" ? t("fieldQualityHelp") : t("fieldGatedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.quality,
						checked: state.quality_enabled.text === "true",
						onChecked: handlers.quality.onChecked,
						...fieldProps,
						...state.quality,
						locked: state.quality_enabled.text !== "true",
						onEdit: handlers.quality.onEdit,
						onReset: handlers.quality.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-output-format",
						label: t("fieldOutputFormat"),
						hint: state.output_format_enabled.text === "true" ? t("fieldOutputFormatHelp") : t("fieldUnsupportedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.output_format,
						checked: state.output_format_enabled.text === "true",
						onChecked: handlers.output_format.onChecked,
						...fieldProps,
						...state.output_format,
						locked: state.output_format_enabled.text !== "true",
						onEdit: handlers.output_format.onEdit,
						onReset: handlers.output_format.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-background",
						label: t("fieldBackground"),
						hint: state.background_enabled.text === "true" ? t("fieldBackgroundHelp") : t("fieldGatedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.background,
						checked: state.background_enabled.text === "true",
						onChecked: handlers.background.onChecked,
						...fieldProps,
						...state.background,
						locked: state.background_enabled.text !== "true",
						onEdit: handlers.background.onEdit,
						onReset: handlers.background.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-style",
						label: t("fieldStyle"),
						hint: state.style_enabled.text === "true" ? t("fieldStyleHelp") : t("fieldUnsupportedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.style,
						checked: state.style_enabled.text === "true",
						onChecked: handlers.style.onChecked,
						...fieldProps,
						...state.style,
						locked: state.style_enabled.text !== "true",
						onEdit: handlers.style.onEdit,
						onReset: handlers.style.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-moderation",
						label: t("fieldModeration"),
						hint: state.moderation_enabled.text === "true" ? t("fieldModerationHelp") : t("fieldGatedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.moderation,
						checked: state.moderation_enabled.text === "true",
						onChecked: handlers.moderation.onChecked,
						...fieldProps,
						...state.moderation,
						locked: state.moderation_enabled.text !== "true",
						onEdit: handlers.moderation.onEdit,
						onReset: handlers.moderation.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-watermark",
						label: t("fieldWatermark"),
						hint: state.watermark_enabled.text === "true" ? t("fieldWatermarkHelp") : t("fieldUnsupportedHint"),
						placeholder: t("fieldOptionalPlaceholder"),
						comboOptions: ENUM_OPTIONS.watermark,
						checked: state.watermark_enabled.text === "true",
						onChecked: handlers.watermark.onChecked,
						...fieldProps,
						...state.watermark,
						locked: state.watermark_enabled.text !== "true",
						onEdit: handlers.watermark.onEdit,
						onReset: handlers.watermark.onReset
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ValueField, {
						id: "dsh-imagegen-settings-count",
						label: t("fieldCount"),
						hint: t("fieldCountHelp"),
						placeholder: "1",
						...fieldProps,
						...state.n,
						onEdit: handlers.n.onEdit,
						onReset: handlers.n.onReset
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
						onEdit: handlers.enabled.onEdit,
						onReset: handlers.enabled.onReset
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
						onEdit: handlers.announceToAgent.onEdit,
						onReset: handlers.announceToAgent.onReset
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
	/**
	* A staged value field; `secret` renders a password control and
	* `comboOptions` renders a self-drawn editable combo (input + option panel
	* styled as part of the card — the native datalist popup looked detached
	* from the card). Suggestions are hints only: any typed value is kept,
	* the panel filters by substring, and the current draft is marked.
	* Memoized: with stable handlers + primitive props it re-renders only when
	* its own draft changed, not when a sibling field was edited.
	*/
	const ValueField = (0, react.memo)(function ValueField(props) {
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
	});
	/** A staged boolean field: 继承 / 开 / 关. Memoized like ValueField. */
	const BooleanField = (0, react.memo)(function BooleanField(props) {
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
	});
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
			this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				status: "loading",
				value: void 0,
				base: void 0,
				user: void 0,
				revision: void 0,
				writable: false,
				mode: "host"
			});
			this.keySet = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(false);
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
	const css$2 = "/**\n * dsh-tool-imagegen inline conversation view. Settled generated images render\n * as natural inline message images (rounded, no surrounding tool-card chrome)\n * with a hover action cluster (view / edit / download / open / details) and an\n * expandable details panel showing the full prompt + model + size. Running and\n * error states render as slim unboxed rows so the whole view reads as part of\n * the conversation flow rather than a framed tool card.\n */\n\n.dsh-tig_root_lw9tw4 {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  min-width: 0;\n}\n\n/* Slim, unboxed status rows (running / error / text-only outcomes). */\n.dsh-tig_statusRow_lw9tw4 {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-height: 28px;\n  min-width: 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.dsh-tig_statusText_lw9tw4 {\n  color: var(--dsw-alias-label-tertiary);\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n\n.dsh-tig_stateError_lw9tw4 {\n  color: var(--dsw-alias-state-error-primary);\n}\n\n/* Multi-image body keeps a small gap between rows. */\n.dsh-tig_body_lw9tw4 {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  min-width: 0;\n}\n\n.dsh-tig_image_lw9tw4 {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 4px;\n  min-width: 0;\n}\n\n/* The image itself: rounded like a chat message image (hairline only). */\n.dsh-tig_frame_lw9tw4 {\n  position: relative;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 14px;\n  background: var(--dsw-alias-bg-layer-2);\n  max-width: 100%;\n  overflow: hidden;\n}\n\n.dsh-tig_img_lw9tw4 {\n  display: block;\n  max-width: 100%;\n  max-height: 480px;\n  margin: 0 auto;\n}\n\n/* Hover action cluster over the image corner (view / edit / download / open\n   locally / details), revealed on hover or focus. */\n.dsh-tig_actions_lw9tw4 {\n  position: absolute;\n  right: 8px;\n  bottom: 8px;\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n  justify-content: flex-end;\n  opacity: 0;\n  transition: opacity 0.15s ease;\n}\n\n.dsh-tig_frame_lw9tw4:hover .dsh-tig_actions_lw9tw4,\n.dsh-tig_frame_lw9tw4:focus-within .dsh-tig_actions_lw9tw4 {\n  opacity: 1;\n}\n\n.dsh-tig_action_lw9tw4 {\n  padding: 4px 10px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 6px;\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-3) 86%, transparent);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  text-decoration: none;\n  cursor: pointer;\n  font-family: inherit;\n}\n\n.dsh-tig_action_lw9tw4:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-border-l1);\n}\n\n.dsh-tig_action_lw9tw4:disabled {\n  opacity: 0.6;\n  cursor: default;\n}\n\n/* Details panel: full prompt + model + size, opened by the 详情 action. */\n.dsh-tig_details_lw9tw4 {\n  align-self: stretch;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-2);\n  flex-direction: column;\n  gap: 6px;\n  min-width: 0;\n  padding: 10px 12px;\n  display: flex;\n}\n\n.dsh-tig_detailRow_lw9tw4 {\n  display: flex;\n  align-items: baseline;\n  gap: 10px;\n  min-width: 0;\n}\n\n.dsh-tig_detailLabel_lw9tw4 {\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  font-size: 12px;\n  line-height: 1.6;\n}\n\n.dsh-tig_detailValue_lw9tw4 {\n  color: var(--dsw-alias-label-primary);\n  min-width: 0;\n  font-size: 12px;\n  line-height: 1.6;\n  white-space: normal;\n  word-break: break-word;\n}\n\n.dsh-tig_detailPrompt_lw9tw4 {\n  color: var(--dsw-alias-label-secondary);\n  white-space: normal;\n  word-break: break-word;\n}\n\n/* One-line statuses under the image (edit staged / action failures). */\n.dsh-tig_caption_lw9tw4 {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n}\n\n.dsh-tig_captionLine_lw9tw4 {\n  margin: 0;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-tertiary);\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  max-width: 100%;\n}\n\n.dsh-tig_actionError_lw9tw4 {\n  color: var(--dsw-alias-state-error-primary);\n}\n\n.dsh-tig_editReady_lw9tw4 {\n  color: var(--dsw-alias-state-success-primary);\n}\n\n/* Fullscreen image viewer overlay. */\n.dsh-tig_viewer_lw9tw4 {\n  position: fixed;\n  inset: 0;\n  z-index: 1000;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgb(0 0 0 / 72%);\n}\n\n.dsh-tig_viewerImg_lw9tw4 {\n  max-width: 92vw;\n  max-height: 92vh;\n  border-radius: 8px;\n  box-shadow: 0 12px 48px rgb(0 0 0 / 55%);\n}\n\n.dsh-tig_viewerClose_lw9tw4 {\n  position: absolute;\n  top: 14px;\n  right: 18px;\n  width: 36px;\n  height: 36px;\n  border: 1px solid rgb(255 255 255 / 28%);\n  border-radius: 50%;\n  background: rgb(0 0 0 / 45%);\n  color: var(--dsw-alias-label-primary, #fff);\n  font-size: 16px;\n  line-height: 1;\n  cursor: pointer;\n}\n\n.dsh-tig_viewerClose_lw9tw4:hover {\n  background: rgb(0 0 0 / 65%);\n}\n\n/* --- running / loading / error placeholders -------------------------------- */\n\n.dsh-tig_spinner_lw9tw4 {\n  flex: none;\n  width: 14px;\n  height: 14px;\n  border: 2px solid var(--dsw-alias-border-l2);\n  border-top-color: var(--dsw-alias-label-tertiary);\n  border-radius: 50%;\n  animation: dsh-tool-imagegen-spin 0.8s linear infinite;\n}\n\n@keyframes dsh-tool-imagegen-spin {\n  to { transform: rotate(360deg); }\n}\n\n.dsh-tig_loading_lw9tw4 {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 120px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 20px;\n}\n\n.dsh-tig_loadFailed_lw9tw4 {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 120px;\n  padding: 0 14px;\n  color: var(--dsw-alias-state-error-primary);\n  font-size: 12px;\n  line-height: 20px;\n  text-align: center;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-tig_spinner_lw9tw4 {\n    animation: none;\n  }\n}\n";
	const tagId$2 = "@local/dsh-tool-imagegen/src/client/generate-image-view.module.css";
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
		const tag = document.createElement("style");
		tag.dataset.pluginCss = tagId$2;
		tag.textContent = css$2;
		document.head.appendChild(tag);
	}
	var generate_image_view_module_css_default = {
		"root": "dsh-tig_root_lw9tw4",
		"statusRow": "dsh-tig_statusRow_lw9tw4",
		"statusText": "dsh-tig_statusText_lw9tw4",
		"stateError": "dsh-tig_stateError_lw9tw4",
		"body": "dsh-tig_body_lw9tw4",
		"image": "dsh-tig_image_lw9tw4",
		"frame": "dsh-tig_frame_lw9tw4",
		"img": "dsh-tig_img_lw9tw4",
		"actions": "dsh-tig_actions_lw9tw4",
		"action": "dsh-tig_action_lw9tw4",
		"details": "dsh-tig_details_lw9tw4",
		"detailRow": "dsh-tig_detailRow_lw9tw4",
		"detailLabel": "dsh-tig_detailLabel_lw9tw4",
		"detailValue": "dsh-tig_detailValue_lw9tw4",
		"detailPrompt": "dsh-tig_detailPrompt_lw9tw4",
		"caption": "dsh-tig_caption_lw9tw4",
		"captionLine": "dsh-tig_captionLine_lw9tw4",
		"actionError": "dsh-tig_actionError_lw9tw4",
		"editReady": "dsh-tig_editReady_lw9tw4",
		"viewer": "dsh-tig_viewer_lw9tw4",
		"viewerImg": "dsh-tig_viewerImg_lw9tw4",
		"viewerClose": "dsh-tig_viewerClose_lw9tw4",
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
	*
	* Settled images render as natural inline message images (rounded, no
	* surrounding tool-card chrome). A hover action cluster offers 全屏查看 /
	* 修改 / 下载 / 本地打开 / 详情; the 详情 action opens a panel with the full
	* prompt, model, and size. Running and error states are slim unboxed rows.
	*
	* The current DSH chat (default "compact" transcript view) folds a closed
	* turn's tool calls into a process disclosure that starts collapsed, hiding
	* the image until the user expands it — this view auto-opens that disclosure
	* so the image is always visible without extra interaction (see the observer
	* in {@link GenerateImageView}).
	*/
	/** Narrow the settled content to this plugin's generated-image blocks. */
	function generatedImageBlocks(content) {
		return content.filter((block) => block !== null && typeof block === "object" && "type" in block && block.type === "generated-image");
	}
	/** Text blocks in the settled content (used as the error/summary envelope). */
	function textBlocks(content) {
		return content.filter((block) => block !== null && typeof block === "object" && "type" in block && block.type === "text" && typeof block.text === "string").map((block) => block.text);
	}
	/**
	* Read the settled content array off a tool-call block. The transcript hands
	* the raw lifecycle form `{ name, argsRaw, content }` for settled calls, but
	* some surfaces deliver the nested form `{ kind, call, result: { content } }` —
	* accept both so the view never throws on an unexpected shape (a throw would
	* abdicate the keyed entry and fall back to the generic folded tool row).
	*/
	function settledContentOf(block) {
		if (block === null || typeof block !== "object") return void 0;
		const candidate = block;
		if (Array.isArray(candidate.content)) return candidate.content;
		if (candidate.result !== null && typeof candidate.result === "object") {
			const result = candidate.result;
			if (Array.isArray(result.content)) return result.content;
		}
	}
	/** Read the isError flag off either block form (false when absent). */
	function settledErrorOf(block) {
		if (block === null || typeof block !== "object") return false;
		const candidate = block;
		if (candidate.isError === true) return true;
		if (candidate.result !== null && typeof candidate.result === "object") return candidate.result.isError === true;
		return false;
	}
	/** Parse the running call's argsRaw (either block form) for a readable prompt. */
	function promptFromArgs(block) {
		if (block === null || typeof block !== "object") return void 0;
		const candidate = block;
		let argsRaw = candidate.argsRaw;
		if (typeof argsRaw !== "string" && candidate.call !== null && typeof candidate.call === "object") argsRaw = candidate.call.argsRaw;
		if (typeof argsRaw !== "string" || argsRaw === "") return void 0;
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
		const rootRef = (0, react.useRef)(null);
		const content = settledContentOf(block);
		const settled = content !== void 0;
		const images = settled ? generatedImageBlocks(content) : [];
		const isError = settledErrorOf(block);
		const [viewing, setViewing] = (0, react.useState)(void 0);
		const runningPrompt = settled ? void 0 : promptFromArgs(block);
		(0, react.useEffect)(() => {
			const el = rootRef.current;
			if (el === null) return;
			const tryOpen = () => {
				try {
					const hiddenItem = el.closest("[data-turn-process-hidden]");
					if (hiddenItem === null) return;
					const turn = hiddenItem.getAttribute("data-chat-turn");
					const scope = hiddenItem.parentElement;
					if (turn === null || turn === "" || scope === null) return;
					const disclosure = scope.querySelector(`[data-chat-flow-kind="turn-process"][data-chat-turn="${CSS.escape(turn)}"] [data-turn-process]`);
					if (disclosure === null || disclosure.getAttribute("aria-expanded") === "true") return;
					disclosure.click();
				} catch {}
			};
			const observer = new MutationObserver(() => {
				tryOpen();
			});
			observer.observe(document.body, {
				attributes: true,
				attributeFilter: ["data-turn-process-hidden"],
				subtree: true
			});
			tryOpen();
			return () => observer.disconnect();
		}, []);
		if (!settled) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: generate_image_view_module_css_default.root,
			ref: rootRef,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: generate_image_view_module_css_default.statusRow,
				role: "status",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: generate_image_view_module_css_default.spinner,
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("toolviewRunning") }),
					runningPrompt !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: generate_image_view_module_css_default.statusText,
						children: runningPrompt
					}) : null
				]
			})
		});
		if (images.length === 0) {
			const envelope = textBlocks(content).join("\n");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: generate_image_view_module_css_default.root,
				ref: rootRef,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: generate_image_view_module_css_default.statusRow,
					children: [isError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: generate_image_view_module_css_default.stateError,
						children: t("toolviewFailed")
					}) : null, envelope !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: generate_image_view_module_css_default.statusText,
						children: envelope
					}) : null]
				})
			});
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: generate_image_view_module_css_default.root,
			ref: rootRef,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
			}), viewing !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FullscreenViewer, {
				url: viewing.url,
				name: viewing.name,
				onClose: () => setViewing(void 0)
			}) : null]
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
	/** One generated image: resolve its URL, then render the frame + details. */
	function ImageRow(props) {
		const { image, loadImage, openLocally, stageEdit, onView, t, index } = props;
		const [url, setUrl] = (0, react.useState)(void 0);
		const [failed, setFailed] = (0, react.useState)(void 0);
		const [openState, setOpenState] = (0, react.useState)("idle");
		const [openError, setOpenError] = (0, react.useState)(void 0);
		const [editState, setEditState] = (0, react.useState)("idle");
		const [editError, setEditError] = (0, react.useState)(void 0);
		const [detailsOpen, setDetailsOpen] = (0, react.useState)(false);
		(0, react.useEffect)(() => {
			let alive = true;
			loadImage(image.attachment).then((resolved) => {
				if (alive) setUrl(resolved);
			}).catch((error) => {
				if (alive) setFailed(error instanceof Error ? error.message : String(error));
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
		const name = fileNameOf(image, index);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: generate_image_view_module_css_default.image,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: generate_image_view_module_css_default.action,
								onClick: () => setDetailsOpen(!detailsOpen),
								"aria-expanded": detailsOpen,
								title: t("toolviewDetails"),
								children: t("toolviewDetails")
							})
						]
					})] }) : failed !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: generate_image_view_module_css_default.loadFailed,
						role: "status",
						children: failed
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: generate_image_view_module_css_default.loading })
				}),
				detailsOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: generate_image_view_module_css_default.details,
					children: [
						typeof image.prompt === "string" && image.prompt !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: generate_image_view_module_css_default.detailRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: generate_image_view_module_css_default.detailLabel,
								children: t("toolviewPrompt")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${generate_image_view_module_css_default.detailValue} ${generate_image_view_module_css_default.detailPrompt}`,
								children: image.prompt
							})]
						}) : null,
						typeof image.model === "string" && image.model !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: generate_image_view_module_css_default.detailRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: generate_image_view_module_css_default.detailLabel,
								children: t("toolviewModel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: generate_image_view_module_css_default.detailValue,
								children: image.model
							})]
						}) : null,
						typeof image.size === "string" && image.size !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: generate_image_view_module_css_default.detailRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: generate_image_view_module_css_default.detailLabel,
								children: t("toolviewSize")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: generate_image_view_module_css_default.detailValue,
								children: image.size
							})]
						}) : null
					]
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: generate_image_view_module_css_default.caption,
					children: [
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
				})
			]
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
	const css$1 = "/**\n * Composer tool-row seat for the text-model upload button. Sits at the left\n * end of the tool row inside the composer card, beside the resident chrome\n * (access mode / plan / attach) — one compact always-visible control. Uses the\n * platform's own alias tokens so it reads as part of the bar.\n */\n\n.dsh-tig_wrap_1apho69 {\n  position: relative;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.dsh-tig_button_1apho69 {\n  height: 28px;\n  min-width: 68px;\n  padding: 0 10px;\n  border: none;\n  border-radius: 14px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13px;\n  line-height: 24px;\n  cursor: pointer;\n  white-space: nowrap;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.dsh-tig_button_1apho69:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_button_1apho69:disabled {\n  cursor: default;\n  opacity: 0.7;\n}\n\n.dsh-tig_button_1apho69[data-state='done'] {\n  color: var(--dsw-alias-state-success-primary, var(--dsw-static-deepseek-500));\n}\n\n/* Pending-draft chip: the picked image waits for the user's message, then the\n * send submits it together with the typed text. */\n.dsh-tig_selected_1apho69 {\n  height: 28px;\n  max-width: 220px;\n  padding: 0 4px 0 10px;\n  border-radius: 14px;\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13px;\n  line-height: 24px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.dsh-tig_selected_1apho69:hover {\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_remove_1apho69 {\n  flex: none;\n  width: 20px;\n  height: 20px;\n  border: none;\n  border-radius: 10px;\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 20px;\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.dsh-tig_remove_1apho69:hover {\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.dsh-tig_hidden_1apho69 {\n  display: none;\n}\n\n/* Floating failure note below the row (the tool row is one line tall). */\n.dsh-tig_error_1apho69 {\n  position: absolute;\n  top: calc(100% + 6px);\n  left: 0;\n  z-index: 10;\n  max-width: 260px;\n  background: var(--dsw-specific-bubble);\n  color: var(--dsw-alias-state-error-primary);\n  border-radius: 8px;\n  padding: 6px 10px;\n  font-size: 12px;\n  line-height: 18px;\n  box-shadow: var(--dsw-shadow-lv2);\n}\n";
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
	* The composer tool-row upload button, registered into `conversation.input.left`
	* (the left end of the tool row inside the composer card — a small
	* always-visible control).
	*
	* Why this exists: the platform's native composer upload is hard-rejected for
	* text-only models (apiproxy answers MODEL_DOES_NOT_SUPPORT_IMAGES for any
	* prompt whose content carries an `image` block), so this plugin offers its own
	* entry. The pick-file button is shown unconditionally: the same host-side
	* pending-upload path works for text-only AND image-capable models — the bytes
	* are stored, the model receives the work-dir path through the envelope, and
	* the user sees the picture inline through the plugin's uploaded-image bubble.
	*
	* (A previous revision gated the button behind a "model is text-only"
	* capability check fed by `connection.api.sessions.models`. That RPC no longer
	* exists on the DSH client connection handle, so the check always threw and
	* the button silently disappeared for every session — including text-only
	* ones. Capability gating is dropped entirely; showing the button can never
	* hide a working path.)
	*
	* Picking a file does NOT submit anything: the bytes are held as a per-session
	* pending draft (see pending-upload.ts). When the user types a message and
	* sends, the conversation sendSession wrapper (see index.ts) consumes the
	* draft — POSTing it to the UPLOAD bridge together with the typed text, so the
	* host enqueues ONE user message ([uploaded-image] block + model-facing
	* envelope carrying the text). The picture renders inline in the conversation
	* while the model only ever sees the envelope telling it the work-dir path to
	* feed back through generate_image's `image` parameter.
	*
	* The pending-draft "selected" chip renders for ANY session holding a draft —
	* the generated-image toolview's 修改 button (stageEdit) writes the same store,
	* so edit references stay visible in the composer too.
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
	* Render the composer upload button.
	* @param props - the input-left owner share + standard seats (sessionId) + face.
	* @returns the button cell (or the pending-draft chip while a draft is staged).
	*/
	function UploadButton(props) {
		const { t, sessionId } = props;
		const inputRef = (0, react.useRef)(null);
		const draft = (0, react.useSyncExternalStore)((0, react.useCallback)((listener) => subscribePending(sessionId, listener), [sessionId]), (0, react.useCallback)(() => getPending(sessionId), [sessionId]));
		const failure = (0, react.useSyncExternalStore)((0, react.useCallback)((listener) => subscribePendingFailure(sessionId, listener), [sessionId]), (0, react.useCallback)(() => getPendingFailure(sessionId), [sessionId]));
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
	const css = "/**\n * Faithful replica of the shipped user-message bubble chrome (captured from\n * the platform's MessageItem stylesheet), used by this plugin's shadowed\n * `user` node renderer. Registering the `user` key at a lower priority makes\n * this view render EVERY user message, so the rules must look native: same\n * row/stack/bubble tokens, same hover-revealed clock, same copy action.\n */\n\n.dsh-tig_userRow_x0891e {\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 6px;\n  display: flex;\n}\n\n.dsh-tig_userStack_x0891e {\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 8px;\n  min-width: 0;\n  max-width: min(525px, 82%);\n  display: flex;\n}\n\n.dsh-tig_bubble_x0891e {\n  background: var(--dsw-specific-bubble);\n  max-width: 100%;\n  color: var(--dsw-alias-label-primary);\n  border-radius: 22px;\n  padding: 10px 16px;\n  font-size: 16px;\n  line-height: 24px;\n}\n\n/* Decorated /name and @name tokens inside the bubble text. */\n.dsh-tig_refChip_x0891e {\n  color: var(--dsw-alias-label-primary);\n  white-space: nowrap;\n  vertical-align: baseline;\n  background: #6187d838;\n  border-radius: 6px;\n  margin: 0 2px;\n  padding: 0 8px;\n  font-size: 0.85em;\n  line-height: 1.6;\n  display: inline-block;\n}\n\n/* Hover actions column: clock (hover-revealed) + copy button. */\n.dsh-tig_actions_x0891e {\n  flex: none;\n  align-items: center;\n  gap: 10px;\n  height: 28px;\n  display: flex;\n}\n\n.dsh-tig_action_x0891e {\n  width: 28px;\n  height: 28px;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  background: 0 0;\n  border: none;\n  border-radius: 28px;\n  justify-content: center;\n  align-items: center;\n  padding: 6px;\n  display: inline-flex;\n}\n\n.dsh-tig_action_x0891e:hover {\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n/* Same hover-reveal as the shipped row (its selector targets its own scoped\n * classes; ours is scoped per build, so the rule is re-declared here). */\n.dsh-tig_timeStart_x0891e {\n  color: var(--dsw-alias-label-tertiary);\n  white-space: nowrap;\n  padding-right: 12px;\n  font-size: 14px;\n  line-height: 24px;\n  opacity: 0;\n  transition: opacity 80ms;\n}\n\n.dsh-tig_userRow_x0891e:hover .dsh-tig_timeStart_x0891e,\n.dsh-tig_userRow_x0891e:focus-within .dsh-tig_timeStart_x0891e {\n  opacity: 1;\n}\n\n/* Self-drawn reference-image strip (the attachment package's ImageGallery is\n * not exported by its client module, so images are rendered with plain <img>).\n * Aligned to the end, mirroring the shipped `align=\"end\"` gallery. */\n.dsh-tig_images_x0891e {\n  flex-wrap: wrap;\n  justify-content: flex-end;\n  gap: 8px;\n  max-width: 100%;\n  display: flex;\n}\n\n/* One image (single): rendered large. */\n.dsh-tig_hero_x0891e {\n  cursor: zoom-in;\n  background: 0 0;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 16px;\n  max-width: min(340px, 100%);\n  margin: 0;\n  padding: 0;\n  display: block;\n  overflow: hidden;\n}\n\n/* Several images: rendered as 64px square tiles. */\n.dsh-tig_thumb_x0891e {\n  cursor: zoom-in;\n  background: 0 0;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 12px;\n  flex: none;\n  width: 64px;\n  height: 64px;\n  margin: 0;\n  padding: 0;\n  display: block;\n  overflow: hidden;\n}\n\n.dsh-tig_img_x0891e {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  display: block;\n}\n\n/* Loading / failed state lines inside the image strip. */\n.dsh-tig_stateLine_x0891e {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 24px;\n}\n\n/* Fullscreen preview overlay (plugin-owned; the attachment lightbox is not\n * importable for the same reason as ImageGallery). */\n.dsh-tig_lightbox_x0891e {\n  position: fixed;\n  z-index: 1000;\n  background: #000c;\n  justify-content: center;\n  align-items: center;\n  inset: 0;\n  display: flex;\n}\n\n.dsh-tig_lightboxImg_x0891e {\n  max-width: 92vw;\n  max-height: 92vh;\n  border-radius: 10px;\n  display: block;\n}\n\n.dsh-tig_lightboxClose_x0891e {\n  position: absolute;\n  top: 14px;\n  right: 18px;\n  width: 32px;\n  height: 32px;\n  color: #fffc;\n  cursor: pointer;\n  background: #0000;\n  border: none;\n  border-radius: 32px;\n  justify-content: center;\n  align-items: center;\n  font-size: 18px;\n  display: flex;\n}\n\n.dsh-tig_lightboxClose_x0891e:hover {\n  background: #ffffff26;\n}\n";
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
		"timeStart": "dsh-tig_timeStart_x0891e",
		"images": "dsh-tig_images_x0891e",
		"hero": "dsh-tig_hero_x0891e",
		"thumb": "dsh-tig_thumb_x0891e",
		"img": "dsh-tig_img_x0891e",
		"stateLine": "dsh-tig_stateLine_x0891e",
		"lightbox": "dsh-tig_lightbox_x0891e",
		"lightboxImg": "dsh-tig_lightboxImg_x0891e",
		"lightboxClose": "dsh-tig_lightboxClose_x0891e"
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
	*
	* IMPORTANT: reference images are drawn with plain `<img>` elements resolved
	* through the load face — NOT through the attachment package's ImageGallery.
	* ImageGallery is an internal component of @deepseek-ai/dsh-client-ui-attachment
	* whose client module exports only { apply, inject }; importing it yields
	* `undefined` at runtime, which made this renderer crash with React error #130
	* on its very first message (the entry then abdicated and every user bubble
	* fell back to the shipped renderer, exposing the raw model-facing envelope).
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
	/** A usable display name for one attachment (ref name or fallback). */
	function attachmentName(attachment) {
		if (typeof attachment.name === "string" && attachment.name !== "") return attachment.name;
		return typeof attachment.mediaType === "string" && attachment.mediaType === "image/gif" ? "image.gif" : "image.png";
	}
	/** Resolve one attachment and render it as an `<img>` (self-drawn gallery). */
	function BubbleImage(props) {
		const { attachment, load, tile, onView, t } = props;
		const [url, setUrl] = (0, react.useState)(void 0);
		const [failed, setFailed] = (0, react.useState)(void 0);
		(0, react.useEffect)(() => {
			let alive = true;
			load(attachment).then((resolved) => {
				if (alive) setUrl(resolved);
			}).catch((error) => {
				if (alive) setFailed(error instanceof Error ? error.message : String(error));
			});
			return () => {
				alive = false;
			};
		}, [load, attachment]);
		if (url !== void 0) {
			const name = attachmentName(attachment);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: tile ? uploaded_image_bubble_module_css_default.thumb : uploaded_image_bubble_module_css_default.hero,
				title: name,
				"aria-label": t("image.label"),
				onClick: () => onView(url, name),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
					className: uploaded_image_bubble_module_css_default.img,
					src: url,
					alt: name,
					loading: "lazy"
				})
			});
		}
		if (failed !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: uploaded_image_bubble_module_css_default.stateLine,
			role: "status",
			children: t("image.loadFailed")
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: uploaded_image_bubble_module_css_default.stateLine,
			children: t("image.loading")
		});
	}
	/** Fullscreen image overlay: dark backdrop, Esc / backdrop-click closes. */
	function BubbleLightbox(props) {
		const { url, name, closeLabel, onClose } = props;
		(0, react.useEffect)(() => {
			const onKey = (event) => {
				if (event.key === "Escape") onClose();
			};
			window.addEventListener("keydown", onKey);
			return () => window.removeEventListener("keydown", onKey);
		}, [onClose]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: uploaded_image_bubble_module_css_default.lightbox,
			role: "dialog",
			"aria-label": name,
			onClick: onClose,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: uploaded_image_bubble_module_css_default.lightboxClose,
				"aria-label": closeLabel,
				onClick: onClose,
				children: "✕"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				className: uploaded_image_bubble_module_css_default.lightboxImg,
				src: url,
				alt: name,
				onClick: (event) => event.stopPropagation()
			})]
		});
	}
	/**
	* Render one user message: images (platform `image` + plugin `uploaded-image`)
	* above the text bubble, then the hover actions column.
	* @param props - the chat-node owner share, standard seats, and locale seat.
	* @returns the user bubble row.
	*/
	const UploadedImageBubble = (0, react.memo)(function UploadedImageBubble(props) {
		const { node, loadImage, t, sessionId } = props;
		const record = node !== null && typeof node === "object" ? node.data : void 0;
		const message = record !== null && typeof record === "object" ? record : void 0;
		const content = Array.isArray(message?.content) ? message.content : [];
		const time = message?.time;
		const [viewing, setViewing] = (0, react.useState)(void 0);
		const texts = [];
		const images = [];
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
				images.push(block.attachment);
				continue;
			}
			if (isUploadedImageBlock(block)) {
				images.push(block.attachment);
				continue;
			}
			rest.push(block);
		}
		const text = texts.join("");
		const showBubble = text !== "" || rest.length > 0;
		const imageIds = (0, react.useMemo)(() => new Set(images.map((attachment) => String(attachment.attachmentId))), [images]);
		const load = (0, react.useCallback)((attachment) => {
			if (typeof sessionId === "string" && sessionId !== "" && imageIds.has(String(attachment.attachmentId))) return Promise.resolve(`${ATTACHMENT_API.path}?session=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(String(attachment.attachmentId))}`);
			return loadImage(attachment);
		}, [
			imageIds,
			sessionId,
			loadImage
		]);
		const clock = (0, react.useMemo)(() => formatClock(time, t), [time, t]);
		const truncated = (0, react.useCallback)((total) => t("json.truncated", { total }), [t]);
		const tile = images.length > 1;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: uploaded_image_bubble_module_css_default.userRow,
			"data-time-hover-root": true,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: uploaded_image_bubble_module_css_default.userStack,
					children: [images.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: uploaded_image_bubble_module_css_default.images,
						children: images.map((attachment, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BubbleImage, {
							attachment,
							load,
							tile,
							onView: (url, name) => setViewing({
								url,
								name
							}),
							t
						}, `${String(attachment.attachmentId)}:${index}`))
					}) : null, showBubble && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: uploaded_image_bubble_module_css_default.bubble,
						children: [projectUserText(text), rest.map((block, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
							label: t("message.extraBlock"),
							payload: block,
							truncatedLabel: truncated
						}, index))]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: uploaded_image_bubble_module_css_default.actions,
					children: [clock !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: uploaded_image_bubble_module_css_default.timeStart,
						children: clock
					}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyAction, {
						text,
						t
					})]
				}),
				viewing !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BubbleLightbox, {
					url: viewing.url,
					name: viewing.name,
					closeLabel: t("image.closePreview"),
					onClose: () => setViewing(void 0)
				}) : null
			]
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
		const bridgeFetch = ctx.get("connection")?.isLoopback === true ? (input, init) => fetch(input, init) : () => {
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
		const uploadFace = { fetchFn: bridgeFetch };
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
