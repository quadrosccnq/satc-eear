# Sistema de Gerenciamento de Fichas de Avaliação ATCO (SGPO-ATCO)

## Visão Geral

O **SGPO-ATCO** é uma aplicação web desenvolvida para gerenciar fichas de avaliação prática de Controladores de Tráfego Aéreo, baseado no **Anexo C da CIRCEA 100-51**. O sistema permite criar, editar, visualizar e gerenciar fichas de avaliação, com controle de acesso baseado em cinco níveis hierárquicos.

## Características Principais

### ✅ Autenticação e Autorização
- Sistema de login integrado com Manus OAuth
- Cinco níveis de acesso com permissões específicas:
  - **Aluno**: Visualiza apenas suas próprias fichas de avaliação
  - **Instrutor**: Cria e edita fichas de avaliação
  - **Coordenador**: Acessa todas as fichas e gera relatórios
  - **Gerente**: Gerencia usuários e acessa relatórios gerenciais
  - **Administrador**: Acesso total ao sistema

### ✅ Gerenciamento de Usuários
- Criação, edição e exclusão de usuários
- Definição de níveis de acesso
- Atribuição de unidades e órgãos ATC
- Interface intuitiva com tabelas e formulários

### ✅ Fichas de Avaliação
- Criação de fichas baseadas no Anexo C da CIRCEA 100-51
- 11 áreas principais de avaliação:
  - **A** - Legislação de Tráfego Aéreo
  - **B** - Domínio Espacial e Uso dos Meios
  - **C** - Organização
  - **D** - Coordenação
  - **E** - Comunicação Oral
  - **F** - Informações ATS
  - **G** - Planejamento
  - **H** - Controle do Tráfego
  - **I** - Emergência e Degradação
  - **J** - Vigilância ATS
  - **K** - Avaliação Comportamental

- Sistema de conceitos padronizado:
  - **O** (Ótimo)
  - **B** (Bom)
  - **R** (Regular)
  - **NS** (Não Satisfatório)
  - **NA** (Não Avaliado)

- Controle de status:
  - Rascunho
  - Finalizada
  - Aprovada
  - Reprovada

### ✅ Histórico e Rastreabilidade
- Registro automático de todas as alterações
- Histórico completo de ações por usuário
- Data e hora de cada modificação

### ✅ Interface Responsiva
- Design moderno e profissional
- Navegação lateral adaptativa
- Compatível com desktop, tablet e mobile
- Tema claro otimizado para ambientes profissionais

## Tecnologias Utilizadas

### Backend
- **Node.js** com TypeScript
- **Express.js** para servidor HTTP
- **tRPC** para comunicação type-safe entre frontend e backend
- **Drizzle ORM** para acesso ao banco de dados
- **MySQL/TiDB** como banco de dados

### Frontend
- **React 19** com TypeScript
- **Tailwind CSS 4** para estilização
- **shadcn/ui** para componentes de interface
- **Wouter** para roteamento
- **TanStack Query** para gerenciamento de estado

### Segurança
- Autenticação via Manus OAuth
- Senhas armazenadas com hashing seguro
- Controle de acesso baseado em roles (RBAC)
- Validação de dados com Zod
- Proteção contra SQL injection via ORM

## Estrutura do Projeto

```
sgpo-atco/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ui/            # Componentes shadcn/ui
│   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── Home.tsx       # Dashboard principal
│   │   │   ├── Fichas.tsx     # Listagem de fichas
│   │   │   ├── NovaFicha.tsx  # Criação de ficha
│   │   │   ├── FichaDetalhes.tsx # Visualização detalhada
│   │   │   └── Usuarios.tsx   # Gerenciamento de usuários
│   │   ├── lib/
│   │   │   └── trpc.ts        # Cliente tRPC
│   │   └── App.tsx            # Configuração de rotas
│   └── public/                # Arquivos estáticos
├── server/                     # Backend Node.js
│   ├── _core/                 # Configurações do framework
│   ├── db.ts                  # Funções de banco de dados
│   ├── routers.ts             # Rotas tRPC
│   └── *.test.ts              # Testes unitários
├── drizzle/                    # Migrações do banco
│   └── schema.ts              # Schema do banco de dados
└── shared/                     # Código compartilhado
```

## Instalação e Configuração

