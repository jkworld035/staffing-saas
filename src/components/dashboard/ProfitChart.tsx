"use client";

import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { EmptyChart } from "./RevenueChart";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export interface ProfitPoint {
  month: string;
  profit: number;
  margin: number;
}

export function ProfitChart({ data }: { data: ProfitPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Profit</CardTitle>
      </CardHeader>
      <CardBody>
        {data.length === 0 ? (
          <EmptyChart label="Profit appears once invoices, vendor costs and payroll exist." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ left: -20, right: 10 }}>
              <CartesianGrid vertical={false} stroke="#E4E7EC" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#98A2B3" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#98A2B3" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #E4E7EC", fontSize: 12 }}
                formatter={(v: number) => `$${v.toLocaleString()}`}
              />
              <Bar dataKey="profit" fill="#059669" radius={[4, 4, 0, 0]} name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
