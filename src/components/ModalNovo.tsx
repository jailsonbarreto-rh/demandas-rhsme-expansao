import React, { useState } from 'react';
import { Demanda } from '../types';
import { DateMaskInput } from './DateMaskInput';

interface ModalNovoProps {
  onClose: () => void;
  onSalvar: (demanda: Omit<Demanda, 'id'>) => void;
}

export const ModalNovo: React.FC<ModalNovoProps> = ({ onClose, onSalvar }) => {
  const [tipo, setTipo] = useState<string>('');
  const [numero, setNumero] = useState<string>('');
  const [assunto, setAssunto] = useState<string>('');
  const [responsavel, setResponsavel] = useState<string>('');
  const [limite1, setLimite1] = useState<string>('');
  const [limite2, setLimite2] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [setor, setSetor] = useState<string>('');
  const [classificacao, setClassificacao] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo || !numero || !assunto || !status || !classificacao) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    onSalvar({
      tipo: tipo as Demanda['tipo'],
      numero,
      assunto,
      responsavel,
      limite1,
      limite2,
      status: status as Demanda['status'],
      setor,
      classificacao
    });
  };

  const classificacoes = [
    'Dispensa de Ponto', 'CCFG', 'Cessão', 'Concursos', 'Contratação', 
    'Consultas', 'Inventário', 'Expediente Parlamentar', 'MP', 
    'Representação Judicial', 'DP', 'PGM', 'Recurso', 'Financeiro', 
    'Demanda Interna', 'Outros'
  ];

  const statusList = [
    'Aguardando Andamento', 'Tramitado', 'Para Assinatura', 
    'Encerrado', 'Sobrestado', 'Ajustar'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Registro</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-modal">
              {/* Tipo */}
              <div className="input-container-floating col-full">
                <select 
                  id="novo-tipo"
                  value={tipo} 
                  onChange={e => setTipo(e.target.value)} 
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="Expediente">Expediente</option>
                  <option value="Processo">Processo</option>
                  <option value="Outros">Outros</option>
                </select>
                <label htmlFor="novo-tipo">Tipo</label>
              </div>

              {/* Número */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="novo-numero"
                  placeholder=" "
                  value={numero} 
                  onChange={e => setNumero(e.target.value)} 
                  required 
                />
                <label htmlFor="novo-numero">Número</label>
              </div>

              {/* Assunto */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="novo-assunto"
                  placeholder=" "
                  value={assunto} 
                  onChange={e => setAssunto(e.target.value)} 
                  required 
                />
                <label htmlFor="novo-assunto">Assunto</label>
              </div>

              {/* Responsável */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="novo-responsavel"
                  placeholder=" "
                  value={responsavel} 
                  onChange={e => setResponsavel(e.target.value)} 
                />
                <label htmlFor="novo-responsavel">Responsável</label>
              </div>

              {/* Limite 1 (Título Externo) */}
              <div>
                <DateMaskInput 
                  id="novo-limite1"
                  label="Limite 1"
                  value={limite1}
                  onChange={setLimite1}
                />
              </div>

              {/* Limite 2 (Título Externo) */}
              <div>
                <DateMaskInput 
                  id="novo-limite2"
                  label="Limite 2"
                  value={limite2}
                  onChange={setLimite2}
                />
              </div>

              {/* Status */}
              <div className="input-container-floating col-full">
                <select 
                  id="novo-status"
                  value={status} 
                  onChange={e => setStatus(e.target.value)} 
                  required
                >
                  <option value="" disabled hidden></option>
                  {statusList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <label htmlFor="novo-status">Status</label>
              </div>

              {/* Setor */}
              <div className="input-container-floating col-full">
                <input 
                  type="text" 
                  id="novo-setor"
                  placeholder=" "
                  value={setor} 
                  onChange={e => setSetor(e.target.value)} 
                />
                <label htmlFor="novo-setor">Setor (ex: E/CTRH)</label>
              </div>

              {/* Classificação */}
              <div className="input-container-floating col-full">
                <select 
                  id="novo-classificacao"
                  value={classificacao} 
                  onChange={e => setClassificacao(e.target.value)} 
                  required
                >
                  <option value="" disabled hidden></option>
                  {classificacoes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <label htmlFor="novo-classificacao">Selecione a classificação</label>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-floppy-disk"></i> Salvar
            </button>
            <button type="button" className="btn" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
