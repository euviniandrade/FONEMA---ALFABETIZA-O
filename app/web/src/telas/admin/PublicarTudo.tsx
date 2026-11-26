/**
 * Publicar › "Gerar pacote com tudo" (gerenciador): edições do conteúdo + figuras/modelos + áudios trocados neste
 * aparelho num .zip só (servicos/pacote.ts). No repositório: `npx tsx scripts/importar-pacote.ts pacote.zip`.
 */
import { useState } from 'react';
import { Icone } from '../../componentes/ui.tsx';
import { edicoes } from '../../servicos/edicoes.ts';
import { montarPacoteGeral, type EntradaMidia } from '../../servicos/pacote.ts';
import { substituicoes } from '../../servicos/substituicoes.ts';
import { sha256 } from '../../servicos/audio-edicao.ts';
import { ROTULO_TIPO_AUDIO } from '../../servicos/catalogo-audios.ts';
import { baixar, carimbo, useCatalogo, useTrocados } from './dados-admin.ts';
import { useVersaoEdicoes } from './edicao-comum.tsx';

export function PublicarTudo() {
  useVersaoEdicoes();
  const catalogo = useCatalogo();
  const trocados = useTrocados();
  const [msg, setMsg] = useState('');
  const [gerando, setGerando] = useState(false);
  const nEd = edicoes.edicoes().length;
  const nMid = edicoes.midias().length;
  const semAutorizacao = [...trocados.values()].filter((m) => m.origem !== 'arquivo' && !m.autorizacao).length;
  const gerar = async () => {
    setGerando(true);
    try {
      const registros = await substituicoes.listar();
      const audios = await Promise.all(registros.map(async (r) => {
        const dados = new Uint8Array(await r.blob.arrayBuffer());
        const it = catalogo?.find((x) => x.id === r.id);
        return { id: r.id, dados, mime: r.blob.type || 'application/octet-stream', texto: it?.texto ?? r.texto, tipo: it ? ROTULO_TIPO_AUDIO[it.tipo] : undefined, origem: r.origem, robo: r.robo, quem: r.quem, autorizacao: r.autorizacao, duracaoMs: r.duracaoMs, em: r.em, sha256: await sha256(dados) };
      }));
      const midias: EntradaMidia[] = await Promise.all((await edicoes.listarMidias()).map(async (m) => {
        const dados = new Uint8Array(await m.blob.arrayBuffer());
        return { caminho: m.caminho, dados, mime: m.blob.type || 'application/octet-stream', nome: m.nome, quem: m.quem, em: m.em, sha256: await sha256(dados) };
      }));
      const { zip, pacote } = montarPacoteGeral({ audios, edicoes: edicoes.edicoes(), midias });
      baixar(new Blob([zip as unknown as BlobPart], { type: 'application/zip' }), `fonema-pacote-${carimbo()}.zip`);
      setMsg(`Pacote gerado: ${pacote.edicoes.length} edição(ões), ${pacote.midias.length} figura(s)/modelo(s), ${pacote.audios.length} áudio(s).`);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Não deu para gerar o pacote.'); } finally { setGerando(false); }
  };
  return (
    <div data-testid="publicar-tudo">
      <p>Tudo o que você mudou aqui (textos, falas, missões, personagens, lojinha, leitura, figuras e áudios) vale <b>só neste aparelho</b>. Para valer para todo mundo:</p>
      <ol className="adm-passos">
        <li>Toque em <b>Gerar pacote com tudo</b>: baixa um arquivo <code>.zip</code>.</li>
        <li>Mande o arquivo para quem cuida do repositório (e-mail, Drive, WhatsApp).</li>
        <li>Lá, ele roda <code>npx tsx scripts/importar-pacote.ts pacote.zip</code> (na pasta <code>app/</code>). O importador confere a decodificabilidade e roda os testes: se algo quebrar, nada entra. Depois, publica a versão nova do site.</li>
      </ol>
      <p className="adm-nota">Passo a passo: <code>app/docs/como-editar-a-plataforma.md</code>.</p>
      {semAutorizacao ? <p className="adm-aviso" role="alert">{semAutorizacao} gravação(ões) sem a marca "a pessoa autorizou por escrito".</p> : null}
      <div className="adm-linha">
        <button className="btn adm-btn pri" onClick={() => void gerar()} disabled={gerando || (!nEd && !nMid && !trocados.size)} data-testid="gerar-pacote-tudo">
          <Icone nome="baixar" />{gerando ? 'Gerando…' : `Gerar pacote com tudo (${nEd} edições · ${nMid} figuras · ${trocados.size} áudios)`}
        </button>
        {msg ? <span className="adm-etq verde" role="status" data-testid="msg-pacote-tudo">{msg}</span> : null}
      </div>
    </div>
  );
}
