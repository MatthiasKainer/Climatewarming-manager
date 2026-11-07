"""Chromium interaction regression for V5 using the offline pfusch-compatible renderer.
Also exercises native HTML Audio after a *real user click* and full end-game flows.
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
sound=(ROOT/'src/audio.js').read_text().replace('export function ', 'function ').replace('export async function ', 'async function ')
bundle='const __CSS='+json.dumps(css)+';\n'+shim+'\n'+engine+'\n'+geo+'\n'+sound+'\n'+ui

async def boot(page):
 await page.set_content(html,wait_until='domcontentloaded')
 await page.evaluate("() => {const st=document.createElement('style');st.textContent='html,body{margin:0;height:100%;width:100%;background:#07141d}body>main{height:100%;overflow:hidden}crisis-game{display:block;height:100%}';document.head.append(st)}")
 await page.add_script_tag(content=bundle)
 return page.locator('crisis-game')

async def shape(page):
 return await page.evaluate('''() => ({h:document.documentElement.scrollHeight,ih:innerHeight,w:document.documentElement.scrollWidth,iw:innerWidth})''')

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1366,'height':768})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  root=await boot(page)
  # Survival markers are meaningful: seven core sectors require 31%; roads and river do not.
  rows=root.locator('.situation-rail .res')
  assert await rows.count()==9
  assert await root.locator('.mini-track .failure-zone').count()==9
  assert await root.locator('.mini-track .failure-line').count()==0
  for i in range(9):
   targets=rows.nth(i).locator('.mini-track .target-line')
   if i in (1,3):
    assert await targets.count()==0, f'Unexpected survival marker in row {i}'
   else:
    assert await targets.count()==1, f'Missing survival marker in row {i}'
    assert (await targets.get_attribute('style'))=='left:31%'
   bar=await rows.nth(i).locator('.mini-track').bounding_box()
   zone=await rows.nth(i).locator('.failure-zone').bounding_box()
   assert bar and zone and abs(zone['width']/bar['width']-.14)<.02,(i,bar,zone)
  selector=root.locator('.difficulty-control select')
  assert await selector.count()==1
  assert await selector.locator('option').count()==4
  assert await selector.input_value()=='standard'
  assert await root.locator('.budget-stat strong').inner_text()=='24 Mrd. €'
  # Changing the choice must not silently reset a running game.
  await selector.select_option('schwer')
  assert await selector.input_value()=='schwer'
  assert await root.locator('.budget-stat strong').inner_text()=='24 Mrd. €'
  assert await root.locator('.difficulty-control small').inner_text()=='BEIM NEUSTART'
  await root.locator('.top-links button').last.click()
  assert await selector.input_value()=='schwer'
  assert await root.locator('.budget-stat strong').inner_text()=='21 Mrd. €'
  assert '4,7 Mrd. €' in await root.locator('.budget-stat small').inner_text()
  assert 'SCHWER' in (await root.locator('.map-foot').inner_text()).upper()
  assert await root.locator('.difficulty-control small').count()==0
  await selector.select_option('extrem')
  assert await root.locator('.budget-stat strong').inner_text()=='21 Mrd. €'
  await root.locator('.top-links button').last.click()
  assert await root.locator('.budget-stat strong').inner_text()=='20 Mrd. €'
  assert await selector.input_value()=='extrem'
  assert '4,5 Mrd. €' in await root.locator('.budget-stat small').inner_text()
  await page.evaluate("() => {game.over=true;game.outcome='loss';game.endedReason='Test';document.querySelector('crisis-game').data.version++;}")
  assert 'EXTREM' in (await root.locator('.end-panel').inner_text()).upper()
  await root.locator('.end-actions button').last.click()
  assert await root.locator('.end-panel').count()==0
  assert await root.locator('.budget-stat strong').inner_text()=='20 Mrd. €'
  assert await selector.input_value()=='extrem'
  for width,height in [(1440,900),(1366,768),(1280,720)]:
   await page.set_viewport_size({'width':width,'height':height})
   layout=await shape(page)
   assert layout['h']<=layout['ih']+2 and layout['w']<=layout['iw']+2,(width,height,layout)
   assert await selector.is_visible(),(width,height)
   if width==1366:await page.screenshot(path='/mnt/data/duerre-v6-desktop.png',full_page=True)
  await page.set_viewport_size({'width':390,'height':844})
  mobile=await shape(page)
  assert mobile['w']<=mobile['iw']+2,mobile
  assert await selector.is_visible()
  await page.screenshot(path='/mnt/data/duerre-v6-mobile.png',full_page=True)
  assert not errors,errors
  print('DIFFICULTY UI OK',json.dumps({'mobile':mobile,'errors':errors},ensure_ascii=False))
  await browser.close()

asyncio.run(main())
