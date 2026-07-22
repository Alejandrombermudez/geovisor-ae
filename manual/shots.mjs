// Captura pantallazos del GeoVisor para el manual de usuario.
// Usa el Chrome ya instalado (puppeteer-core, sin descargar Chromium).
import puppeteer from 'puppeteer-core'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdirSync } from 'node:fs'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE   = 'http://localhost:3001'
const OUT    = 'D:\\AMAZONIA EMPRENDE\\GeoAE\\manual\\img'
mkdirSync(OUT, { recursive: true })

const log = (...a) => console.log('[shots]', ...a)
const clickByText = (txt) => `(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(txt)}); if(b){b.click();return true;} return false; })()`

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--window-size=1460,960', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

async function waitMap() {
  await page.waitForSelector('.leaflet-tile-loaded', { timeout: 25000 }).catch(() => {})
  await sleep(2800)
}
const shot = async (name) => { await page.screenshot({ path: `${OUT}\\${name}` }); log('saved', name) }

// ── 1) Pantalla de inicio de sesión ───────────────────────────────────────
log('cargando /geovisor…')
await page.goto(BASE + '/geovisor', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {})
await page.evaluate(() => { try { localStorage.clear() } catch (e) {} })
await page.reload({ waitUntil: 'domcontentloaded' })
await waitMap()
await page.evaluate(() => { const b = document.querySelector('[data-tour="sesion"]'); if (b) b.click() })
await page.waitForFunction(() => document.body.innerText.includes('Te damos la bienvenida'), { timeout: 10000 }).catch(() => {})
await page.evaluate(() => {
  const setVal = (el, val) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(el, val); el.dispatchEvent(new Event('input', { bubbles: true })) }
  const t = document.querySelector('input[type="text"]'); const p = document.querySelector('input[type="password"]')
  if (t) setVal(t, 'citibank'); if (p) setVal(p, 'CB_AE_2026')
})
await sleep(700)
await shot('01-login.png')

// ── sesión iniciada (Citibank) para el resto ──────────────────────────────
await page.evaluate(() => { try { localStorage.setItem('geoae_user', 'Citibank'); localStorage.removeItem('geoae_help_dismissed') } catch (e) {} })
await page.reload({ waitUntil: 'domcontentloaded' })
await waitMap()

// ── 3) Aviso de ayuda (aparece solo) ───────────────────────────────────────
await page.waitForFunction(() => document.body.innerText.includes('¿Te mostramos cómo funciona?'), { timeout: 10000 }).catch(() => {})
await sleep(500)
await shot('03-aviso-ayuda.png')

// ── 4) Recorrido guiado (spotlight) ────────────────────────────────────────
await page.evaluate(clickByText('Sí, ver la guía'))
await sleep(1100)
await shot('04-guia-paso1.png')
// avanzar hasta el paso "Metas" para una segunda toma ilustrativa
await page.evaluate(clickByText('Siguiente'))
await page.evaluate(clickByText('Siguiente'))
await page.evaluate(clickByText('Siguiente'))
await sleep(900)
await shot('04b-guia-metas.png')
await page.keyboard.press('Escape')
await sleep(500)

// ── 2) Interfaz principal (limpia) ─────────────────────────────────────────
await page.evaluate(() => { try { localStorage.setItem('geoae_help_dismissed', '1') } catch (e) {} })
await page.reload({ waitUntil: 'domcontentloaded' })
await waitMap()
await sleep(600)
await shot('02-interfaz.png')

// ── 5) Demo Citibank (Metas → Demo) ────────────────────────────────────────
await sleep(1500) // evitar la carrera del flyTo
await page.evaluate(clickByText('Metas'))
await sleep(1400)
await page.evaluate(clickByText('Demo'))
await page.waitForFunction(() => document.body.innerText.includes('Citibank (Demo)'), { timeout: 10000 }).catch(() => {})
await sleep(1800)
await shot('05-demo-metricas.png')

// ── 6) Pestaña Reportes ────────────────────────────────────────────────────
await page.evaluate(clickByText('Reportes'))
await sleep(900)
await shot('06-reportes.png')

await browser.close()
log('DONE')
