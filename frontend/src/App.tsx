import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import { AppLayout } from './components/AppLayout'
import { FocusLayout } from './components/FocusLayout'
import { FlowLayout } from './components/FlowLayout'
import { OnboardingLayout } from './components/OnboardingLayout'
import { ProProvider } from './contexts/ProContext'
import { ProAppLayout } from './components/ProAppLayout'
import { Pro01Convite } from './screens/pro/Pro01Convite'
import { Pro02LinkInvalido } from './screens/pro/Pro02LinkInvalido'
import { Pro03BoasVindas } from './screens/pro/Pro03BoasVindas'
import { Pro04Cadastro } from './screens/pro/Pro04Cadastro'
import { Pro05FinanceiroSetup } from './screens/pro/Pro05FinanceiroSetup'
import { Pro06Integracao } from './screens/pro/Pro06Integracao'
import { Pro07Status } from './screens/pro/Pro07Status'
import { Pro08Ativado } from './screens/pro/Pro08Ativado'
import { Pro09Perfil } from './screens/pro/Pro09Perfil'
import { Pro12Home } from './screens/pro/Pro12Home'
import { Pro13Agenda } from './screens/pro/Pro13Agenda'
import { Pro14Beneficiario } from './screens/pro/Pro14Beneficiario'
import { Pro15Sessao } from './screens/pro/Pro15Sessao'
import { Pro17Plantao } from './screens/pro/Pro17Plantao'
import { Pro18Emergencia } from './screens/pro/Pro18Emergencia'
import { Pro20Supervisao } from './screens/pro/Pro20Supervisao'
import { Pro21Universidade } from './screens/pro/Pro21Universidade'
import { Pro22Lives } from './screens/pro/Pro22Lives'
import { Pro23Qualidade } from './screens/pro/Pro23Qualidade'
import { Pro24Financeiro } from './screens/pro/Pro24Financeiro'
import { Pro19Ausencias } from './screens/pro/Pro19Ausencias'
import { Pro25PerfilConta } from './screens/pro/Pro25PerfilConta'
import { Pro26Notificacoes } from './screens/pro/Pro26Notificacoes'

import { Ben00BemVindo } from './screens/Ben00BemVindo'
import { Ben00Apresentacao } from './screens/Ben00Apresentacao'
import { Ben04Transicao } from './screens/Ben04Transicao'
import { Ben08bTransicao } from './screens/Ben08bTransicao'
import { BenAgenda } from './screens/BenAgenda'
import { Ben01Convite } from './screens/Ben01Convite'
import { Ben02LinkInvalido } from './screens/Ben02LinkInvalido'
import { Ben03Lgpd } from './screens/Ben03Lgpd'
import { Ben05Despedida } from './screens/Ben05Despedida'
import { Ben06Cadastro } from './screens/Ben06Cadastro'
import { Ben07Agenda } from './screens/Ben07Agenda'
import { Ben08Comunicacoes } from './screens/Ben08Comunicacoes'
import { Ben09Triagem } from './screens/Ben09Triagem'
import { Ben10RodaDaVida } from './screens/Ben10RodaDaVida'
import { Ben11Loader } from './screens/Ben11Loader'
import { Ben12Matches } from './screens/Ben12Matches'
import { Ben13Profissional } from './screens/Ben13Profissional'
import { Ben14Agendamento } from './screens/Ben14Agendamento'
import { Ben15Confirmacao } from './screens/Ben15Confirmacao'
import { Ben16PreSessao } from './screens/Ben16PreSessao'
import { Ben17VideoRoom } from './screens/Ben17VideoRoom'
import { Ben18Feedback } from './screens/Ben18Feedback'
import { Ben19Decisao } from './screens/Ben19Decisao'
import { Ben20Rematch } from './screens/Ben20Rematch'
import { Ben21Home } from './screens/Ben21Home'
import { Ben22Nina } from './screens/Ben22Nina'
import { Ben23Emergencia } from './screens/Ben23Emergencia'
import { Ben24Reagendamento } from './screens/Ben24Reagendamento'
import { Ben25CheckInConfig } from './screens/Ben25CheckInConfig'
import { Ben26CheckInNina } from './screens/Ben26CheckInNina'
import { Ben27CheckInForm } from './screens/Ben27CheckInForm'
import { Ben28Evolucao } from './screens/Ben28Evolucao'
import { Ben29Conquistas } from './screens/Ben29Conquistas'
import { Ben30Relatorio } from './screens/Ben30Relatorio'
import { Ben31MeusDados } from './screens/Ben31MeusDados'
import { Ben32to35MigracaoStub } from './screens/Ben32to35MigracaoStub'
import { BenNovosMatches } from './screens/BenNovosMatches'

