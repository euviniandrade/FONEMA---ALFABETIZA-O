// Ilha low-poly da vila (mesma ilha para os 4 momentos). Determinística: sem Math.random.
import * as THREE from 'three';

export function rnd(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

const flat=(c,extra={})=>new THREE.MeshStandardMaterial({color:c,flatShading:true,roughness:.9,metalness:0,...extra});

export function criaIlha(){
  const r=rnd(7);
  const g=new THREE.Group();
  const mats={
    grama:flat('#7FB069'),gramaEsc:flat('#5E9150'),areia:flat('#EBCB8B'),pedra:flat('#A89A8C'),
    tronco:flat('#7A4B2E'),copa:flat('#3F8A4F'),copa2:flat('#5FA45A'),ipe:flat('#E7A9C4'),
    parede:flat('#FFF4E2'),parede2:flat('#F3C7A8'),telha:flat('#A9472A'),telha2:flat('#B23C62'),
    madeira:flat('#9C6B45'),janela:new THREE.MeshStandardMaterial({color:'#5B4636',emissive:'#FFC86B',emissiveIntensity:0,flatShading:true}),
    agua:new THREE.MeshStandardMaterial({color:'#4FA3B5',flatShading:true,roughness:.35,metalness:.05,transparent:true,opacity:.96}),
    bandeira:flat('#F2B33D'),
  };
  // base: areia + grama (cilindros com ruído radial)
  const fazDisco=(raio,alt,y,mat,seg=22,amp=.18)=>{
    const geo=new THREE.CylinderGeometry(raio,raio*1.08,alt,seg,2);
    const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const a=Math.atan2(z,x);
      const k=1+amp*Math.sin(a*3+.7)+amp*.6*Math.sin(a*5+2.1);p.setX(i,x*k);p.setZ(i,z*k);
      if(p.getY(i)>0)p.setY(i,p.getY(i)+(Math.sin(a*4)*.06));}
    geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.position.y=y;m.receiveShadow=true;m.castShadow=true;return m;};
  g.add(fazDisco(6.4,.7,-.15,mats.areia));
  g.add(fazDisco(5.3,.6,.25,mats.grama));
  // colina com cachoeira simbólica
  const col=new THREE.Mesh(new THREE.DodecahedronGeometry(2.1,0),mats.gramaEsc);col.scale.set(1.25,.85,1);col.position.set(-2.3,.75,-2.2);col.castShadow=col.receiveShadow=true;g.add(col);
  const pedra=new THREE.Mesh(new THREE.DodecahedronGeometry(.9,0),mats.pedra);pedra.position.set(-.6,.75,-3.3);pedra.castShadow=true;g.add(pedra);
  // árvores
  const arvores=[];
  const arv=(x,z,s,mat)=>{const a=new THREE.Group();
    const t=new THREE.Mesh(new THREE.CylinderGeometry(.08*s,.12*s,.7*s,6),mats.tronco);t.position.y=.35*s;t.castShadow=true;a.add(t);
    const c1=new THREE.Mesh(new THREE.IcosahedronGeometry(.48*s,0),mat);c1.position.y=.95*s;c1.castShadow=true;a.add(c1);
    const c2=new THREE.Mesh(new THREE.IcosahedronGeometry(.34*s,0),mat);c2.position.set(.18*s,1.3*s,.05*s);c2.castShadow=true;a.add(c2);
    a.position.set(x,.55,z);g.add(a);arvores.push(a);return a;};
  [[-4,-.4,1.1,mats.copa],[-3.6,1.6,.9,mats.copa2],[3.9,-1.8,1.2,mats.copa],[4.2,.6,.85,mats.copa2],[-1,-3.9,1,mats.copa2],[1.6,-3.5,.95,mats.copa],[-4.4,-2.4,.8,mats.copa2],[2.8,3.2,.8,mats.ipe],[-2.5,3.4,.9,mats.copa]].forEach(a=>arv(...a));
  // palmeira na praia
  const palma=new THREE.Group();
  for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.36,5),mats.tronco);s.position.set(i*.05,.18+i*.33,0);s.rotation.z=-.08*i;palma.add(s);}
  for(let i=0;i<6;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(.16,1.3,4),mats.copa2);const a=i/6*Math.PI*2;f.position.set(.3+Math.cos(a)*.5,2.05,Math.sin(a)*.5);f.rotation.z=Math.PI/2+.4;f.rotation.y=-a;palma.add(f);}
  palma.position.set(5.3,.2,2.4);palma.traverse(o=>o.castShadow=true);g.add(palma);arvores.push(palma);
  // casas da vila
  const janelas=[];
  const casa=(x,z,rot,s,par,tel)=>{const c=new THREE.Group();
    const b=new THREE.Mesh(new THREE.BoxGeometry(1.1*s,.8*s,.9*s),par);b.position.y=.4*s;c.add(b);
    const tel_=new THREE.Mesh(new THREE.ConeGeometry(.9*s,.6*s,4),tel);tel_.position.y=1.1*s;tel_.rotation.y=Math.PI/4;tel_.scale.set(1,1,.86);c.add(tel_);
    const j=new THREE.Mesh(new THREE.BoxGeometry(.24*s,.24*s,.02),mats.janela.clone());j.position.set(-.24*s,.48*s,.46*s);c.add(j);janelas.push(j);
    const j2=j.clone();j2.material=mats.janela.clone();j2.position.x=.26*s;c.add(j2);janelas.push(j2);
    const p=new THREE.Mesh(new THREE.BoxGeometry(.22*s,.4*s,.02),mats.madeira);p.position.set(.02*s,.2*s,.46*s);c.add(p);
    c.traverse(o=>{o.castShadow=true;o.receiveShadow=true;});c.position.set(x,.55,z);c.rotation.y=rot;g.add(c);return c;};
  casa(-.6,.6,.25,1.15,mats.parede,mats.telha);
  casa(1.5,-.7,-.35,1,mats.parede2,mats.telha2);
  casa(.9,1.9,.1,.9,mats.parede,mats.telha2);
  casa(-2.2,1.4,.6,.85,mats.parede2,mats.telha);
  // biblioteca (torre com livro)
  const torre=new THREE.Group();
  const tb=new THREE.Mesh(new THREE.CylinderGeometry(.5,.6,1.6,8),mats.parede);tb.position.y=.8;torre.add(tb);
  const tt=new THREE.Mesh(new THREE.ConeGeometry(.75,.8,8),mats.telha);tt.position.y=2;torre.add(tt);
  const jt=new THREE.Mesh(new THREE.BoxGeometry(.26,.34,.02),mats.janela.clone());jt.position.set(0,1.1,.56);torre.add(jt);janelas.push(jt);
  // bandeira (vento)
  const mastro=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.9,5),mats.madeira);mastro.position.y=2.75;torre.add(mastro);
  const bandGeo=new THREE.PlaneGeometry(.55,.3,6,1);const band=new THREE.Mesh(bandGeo,new THREE.MeshStandardMaterial({color:'#F2B33D',side:THREE.DoubleSide,flatShading:true}));band.position.set(.29,3.04,0);torre.add(band);
  torre.traverse(o=>{o.castShadow=true;o.receiveShadow=true;});torre.position.set(2.7,.55,.9);g.add(torre);
  // píer
  const pier=new THREE.Group();
  for(let i=0;i<5;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.7,.08,.32),mats.madeira);t.position.set(0,0,i*.36);pier.add(t);}
  pier.position.set(-1.2,.32,5.3);pier.rotation.y=.15;pier.traverse(o=>o.castShadow=true);g.add(pier);
  // barquinho
  const barco=new THREE.Group();
  const casco=new THREE.Mesh(new THREE.CylinderGeometry(.35,.2,.25,8,1,false,0,Math.PI),mats.telha);casco.rotation.z=Math.PI/2;casco.rotation.y=Math.PI/2;casco.scale.set(1,2.2,1);barco.add(casco);
  const vela=new THREE.Mesh(new THREE.ConeGeometry(.4,.9,3),mats.parede);vela.position.y=.55;vela.scale.z=.15;barco.add(vela);
  barco.position.set(.4,.05,6.6);barco.traverse(o=>o.castShadow=true);g.add(barco);
  // flores/arbustos
  for(let i=0;i<16;i++){const a=r()*Math.PI*2,d=2+r()*2.6;const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.13+r()*.08,0),[mats.copa2,mats.ipe,mats.bandeira][i%3]);m.position.set(Math.cos(a)*d,.62,Math.sin(a)*d);g.add(m);}
  return {grupo:g,mats,janelas,arvores,bandeira:band,bandGeo,barco};
}

export function criaAgua(){
  const geo=new THREE.PlaneGeometry(220,220,110,110);geo.rotateX(-Math.PI/2);
  const base=geo.attributes.position.array.slice();
  const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#4FA3B5',flatShading:true,roughness:.3,metalness:.05}));
  m.receiveShadow=true;m.position.y=-.05;
  // ondas: amp em unidades; chamado com t (s) determinístico
  m.userData.anima=(t,amp=.06)=>{const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const x=base[i*3],z=base[i*3+2];
      p.setY(i,amp*(Math.sin(x*.9+t*1.3)+Math.cos(z*.8+t*1.1)*.8));}
    p.needsUpdate=true;geo.computeVertexNormals();};
  return m;
}
