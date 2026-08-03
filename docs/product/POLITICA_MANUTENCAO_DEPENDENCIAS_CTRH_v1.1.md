# Política de Manutenção de Dependências e Modernização Tecnológica — CTRH v1.1

**Data:** 3 de agosto de 2026  
**Status:** VIGENTE  
**Finalidade:** garantir que atualizações, instalações e ampliações tecnológicas sejam deliberadas, úteis ao produto, compatíveis, seguras, rastreáveis e testadas.

## 1. Princípio vinculante

A tecnologia deve servir à solução do problema e à qualidade do produto.

O projeto não deve:

- instalar pacotes apenas por novidade;
- atualizar versões sem benefício, correção ou necessidade demonstrada;
- permanecer preso a limitações evitáveis quando uma solução moderna, madura e compatível puder produzir resultado substancialmente melhor;
- aceitar contornos frágeis, duplicação excessiva ou qualidade inferior apenas para evitar avaliar uma atualização ou dependência adequada.

Sempre que uma correção, melhoria, alteração de layout, nova funcionalidade ou reclamação do usuário revelar limite relevante das tecnologias atuais, o executor deve apresentar a alternativa de atualização, instalação ou ampliação tecnológica antes de implementar a solução definitiva.

## 2. Modernização proativa durante qualquer tarefa

A avaliação tecnológica não ocorre apenas em rodadas específicas de manutenção.

Ela é obrigatória também quando, durante uma tarefa regular, o executor identificar que:

- o problema decorre total ou parcialmente de versão, biblioteca ou arquitetura atual;
- a correção possível com a pilha existente seria apenas paliativa;
- a ausência de uma capacidade especializada limita qualidade, acessibilidade, responsividade, segurança, desempenho, testes, observabilidade ou manutenção;
- a solução solicitada exigiria código excessivamente complexo ou frágil;
- uma biblioteca já adotada possui versão ou recurso capaz de resolver melhor o problema;
- uma nova dependência madura permitiria entregar capacidade relevante que o projeto não oferece;
- o comportamento desejado seria mais confiável, sustentável ou compreensível com atualização tecnológica.

Nessas situações, o executor deve apresentar a proposta, ainda que o usuário não tenha pedido explicitamente uma nova instalação.

## 3. Conteúdo mínimo da proposta

Toda proposta de atualização ou nova dependência deve informar:

1. o problema concreto ou objetivo funcional;
2. como a tecnologia atual limita a solução;
3. a atualização, pacote ou capacidade sugerida;
4. o benefício perceptível para usuários e para manutenção;
5. a alternativa sem nova dependência;
6. a razão pela qual a proposta é superior ou mais definitiva;
7. impacto esperado no bundle, runtime e desempenho;
8. compatibilidade com as versões e ferramentas do projeto;
9. impacto em segurança, privacidade, dados e permissões;
10. necessidade ou não de migration, configuração externa ou mudança de infraestrutura;
11. estratégia de testes e homologação;
12. rollback;
13. escopo excluído;
14. recomendação técnica, sem apresentá-la como decisão já tomada.

A proposta deve ser proporcional. Para uma atualização pequena e isolada, a justificativa pode ser sucinta; para uma mudança estrutural, a análise deve ser completa.

## 4. Autorização

Nenhum agente pode:

- instalar dependência nova silenciosamente;
- atualizar runtime, compilador, SDK ou biblioteca estrutural sem autorização;
- escolher uma alternativa tecnológica como se fosse decisão de produto;
- usar uma instalação para ampliar escopo além do solicitado;
- converter recomendação em obrigação automática.

A decisão permanece com o responsável pelo produto.

A autorização deve alcançar:

- o pacote ou atualização;
- a finalidade;
- o escopo concreto;
- eventuais mudanças de comportamento;
- o plano de validação;
- o limite do trabalho.

## 5. Critérios de decisão

A proposta deve ser avaliada por:

- benefício funcional real;
- redução de risco ou dívida técnica;
- maturidade e manutenção do pacote;
- compatibilidade com React, TypeScript, Vite, Vitest, Playwright, Node e Supabase, conforme aplicável;
- tamanho e impacto no bundle;
- superfície de segurança;
- política de dados e privacidade;
- qualidade da documentação e do ecossistema;
- custo de adoção e manutenção;
- capacidade de teste;
- reversibilidade;
- risco de lock-in;
- necessidade de treinamento ou mudança operacional.

A existência de uma biblioteca popular não basta. A ausência de uma biblioteca atual também não justifica automaticamente manter uma solução inferior.

## 6. Gatilhos de revisão de dependências

Uma revisão deve ocorrer quando houver:

