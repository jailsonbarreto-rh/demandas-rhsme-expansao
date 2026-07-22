import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, useInRouterContext, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import type {
  CreateDemandaInput,
  DeleteDemandaInput,
  Demanda,
  EditDemandaInput,
  PerfilUsuario,
  StatusTransitionInput,
} from './types';
import type { DemandaFormValues, EditarDemandaValues } from './validation/demandaSchemas';
import { resolveAppConfig } from './config/appConfig';
import { useAppSession } from './hooks/useAppSession';
import { useDemandasData } from './hooks/useDemandasData';
import { createAppServices, type AppServices } from './services/createAppServices';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { AtencaoImediata } from './components/AtencaoImediata';
import { VisaoGeral } from './components/VisaoGeral';
import { AdminSkeleton, AuthSkeleton, DashboardSkeleton, TableSkeleton } from './components/LoadingSkeletons';
import { matchDemandSearch } from './search/demandSearch';
import { rankApproximateDemandSearch } from './search/approximateSearch';
import { getPeriodValidationError } from './search/periodFilter';
import { clearRecentSearches, loadRecentSearches, saveRecentSearch } from './search/recentSearches';
import type { DemandSearchMatch } from './search/searchTypes';
import { applyDemandBaseFilters } from './filters/applyDemandFilters';
import {
  DEFAULT_DEMAND_FILTERS,
  DEFAULT_QUICK_FILTERS,
  type DemandFilters,
  type QuickFilters,
} from './filters/filterTypes';
import { parseDemandFilters, serializeDemandFilters } from './filters/filterUrl';