### Pré-requisitos
- Node.js 22.x ou superior
- pnpm (gerenciador de pacotes)
- Banco de dados MySQL/TiDB

### Passo a Passo

1. **Clone o repositório** (ou acesse via Manus)

2. **Instale as dependências**:
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**:
   As variáveis já estão pré-configuradas no ambiente Manus:
   - `DATABASE_URL`: String de conexão do banco
   - `JWT_SECRET`: Segredo para tokens JWT
   - `OAUTH_SERVER_URL`: URL do servidor OAuth
   - Outras variáveis são injetadas automaticamente

4. **Execute as migrações do banco**:
   ```bash
   pnpm db:push
   ```

5. **Inicie o servidor de desenvolvimento**:
   ```bash
   pnpm dev
   ```

6. **Acesse a aplicação**:
   O sistema estará disponível na URL fornecida pelo Manus

## Uso do Sistema

### Primeiro Acesso

1. Faça login usando suas credenciais Manus
2. O proprietário do projeto é automaticamente definido como **Administrador**
3. Crie os primeiros usuários através do menu "Gerenciar Usuários"

### Criando Usuários

1. Acesse **Gerenciar Usuários** (apenas Gerentes e Administradores)
2. Clique em **"Novo Usuário"**
3. Preencha os dados:
   - Nome completo
   - E-mail (opcional)
   - Nível de acesso
   - Unidade
   - Órgão ATC
4. Clique em **"Criar"**

### Criando uma Ficha de Avaliação

1. Acesse **"Nova Ficha"** (Instrutores e superiores)
2. Preencha os dados básicos:
   - Selecione o avaliado
   - Escolha a finalidade (Estágio ou Final)
   - Informe o órgão ATC e local
   - Defina a data da avaliação
   - Adicione condições do cenário (opcional)
3. Clique em **"Criar Ficha"**
4. A ficha será criada com status "Rascunho"

### Visualizando Fichas

1. Acesse **"Minhas Fichas"**
2. Use a barra de busca para filtrar por:
   - Nome do avaliado
   - Nome do avaliador
   - Órgão ATC
   - Status
3. Clique em **"Ver"** para visualizar os detalhes completos

### Editando Fichas

1. Abra a ficha desejada
2. Clique em **"Editar"** (apenas para fichas em rascunho)
3. Modifique os campos necessários
4. Adicione itens de avaliação por área
5. Atribua conceitos (O, B, R, NS, NA)
6. Salve as alterações

### Níveis de Acesso e Permissões

| Funcionalidade | Aluno | Instrutor | Coordenador | Gerente | Admin |
|----------------|-------|-----------|-------------|---------|-------|
| Ver próprias fichas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver todas as fichas | ❌ | ❌ | ✅ | ✅ | ✅ |
| Criar fichas | ❌ | ✅ | ✅ | ✅ | ✅ |
| Editar próprias fichas | ❌ | ✅ | ✅ | ✅ | ✅ |
| Editar todas as fichas | ❌ | ❌ | ✅ | ✅ | ✅ |
| Excluir fichas | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ver relatórios | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ❌ | ✅ | ✅ |
| Administração | ❌ | ❌ | ❌ | ❌ | ✅ |

## Banco de Dados

### Tabelas Principais

#### `users`
Armazena informações dos usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID único do usuário |
| openId | varchar(64) | Identificador OAuth |
| name | text | Nome completo |
| email | varchar(320) | E-mail |
| role | enum | Nível de acesso |
| unidade | text | Unidade de lotação |
| orgaoAtc | text | Órgão ATC |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Última atualização |
| lastSignedIn | timestamp | Último login |

#### `fichas_avaliacao`
Armazena as fichas de avaliação.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID único da ficha |
| avaliadoId | int | ID do usuário avaliado |
| avaliadoNome | text | Nome do avaliado |
| avaliadorId | int | ID do avaliador |
| avaliadorNome | text | Nome do avaliador |
| orgaoAtc | text | Órgão ATC |
| localAvaliacao | text | Local da avaliação |
| dataAvaliacao | datetime | Data da avaliação |
| finalidade | enum | Estágio ou Final |
| status | enum | Status da ficha |
| condicoesCenario | text | Condições do cenário |
| comentarios | text | Comentários gerais |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Última atualização |

