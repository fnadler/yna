import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import { AppLayout } from './components/AppLayout'
import { FocusLayout } from './components/FocusLayout'
import { RhProvider } from './contexts/RhContext'
import { RhAppLayout } from './components/RhAppLayout'
import { MngProvider } from './contexts/MngContext'
import { MngAppLayout } from './components/MngAppLayout'
import { Mng00Login } from './screens/mng/Mng00Login'
import { Mng10Home } from './screens/mng/Mng10Home'
import { Mng11Empresas } from './screens/mng/Mng11Empresas'
import { Mng11EmpresaDetalhe } from './screens/mng/Mng11EmpresaDetalhe'
import { Mng22Notificacoes } from './screens/mng/Mng22Notificacoes'
import { Mng17Suporte } from './screens/mng/Mng17Suporte'
import { Mng18Gestores } from './screens/mng/Mng18Gestores'
import { Mng19Mais } from './screens/mng/Mng19Mais'
import { NR1MngModelos } from './screens/mng/NR1MngModelos'
import { NR1MngModeloEditor } from './screens/mng/NR1MngModeloEditor'
import { NR1MngVersoes } from './screens/mng/NR1MngVersoes'
import { NR1MngNucleo } from './screens/mng/NR1MngNucleo'
import { RH00BemVindo } from './screens/rh/RH00BemVindo'
import { RH00Apresentacao } from './screens/rh/RH00Apresentacao'
import { RH01Convite } from './screens/rh/RH01Convite'
import { RH02LinkInvalido } from './screens/rh/RH02LinkInvalido'
import { RH04CadastroConta } from './screens/rh/RH04CadastroConta'
import { RH05ContaCriada } from './screens/rh/RH05ContaCriada'
import { RH11Colaboradores } from './screens/rh/RH11Colaboradores'
import { RH12Convites } from './screens/rh/RH12Convites'
import { RH14Departamentos } from './screens/rh/RH14Departamentos'
import { RH15Equipe } from './screens/rh/RH15Equipe'
import { RH16Conta } from './screens/rh/RH16Conta'
import { RH17Mais } from './screens/rh/RH17Mais'
import { NR1RhCockpit } from './screens/rh/NR1RhCockpit'
import { NR1RhInventario } from './screens/rh/NR1RhInventario'
import { NR1RhPlanoAcao } from './screens/rh/NR1RhPlanoAcao'
import { NR1RhRelatorio } from './screens/rh/NR1RhRelatorio'
import { NR1RhCiclos } from './screens/rh/NR1RhCiclos'
import { NR1RhCanal } from './screens/rh/NR1RhCanal'
import { Ben00BemVindo } from './screens/Ben00BemVindo'
import { Ben03Lgpd } from './screens/Ben03Lgpd'
import { Ben05Despedida } from './screens/Ben05Despedida'
import { Col03MeuEspaco } from './screens/Col03MeuEspaco'
import { ColAvaliacoes } from './screens/ColAvaliacoes'
import { Col05Apoio } from './screens/Col05Apoio'
import { ColCriarConta } from './screens/ColCriarConta'
import { Ben31MeusDados } from './screens/Ben31MeusDados'
import { NR1BenQuestionario } from './screens/NR1BenQuestionario'
import { NR1BenConclusao } from './screens/NR1BenConclusao'
import { NR1BenCanalEscuta } from './screens/NR1BenCanalEscuta'
import { NR1BenEvolucao } from './screens/NR1BenEvolucao'
import { ColTransicaoAvaliacao } from './screens/ColTransicaoAvaliacao'
import { ColConviteConta } from './screens/ColConviteConta'
import { ColContaCriada } from './screens/ColContaCriada'

/* Raiz do fluxo do RH/Empresa: provê o RhContext (isolado dos demais perfis). */
function RhRoot() {
  return (
    <RhProvider>
      <Outlet />
    </RhProvider>
  )
}