/* Raiz do fluxo do Profissional: provê o ProContext (isolado do beneficiário). */
function ProRoot() {
  return (
    <ProProvider>
      <Outlet />
    </ProProvider>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Apresentação da YNA — split layout (ilustração + conteúdo) */}
            <Route element={<OnboardingLayout />}>
              <Route path="/apresentacao/:passo" element={<Ben00Apresentacao />} />
            </Route>

            {/* Fluxo LGPD — gradient-soft como fundo de página */}
            <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" />}>
              <Route path="/sigilo" element={<Ben03Lgpd />} />
            </Route>

            {/* Fluxo de cadastro e triagem — gradient-soft como fundo de página */}
            <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" />}>
              <Route path="/cadastro" element={<Ben06Cadastro />} />
              <Route path="/cadastro/agenda" element={<Ben07Agenda />} />
              <Route path="/cadastro/comunicacoes" element={<Ben08Comunicacoes />} />
              <Route path="/triagem/:passo" element={<Ben09Triagem />} />
              <Route path="/triagem/roda" element={<Ben10RodaDaVida />} />
            </Route>

            {/* Telas de convite e despedida (focus, max-w-xl, sem sidebar) */}
            <Route element={<FocusLayout />}>
              <Route path="/convite/:token" element={<Ben01Convite />} />
              <Route path="/convite/invalido" element={<Ben02LinkInvalido />} />
              <Route path="/despedida" element={<Ben05Despedida />} />
            </Route>

            {/* Matches — onboarding, focus layout com gradient fixo */}
            <Route element={<FocusLayout bgClass="bg-yna-gradient-soft bg-fixed" />}>
              <Route path="/matches" element={<Ben12Matches />} />
            </Route>

            {/* Fluxos de tarefa do usuário logado (sidebar desktop, back button mobile) */}
            <Route element={<FlowLayout />}>
              <Route path="/profissional/:id" element={<Ben13Profissional />} />
              <Route path="/agendar/:id" element={<Ben14Agendamento />} />
              <Route path="/confirmacao" element={<Ben15Confirmacao />} />
              <Route path="/pre-sessao/:id" element={<Ben16PreSessao />} />
              <Route path="/sessao/:id/feedback" element={<Ben18Feedback />} />
              <Route path="/sessao/:id/decisao" element={<Ben19Decisao />} />
              <Route path="/sessao/:id/rematch" element={<Ben20Rematch />} />
            </Route>

            {/* Tela cheia — sem layout (vídeo e emergência) */}
            <Route path="/sessao/:id" element={<Ben17VideoRoom />} />
            <Route path="/emergencia" element={<Ben23Emergencia />} />

            {/* App principal (com sidebar/bottom-nav) */}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Ben21Home />} />
              <Route path="/nina" element={<Ben22Nina />} />
              <Route path="/reagendar/:sessaoId" element={<Ben24Reagendamento />} />
              <Route path="/check-in/config" element={<Ben25CheckInConfig />} />
              <Route path="/check-in/nina" element={<Ben26CheckInNina />} />
              <Route path="/check-in/form" element={<Ben27CheckInForm />} />
              <Route path="/evolucao" element={<Ben28Evolucao />} />
              <Route path="/conquistas" element={<Ben29Conquistas />} />
              <Route path="/relatorio" element={<Ben30Relatorio />} />
              <Route path="/meus-dados" element={<Ben31MeusDados />} />
              <Route path="/agenda" element={<BenAgenda />} />
              <Route path="/profissionais/novos" element={<BenNovosMatches />} />
              <Route path="/mensagens" element={<Ben22Nina />} />
              <Route path="/migracao/*" element={<Ben32to35MigracaoStub />} />
            </Route>

            {/* Boas-vindas e telas de transição (standalone, full-screen) */}
            <Route path="/bem-vindo" element={<Ben00BemVindo />} />
            <Route path="/bem-comecar" element={<Ben04Transicao />} />
            <Route path="/pronto" element={<Ben08bTransicao />} />
            <Route path="/matches/carregando" element={<Ben11Loader />} />

            {/* ====================================================
                FLUXO 3 — PROFISSIONAL (jornada separada, namespace /pro)
                ProContext isolado; reusa o design system do beneficiário.
                ==================================================== */}
            <Route element={<ProRoot />}>
              {/* Entrada & Onboarding — layout de foco */}
              <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" exitTo="/pro/convite/demo" />}>
                <Route path="/pro/convite/invalido" element={<Pro02LinkInvalido />} />
                <Route path="/pro/convite/:token" element={<Pro01Convite />} />
                <Route path="/pro/boas-vindas" element={<Pro03BoasVindas />} />
                <Route path="/pro/cadastro/:passo" element={<Pro04Cadastro />} />
                <Route path="/pro/financeiro/setup" element={<Pro05FinanceiroSetup />} />
                <Route path="/pro/integracao" element={<Pro06Integracao />} />
                <Route path="/pro/status" element={<Pro07Status />} />
                <Route path="/pro/ativado" element={<Pro08Ativado />} />
              </Route>

              {/* Sessão e sala de emergência — full-screen (SessionRoom compartilhado).
                  O prontuário pós-sessão abre em Sheet dentro da própria sala. */}
              <Route path="/pro/sessao/:id" element={<Pro15Sessao />} />
              <Route path="/pro/plantao/emergencia/:id" element={<Pro18Emergencia />} />

              {/* Área logada do profissional — sidebar/bottom-nav próprios */}
              <Route element={<ProAppLayout />}>
                <Route path="/pro/home" element={<Pro12Home />} />
                <Route path="/pro/agenda" element={<Pro13Agenda />} />
                <Route path="/pro/beneficiario/:id" element={<Pro14Beneficiario />} />
                <Route path="/pro/perfil" element={<Pro09Perfil />} />
                <Route path="/pro/plantao" element={<Pro17Plantao />} />
                <Route path="/pro/ausencias" element={<Pro19Ausencias />} />
                <Route path="/pro/supervisao" element={<Pro20Supervisao />} />
                <Route path="/pro/universidade" element={<Pro21Universidade />} />
                <Route path="/pro/universidade/lives" element={<Pro22Lives />} />
                <Route path="/pro/qualidade" element={<Pro23Qualidade />} />
                <Route path="/pro/financeiro" element={<Pro24Financeiro />} />
                <Route path="/pro/conta" element={<Pro25PerfilConta />} />
                <Route path="/pro/notificacoes" element={<Pro26Notificacoes />} />
              </Route>

              <Route path="/pro" element={<Navigate to="/pro/home" replace />} />
            </Route>

            <Route path="/" element={<Navigate to="/convite/demo" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}
