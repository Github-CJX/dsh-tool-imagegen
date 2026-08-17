/**
 * Browser-half entry for the dsh-tool-imagegen plugin — runs inside the dsh
 * web GUI.
 *
 * Registers the plugin locale dictionaries, binds the plugin's own settings
 * scope (its loopback bridge routes serve the dsh-imagegen namespace the
 * official rc.6 allowlist would refuse), registers the settings card into the
 * official `settings.plugin.item` slot (Settings → Plugins → Configurable),
 * and registers the inline generated-image view into the keyed
 * `tool.call.toolview` slot for the `generate_image` tool. Failure policy:
 * registration problems are logged, never thrown — an external plugin must not
 * take the GUI down.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the LocaleNamespaceMap + SlotMap merge tables.
import type {} from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the `tool.call.toolview` keyed slot declaration.
import type {} from '@deepseek-ai/dsh-client-ui-tool'
import { en, zh, type ImageGenLocaleKey } from './locales.ts'
import { ImageGenSettingsCard, ImageGenSettingsCardController } from './SettingsCard.tsx'
import { bindImageGenScope, type ImageGenScope } from './settings-scope.ts'
import { GenerateImageView, type GenerateImageViewFace } from './GenerateImageView.tsx'
import { ATTACHMENT_API } from './protocol.ts'

/** Locale namespace this plugin owns. */
const NS = 'dsh-imagegen'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** dsh-tool-imagegen surface copy. */
    'dsh-imagegen': ImageGenLocaleKey
  }

  interface SlotMap {
    /**
     * The official plugin-configuration slot the Settings → Plugins →
     * Configurable tab declares and renders. This card registers there as its
     * own standalone card — independent of the dsh-web-ui family group — so
     * this plugin never reads as part of that family. Spelled here with the
     * same shape so this package can register without depending on the sibling
     * UI package.
     */
    'settings.plugin.item': { kind: 'list'; scope: 'root'; owner: ImageGenPluginItemOwnerProps }
  }
}

/** Owner share of a plugin card (the section supplies nothing). */
export interface ImageGenPluginItemOwnerProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}

/** Required services (fiber inject waiting — the runtime must be up first). */
export const inject = ['slots', 'locale', 'connection']

/**
 * Mount the settings card and the inline generated-image view.
 * @param ctx - client root context (services: slots, locale, connection).
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-tool-imagegen: dictionaries')

  const connection = ctx.get('connection') as ConnectionHandle | undefined
  const loopback = connection?.isLoopback === true
  // The bridge routes are loopback-fenced; remote browsers get an unavailable
  // scope (the card explains the gap) instead of failing fetches.
  const scope: ImageGenScope = bindImageGenScope(loopback
    ? (input, init) => fetch(input, init)
    : () => { throw new Error('settings bridge is loopback-only') })

  // Re-read the scope whenever the connection resets (same invalidation the
  // official settings binder wires).
  ctx.effect(() => {
    const disposers = [
      ctx.on('connection/reset', () => { void scope.load() }),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'dsh-tool-imagegen: settings scope invalidation')

  // Plugin configuration card: one staged form over the `dsh-imagegen` scope,
  // registered into the official plugin-configuration slot (Settings →
  // Plugins → Configurable) as a standalone card.
  try {
    const settingsCard = new ImageGenSettingsCardController(scope)
    ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
      name: 'settings.plugin.item',
      id: 'imagegen',
      order: 30,
      locale: NS,
      inject: () => settingsCard.inject(),
    }, ImageGenSettingsCard))
  } catch (error) {
    console.warn('[dsh-tool-imagegen] settings card registration failed:', error)
  }

  // Inline generated-image view: the keyed toolview entry owns how
  // generate_image calls render in the conversation. Its inject face binds
  // loadImage to the plugin's own loopback attachment bridge — the
  // conversation service's resolveImage authorizes only `image` blocks
  // referenced by session events, and this plugin never writes `image`
  // blocks (text-only model safety). The bridge re-checks the same session
  // reference against `generated-image` blocks before serving the bytes.
  try {
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
      name: 'tool.call.toolview',
      key: 'generate_image',
      locale: NS,
      inject: (sessionId): GenerateImageViewFace => ({
        loadImage: (attachment) => Promise.resolve(
          `${ATTACHMENT_API.path}?session=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(attachment.attachmentId)}`,
        ),
      }),
    }, GenerateImageView))
  } catch (error) {
    console.warn('[dsh-tool-imagegen] toolview registration failed:', error)
  }
}
