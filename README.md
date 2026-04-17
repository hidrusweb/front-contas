# Hidrus Contas (Frontend)

Aplicação web do condômino para autenticação e visualização de contas/consumo no ecossistema Hidrus.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- React Hook Form + Zod
- Axios para integração com API

## Requisitos

- Node.js 20+
- npm 10+

## Configuração

```bash
npm install
```

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080/api
NEXT_PUBLIC_BASE_PATH=
```

- `NEXT_PUBLIC_API_URL`: URL base da API (`hidrus-backend`).
- `NEXT_PUBLIC_BASE_PATH`: use apenas quando o deploy ocorrer em subpasta (ex.: `/contas`).

## Execução local

```bash
npm run dev
```

Aplicação disponível em `http://localhost:3000`.

## Build e execução em produção

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Deploy

O projeto está preparado para export estático (`output: "export"`) e suporta deploy em subdiretório via `NEXT_PUBLIC_BASE_PATH` (alinhado ao `basePath` no `next.config.ts`).
