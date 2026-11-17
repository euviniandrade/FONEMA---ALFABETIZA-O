/**
 * Como os áudios trocados pelo administrador chegam a TODOS os aparelhos.
 *
 * Hoje (sem servidor) só existe o provedor de PACOTE: gera um .zip para o dono mandar a quem cuida do repositório,
 * que aplica com scripts/importar-pacote-audios.ts e publica uma versão nova do site.
 *
 * Amanhã (com servidor): um provedor remoto (ex.: Vercel Blob para os arquivos + um banco para o mapa id → arquivo)
 * implementa esta mesma interface. O app consultaria `mapaPublicado()` ao abrir e a camada de substituição
 * (servicos/substituicoes.ts) passaria a ter uma terceira origem. NÃO está implementado e nenhuma credencial é pedida:
 * `ProvedorRemotoAudios` só deixa o lugar pronto e responde "precisa de servidor".
 */
import { montarPacote, type EntradaPacote, type Pacote } from './pacote-audios.ts';

export interface ProvedorAudios {
  readonly nome: string;
  /** Pode publicar agora (há servidor configurado, ou é o pacote local)? */
  disponivel(): boolean;
  /** Publica os áudios trocados. O pacote local devolve o zip para baixar. */
  publicar(entradas: EntradaPacote[]): Promise<{ zip?: Uint8Array; pacote: Pacote; mensagem: string }>;
  /** Mapa id → endereço dos áudios já publicados para todos (só no remoto). */
  mapaPublicado(): Promise<Record<string, string>>;
}

export class ProvedorPacoteLocal implements ProvedorAudios {
  readonly nome = 'Pacote de áudios (.zip)';
  disponivel() { return true; }
  async publicar(entradas: EntradaPacote[]) {
    const { zip, pacote } = montarPacote(entradas);
    return { zip, pacote, mensagem: `Pacote com ${pacote.itens.length} áudio(s) pronto. Mande o arquivo para quem cuida do repositório.` };
  }
  async mapaPublicado() { return {}; }
}

/** Lugar reservado para quando houver servidor (Vercel Blob/DB). Sem implementação e sem credenciais. */
export class ProvedorRemotoAudios implements ProvedorAudios {
  readonly nome = 'Servidor (ainda não existe)';
  disponivel() { return false; }
  async publicar(): Promise<never> { throw new Error('Precisa de servidor: publicar direto para todos ainda não existe. Use o pacote de áudios.'); }
  async mapaPublicado() { return {}; }
}

export const PROVEDORES: ProvedorAudios[] = [new ProvedorPacoteLocal(), new ProvedorRemotoAudios()];
