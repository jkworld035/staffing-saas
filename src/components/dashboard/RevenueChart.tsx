"use client";

import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface RevenuePoint {
  month: string;
  revenue: number;
  cost: number;
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Revenue vs. Cost</CardTitle>
        <span className="text-xs text-slate-400">Last {data.length} months</span>
      </CardHeader>
      <CardBody>
        {data.length === 0 ? (
          <EmptyChart label="No invoices yet — approve a timesheet to generate the first one." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E4E7EC" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#98A2B3" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#98A2B3" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #E4E7EC", fontSize: 12 }}
                formatter={(v: number) => `$${v.toLocaleString()}`}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#rev)" name="Revenue" />
              <Area type="monotone" dataKey="cost" stroke="#98A2B3" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" name="Cost" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}

export function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed border-line text-center text-sm text-slate-400">
      {label}
    </div>
  );
}