/* Raiz do Manager/Backoffice YNA: provê o MngContext (isolado dos demais perfis). */
function MngRoot() {
  return (
    <MngProvider>
      <Outlet />
    </MngProvider>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Tela de despedida (focus, max-w-xl, sem sidebar) */}
            <Route element={<FocusLayout />}>
              <Route path="/despedida" element={<Ben05Despedida />} />
            </Route>

            {/* Bem-vindo — único ponto de entrada do colaborador. Não há mais
                convite por token nem apresentação em slides (ver
                `Ben00BemVindo.tsx`): a pessoa chega aqui, clica em "Iniciar
                avaliação", se identifica por CPF + data de nascimento num
                modal, e cai direto no LGPD/sigilo abaixo. Full-bleed,
                layout/composição próprios (mesmo padrão do RH00BemVindo). */}
            <Route path="/bem-vindo" element={<Ben00BemVindo />} />

            {/* Fluxo LGPD — gradient-soft como fundo de página */}
            <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" />}>
              <Route path="/sigilo" element={<Ben03Lgpd />} />
            </Route>

            {/* Transições "tudo certo"/"concluído" — fecham um ciclo e abrem o
                próximo. Standalone/full-screen, como as demais transições de
                onboarding (ver RH05ContaCriada): sem header do FocusLayout. */}
            <Route path="/comecar" element={<ColTransicaoAvaliacao />} />
            <Route path="/avaliacao/conclusao" element={<NR1BenConclusao />} />
            <Route path="/conta-criada" element={<ColContaCriada />} />

            {/* Avaliação psicossocial NR-1 — respondida ANTES da criação de conta,
                ainda anônima/tokenizada (reforça que a resposta não é vinculada a
                uma identidade). O colaborador nunca vê jargão de conformidade:
                para ele isto é uma conversa sobre o ambiente de trabalho.

                Não existe mais uma tela "/avaliacao/intro" própria: o sigilo
                (`/sigilo`) já cobre o consentimento e as garantias de anonimato antes
                de chegar aqui, então uma segunda tela repetindo os mesmos argumentos
                só antes do questionário virou redundância. `ColTransicaoAvaliacao`/
                `ColAvaliacoes` mandam direto
                para `/avaliacao/1`, e a reasseguração prática que só existia na
                intro (duração, "não há resposta certa") migrou para dentro do
                primeiro passo do próprio questionário.

                `/avaliacao/:passo` (uma pergunta por vez) é standalone, sem
                FocusLayout: mesma composição full-bleed de `ColTransicaoAvaliacao`
                (gradiente + card centralizado), não a barra/fundo-soft que as
                demais telas de foco usam. */}
            <Route path="/avaliacao/:passo" element={<NR1BenQuestionario />} />

            <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" exitTo="/despedida" />}>
              <Route path="/avaliacao/conta" element={<ColConviteConta />} />
            </Route>

            {/* Criação de conta leve — só depois da avaliação já enviada. */}
            <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" exitTo="/despedida" />}>
              <Route path="/criar-conta" element={<ColCriarConta />} />
            </Route>

            {/* App principal (com sidebar/bottom-nav) */}
            <Route element={<AppLayout />}>
              <Route path="/meu-espaco" element={<Col03MeuEspaco />} />
              <Route path="/avaliacao" element={<ColAvaliacoes />} />
              <Route path="/apoio" element={<Col05Apoio />} />
              <Route path="/canal-escuta" element={<NR1BenCanalEscuta />} />
              <Route path="/minha-evolucao" element={<NR1BenEvolucao />} />
              <Route path="/meus-dados" element={<Ben31MeusDados />} />
            </Route>

            {/* ====================================================
                FLUXO 1 — RH / EMPRESA B2B (jornada separada, namespace /rh)
                RhContext isolado; reusa o design system dos demais perfis.
                Não se conecta aos dados individuais do colaborador —
                tudo é agregado e anonimizado (LGPD).
                ==================================================== */}
            <Route element={<RhRoot />}>
              {/* Etapa 1 — Apresentação (boas-vindas + slides comerciais).
                  Telas full-bleed com layout/composição próprios. */}
              <Route path="/rh/bem-vindo" element={<RH00BemVindo />} />
              <Route path="/rh/apresentacao/:passo" element={<RH00Apresentacao />} />

              {/* Transição "Conta criada" — full-screen */}
              <Route path="/rh/conta-criada" element={<RH05ContaCriada />} />

              {/* Entrada (convite) + Etapa 2 (Cadastro da conta) — layout de
                  foco com barra inferior fixa. Sem onboarding de
                  colaboradores aqui: a conta criada já cai direto no painel
                  (RH05ContaCriada → /rh/nr1, a Visão geral); cadastrar o time
                  é uma ação de dentro do painel (RH11Colaboradores), depois
                  que a empresa configura a pesquisa. */}
              <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" exitTo="/rh/convite/demo" />}>
                <Route path="/rh/convite/invalido" element={<RH02LinkInvalido />} />
                <Route path="/rh/convite/:token" element={<RH01Convite />} />
                <Route path="/rh/cadastro" element={<RH04CadastroConta />} />
              </Route>

              {/* Área logada do RH — sidebar/bottom-nav próprios */}
              <Route element={<RhAppLayout />}>
                <Route path="/rh/colaboradores" element={<RH11Colaboradores />} />
                <Route path="/rh/convites" element={<RH12Convites />} />
                <Route path="/rh/departamentos" element={<RH14Departamentos />} />

                {/* Cockpit de conformidade NR-1. O RH seleciona e aplica um
                    modelo/versão na campanha — nunca edita o questionário. */}
                <Route path="/rh/nr1" element={<NR1RhCockpit />} />
                <Route path="/rh/nr1/ciclos" element={<NR1RhCiclos />} />
                <Route path="/rh/nr1/ciclos/:campanhaId" element={<NR1RhCiclos />} />
                <Route path="/rh/nr1/inventario" element={<NR1RhInventario />} />
                <Route path="/rh/nr1/plano-acao" element={<NR1RhPlanoAcao />} />
                <Route path="/rh/nr1/relatorio" element={<NR1RhRelatorio />} />
                <Route path="/rh/nr1/canal" element={<NR1RhCanal />} />

                <Route path="/rh/equipe" element={<RH15Equipe />} />
                <Route path="/rh/conta" element={<RH16Conta />} />
                <Route path="/rh/mais" element={<RH17Mais />} />
              </Route>

              {/* Padrão de /rh: Visão geral (NR1RhCockpit) — a antiga Home
                  (RH10Home.tsx) foi removida por duplicar esse conteúdo. */}
              <Route path="/rh" element={<Navigate to="/rh/nr1" replace />} />
            </Route>

            {/* ====================================================
                FLUXO 4 — MANAGER / BACKOFFICE YNA (namespace /mng)
                MngContext isolado; reusa o design system dos demais perfis.
                Motor interno da operação (empresas, profissionais, conteúdo,
                sessões, finanças, suporte).
                ==================================================== */}
            <Route element={<MngRoot />}>
              {/* Acesso ao Manager — login + recuperação de senha (full-screen) */}
              <Route path="/mng/login" element={<Mng00Login />} />

              {/* Área logada do Manager — sidebar/bottom-nav próprios */}
              <Route element={<MngAppLayout />}>
                <Route path="/mng/home" element={<Mng10Home />} />
                <Route path="/mng/empresas" element={<Mng11Empresas />} />
                <Route path="/mng/empresas/:id" element={<Mng11EmpresaDetalhe />} />

                {/* Modelos de avaliação psicossocial (NR-1). Toda a
                    configuração e customização do instrumento vive aqui. */}
                <Route path="/mng/nr1/modelos" element={<NR1MngModelos />} />
                <Route path="/mng/nr1/modelos/:id" element={<NR1MngModeloEditor />} />
                <Route path="/mng/nr1/modelos/:id/versoes" element={<NR1MngVersoes />} />
                <Route path="/mng/nr1/nucleo" element={<NR1MngNucleo />} />

                <Route path="/mng/suporte" element={<Mng17Suporte />} />
                <Route path="/mng/gestores" element={<Mng18Gestores />} />
                <Route path="/mng/notificacoes" element={<Mng22Notificacoes />} />
                <Route path="/mng/mais" element={<Mng19Mais />} />
              </Route>

              <Route path="/mng" element={<Navigate to="/mng/home" replace />} />
            </Route>

            <Route path="/" element={<Navigate to="/rh/bem-vindo" replace />} />
            <Route path="*" element={<Navigate to="/meu-espaco" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}
