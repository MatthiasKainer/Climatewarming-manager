// Cuelume 0.2.2 cues (MIT) + an original, procedural ambient underscore.
// No borrowed recording, music file or automatically started audio.
const key='duerrekrise.audio.v1';
function loadPrefs(){try{return JSON.parse(localStorage.getItem(key)||'{}');}catch{return {};}}
const saved=loadPrefs();
let effects=saved.effects!==false;
let music=false; // Always opt-in after each page load; prevents unexpected autoplay.
let cuelume=null, boundRoot=null, loading=null;
let musicContext=null, musicGain=null, sequenceTimer=null, padStep=0;
const fadeTime=11.2;
function store(){try{localStorage.setItem(key,JSON.stringify({effects}));}catch{}}
export function audioPrefs(){return {effects,music};}
function oscillatorPress(){
 if(!effects)return;
 try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;
  const ctx=oscillatorPress.ctx||(oscillatorPress.ctx=new Audio());
  if(ctx.state==='suspended')void ctx.resume();
  const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(170,now);osc.frequency.exponentialRampToValueAtTime(98,now+.07);
  gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(.04,now+.004);
  gain.gain.exponentialRampToValueAtTime(.0001,now+.09);
  osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+.10);
 }catch{/* blocked/no audio device */}
}
async function loadCuelume(){
 if(loading)return loading;
 loading=import('https://cdn.jsdelivr.net/npm/cuelume@0.2.2/+esm').then(mod=>{
  cuelume=mod;cuelume.setVolume?.(.22);cuelume.setEnabled?.(effects);
  if(boundRoot)cuelume.bind?.(boundRoot);
  return mod;
 }).catch(()=>null);
 return loading;
}
export function attachSounds(root){
 boundRoot=root;
 // Delegation is required inside pfusch's Shadow DOM, not just on document.
 root.addEventListener('pointerdown',e=>{
  if(e.target?.closest?.('[data-cuelume-press]')&&!cuelume)oscillatorPress();
 },{capture:true});
 void loadCuelume();
}
export function playCue(name='success'){
 if(!effects)return;
 if(cuelume){try{cuelume.play(name,{volume:.65});}catch{oscillatorPress();}}
 else oscillatorPress();
}
export function toggleEffects(){
 effects=!effects;store();cuelume?.setEnabled?.(effects);
 if(effects)playCue('toggle');return effects;
}
const notes=[
 [110.00,164.81,220.0], [110.00,146.83,196.0],
 [98.0,146.83,196.0], [98.0,164.81,220.0],
 [87.31,130.81,174.61], [98.0,146.83,196.0],
 [110.0,146.83,196.0], [110.0,164.81,220.0]
]; // Original slow, non-melodic modal sequence.
function pad(){
 if(!music||!musicContext||musicContext.state==='closed')return;
 const when=musicContext.currentTime+.03;
 const tones=notes[padStep++%notes.length];
 for(let i=0;i<tones.length;i++){
  const osc=musicContext.createOscillator(),env=musicContext.createGain(),filter=musicContext.createBiquadFilter();
  osc.type=i===0?'sine':'triangle';osc.frequency.setValueAtTime(tones[i]*(i===2?1.002:1),when);
  filter.type='lowpass';filter.frequency.value=420;
  env.gain.setValueAtTime(.0001,when);
  env.gain.linearRampToValueAtTime(i===0?.20:.075,when+2.5);
  env.gain.setValueAtTime(i===0?.20:.075,when+7);
  env.gain.exponentialRampToValueAtTime(.0001,when+fadeTime);
  osc.connect(filter).connect(env).connect(musicGain);
  osc.start(when);osc.stop(when+fadeTime+.1);
 }
}
function startMusic(){
 if(musicContext||!music)return;
 const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
 if(!Audio){music=false;return;}
 try{
  musicContext=new Audio();musicGain=musicContext.createGain();
  musicGain.gain.setValueAtTime(.025,musicContext.currentTime);musicGain.connect(musicContext.destination);
  pad();sequenceTimer=setInterval(pad,8000);
 }catch{music=false;musicContext=null;}
}
function stopMusic(){
 if(sequenceTimer){clearInterval(sequenceTimer);sequenceTimer=null;}
 if(musicGain&&musicContext){
  const ctx=musicContext;try{const t=ctx.currentTime;musicGain.gain.cancelScheduledValues(t);musicGain.gain.setTargetAtTime(.0001,t,.3);}catch{}
  // close after fade; does not affect Cuelume's separate AudioContext
  setTimeout(()=>{void ctx.close().catch(()=>{});},1200);
 }
 musicContext=null;musicGain=null;
}
export function toggleMusic(){music=!music;if(music)startMusic();else stopMusic();return music;}
if(typeof document!=='undefined'){
 document.addEventListener('visibilitychange',()=>{
  if(!musicContext)return;
  if(document.hidden)void musicContext.suspend().catch(()=>{});
  else void musicContext.resume().catch(()=>{});
 });
}
