import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, useInRouterContext, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Demanda, type PerfilUsuario } from './types';
import { resolveAppConfig } from './config/appConfig';
import { useAppSession } from './hooks/useAppSession';
import { useDemandasData } from './hooks/useDemandasData';
import { createAppServices, type AppServices } from './services/createAppServices';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { AtencaoImediata } from './components/AtencaoImediata';
import { VisaoGeral } from './components/VisaoGeral';
import { AdminSkeleton, DashboardSkeleton, TableSkeleton } from './components/LoadingSkeletons';
import { getTodayString, isBeforeToday } from './utils/date';

const DemandasTable = lazy(() => import('./components/DemandasTable').then((module) => ({ default: module.DemandasTable })));
const ModalNovo = lazy(() => import('./components/ModalNovo').then((module) => ({ default: module.ModalNovo })));
const ModalEditar = lazy(() => import('./components/ModalEditar').then((module) => ({ default: module.ModalEditar })));
const ModalStatus = lazy(() => import('./components/ModalStatus').then((module) => ({ default: module.ModalStatus })));
const ModalHistorico = lazy(() => import('./components/ModalHistorico').then((module) => ({ default: module.ModalHistorico })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then((module) => ({ default: module.AdminPanel })));
const DemandDetailDrawer = lazy(() => import('./components/DemandDetailDrawer').then((module) => ({ default: module.DemandDetailDrawer })));

interface AppProps {
  services?: AppServices;
}

const AppContent: React.FC<AppProps> = ({ services }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [appServices] = useState(() => services ?? createAppServices(resolveAppConfig(import.meta.env)));
  const session = useAppSession(appServices.auth);
  const data = useDemandasData(appServices.demandas, session.user, appServices.mode === 'supabase');
  const userEmail = session.user?.email ?? '';
  const [perfis, setPerfis] = useState<PerfilUsuario[]>([]);
  const canAccessAdmin = appServices.mode === 'local'
    || (session.user?.perfil.nivel === 'administrador' && session.user.perfil.status === 'ativo');
  const canEdit = appServices.mode === 'local'
    || (session.user?.perfil.status === 'ativo' && ['administrador', 'editor'].includes(session.user.perfil.nivel));
  const canDelete = appServices.mode === 'local'
    || (session.user?.perfil.status === 'ativo' && session.user.perfil.nivel === 'administrador');

  // --- Estados do formulário de autenticação ---
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginSenha, setLoginSenha] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [cadEmail, setCadEmail] = useState<string>('');
  const [cadSenha, setCadSenha] = useState<string>('');
  const [showCadastroPassword, setShowCadastroPassword] = useState(false);
  const [loginTab, setLoginTab] = useState<'login' | 'cadastro'>('login');
  
  // Mensagens de erro e validações
  const [erroEmail, setErroEmail] = useState<boolean>(false);
  const [senhaValida, setSenhaValida] = useState({
    minimo: false,
    maiuscula: false,
    minuscula: false,
    numero: false
  });

  // --- Estados do Aplicativo ---
  const demandas = data.demandas;
  const historico = data.historico;
  const [setoresDisponiveis, setSetoresDisponiveis] = useState<string[]>([]);
  
  // --- Estado de filtros restaurável pela URL ---
  const [filtros, setFiltros] = useState(() => ({
    busca: searchParams.get('busca') ?? '',
    tipo: searchParams.get('tipo') ?? 'Todos',
    classificacao: searchParams.get('classificacao') ?? 'Todas',
    status: searchParams.get('status') ?? 'Somente ativos (padrão)',
    setor: searchParams.get('setor') ?? 'Todos',
  }));

  const [quickFilters, setQuickFilters] = useState(() => ({
    assinatura: searchParams.get('assinatura') === '1',
    hoje: searchParams.get('hoje') === '1',
    vencido: searchParams.get('vencido') === '1',
  }));

  const activeTab: 'visao-geral' | 'demandas' | 'admin' = location.pathname.startsWith('/admin')
    ? 'admin'
    : location.pathname.startsWith('/demandas')
      ? 'demandas'
      : 'visao-geral';
  const drawerAberto = /^\/demandas\/\d+$/.test(location.pathname);
  const setActiveTab = (tab: 'visao-geral' | 'demandas' | 'admin') => {
    const target = tab === 'visao-geral' ? '/' : tab === 'admin' ? '/admin' : '/demandas';
    navigate({ pathname: target, search: tab === 'demandas' ? searchParams.toString() : '' });
  };
  const setDrawerAberto = (open: boolean) => {
    if (!open) navigate({ pathname: '/demandas', search: searchParams.toString() });
  };

  // --- Estados dos Modais ---
  const [modalNovoAberto, setModalNovoAberto] = useState<boolean>(false);
  const [demandaSelecionada, setDemandaSelecionada] = useState<Demanda | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState<boolean>(false);
  const [modalStatusAberto, setModalStatusAberto] = useState<boolean>(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState<boolean>(false);
  const drawerBloqueadoPorModal = modalEditarAberto || modalStatusAberto || modalHistoricoAberto;

  useEffect(() => {
    if (activeTab !== 'demandas') return;
    const next = new URLSearchParams();
    if (filtros.busca) next.set('busca', filtros.busca);
    if (filtros.tipo !== 'Todos') next.set('tipo', filtros.tipo);
    if (filtros.classificacao !== 'Todas') next.set('classificacao', filtros.classificacao);
    if (filtros.status !== 'Somente ativos (padrão)') next.set('status', filtros.status);
    if (filtros.setor !== 'Todos') next.set('setor', filtros.setor);
    if (quickFilters.assinatura) next.set('assinatura', '1');
    if (quickFilters.hoje) next.set('hoje', '1');
    if (quickFilters.vencido) next.set('vencido', '1');
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [activeTab, filtros, quickFilters, searchParams, setSearchParams]);

  useEffect(() => {
    const match = /^\/demandas\/(\d+)$/.exec(location.pathname);
    if (!match || demandas.length === 0) return;
    const selected = demandas.find((demanda) => demanda.id === Number(match[1]));
    if (selected) setDemandaSelecionada(selected);
    else {
      toast.error('A demanda informada não foi encontrada.');
      navigate({ pathname: '/demandas', search: searchParams.toString() }, { replace: true });
    }
  }, [demandas, location.pathname, navigate, searchParams]);

  const openDemand = (demanda: Demanda) => {
    setDemandaSelecionada(demanda);
    navigate({ pathname: `/demandas/${demanda.id}`, search: searchParams.toString() });
  };

  useEffect(() => {
    if (appServices.mode !== 'supabase' || !canAccessAdmin || activeTab !== 'admin') {
      return;
    }
    let active = true;
    void appServices.profiles.list()
      .then((items) => { if (active) setPerfis(items); })
      .catch((reason: unknown) => {
        if (active) toast.error(reason instanceof Error ? reason.message : 'Não foi possível carregar os perfis.');
      });
    return () => { active = false; };
  }, [appServices, canAccessAdmin, activeTab]);

  const handleUpdatePerfil = async (
    id: string,
    patch: Partial<Pick<PerfilUsuario, 'nivel' | 'status' | 'setor'>>,
  ) => {
    const perfilAlvo = perfis.find(p => p.id === id);
    const eraAdminAtivo = perfilAlvo && perfilAlvo.nivel === 'administrador' && perfilAlvo.status === 'ativo';
    const vaiDeixarDeSer = 
      (patch.nivel !== undefined && patch.nivel !== 'administrador') || 
      (patch.status !== undefined && patch.status !== 'ativo');

    if (eraAdminAtivo && vaiDeixarDeSer) {
      const outrosAdminsAtivos = perfis.filter(p => p.id !== id && p.nivel === 'administrador' && p.status === 'ativo').length;
      if (outrosAdminsAtivos === 0) {
        toast.error('Ação bloqueada: o sistema não pode ficar sem nenhum administrador ativo.');
        return;
      }
    }

    try {
      await appServices.profiles.updateAccess(id, patch);
      setPerfis(await appServices.profiles.list());
      toast.success('Perfil atualizado com sucesso.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível atualizar o perfil.');
    }
  };

  // Recalcular lista de setores únicos a partir de todas as demandas cadastradas
  useEffect(() => {
    const setoresUnicos = Array.from(
      new Set(
        demandas
          .map(d => d.setor?.trim())
          .filter((s): s is string => !!s)
      )
    ).sort();
    setSetoresDisponiveis(setoresUnicos);
  }, [demandas]);

  // --- Validação da Senha Forte e E-mail Corporativo ---
  useEffect(() => {
    if (cadEmail && !cadEmail.toLowerCase().endsWith('@rioeduca.net')) {
      setErroEmail(true);
    } else {
      setErroEmail(false);
    }

    setSenhaValida({
      minimo: cadSenha.length >= 8,
      maiuscula: /[A-Z]/.test(cadSenha),
      minuscula: /[a-z]/.test(cadSenha),
      numero: /[0-9]/.test(cadSenha)
    });
  }, [cadEmail, cadSenha]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await session.signIn(loginEmail, loginSenha);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível entrar.');
    }
  };

  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSenhaForte = senhaValida.minimo && senhaValida.maiuscula && senhaValida.minuscula && senhaValida.numero;
    const isEmailValido = cadEmail.toLowerCase().endsWith('@rioeduca.net');

    if (isEmailValido && isSenhaForte) {
      try {
        await session.requestAccess(cadEmail, cadSenha);
        toast.success(appServices.mode === 'local'
          ? 'Solicitação simulada com sucesso. Você já pode entrar com sua conta.'
          : 'Solicitação enviada. Aguarde a aprovação de um administrador.');
        setLoginTab('login');
        setLoginEmail(cadEmail);
        setCadEmail('');
        setCadSenha('');
      } catch (reason) {
        toast.error(reason instanceof Error ? reason.message : 'Não foi possível solicitar acesso.');
      }
    } else {
      toast.error('Atenda a todos os requisitos de segurança antes de prosseguir.');
    }
  };

  const handleLogout = async () => {
    await session.signOut();
    setLoginEmail('');
    setLoginSenha('');
    setCadEmail('');
    setCadSenha('');
    setShowLoginPassword(false);
    setShowCadastroPassword(false);
    setLoginTab('login');
    setActiveTab('visao-geral');
    setDrawerAberto(false);
    setDemandaSelecionada(null);
    setModalNovoAberto(false);
    setModalEditarAberto(false);
    setModalStatusAberto(false);
    setModalHistoricoAberto(false);
    setPerfis([]);
    setFiltros({
      busca: '',
      tipo: 'Todos',
      classificacao: 'Todas',
      status: 'Somente ativos (padrão)',
      setor: 'Todos'
    });
    setQuickFilters({
      assinatura: false,
      hoje: false,
      vencido: false
    });
  };

  // Criar nova demanda
  const handleSalvarNovaDemanda = async (novaDemanda: Omit<Demanda, 'id'>) => {
    try {
      await data.create(novaDemanda);
      setModalNovoAberto(false);
      toast.success('Demanda criada com sucesso.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível criar a demanda. Os dados preenchidos foram preservados.');
    }
  };

  // Editar dados da demanda
  const handleSalvarEdicaoDemanda = async (demandaId: number, camposAlterados: Partial<Demanda>) => {
    try {
      await data.update(demandaId, camposAlterados);
      toast.success('Demanda atualizada com sucesso.');
      return true;
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível editar a demanda. Os dados preenchidos foram preservados.');
      return false;
    }
  };

  // Atualizar Status e Comentário (gera histórico)
  const handleAtualizarStatus = async (demandaId: number, novoStatus: Demanda['status'], comentario: string) => {
    try {
      await data.updateStatus(demandaId, novoStatus, comentario);
      toast.success('Status atualizado com sucesso.');
      return true;
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível atualizar o status.');
      return false;
    }
  };

  // Excluir demanda
  const handleExcluirDemanda = async (demandaId: number) => {
    try {
      await data.delete(demandaId);
      toast.success('Demanda excluída com sucesso.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível excluir a demanda.');
    }
  };

  // --- Utilitários de Filtros ---

  // Lógica de filtragem dos dados
  const getDemandasFiltradas = () => {
    const todayStr = getTodayString();

    return demandas.filter(d => {
      // 1. Filtros Rápidos Cumulativos ("Hoje", "Vencido", "Para assinatura")
      const algunQuickAtivo = quickFilters.assinatura || quickFilters.hoje || quickFilters.vencido;
      
      if (algunQuickAtivo) {
        let matchQuick = false;
        
        if (quickFilters.assinatura && d.status === 'Para Assinatura') {
          matchQuick = true;
        }
        if (quickFilters.hoje && d.status !== 'Encerrado' && d.limite2 === todayStr) {
          matchQuick = true;
        }
        if (quickFilters.vencido && d.status !== 'Encerrado' && d.limite2 && isBeforeToday(d.limite2)) {
          matchQuick = true;
        }

        if (!matchQuick) return false;
      }

      // 2. Filtro de Busca por texto (Número, Assunto, Responsável)
      if (filtros.busca.trim()) {
        const buscaLower = filtros.busca.toLowerCase();
        const numMatch = d.numero.toLowerCase().includes(buscaLower);
        const assMatch = d.assunto.toLowerCase().includes(buscaLower);
        const respMatch = d.responsavel?.toLowerCase().includes(buscaLower) || false;
        
        if (!numMatch && !assMatch && !respMatch) {
          return false;
        }
      }

      // 3. Filtro de Tipo
      if (filtros.tipo !== 'Todos' && d.tipo !== filtros.tipo) {
        return false;
      }

      // 4. Filtro de Classificação
      if (filtros.classificacao !== 'Todas' && d.classificacao !== filtros.classificacao) {
        return false;
      }

      // 5. Filtro de Status
      if (filtros.status === 'Somente ativos (padrão)') {
        if (d.status === 'Encerrado') return false;
      } else if (filtros.status !== 'Todos (exibir tudo)') {
        if (d.status !== filtros.status) return false;
      }

      // 6. Filtro de Setor
      if (filtros.setor !== 'Todos' && d.setor !== filtros.setor) {
        return false;
      }

      return true;
    });
  };

  const demandasFiltradas = getDemandasFiltradas();

  // Exportar demandas filtradas como CSV (Protegido contra CSV Injection)
  const handleExportCSV = () => {
    if (demandasFiltradas.length === 0) {
      toast.info('Nenhum registro disponível para exportação na filtragem atual.');
      return;
    }

    const sanitizeCSVCell = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      str = str.replace(/"/g, '""');
      if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@') || str.startsWith('\t') || str.startsWith('\r') || str.startsWith('\n')) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    const headers = ['ID', 'Número', 'Tipo', 'Assunto', 'Responsável', 'Limite 1', 'Limite 2', 'Status', 'Setor', 'Classificação'];
    
    const rows = demandasFiltradas.map(d => [
      sanitizeCSVCell(d.id),
      sanitizeCSVCell(d.numero),
      sanitizeCSVCell(d.tipo),
      sanitizeCSVCell(d.assunto),
      sanitizeCSVCell(d.responsavel),
      sanitizeCSVCell(d.limite1),
      sanitizeCSVCell(d.limite2),
      sanitizeCSVCell(d.status),
      sanitizeCSVCell(d.setor),
      sanitizeCSVCell(d.classificacao)
    ]);

    const csvRows = [
      'sep=;',
      headers.join(';'),
      ...rows.map(e => e.join(';'))
    ];

    const csvContent = "\uFEFF" + csvRows.join('\r\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `demandas_sme_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Arquivo CSV exportado.');
  };

  // Renderização condicional: Tela de Login ou Área de Dashboard
  if (!userEmail) {
    return (
      <div className="login-split-container">
        {/* Lado Esquerdo: Painel Azul/Slate Corporativo */}
        <div className="login-sidebar">
          <div className="login-sidebar-content">
            <span className="sidebar-badge">CTRH • SME</span>
            <h2>Central de Demandas</h2>
            <p className="sidebar-description">
              Organização, acompanhamento e rastreabilidade das demandas de Recursos Humanos.
            </p>
            
            <div className="sidebar-features">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="fa-solid fa-calendar-check"></i>
                </div>
                <div className="feature-text">
                  <strong>Prazos</strong>
                  <span>Alertas visuais e semânticos sobre datas limites e providências em atraso.</span>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <div className="feature-text">
                  <strong>Responsáveis</strong>
                  <span>Atribuição clara de tarefas com suporte a avatares e vinculação por setores.</span>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div className="feature-text">
                  <strong>Histórico</strong>
                  <span>Rastreabilidade completa de logs e comentários de status por processo.</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Padrão geométrico decorativo em segundo plano */}
          <div className="sidebar-pattern"></div>
        </div>

        {/* Lado Direito: Card de Autenticação */}
        <div className="login-form-area">
          <div className="login-card-editorial">
            {/* Cabeçalho de Login Móvel (Aparece apenas em Mobile) */}
            <div className="login-mobile-brand">
              <h2>Central de Demandas</h2>
              <p>CTRH — Secretaria Municipal de Educação</p>
            </div>

            <div className="login-card-header">
              <h3>Painel de Acesso</h3>
              <p>Identifique-se com a sua credencial @rioeduca.net</p>
            </div>

            <div className="login-tabs">
              <button 
                type="button" 
                className={`login-tab-btn ${loginTab === 'login' ? 'active' : ''}`}
                onClick={() => setLoginTab('login')}
              >
                Entrar
              </button>
              <button 
                type="button" 
                className={`login-tab-btn ${loginTab === 'cadastro' ? 'active' : ''}`}
                onClick={() => setLoginTab('cadastro')}
              >
                Primeiro Acesso
              </button>
            </div>

            {loginTab === 'login' ? (
              /* Formulário de Login */
              <form onSubmit={handleLoginSubmit}>
                <div className="login-form-group">
                  <label htmlFor="login-email">E-mail Corporativo</label>
                  <div className="input-icon-group">
                    <i className="fa-solid fa-envelope"></i>
                    <input 
                      type="email" 
                      id="login-email"
                      className="form-control" 
                      placeholder="usuario@rioeduca.net"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="login-form-group" style={{ marginBottom: '25px' }}>
                  <label htmlFor="login-senha">Senha</label>
                  <div className="input-icon-group has-visibility-toggle">
                    <i className="fa-solid fa-lock"></i>
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      id="login-senha"
                      className="form-control" 
                      placeholder="••••••••"
                      value={loginSenha}
                      onChange={e => setLoginSenha(e.target.value)}
                      required 
                    />
                    <button
                      type="button"
                      className="password-visibility-toggle"
                      aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={showLoginPassword}
                      onClick={() => setShowLoginPassword((visible) => !visible)}
                    >
                      <i className={`fa-solid ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontWeight: '600' }}
                  disabled={session.loading}
                >
                  Acessar Sistema
                </button>
              </form>
            ) : (
              /* Formulário de Primeiro Acesso (Solicitação) */
              <form onSubmit={handleCadastroSubmit}>
                <div className="login-form-group">
                  <label htmlFor="cadastro-email">Seu E-mail Corporativo</label>
                  <div className="input-icon-group">
                    <i className="fa-solid fa-envelope"></i>
                    <input 
                      type="email" 
                      id="cadastro-email"
                      className="form-control" 
                      placeholder="nome@rioeduca.net"
                      value={cadEmail}
                      onChange={e => setCadEmail(e.target.value)}
                      required 
                    />
                  </div>
                  {erroEmail && (
                    <div className="text-danger">Apenas e-mails do domínio @rioeduca.net são aceitos.</div>
                  )}
                </div>
                
                <div className="login-form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="cadastro-senha">Criar Nova Senha</label>
                  <div className="input-icon-group has-visibility-toggle">
                    <i className="fa-solid fa-lock"></i>
                    <input 
                      type={showCadastroPassword ? 'text' : 'password'}
                      id="cadastro-senha"
                      className="form-control" 
                      placeholder="••••••••"
                      value={cadSenha}
                      onChange={e => setCadSenha(e.target.value)}
                      required 
                    />
                    <button
                      type="button"
                      className="password-visibility-toggle"
                      aria-label={showCadastroPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={showCadastroPassword}
                      onClick={() => setShowCadastroPassword((visible) => !visible)}
                    >
                      <i className={`fa-solid ${showCadastroPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  
                  {/* Visualização de critérios de Senha Forte */}
                  <div className="password-requirements">
                    <div className={`req-item ${senhaValida.minimo ? 'valid' : ''}`}>
                      <i className={senhaValida.minimo ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}></i>
                      <span>Mínimo de 8 caracteres</span>
                    </div>
                    <div className={`req-item ${senhaValida.maiuscula ? 'valid' : ''}`}>
                      <i className={senhaValida.maiuscula ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}></i>
                      <span>Pelo menos uma letra maiúscula</span>
                    </div>
                    <div className={`req-item ${senhaValida.minuscula ? 'valid' : ''}`}>
                      <i className={senhaValida.minuscula ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}></i>
                      <span>Pelo menos uma letra minúscula</span>
                    </div>
                    <div className={`req-item ${senhaValida.numero ? 'valid' : ''}`}>
                      <i className={senhaValida.numero ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}></i>
                      <span>Pelo menos um número</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px', fontWeight: '600' }}
                  disabled={session.loading || !(cadEmail.toLowerCase().endsWith('@rioeduca.net') && senhaValida.minimo && senhaValida.maiuscula && senhaValida.minuscula && senhaValida.numero)}
                >
                  Solicitar Aprovação
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={activeTab === 'admin' ? <AdminSkeleton /> : activeTab === 'demandas' ? <TableSkeleton /> : null}>
    <div className="app-container">
      {/* Cabeçalho com cards de estatísticas */}
      <Header 
        userEmail={userEmail} 
        demandas={demandas} 
        onLogout={handleLogout} 
        onOpenNovo={() => setModalNovoAberto(true)}
        onExportCSV={handleExportCSV}
        filtrosAtivos={{
          status: filtros.status,
          quickFilters
        }}
        onToggleFiltroStatus={(novoStatus) => {
          setFiltros(prev => ({ ...prev, status: novoStatus }));
          setQuickFilters({ assinatura: false, hoje: false, vencido: false });
          setActiveTab('demandas'); // Direciona para a página de Demandas
        }}
        onToggleQuickFilter={(filtro) => {
          setQuickFilters(prev => {
            const novoVal = !prev[filtro];
            return {
              ...prev,
              [filtro]: novoVal
            };
          });
          setActiveTab('demandas'); // Direciona para a página de Demandas
        }}
        canEdit={canEdit}
        appMode={appServices.mode}
      />

      {/* Navegação por Abas SPA */}
      <nav className="nav-tabs">
        <button 
          type="button" 
          className={`nav-tab-link ${activeTab === 'visao-geral' ? 'active' : ''}`}
          onClick={() => setActiveTab('visao-geral')}
          title="Ver o resumo e indicadores do CTRH"
        >
          <i className="fa-solid fa-chart-pie"></i>
          <span>Visão geral</span>
        </button>
        
        <button 
          type="button" 
          className={`nav-tab-link ${activeTab === 'demandas' ? 'active' : ''}`}
          onClick={() => setActiveTab('demandas')}
          title="Ver a listagem e pesquisar processos operacionais"
        >
          <i className="fa-solid fa-list-check"></i>
          <span>Demandas</span>
        </button>

        {canAccessAdmin && (
          <button
            type="button"
            className={`nav-tab-link ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
            title="Ver e gerenciar configurações e perfis de servidores"
          >
            <i className="fa-solid fa-sliders"></i>
            <span>Administração</span>
          </button>
        )}
      </nav>

      {/* Banner de Erro caso exista (Global) */}
      {data.error && (
        <div style={{ padding: '0 24px', marginTop: '20px' }}>
          <div className="alert-error-banner" style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            borderLeft: '4px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991b1b',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.125rem', color: '#ef4444' }}></i>
            <div>
              <strong>Erro de Conectividade:</strong> {data.error}
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Demandas ou Estado de Carregamento Global */}
      {data.loading ? (
        activeTab === 'visao-geral' ? <DashboardSkeleton /> : activeTab === 'admin' ? <AdminSkeleton /> : <TableSkeleton />
      ) : (
        <>
          {activeTab === 'visao-geral' && (
            <div key="visao-geral" className="route-transition">
            <VisaoGeral 
              demandas={demandas}
              historico={historico}
              onOpenEditar={openDemand}
              renderAtencaoImediata={() => (
                <AtencaoImediata 
                  demandas={demandas}
                  historico={historico}
                  onOpenEditar={openDemand}
                />
              )}
            />
            </div>
          )}

          {activeTab === 'demandas' && (
            <div key="demandas" className="route-transition">
              {/* Faixa de Atenção Imediata */}
              <AtencaoImediata 
                demandas={demandas}
                historico={historico}
                onOpenEditar={openDemand}
              />

              {/* Painel de Filtros e Busca */}
              <FilterPanel 
                filtros={filtros} 
                setFiltros={setFiltros} 
                quickFilters={quickFilters}
                setQuickFilters={setQuickFilters}
                setoresDisponiveis={setoresDisponiveis}
                totalExibidos={demandasFiltradas.length}
                totalGeral={demandas.length}
              />

              <DemandasTable 
                demandas={demandasFiltradas}
                canEdit={canEdit}
                canDelete={canDelete}
                onOpenEditar={openDemand}
                onOpenStatus={(d) => {
                  setDemandaSelecionada(d);
                  setModalStatusAberto(true);
                }}
                onOpenHistorico={(d) => {
                  setDemandaSelecionada(d);
                  setModalHistoricoAberto(true);
                }}
                onExcluir={handleExcluirDemanda}
              />
            </div>
          )}

          {activeTab === 'admin' && canAccessAdmin && (
            appServices.mode === 'supabase'
              ? <AdminPanel perfis={perfis} onUpdatePerfil={handleUpdatePerfil} />
              : <AdminPanel />
          )}
        </>
      )}

      {/* --- Modais Clássicos (Acionados a partir da Tabela ou do Drawer) --- */}
      
      {/* Modal Novo Registro */}
      {modalNovoAberto && (
        <ModalNovo 
          onClose={() => setModalNovoAberto(false)}
          onSalvar={handleSalvarNovaDemanda}
        />
      )}

      {/* Modal Editar Demanda */}
      {modalEditarAberto && demandaSelecionada && (
        <ModalEditar 
          demanda={demandaSelecionada}
          onClose={() => {
            setModalEditarAberto(false);
            // Se o Drawer estava aberto, não zeramos o demandaSelecionada para mantê-lo ativo
            if (!drawerAberto) {
              setDemandaSelecionada(null);
            }
          }}
          onSalvar={async (id, campos) => {
            if (!await handleSalvarEdicaoDemanda(id, campos)) return;
            setModalEditarAberto(false);
            // Atualiza a referência de visualização se o Drawer de detalhe estiver aberto
            if (drawerAberto) {
              setDemandaSelecionada(prev => prev ? { ...prev, ...campos } : null);
            } else {
              setDemandaSelecionada(null);
            }
          }}
        />
      )}

      {/* Modal Atualizar Status */}
      {modalStatusAberto && demandaSelecionada && (
        <ModalStatus 
          demanda={demandaSelecionada}
          onClose={() => {
            setModalStatusAberto(false);
            if (!drawerAberto) {
              setDemandaSelecionada(null);
            }
          }}
          onAtualizar={async (id: number, status: Demanda['status'], coment: string) => {
            if (!await handleAtualizarStatus(id, status, coment)) return;
            setModalStatusAberto(false);
            // Atualiza a referência de visualização se o Drawer de detalhe estiver aberto
            if (drawerAberto) {
              const novaD = demandas.find(d => d.id === id);
              setDemandaSelecionada(prev => prev ? { ...prev, status, setor: novaD?.setor || prev.setor } : null);
            } else {
              setDemandaSelecionada(null);
            }
          }}
        />
      )}

      {/* Modal Histórico Comentários */}
      {modalHistoricoAberto && demandaSelecionada && (
        <ModalHistorico 
          demanda={demandaSelecionada}
          historico={historico}
          onClose={() => {
            setModalHistoricoAberto(false);
            if (!drawerAberto) {
              setDemandaSelecionada(null);
            }
          }}
        />
      )}

      {/* Drawer Lateral de Detalhe da Demanda */}
      <DemandDetailDrawer
        demanda={demandaSelecionada}
        historico={historico}
        open={drawerAberto}
        nestedDialogOpen={drawerBloqueadoPorModal}
        canEdit={canEdit}
        onClose={() => {
          setDrawerAberto(false);
          setDemandaSelecionada(null);
        }}
        onEdit={() => setModalEditarAberto(true)}
        onStatus={() => setModalStatusAberto(true)}
      />
    </div>
    </Suspense>
  );
};

export const App: React.FC<AppProps> = (props) => {
  const inRouter = useInRouterContext();
  const app = inRouter ? <AppContent {...props} /> : <BrowserRouter><AppContent {...props} /></BrowserRouter>;
  return (
    <>
      {app}
      <Toaster richColors position="top-right" closeButton duration={4200} />
    </>
  );
};
