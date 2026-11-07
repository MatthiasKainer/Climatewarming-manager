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
// Original generated ambient loop, played through native HTML audio after an explicit click.
// Keeping music independent from the Cuelume/WebAudio press sounds avoids silent, suspended
// AudioContexts on Safari, mobile devices and energy-saving tabs.
const notes=[
 [196,246.94,293.66], [220,261.63,329.63],
 [174.61,220,261.63], [196,246.94,329.63]
];
let musicPlayer=null;
let musicError='';
function pcmLoop(){
 const rate=16000, seconds=12, len=rate*seconds;
 const bytes=new ArrayBuffer(44+len*2),view=new DataView(bytes);
 const chunk=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
 chunk(0,'RIFF');view.setUint32(4,36+len*2,true);chunk(8,'WAVE');chunk(12,'fmt ');
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
 view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);
 view.setUint16(34,16,true);chunk(36,'data');view.setUint32(40,len*2,true);
 const PI2=Math.PI*2;
 for(let i=0;i<len;i++){
  const t=i/rate,section=Math.min(3,Math.floor(t/3)),local=t%3,chord=notes[section];
  const fade=Math.min(1,t/.16,(seconds-t)/.2);
  const phrase=Math.min(1,local/.45,(3-local)/.6);
  const shimmer=.7+.3*Math.sin(PI2*t/.47);
  const drone=.29*Math.sin(PI2*98*t)+.12*Math.sin(PI2*196*t+.5);
  const harmony=chord.reduce((sum,hz,j)=>sum+(Math.sin(PI2*hz*t+j*.73)+.16*Math.sin(PI2*2*hz*t+j*.5))*(.21-j*.028),0);
  const chime=Math.exp(-local*1.25)*(.12*Math.sin(PI2*chord[2]*2*t)+.055*Math.sin(PI2*chord[1]*2*t));
  const sample=fade*(drone*.55+phrase*shimmer*harmony+chime);
  view.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,sample)) * 25000),true);
 }
 return new Blob([bytes],{type:'audio/wav'});
}
function player(){
 if(musicPlayer)return musicPlayer;
 musicPlayer=document.getElementById('crisis-ambient')||new Audio();
 musicPlayer.loop=true;musicPlayer.volume=.45;
 musicPlayer.src=URL.createObjectURL(pcmLoop());
 return musicPlayer;
}
export function audioPrefs(){return {effects,music,error:musicError};}
export async function toggleMusic(){
 if(music){player().pause();music=false;musicError='';return false;}
 musicError='';
 try{
  // play() is initiated synchronously during the button's user gesture.
  const p=player();const playing=p.play();
  if(playing&&typeof playing.then==='function')await playing;
  if(p.paused)throw new Error('Audio playback did not start');
  music=true;return true;
 }catch(error){
  music=false;musicError='Musik konnte nicht gestartet werden';
  try{musicPlayer?.pause();}catch{}
  return false;
 }
}
if(typeof window!=='undefined')window.addEventListener('pagehide',()=>{musicPlayer?.pause();});
