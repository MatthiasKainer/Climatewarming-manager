"""Visual/behavioral Chromium test of V4 using a pfusch-compatible offline renderer.
This does not replace a separate check against the production GitHub Pages origin.
"""
import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text().replace('<script type="module" src="./src/ui.js"></script>', '')
css=(ROOT/'style.css').read_text()
engine=(ROOT/'src/engine.js').read_text().replace('export const ','const ').replace('export function ','function ')
geo=(ROOT/'src/geography.js').read_text().replace('export const ','const ')
ui='\n'.join((ROOT/'src/ui.js').read_text().splitlines()[4:])
shim=(ROOT/'tests/pfusch-test-shim.js').read_text().replace('export const html ', 'const html ').replace('export const script', 'const script').replace('export function pfusch','function pfusch')
shim=shim.replace("const style=document.createElement('link');style.rel='stylesheet';style.href='./style.css';", "const style=document.createElement('style');style.textContent=__CSS;")
sound=(ROOT/'src/audio.js').read_text().replace('export function ', 'function ')
bundle='const __CSS='+json.dumps(css)+';\n'+shim+'\n'+engine+'\n'+geo+'\n'+sound+'\n'+ui

async def boot(page):
 await page.set_content(html,wait_until='domcontentloaded')
 await page.evaluate("() => {const st=document.createElement('style');st.textContent='html,body{margin:0;height:100%;width:100%;background:#07141d}body>main{height:100%;overflow:hidden}crisis-game{display:block;height:100%}';document.head.append(st)}")
 await page.add_script_tag(content=bundle)
 return page.locator('crisis-game')

async def progress(root,day):
 for _ in range(20):
  if await root.locator('.result-modal').count(): break
  now=int((await root.locator('.day-stat strong').inner_text()).split('/')[0])
  if now>=day: break
  if await root.locator('.event-panel').count():
   await root.locator('.choice:not([disabled])').last.click()
  if await root.locator('.advance').is_enabled(): await root.locator('.advance').click()
  else: break

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1440,'height':900})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  root=await boot(page)
  assert await root.locator('.app').count()==1
  assert await root.locator('.state-area').count()==16
  assert await root.locator('.route').count()==9
  assert await root.locator('.res').count()==9
  assert await root.locator('.map-risk-label').count()==1
  assert await root.locator('.sound-switch').count()==2
  await root.locator('.sound-switch').first.click()
  assert 'TON AUS' in await root.locator('.topbar').inner_text()
  await root.locator('.sound-switch').first.click()
  await root.locator('.sound-switch').nth(1).click()
  assert 'MUSIK AN' in await root.locator('.topbar').inner_text()
  await root.locator('.sound-switch').nth(1).click()
  start=await root.locator('.map-foot').inner_text()
  await root.locator('.top-links button').last.click()
  assert await root.locator('.map-foot').inner_text()!=start, 'new scenario must differ'
  # Many events have been randomized, locate the first one using UI interaction.
  for _ in range(5):
   if await root.locator('.event-panel').count():break
   await root.locator('.advance').click()
  assert await root.locator('.event-panel').count()==1
  assert await root.locator('.modal-backdrop').count()==0, 'event should not hide map'
  assert await root.locator('.res').count()==9, 'status must stay visible'
  assert await root.locator('.choice').count()==2
  assert await root.locator('.action-list').get_attribute('inert') is not None
  assert not await root.locator('.advance').is_enabled()
  assert not await root.locator('.tab').first.is_enabled()
  assert not await root.locator('.layer-tab').first.is_enabled()
  assert not await root.locator('.top-links button').last.is_enabled()
  assert await root.locator('.event-status .event-metric').count()==4
  await page.screenshot(path='/mnt/data/duerre-v4-decision.png',full_page=True)
  await root.locator('.choice:not([disabled])').last.click()
  assert await root.locator('.event-panel').count()==0
  await root.locator('.action-row:not([disabled])').first.click()
  await page.screenshot(path='/mnt/data/duerre-v4-desktop.png',full_page=True)
  layout=await page.evaluate('''() => ({h:document.documentElement.scrollHeight,ih:innerHeight,w:document.documentElement.scrollWidth,iw:innerWidth})''')
  assert layout['h']<=layout['ih']+2,layout
  assert layout['w']<=layout['iw']+2,layout
  for width,height in [(1366,768),(1280,720)]:
   await page.set_viewport_size({'width':width,'height':height})
   shape=await page.evaluate('''() => ({h:document.documentElement.scrollHeight,ih:innerHeight,w:document.documentElement.scrollWidth,iw:innerWidth})''')
   assert shape['h']<=shape['ih']+2 and shape['w']<=shape['iw']+2,(width,height,shape)
  # Force a deteriorating situation via exposed engine functions, then render through normal change.
  await page.evaluate('''() => {let g=game;Object.keys(g.metrics).forEach(k=>g.metrics[k]=39);g.metrics.water=21;g.metrics.health=20;g.metrics.fire=22;document.querySelector('crisis-game').data.version++;}''')
  await page.set_viewport_size({'width':1440,'height':900})
  await page.screenshot(path='/mnt/data/duerre-v4-danger.png',full_page=True)
  assert await root.locator('.urgency-3').count()>=1, 'critical state must visually flag map and top bar'
  await page.set_viewport_size({'width':390,'height':844})
  await page.screenshot(path='/mnt/data/duerre-v4-mobile.png',full_page=True)
  mobile=await page.evaluate('''() => ({w:document.documentElement.scrollWidth,iw:innerWidth})''')
  assert mobile['w']<=mobile['iw']+2,mobile
  print('UI',json.dumps({'layout':layout,'mobile':mobile,'errors':errors},ensure_ascii=False))
  assert not errors,errors
  for mode in ['idle','spender']:
   p=await browser.new_page(viewport={'width':1366,'height':768});errs=[];p.on('pageerror',lambda e:errs.append(str(e)))
   app=await boot(p)
   for _ in range(35):
    if await app.locator('.event-panel').count():await app.locator('.choice:not([disabled])').last.click()
    if await app.locator('.result-modal').count():break
    if mode=='spender':
     for _ in range(2):
      action=app.locator('.action-row:not([disabled])').first
      if await action.count():await action.click()
    if not await app.locator('.advance').is_enabled():break
    await app.locator('.advance').click()
   assert await app.locator('.result-modal').count()==1,f'{mode}: no result'
   assert not errs,errs
   print('UI-PLAYTHROUGH',mode,'complete')
   await p.close()
  await browser.close()

asyncio.run(main())
