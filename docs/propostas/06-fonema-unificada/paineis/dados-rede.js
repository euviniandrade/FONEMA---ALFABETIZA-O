/* Dados FICTÍCIOS e coerentes — Rede Municipal de Vale Verde (2º ano, ano letivo 2026) */
(function(){
  const esc=[
    ['EM Ipê Amarelo',96,31,61],['EM Rio Claro',74,27,57],['EM Jardim das Flores',88,24,55],['EM Monte Alegre',61,22,58],
    ['EM Santa Luzia',70,20,52],['EM Vila Nova',83,18,47],['EM Dom Pedro II',58,17,53],['EM Sertãozinho',66,15,49],
    ['EM Boa Esperança',79,13,51],['EM Beira-Rio',52,11,46],['EM Lagoa Seca',47,9,44],['EM Pedra Branca',38,4,22]];
  const g=(x,m,s)=>Math.exp(-((x-m)**2)/(2*s*s));
  window.REDE={
    escolas:esc.map(([nome,n,p10,dose],k)=>{
      const mu=3.6+p10*0.135, sd=2.1;
      let w=Array.from({length:10},(_,i)=>g(i,mu,sd)+0.015);
      if(nome==='EM Beira-Rio'){w=w.map((x,i)=>i===5?x*0+2.2:x*0.55);} // estagnação no nível 5
      const resto=FONEMA.para100(w).map(x=>x*(100-p10)/100);
      const d=FONEMA.para100(resto.concat([p10*1]));
      // garante o p10 exato
      const diff=d[10]-p10; d[10]=p10; d[Math.round(mu)]+=diff;
      return {nome,n,p10,dose,dist:d,mediana:FONEMA.mediana(d)};
    }),
    meses:['fev','mar','abr','mai','jun','jul','ago','set','out','nov'],
    n10:[7,8,9,10,11,12,13,15,16,18],
    n7:[21,26,30,34,38,41,45,48,51,53]
  };
})();