#### `itens_avaliacao`
Armazena os itens individuais de cada área de avaliação.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID único do item |
| fichaId | int | ID da ficha |
| area | varchar(10) | Código da área (A-K) |
| areaNome | text | Nome da área |
| subitem | text | Descrição do subitem |
| conceito | enum | O, B, R, NS, NA |
| observacoes | text | Observações específicas |
| ordem | int | Ordem de exibição |

#### `historico_fichas`
Registra todas as alterações nas fichas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | ID único do registro |
| fichaId | int | ID da ficha |
| usuarioId | int | ID do usuário |
| usuarioNome | text | Nome do usuário |
| acao | text | Tipo de ação |
| descricao | text | Descrição da ação |
| dataHora | timestamp | Data e hora |

## Testes

O sistema inclui testes unitários abrangentes para garantir a qualidade do código.

### Executar Testes

```bash
pnpm test
```

### Cobertura de Testes

- ✅ Autenticação e autorização
- ✅ Gerenciamento de usuários
- ✅ Criação e listagem de fichas
- ✅ Controle de permissões por role
- ✅ Validação de dados

## Comandos Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento

# Build
pnpm build            # Compila para produção
pnpm start            # Inicia servidor de produção

# Banco de Dados
pnpm db:push          # Executa migrações

# Qualidade de Código
pnpm check            # Verifica TypeScript
pnpm format           # Formata código
pnpm test             # Executa testes
```

## Segurança

### Boas Práticas Implementadas

1. **Autenticação Segura**: OAuth 2.0 via Manus
2. **Controle de Acesso**: RBAC (Role-Based Access Control)
3. **Validação de Dados**: Zod para validação de entrada
4. **Proteção SQL**: ORM previne SQL injection
5. **Senhas**: Hashing seguro (não armazenadas em texto plano)
6. **HTTPS**: Comunicação criptografada
7. **Cookies Seguros**: HttpOnly, Secure, SameSite

### Recomendações

- Mantenha as dependências atualizadas
- Use senhas fortes para contas administrativas
- Revise periodicamente os logs de acesso
- Faça backups regulares do banco de dados
- Monitore tentativas de acesso não autorizado

## Suporte e Manutenção

### Problemas Comuns

**1. Erro ao fazer login**
- Verifique se as variáveis de ambiente OAuth estão configuradas
- Limpe os cookies do navegador
- Tente em uma janela anônima

**2. Fichas não aparecem**
- Verifique seu nível de acesso
- Alunos veem apenas suas próprias fichas
- Verifique os filtros de busca

**3. Erro ao criar usuário**
- Verifique se você tem permissão (Gerente/Admin)
- Certifique-se de preencher o nome
- Verifique se o e-mail é válido

### Logs

Os logs do sistema estão disponíveis no console do servidor:
- Erros de autenticação
- Erros de banco de dados
- Ações de usuários

## Roadmap Futuro

### Funcionalidades Planejadas

- [ ] Relatórios avançados com gráficos
- [ ] Exportação de fichas em PDF
- [ ] Assinaturas digitais
- [ ] Notificações por e-mail
- [ ] Dashboard com estatísticas em tempo real
- [ ] Integração com outros sistemas DECEA
- [ ] App mobile nativo
- [ ] Sistema de comentários e feedback
- [ ] Versionamento de fichas
- [ ] Auditoria completa de ações

## Conformidade

O sistema foi desenvolvido seguindo as diretrizes do **Anexo C da CIRCEA 100-51**, que estabelece os critérios para avaliação prática de Controladores de Tráfego Aéreo no Brasil.

### Referências

- **CIRCEA 100-51**: Instrução sobre Avaliação de Controladores de Tráfego Aéreo
- **DECEA**: Departamento de Controle do Espaço Aéreo
- **ANAC**: Agência Nacional de Aviação Civil

## Licença

Este sistema foi desenvolvido para uso interno do DECEA e organizações autorizadas.

## Contato e Suporte

Para suporte técnico ou dúvidas sobre o sistema:
- Acesse a documentação interna
- Entre em contato com a equipe de TI
- Consulte o manual do usuário

---

**Desenvolvido com ❤️ para o DECEA**

*Sistema de Gerenciamento de Fichas de Avaliação ATCO - SGPO-ATCO*
*Versão 1.0 - Dezembro 2025*
