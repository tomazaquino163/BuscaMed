# BuscaMed

O BuscaMed é um sistema web desenvolvido para facilitar a comparação de preços de medicamentos em farmácias participantes.

A proposta do projeto é permitir que o usuário pesquise um medicamento, visualize as ofertas disponíveis, identifique o menor preço e entre em contato diretamente com a farmácia.

O sistema também possui áreas específicas para farmácias e moderadores, com autenticação, controle de acesso e gerenciamento de medicamentos.

---

# Objetivo do projeto

O principal objetivo do BuscaMed é ajudar a população a encontrar medicamentos com preços mais acessíveis de forma simples, rápida e organizada.

Além disso, o projeto busca aproximar as farmácias locais dos consumidores, permitindo que os estabelecimentos publiquem seus medicamentos, preços e formas de contato.

---

# Tecnologias utilizadas

O sistema foi desenvolvido com as seguintes tecnologias:

- HTML5
- CSS3
- JavaScript
- Supabase
- GitHub
- GitHub Codespaces
- GitHub Pages

O Supabase foi utilizado para:

- armazenamento dos dados;
- autenticação dos usuários;
- gerenciamento das farmácias;
- gerenciamento dos medicamentos;
- controle de permissões;
- consulta das ofertas disponíveis.

---

# Etapas da construção do projeto

## 1. Definição da ideia

A primeira etapa foi identificar um problema real: muitas pessoas precisam consultar diferentes farmácias para descobrir onde um medicamento está mais barato.

A partir disso, foi criada a ideia de desenvolver uma plataforma que centralizasse essas informações em um único local.

O sistema deveria permitir:

- pesquisar medicamentos;
- comparar preços;
- localizar farmácias;
- entrar em contato com o estabelecimento;
- cadastrar farmácias;
- gerenciar medicamentos;
- aprovar ou rejeitar novos cadastros.

---

## 2. Planejamento das áreas do sistema

O projeto foi dividido em três áreas principais.

### Área pública

Destinada aos usuários que desejam pesquisar medicamentos e comparar preços.

### Área da farmácia

Destinada aos responsáveis pelas farmácias, permitindo:

- realizar login;
- acessar o painel;
- cadastrar medicamentos;
- editar medicamentos;
- excluir medicamentos;
- controlar estoque;
- ativar ou desativar ofertas;
- visualizar informações do estabelecimento.

### Área do moderador

Destinada à análise das farmácias cadastradas.

O moderador pode:

- visualizar farmácias pendentes;
- aprovar cadastros;
- rejeitar cadastros;
- acompanhar o status dos estabelecimentos.

---

## 3. Organização da estrutura de arquivos

Os arquivos foram organizados para facilitar a manutenção e separar as diferentes partes do sistema.

```text
BUSCAMED/
├── assets/
│   ├── banner-casal-idoso.png
│   ├── logo-farmacia.png
│   └── logo.png
├── farmacia/
├── moderador/
├── painel/
├── auth.js
├── config.js
├── index.html
├── login.html
├── login.css
├── login.js
├── login-moderador.html
├── login-moderador.css
├── login-moderador.js
├── script.js
├── style.css
├── supabase.js
└── README.md
