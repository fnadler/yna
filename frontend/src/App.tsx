import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import { AppLayout } from './components/AppLayout'
import { FocusLayout } from './components/FocusLayout'
import { FlowLayout } from './components/FlowLayout'
import { OnboardingLayout } from './components/OnboardingLayout'

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

            <Route path="/" element={<Navigate to="/convite/demo" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}
