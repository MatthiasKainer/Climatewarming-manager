// Development-only browser render shim. Production loads the real pfusch package.
export const html = new Proxy({}, {get:(_,tag)=>(...args)=>{
 let a={}; if(args.length && args[0] && typeof args[0]==='object' && !Array.isArray(args[0]) && !args[0].tag){a=args.shift();}
 return {tag,a,children:args.flat(Infinity)};
}});
export const script=(fn)=>({__script:fn});
export function pfusch(name, state, renderer){
 customElements.define(name, class extends HTMLElement {
  constructor(){super();this.root=this.attachShadow({mode:'open'});this.scriptInstalled=false;this.data=new Proxy({...state},{set:(o,k,v)=>{o[k]=v;queueMicrotask(()=>this.paint());return true;}})}
  connectedCallback(){this.paint()}
  paint(){const style=document.createElement('link');style.rel='stylesheet';style.href='./style.css';
   const conv=(d,ns)=>{
    if(d===false||d==null||d?.__script)return document.createTextNode('');
    if(typeof d!=='object')return document.createTextNode(String(d));
    if(Array.isArray(d)){const f=document.createDocumentFragment();d.forEach(x=>f.appendChild(conv(x,ns)));return f;}
    const isSvg=d.tag==='svg'||ns==='svg';const el=isSvg?document.createElementNS('http://www.w3.org/2000/svg',d.tag):document.createElement(d.tag);
    for(const[k,v]of Object.entries(d.a||{})){
     if(typeof v==='function'){el.addEventListener(k,v)}
     else if(['disabled','inert','checked'].includes(k)){el[k]=!!v;if(v)el.setAttribute(k,'')}
     else if(v!=null){el.setAttribute(k,String(v));}
    }
    for(const x of d.children||[])el.appendChild(conv(x,isSvg?'svg':null));return el;
   };
   try{const children=renderer(this.data);this.root.replaceChildren(style,...children.map(x=>conv(x)));
    if(!this.scriptInstalled){const init=children.find(x=>x?.__script);if(init){this.scriptInstalled=true;queueMicrotask(()=>init.__script.call({shadowRoot:this.root,component:this}));}}
   }catch(e){console.error('render fail',e)}
  }
 });
}
