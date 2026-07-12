import React from 'react';

interface ServidorPerfil {
  id: number;
  nome: string;
  email: string;
  nivel: 'Administrador' | 'Avançado' | 'Básico';
  setor: string;
  status: 'Ativo' | 'Pendente';
}

export const AdminPanel: React.FC = () => {
  // Lista simulada de servidores homologados na CTRH
  const servidores: ServidorPerfil[] = [
    { id: 1, nome: 'Wilson Peixoto', email: 'wilson.peixoto@rioeduca.net', nivel: 'Administrador', setor: 'CTRH', status: 'Ativo' },
    { id: 2, nome: 'Erica Ramos', email: 'erica.ramos@rioeduca.net', nivel: 'Avançado', setor: 'E/CTRH', status: 'Ativo' },
    { id: 3, nome: 'Ricardo Silva', email: 'ricardo.silva@rioeduca.net', nivel: 'Básico', setor: 'CARH', status: 'Ativo' },
    { id: 4, nome: 'Servidor SME Teste', email: 'sme.teste@rioeduca.net', nivel: 'Básico', setor: 'SME', status: 'Ativo' },
    { id: 5, nome: 'Mariana Costa', email: 'mariana.costa@rioeduca.net', nivel: 'Avançado', setor: 'E/CTRH', status: 'Pendente' }
  ];

  const handleSimulateAction = (acao: string) => {
    alert(`Ação de administração "${acao}" simulada com sucesso! Na versão integrada com Supabase, esta ação persistirá no banco de dados.`);
  };

  const handleExportJSONBackup = () => {
    const backupData = {
      sistema: 'Central de Demandas CTRH SME',
      backup_timestamp: new Date().toISOString(),
      usuarios_count: servidores.length,
      versao: '1.0.0-preview'
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `backup_ctrh_sme_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-panel-container" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
      
      {/* 1. Visão de Auditoria e Integridade */}
      <div className="dashboard-row" style={{ marginBottom: '25px' }}>
        <div className="dashboard-col-card">
          <h2>
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-color)' }}></i>
            Segurança & Integridade
          </h2>
          <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
            Controle de backups do sistema e auditorias de consistência da base de dados local do CTRH.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-secondary-outline" 
              onClick={handleExportJSONBackup}
              title="Exportar backup completo"
            >
              <i className="fa-solid fa-file-export"></i> Backup da Base (JSON)
            </button>
            <button 
              type="button" 
              className="btn btn-secondary-outline" 
              onClick={() => handleSimulateAction('Verificação de Integridade')}
              title="Executar varredura de consistência"
            >
              <i className="fa-solid fa-stethoscope"></i> Varredura de Integridade
            </button>
          </div>
        </div>

        <div className="dashboard-col-card">
          <h2>
            <i className="fa-solid fa-gears" style={{ color: 'var(--accent-color)' }}></i>
            Parâmetros do Sistema
          </h2>
          <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
            Políticas de tempo limite, prazos semânticos e whitelist de e-mails institucionais aceitos.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', background: 'var(--border-light)', padding: '6px 12px', borderRadius: '4px' }}>
              Whitelist Ativa: <strong>@rioeduca.net</strong>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', background: 'var(--border-light)', padding: '6px 12px', borderRadius: '4px' }}>
              Prazo Alerta Interno: <strong>7 dias</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Lista de Servidores Cadastrados */}
      <div className="dashboard-col-card">
        <h2>
          <i className="fa-solid fa-user-gear" style={{ color: 'var(--accent-color)' }}></i>
          Servidores Homologados & Controle de Acesso
        </h2>
        <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Visualização dos e-mails corporativos autorizados no sistema da SME e seus respectivos papéis de segurança.
        </p>

        <div className="table-responsive">
          <table className="demandas-table">
            <thead>
              <tr>
                <th style={{ width: '25%', textAlign: 'left' }}>Servidor</th>
                <th style={{ width: '30%', textAlign: 'left' }}>E-mail Corporativo</th>
                <th style={{ width: '20%', textAlign: 'left' }}>Nível de Acesso</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Setor</th>
                <th style={{ width: '10%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {servidores.map(serv => (
                <tr key={serv.id}>
                  {/* Nome */}
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>{serv.nome}</td>
                  
                  {/* E-mail */}
                  <td style={{ textAlign: 'left', fontFamily: 'monospace' }}>{serv.email}</td>
                  
                  {/* Nível de Acesso */}
                  <td style={{ textAlign: 'left' }}>
                    <span 
                      className={`badge ${serv.nivel === 'Administrador' ? 'encerrado' : serv.nivel === 'Avançado' ? 'assinatura' : 'aguardando'}`} 
                      style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'none' }}
                    >
                      {serv.nivel}
                    </span>
                  </td>
                  
                  {/* Setor */}
                  <td style={{ textAlign: 'left', fontWeight: 500 }}>{serv.setor}</td>
                  
                  {/* Status */}
                  <td>
                    <span 
                      className={`badge ${serv.status === 'Ativo' ? 'tramitado' : 'ajustar'}`}
                      style={{ fontSize: '0.65rem', fontWeight: 700 }}
                    >
                      {serv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
