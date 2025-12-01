# TODO - Sistema de Gerenciamento de Fichas de Avaliação ATCO

## Banco de Dados
- [x] Criar schema com tabela de usuários estendida (5 níveis de acesso)
- [x] Criar tabela de fichas de avaliação
- [x] Criar tabela de itens de avaliação (11 áreas principais)
- [x] Criar tabela de avaliações individuais por item
- [x] Executar migração do banco de dados

## Backend - Gerenciamento de Usuários
- [x] Implementar rota para listar usuários
- [x] Implementar rota para criar usuário
- [x] Implementar rota para editar usuário
- [x] Implementar rota para remover usuário
- [x] Implementar controle de permissões por nível de acesso

## Backend - Fichas de Avaliação
- [x] Implementar rota para criar ficha de avaliação
- [x] Implementar rota para editar ficha de avaliação
- [x] Implementar rota para visualizar ficha de avaliação
- [x] Implementar rota para listar fichas de avaliação
- [x] Implementar rota para excluir ficha de avaliação
- [x] Implementar validação de permissões por nível de acesso

## Backend - Relatórios
- [ ] Implementar rota para relatório de desempenho de alunos
- [ ] Implementar rota para estatísticas por instrutor
- [ ] Implementar rota para dashboard de coordenador
- [ ] Implementar rota para relatórios gerenciais

## Frontend - Autenticação e Dashboard
- [x] Criar página de login
- [x] Criar dashboard principal com navegação por nível de acesso
- [x] Implementar logout
- [x] Criar componente de perfil do usuário

## Frontend - Gerenciamento de Usuários
- [x] Criar página de listagem de usuários
- [x] Criar formulário de criação de usuário
- [x] Criar formulário de edição de usuário
- [x] Implementar exclusão de usuário com confirmação

## Frontend - Fichas de Avaliação
- [x] Criar página de listagem de fichas
- [x] Criar formulário de criação de ficha
- [ ] Criar formulário de edição de ficha
- [x] Criar página de visualização detalhada de ficha
- [x] Implementar filtros de busca (por aluno, instrutor, data, etc)
- [x] Implementar sistema de conceitos (O, B, R, NS, NA)

## Frontend - Relatórios
- [ ] Criar página de relatórios de desempenho
- [ ] Criar dashboard com gráficos e estatísticas
- [ ] Implementar exportação de relatórios

## Testes
- [x] Testes de autenticação
- [x] Testes de gerenciamento de usuários
- [x] Testes de CRUD de fichas
- [x] Testes de permissões por nível de acesso

## Documentação
- [x] Documentar instalação e configuração
- [x] Documentar níveis de acesso e permissões
- [x] Documentar uso do sistema
- [x] Criar guia de usuário

## Bugs Reportados
- [x] Corrigir página inicial que estava mostrando "Example Page" ao invés do dashboard real (era o dashboard real, apenas confusão do usuário)

## Design e Tema
- [x] Criar logo/símbolo do DECEA em SVG
- [x] Implementar tema azul aeronáutico
- [x] Atualizar paleta de cores
- [x] Integrar logo em header e componentes

## Importação e Exportação
- [x] Criar rotas tRPC para exportação em PDF
- [x] Criar rotas tRPC para exportação em CSV
- [x] Criar rotas tRPC para importação de CSV
- [x] Criar página de Importação/Exportação
- [x] Implementar download de fichas em PDF
- [x] Implementar download de fichas em CSV
- [x] Implementar upload e importação de CSV
- [x] Adicionar validação de dados na importação

## Ajustes de Cores
- [x] Mudar azul aeronáutico para azul marinho
- [x] Mudar laranja para cinza médio
- [x] Atualizar tema em todos os componentes

## Bugs Encontrados
- [x] Corrigir cor de cinza médio que estava saindo como vinho/bordo (resolvido com oklch(0.60 0.02 0))

## Atualizações de Logo
- [x] Substituir logo SVG pela logo oficial do DECEA (SATCC CFS EEAR)

## Gerenciamento de Itens de Avaliação
- [x] Analisar planilha GERADOR DE OIs para extrair itens
- [x] Criar tabela de itens de avaliação no banco de dados
- [x] Implementar rotas tRPC para CRUD de itens
- [x] Criar página de gerenciamento de itens
- [x] Implementar importação de itens via Excel/CSV
- [x] Criar submenu na navegação para itens
