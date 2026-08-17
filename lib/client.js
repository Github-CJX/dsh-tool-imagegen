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
		fieldSizeHelp: "如 1024x1024 / 1024x1792 / 1792x1024，留空用上游默认。",
		fieldCount: "张数",
		fieldCountHelp: "一次生成几张（1–4）。",
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
		toolviewDownload: "下载图片"
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
		fieldSizeHelp: "e.g. 1024x1024 / 1024x1792 / 1792x1024; leave empty for the upstream default.",
		fieldCount: "Count",
		fieldCountHelp: "How many images to generate (1–4).",
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
		toolviewDownload: "Download image"
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
	//#region /0cssm:C:/Users/CJX/.dsh/plugins/dsh-tool-imagegen/src/client/settings-card.module.css.js
	const css$1 = "/**\n * dsh-tool-imagegen settings card styles. Mirrors the official plugin-config\n * card chrome (@deepseek-ai/dsh-client-ui-settings-plugins PluginCard + fields)\n * so the card reads as a sibling of the bash / agent-loop / web-search cards;\n * colors ride the dsh --dsw-* tokens.\n */\n\n.dsh-tig_card_de0d5o {\n  list-style: none;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 12px;\n  background: var(--dsw-alias-bg-layer-3);\n  transition: border-color 0.16s, background 0.16s;\n}\n\n.dsh-tig_card_de0d5o:hover {\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n/* An open card reads as the one being worked on, not merely taller. */\n.dsh-tig_card_de0d5o:has(.dsh-tig_body_de0d5o) {\n  background: var(--dsw-alias-bg-layer-2);\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n.dsh-tig_header_de0d5o {\n  width: 100%;\n  appearance: none;\n  border: 0;\n  background: none;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 14px 16px;\n  border-radius: 12px;\n}\n\n.dsh-tig_header_de0d5o:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: -2px;\n}\n\n.dsh-tig_headText_de0d5o {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.dsh-tig_name_de0d5o {\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 1.4;\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_description_de0d5o {\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dsh-tig_chevron_de0d5o,\n.dsh-tig_chevronOpen_de0d5o {\n  flex: none;\n  color: var(--dsw-alias-label-tertiary);\n  transition: transform 0.16s;\n}\n\n.dsh-tig_chevronOpen_de0d5o {\n  transform: rotate(180deg);\n}\n\n/* Carried on the header so a collapsed card still says it holds edits. */\n.dsh-tig_pending_de0d5o {\n  flex: none;\n  border-radius: 999px;\n  padding: 1px 8px;\n  font-size: 11px;\n  line-height: 17px;\n  font-weight: 500;\n  white-space: nowrap;\n  background: var(--dsw-alias-bg-module-platform);\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dsh-tig_body_de0d5o {\n  border-top: 1px solid var(--dsw-alias-border-l2);\n  margin: 0 16px;\n  padding-bottom: 8px;\n}\n\n/* --- fields (mirror of the official plugin-config fields) --------------------- */\n\n.dsh-tig_field_de0d5o {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  padding: 12px 0;\n}\n\n.dsh-tig_field_de0d5o + .dsh-tig_field_de0d5o {\n  border-top: 1px solid var(--dsw-alias-border-l2);\n}\n\n.dsh-tig_head_de0d5o {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.dsh-tig_label_de0d5o {\n  flex: 1;\n  min-width: 0;\n  font-size: 13px;\n  font-weight: 500;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_badges_de0d5o {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.dsh-tig_badge_de0d5o {\n  border-radius: 999px;\n  padding: 1px 8px;\n  font-size: 11px;\n  line-height: 17px;\n  white-space: nowrap;\n  font-weight: 500;\n  background: var(--dsw-alias-bg-module-platform);\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dsh-tig_reset_de0d5o {\n  border: none;\n  background: none;\n  padding: 0;\n  font: inherit;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n}\n\n.dsh-tig_reset_de0d5o:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary);\n}\n\n.dsh-tig_reset_de0d5o:disabled {\n  cursor: default;\n  opacity: 0.5;\n}\n\n.dsh-tig_input_de0d5o,\n.dsh-tig_select_de0d5o {\n  height: 34px;\n  padding: 0 12px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-layer-3);\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n  outline: none;\n}\n\n.dsh-tig_input_de0d5o:focus-visible,\n.dsh-tig_select_de0d5o:focus-visible {\n  border-color: var(--dsw-alias-brand-primary);\n}\n\n.dsh-tig_input_de0d5o:disabled,\n.dsh-tig_select_de0d5o:disabled {\n  color: var(--dsw-alias-label-tertiary);\n  cursor: default;\n}\n\n.dsh-tig_inputInvalid_de0d5o {\n  height: 34px;\n  padding: 0 12px;\n  border: 1px solid var(--dsw-alias-label-error);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-layer-3);\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n  outline: none;\n}\n\n.dsh-tig_hint_de0d5o,\n.dsh-tig_invalid_de0d5o {\n  margin: 0;\n  font-size: 12px;\n  line-height: 1.5;\n}\n\n.dsh-tig_hint_de0d5o {\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dsh-tig_invalid_de0d5o {\n  color: var(--dsw-alias-label-error);\n}\n\n.dsh-tig_readOnly_de0d5o,\n.dsh-tig_notExposed_de0d5o {\n  margin: 12px 0 0;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* --- footer (mirror of the official card footer) ------------------------------ */\n\n.dsh-tig_footer_de0d5o {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 8px;\n  padding: 12px 0 4px;\n  border-top: 1px solid var(--dsw-alias-border-l2);\n}\n\n.dsh-tig_failed_de0d5o {\n  flex: 1;\n  min-width: 0;\n  margin: 0;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-error);\n}\n\n.dsh-tig_discard_de0d5o,\n.dsh-tig_save_de0d5o {\n  appearance: none;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  padding: 5px 14px;\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.5;\n  cursor: pointer;\n}\n\n.dsh-tig_discard_de0d5o {\n  border-color: var(--dsw-alias-border-l2);\n  background: none;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dsh-tig_discard_de0d5o:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n.dsh-tig_save_de0d5o {\n  background: var(--dsw-alias-label-primary);\n  color: var(--dsw-alias-bg-layer-3);\n}\n\n.dsh-tig_discard_de0d5o:disabled,\n.dsh-tig_save_de0d5o:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.dsh-tig_discard_de0d5o:focus-visible,\n.dsh-tig_save_de0d5o:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: 1px;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-tig_card_de0d5o, .dsh-tig_chevron_de0d5o, .dsh-tig_chevronOpen_de0d5o {\n    transition: none;\n  }\n}\n";
	const tagId$1 = "@local/dsh-tool-imagegen/src/client/settings-card.module.css";
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
		const tag = document.createElement("style");
		tag.dataset.pluginCss = tagId$1;
		tag.textContent = css$1;
		document.head.appendChild(tag);
	}
	var settings_card_module_css_default = {
		"card": "dsh-tig_card_de0d5o",
		"body": "dsh-tig_body_de0d5o",
		"header": "dsh-tig_header_de0d5o",
		"headText": "dsh-tig_headText_de0d5o",
		"name": "dsh-tig_name_de0d5o",
		"description": "dsh-tig_description_de0d5o",
		"chevron": "dsh-tig_chevron_de0d5o",
		"chevronOpen": "dsh-tig_chevronOpen_de0d5o",
		"pending": "dsh-tig_pending_de0d5o",
		"field": "dsh-tig_field_de0d5o",
		"head": "dsh-tig_head_de0d5o",
		"label": "dsh-tig_label_de0d5o",
		"badges": "dsh-tig_badges_de0d5o",
		"badge": "dsh-tig_badge_de0d5o",
		"reset": "dsh-tig_reset_de0d5o",
		"input": "dsh-tig_input_de0d5o",
		"select": "dsh-tig_select_de0d5o",
		"inputInvalid": "dsh-tig_inputInvalid_de0d5o",
		"hint": "dsh-tig_hint_de0d5o",
		"invalid": "dsh-tig_invalid_de0d5o",
		"readOnly": "dsh-tig_readOnly_de0d5o",
		"notExposed": "dsh-tig_notExposed_de0d5o",
		"footer": "dsh-tig_footer_de0d5o",
		"failed": "dsh-tig_failed_de0d5o",
		"discard": "dsh-tig_discard_de0d5o",
		"save": "dsh-tig_save_de0d5o"
	};
	//#endregion
	//#region src/client/SettingsCard.tsx
	/**
	* The dsh-tool-imagegen settings card: api_url, api_key (secret, display-only
	* "set" state), model (default gpt-image-2, hand-editable), size, count, and
	* the plugin switches. Registers into the official `settings.plugin.item` slot
	* (the Settings → Plugins → Configurable tab), independent of the dsh-web-ui
	* family group, bound to the plugin's own bridge settings scope.
	*/
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
				numberField("n")
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
				n: this.form.field("n")
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
		const { t } = props;
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
			disabled
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
						placeholder: "1024x1024",
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
					})
				]
			}) : null]
		});
	}
	/** A staged value field; `secret` renders a password control. */
	function ValueField(props) {
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
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					id: props.id,
					className: props.invalid ? settings_card_module_css_default.inputInvalid : settings_card_module_css_default.input,
					type: props.secret === true ? "password" : "text",
					autoComplete: props.secret === true ? "off" : void 0,
					...props.invalid ? { "aria-invalid": true } : {},
					value: props.text,
					placeholder: props.placeholder ?? "",
					disabled: props.disabled,
					onChange: (event) => {
						props.onEdit(event.target.value);
					}
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
	//#region /0cssm:C:/Users/CJX/.dsh/plugins/dsh-tool-imagegen/src/client/generate-image-view.module.css.js
	const css = "/**\n * dsh-tool-imagegen inline conversation view. Mirrors the platform tool-row\n * chrome so generated images read as a sibling of the bash/read/search rows,\n * riding the dsh --dsw-* tokens.\n */\n\n.dsh-tig_root_7b1fz3 {\n  display: flex;\n  flex-direction: column;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 12px;\n  background: var(--dsw-alias-bg-layer-3);\n  overflow: hidden;\n}\n\n.dsh-tig_head_7b1fz3 {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  height: 40px;\n  padding: 0 14px;\n  border-bottom: 1px solid var(--dsw-alias-border-l2);\n}\n\n.dsh-tig_title_7b1fz3 {\n  color: var(--dsw-alias-label-secondary);\n  flex: none;\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 24px;\n}\n\n.dsh-tig_meta_7b1fz3 {\n  color: var(--dsw-alias-label-tertiary);\n  flex: auto;\n  min-width: 0;\n  font-size: 12px;\n  line-height: 24px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n\n.dsh-tig_state_7b1fz3 {\n  color: var(--dsw-alias-state-error-primary);\n  flex: none;\n  font-size: 12px;\n  line-height: 24px;\n}\n\n.dsh-tig_body_7b1fz3 {\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  padding: 14px;\n}\n\n.dsh-tig_image_7b1fz3 {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  min-width: 0;\n}\n\n.dsh-tig_frame_7b1fz3 {\n  position: relative;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-2);\n  overflow: hidden;\n}\n\n.dsh-tig_img_7b1fz3 {\n  display: block;\n  max-width: 100%;\n  max-height: 480px;\n  margin: 0 auto;\n}\n\n.dsh-tig_download_7b1fz3 {\n  position: absolute;\n  right: 10px;\n  bottom: 10px;\n  padding: 4px 10px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 6px;\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-3) 86%, transparent);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  text-decoration: none;\n  opacity: 0;\n  transition: opacity 0.15s ease;\n}\n\n.dsh-tig_frame_7b1fz3:hover .dsh-tig_download_7b1fz3,\n.dsh-tig_frame_7b1fz3:focus-within .dsh-tig_download_7b1fz3 {\n  opacity: 1;\n}\n\n.dsh-tig_download_7b1fz3:hover {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-border-l1);\n}\n\n.dsh-tig_caption_7b1fz3 {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n}\n\n.dsh-tig_captionLine_7b1fz3 {\n  margin: 0;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-tertiary);\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n\n.dsh-tig_captionPrompt_7b1fz3 {\n  color: var(--dsw-alias-label-secondary);\n}\n\n/* --- running / loading / error states ---------------------------------------- */\n\n.dsh-tig_running_7b1fz3 {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-height: 40px;\n  padding: 10px 14px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.dsh-tig_spinner_7b1fz3 {\n  flex: none;\n  width: 14px;\n  height: 14px;\n  border: 2px solid var(--dsw-alias-border-l2);\n  border-top-color: var(--dsw-alias-label-tertiary);\n  border-radius: 50%;\n  animation: dsh-tool-imagegen-spin 0.8s linear infinite;\n}\n\n@keyframes dsh-tool-imagegen-spin {\n  to { transform: rotate(360deg); }\n}\n\n.dsh-tig_loading_7b1fz3 {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 120px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 20px;\n}\n\n.dsh-tig_loadFailed_7b1fz3 {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 120px;\n  padding: 0 14px;\n  color: var(--dsw-alias-state-error-primary);\n  font-size: 12px;\n  line-height: 20px;\n  text-align: center;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-tig_spinner_7b1fz3 {\n    animation: none;\n  }\n}\n";
	const tagId = "@local/dsh-tool-imagegen/src/client/generate-image-view.module.css";
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
		const tag = document.createElement("style");
		tag.dataset.pluginCss = tagId;
		tag.textContent = css;
		document.head.appendChild(tag);
	}
	var generate_image_view_module_css_default = {
		"root": "dsh-tig_root_7b1fz3",
		"head": "dsh-tig_head_7b1fz3",
		"title": "dsh-tig_title_7b1fz3",
		"meta": "dsh-tig_meta_7b1fz3",
		"state": "dsh-tig_state_7b1fz3",
		"body": "dsh-tig_body_7b1fz3",
		"image": "dsh-tig_image_7b1fz3",
		"frame": "dsh-tig_frame_7b1fz3",
		"img": "dsh-tig_img_7b1fz3",
		"download": "dsh-tig_download_7b1fz3",
		"caption": "dsh-tig_caption_7b1fz3",
		"captionLine": "dsh-tig_captionLine_7b1fz3",
		"captionPrompt": "dsh-tig_captionPrompt_7b1fz3",
		"running": "dsh-tig_running_7b1fz3",
		"spinner": "dsh-tig_spinner_7b1fz3",
		"loading": "dsh-tig_loading_7b1fz3",
		"loadFailed": "dsh-tig_loadFailed_7b1fz3"
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
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: generate_image_view_module_css_default.body,
				children: images.map((image, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImageRow, {
					image,
					loadImage: props.loadImage,
					t: props.t,
					index
				}, image.attachment.attachmentId ?? `generated-${index}`))
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
		const { image, loadImage, t, index } = props;
		const [url, setUrl] = (0, react.useState)(void 0);
		const [failed, setFailed] = (0, react.useState)(void 0);
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
		const meta = (() => {
			const parts = [];
			if (typeof image.model === "string" && image.model !== "") parts.push(`${image.model}`);
			if (typeof image.size === "string" && image.size !== "") parts.push(image.size);
			return parts.join(" · ");
		})();
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: generate_image_view_module_css_default.image,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: generate_image_view_module_css_default.frame,
				children: url !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
					className: generate_image_view_module_css_default.img,
					src: url,
					alt: image.prompt,
					loading: "lazy"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
					className: generate_image_view_module_css_default.download,
					href: url,
					download: fileNameOf(image, index),
					title: t("toolviewDownload"),
					children: t("toolviewDownload")
				})] }) : failed !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: generate_image_view_module_css_default.loadFailed,
					role: "status",
					children: failed
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: generate_image_view_module_css_default.loading })
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: generate_image_view_module_css_default.caption,
				children: [meta !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: generate_image_view_module_css_default.captionLine,
					children: meta
				}) : null, image.prompt !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: `${generate_image_view_module_css_default.captionLine} ${generate_image_view_module_css_default.captionPrompt}`,
					children: image.prompt
				}) : null]
			})]
		});
	}
	//#endregion
	//#region src/client/index.ts
	/** Locale namespace this plugin owns. */
	const NS = "dsh-imagegen";
	/** Required services (fiber inject waiting — the runtime must be up first). */
	const inject = [
		"slots",
		"locale",
		"connection"
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
		const scope = bindImageGenScope(ctx.get("connection")?.isLoopback === true ? (input, init) => fetch(input, init) : () => {
			throw new Error("settings bridge is loopback-only");
		});
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
				id: "imagegen",
				order: 30,
				locale: NS,
				inject: () => settingsCard.inject()
			}, ImageGenSettingsCard));
		} catch (error) {
			console.warn("[dsh-tool-imagegen] settings card registration failed:", error);
		}
		try {
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "generate_image",
				locale: NS,
				inject: (sessionId) => ({ loadImage: (attachment) => Promise.resolve(`${ATTACHMENT_API.path}?session=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(attachment.attachmentId)}`) })
			}, GenerateImageView));
		} catch (error) {
			console.warn("[dsh-tool-imagegen] toolview registration failed:", error);
		}
	}
	//#endregion
	exports.apply = apply;
	exports.inject = inject;
	
		return module.exports;
	}
});
