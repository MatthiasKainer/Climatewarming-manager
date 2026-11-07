// Development-only browser smoke shim. Production uses the actual pfusch package.
export const html = new Proxy({}, {get:(_,tag)=>(...args)=>{
 let a={}; if(args.length && args[0] && typeof args[0]==='object' && !Array.isArray(args[0]) && !args[0].tag){a=args.shift();}
 return {tag,a,children:args.flat(Infinity)};
}});
export function pfusch(name, state, renderer){
 customElements.define(name, class extends HTMLElement {
  constructor(){super();this.root=this.attachShadow({mode:'open'});this.data=new Proxy({...state},{set:(o,k,v)=>{o[k]=v;queueMicrotask(()=>this.paint());return true;}})}
  connectedCallback(){this.paint()}
  paint(){const style=document.createElement('link');style.rel='stylesheet';style.href='./style.css';
   const conv=(d,ns)=>{if(d===false||d==null)return document.createTextNode('');if(typeof d!=='object')return document.createTextNode(String(d));if(Array.isArray(d)){const f=document.createDocumentFragment();d.forEach(x=>f.appendChild(conv(x,ns)));return f;}
    const isSvg=d.tag==='svg'||ns==='svg';const el=isSvg?document.createElementNS('http://www.w3.org/2000/svg',d.tag):document.createElement(d.tag);for(const[k,v]of Object.entries(d.a||{})){if(typeof v==='function'){el.addEventListener(k,v)}else if(k==='disabled'){el.disabled=!!v}else if(v!=null){el.setAttribute(k,String(v));}}
    for(const x of d.children||[])el.appendChild(conv(x,isSvg?'svg':null));return el;};
   try{this.root.replaceChildren(style,...renderer(this.data).map(x=>conv(x)));}catch(e){console.error('render fail',e)}
  }
 });
}