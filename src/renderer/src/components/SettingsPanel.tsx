import { useEffect, useState, type CSSProperties, type JSX } from 'react'
import { useSettingsStore } from '../store/settings'
import { useIslandStore } from '../store/island'
import { usePlayerStore } from '../store/player'
import { sourceLabels } from '../lib/format'
import {
  CheckIcon,
  CloseIcon,
  ExternalIcon,
  EyeIcon,
  EyeOffIcon,
  HideIcon,
  LoaderIcon
} from './Icons'

function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-white/15'
      }`}
      data-keep-expanded
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function SettingsPanel(): JSX.Element {
  const settings = useSettingsStore((state) => state.settings)
  const update = useSettingsStore((state) => state.update)
  const showToast = useIslandStore((state) => state.showToast)
  const setPanel = useIslandStore((state) => state.setPanel)
  const volume = usePlayerStore((state) => state.volume)
  const muted = usePlayerStore((state) => state.muted)

  const [delay, setDelay] = useState(settings.collapseDelay)
  const [offset, setOffset] = useState(settings.verticalOffset)
  const [jamendoId, setJamendoId] = useState(settings.jamendoClientId)
  const [audiusKey, setAudiusKey] = useState(settings.audiusApiKey)
  const [showJamendo, setShowJamendo] = useState(false)
  const [showAudius, setShowAudius] = useState(false)
  const [savingKeys, setSavingKeys] = useState(false)
  const [version, setVersion] = useState('1.0.0')

  useEffect(() => setDelay(settings.collapseDelay), [settings.collapseDelay])
  useEffect(() => setOffset(settings.verticalOffset), [settings.verticalOffset])
  useEffect(() => setJamendoId(settings.jamendoClientId), [settings.jamendoClientId])
  useEffect(() => setAudiusKey(settings.audiusApiKey), [settings.audiusApiKey])
  useEffect(() => {
    void window.api.getVersion().then(setVersion)
  }, [])

  const keysDirty =
    jamendoId !== settings.jamendoClientId ||
    audiusKey !== settings.audiusApiKey ||
    volume !== settings.volume ||
    muted !== settings.muted

  const saveKeys = async (): Promise<void> => {
    setSavingKeys(true)
    await update({ jamendoClientId: jamendoId, audiusApiKey: audiusKey, volume, muted })
    setSavingKeys(false)
    showToast('Kunci API tersimpan di perangkat ini.', 'success')
  }

  const inputClass =
    'h-9 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[11px] text-white outline-none transition placeholder:text-white/25 focus:border-accent/50 focus:bg-white/[0.07]'
  const labelClass = 'text-[10.5px] font-medium text-white/60'
  const hintClass = 'mt-1 text-[9.5px] leading-relaxed text-white/30'

  return (
    <section className="flex h-[420px] flex-col">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <div>
          <h2 className="text-[13px] font-semibold text-white">Pengaturan</h2>
          <p className="mt-0.5 text-[9.5px] text-white/35">Perubahan langsung tersimpan di perangkat.</p>
        </div>
        <button
          type="button"
          onClick={() => setPanel('none')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition hover:bg-white/8 hover:text-white"
          aria-label="Tutup pengaturan"
          tabIndex={-1}
        >
          <CloseIcon width={15} height={15} />
        </button>
      </div>

      <div className="track-list min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-2">
        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="collapse-delay">
              Durasi sebelum mengecil
            </label>
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] tabular-nums text-white/65">
              {delay} detik
            </span>
          </div>
          <input
            id="collapse-delay"
            type="range"
            min={2}
            max={30}
            step={1}
            value={delay}
            onChange={(event) => setDelay(Number(event.currentTarget.value))}
            onPointerUp={() => void update({ collapseDelay: delay })}
            onKeyUp={() => void update({ collapseDelay: delay })}
            className="island-slider mt-2"
            style={{ '--progress': `${((delay - 2) / 28) * 100}%` } as CSSProperties}
            data-keep-expanded
          />
          <p className={hintClass}>Island menunggu selama ini setelah kursor keluar dari area island.</p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="vertical-offset">
              Posisi vertikal
            </label>
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] tabular-nums text-white/65">
              {offset} px
            </span>
          </div>
          <input
            id="vertical-offset"
            type="range"
            min={0}
            max={200}
            step={2}
            value={offset}
            onChange={(event) => setOffset(Number(event.currentTarget.value))}
            onPointerUp={() => void update({ verticalOffset: offset })}
            onKeyUp={() => void update({ verticalOffset: offset })}
            className="island-slider mt-2"
            style={{ '--progress': `${(offset / 200) * 100}%` } as CSSProperties}
            data-keep-expanded
          />
          <p className={hintClass}>Jarak dari tepi atas layar utama.</p>
        </div>

        <div>
          <p className={labelClass}>Sumber musik</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {(['jamendo', 'audius'] as const).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => {
                  void update({ musicSource: source })
                  showToast(`Sumber musik: ${sourceLabels[source]}`, 'info')
                }}
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  settings.musicSource === source
                    ? 'border-accent/50 bg-accent/10 text-white'
                    : 'border-white/8 bg-white/[0.03] text-white/50 hover:border-white/15 hover:text-white/80'
                }`}
                data-keep-expanded
              >
                <span className="flex items-center justify-between text-[11px] font-medium">
                  {sourceLabels[source]}
                  {settings.musicSource === source && <CheckIcon width={12} height={12} className="text-accent-soft" />}
                </span>
                <span className="mt-0.5 block text-[9px] text-white/30">
                  {source === 'jamendo' ? 'Perlu Client ID' : 'Langsung siap dipakai'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-medium text-white/65">Kunci API</p>
            {keysDirty && (
              <button
                type="button"
                onClick={() => void saveKeys()}
                disabled={savingKeys}
                className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[9.5px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                data-keep-expanded
              >
                {savingKeys ? <LoaderIcon width={10} height={10} /> : <CheckIcon width={10} height={10} />}
                Simpan
              </button>
            )}
          </div>

          <label className={`${labelClass} mt-3 block`} htmlFor="jamendo-id">
            Jamendo Client ID
          </label>
          <div className="relative mt-1">
            <input
              id="jamendo-id"
              type={showJamendo ? 'text' : 'password'}
              value={jamendoId}
              onChange={(event) => setJamendoId(event.currentTarget.value)}
              placeholder="Tempel client_id dari devportal.jamendo.com"
              className={`${inputClass} pr-8`}
              spellCheck={false}
              data-keep-expanded
            />
            <button
              type="button"
              onClick={() => setShowJamendo((value) => !value)}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/35 hover:text-white"
              aria-label={showJamendo ? 'Sembunyikan Client ID' : 'Tampilkan Client ID'}
              tabIndex={-1}
            >
              {showJamendo ? <EyeOffIcon width={13} height={13} /> : <EyeIcon width={13} height={13} />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => void window.api.openExternal('https://devportal.jamendo.com')}
            className="mt-1 inline-flex items-center gap-1 text-[9px] text-white/30 hover:text-accent-soft"
            tabIndex={-1}
          >
            Ambil Client ID gratis
            <ExternalIcon width={9} height={9} />
          </button>

          <label className={`${labelClass} mt-3 block`} htmlFor="audius-key">
            Audius API Key <span className="font-normal text-white/25">(opsional)</span>
          </label>
          <div className="relative mt-1">
            <input
              id="audius-key"
              type={showAudius ? 'text' : 'password'}
              value={audiusKey}
              onChange={(event) => setAudiusKey(event.currentTarget.value)}
              placeholder="Kosongkan untuk memakai akses publik"
              className={`${inputClass} pr-8`}
              spellCheck={false}
              data-keep-expanded
            />
            <button
              type="button"
              onClick={() => setShowAudius((value) => !value)}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/35 hover:text-white"
              aria-label={showAudius ? 'Sembunyikan API key' : 'Tampilkan API key'}
              tabIndex={-1}
            >
              {showAudius ? <EyeOffIcon width={13} height={13} /> : <EyeIcon width={13} height={13} />}
            </button>
          </div>
          <p className={hintClass}>Kunci disimpan lokal di perangkat dan tidak dikirim ke mana pun selain API musik.</p>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/7 bg-white/[0.025] px-3 py-2.5">
          <div>
            <p className="text-[10.5px] font-medium text-white/65">Jalankan otomatis</p>
            <p className="mt-0.5 text-[9px] text-white/30">Saat Windows menyala (berlaku setelah dipasang).</p>
          </div>
          <Toggle
            checked={settings.autoStart}
            onChange={(value) => void update({ autoStart: value })}
            label="Jalankan otomatis saat Windows menyala"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.api.hideIsland()}
            className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] text-white/55 transition hover:border-white/15 hover:text-white"
            data-keep-expanded
          >
            <HideIcon width={12} height={12} />
            Sembunyikan ke tray
          </button>
          <p className="text-right text-[9px] leading-relaxed text-white/25">
            Dynamic Island Music v{version}
            <br />
            Electron + React • biaya Rp0
          </p>
        </div>
      </div>
    </section>
  )
}
