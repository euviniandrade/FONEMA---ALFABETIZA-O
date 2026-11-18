# Como transformar uma foto em 3D (o "robô" da foto)

Pedido do dono (fila nº 19, 18/11): "enviar uma foto e ele já transforma tudo em 3D e coloca na plataforma".
Fica na **Área do administrador › Foto → 3D** (`#/admin/foto3d`).

## Regra que não muda: foto de pessoa, nunca

Só foto de **objeto, brinquedo, figura ou personagem desenhado**. Foto de pessoa, e principalmente de criança, não
entra (LGPD art. 14; regra do projeto D008 §5: avatar sem foto nem semelhança com criança real). Por isso:

- o aviso aparece no topo da ferramenta;
- o botão "Escolher foto" só abre depois que o adulto marca "confirmo que a foto **não é de uma pessoa**";
- se o navegador souber procurar rostos (`FaceDetector`, hoje só alguns Chrome), foto com rosto é recusada. Nos outros
  navegadores vale a confirmação do adulto;
- a foto não sai do aparelho, a não ser no pedido que o próprio adulto baixar (passo 4).

## 1. Fazer o 3D na hora (grátis, sem internet)

1. Marque a confirmação e escolha a foto. Funciona melhor com o objeto inteiro, num **fundo liso** (parede, papel), ou
   com um PNG de fundo transparente.
2. A ferramenta tira o fundo (se sobrar fundo ou sumir um pedaço, mexa em **sensibilidade**) e monta o modelo.
3. O modelo aparece **girando**; arraste para girar. **Espessura** deixa mais gordinho ou mais fino.
4. Dê um **nome** e escolha **onde colocar**:
   - **no lugar do troféu, do baú de livros ou do porquinho** (os prêmios que giram 360°): o modelo novo já aparece no
     lugar neste aparelho. Para voltar ao original: aba **Imagens**, pasta `modelos3d`, "Voltar ao original";
   - **modelo novo**: fica guardado em `assets/modelos3d/itens/<nome>.glb` (com a imagem de frente `<nome>.webp`).
5. **Aprovar e colocar na plataforma**. Para valer **para todos**, gere o pacote em **Publicar** (ele leva o modelo junto)
   e aplique com `npx tsx scripts/importar-pacote.ts` (passo a passo em `como-editar-a-plataforma.md`).

**O que é este 3D:** um **relevo**: a silhueta da foto "inflada" como uma almofada, com a foto na frente e no verso
(como um biscoito pintado dos dois lados). Gira 360° e fica pronto na hora, mas **não inventa o verso de verdade**. Para
um objeto redondo ou desenhado de frente fica bom; para um carrinho visto de lado, o verso é o mesmo lado espelhado.

## 2. O "3D completo" (com o verso de verdade)

Precisa de um serviço de inteligência artificial de imagem → 3D. O caminho gratuito escolhido são os **Spaces públicos
do Hugging Face** (TRELLIS, da Microsoft, licença MIT; ou Hunyuan3D-2, da Tencent), chamados pela API do gradio. Eles
rodam em placa de vídeo gratuita, com **fila e cota diária**.

1. Na ferramenta, **Pedir o 3D completo**: baixa `fonema-pedido-3d-<nome>.zip` (pedido.json, a foto já recortada e o
   relevo, como reserva).
2. Mande o .zip para quem cuida do repositório. Lá, na pasta `app/`:

   ```
   npx tsx scripts/foto-para-3d.ts caminho/fonema-pedido-3d-<nome>.zip
   #   --servico trellis   (padrão) · --servico hunyuan · --servico relevo (usa o relevo do pedido, sem internet)
   #   --space dono/nome   outro Space com a mesma API · --sem-comprimir · --saida PASTA
   ```

   O script manda a foto recortada ao serviço, baixa o `.glb`, comprime como os outros modelos do projeto (meshopt +
   WebP, `@gltf-transform/cli`) e grava `fonema-pacote-3d-<nome>.zip`.
3. Aplique: `npx tsx scripts/importar-pacote.ts fonema-pacote-3d-<nome>.zip` (confere, grava em
   `web/public/assets/<caminho>.glb` e roda os testes).

**Limite honesto (18/11):** neste ambiente de trabalho do agente, os hosts `*.hf.space` (a API dos Spaces) e
`us.aws.cdn.hf.co` (download de modelos de IA) estão **bloqueados**; só `huggingface.co` responde. Por isso o passo 2
**não foi testado contra o serviço de verdade** daqui: o script foi testado até a chamada (pedido → pacote, com
`--servico relevo`, e a recusa sem a confirmação de "não é pessoa"). A API dos Spaces muda sem aviso; se um passo
falhar, o script diz qual e sugere `--servico relevo`. Liberar `trellis-community-trellis.hf.space` (e
`tencent-hunyuan3d-2.hf.space`) no ambiente permitiria testar.

## 3. Do modelo novo a um item que a criança vê

Os prêmios 360° (troféu, baú, porquinho) já mostram o modelo trocado. Um modelo **novo** (`modelos3d/itens/`) fica
guardado e publicado, mas para virar **peça da Lojinha** ou **objeto do passeio** ainda precisa de uma linha no catálogo
(é código): `Modelo3D` em `web/src/componentes/recompensas.tsx` (lista `MODELOS`: nome e ângulo de frente) para
aparecer girando; no passeio (`docs/propostas/06-fonema-unificada/mundo-3d-v2`), o objeto precisa de um lugar no mapa,
também no código. O modelo já sai olhando para +X, como os outros do projeto.

## Arquivos

- Ferramenta: `web/src/telas/admin/foto3d/FerramentaFoto3D.tsx` (aba carregada por `Gerenciador.tsx › AbaFoto3D`).
- Recorte, relevo e gravação do GLB (cálculo puro, testado): `web/src/telas/admin/foto3d/relevo.ts` (+ `relevo.test.ts`).
- Script do 3D completo: `scripts/foto-para-3d.ts` (+ `foto-para-3d.test.ts`).
- E2E: `node web/e2e/fluxo.e2e.mjs --foto3d` (também no completo e no `--sem-jornada`).
