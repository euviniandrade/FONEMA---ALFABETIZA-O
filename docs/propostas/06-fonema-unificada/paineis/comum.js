/* FONEMA · utilidades comuns dos painéis */
(function(){
  const q=new URLSearchParams(location.search);
  const escuro=q.get('tema')==='escuro'||(!q.get('tema')&&matchMedia('(prefers-color-scheme: dark)').matches&&q.get('auto')==='1');
  if(escuro)document.documentElement.dataset.tema='escuro';
  const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const F=window.FONEMA={escuro,css,
    niveis:()=>Array.from({length:11},(_,i)=>css('--n'+i)),
    fonte:'Atkinson, system-ui, sans-serif',
    /* soma 100 com arredondamento pelo maior resto */
    para100(v){const s=v.reduce((a,b)=>a+b,0);const raw=v.map(x=>x*100/s);const fl=raw.map(Math.floor);let r=100-fl.reduce((a,b)=>a+b,0);raw.map((x,i)=>[x-fl[i],i]).sort((a,b)=>b[0]-a[0]).slice(0,r).forEach(([,i])=>fl[i]++);return fl;},
    mediana(d){let a=0;for(let i=0;i<d.length;i++){a+=d[i];if(a>=50)return i;}return d.length-1;},
    base(){return{textStyle:{fontFamily:F.fonte,color:css('--tinta-2')},animation:false};},
    tooltip(extra){return Object.assign({backgroundColor:css('--cartao'),borderColor:css('--linha'),textStyle:{color:css('--tinta'),fontFamily:F.fonte,fontSize:13},extraCssText:'border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.15)'},extra||{});},
    pendentes:0,
    registrar(chart){F.pendentes++;let ok=false;const fim=()=>{if(ok)return;ok=true;F.pendentes--;if(F.pendentes<=0)setTimeout(()=>window.__pronto=true,400);};chart.on('finished',fim);setTimeout(fim,3500);return chart;},
    ic:{
      ok:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>',
      aviso:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5l7 13H1z"/><rect x="7.2" y="6" width="1.6" height="4.5" fill="var(--cartao)"/><rect x="7.2" y="11.6" width="1.6" height="1.6" fill="var(--cartao)"/></svg>',
      alerta:'<svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="12" height="12" rx="2" transform="rotate(45 8 8)"/><rect x="7.2" y="4.5" width="1.6" height="5" fill="var(--cartao)"/><rect x="7.2" y="10.6" width="1.6" height="1.6" fill="var(--cartao)"/></svg>',
      info:'<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7"/><rect x="7.2" y="7" width="1.6" height="5" fill="var(--cartao)"/><rect x="7.2" y="4" width="1.6" height="1.6" fill="var(--cartao)"/></svg>',
      cadeado:'<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
    },
    st(tipo,txt){return `<span class="st ${tipo}">${F.ic[tipo]}${txt}</span>`;}
  };
})();
