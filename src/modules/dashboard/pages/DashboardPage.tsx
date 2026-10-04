import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  AppstoreOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import { ProCard, StatisticCard } from '@ant-design/pro-components'
import { salesKeys } from '@/modules/sales'
import { hrKeys } from '@/modules/hr'
import { inventoryKeys } from '@/modules/inventory'
import { salesApi } from '@/modules/sales'
import { PageShell } from '@/erp/enterprise/PageShell'

import { Skeleton } from 'antd'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import { apiClient } from '@/api/client'
import type { HrEmployee } from '@/modules/hr'
import type { PaginatedResponse } from '@/api/types/common'

const BRAND_RED = '#CC0000'

interface RevenuePoint {
  date: string
  revenue: number
}

// Mock revenue data for the chart (would come from analytics endpoint)
const MOCK_REVENUE: RevenuePoint[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(2025, i, 1)
  return {
    date: date.toLocaleDateString('en', { month: 'short' }),
    revenue: Math.floor(Math.random() * 100000 + 50000),
  }
})

const ORDER_STATUS_DATA = [
  { name: 'Draft', value: 12, color: '#A8A8A8' },
  { name: 'Confirmed', value: 34, color: '#CC0000' },
  { name: 'Done', value: 89, color: '#16A34A' },
  { name: 'Cancelled', value: 5, color: '#D97706' },
]

export function DashboardPage() {
  const currencyCode = useCurrencyCode()

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: salesKeys.orderList({ page_size: 5, ordering: '-date_order' }),
    queryFn: () => salesApi.orders.list({ page_size: 5, ordering: '-date_order' }),
    staleTime: 60_000,
  })

  const { data: employeeData, isLoading: empLoading } = useQuery({
    queryKey: hrKeys.employeeList({ page_size: 1, is_active: 'true' }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<HrEmployee>>('/hr/employees/', {
        params: { page_size: 1, is_active: true },
      }),
    staleTime: 300_000,
  })

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: inventoryKeys.productList({ page_size: 1 }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<{ id: string }>>('/inventory/products/', {
        params: { page_size: 1 },
      }),
    staleTime: 300_000,
  })

  const recentOrders = salesData?.data.results ?? []
  const totalEmployees = employeeData?.data.count ?? 0
  const totalProducts = productData?.data.count ?? 0
  const totalRevenue = recentOrders.reduce((sum, o) => sum + parseFloat(o.amount_total), 0)

  return (
    <PageShell
      title="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatisticCard
          loading={salesLoading}
          statistic={{
            title: 'Total Revenue (5 latest)',
            value: new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).format(totalRevenue),
            description: '+12.5% vs last month',
          }}
          chart={<DollarOutlined style={{ fontSize: 48, color: '#CC0000', opacity: 0.15 }} />}
        />
        <StatisticCard
          loading={empLoading}
          statistic={{ title: 'Active Employees', value: totalEmployees }}
          chart={<TeamOutlined style={{ fontSize: 48, color: '#CC0000', opacity: 0.15 }} />}
        />
        <StatisticCard
          loading={productLoading}
          statistic={{ title: 'Products', value: totalProducts }}
          chart={<AppstoreOutlined style={{ fontSize: 48, color: '#CC0000', opacity: 0.15 }} />}
        />
        <StatisticCard
          loading={salesLoading}
          statistic={{
            title: 'Open Orders',
            value: salesData?.data.count ?? 0,
            description: '3 pending confirmation',
          }}
          chart={<ShoppingCartOutlined style={{ fontSize: 48, color: '#CC0000', opacity: 0.15 }} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue trend */}
        <ProCard className="lg:col-span-2" title="Monthly Revenue" extra={<RiseOutlined style={{ color: '#CC0000' }} />}>
          <div role="img" aria-labelledby="revenue-chart-title" aria-description="Area chart showing monthly revenue trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_REVENUE} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND_RED} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={BRAND_RED} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A8A8A8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A8A8A8' }} axisLine={false} tickLine={false} width={50}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E8E8E8', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(v) => [
                  new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).format(Number(v)),
                  'Revenue',
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={BRAND_RED}
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
          <details className="sr-only">
            <summary>Revenue data table</summary>
            <table>
              <thead><tr><th scope="col">Month</th><th scope="col">Revenue</th></tr></thead>
              <tbody>{MOCK_REVENUE.map((r) => <tr key={r.date}><td>{r.date}</td><td>{r.revenue}</td></tr>)}</tbody>
            </table>
          </details>
        </ProCard>

        {/* Order status donut */}
        <ProCard title="Order Status">
          <div role="img" aria-labelledby="order-status-chart-title" aria-description="Donut chart showing order status distribution">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={ORDER_STATUS_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {ORDER_STATUS_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E8E8' }} />
            </PieChart>
          </ResponsiveContainer>
          </div>
          <ul className="grid grid-cols-2 gap-1 mt-2" aria-label="Order status legend">
            {ORDER_STATUS_DATA.map((entry) => (
              <li key={entry.name} className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                {entry.name} ({entry.value})
              </li>
            ))}
          </ul>
        </ProCard>
      </div>

      {/* Recent Orders */}
      <ProCard title="Recent Sales Orders">
        <div className="overflow-x-auto"><table className="w-full text-sm" aria-label="Recent sales orders">
          <thead>
            <tr className="border-b border-neutral-50 bg-neutral-50">
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400">Reference</th>
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400">Customer</th>
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400">Date</th>
              <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-neutral-400">Total</th>
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {salesLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-neutral-50">
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton active title={{ style: { width: '100%', height: 16 } }} paragraph={false} />
                  </td>
                </tr>
              ))
            ) : recentOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No orders yet</td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-sm text-brand-600">{order.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{order.partner_name}</td>
                  <td className="px-4 py-3 text-neutral-400">{formatDate(order.date_order)}</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-700">
                    {new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).format(
                      parseFloat(order.amount_total),
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.state === 'DONE' ? 'bg-green-100 text-green-700'
                      : order.state === 'SALE' ? 'bg-brand-50 text-brand-700'
                      : order.state === 'CANCELLED' ? 'bg-neutral-100 text-neutral-500'
                      : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.state}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>
      </ProCard>
    </PageShell>
  )
}