const DemandasTable = lazy(() => import('./components/DemandasTable').then((module) => ({ default: module.DemandasTable })));
const ModalNovo = lazy(() => import('./components/ModalNovo').then((module) => ({ default: module.ModalNovo })));
const ModalEditar = lazy(() => import('./components/ModalEditar').then((module) => ({ default: module.ModalEditar })));
const ModalStatus = lazy(() => import('./components/ModalStatus').then((module) => ({ default: module.ModalStatus })));
const ModalHistorico = lazy(() => import('./components/ModalHistorico').then((module) => ({ default: module.ModalHistorico })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then((module) => ({ default: module.AdminPanel })));
const DemandDetailDrawer = lazy(() => import('./components/DemandDetailDrawer').then((module) => ({ default: module.DemandDetailDrawer })));
const AuthPanel = lazy(() => import('./components/AuthPanel').then((module) => ({ default: module.AuthPanel })));

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

  const demandas = data.demandas;
  const historico = data.historico;
  const setoresDisponiveis = useMemo(() => Array.from(
    new Set(
      demandas
        .map((demanda) => demanda.setor?.trim())
        .filter((setor): setor is string => Boolean(setor)),
    ),
  ).sort(), [demandas]);

  const [filtros, setFiltros] = useState<DemandFilters>(() => parseDemandFilters(searchParams));
  const [quickFilters, setQuickFilters] = useState<QuickFilters>(() => ({
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

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState(() => loadRecentSearches());
  const [searchFocusRequested, setSearchFocusRequested] = useState(false);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      setSearchFocusRequested(true);
      navigate({ pathname: '/demandas', search: searchParams.toString() });
    };

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [navigate, searchParams]);

  useEffect(() => {
    if (!searchFocusRequested || activeTab !== 'demandas' || data.loading) return;
    const frame = window.requestAnimationFrame(() => {
      const input = searchInputRef.current;
      if (!input) return;
      input.focus();
      input.select();
      setSearchFocusRequested(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, data.loading, searchFocusRequested]);

  const [modalNovoAberto, setModalNovoAberto] = useState<boolean>(false);
  const [demandaSelecionada, setDemandaSelecionada] = useState<Demanda | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState<boolean>(false);
  const [modalStatusAberto, setModalStatusAberto] = useState<boolean>(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState<boolean>(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const drawerBloqueadoPorModal = modalEditarAberto || modalStatusAberto || modalHistoricoAberto;

  useEffect(() => {
    if (activeTab !== 'demandas') return;
    const next = serializeDemandFilters(filtros);
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
    if (appServices.mode !== 'supabase' || !canAccessAdmin || activeTab !== 'admin') return;
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
      (patch.nivel !== undefined && patch.nivel !== 'administrador')
      || (patch.status !== undefined && patch.status !== 'ativo');

    if (eraAdminAtivo && vaiDeixarDeSer) {
      const outrosAdminsAtivos = perfis.filter(p => p.id !== id && p.nivel === 'administrador' && p.status === 'ativo').length;
      if (outrosAdminsAtivos === 0) {
        toast.error('Ação bloqueada: o sistema não pode ficar sem nenhum administrador ativo.');
        return false;
      }
    }

    try {
      await appServices.profiles.updateAccess(id, patch);
      setPerfis(await appServices.profiles.list());
      toast.success('Perfil atualizado com sucesso.');
      return true;
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível atualizar o perfil.');
      return false;
    }
  };

  const handleLogout = async () => {
    await session.signOut();
    setActiveTab('visao-geral');
    setDrawerAberto(false);
    setDemandaSelecionada(null);
    setModalNovoAberto(false);
    setModalEditarAberto(false);
    setModalStatusAberto(false);
    setModalHistoricoAberto(false);
    setPerfis([]);
    setFiltros({ ...DEFAULT_DEMAND_FILTERS });
    setQuickFilters({ ...DEFAULT_QUICK_FILTERS });
  };

  const handleSalvarNovaDemanda = async (values: DemandaFormValues) => {
    const input: CreateDemandaInput = {
      numero: values.numero,
      tipo: values.tipo,
      assunto: values.assunto,
      responsavel: values.responsavel,
      responsavelId: null,
      limite1: values.limite1,
      limite1Situacao: values.limite1 ? 'definido' : 'nao_informado',
      limite1Justificativa: '',
      limite2: values.limite2,
      limite2Situacao: values.limite2 ? 'definido' : 'nao_informado',
      limite2Justificativa: '',
      proximaAcao: values.status === 'Encerrado' ? '' : values.proximaAcao,
      proximaAcaoEm: values.status === 'Encerrado' ? '' : values.proximaAcaoEm,
      linkOrigem: '',
      status: values.status,
      setor: values.setor,
      classificacao: values.classificacao,
    };

    try {
      await data.create(input);
      setModalNovoAberto(false);
      toast.success('Demanda criada com sucesso.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível criar a demanda. Os dados preenchidos foram preservados.');
    }
  };

  const handleSalvarEdicaoDemanda = async (demandaId: number, values: EditarDemandaValues) => {
    const current = demandas.find((demanda) => demanda.id === demandaId);
    if (!current) {
      toast.error('A demanda não foi encontrada para edição.');
      return false;
    }

    const input: EditDemandaInput = {
      assunto: values.assunto,
      responsavelId: current.responsavelId,
      responsavel: values.responsavel,
      limite1: values.limite1,
      limite1Situacao: values.limite1 ? 'definido' : 'nao_informado',
      limite1Justificativa: '',
      limite2: values.limite2,
      limite2Situacao: values.limite2 ? 'definido' : 'nao_informado',
      limite2Justificativa: '',
      setor: values.setor,
      classificacao: current.classificacao,
      linkOrigem: current.linkOrigem,
      proximaAcao: current.status === 'Encerrado' ? '' : values.proximaAcao,
      proximaAcaoEm: current.status === 'Encerrado' ? '' : values.proximaAcaoEm,
      justificativa: values.justificativa,
    };

    try {
      await data.edit(demandaId, input);
      toast.success('Demanda atualizada com sucesso.');
      return true;
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível editar a demanda. Os dados preenchidos foram preservados.');
      return false;
    }
  };

  const handleAtualizarStatus = async (demandaId: number, input: StatusTransitionInput) => {
    try {
      await data.transitionStatus(demandaId, input);
      toast.success('Status atualizado com sucesso.');
      return true;
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível atualizar o status.');
      return false;
    }
  };

  const handleExcluirDemanda = async (demandaId: number, input: DeleteDemandaInput) => {
    try {
      await data.deleteLogically(demandaId, input);
      toast.success('Demanda retirada da carteira e preservada na lixeira.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Não foi possível excluir a demanda.');
      throw reason;
    }
  };

  const handleCommitSearch = (query: string) => {
    setRecentSearches(saveRecentSearch(query));
  };

  const handleClearRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const periodError = getPeriodValidationError({
    field: filtros.periodField,
    start: filtros.periodStart,
    end: filtros.periodEnd,
  });

  const searchState = useMemo(() => {
    const baseCandidates = applyDemandBaseFilters(demandas, filtros, {
      historico,
      quickFilters,
      currentUserId: session.user?.id,
    });

    const exactMatches = new Map<number, DemandSearchMatch>();
    const exactDemandas = baseCandidates.filter((demanda) => {
      const match = matchDemandSearch(demanda, historico, filtros.query);
      if (!match.matches) return false;
      exactMatches.set(demanda.id, { ...match, matchKind: 'exact' });
      return true;
    });

    if (exactDemandas.length > 0 || !filtros.query.trim()) {
      return { demandas: exactDemandas, matches: exactMatches, mode: 'exact' as const };
    }

    const approximateResults = rankApproximateDemandSearch(baseCandidates, historico, filtros.query);
    if (approximateResults.length > 0) {
      return {
        demandas: approximateResults.map((result) => result.demanda),
        matches: new Map(approximateResults.map((result) => [result.demanda.id, result.match])),
        mode: 'approximate' as const,
      };
    }

    return { demandas: [], matches: new Map<number, DemandSearchMatch>(), mode: 'empty' as const };
  }, [demandas, filtros, historico, quickFilters, session.user?.id]);

  const demandasFiltradas = searchState.demandas;
  const searchMatches = searchState.matches;
  const searchResultMode = searchState.mode;

  const handleExportExcel = async () => {
    if (searchResultMode === 'approximate') {
      toast.info('Os resultados próximos são sugestões. Ajuste a pesquisa antes de exportar como resultado exato.');
      return;
    }

    if (demandasFiltradas.length === 0) {
      toast.info('Nenhum registro disponível para exportação na filtragem atual.');
      return;
    }

    if (exportandoExcel) return;
    setExportandoExcel(true);

    try {
      const { exportDemandasExcel } = await import('./export/exportDemandasExcel');
      const fileName = await exportDemandasExcel({
        demandas: demandasFiltradas,
        userEmail,
        filters: { ...filtros, quickFilters },
      });
      toast.success(`Arquivo Excel exportado: ${fileName}`);
    } catch (reason) {
      toast.error(reason instanceof Error
        ? reason.message
        : 'Não foi possível gerar o arquivo Excel.');
    } finally {
      setExportandoExcel(false);
    }
  };

  if (!userEmail) {
    return (
      <Suspense fallback={<AuthSkeleton />}>
        <AuthPanel
          mode={appServices.mode}
          loading={session.loading}
          onSignIn={session.signIn}
          onRequestAccess={session.requestAccess}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={activeTab === 'admin' ? <AdminSkeleton /> : activeTab === 'demandas' ? <TableSkeleton /> : null}>
    <div className="app-container">
      <Header
        userEmail={userEmail}
        demandas={demandas}
        onLogout={handleLogout}
        onOpenNovo={() => setModalNovoAberto(true)}
        onExportExcel={handleExportExcel}
        exportingExcel={exportandoExcel}
        filtrosAtivos={{
          status: filtros.status,
          quickFilters,
        }}
        onToggleFiltroStatus={(novoStatus) => {
          setFiltros(prev => ({ ...prev, status: novoStatus }));
          setQuickFilters({ assinatura: false, hoje: false, vencido: false });
          setActiveTab('demandas');
        }}
        onToggleQuickFilter={(filtro) => {
          setQuickFilters(prev => ({ ...prev, [filtro]: !prev[filtro] }));
          setActiveTab('demandas');
        }}
        canEdit={canEdit}
        appMode={appServices.mode}
      />

      <nav className="nav-tabs">
        <button
          type="button"
          className={`nav-tab-link ${activeTab === 'visao-geral' ? 'active' : ''}`}
          aria-current={activeTab === 'visao-geral' ? 'page' : undefined}
          onClick={() => setActiveTab('visao-geral')}
          title="Ver o resumo e indicadores do CTRH"
        >
          <i className="fa-solid fa-chart-pie"></i>
          <span>Visão geral</span>
        </button>

        <button
          type="button"
          className={`nav-tab-link ${activeTab === 'demandas' ? 'active' : ''}`}
          aria-current={activeTab === 'demandas' ? 'page' : undefined}
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
            aria-current={activeTab === 'admin' ? 'page' : undefined}
            onClick={() => setActiveTab('admin')}
            title="Ver e gerenciar configurações e perfis de servidores"
          >
            <i className="fa-solid fa-sliders"></i>
            <span>Administração</span>
          </button>
        )}
      </nav>

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
            fontWeight: 500,
          }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.125rem', color: '#ef4444' }}></i>
            <div><strong>Erro de Conectividade:</strong> {data.error}</div>
          </div>
        </div>
      )}

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
              <AtencaoImediata
                demandas={demandas}
                historico={historico}
                onOpenEditar={openDemand}
              />

              <FilterPanel
                filtros={filtros}
                setFiltros={setFiltros}
                quickFilters={quickFilters}
                setQuickFilters={setQuickFilters}
                setoresDisponiveis={setoresDisponiveis}
                totalExibidos={demandasFiltradas.length}
                totalGeral={demandas.length}
                searchInputRef={searchInputRef}
                recentSearches={recentSearches}
                onCommitSearch={handleCommitSearch}
                onClearRecentSearches={handleClearRecentSearches}
                periodError={periodError}
              />

              <DemandasTable
                demandas={demandasFiltradas}
                searchQuery={filtros.query}
                searchMatches={searchMatches}
                searchResultMode={searchResultMode}
                canEdit={canEdit}
                canDelete={canDelete}
                onOpenEditar={openDemand}
                onOpenStatus={(demanda) => {
                  setDemandaSelecionada(demanda);
                  setModalStatusAberto(true);
                }}
                onOpenHistorico={(demanda) => {
                  setDemandaSelecionada(demanda);
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

      {modalNovoAberto && (
        <ModalNovo
          onClose={() => setModalNovoAberto(false)}
          onSalvar={handleSalvarNovaDemanda}
        />
      )}

      {modalEditarAberto && demandaSelecionada && (
        <ModalEditar
          demanda={demandaSelecionada}
          onClose={() => {
            setModalEditarAberto(false);
            if (!drawerAberto) setDemandaSelecionada(null);
          }}
          onSalvar={async (id, values) => {
            if (!await handleSalvarEdicaoDemanda(id, values)) return;
            setModalEditarAberto(false);
            if (drawerAberto) {
              setDemandaSelecionada(prev => prev ? {
                ...prev,
                assunto: values.assunto,
                responsavel: values.responsavel,
                limite1: values.limite1,
                limite2: values.limite2,
                setor: values.setor,
                proximaAcao: prev.status === 'Encerrado' ? '' : values.proximaAcao,
                proximaAcaoEm: prev.status === 'Encerrado' ? '' : values.proximaAcaoEm,
              } : null);
            } else {
              setDemandaSelecionada(null);
            }
          }}
        />
      )}

      {modalStatusAberto && demandaSelecionada && (
        <ModalStatus
          demanda={demandaSelecionada}
          onClose={() => {
            setModalStatusAberto(false);
            if (!drawerAberto) setDemandaSelecionada(null);
          }}
          onAtualizar={async (id, input) => {
            if (!await handleAtualizarStatus(id, input)) return;
            setModalStatusAberto(false);
            if (drawerAberto) {
              setDemandaSelecionada(prev => prev ? {
                ...prev,
                status: input.status,
                proximaAcao: input.status === 'Encerrado' ? '' : input.proximaAcao,
                proximaAcaoEm: input.status === 'Encerrado' ? '' : input.proximaAcaoEm,
              } : null);
            } else {
              setDemandaSelecionada(null);
            }
          }}
        />
      )}

      {modalHistoricoAberto && demandaSelecionada && (
        <ModalHistorico
          demanda={demandaSelecionada}
          historico={historico}
          onClose={() => {
            setModalHistoricoAberto(false);
            if (!drawerAberto) setDemandaSelecionada(null);
          }}
        />
      )}

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
