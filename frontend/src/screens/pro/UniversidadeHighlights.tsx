import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Skeleton } from '../../components/Skeleton'
import { useService } from '../../hooks/useService'
import { proUniversidadeService } from '../../services/pro'
import { CursoCarrossel, CursoCard, CursoProgressCard } from './universidadeParts'
import { CursoPlayerModal } from './Pro29CursoDetalhe'

/* Destaques de cursos da Universidade YNA na home do profissional:
   continue assistindo + últimos lançamentos, com o mesmo player da Universidade. */
export function UniversidadeHighlights() {
  const navigate = useNavigate()
  const cursos = useService(() => proUniversidadeService.cursos(), [])
  const [cursoId, setCursoId] = useState<string | null>(null)

  const verTudo = () => navigate('/pro/universidade')

  const lancamentos = cursos.status === 'success' ? [...cursos.data].sort((a, b) => b.lancadoEm.localeCompare(a.lancadoEm)) : []
  const continuar = cursos.status === 'success' ? cursos.data.filter((c) => c.progresso > 0 && !c.concluido) : []

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
          <Icon icon="ph:graduation-cap-bold" width={20} className="text-primary dark:text-primary-300" aria-hidden />
          Universidade YNA
        </h2>
        <button onClick={verTudo} className="flex items-center gap-1 font-heading text-sm font-medium text-primary transition-colors hover:text-primary-600 dark:text-primary-300">
          Ver tudo <Icon icon="ph:arrow-right-bold" width={14} aria-hidden />
        </button>
      </div>

      {cursos.status === 'loading' || cursos.status === 'idle' ? (
        <Skeleton className="h-56 w-full rounded-lg" />
      ) : cursos.status === 'success' ? (
        <div className="flex flex-col gap-6">
          {continuar.length > 0 && (
            <CursoCarrossel
              title="Continue assistindo"
              items={continuar}
              keyOf={(c) => c.id}
              renderItem={(c) => <CursoProgressCard curso={c} onClick={() => setCursoId(c.id)} />}
            />
          )}
          <CursoCarrossel
            title="Últimos lançamentos"
            verTodos={verTudo}
            items={lancamentos}
            keyOf={(c) => c.id}
            renderItem={(c) => <CursoCard curso={c} onClick={() => setCursoId(c.id)} />}
          />
        </div>
      ) : null}

      <CursoPlayerModal cursoId={cursoId} onClose={() => setCursoId(null)} />
    </section>
  )
}
