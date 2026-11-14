# Auditoria dos sons das letras (fonemas puros)

Gerado por `ferramentas/gerar-sons-letras.py`. Regra (D027 §2 e D029 §2): **clipe reprovado não vai ao ar**; a letra fica com a fala da dupla ("M, de macaco.") até um adulto gravar o som no Estúdio de sons.

- Aprovados nas medidas: **13** · duvidosos (no ar, mas pedem conferência de ouvido): **11** · reprovados (fora do ar): **3**
- **Nenhum clipe foi ouvido por pessoa.** "Aprovado" significa aprovado nas medidas do sinal (voz, faixa do chiado, formantes, duração). A conferência final é de ouvido, de preferência por fonoaudióloga.
- Voz: adulta feminina de professora (ElevenLabs, modelo v3), usada **só** para o som da letra. Fontes brutas em `audio-fontes/sons/`.
- Contínuos com menos de 1,1 s no bruto foram alongados repetindo o miolo estável (emenda alinhada de 50 ms).

| Fonema | Letras | Tipo | Estado | Motivo | Medidas | Texto enviado ao TTS | Scribe ouviu |
|---|---|---|---|---|---|---|---|
| /a/ `a` | A | vogal | **aprovado** | dentro dos critérios do tipo de som | dur 1.85 · voz 1.0 · cenh 1984 · grave 0.06 · medio 0.88 · agudo 0.05 · vogal 1.0 · F1 978 · F2 1668 | Aaaaaaaaaaaaaaaaaa. | Ah! |
| /ɛ/ `E` | E | vogal | **aprovado** | dentro dos critérios do tipo de som | dur 1.08 · voz 0.99 · cenh 3385 · grave 0.46 · medio 0.3 · agudo 0.25 · vogal 0.59 · F1 609 · F2 2383 | Éééééééééé. | Êêê! |
| /e/ `e` | E | vogal | **aprovado** | dentro dos critérios do tipo de som | dur 1.11 · voz 0.98 · cenh 4794 · grave 0.77 · medio 0.02 · agudo 0.2 · vogal 0.05 · F1 403 · F2 2713 | Éééééééééééééééééé. | Eee? |
| /i/ `i` | I, Y | vogal | **aprovado** | dentro dos critérios do tipo de som | dur 1.43 · voz 0.94 · cenh 4531 · grave 0.76 · medio 0.0 · agudo 0.23 · vogal 0.0 · F1 313 · F2 2883 | Iiiiiiiiii. | Ihhh |
| /ɔ/ `O` | O | vogal | **aprovado** | dentro dos critérios do tipo de som | dur 1.16 · voz 0.99 · cenh 3913 · grave 0.17 · medio 0.83 · agudo 0.0 · vogal 0.99 · F1 717 · F2 1112 | Óóóóóóóóóó. | Oh! |
| /o/ `o` | O | vogal | **aprovado** | dentro dos critérios do tipo de som | dur 1.59 · voz 0.89 · cenh 5980 · grave 0.83 · medio 0.16 · agudo 0.0 · vogal 0.11 · F1 410 · F2 1066 | Ôôôôôôôôôô. | Oh! |
| /u/ `u` | U, W | vogal | **aprovado** | dentro dos critérios do tipo de som | dur 1.08 · voz 0.98 · cenh 4349 · grave 0.88 · medio 0.12 · agudo 0.0 · vogal 0.0 · F1 396 · F2 821 | Uuuuuuuuuuuuuuuuuu. | Uuuu! |
| /ã/ `a~` | Ã | vogal | **duvidoso** | a nasalidade não é medida; só a posição da vogal | dur 1.18 · voz 0.99 · cenh 3712 · grave 0.86 · medio 0.11 · agudo 0.03 · vogal 0.16 · F1 445 · F2 1622 | Ãããããããããããããããããã. | Hããã! |
| /m/ `m` | M | continuo | **aprovado** | dentro dos critérios do tipo de som | dur 1.41 · voz 0.99 · cenh 1847 · grave 0.96 · medio 0.03 · agudo 0.0 · vogal 0.0 | Mmmmmmmmmmmmmmmmmm. | Hum |
| /n/ `n` | N | continuo | **aprovado** | dentro dos critérios do tipo de som | dur 1.35 · voz 1.0 · cenh 3558 · grave 0.97 · medio 0.02 · agudo 0.01 · vogal 0.0 | Nnnnnnnnavio. | Hum, hum, hum, hum. |
| /l/ `l` | L | continuo | **duvidoso** | L e N se parecem nas medidas: confirmado só por vir de "llllá" | dur 1.36 · voz 0.99 · cenh 4997 · grave 0.98 · medio 0.0 · agudo 0.01 · vogal 0.01 | Lllllllllllllllá. | Ihhh! |
| /v/ `v` | V, W | continuo | **duvidoso** | a fricção do V é fraca (aparece em 11% do clipe): pode soar como um "mmm" ou "uuu" abafado | dur 1.29 · voz 0.98 · cenh 6803 · grave 0.91 · medio 0.03 · agudo 0.06 · vogal 0.0 | Vvvvvvvvvv. | Vrum, vrum |
| /f/ `f` | F | continuo | **aprovado** | dentro dos critérios do tipo de som | dur 1.32 · voz 0.03 · cenh 7016 · grave 0.0 · medio 0.19 · agudo 0.81 · vogal 0.03 | Ffffffffff. | [som de fumaça saindo] |
| /s/ `s` | S | continuo | **aprovado** | dentro dos critérios do tipo de som | dur 1.32 · voz 0.0 · cenh 8569 · grave 0.0 · medio 0.0 · agudo 1.0 · vogal 0.0 | Ssssssssssssssssss. | [som de spray] |
| /ʃ/ `x` | X, CH | continuo | **aprovado** | dentro dos critérios do tipo de som | dur 1.19 · voz 0.0 · cenh 4601 · grave 0.0 · medio 0.0 · agudo 1.0 · vogal 0.0 | Shhhhhhhhhhh. | Shh, shh, shh. |
| /z/ `z` | Z | continuo | **aprovado** | dentro dos critérios do tipo de som | dur 1.31 · voz 0.98 · cenh 9127 · grave 0.24 · medio 0.01 · agudo 0.75 · vogal 0.0 | Zzzzzzzzzzzzzzzzá. | [som de vibração] |
| /ʒ/ `j` | J | continuo | **duvidoso** | a transcrição automática não reconheceu o som como J (ouviu "iii" numa versão): o chiado pode estar fraco perto da voz | dur 1.41 · voz 0.99 · cenh 4745 · grave 0.63 · medio 0.01 · agudo 0.35 · vogal 0.0 | Jjjjjjjjá. | Iiiiii |
| /ʁ/ `rr` | R | continuo | **duvidoso** | R forte muda com o sotaque (garganta ou língua tremendo); as medidas não garantem que soe como R | dur 0.48 · voz 0.31 · cenh 2485 · grave 0.42 · medio 0.31 · agudo 0.16 · vogal 0.21 | Arrrrrrrá. | [ruído] |
| /p/ `p` | P | explosivo | **duvidoso** | o ponto do estouro (lábios, dentes, fundo da boca) não é medido com segurança: conferir de ouvido | dur 0.09 · voz 0.78 · cenh 1867 · grave 0.06 · medio 0.92 · agudo 0.02 · vogal 0.78 · vozNoComeco 0.0 · restoDeVogal 0.07 | Pá. | (vazio) |
| /b/ `b` | B | explosivo | **duvidoso** | o ponto do estouro (lábios, dentes, fundo da boca) não é medido com segurança: conferir de ouvido | dur 0.16 · voz 0.81 · cenh 2043 · grave 0.4 · medio 0.59 · agudo 0.0 · vogal 0.5 · vozNoComeco 0.5 · restoDeVogal 0.08 | Bá. | (vazio) |
| /t/ `t` | T | explosivo | **duvidoso** | o ponto do estouro (lábios, dentes, fundo da boca) não é medido com segurança: conferir de ouvido | dur 0.12 · voz 0.58 · cenh 1941 · grave 0.11 · medio 0.83 · agudo 0.07 · vogal 0.58 · vozNoComeco 0.0 · restoDeVogal 0.07 | Tá. | (vazio) |
| /d/ `d` | D | explosivo | **duvidoso** | sem barra de voz antes do estouro: pode soar como o par surdo; o ponto do estouro (lábios, dentes, fundo da boca) não é medido com segurança: conferir de ouvido | dur 0.18 · voz 0.72 · cenh 2287 · grave 0.87 · medio 0.11 · agudo 0.01 · vogal 0.39 · vozNoComeco 0.25 · restoDeVogal 0.07 | Dá. | (vazio) |
| /k/ `k` | C, K, Q | explosivo | **duvidoso** | o ponto do estouro (lábios, dentes, fundo da boca) não é medido com segurança: conferir de ouvido | dur 0.12 · voz 0.75 · cenh 2315 · grave 0.24 · medio 0.57 · agudo 0.04 · vogal 0.67 · vozNoComeco 0.25 · restoDeVogal 0.08 | Cá. | (vazio) |
| /g/ `g` | G | explosivo | **duvidoso** | o ponto do estouro (lábios, dentes, fundo da boca) não é medido com segurança: conferir de ouvido | dur 0.18 · voz 0.89 · cenh 2718 · grave 0.68 · medio 0.14 · agudo 0.02 · vogal 0.44 · vozNoComeco 0.5 · restoDeVogal 0.08 | Gá. | (vazio) |
| /ɾ/ `r` | R | curto | **reprovado** | R fraco (batida da língua): não se sustenta e o recorte da batida sozinha não ficou confiável |  |  |  |
| /ʎ/ `lh` | LH | curto | **reprovado** | LH: som curto entre vogais; o recorte ficou com menos de 100 ms e sem identidade clara |  |  |  |
| /ɲ/ `nh` | NH | curto | **reprovado** | NH: idem ao LH |  |  |  |

Medidas: `dur` duração do som (s) · `voz` fração do clipe com barra de voz · `cenh` centro do chiado (Hz, acima de 1,5 kHz) · `grave`/`medio`/`agudo` fração da energia abaixo de 500 Hz, de 0,5 a 2 kHz e acima de 2 kHz · `vogal` fração do clipe que soa como vogal · `F1`/`F2` formantes (Hz).