- alerta de vulnerabilidade relevante;
- perda ou proximidade de perda de suporte;
- correção de bug aplicável ao projeto;
- incompatibilidade detectada;
- preparação de release importante;
- início de função dependente de nova capacidade;
- problema de desempenho, estabilidade, acessibilidade ou qualidade comprovado;
- manutenção desproporcional causada pela solução atual;
- solicitação expressa do responsável pelo produto;
- revisão periódica deliberadamente iniciada.

## 7. Processo obrigatório

1. inventariar versões atuais e candidatas;
2. verificar changelog, notas de migração e requisitos de runtime;
3. conferir peer dependencies e compatibilidade entre ferramentas;
4. classificar risco e superfície afetada;
5. decidir isolamento ou agrupamento;
6. registrar benefício, limites, testes e rollback;
7. criar branch própria sobre a `main` atual;
8. alterar somente o escopo aprovado;
9. regenerar lockfile pelo gerenciador oficial quando aplicável;
10. executar gates completos e testes específicos;
11. registrar incompatibilidades, falsos positivos e decisões adiadas;
12. integrar apenas após revisão e homologação aplicáveis;
13. atualizar Handoff e documentação técnica.

## 8. Regras de agrupamento

Podem compartilhar PR:

- atualizações pequenas do mesmo ambiente;
- pacotes de desenvolvimento sem impacto no runtime de produção;
- mudanças com causa de falha, validação e rollback comuns;
- alterações cuja separação criaria estado intermediário incompatível.

Devem permanecer isolados:

- SDK executado em produção;
- runtime Node;
- compilador TypeScript major;
- fluxo central de dados e cache;
- autenticação;
- Supabase CLI e migrations;
- bibliotecas que alterem navegação, formulários, tabela ou interface global;
- observabilidade e telemetria;
- mudanças capazes de afetar segurança, RLS, Realtime, publicação ou dados.

## 9. Atualizações durante correção de problemas

Quando um erro puder ser corrigido de duas formas — uma paliativa com a tecnologia atual e outra estrutural por atualização ou instalação — o executor deve apresentar as duas abordagens.

A análise deve distinguir:

- correção imediata segura;
- solução definitiva recomendada;
- dependência entre ambas;
- possibilidade de executar a correção imediata sem bloquear a estrutural;
- risco de retrabalho;
- custo de reversão.

Não é permitido ocultar que a solução atual possui limite conhecido. Também não é permitido bloquear uma correção urgente apenas para impor modernização quando a correção imediata for segura e independente.

## 10. Knip e limpeza de código

O Knip permanece ferramenta diagnóstica.

Regras:

- executar por `npm run analyze:unused`;
- não usar autofix;
- não transformar o diagnóstico em gate obrigatório sem decisão específica;
- revisar cada achado manualmente;
- considerar entradas dinâmicas, testes, scripts, CSS, assets, tipos, configurações e integrações externas;
- não remover arquivo, export ou dependência apenas porque foi listado;
- registrar falso positivo e razão de preservação;
- separar limpezas independentes em PRs pequenos;
- executar gate completo após qualquer remoção.

## 11. Proibições

Não é permitido:

- usar `--force`, `--legacy-peer-deps` ou equivalente;
- ignorar incompatibilidade de peer dependency;
- integrar PR automatizado sem revisão humana;
- misturar atualização estrutural com refatoração oportunista;
- atualizar tipos para runtime diferente do adotado sem justificativa;
- relaxar TypeScript, lint, testes ou cobertura apenas para aceitar atualização;
- remover testes que revelem regressão;
- publicar versão diferente da validada;
- deixar lockfile, documentação e código divergentes;
- transmitir dados operacionais a ferramenta externa sem análise e autorização.

## 12. Validação mínima

Conforme aplicável:

```bash
npm ci
npm run check:docs
npm audit --audit-level=high
npm audit signatures
npm run lint
npm run test:coverage
npm run build
npm run check:bundle
npm run check:public-bundle
npm run test:e2e
```

Mudanças de banco ou Supabase exigem também replay das migrations e verificação de invariantes. Mudanças de interface exigem homologação em navegador e viewports relevantes. Mudanças estruturais exigem testes específicos do comportamento introduzido.

## 13. Relação com a governança do produto

Esta política obriga o executor a identificar e apresentar oportunidades tecnológicas relevantes. Ela não substitui:

- debate de comportamento;
- Registro de Decisões;
- autorização expressa;
- preservação informacional;
- sincronização documental;
- homologação.

Modernização proativa significa ampliar a qualidade das opções apresentadas ao responsável pelo produto, não ampliar silenciosamente a autoridade do executor.

## 14. Histórico

A versão inicial desta política foi proposta no PR #115, mas o PR permaneceu aberto sobre base antiga enquanto as Rodadas 1, 2 e 3 foram concluídas. Esta versão 1.1 substitui aquela proposta, incorpora o estado real do repositório e formaliza a regra de modernização proativa definida em 3 de agosto de 2026.
