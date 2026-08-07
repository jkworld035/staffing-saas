# Folder Structure — Next.js 15 / Supabase Staffing SaaS

```
staffing-saas/
├── supabase/
│   ├── migrations/
│   │   └── 0001_init_schema.sql
│   └── seed.sql
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (dashboard)/                    # authenticated shell (sidebar + topbar)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx           # MODULE 8
│   │   │   │
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx                 # list
│   │   │   │   ├── [id]/page.tsx            # detail
│   │   │   │   └── new/page.tsx
│   │   │   │
│   │   │   ├── consultants/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   │
│   │   │   ├── timesheets/                  # MODULE 3
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── submit/page.tsx
│   │   │   │
│   │   │   ├── invoices/
│   │   │   │   ├── client/                  # MODULE 4
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── vendor/                  # MODULE 5
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   │
│   │   │   ├── payroll/                     # MODULE 6
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── profit-loss/                 # MODULE 7
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── reports/                     # MODULE 9
│   │   │       ├── page.tsx
│   │   │       └── [reportType]/page.tsx
│   │   │
│   │   └── api/
│   │       ├── timesheets/[id]/approve/route.ts   # calls RPC / triggers automation
│   │       ├── invoices/[id]/pdf/route.ts
│   │       ├── payroll/[id]/payslip/route.ts
│   │       ├── reports/export/route.ts            # excel / pdf / csv
│   │       └── notifications/send/route.ts
│   │
│   ├── components/
│   │   ├── ui/                              # shadcn/ui primitives
│   │   ├── dashboard/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── ProfitChart.tsx
│   │   │   ├── CashFlowCard.tsx
│   │   │   ├── AgingTable.tsx
│   │   │   └── KpiCard.tsx
│   │   ├── timesheets/TimesheetForm.tsx
│   │   ├── invoices/InvoiceTable.tsx
│   │   ├── invoices/InvoicePdfPreview.tsx
│   │   ├── payroll/PayslipView.tsx
│   │   └── shared/DataTable.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                    # browser client
│   │   │   ├── server.ts                    # server client (RSC/route handlers)
│   │   │   └── middleware.ts
│   │   ├── calculations/
│   │   │   ├── invoice.ts                   # revenue = hours * bill_rate
│   │   │   ├── vendor.ts
│   │   │   ├── payroll.ts
│   │   │   └── profitLoss.ts
│   │   ├── pdf/generateInvoicePdf.ts
│   │   ├── email/notify.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   │   └── database.types.ts                # generated via `supabase gen types`
│   │
│   └── middleware.ts                        # route protection by role
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

## Build order (mirrors the automation chain)

1. `supabase/migrations` — done (Phase 1)
2. `lib/supabase/*` — typed client setup
3. Auth shell + role-based middleware
4. Clients + Consultants CRUD (Modules 1–2)
5. Timesheets (Module 3) — this is the trigger point for everything downstream
6. Client Invoice + Vendor Invoice views (Modules 4–5) — mostly read + status transitions, since generation is automatic via the DB trigger
7. Payroll (Module 6)
8. Dashboard (Module 8) — once real data exists from steps 4–7
9. Reports + exports (Module 9)
