"""End-to-end browser smoke test with a lightweight pfusch-compatible shim."""
import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).parent.parent
page_html=(ROOT/'index.html').read_text().replace('<script type="module" src="./src/ui.js"></script>','')
css=(ROOT/'style.css').read_text()
engine=(ROOT/'src/engine.js').read_text().replace('export const ','const ').replace('export function ','function ')
ui=(ROOT/'src/ui.js').read_text().split('\n',2)[2]
shim=(ROOT/'tests/pfusch-test-shim.js').read_text().replace('export const html ','const html ').replace('export function pfusch','function pfusch')
shim=shim.replace("const style=document.createElement('link');style.rel='stylesheet';style.href='./style.css';", "const style=document.createElement('style');style.textContent=__CSS;")
bundle=f'const __CSS={json.dumps(css)};\n'+shim+'\n'+engine+'\n'+ui

async def play(page,mode):
 await page.set_content(page_html,wait_until='domcontentloaded')
 await page.add_script_tag(content=bundle)
 root=page.locator('crisis-game')
 assert await root.locator('.app').count()==1
 assert await root.locator('.kpi').count()==5
 assert await root.locator('.action').count()==17
 assert '0 / 2' in await root.locator('.ticker').inner_text()
 if mode=='interactive':
  t=root.locator('.action').filter(has_text='Notstrom & K')
  await t.click()
  assert '1 / 2' in await root.locator('.ticker').inner_text()
  await root.locator('.action').filter(has_text='Wasser rationieren').click()
  assert '2 / 2' in await root.locator('.ticker').inner_text()
  assert await root.locator('.action:not([disabled])').count()==0
  await root.locator('.advance').click()
  assert '0 / 2' in await root.locator('.ticker').inner_text()
  await root.locator('.tab').filter(has_text='Feuerwehr').click()
  assert await root.locator('.action').count()==4
  await root.locator('.tab').filter(has_text='Alle Bereiche').click()
  await root.locator('.advance').click()
  assert await root.locator('.event-modal').count()==1
  assert await root.locator('.advance').is_disabled()
  await root.locator('.choice').last.click()
  assert await root.locator('.event-modal').count()==0
  await page.screenshot(path='/mnt/data/duerre-v2-desktop.png',full_page=True)
  await page.set_viewport_size({'width':390,'height':844})
  await page.screenshot(path='/mnt/data/duerre-v2-mobile.png',full_page=True)
  assert not await page.evaluate('document.documentElement.scrollWidth>window.innerWidth'), 'horizontal scroll mobile'
  return {'actions':'2/2 updated then reset 0/2','tabs':'Feuerwehr=4','modal':'resolved','mobile_overflow':False}
 for day in range(19):
  if await root.locator('.event-modal').count():
   choices=root.locator('.choice:not([disabled])')
   await choices.first.click() if mode=='spender' else await choices.last.click()
  if await root.locator('.result-modal').count():break
  if mode=='spender':
   # Intentionally make decisions without reserve planning.
   for _ in range(2):
    act=root.locator('.action:not([disabled])').first
    if await act.count():await act.click()
  if not await root.locator('.advance').is_enabled():break
  await root.locator('.advance').click()
 return {'completed':await root.locator('.result-modal').count()==1,'day':await root.locator('.day-count').inner_text(),'result':(await root.locator('.result-modal').inner_text())[:180] if await root.locator('.result-modal').count() else 'incomplete'}

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for mode in ('interactive','idle','spender'):
   page=await browser.new_page(viewport={'width':1440,'height':1000})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   result=await play(page,mode)
   assert not errors, errors
   print('BROWSER',mode,json.dumps(result,ensure_ascii=False),flush=True)
   await page.close()
  await browser.close()
asyncio.run(main())