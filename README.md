# Central de Demandas — CTRH SME

Sistema institucional de acompanhamento, controle de prazos, responsabilidades e histórico de processos de Recursos Humanos da Secretaria Municipal de Educação (SME).

---

## 🔗 Links Oficiais

*   **Produção no Ar (Vercel)**: [demandas-rhsme-nine.vercel.app](https://demandas-rhsme-nine.vercel.app)
*   **Repositório Remoto (GitHub)**: [github.com/WilsonMPeixoto-2/demandas-rhsme](https://github.com/WilsonMPeixoto-2/demandas-rhsme)

---

## 🛠️ O que foi entregue hoje (Design System Editorial & Reatividade)

Implementamos um redesenho de informação completo com base nas diretrizes editoriais do projeto, focando em hierarquia visual de alta legibilidade, sofisticação estética e reatividade local:

1.  **Split Login Corporativo (Desktop & Mobile)**:
    *   **Lado Esquerdo**: Painel escuro elegante (`#0b0f19`) com padrão geométrico abstrato de grid moderno em CSS e glows. Contém a marca, descrição e os 3 atributos-chave (Prazos, Responsáveis, Histórico).
    *   **Lado Direito**: Card de autenticação com abas para acesso e solicitação de primeiro acesso com checagem dinâmica de e-mail `@rioeduca.net` e força de senhas.
    *   **Responsividade**: Mobile oculta a barra lateral escura automaticamente e centraliza o formulário sob uma marca textual compacta.
2.  **Faixa de Topo Institucional de Ponta a Ponta**:
    *   Exibe à esquerda: `CTRH • Secretaria Municipal de Educação | Sistema interno de acompanhamento`.
    *   Exibe à direita: E-mail do usuário logado, status do ambiente (`Ambiente Local (LocalStorage)`), timestamp da última atualização da sessão e o botão **Sair** discreto.
3.  **Ações Globais Associadas ao Título**:
    *   Título da página principal atualizado para **Central de Demandas** com subtítulo descritivo.
    *   Botões **"Nova demanda"** (primário em Slate 900) e **"Exportar CSV"** (secundário contornado) posicionados de forma limpa ao lado do título, liberando espaço no painel de filtros.
4.  **Faixa de Atenção Imediata ("Atenção agora")**:
    *   Exibe reativamente até 3 itens que necessitam de ação urgente (processo vencido há mais tempo, demanda que vence hoje e demanda aguardando assinatura há mais tempo).
    *   Oferece um botão direto de *"Abrir demanda"* para encaminhamento rápido. A faixa desaparece automaticamente se não houver itens pendentes críticos.
5.  **Tabela Hierárquica Redesenhada**:
    *   **Processo / Documento**: Destaque para o número do processo, exibindo tipo e classificação como metadados menores.
    *   **Responsável**: Exibição de avatar circular com iniciais, nome por extenso e setor associado em texto secundário (ex: `E/CTRH`).
    *   **Prazos Semânticos**: Exibição clara da data limite acompanhada de etiquetas coloridas automáticas (*vence hoje*, *X dias em atraso* ou *em X dias*).
    *   **Ações Consolidadas**: Botão de acesso rápido *"Abrir"* acompanhado de menu dropdown `⋮` contendo as demais ações secundárias (*Alterar status*, *Editar*, *Histórico* e *Excluir*) para evitar exclusões acidentais.

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
*   Node.js (versão 18 ou superior)
*   npm

### Configuração e Execução
1.  Instale as dependências:
    ```bash
    npm install
    ```
2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
3.  Abra o navegador em [http://localhost:5173](http://localhost:5173).

---

## 🔮 Próximos Passos (Integração com Supabase)

Para colocar o sistema em produção corporativa multiusuário, o fluxo de desenvolvimento deve seguir as seguintes etapas:

1.  **Migração do Banco de Dados**:
    *   Rodar o script SQL contido na pasta `/supabase` no console do Supabase para criar as tabelas `demandas`, `historico_comentarios` e `perfis_usuarios`, além de suas respectivas políticas de segurança (RLS).
2.  **Configuração de Variáveis de Ambiente**:
    *   Renomear o arquivo `.env.example` para `.env`.
    *   Inserir a URL do seu Supabase (`VITE_SUPABASE_URL`) e a chave pública de acesso (`VITE_SUPABASE_ANON_KEY`).
3.  **Ativação das Chamadas de API**:
    *   Substituir a persistência do `LocalStorage` no arquivo `src/App.tsx` pelas funções reais de consulta e escrita do cliente Supabase.
4.  **Cadastro e Homologação de Usuários**:
    *   Ativar o Supabase Auth para controle seguro de logins da SME e gerenciamento de perfis de visualização ou edição.
