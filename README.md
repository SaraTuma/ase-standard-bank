# ASE — Standard Bank Angola

Aplicação web de internet banking que reúne, numa única interface, operações bancárias como consulta de contas, transferências e gestão de beneficiários. A interface está em português e comunica com serviços externos de autenticação e banca.

> **Importante:** este repositório contém uma aplicação cliente, não um banco nem uma API simulada. As operações dependem dos serviços configurados em `js/config.js`; transferências, agendamentos e alterações de cartões podem executar operações reais nesses serviços. Use apenas credenciais e dados de teste autorizados. Não introduza credenciais reais em demonstrações, capturas de ecrã ou pedidos de contribuição.

## Funcionalidades

- Autenticação e sessão de cliente.
- Consulta de contas, saldos e movimentos recentes.
- Consulta de extractos e análise de gastos.
- Transferências entre contas e agendamento de transferências.
- Gestão de beneficiários.
- Bloqueio e desbloqueio de cartões.
- Exportação de extractos em CSV ou PDF, conforme suporte da API.

As funcionalidades disponíveis podem depender da resposta e da disponibilidade dos serviços externos.

## Tecnologias

- HTML e CSS.
- React 18 carregado no browser através de CDN, com JSX transformado pelo Babel Standalone.
- JavaScript para autenticação e comunicação com os serviços REST e SOAP.

O projecto não tem processo de compilação, dependências npm instaláveis, nem comandos de teste definidos em `package.json`.

## Requisitos

- Um browser actualizado.
- Python 3 para iniciar um servidor local (ou uma extensão equivalente, como Live Server no VS Code).
- Acesso à internet para carregar as bibliotecas CDN e contactar os serviços configurados.
- Credenciais de teste autorizadas para utilizar as funcionalidades que exigem autenticação.

## Executar localmente

Na raiz do projecto, inicie um servidor HTTP:

**Windows (PowerShell):**

```powershell
py -m http.server 8000
```

**Linux ou macOS:**

```bash
python3 -m http.server 8000
```

Abra [http://localhost:8000](http://localhost:8000) no browser. Para parar o servidor, use `Ctrl+C` no terminal.

Também pode abrir a pasta no VS Code e iniciar o Live Server sobre `index.html`. Não abra o ficheiro directamente com `file://`: a aplicação precisa de ser servida por HTTP.

O servidor local disponibiliza apenas os ficheiros da interface. Não substitui os serviços de autenticação ou SOAP nem garante acesso a eles. Se o login ou uma operação falhar, confirme a ligação à internet, a disponibilidade dos serviços e a configuração em `js/config.js`.

## Estrutura do projecto

```text
.
├── index.html          # Entrada da aplicação e carregamento dos scripts
├── app.js              # Navegação e composição da aplicação
├── css/
│   └── styles.css      # Estilos
└── js/
    ├── config.js       # Endpoints e opções da aplicação
    ├── auth.js         # Autenticação e gestão da sessão
    ├── soap.js         # Comunicação e tratamento de respostas SOAP
    ├── utils.js        # Funções utilitárias e formatação
    ├── components/     # Componentes partilhados da interface
    └── views/          # Páginas e funcionalidades
```

Os componentes e vistas são carregados individualmente a partir de `index.html`. Ao criar um novo ficheiro JSX, actualize também a lista de scripts nessa página e siga os padrões dos componentes existentes.

## Como contribuir

1. Abra ou consulte uma issue para explicar o problema ou a melhoria. Se não existir, crie uma antes de começar uma alteração maior.
2. Crie uma branch a partir da versão mais recente de `main`. Use um nome descritivo, por exemplo `feature/filtro-extracto`, `fix/validacao-iban` ou `docs/guia-local`.
3. Faça alterações focadas e mantenha o idioma, os padrões visuais e a estrutura existentes.
4. Execute a aplicação localmente e verifique no browser os fluxos afectados. Para alterações de interface, inclua capturas de ecrã no pedido de integração, sem dados pessoais.
5. Reveja as alterações com `git diff` e verifique espaços ou conflitos acidentais com `git diff --check`.
6. Abra um pull request para `main`, descrevendo o motivo da alteração, o que foi feito e como foi validado. Associe a issue correspondente, se existir.

Exemplo de fluxo:

```bash
git switch main
git pull origin main
git switch -c feature/minha-melhoria
# faça e valide as alterações
git add <ficheiros-alterados>
git commit -m "feat: descrever a melhoria"
git push -u origin feature/minha-melhoria
```

Se estiver a contribuir através de um fork, use o remoto do seu fork no `git push` e abra o pull request para o repositório original.

### Antes de abrir um pull request

- Confirme que a aplicação inicia e que as páginas afectadas continuam a funcionar.
- Não inclua palavras-passe, tokens, dados de clientes, respostas de API ou outros segredos.
- Não altere endpoints ou configurações de acesso sem coordenação com os responsáveis pelos serviços.
- Indique claramente se uma validação dependeu de credenciais ou serviços que não estavam disponíveis.

Actualmente não há uma suite de testes automatizados ou um comando de build configurado. A validação deve, por isso, incluir a execução local e a verificação manual das funcionalidades alteradas.
