import React, { useState, useEffect } from 'react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { LowStockList } from '../components/dashboard/LowStockList';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { Package, Archive, DollarSign, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { api } from '../lib/api';

export const DashboardPage: React.FC = () => {
  const [kpiData, setKpiData] = useState({
    totalSku: 0,
    totalStock: 0,
    stockValue: 0,
    inboundToday: 0,
    outboundToday: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentInbound, setRecentInbound] = useState<any[]>([]);
  const [recentOutbound, setRecentOutbound] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [kpiRes, actRes, inRes, outRes, prodRes] = await Promise.all([
          api.dashboard.getKpi().catch(() => null),
          api.dashboard.getActivity(7).catch(() => null),
          api.inbound.getAll().catch(() => null),
          api.outbound.getAll().catch(() => null),
          api.products.getAll().catch(() => null),
        ]);

        if (kpiRes?.success && kpiRes.data) {
          setKpiData(kpiRes.data);
        }

        if (actRes?.success && actRes.data) {
          setChartData(actRes.data);
        }

        if (inRes?.success && inRes.data) {
          const mappedIn = inRes.data.slice(0, 5).map((item: any) => ({
            id: item.id,
            number: item.grnNumber,
            date: item.createdAt,
            status: item.status,
          }));
          setRecentInbound(mappedIn);
        }

        if (outRes?.success && outRes.data) {
          const mappedOut = outRes.data.slice(0, 5).map((item: any) => ({
            id: item.id,
            number: item.soNumber,
            date: item.createdAt,
            status: item.status,
          }));
          setRecentOutbound(mappedOut);
        }

        if (prodRes?.success && prodRes.data) {
          const lowStock = prodRes.data
            .filter((p: any) => (p.stock || 0) <= (p.minStock || 0))
            .map((p: any) => ({
              sku: p.sku,
              name: p.name,
              stock: p.stock || 0,
              minStock: p.minStock || 0,
            }));
          setLowStockItems(lowStock);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      }
    }

    loadDashboardData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Ringkasan Operasional</h1>
          <p className="page-subtitle mt-0.5">Pemantauan metrik inventaris dan throughput gudang secara waktu-nyata dari Database.</p>
        </div>
      </div>

      {/* ROW 1: 5 KPI Cards (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <KpiCard
          label="TOTAL SKU"
          value={kpiData.totalSku}
          delta="Real-Time"
          deltaType="increase"
          icon={Package}
        />
        <KpiCard
          label="TOTAL STOK"
          value={kpiData.totalStock.toLocaleString('id-ID')}
          delta="Real-Time"
          deltaType="increase"
          icon={Archive}
        />
        <KpiCard
          label="NILAI STOK (RP)"
          value={formatRupiah(kpiData.stockValue)}
          delta="Real-Time"
          deltaType="increase"
          icon={DollarSign}
        />
        <KpiCard
          label="INBOUND HARI INI"
          value={kpiData.inboundToday}
          delta="Hari Ini"
          deltaType="increase"
          icon={ArrowDownToLine}
        />
        <KpiCard
          label="OUTBOUND HARI INI"
          value={kpiData.outboundToday}
          delta="Hari Ini"
          deltaType="increase"
          icon={ArrowUpFromLine}
        />
      </div>

      {/* ROW 2: Chart (8 cols) + Low Stock Alert (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-8">
          <ActivityChart data={chartData} />
        </div>
        <div className="lg:col-span-4">
          <LowStockList items={lowStockItems} />
        </div>
      </div>

      {/* ROW 3: Recent Transactions (2 tables) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <RecentTransactions
          title="INBOUND TERAKHIR"
          items={recentInbound}
          linkTo="/inbound"
        />
        <RecentTransactions
          title="OUTBOUND TERAKHIR"
          items={recentOutbound}
          linkTo="/outbound"
        />
      </div>
    </div>
  );
};

export default DashboardPage;
