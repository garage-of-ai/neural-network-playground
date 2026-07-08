import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForSelector('.network-panel')
await page.waitForTimeout(400)
await page.screenshot({ path: 'C:/Users/Admin/AppData/Local/Temp/nl_label_initial.png' })

const getLabelBox = (i) => page.locator('.layer-label').nth(i).boundingBox()
const beforeLabel0 = await getLabelBox(0)

const stageBox = await page.locator('.network-stage').boundingBox()
// pan diagonally (both X and Y) — label should follow X only, stay fixed Y
await page.mouse.move(stageBox.x + stageBox.width / 2, stageBox.y + stageBox.height / 2)
await page.mouse.down()
await page.mouse.move(stageBox.x + stageBox.width / 2 + 120, stageBox.y + stageBox.height / 2 + 90, { steps: 12 })
await page.mouse.up()
await page.waitForTimeout(150)
await page.screenshot({ path: 'C:/Users/Admin/AppData/Local/Temp/nl_label_panned.png' })

const afterLabel0 = await getLabelBox(0)

console.log(JSON.stringify({ beforeLabel0, afterLabel0, errors }, null, 2))
await browser.close()
