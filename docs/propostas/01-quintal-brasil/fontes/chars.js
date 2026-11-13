(function(){
const P='#B97A52',PD='#A86C46',C='#3A2418',T='#2B1B12';
const bands=[[44,46],[64,31],[84,26],[104,28],[124,40]].map(([x,y])=>`<path d="M${x},${y} Q${x-7},70 ${x},100" stroke="#A0744B" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
const defs=`
<g id="sofia-corpo">
 ${[[40,92,30],[52,58,30],[84,38,31],[118,38,31],[150,58,30],[162,92,30],[164,128,26],[36,128,26],[44,160,22],[156,160,22],[60,175,16],[140,175,16]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${C}"/>`).join('')}
 <rect x="87" y="150" width="26" height="34" rx="8" fill="${PD}"/>
 <path d="M38,262 Q40,192 100,182 Q160,192 162,262 Z" fill="#F2B33D"/>
 <path d="M80,184 L100,206 L120,184 Z" fill="#FFFBF4"/>
 <path d="M64,204 L74,262 M136,204 L126,262" stroke="#1F6E82" stroke-width="10" stroke-linecap="round"/>
 <rect x="70" y="226" width="60" height="40" rx="9" fill="#1F6E82"/>
 <circle cx="100" cy="242" r="6" fill="#F2B33D"/>
 <ellipse cx="52" cy="118" rx="9" ry="12" fill="${PD}"/><ellipse cx="148" cy="118" rx="9" ry="12" fill="${PD}"/>
 <ellipse cx="100" cy="112" rx="50" ry="54" fill="${P}"/>
 ${[[68,70,18],[90,60,19],[114,61,18],[134,74,16],[56,88,13],[146,92,11]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${C}"/>`).join('')}
 <path d="M76,58 q6,-6 12,0 M104,56 q6,-6 12,0 M124,66 q6,-5 11,1" stroke="#6A4430" stroke-width="2.5" fill="none" stroke-linecap="round"/>
 <g transform="translate(140,64)"><circle r="7" cx="0" cy="-7" fill="#F2B33D"/><circle r="7" cx="7" cy="0" fill="#F2B33D"/><circle r="7" cx="0" cy="7" fill="#F2B33D"/><circle r="7" cx="-7" cy="0" fill="#F2B33D"/><circle r="4.5" fill="#A9472A"/></g>
 <path d="M70,98 Q80,91 91,97 M109,97 Q120,91 130,98" stroke="${C}" stroke-width="4" fill="none" stroke-linecap="round"/>
 <ellipse cx="80" cy="115" rx="7.5" ry="9.5" fill="${T}"/><ellipse cx="120" cy="115" rx="7.5" ry="9.5" fill="${T}"/>
 <circle cx="82.5" cy="111.5" r="2.8" fill="#fff"/><circle cx="122.5" cy="111.5" r="2.8" fill="#fff"/>
 <circle cx="68" cy="133" r="8.5" fill="#E07F62" opacity=".45"/><circle cx="132" cy="133" r="8.5" fill="#E07F62" opacity=".45"/>
 <path d="M96,125 Q100,130 104,125" stroke="#8E5636" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M85,140 Q100,157 115,140 Q100,147 85,140 Z" fill="#7A2E22"/>
 <path d="M92,148 Q100,153 108,148 Q100,151 92,148Z" fill="#D9786A"/>
</g>
<symbol id="sofia" viewBox="0 0 200 262"><use href="#sofia-corpo"/></symbol>
<symbol id="sofia-aponta" viewBox="0 0 290 262"><use href="#sofia-corpo"/>
 <path d="M148,214 Q196,204 228,168" stroke="#F2B33D" stroke-width="24" fill="none" stroke-linecap="round"/>
 <path d="M228,168 L248,144" stroke="${P}" stroke-width="16" stroke-linecap="round"/>
 <circle cx="252" cy="139" r="11" fill="${P}"/><path d="M256,134 L270,118" stroke="${P}" stroke-width="7" stroke-linecap="round"/>
</symbol>
<symbol id="bolota" viewBox="0 0 190 124">
 <path d="M22,96 Q8,92 6,80" stroke="#A87A4E" stroke-width="6" fill="none" stroke-linecap="round"/>
 <ellipse cx="44" cy="106" rx="12" ry="7" fill="#9C7048"/><ellipse cx="70" cy="109" rx="12" ry="7" fill="#9C7048"/><ellipse cx="104" cy="109" rx="12" ry="7" fill="#9C7048"/><ellipse cx="124" cy="106" rx="11" ry="7" fill="#9C7048"/>
 <path d="M18,100 Q16,28 84,22 Q148,26 146,100 Z" fill="#C99A6B"/>
 ${bands}
 <path d="M18,100 L146,100" stroke="#A0744B" stroke-width="6" stroke-linecap="round"/>
 <path d="M36,62 Q52,36 84,31" stroke="#E6C49B" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
 <ellipse cx="148" cy="84" rx="26" ry="22" fill="#E0B88C"/>
 <ellipse cx="168" cy="91" rx="11" ry="8" fill="#E0B88C"/><circle cx="176" cy="89" r="4.5" fill="#8A4E3A"/>
 <path d="M126,74 Q140,58 160,66 Q150,73 126,80 Z" fill="#C99A6B"/>
 <ellipse cx="134" cy="62" rx="7" ry="12" transform="rotate(-22 134 62)" fill="#D8A97D"/><ellipse cx="134" cy="63" rx="3.5" ry="7" transform="rotate(-22 134 63)" fill="#F0C9A6"/>
 <circle cx="153" cy="80" r="5.5" fill="${T}"/><circle cx="154.8" cy="78.2" r="1.8" fill="#fff"/>
 <circle cx="151" cy="93" r="5" fill="#E07F62" opacity=".45"/>
 <path d="M158,98 Q164,102 170,97" stroke="#6B3A28" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</symbol>
<symbol id="lia" viewBox="0 0 200 340">
 <circle cx="52" cy="58" r="32" fill="#2A1A12"/><circle cx="148" cy="58" r="32" fill="#2A1A12"/>
 <rect x="88" y="140" width="24" height="30" rx="8" fill="#6A3E26"/>
 <path d="M58,250 Q56,176 100,166 Q144,176 142,250 Z" fill="#B23C62"/>
 <path d="M60,184 Q38,210 40,240" stroke="#B23C62" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="40" cy="246" r="10" fill="#7B4A2E"/>
 <path d="M140,184 Q162,210 160,240" stroke="#B23C62" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="160" cy="246" r="10" fill="#7B4A2E"/>
 <path d="M62,246 L138,246 L146,284 L54,284 Z" fill="#1F6E82"/>
 <rect x="72" y="282" width="18" height="40" rx="8" fill="#7B4A2E"/><rect x="110" y="282" width="18" height="40" rx="8" fill="#7B4A2E"/>
 <ellipse cx="78" cy="324" rx="18" ry="9" fill="#A9472A"/><ellipse cx="122" cy="324" rx="18" ry="9" fill="#A9472A"/>
 <path d="M84,200 L100,214 L116,200" stroke="#FCE3A6" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="100" cy="98" rx="48" ry="52" fill="#7B4A2E"/>
 <path d="M54,88 Q60,44 100,42 Q140,44 146,88 Q130,66 100,66 Q72,66 54,88Z" fill="#2A1A12"/>
 <rect x="44" y="70" width="112" height="12" rx="6" fill="#F2B33D"/>
 <ellipse cx="82" cy="104" rx="7" ry="9" fill="${T}"/><ellipse cx="118" cy="104" rx="7" ry="9" fill="${T}"/>
 <circle cx="84.5" cy="100.5" r="2.6" fill="#fff"/><circle cx="120.5" cy="100.5" r="2.6" fill="#fff"/>
 <circle cx="70" cy="120" r="8" fill="#C2604A" opacity=".45"/><circle cx="130" cy="120" r="8" fill="#C2604A" opacity=".45"/>
 <path d="M86,126 Q100,140 114,126" stroke="#3A1810" stroke-width="4" fill="none" stroke-linecap="round"/>
</symbol>
<symbol id="moeda" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#E39B1B"/><circle cx="20" cy="18.5" r="16.5" fill="#F2B33D"/><circle cx="20" cy="18.5" r="11" fill="none" stroke="#E39B1B" stroke-width="2.5"/><path d="M15,21 Q20,9 26,14 Q22,22 15,21Z" fill="#E39B1B"/><path d="M10,12 Q13,7 18,6" stroke="#FFF1C9" stroke-width="2.5" fill="none" stroke-linecap="round"/></symbol>
<symbol id="i-casa" viewBox="0 0 64 64"><path d="M10,30 L32,12 L54,30" fill="#A9472A" stroke="#A9472A" stroke-width="6" stroke-linejoin="round"/><rect x="16" y="29" width="32" height="25" rx="4" fill="#F3C7A8"/><rect x="27" y="37" width="11" height="17" rx="3" fill="#7A4B2E"/></symbol>
<symbol id="i-album" viewBox="0 0 64 64"><rect x="12" y="10" width="40" height="46" rx="6" fill="#1F6E82"/><rect x="12" y="10" width="8" height="46" rx="3" fill="#18596A"/><rect x="25" y="18" width="20" height="20" rx="4" fill="#FCE3A6" transform="rotate(-6 35 28)"/><circle cx="35" cy="28" r="5" fill="#B23C62"/><rect x="26" y="42" width="18" height="5" rx="2.5" fill="#BFE3EC"/></symbol>
<symbol id="i-loja" viewBox="0 0 64 64"><rect x="12" y="28" width="40" height="26" rx="3" fill="#F3C7A8"/><path d="M8,14 H56 L54,28 H10Z" fill="#F2B33D"/><path d="M18,14 L16,28 M30,14 L30,28 M42,14 L44,28" stroke="#A9472A" stroke-width="6"/><rect x="24" y="36" width="16" height="18" rx="2" fill="#7A4B2E"/></symbol>
<symbol id="i-ouvido" viewBox="0 0 64 64"><path d="M22,26 Q22,10 36,10 Q50,10 50,26 Q50,34 42,40 Q36,44 36,50 Q36,56 29,56 Q22,56 22,50" fill="none" stroke="#3B2A20" stroke-width="5.5" stroke-linecap="round"/><path d="M30,27 Q30,19 36,19 Q42,19 42,26 Q42,30 37,32" fill="none" stroke="#3B2A20" stroke-width="4.5" stroke-linecap="round"/></symbol>
<symbol id="i-porteira" viewBox="0 0 64 64"><path d="M10,18 V52 M54,18 V52" stroke="#6E5D52" stroke-width="5" stroke-linecap="round"/><path d="M10,26 H54 M10,42 H54 M14,42 L50,26" stroke="#6E5D52" stroke-width="4" stroke-linecap="round"/></symbol>
<symbol id="i-mic" viewBox="0 0 64 64"><rect x="22" y="8" width="20" height="32" rx="10" fill="#1F6E82"/><path d="M14,30 Q14,48 32,48 Q50,48 50,30 M32,48 V58 M22,58 H42" fill="none" stroke="#1F6E82" stroke-width="5" stroke-linecap="round"/></symbol>
<symbol id="i-espelho" viewBox="0 0 64 64"><ellipse cx="32" cy="26" rx="18" ry="20" fill="#BFE3EC" stroke="#7A4B2E" stroke-width="5"/><path d="M24,16 Q28,11 34,11" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="28" y="45" width="8" height="15" rx="4" fill="#7A4B2E"/></symbol>
<symbol id="i-play" viewBox="0 0 64 64"><path d="M22,12 L52,32 L22,52 Z" fill="#FFFBF4" stroke="#FFFBF4" stroke-width="6" stroke-linejoin="round"/></symbol>
<symbol id="i-cofre" viewBox="0 0 64 64"><ellipse cx="32" cy="36" rx="24" ry="18" fill="#E58FA4"/><circle cx="54" cy="34" r="6" fill="#E58FA4"/><circle cx="56" cy="33" r="1.6" fill="#7A2E3E"/><path d="M14,24 L18,14 L24,22" fill="#E58FA4"/><rect x="26" y="19" width="12" height="4" rx="2" fill="#7A2E3E"/><rect x="18" y="48" width="8" height="10" rx="3" fill="#D27088"/><rect x="38" y="48" width="8" height="10" rx="3" fill="#D27088"/><circle cx="44" cy="30" r="2.4" fill="#3B2A20"/></symbol>
`;
document.write('<svg width="0" height="0" style="position:absolute"><defs>'+defs+'</defs></svg>');
})();
