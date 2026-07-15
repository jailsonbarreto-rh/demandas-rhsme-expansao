import { toast } from 'sonner';
import React from 'react';
import type { PerfilUsuario } from '../types';

export interface ServidorPerfil {
  id: string;
  nome: string;
  email: string;
  nivel: string;
  setor: string;
  status: string;
  nivelReal?: PerfilUsuario['nivel'];
  statusReal?: PerfilUsuario['status'];
}

interface AdminPanelProps {
  perfis?: PerfilUsuario[];
  onUpdatePerfil?: (
    id: string,
    patch: Partial<Pick<PerfilUsuario, 'nivel' | 'status' | 'setor'>>,
  ) => Promise<void> | void;
}

export interface AccessIntegrityReport {
  ok: boolean;
  issues: string[];
  totalProfiles: number;
  activeProfiles: number;
  activeAdministrators: number;
}

const nivelLabel: Record<PerfilUsuario['nivel'], string> = {
  administrador: 'Administrador', editor: 'Editor', leitor: 'Leitor',
};

const statusLabel: Record<PerfilUsuario['status'], string> = {
  ativo: 'Ativo', pendente: 'Pendente', inativo: 'Inativo',
};

export function buildAccessBackup(servidores: ServidorPerfil[]) {
  return {
    sistema: 'Central de Demandas CTRH SME',
    escopo: 'perfis_e_niveis_de_acesso',
    backup_timestamp: new Date().toISOString(),
    usuarios_count: servidores.length,
    perfis: servidores.map(({ id, nome, email, nivel, setor, status }) => ({
      id, nome, email, nivel, setor, status,
    })),
  };
}

