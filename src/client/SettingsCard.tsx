/**
 * The dsh-tool-imagegen settings card: api_url, api_key (secret, display-only
 * "set" state), model (default gpt-image-2, hand-editable), size, count, and
 * the plugin switches. Registers into the official `settings.plugin.item` slot
 * (the Settings → Plugins → Configurable tab), independent of the dsh-web-ui
 * family group, bound to the plugin's own bridge settings scope.
 */

import { useEffect, useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'
import { CardForm, booleanField, numberField, secretField, textField, type CardActions, type CardShell, type FieldState as CardFieldState } from './settings-form.ts'
import type { ImageGenScope } from './settings-scope.ts'
import { StorageSection, type MaintenanceCardFace } from './MaintenanceCard.tsx'
import css from './settings-card.module.css'

/** The fields this card edits (the namespace's full schema). */
export interface ImageGenSettings {
  enabled?: boolean
  announceToAgent?: boolean
  apiUrl?: string
  apiKey?: string
  model?: string
  size?: string
  n?: number
  quality?: string
  output_format?: string
  background?: string
  style?: string
  moderation?: string
  watermark?: string
  /** Enable switches for all six optional params ("check to use this
   *  parameter"; off by default — the field is locked and the value is
   *  neither sent upstream nor advertised to the model). */
  quality_enabled?: boolean
  output_format_enabled?: boolean
  background_enabled?: boolean
  style_enabled?: boolean
  moderation_enabled?: boolean
  watermark_enabled?: boolean
}

/** What the card renders. */
export interface ImageGenSettingsCardState extends CardShell {
  /** Master switch. */
  enabled: CardFieldState
  /** System-prompt announcement flag. */
  announceToAgent: CardFieldState
  /** API base URL. */
  apiUrl: CardFieldState
  /** API key draft (the stored value is never rendered). */
  apiKey: CardFieldState
  /** Upstream model name (default gpt-image-2). */
  model: CardFieldState
  /** Image size. */
  size: CardFieldState
  /** Image count (1–4). */
  n: CardFieldState
  /** Optional quality (low/medium/high). */
  quality: CardFieldState
  /** Optional output format (png/jpeg/webp). */
  output_format: CardFieldState
  /** Optional background (transparent/opaque/auto). */
  background: CardFieldState
  /** Optional style (vivid/natural). */
  style: CardFieldState
  /** Optional moderation (low/medium/high). */
  moderation: CardFieldState
  /** Optional watermark (triw/none/auto). */
  watermark: CardFieldState
  /** Enable switches for the six optional parameters. */
  quality_enabled: CardFieldState
  output_format_enabled: CardFieldState
  background_enabled: CardFieldState
  style_enabled: CardFieldState
  moderation_enabled: CardFieldState
  watermark_enabled: CardFieldState
}

/** Enum suggestion lists for the optional upstream parameters (editable, not enforced). */
const ENUM_OPTIONS: Record<string, string[]> = {
  quality: ['low', 'medium', 'high'],
  output_format: ['png', 'jpeg', 'webp'],
  background: ['transparent', 'opaque', 'auto'],
  style: ['vivid', 'natural'],
  moderation: ['low', 'medium', 'high'],
  watermark: ['triw', 'none', 'auto'],
}

/** Official gpt-image-2 canvas sizes (最大边 ≤ 3840px；'auto' = 上游默认).
 *  A suggestion list only — any size the upstream accepts can be typed. */
const SIZE_OPTIONS = ['auto', '512x512', '1024x1024', '1536x1024', '1024x1536', '2048x2048', '2048x1152', '3840x2160', '2160x3840']

/** The registration-side face the card's slot entry injects. */
export interface ImageGenSettingsCardFace extends CardActions {
  hooks: {
    /** Card snapshot bound by the renderer as useImageGenSettingsCard. */
    imageGenSettingsCard: SnapshotStore<ImageGenSettingsCardState>
    /** Whether a secret (apiKey) is currently stored. */
    imageGenKeySet: SnapshotStore<boolean>
  }
  /** Storage-maintenance face for the embedded cleanup section (rc.7: one card per key). */
  maintenance: MaintenanceCardFace
}

/** Bridges the imagegen scope onto the card's staged form. */
export class ImageGenSettingsCardController {
  private readonly form: CardForm<ImageGenSettings>

  /** @param scope - the bound bridge scope for the dsh-imagegen namespace. */
  constructor(private readonly scope: ImageGenScope) {
    this.form = new CardForm(scope, [
      booleanField('enabled'),
      booleanField('announceToAgent'),
      textField('apiUrl'),
      secretField('apiKey'),
      textField('model'),
      textField('size'),
      numberField('n'),
      textField('quality'),
      textField('output_format'),
      textField('background'),
      textField('style'),
      textField('moderation'),
      textField('watermark'),
      booleanField('quality_enabled'),
      booleanField('output_format_enabled'),
      booleanField('background_enabled'),
      booleanField('style_enabled'),
      booleanField('moderation_enabled'),
      booleanField('watermark_enabled'),
    ], {
      // The redacted wire view never returns the key; a save's outcome is
      // judged by the namespace's secrets sidecar instead.
      secretSettled: () => this.scope.getKeySetSnapshot(),
    })
  }

  private projection(): ImageGenSettingsCardState {
    return {
      ...this.form.shell(),
      enabled: this.form.field('enabled'),
      announceToAgent: this.form.field('announceToAgent'),
      apiUrl: this.form.field('apiUrl'),
      apiKey: this.form.field('apiKey'),
      model: this.form.field('model'),
      size: this.form.field('size'),
      n: this.form.field('n'),
      quality: this.form.field('quality'),
      output_format: this.form.field('output_format'),
      background: this.form.field('background'),
      style: this.form.field('style'),
      moderation: this.form.field('moderation'),
      watermark: this.form.field('watermark'),
      quality_enabled: this.form.field('quality_enabled'),
      output_format_enabled: this.form.field('output_format_enabled'),
      background_enabled: this.form.field('background_enabled'),
      style_enabled: this.form.field('style_enabled'),
      moderation_enabled: this.form.field('moderation_enabled'),
      watermark_enabled: this.form.field('watermark_enabled'),
    }
  }

  /**
   * Build the face the card's slot registration injects.
   * @returns the card's snapshot, the key-set flag, and the form actions.
   */
  inject(): ImageGenSettingsCardFace {
    const cardStore = this.form.bind(() => this.projection())
    const keySetStore = createSnapshotStore(this.scope.getKeySetSnapshot())
    this.scope.subscribeKeySet(() => { keySetStore.set(this.scope.getKeySetSnapshot()) })
    return {
      hooks: {
        imageGenSettingsCard: cardStore,
        imageGenKeySet: keySetStore,
      },
      ...this.form.actions(),
    }
  }
}

/** Props the renderer binds for this card. */
export type ImageGenSettingsCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'dsh-imagegen'>
  & InjectFace<ImageGenSettingsCardFace>

/**
 * Render the card.
 * @param props - locale copy, the card snapshot, and the form actions.
 * @returns the card, or nothing while the namespace is still loading.
 */
export function ImageGenSettingsCard(props: ImageGenSettingsCardProps) {
  const { t, maintenance } = props
  const state = props.useImageGenSettingsCard(snapshot => snapshot)
  const keySet = props.useImageGenKeySet(snapshot => snapshot)
  const [open, setOpen] = useState(false)
  if (!state.available) return null
  const title = t('cardTitle')
  const blocked = !state.dirty || state.invalid || state.saving
  const disabled = !state.writable
  const fieldProps = {
    overriddenLabel: t('overridden'),
    resetLabel: t('reset'),
    invalidLabel: t('invalidNumber'),
    disabled,
    comboAriaLabel: t('comboAria'),
    comboEmptyLabel: t('comboEmpty'),
  }
  if (!state.exposed) {
    return (
      <li className={css.card}>
        <button
          type="button"
          className={css.header}
          aria-expanded={open}
          aria-label={`${t(open ? 'collapse' : 'expand')}: ${title}`}
          onClick={() => { setOpen(!open) }}
        >
          <span className={css.headText}>
            <span className={css.name}>{title}</span>
            <span className={css.description}>{t('cardDescription')}</span>
          </span>
          <span className={open ? css.chevronOpen : css.chevron}>▾</span>
        </button>
        {open
          ? (
            <div className={css.body}>
              <p className={css.notExposed} role="status">{t('notExposed')}</p>
            </div>
          )
          : null}
      </li>
    )
  }
  return (
    <li className={css.card}>
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        aria-label={`${t(open ? 'collapse' : 'expand')}: ${title}`}
        onClick={() => { setOpen(!open) }}
      >
        <span className={css.headText}>
          <span className={css.name}>{title}</span>
          <span className={css.description}>{t('cardDescription')}</span>
        </span>
        {state.dirty ? <span className={css.pending}>{t('unsaved')}</span> : null}
        <span className={open ? css.chevronOpen : css.chevron}>▾</span>
      </button>
      {open
        ? (
          <div className={css.body}>
            {!state.writable ? <p className={css.readOnly} role="status">{t('readOnly')}</p> : null}
            <ValueField
              id="dsh-imagegen-settings-apikey"
              label={t('fieldApiKey')}
              hint={keySet ? t('apiKeySet') : t('fieldApiKeyHelp')}
              placeholder="sk-…"
              secret
              {...fieldProps}
              {...state.apiKey}
              overridden={false}
              onEdit={(text) => { props.edit('apiKey', text) }}
              onReset={() => { props.resetField('apiKey') }}
              clearLabel={t('apiKeyClear')}
              onClear={() => { props.resetField('apiKey') }}
              canClear={keySet}
            />
            <ValueField
              id="dsh-imagegen-settings-apiurl"
              label={t('fieldApiUrl')}
              hint={t('fieldApiUrlHelp')}
              placeholder="https://api.ephone.ai/v1"
              {...fieldProps}
              {...state.apiUrl}
              onEdit={(text) => { props.edit('apiUrl', text) }}
              onReset={() => { props.resetField('apiUrl') }}
            />
            <ValueField
              id="dsh-imagegen-settings-model"
              label={t('fieldModel')}
              hint={t('fieldModelHelp')}
              placeholder="gpt-image-2"
              {...fieldProps}
              {...state.model}
              onEdit={(text) => { props.edit('model', text) }}
              onReset={() => { props.resetField('model') }}
            />
            <ValueField
              id="dsh-imagegen-settings-size"
              label={t('fieldSize')}
              hint={t('fieldSizeHelp')}
              placeholder="auto"
              comboOptions={SIZE_OPTIONS}
              {...fieldProps}
              {...state.size}
              onEdit={(text) => { props.edit('size', text) }}
              onReset={() => { props.resetField('size') }}
            />
            <ValueField
              id="dsh-imagegen-settings-quality"
              label={t('fieldQuality')}
              hint={state.quality_enabled.text === 'true' ? t('fieldQualityHelp') : t('fieldGatedHint')}
              placeholder={t('fieldOptionalPlaceholder')}
              comboOptions={ENUM_OPTIONS.quality}
              checked={state.quality_enabled.text === 'true'}
              onChecked={(checked) => { props.edit('quality_enabled', checked ? 'true' : 'false') }}
              {...fieldProps}
              {...state.quality}
              locked={state.quality_enabled.text !== 'true'}
              onEdit={(text) => { props.edit('quality', text) }}
              onReset={() => { props.resetField('quality') }}
            />
            <ValueField
              id="dsh-imagegen-settings-output-format"
              label={t('fieldOutputFormat')}
              hint={state.output_format_enabled.text === 'true' ? t('fieldOutputFormatHelp') : t('fieldUnsupportedHint')}
              placeholder={t('fieldOptionalPlaceholder')}
              comboOptions={ENUM_OPTIONS.output_format}
              checked={state.output_format_enabled.text === 'true'}
              onChecked={(checked) => { props.edit('output_format_enabled', checked ? 'true' : 'false') }}
              {...fieldProps}
              {...state.output_format}
              locked={state.output_format_enabled.text !== 'true'}
              onEdit={(text) => { props.edit('output_format', text) }}
              onReset={() => { props.resetField('output_format') }}
            />
            <ValueField
              id="dsh-imagegen-settings-background"
              label={t('fieldBackground')}
              hint={state.background_enabled.text === 'true' ? t('fieldBackgroundHelp') : t('fieldGatedHint')}
              placeholder={t('fieldOptionalPlaceholder')}
              comboOptions={ENUM_OPTIONS.background}
              checked={state.background_enabled.text === 'true'}
              onChecked={(checked) => { props.edit('background_enabled', checked ? 'true' : 'false') }}
              {...fieldProps}
              {...state.background}
              locked={state.background_enabled.text !== 'true'}
              onEdit={(text) => { props.edit('background', text) }}
              onReset={() => { props.resetField('background') }}
            />
            <ValueField
              id="dsh-imagegen-settings-style"
              label={t('fieldStyle')}
              hint={state.style_enabled.text === 'true' ? t('fieldStyleHelp') : t('fieldUnsupportedHint')}
              placeholder={t('fieldOptionalPlaceholder')}
              comboOptions={ENUM_OPTIONS.style}
              checked={state.style_enabled.text === 'true'}
              onChecked={(checked) => { props.edit('style_enabled', checked ? 'true' : 'false') }}
              {...fieldProps}
              {...state.style}
              locked={state.style_enabled.text !== 'true'}
              onEdit={(text) => { props.edit('style', text) }}
              onReset={() => { props.resetField('style') }}
            />
            <ValueField
              id="dsh-imagegen-settings-moderation"
              label={t('fieldModeration')}
              hint={state.moderation_enabled.text === 'true' ? t('fieldModerationHelp') : t('fieldGatedHint')}
              placeholder={t('fieldOptionalPlaceholder')}
              comboOptions={ENUM_OPTIONS.moderation}
              checked={state.moderation_enabled.text === 'true'}
              onChecked={(checked) => { props.edit('moderation_enabled', checked ? 'true' : 'false') }}
              {...fieldProps}
              {...state.moderation}
              locked={state.moderation_enabled.text !== 'true'}
              onEdit={(text) => { props.edit('moderation', text) }}
              onReset={() => { props.resetField('moderation') }}
            />
            <ValueField
              id="dsh-imagegen-settings-watermark"
              label={t('fieldWatermark')}
              hint={state.watermark_enabled.text === 'true' ? t('fieldWatermarkHelp') : t('fieldUnsupportedHint')}
              placeholder={t('fieldOptionalPlaceholder')}
              comboOptions={ENUM_OPTIONS.watermark}
              checked={state.watermark_enabled.text === 'true'}
              onChecked={(checked) => { props.edit('watermark_enabled', checked ? 'true' : 'false') }}
              {...fieldProps}
              {...state.watermark}
              locked={state.watermark_enabled.text !== 'true'}
              onEdit={(text) => { props.edit('watermark', text) }}
              onReset={() => { props.resetField('watermark') }}
            />
            <ValueField
              id="dsh-imagegen-settings-count"
              label={t('fieldCount')}
              hint={t('fieldCountHelp')}
              placeholder="1"
              {...fieldProps}
              {...state.n}
              onEdit={(text) => { props.edit('n', text) }}
              onReset={() => { props.resetField('n') }}
            />
            <BooleanField
              id="dsh-imagegen-settings-enabled"
              label={t('fieldEnabled')}
              hint={t('fieldEnabledHelp')}
              inheritLabel={t('inherit')}
              onLabel={t('on')}
              offLabel={t('off')}
              {...fieldProps}
              {...state.enabled}
              onEdit={(text) => { props.edit('enabled', text) }}
              onReset={() => { props.resetField('enabled') }}
            />
            <BooleanField
              id="dsh-imagegen-settings-announce"
              label={t('fieldAnnounce')}
              hint={t('fieldAnnounceHelp')}
              inheritLabel={t('inherit')}
              onLabel={t('on')}
              offLabel={t('off')}
              {...fieldProps}
              {...state.announceToAgent}
              onEdit={(text) => { props.edit('announceToAgent', text) }}
              onReset={() => { props.resetField('announceToAgent') }}
            />
            <div className={css.footer}>
              {state.failed ? <p className={css.failed} role="status">{t('failed')}</p> : null}
              <button
                type="button"
                className={css.discard}
                disabled={!state.dirty || state.saving}
                onClick={props.discard}
              >
                {t('discard')}
              </button>
              <button
                type="button"
                className={css.save}
                disabled={blocked}
                onClick={props.save}
              >
                {t(!state.saving ? 'save' : 'saving')}
              </button>
            </div>
            <StorageSection t={t} fetchFn={maintenance.fetchFn} />
          </div>
        )
        : null}
    </li>
  )
}

/** Props every field control needs regardless of its value type. */
interface FieldProps {
  /** Stable id associating the label with its control. */
  id: string
  /** Visible label. */
  label: string
  /** One-line explanation rendered under the control. */
  hint: string
  /** Draft text this control renders. */
  text: string
  /** True when saving would leave a user-layer entry for this field. */
  overridden: boolean
  /** True when the draft is not a value this field accepts. */
  invalid: boolean
  /** Copy for the overridden badge. */
  overriddenLabel: string
  /** Copy for the reset control. */
  resetLabel: string
  /** Copy shown in place of the hint while the draft is invalid. */
  invalidLabel: string
  /** Disables every control (read-only document, or an unavailable namespace). */
  disabled: boolean
  /** aria-label of the combo toggle button. */
  comboAriaLabel?: string
  /** Copy for the combo panel's empty-suggestion row. */
  comboEmptyLabel?: string
  /** Stage draft text. */
  onEdit: (text: string) => void
  /** Stage a clear so the field re-inherits the composition layer. */
  onReset: () => void
}

/** A staged value field; `secret` renders a password control and
 *  `comboOptions` renders a self-drawn editable combo (input + option panel
 *  styled as part of the card — the native datalist popup looked detached
 *  from the card). Suggestions are hints only: any typed value is kept,
 *  the panel filters by substring, and the current draft is marked. */
function ValueField(props: FieldProps & {
  /** Render a password control. */
  secret?: boolean
  /** Placeholder shown while the draft is empty. */
  placeholder?: string
  /** Label of the dedicated clear control (secret fields). */
  clearLabel?: string
  /** Stage a clear of the stored secret. */
  onClear?: () => void
  /** Whether a stored secret exists (enables the clear control). */
  canClear?: boolean
  /** Suggestion values for the editable combo. */
  comboOptions?: string[]
  /** When present, renders a "use this parameter" checkbox before the label.
   *  Unchecked locks the control and (host-side) drops the parameter from the
   *  upstream request and the tool schema. */
  checked?: boolean
  /** Stage the enable-switch state the checkbox edits. */
  onChecked?: (checked: boolean) => void
  /** Parameter disabled by its unchecked enable box (locks the input only —
   *  the checkbox itself must stay clickable so it can be turned on). */
  locked?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const comboRef = useRef<HTMLDivElement>(null)

  // Close on outside pointer-down or Escape while the panel is open.
  useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => {
      if (event.target instanceof Node && comboRef.current?.contains(event.target) === false) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const needle = props.text.trim().toLowerCase()
  // Filter by substring while typing, BUT show every option when the current
  // text is an exact option value — otherwise opening the panel with the
  // default value (e.g. "1024x1024") already in the box filters the list down
  // to that single option and the dropdown looks empty of alternatives.
  const exactMatch = props.comboOptions !== undefined
    && props.comboOptions.includes(props.text.trim())
  const matches = props.comboOptions !== undefined
    ? (exactMatch
      ? props.comboOptions
      : props.comboOptions.filter(option => option.toLowerCase().includes(needle)))
    : []
  // Reset the arrow-key position when typing narrows the suggestions.
  useEffect(() => { setFocusIndex(0) }, [needle])

  const combo = props.comboOptions !== undefined
    ? (
      <div className={css.combo} ref={comboRef}>
        <input
          id={props.id}
          className={props.invalid ? css.comboInputInvalid : css.comboInput}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${props.id}-options`}
          aria-activedescendant={open && matches[focusIndex] !== undefined
            ? `${props.id}-option-${focusIndex}`
            : undefined}
          {...props.invalid ? { 'aria-invalid': true } : {}}
          value={props.text}
          placeholder={props.placeholder ?? ''}
          disabled={props.disabled || props.locked === true}
          onChange={(event) => { props.onEdit(event.target.value) }}
          onClick={() => { if (!props.disabled && props.locked !== true && !open) setOpen(true) }}
          onFocus={() => { if (!props.disabled && props.locked !== true && props.text.trim() !== '') setOpen(true) }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setOpen(true)
              setFocusIndex(Math.min(focusIndex + 1, Math.max(matches.length - 1, 0)))
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setOpen(true)
              setFocusIndex(Math.max(focusIndex - 1, 0))
            } else if (event.key === 'Enter' && open && matches[focusIndex] !== undefined) {
              event.preventDefault()
              props.onEdit(matches[focusIndex])
              setOpen(false)
            }
          }}
        />
        <button
          type="button"
          className={css.comboToggle}
          aria-label={props.comboAriaLabel}
          aria-expanded={open}
          disabled={props.disabled || props.locked === true}
          onClick={() => { setOpen(!open) }}
        >
          ▾
        </button>
        {open
          ? (
            <div className={css.comboPanel} id={`${props.id}-options`} role="listbox">
              {matches.length === 0
                ? <div className={css.comboEmpty}>{props.comboEmptyLabel}</div>
                : matches.map((option, index) => (
                  <button
                    type="button"
                    id={`${props.id}-option-${index}`}
                    key={option}
                    role="option"
                    aria-selected={option === props.text.trim()}
                    className={option === props.text.trim()
                      ? `${css.comboOption} ${css.comboOptionSelected}`
                      : css.comboOption}
                    onMouseEnter={() => { setFocusIndex(index) }}
                    onMouseDown={(event) => { event.preventDefault() }}
                    onClick={() => { props.onEdit(option); setOpen(false) }}
                  >
                    {option}
                  </button>
                ))}
            </div>
          )
          : null}
      </div>
    )
    : null

  return (
    <div className={css.field}>
      <div className={css.head}>
        <label className={css.label} htmlFor={props.id}>{props.label}</label>
        {props.overridden
          ? (
            <span className={css.badges}>
              <span className={css.badge}>{props.overriddenLabel}</span>
              <button
                type="button"
                className={css.reset}
                disabled={props.disabled}
                onClick={props.onReset}
              >
                {props.resetLabel}
              </button>
            </span>
          )
          : null}
        {props.secret === true && props.canClear === true
          ? (
            <button
              type="button"
              className={css.reset}
              disabled={props.disabled}
              onClick={props.onClear}
            >
              {props.clearLabel ?? props.resetLabel}
            </button>
          )
          : null}
      </div>
      <div className={css.comboRow}>
        {props.checked !== undefined && props.onChecked !== undefined
          ? (
            <input
              type="checkbox"
              className={css.enableCheck}
              aria-label={props.label}
              checked={props.checked}
              disabled={props.disabled}
              onChange={(event) => { props.onChecked(event.target.checked) }}
            />
          )
          : null}
        {combo ?? (
          <input
            id={props.id}
            className={props.invalid ? css.inputInvalid : css.input}
            type={props.secret === true ? 'password' : 'text'}
            autoComplete={props.secret === true ? 'off' : undefined}
            {...props.invalid ? { 'aria-invalid': true } : {}}
            value={props.text}
            placeholder={props.placeholder ?? ''}
            disabled={props.disabled || props.locked === true}
            onChange={(event) => { props.onEdit(event.target.value) }}
          />
        )}
      </div>
      <p className={props.invalid ? css.invalid : css.hint}>
        {props.invalid ? props.invalidLabel : props.hint}
      </p>
    </div>
  )
}

/** A staged boolean field: 继承 / 开 / 关. */
function BooleanField(props: FieldProps & {
  /** Copy for the inherit option. */
  inheritLabel: string
  /** Copy for the on option. */
  onLabel: string
  /** Copy for the off option. */
  offLabel: string
}) {
  return (
    <div className={css.field}>
      <div className={css.head}>
        <label className={css.label} htmlFor={props.id}>{props.label}</label>
        {props.overridden
          ? (
            <span className={css.badges}>
              <span className={css.badge}>{props.overriddenLabel}</span>
              <button
                type="button"
                className={css.reset}
                disabled={props.disabled}
                onClick={props.onReset}
              >
                {props.resetLabel}
              </button>
            </span>
          )
          : null}
      </div>
      <select
        id={props.id}
        className={css.select}
        value={props.text}
        disabled={props.disabled}
        onChange={(event) => { props.onEdit(event.target.value) }}
      >
        <option value="">{props.inheritLabel}</option>
        <option value="true">{props.onLabel}</option>
        <option value="false">{props.offLabel}</option>
      </select>
      <p className={css.hint}>{props.hint}</p>
    </div>
  )
}
