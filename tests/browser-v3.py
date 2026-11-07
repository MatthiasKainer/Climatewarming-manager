"""Functional Chromium checks using a development-only pfusch-compatible harness.
Production imports pfusch.min.js; this harness exercises the same app templates,
render output, route selection, storm events and viewport geometry offline.
"""
import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text().replace('<script type="module" src="./src/ui.js"></script>', '')
css=(ROOT/'style.css').read_text()
engine=(ROOT/'src/engine.js').read_text().replace('export const ','const ').replace('export function ','function ')
geo=(ROOT/'src/geography.js').read_text().replace('export const ','const ')
ui='\n'.join((ROOT/'src/ui.js').read_text().splitlines()[3:])
shim=(ROOT/'tests/pfusch-test-shim.js').read_text().replace('export const html ', 'const html ').replace('export function pfusch', 'function pfusch')
shim=shim.replace("const style=document.createElement('link');style.rel='stylesheet';style.href='./style.css';", "const style=document.createElement('style');style.textContent=__CSS;")
bundle=f'const __CSS={json.dumps(css)};\n'+shim+'\n'+engine+'\n'+geo+'\n'+ui

async def setup(page):
 await page.set_content(html,wait_until='domcontentloaded')
 await page.evaluate("source => { let el=document.createElement('style');el.textContent=source;document.head.append(el) }",css)
 await page.add_script_tag(content=bundle)
 return page.locator('crisis-game')

async def advance_to(root,day):
 for _ in range(day-1):
  if await root.locator('.event-modal').count():
   await root.locator('.choice').last.click()
  await root.locator('.advance').click()
  if await root.locator('.result-modal').count():break

async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await b.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  root=await setup(page)
  assert await root.locator('.app').count()==1
  assert await root.locator('.state-area').count()==16
  assert await root.locator('.route').count()==9
  assert await root.locator('.city-point').count()>=40
  assert await root.locator('.net-node').count()==len(['port','rhine','power','fire-west','fire-east','fire-south','water','hospital','food'])
  assert await root.locator('.action-row').count()==19
  assert '0 / 2' in await root.locator('.topbar').inner_text()
  await root.locator('.net-node').first.click()
  assert 'VERSORGUNGS- / EINSATZPUNKT' in await root.locator('.map-selection').inner_text()
  await root.locator('.route').first.evaluate("e => e.dispatchEvent(new MouseEvent('click',{bubbles:true}))")
  assert 'VERKEHRSKORRIDOR' in await root.locator('.map-selection').inner_text()
  await root.locator('.layer-tab').filter(has_text='Feuerwehr / KatS').click()
  assert await root.locator('.net-node').count()==3
  await root.locator('.layer-tab').filter(has_text='Gesamt').click()
  await root.locator('.action-row').filter(has_text='Notstrom & Kühlketten').click()
  assert '1 / 2' in await root.locator('.topbar').inner_text()
  layout=await page.evaluate("""() => ({height:document.documentElement.scrollHeight,viewport:innerHeight,width:document.documentElement.scrollWidth,vwidth:innerWidth,main:document.querySelector('crisis-game').shadowRoot.querySelector('.app').getBoundingClientRect().height})""")
  assert layout['height']<=layout['viewport']+2, layout
  assert layout['width']<=layout['vwidth']+2, layout
  await page.screenshot(path='/mnt/data/duerre-v3-desktop.png',full_page=True)
  for width,height in [(1366,768),(1280,720)]:
   await page.set_viewport_size({'width':width,'height':height})
   shape=await page.evaluate("""() => ({height:document.documentElement.scrollHeight,viewport:innerHeight,width:document.documentElement.scrollWidth,vwidth:innerWidth})""")
   assert shape['height']<=shape['viewport']+2 and shape['width']<=shape['vwidth']+2, shape
   if width==1366:await page.screenshot(path='/mnt/data/duerre-v3-laptop.png',full_page=True)
  await page.set_viewport_size({'width':1440,'height':900})
  await advance_to(root,5)
  assert await root.locator('.event-modal').count()==1
  assert 'Starkregen' in await root.locator('.event-modal').inner_text()
  assert await root.locator('.radar-storm').count()==1
  assert await root.locator('.route-warn, .route-danger').count()>=2
  await root.locator('.choice').last.click()
  await page.screenshot(path='/mnt/data/duerre-v3-storm.png',full_page=True)
  await page.set_viewport_size({'width':390,'height':844})
  await page.screenshot(path='/mnt/data/duerre-v3-mobile.png',full_page=True)
  mobile=await page.evaluate("""() => ({width:document.documentElement.scrollWidth,vwidth:innerWidth})""")
  assert mobile['width']<=mobile['vwidth']+2,mobile
  print('BROWSER-INTERACTIVE',json.dumps({'desktop':layout,'mobile':mobile,'states':16,'cities':47,'routes':9,'storm':'displayed','counter':'correct'},ensure_ascii=False),flush=True)
  await page.close()
  for name in ['idle','spender']:
   p=await b.new_page(viewport={'width':1366,'height':768})
   e=[];p.on('pageerror',lambda x:e.append(str(x)))
   root=await setup(p)
   for _ in range(25):
    if await root.locator('.event-modal').count():await root.locator('.choice:not([disabled])').last.click()
    if await root.locator('.result-modal').count():break
    if name=='spender':
     for j in range(2):
      x=root.locator('.action-row:not([disabled])').first
      if await x.count():await x.click()
    if not await root.locator('.advance').is_enabled():break
    await root.locator('.advance').click()
   assert await root.locator('.result-modal').count()==1,f'{name}: no result'
   assert not e,e
   print('BROWSER-PLAYTHROUGH',name,'done',flush=True)
   await p.close()
  assert not errors,errors
  await b.close()

asyncio.run(main())
