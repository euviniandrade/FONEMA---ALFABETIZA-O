# D037 — Entrada nova: login e senha para adultos, acessos separados

Data: 2026-11-26. Origem: **pedido do dono** (fila nº 34), com as palavras dele: "troque a entrada do jogo... recriar do zero...
mais útil, mais bonito, que chama de fato mais atenção... opção de entrar ali não só a pessoa, o aluno, mas também o professor,
de colocar o login, a senha... o administrador geral, que sou eu... Parece que tem só um tipo de acesso aí, não dá pra deixar ser."

O que segue é **decisão do dono** (entrada refeita, acessos separados com login e senha, acesso do administrador) e **decisão do
projeto [DP]** (os detalhes técnicos abaixo). Nada aqui é afirmação de pesquisa.

**Substitui:** o PIN de 4 números dos adultos da D028. A D028 continua valendo no resto (primeira página é sempre a entrada; só
adultos criam conta; a criança entra pelo cartão do personagem, sem senha; dados mínimos, LGPD art. 14).

## O que foi decidido
1. **Primeira página refeita do zero** com três portas visíveis: **Criança/aluno(a)** ("Vamos jogar!", sem senha, vai aos cartões
   das crianças), **Família** e **Professor(a)** ("Para adultos · com login e senha"), e o link **Administrador** no rodapé.
2. **Login e senha [DP]:** login = e-mail ou nome de usuário; senha com pelo menos 6 caracteres e letras. Guardada só como
   impressão digital (PBKDF2) no aparelho.
3. **Portas separadas:** conta da família não abre a porta do professor e vice-versa.
4. **Segunda conta no mesmo aparelho [DP]:** um adulto já cadastrado confirma antes (toda conta vê as crianças do aparelho).
5. **"Esqueci a senha" [DP]:** sem servidor, não há e-mail; troca no próprio aparelho, segurando um botão por 5 segundos, só na
   porta certa. Mesmo nível do antigo "Esqueci o PIN".
6. **Contas antigas com PIN** (as do site publicado) entram com o PIN uma última vez e criam login e senha. Nada é removido.

## Limites (sem servidor, decisão pendente do dono — A4)
- Cada login vale só naquele aparelho e navegador; não há recuperação por e-mail.
- Login que funcione em qualquer aparelho exige servidor e banco de dados (custo e LGPD): depende do dono.

## Perguntas abertas ao dono
- Manter o "esqueci a senha" de segurar 5 segundos, ou exigir que outro adulto cadastrado confirme a troca?
