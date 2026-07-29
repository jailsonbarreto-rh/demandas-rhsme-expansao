-- E4 — restringe a lixeira no banco e preserva o ator real das operações.
-- Não altera dados, responsáveis, históricos ou autorias legadas.

-- Demandas ativas continuam visíveis para todo usuário ativo.
-- Demandas logicamente excluídas ficam visíveis somente para administrador ativo.
drop policy if exists "usuários ativos consultam demandas"
on public.sme_demandas;

create policy "usuários ativos consultam demandas"
on public.sme_demandas
for select
to authenticated
using (
  (select private.is_active())
  and (
    deleted_at is null
    or (select private.is_admin())
  )
);

-- O histórico segue a visibilidade da demanda correspondente.
-- A consulta explícita por demanda_id não pode reconstruir uma demanda excluída.
drop policy if exists "usuários ativos consultam histórico"
on public.sme_historico;

create policy "usuários ativos consultam histórico"
on public.sme_historico
for select
to authenticated
using (
  (select private.is_active())
  and exists (
    select 1
    from public.sme_demandas d
    where d.id = sme_historico.demanda_id
      and (
        d.deleted_at is null
        or (select private.is_admin())
      )
  )
);

-- Em operação autenticada, auth.uid() sempre prevalece sobre qualquer valor recebido.
-- Sem sessão pessoal, uma rotina administrativa privilegiada pode preservar o ator que
-- ela própria validou e atribuiu. Quando nenhum ator é informado, o valor anterior permanece.
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();

  if tg_table_name = 'sme_demandas' then
    new.updated_by = coalesce((select auth.uid()), new.updated_by);
  end if;

  return new;
end;
$$;

revoke all on function private.touch_updated_at()
from public, anon, authenticated;
