import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ToastContainer } from './components/ui/Toast';

// Lazy Loaded Pages
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage || (m as any).default })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage || (m as any).default })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage || (m as any).default })));

// Master Data
const ProductFormPage = lazy(() => import('./pages/master/ProductFormPage').then(m => ({ default: m.ProductFormPage || (m as any).default })));
const CategoriesPage = lazy(() => import('./pages/master/CategoriesPage').then(m => ({ default: m.CategoriesPage || (m as any).default })));
const UomsPage = lazy(() => import('./pages/master/UomsPage').then(m => ({ default: m.UomsPage || (m as any).default })));
const WarehousesPage = lazy(() => import('./pages/master/WarehousesPage').then(m => ({ default: m.WarehousesPage || (m as any).default })));
const SuppliersPage = lazy(() => import('./pages/master/SuppliersPage').then(m => ({ default: m.SuppliersPage || (m as any).default })));
const CustomersPage = lazy(() => import('./pages/master/CustomersPage').then(m => ({ default: m.CustomersPage || (m as any).default })));

// Inventory
const StockListPage = lazy(() => import('./pages/inventory/StockListPage').then(m => ({ default: m.StockListPage || (m as any).default })));
const StockCardPage = lazy(() => import('./pages/inventory/StockCardPage').then(m => ({ default: m.StockCardPage || (m as any).default })));

// Transactions
const InboundListPage = lazy(() => import('./pages/transactions/InboundListPage').then(m => ({ default: m.InboundListPage || (m as any).default })));
const InboundDetailPage = lazy(() => import('./pages/transactions/InboundDetailPage').then(m => ({ default: m.InboundDetailPage || (m as any).default })));
const InboundFormPage = lazy(() => import('./pages/transactions/InboundFormPage').then(m => ({ default: m.InboundFormPage || (m as any).default })));
const OutboundListPage = lazy(() => import('./pages/transactions/OutboundListPage').then(m => ({ default: m.OutboundListPage || (m as any).default })));
const OutboundFormPage = lazy(() => import('./pages/transactions/OutboundFormPage').then(m => ({ default: m.OutboundFormPage || (m as any).default })));
const OutboundDetailPage = lazy(() => import('./pages/transactions/OutboundDetailPage').then(m => ({ default: m.OutboundDetailPage || (m as any).default })));

// System
const AuditLogPage = lazy(() => import('./pages/system/AuditLogPage').then(m => ({ default: m.AuditLogPage || (m as any).default })));
const SettingsPage = lazy(() => import('./pages/system/SettingsPage').then(m => ({ default: m.SettingsPage || (m as any).default })));

const PageLoader: React.FC = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
      <span>MEMUAT MODUL...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            
            {/* Master Data */}
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="uoms" element={<UomsPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            
            {/* Inventory */}
            <Route path="inventory/stocks" element={<StockListPage />} />
            <Route path="inventory/kartu-stok" element={<StockCardPage />} />

            {/* Transaksi */}
            <Route path="inbound" element={<InboundListPage />} />
            <Route path="inbound/new" element={<InboundFormPage />} />
            <Route path="inbound/:id" element={<InboundDetailPage />} />
            <Route path="outbound" element={<OutboundListPage />} />
            <Route path="outbound/new" element={<OutboundFormPage />} />
            <Route path="outbound/:id" element={<OutboundDetailPage />} />
            
            {/* Sistem */}
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Not Found */}
            <Route path="*" element={
              <div className="p-4 flex flex-col items-center py-20">
                <h1 className="text-xl font-bold text-status-danger font-mono">[404] HALAMAN TIDAK DITEMUKAN</h1>
                <p className="text-text-muted mt-2">Rute yang Anda tuju belum terdaftar di sistem.</p>
              </div>
            } />
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
