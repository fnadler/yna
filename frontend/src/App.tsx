import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import { AppLayout } from './components/AppLayout'
import { FocusLayout } from './components/FocusLayout'
import { FlowLayout } from './components/FlowLayout'
import { OnboardingLayout } from './components/OnboardingLayout'
import { ProProvider } from './contexts/ProContext'
import { ProAppLayout } from './components/ProAppLayout'
import { RhProvider } from './contexts/RhContext'
import { RhAppLayout } from './components/RhAppLayout'
import { MngProvider } from './contexts/MngContext'
import { MngAppLayout } from './components/MngAppLayout'
import { Mng00Login } from './screens/mng/Mng00Login'
import { Mng10Home } from './screens/mng/Mng10Home'
import { Mng11Empresas } from './screens/mng/Mng11Empresas'
import { Mng11EmpresaDetalhe } from './screens/mng/Mng11EmpresaDetalhe'
import { Mng12Profissionais } from './screens/mng/Mng12Profissionais'
import { Mng20TiposProfissional } from './screens/mng/Mng20TiposProfissional'
import { Mng23Planos } from './screens/mng/Mng23Planos'
import { Mng21Documentos } from './screens/mng/Mng21Documentos'
import { Mng22Notificacoes } from './screens/mng/Mng22Notificacoes'
import { Mng12ProfissionalDetalhe } from './screens/mng/Mng12ProfissionalDetalhe'
import { Mng13Sessoes } from './screens/mng/Mng13Sessoes'
import { Mng14Matches } from './screens/mng/Mng14Matches'
import { Mng15Universidade } from './screens/mng/Mng15Universidade'
import { Mng16Financeiro } from './screens/mng/Mng16Financeiro'
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
import { RH06Onboarding } from './screens/rh/RH06Onboarding'
import { RH10Home } from './screens/rh/RH10Home'
import { RH11Beneficiarios } from './screens/rh/RH11Beneficiarios'
import { RH12Convites } from './screens/rh/RH12Convites'
import { RH13Indicadores } from './screens/rh/RH13Indicadores'
import { RH18Financeiro } from './screens/rh/RH18Financeiro'
import { RH14Departamentos } from './screens/rh/RH14Departamentos'
import { RH15Equipe } from './screens/rh/RH15Equipe'
import { RH16Conta } from './screens/rh/RH16Conta'
import { RH17Mais } from './screens/rh/RH17Mais'
import { NR1RhCockpit } from './screens/rh/NR1RhCockpit'
import { NR1RhCampanha } from './screens/rh/NR1RhCampanha'
import { NR1RhMapaCalor } from './screens/rh/NR1RhMapaCalor'
import { NR1RhInventario } from './screens/rh/NR1RhInventario'
import { NR1RhPlanoAcao } from './screens/rh/NR1RhPlanoAcao'
import { NR1RhRelatorio } from './screens/rh/NR1RhRelatorio'
import { NR1RhCiclos } from './screens/rh/NR1RhCiclos'
import { NR1RhCanal } from './screens/rh/NR1RhCanal'
import { NR1RhKit } from './screens/rh/NR1RhKit'
import { Pro00BemVindo } from './screens/pro/Pro00BemVindo'
import { Pro00Apresentacao } from './screens/pro/Pro00Apresentacao'
import { Pro01Convite } from './screens/pro/Pro01Convite'
import { Pro02LinkInvalido } from './screens/pro/Pro02LinkInvalido'
import { Pro03CadastroConta } from './screens/pro/Pro03CadastroConta'
import { Pro03bContaCriada } from './screens/pro/Pro03bContaCriada'
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
import { Pro27Clientes } from './screens/pro/Pro27Clientes'
import { Pro28Mais } from './screens/pro/Pro28Mais'
import { Pro31LiveRoom } from './screens/pro/Pro31LiveRoom'
import { Pro32Documentos } from './screens/pro/Pro32Documentos'
import { ProCad00Intro } from './screens/pro/ProCad00Intro'
import { ProCad01Wizard } from './screens/pro/ProCad01Wizard'
import { ProCad02Processo } from './screens/pro/ProCad02Processo'
import { ProAtivacao } from './screens/pro/ProAtivacao'

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
import { NR1BenIntro } from './screens/NR1BenIntro'
import { NR1BenQuestionario } from './screens/NR1BenQuestionario'
import { NR1BenConclusao } from './screens/NR1BenConclusao'
import { NR1BenCanalEscuta } from './screens/NR1BenCanalEscuta'
import { NR1BenEvolucao } from './screens/NR1BenEvolucao'

