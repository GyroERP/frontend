# GyroERP Frontend Architecture

Modular, Odoo-inspired: **Ant Design for UI**, **self-contained business modules**,
runtime isolation. A broken module never takes down the system.

## Layout

```
src/
├── config/        antd-theme.ts, modules registry, module icons
├── erp/           ERP BUILDING BLOCKS — domain-aware, shared by every module
│   ├── enterprise/   PageShell, GyroLogger, MoneyDisplay, PermissionGuard, …
│   ├── list/         ListPage, ErpProTable (ProTable + ListController)
│   ├── document/     EditableProTable helpers for order/PO/transfer lines
│   ├── selectors/    ApiSelector + domain selectors
│   ├── display/      StateBadge, StateTransitionButton, SequenceDisplay
│   └── workflow/     useDocWorkflow
├── api/           PLATFORM CORE — axios client + kernel/accounts API
├── modules/       SELF-CONTAINED BUSINESS MODULES (pages compose antd + @/erp)
├── lib/           PageLoader, layout helpers, notify, ErrorBoundary, cn()
├── layouts/       AppLayout (ProLayout), ProLayoutHeaderActions
└── routes/        thin TanStack Router files — lazy-load module pages
```

## UI stack

- **Ant Design** (`antd`, `@ant-design/icons`) with `ConfigProvider` theme in
  [`src/config/antd-theme.ts`](src/config/antd-theme.ts) — Gyro red `#CC0000`.
- **Ant Design Pro** (`@ant-design/pro-components` v3) with `ProConfigProvider` in
  [`src/main.tsx`](src/main.tsx): **ProLayout** (app shell), **PageContainer** (via `PageShell`),
  **ProTable** (via `ErpProTable`), **ProForm**, **EditableProTable**, **StatisticCard**, **LoginForm**.
- **Tailwind CSS** for page spacing and legacy utility classes only; do not
  override Ant/Pro component internals with Tailwind.
- **Forms**: prefer **ProForm** on CRUD screens; react-hook-form + zod only where not yet migrated.
- **Toasts**: `@/lib/notify` (Ant `message` / `notification`), not sonner.

## Boundary Rules (enforced by `eslint.config.js`)

| Layer | May import | Must NEVER import |
|---|---|---|
| `erp/` | antd, `@ant-design/pro-components`, lib, hooks, api (platform) | modules, routes, `@/ui` |
| `modules/X` | antd, erp, api, lib, hooks, stores, **other modules via `@/modules/Y` only** | deep paths `@/modules/Y/...`, routes |
| `routes/` | anything (thin loaders; exempt) | — |

## Runtime isolation

- `main.tsx` sets `defaultErrorComponent: ModuleErrorFallback` on the router.
- Module pages are lazy-loaded from `routes/`.
- `@/lib/ErrorBoundary` fences risky widgets inside a page.

## How to add a new module

1. `src/modules/<name>/{api,pages}/` — copy from `modules/sales`.
2. `api/types.ts`, `api/keys.ts`, optional `api/endpoints.ts`, `index.ts` barrel.
3. Pages use **antd** + `@/erp` — start with `PageShell`, optional
   `aside={<GyroLogger contentType="app.model" objectId={id} />}`.
4. List screens: `useListController` + `ListPage` (ProTable) + `ColumnsType` columns.
5. Routes under `src/routes/_app/<name>/`, entry in `src/config/modules.ts`.

## Page layout

Use `@/lib/layout` helpers or Ant `Card` / `Row` / `Col` / `Space`:

```tsx
<PageStack>
  <FormSection title="General">
    <FieldGrid cols={3}>
      <Form.Item label="SKU"><Input /></Form.Item>
      <FieldGrid.Full>
        <Form.Item label="Name"><Input /></Form.Item>
      </FieldGrid.Full>
    </FieldGrid>
  </FormSection>
</PageStack>
```

## Conventions

- Query keys: hierarchical factories per module (`inventoryKeys.product(id)`).
- Money: `DecimalString` + `@/lib/decimal` + `MoneyDisplay`.
- Backend workflow states are uppercase strings (`DRAFT`, `DONE`, …).
- Kernel `content_type`: `"app_label.model"` (e.g. `"inventory.producttemplate"`).
