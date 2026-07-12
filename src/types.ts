export interface Demanda {
  id: number;
  numero: string;
  tipo: 'Expediente' | 'Processo' | 'Outros';
  assunto: string;
  responsavel: string;
  limite1: string; // dd/mm/aaaa ou vazio
  limite2: string; // dd/mm/aaaa ou vazio
  status: 'Aguardando Andamento' | 'Tramitado' | 'Para Assinatura' | 'Encerrado' | 'Sobrestado' | 'Ajustar';
  setor: string;
  classificacao: string;
}

export interface ComentarioHistorico {
  id: number;
  demandaId: number;
  data_hora: string; // dd/mm/aaaa hh:mm:ss ou ISO
  status_novo: string;
  setor: string;
  comentario: string;
}
