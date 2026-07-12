# Handoff Operacional — Central de Demandas CTRH SME

Atualizado em: 2026-07-07 (Encerramento do dia com Layout e Visual Editorial de Alto Impacto)

---

## 📌 Norte Operacional e Status

Toda a infraestrutura visual, design system editorial, tipografia profissional (Inter) e fluxo estático offline baseados em `LocalStorage` estão **100% entregues, verdes e publicados** na Vercel:

*   **URL de Produção**: [demandas-rhsme-nine.vercel.app](https://demandas-rhsme-nine.vercel.app)
*   **Repositório GitHub**: [github.com/WilsonMPeixoto-2/demandas-rhsme](https://github.com/WilsonMPeixoto-2/demandas-rhsme)

---

## 🛠️ Entregas Realizadas Hoje

### 1. Split Login Corporativo
*   Estrutura dividida no desktop com painel institucional navy escuro e padrão geométrico de grid com glows sutis.
*   Lista dos 3 pilares do sistema (Prazos, Responsáveis, Histórico).
*   Abas nítidas para *Entrar* e *Primeiro acesso* com checagens de e-mail corporativo (`@rioeduca.net`) e senhas fortes.
*   Mobile com ocultação da barra lateral de forma automatizada e marca compacta centralizada.

### 2. Cabeçalho Institucional de Ponta a Ponta
*   Faixa superior de identificação do órgão (`CTRH • Secretaria Municipal de Educação | Sistema interno de acompanhamento`).
*   Dados de sessão, tag do ambiente e data e hora da última atualização reativa.
*   Título principal **Central de Demandas** associado aos botões **Nova demanda** e **Exportar CSV**.

### 3. Faixa de Atenção Imediata
*   Filtragem automática das demandas críticas do sistema:
    *   *Mais antiga vencida* (ex: "Vencida há 7 dias")
    *   *Vencimento no dia* (ex: "Vence hoje")
    *   *Assinatura pendente há mais tempo* (ex: "Aguardando assinatura")
*   Desaparece automaticamente se não houver itens críticos.

### 4. Tabela de Prazos Semânticos e Ações Dropdown
*   Colunas agrupadas por hierarquia de leitura em varredura.
*   Avatares redondos dos responsáveis com exibição do setor secundário (`E/CTRH`).
*   Etiquetas coloridas dinâmicas na coluna de prazo final (*vence hoje*, *X dias em atraso*, *em X dias*).
*   Menu dropdown acionado pelas reticências `⋮` consolidando ações secundárias para prevenir exclusão acidental.

### 5. Saneamento de Termos (RH -> CTRH)
*   Substituição completa do termo visual "RH" pela sigla administrativa oficial **"CTRH"** em todas as interfaces.

---

## 🔮 Próximas Etapas Recomendadas

Quando retomar o projeto amanhã ou transferir a tarefa, siga esta ordem:

1.  **Criação de Tabelas do Supabase**:
    *   O script SQL com as estruturas necessárias para o banco (`demandas`, `historico_comentarios`, `perfis_usuarios`, triggers e políticas RLS) já está pronto e salvo no diretório `/supabase/migrations`.
2.  **Variáveis de Ambiente**:
    *   Copiar `.env.example` para `.env` e preencher as chaves de acesso público do Supabase.
3.  **Substituir LocalStorage por Supabase API**:
    *   Substituir a carga estática local em `src/App.tsx` pelas funções reais de consulta e escrita (que estão comentadas no arquivo prontas para ativação).
4.  **Ativação de Autenticação Segura**:
    *   Conectar o Supabase Auth para cadastro real de servidores de SME e validações de e-mail.
