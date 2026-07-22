// Re-captura SOLO la pestaña Reportes, verificando el contenido antes de la foto.
import puppeteer from 'puppeteer-core'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE   = 'http://localhost:3001'
const OUT    = 'D:\\AMAZONIA EMPRENDE\\GeoAE\\manual\\img'
const clickByText = (txt) => `(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(txt)}); if(b){b.click();return true;} return false; })()`

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--window-size=1460,960', '--hide-scrollbars', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

await page.goto(BASE + '/geovisor', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {})
await page.evaluate(() => { try { localStorage.setItem('geoae_user', 'Citibank'); localStorage.setItem('geoae_help_dismissed', '1') } catch (e) {} })
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForSelector('.leaflet-tile-loaded', { timeout: 25000 }).catch(() => {})
await sleep(3500) // mapa listo (evita la carrera del flyTo)

console.log('Metas:', await page.evaluate(clickByText('Metas')))
await sleep(1500)
console.log('Demo:', await page.evaluate(clickByText('Demo')))
await page.waitForFunction(() => document.body.innerText.includes('Citibank (Demo)'), { timeout: 10000 }).catch(() => {})
await sleep(1500)

// Clic en la pestaña Reportes (la del panel, no otra)
const ok = await page.evaluate(() => {
  const tabs = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Reportes')
  if (!tabs.length) return 'no-tab'
  tabs[0].click()
  return 'clicked'
})
console.log('Reportes tab:', ok)
await sleep(1000)
const hasInforme = await page.evaluate(() => document.body.innerText.includes('Informe 2024'))
console.log('muestra "Informe 2024":', hasInforme)
await sleep(400)
await page.screenshot({ path: `${OUT}\\06-reportes.png` })
console.log('saved 06-reportes.png')

await browser.close()