/* Raiz do fluxo do Profissional: provê o ProContext (isolado do beneficiário). */
function ProRoot() {
  return (
    <ProProvider>
      <Outlet />
    </ProProvider>
  )
}

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

            {/* Avaliação psicossocial NR-1 — layout de foco, como a triagem.
                O beneficiário nunca vê jargão de conformidade: para ele isto é
                uma conversa sobre o ambiente de trabalho. */}
            <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" exitTo="/home" />}>
              <Route path="/avaliacao" element={<Navigate to="/avaliacao/intro" replace />} />
              <Route path="/avaliacao/intro" element={<NR1BenIntro />} />
              <Route path="/avaliacao/conclusao" element={<NR1BenConclusao />} />
              <Route path="/avaliacao/:passo" element={<NR1BenQuestionario />} />
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
              <Route path="/canal-escuta" element={<NR1BenCanalEscuta />} />
              <Route path="/minha-evolucao" element={<NR1BenEvolucao />} />
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
              {/* Etapa 1 — Apresentação (boas-vindas + slides comerciais).
                  Telas full-bleed com layout/composição próprios. */}
              <Route path="/pro/bem-vindo" element={<Pro00BemVindo />} />
              <Route path="/pro/apresentacao/:passo" element={<Pro00Apresentacao />} />

              {/* Transição "Conta criada" — full-screen */}
              <Route path="/pro/conta-criada" element={<Pro03bContaCriada />} />

              {/* Cadastro do profissional (intro → etapas → processo) —
                  mesmo layout de foco do onboarding (header/footer). */}
              <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" exitTo="/pro/home" />}>
                <Route path="/pro/cadastro/intro" element={<ProCad00Intro />} />
                <Route path="/pro/cadastro/etapas" element={<ProCad01Wizard />} />
              </Route>
              {/* Confirmação do cadastro — full-screen (mesmo modelo do "conta criada") */}
              <Route path="/pro/cadastro/processo" element={<ProCad02Processo />} />
              <Route path="/pro/ativacao" element={<ProAtivacao />} />

              {/* Entrada (convite) + Etapas 2 e 3 (Cadastro da conta e Onboarding
                  do perfil) + setup financeiro/integração/ativação existentes —
                  layout de foco com barra inferior fixa. */}
              <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" exitTo="/pro/convite/demo" />}>
                <Route path="/pro/convite/invalido" element={<Pro02LinkInvalido />} />
                <Route path="/pro/convite/:token" element={<Pro01Convite />} />
                <Route path="/pro/cadastro" element={<Pro03CadastroConta />} />
                <Route path="/pro/financeiro/setup" element={<Pro05FinanceiroSetup />} />
                <Route path="/pro/integracao" element={<Pro06Integracao />} />
                <Route path="/pro/status" element={<Pro07Status />} />
                <Route path="/pro/ativado" element={<Pro08Ativado />} />
              </Route>

              {/* Sessão e sala de emergência — full-screen (SessionRoom compartilhado).
                  O prontuário pós-sessão abre em Sheet dentro da própria sala. */}
              <Route path="/pro/sessao/:id" element={<Pro15Sessao />} />
              <Route path="/pro/plantao/emergencia/:id" element={<Pro18Emergencia />} />
              {/* Sala de transmissão de live — full-screen */}
              <Route path="/pro/live/:id" element={<Pro31LiveRoom />} />

              {/* Área logada do profissional — sidebar/bottom-nav próprios */}
              <Route element={<ProAppLayout />}>
                <Route path="/pro/home" element={<Pro12Home />} />
                <Route path="/pro/agenda" element={<Pro13Agenda />} />
                <Route path="/pro/clientes" element={<Pro27Clientes />} />
                <Route path="/pro/documentos" element={<Pro32Documentos />} />
                <Route path="/pro/mais" element={<Pro28Mais />} />
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

            {/* ====================================================
                FLUXO 1 — RH / EMPRESA B2B (jornada separada, namespace /rh)
                RhContext isolado; reusa o design system dos demais perfis.
                Não se conecta aos dados de beneficiário/profissional —
                tudo é agregado e anonimizado (LGPD).
                ==================================================== */}
            <Route element={<RhRoot />}>
              {/* Etapa 1 — Apresentação (boas-vindas + slides comerciais).
                  Telas full-bleed com layout/composição próprios. */}
              <Route path="/rh/bem-vindo" element={<RH00BemVindo />} />
              <Route path="/rh/apresentacao/:passo" element={<RH00Apresentacao />} />

              {/* Transição "Conta criada" — full-screen */}
              <Route path="/rh/conta-criada" element={<RH05ContaCriada />} />

              {/* Entrada (convite) + Etapas 2 e 3 (Cadastro da conta e
                  Onboarding) — layout de foco com barra inferior fixa. */}
              <Route element={<FocusLayout bgClass="bg-yna-gradient-soft" exitTo="/rh/convite/demo" />}>
                <Route path="/rh/convite/invalido" element={<RH02LinkInvalido />} />
                <Route path="/rh/convite/:token" element={<RH01Convite />} />
                <Route path="/rh/cadastro" element={<RH04CadastroConta />} />
                <Route path="/rh/onboarding" element={<RH06Onboarding />} />
              </Route>

              {/* Área logada do RH — sidebar/bottom-nav próprios */}
              <Route element={<RhAppLayout />}>
                <Route path="/rh/home" element={<RH10Home />} />
                <Route path="/rh/beneficiarios" element={<RH11Beneficiarios />} />
                <Route path="/rh/convites" element={<RH12Convites />} />
                <Route path="/rh/indicadores" element={<RH13Indicadores />} />
                <Route path="/rh/financeiro" element={<RH18Financeiro />} />
                <Route path="/rh/departamentos" element={<RH14Departamentos />} />

                {/* Cockpit de conformidade NR-1. O RH seleciona e aplica um
                    modelo/versão na campanha — nunca edita o questionário. */}
                <Route path="/rh/nr1" element={<NR1RhCockpit />} />
                <Route path="/rh/nr1/campanha" element={<NR1RhCampanha />} />
                <Route path="/rh/nr1/mapa-calor" element={<NR1RhMapaCalor />} />
                <Route path="/rh/nr1/inventario" element={<NR1RhInventario />} />
                <Route path="/rh/nr1/plano-acao" element={<NR1RhPlanoAcao />} />
                <Route path="/rh/nr1/relatorio" element={<NR1RhRelatorio />} />
                <Route path="/rh/nr1/ciclos" element={<NR1RhCiclos />} />
                <Route path="/rh/nr1/canal" element={<NR1RhCanal />} />
                <Route path="/rh/nr1/kit" element={<NR1RhKit />} />

                <Route path="/rh/equipe" element={<RH15Equipe />} />
                <Route path="/rh/conta" element={<RH16Conta />} />
                <Route path="/rh/mais" element={<RH17Mais />} />
              </Route>

              <Route path="/rh" element={<Navigate to="/rh/home" replace />} />
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
                <Route path="/mng/profissionais" element={<Mng12Profissionais />} />
                <Route path="/mng/profissionais/:id" element={<Mng12ProfissionalDetalhe />} />
                <Route path="/mng/tipos-profissional" element={<Mng20TiposProfissional />} />

                {/* Modelos de avaliação psicossocial (NR-1). Toda a
                    configuração e customização do instrumento vive aqui. */}
                <Route path="/mng/nr1/modelos" element={<NR1MngModelos />} />
                <Route path="/mng/nr1/modelos/:id" element={<NR1MngModeloEditor />} />
                <Route path="/mng/nr1/modelos/:id/versoes" element={<NR1MngVersoes />} />
                <Route path="/mng/nr1/nucleo" element={<NR1MngNucleo />} />

                <Route path="/mng/planos" element={<Mng23Planos />} />
                <Route path="/mng/sessoes" element={<Mng13Sessoes />} />
                <Route path="/mng/matches" element={<Mng14Matches />} />
                <Route path="/mng/universidade" element={<Mng15Universidade />} />
                <Route path="/mng/documentos" element={<Mng21Documentos />} />
                <Route path="/mng/financeiro" element={<Mng16Financeiro />} />
                <Route path="/mng/suporte" element={<Mng17Suporte />} />
                <Route path="/mng/gestores" element={<Mng18Gestores />} />
                <Route path="/mng/notificacoes" element={<Mng22Notificacoes />} />
                <Route path="/mng/mais" element={<Mng19Mais />} />
              </Route>

              <Route path="/mng" element={<Navigate to="/mng/home" replace />} />
            </Route>

            <Route path="/" element={<Navigate to="/rh/bem-vindo" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}
