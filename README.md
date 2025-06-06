# Simple API by Techify

> **Projeto didático para explicar, na prática, como funciona uma API REST + WebSocket**

<div align="center">
  <img src="https://img.shields.io/badge/node-^20.x-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/license-ISC-blue" alt="License">
</div>

---

## ✨ Principais recursos

| Recurso                         | Descrição                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Sem cadastro**                | A cada novo visitante é gerado um UUID que identifica o usuário automaticamente por cookie.        |
| **CRUD completo**               | API RESTful usando métodos HTTP (POST, GET, PUT, DELETE) para operações.                          |
| **Histórico de 50 registros**   | Cada usuário armazena apenas os 50 itens mais recentes em disco (`/data/<uuid>.json`).             |
| **Filtros no GET**              | Query params simples (`?campo=valor`) filtram os resultados localmente.                            |
| **Requisições prontas**         | A interface gera exemplos de cURL com o header **Bearer** para copiar/colar.                       |
| **Token único (fixo)**          | O mesmo token `uzJtmYh8DrCuAK5td3APLxvYds704hOslXZJd7a` protege todas as rotas (exemplo didático). |
| **Interface Web em tempo real** | Página SPA (`/view`) exibe e atualiza a lista via WebSocket a cada alteração.                      |

> **Atenção:** o projeto **não é recomendado para produção**. Foi pensado para fins educacionais — sem banco de dados, sem TLS e com autenticação simplificada.

---

## 🚀 Iniciando rápido

```bash
# 1. Clone o repositório
$ git clone https://github.com/sua-conta/simple-api.git
$ cd simple-api

# 2. Instale as dependências
$ npm install

# 3. Inicie o servidor (porta 3006 por padrão)
$ npm start
# ou, durante o desenvolvimento
$ npm run dev
```

### Variáveis de ambiente (opcionais)

| Variável   | Padrão   | Função                                                        |
| ---------- | -------- | ------------------------------------------------------------- |
| `PORT`     | `3006`   | Porta HTTP.                                                   |
| `DATA_DIR` | `./data` | Diretório onde os arquivos JSON de cada usuário são gravados. |

---

## 🗺️ Mapa de rotas

Todas as rotas exigem o header:

```http
Authorization: Bearer uzJtmYh8DrCuAK5td3APLxvYds704hOslXZJd7a
```

> **UUID opcional**: se você omitir o parâmetro `:uuid`, o servidor cria um automaticamente e redireciona (cookie `user_uuid`).

| Método   | Endpoint      | Descrição                                         |
| -------- | ------------- | ------------------------------------------------- |
| `POST`   | `/:uuid?`     | Cria um novo registro.                            |
| `GET`    | `/:uuid?`     | Lista registros; aceita filtros via query‑string. |
| `PUT`    | `/:uuid?/:id` | Atualiza o registro `id`.                         |
| `DELETE` | `/:uuid?/:id` | Remove o registro `id`.                           |
| `GET`    | `/:uuid?/view`| Interface web com WebSocket.                      |

### Corpo das requisições

```jsonc
// POST / (criar)
{
  "name": "Exemplo Nome",
  "occupation": "Exemplo Profissão"
}

// PUT /:id (atualizar)
{
  "name": "Nome editado",
  "occupation": "Profissão editada"
}
```

### Filtros disponíveis no GET

* `id` — igualdade exata (numero)
* `name` — correspondência que **contém** (case‑insensitive)
* `occupation` — correspondência que **contém** (case‑insensitive)

Exemplo: `GET /?occupation=Engenheiro&name=ana`

---

## 💻 Exemplos de cURL

```bash
TOKEN="uzJtmYh8DrCuAK5td3APLxvYds704hOslXZJd7a"
UUID="<cole_seu_uuid_aqui>"
BASE="http://localhost:3006/$UUID"

# Criar
curl -X POST "$BASE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","occupation":"Desenvolvedora"}'

# Listar com filtros
curl -X GET "$BASE?occupation=Desenvolvedora" \
  -H "Authorization: Bearer $TOKEN"

# Atualizar
curl -X PUT "$BASE/3" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria A.","occupation":"Full‑Stack"}'

# Deletar
curl -X DELETE "$BASE/3" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏗️ Arquitetura

```
📂 simple-api
 ├─ public/            # SPA estática (HTML/CSS/JS)
 ├─ data/              # Arquivos JSON dos usuários (até 50 registros cada)
 ├─ simple_api.js      # Servidor Express + WS
 ├─ migrate-data.js    # Utilitário opcional para migração de dados
 ├─ package.json       # Dependências, scripts NPM
 └─ coolify.json       # Template para deploy via Coolify (opcional)
```

* **Express** serve a API REST.
* **WebSocket (ws)** envia notificações em tempo real para a SPA.
* **Helmet & CORS** protegendo cabeçalhos básicos.
* **Morgan** *logger* de requisições.
* Dados persistidos em **JSON local** — sem banco de dados.

---

## 🛣️ Roadmap

* [ ] Pagination na rota GET.
* [ ] Upload de arquivos.
* [ ] Dockerfile oficial.
* [ ] Deploy 1‑click na Vercel / Fly.io.
* [ ] Trocar token fixo por JWT variável.

Contribuições são bem‑vindas! Abra uma *issue* ou envie um *pull request*.

---

## 🤝 Contribuindo

1. **Fork** o projeto.
2. Crie sua *branch*: `git checkout -b feature/MinhaFuncionalidade`.
3. Commit suas mudanças: `git commit -m 'feat: Minha nova funcionalidade'`.
4. *Push* na branch: `git push origin feature/MinhaFuncionalidade`.
5. Abra um **Pull Request**.

---

## 📝 Licença

Distribuído sob a licença **ISC**. Veja `LICENSE` para mais informações.

---

<p align="center">
  Feito com 💙 por <a href="https://techify.com.br" target="_blank">Techify</a>
</p>
