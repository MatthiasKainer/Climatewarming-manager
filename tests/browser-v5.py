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
  page=await browser.new_page(viewport={'width':1440,'height':900})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  root=await boot(page)
  assert await root.locator('.app').count()==1
  assert await root.locator('.state-area').count()==16
  assert await root.locator('.res').count()==9
  assert await root.locator('.map-coord').count()==0, 'redundant model disclaimer removed'
  assert '47,5' not in await root.locator('.map-foot').inner_text(), 'quality target cannot appear as survival threshold'
  assert await page.locator('#crisis-ambient').count()==1
  music=root.locator('.sound-switch').nth(1)
  await music.click()
  await page.wait_for_timeout(450)
  playback=await page.evaluate('''() => ({paused:document.getElementById('crisis-ambient').paused,currentTime:document.getElementById('crisis-ambient').currentTime,duration:document.getElementById('crisis-ambient').duration,error:document.getElementById('crisis-ambient').error?.message})''')
  assert 'MUSIK AN' in await root.locator('.topbar').inner_text(),playback
  assert not playback['paused'] and playback['currentTime']>.1 and playback['duration']>=10,playback
  await music.click()
  assert 'MUSIK AUS' in await root.locator('.topbar').inner_text()
  assert await page.locator('#crisis-ambient').evaluate('(audio)=>audio.paused')
  assert not errors,errors

  # User's last-day values, modeled as an actual transition through the engine.
  await page.evaluate('''() => {
    game.day=17;game.pending=null;game.over=false;game.outcome=null;
    Object.assign(game.metrics,{water:42,river:35,power:41,roads:62,logistics:52,health:54,food:53,fire:51,trust:40});
    game.fires=0;game.flood=0;game.storm=0;game.riverPulseDays=0;
    game.history.push({day:17,...game.metrics});
    document.querySelector('crisis-game').data.version++;
  }''')
  assert 'TAG 18:' in await root.locator('.decision-footer').inner_text(), 'final-day preview should warn before advancing'
  await root.locator('.advance').click()
  assert await root.locator('.end-panel.end-win').count()==1,await root.locator('.decision-panel').inner_text()
  assert await root.locator('.end-area').count()==9
  assert await root.locator('.end-check').count()==3
  assert await root.locator('.modal-backdrop').count()==0,'result must NOT replace the map'
  assert await root.locator('.germany-map').count()==1
  assert not await root.locator('.action-row').first.is_enabled()
  assert not await root.locator('.advance').is_enabled()
  await page.screenshot(path='/mnt/data/duerre-v5-end.png',full_page=True)
  for width,height in [(1440,900),(1366,768),(1280,720)]:
   await page.set_viewport_size({'width':width,'height':height})
   layout=await shape(page)
   assert layout['h']<=layout['ih']+2 and layout['w']<=layout['iw']+2,(width,height,layout)
   if width==1366: await page.screenshot(path='/mnt/data/duerre-v5-laptop.png',full_page=True)
  await page.set_viewport_size({'width':390,'height':844})
  mobile=await shape(page)
  assert mobile['w']<=mobile['iw']+2,mobile
  await page.screenshot(path='/mnt/data/duerre-v5-mobile.png',full_page=True)
  await page.set_viewport_size({'width':1440,'height':900})
  await root.locator('.end-actions button').first.click()
  assert await root.locator('.end-panel').count()==0
  assert await root.locator('.day-stat strong').inner_text()=='1 / 18'
  await page.screenshot(path='/mnt/data/duerre-v5-dashboard.png',full_page=True)
  assert not errors,errors

  # A real bot play-through should end *within the measures pane* even after loss.
  for mode in ['idle','spender']:
   p=await browser.new_page(viewport={'width':1366,'height':768});errs=[];p.on('pageerror',lambda e:errs.append(str(e)))
   app=await boot(p)
   for _ in range(35):
    if await app.locator('.event-panel').count():await app.locator('.choice:not([disabled])').last.click()
    if await app.locator('.end-panel').count():break
    if mode=='spender':
     for _ in range(2):
      action=app.locator('.action-row:not([disabled])').first
      if await action.count():await action.click()
    if not await app.locator('.advance').is_enabled():break
    await app.locator('.advance').click()
   assert await app.locator('.end-panel').count()==1,f'{mode}: no finish'
   assert await app.locator('.end-area').count()==9
   assert await app.locator('.modal-backdrop').count()==0
   assert not errs,errs
   print('PLAYTHROUGH',mode, 'day',await app.locator('.day-stat strong').inner_text())
   await p.close()
  print('UI',json.dumps({'playback':playback,'mobile':mobile,'errors':errors},ensure_ascii=False))
  await browser.close()

asyncio.run(main())
