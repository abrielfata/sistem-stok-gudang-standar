import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';

// Lazy Loaded Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

// Master Data
const ProductFormPage = lazy(() => import('./pages/master/ProductFormPage'));
const CategoriesPage = lazy(() => import('./pages/master/CategoriesPage'));
const UomsPage = lazy(() => import('./pages/master/UomsPage'));
const WarehousesPage = lazy(() => import('./pages/master/WarehousesPage'));
const SuppliersPage = lazy(() => import('./pages/master/SuppliersPage'));
const CustomersPage = lazy(() => import('./pages/master/CustomersPage'));

// Inventory
const StockListPage = lazy(() => import('./pages/inventory/StockListPage'));
const StockCardPage = lazy(() => import('./pages/inventory/StockCardPage'));

// Transactions
const InboundListPage = lazy(() => import('./pages/transactions/InboundListPage'));
const InboundDetailPage = lazy(() => import('./pages/transactions/InboundDetailPage'));
const InboundFormPage = lazy(() => import('./pages/transactions/InboundFormPage'));
const OutboundListPage = lazy(() => import('./pages/transactions/OutboundListPage'));
const OutboundFormPage = lazy(() => import('./pages/transactions/OutboundFormPage'));
const OutboundDetailPage = lazy(() => import('./pages/transactions/OutboundDetailPage'));

// System
const AuditLogPage = lazy(() => import('./pages/system/AuditLogPage'));
const SettingsPage = lazy(() => import('./pages/system/SettingsPage'));

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
          
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
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

            {/* Redirects */}
            <Route path="dashboard" element={<Navigate to="/" replace />} />

            {/* Not Found */}
            <Route path="*" element={
              <div className="p-4 flex flex-col items-center py-20">
                <h1 className="text-xl font-bold text-status-danger font-mono">[404] HALAMAN TIDAK DITEMUKAN</h1>
                <p className="text-text-muted mt-2">Rute yang Anda tuju belum terdaftar di sistem.</p>
              </div>
            } />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