export function analyzeAccessIntegrity(servidores: ServidorPerfil[]): AccessIntegrityReport {
  const issues: string[] = [];
  const emailCounts = new Map<string, number>();
  const idCounts = new Map<string, number>();

  servidores.forEach((servidor) => {
    const email = servidor.email.trim().toLowerCase();
    emailCounts.set(email, (emailCounts.get(email) ?? 0) + 1);
    idCounts.set(servidor.id, (idCounts.get(servidor.id) ?? 0) + 1);

    if (!servidor.nome.trim()) {
      issues.push(`Perfil ${servidor.id} sem nome informado.`);
    }
    if (!email.endsWith('@rioeduca.net')) {
      issues.push(`E-mail fora do domínio institucional: ${servidor.email || '(vazio)'}.`);
    }
  });

  const duplicateEmails = Array.from(emailCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([email]) => email);
  const duplicateIds = Array.from(idCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  if (duplicateEmails.length > 0) {
    issues.push(`E-mails duplicados: ${duplicateEmails.join(', ')}.`);
  }
  if (duplicateIds.length > 0) {
    issues.push(`Identificadores duplicados: ${duplicateIds.join(', ')}.`);
  }

  const activeProfiles = servidores.filter((servidor) => servidor.status === 'Ativo').length;
  const activeAdministrators = servidores.filter(
    (servidor) => servidor.status === 'Ativo' && servidor.nivel === 'Administrador',
  ).length;

  if (activeAdministrators === 0) {
    issues.push('Nenhum administrador ativo foi encontrado.');
  }

  return {
    ok: issues.length === 0,
    issues,
    totalProfiles: servidores.length,
    activeProfiles,
    activeAdministrators,
  };
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ perfis, onUpdatePerfil }) => {
  const isSupabase = perfis !== undefined;
  const servidores: ServidorPerfil[] = perfis?.map((perfil) => ({
    id: perfil.id,
    nome: perfil.nome || perfil.email,
    email: perfil.email,
    nivel: nivelLabel[perfil.nivel],
    setor: perfil.setor,
    status: statusLabel[perfil.status],
    nivelReal: perfil.nivel,
    statusReal: perfil.status,
  })) ?? [
    { id: '1', nome: 'Wilson Peixoto', email: 'wilson.peixoto@rioeduca.net', nivel: 'Administrador', setor: 'CTRH', status: 'Ativo' },
    { id: '2', nome: 'Erica Ramos', email: 'erica.ramos@rioeduca.net', nivel: 'Avançado', setor: 'E/CTRH', status: 'Ativo' },
    { id: '3', nome: 'Ricardo Silva', email: 'ricardo.silva@rioeduca.net', nivel: 'Básico', setor: 'CARH', status: 'Ativo' },
    { id: '4', nome: 'Servidor SME Teste', email: 'teste@rioeduca.net', nivel: 'Básico', setor: 'SME', status: 'Ativo' },
    { id: '5', nome: 'Mariana Costa', email: 'mariana.costa@rioeduca.net', nivel: 'Avançado', setor: 'E/CTRH', status: 'Pendente' }
  ];

  const handleExportJSONBackup = () => {
    const backupData = buildAccessBackup(servidores);
    const dataStr = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `perfis_acesso_ctrh_sme_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleIntegrityCheck = () => {
    const report = analyzeAccessIntegrity(servidores);
    if (report.ok) {
      toast.success(
        `Verificação concluída: ${report.totalProfiles} perfis analisados, `
        + `${report.activeProfiles} ativos e ${report.activeAdministrators} administradores ativos.`,
      );
      return;
    }

    toast.error(
      `Verificação concluída com ${report.issues.length} inconsistência(s).`,
      { description: report.issues.join(' • '), duration: 7000 },
    );
  };

  return (
    <div className="admin-panel-container" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
      <div className="dashboard-row" style={{ marginBottom: '25px' }}>
        <div className="dashboard-col-card">
          <h2>
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-color)' }}></i>
            Segurança & Integridade
          </h2>
          <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
            Exportação dos perfis cadastrados e verificação de consistência dos acessos ao sistema.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary-outline"
              onClick={handleExportJSONBackup}
              title="Exportar perfis e níveis de acesso em JSON"
            >
              <i className="fa-solid fa-file-export"></i> Exportar Perfis (JSON)
            </button>
            <button
              type="button"
              className="btn btn-secondary-outline"
              onClick={handleIntegrityCheck}
              title="Verificar duplicidades, domínio institucional e administradores ativos"
            >
              <i className="fa-solid fa-stethoscope"></i> Verificar Acessos
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

      <div className="dashboard-col-card">
        <h2>
          <i className="fa-solid fa-user-gear" style={{ color: 'var(--accent-color)' }}></i>
          Servidores Homologados & Controle de Acesso
        </h2>
        <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Visualização dos e-mails corporativos autorizados no sistema da SME e seus respectivos papéis de segurança.
          {!isSupabase && <span className="demo-label">Demonstração</span>}
        </p>

        <div className="table-responsive" role="region" aria-label="Tabela de perfis e acessos" tabIndex={0}>
          <table className="demandas-table">
            <thead>
              <tr>
                <th style={{ width: '25%', textAlign: 'left' }}>Servidor</th>
                <th style={{ width: '30%', textAlign: 'left' }}>E-mail Corporativo</th>
                <th style={{ width: '20%', textAlign: 'left' }}>Nível de Acesso</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Setor</th>
                <th style={{ width: '10%' }}>Status</th>
                {isSupabase && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {servidores.map(serv => (
                <tr key={serv.id}>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>{serv.nome}</td>
                  <td style={{ textAlign: 'left', fontFamily: 'monospace' }}>{serv.email}</td>
                  <td style={{ textAlign: 'left' }}>
                    {isSupabase ? (
                      <select
                        className="form-control"
                        aria-label={`Nível de acesso de ${serv.nome}`}
                        value={serv.nivelReal}
                        onChange={(event) => { void onUpdatePerfil?.(serv.id, { nivel: event.target.value as PerfilUsuario['nivel'] }); }}
                      >
                        <option value="administrador">Administrador</option>
                        <option value="editor">Editor</option>
                        <option value="leitor">Leitor</option>
                      </select>
                    ) : (
                      <span
                        className={`badge ${serv.nivel === 'Administrador' ? 'encerrado' : serv.nivel === 'Avançado' ? 'assinatura' : 'aguardando'}`}
                        style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'none' }}
                      >
                        {serv.nivel}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'left', fontWeight: 500 }}>{serv.setor}</td>
                  <td>
                    <span
                      className={`badge ${serv.status === 'Ativo' ? 'tramitado' : 'ajustar'}`}
                      style={{ fontSize: '0.65rem', fontWeight: 700 }}
                    >
                      {serv.status}
                    </span>
                  </td>
                  {isSupabase && (
                    <td>
                      {serv.statusReal === 'pendente' ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => { void onUpdatePerfil?.(serv.id, { status: 'ativo' }); }}
                        >
                          Aprovar
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary-outline"
                          onClick={() => { void onUpdatePerfil?.(serv.id, { status: serv.statusReal === 'ativo' ? 'inativo' : 'ativo' }); }}
                        >
                          {serv.statusReal === 'ativo' ? 'Desativar' : 'Ativar'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
