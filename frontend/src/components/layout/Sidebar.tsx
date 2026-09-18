import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Package, Tags, Scale, MapPin, Truck, Users, 
  Archive, FileStack, 
  ArrowDownToLine, ArrowUpFromLine, 
  History, Settings, LogOut 
} from 'lucide-react';
import { useToast } from '../ui/Toast';

const MENU_GROUPS = [
  {
    label: null,
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' }
    ]
  },
  {
    label: 'Master Data',
    items: [
      { label: 'Barang', icon: Package, path: '/products' },
      { label: 'Kategori', icon: Tags, path: '/categories' },
      { label: 'Satuan', icon: Scale, path: '/uoms' },
      { label: 'Gudang', icon: MapPin, path: '/warehouses' },
      { label: 'Supplier', icon: Truck, path: '/suppliers' },
      { label: 'Customer', icon: Users, path: '/customers' },
    ]
  },
  {
    label: 'Inventory',
    items: [
      { label: 'Stok Saat Ini', icon: Archive, path: '/inventory/stocks' },
      { label: 'Kartu Stok', icon: FileStack, path: '/inventory/kartu-stok' },
    ]
  },
  {
    label: 'Transaksi',
    items: [
      { label: 'Inbound (GRN)', icon: ArrowDownToLine, path: '/inbound' },
      { label: 'Outbound (SO)', icon: ArrowUpFromLine, path: '/outbound' },
    ]
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Audit Log', icon: History, path: '/audit' },
      { label: 'Pengaturan', icon: Settings, path: '/settings' },
    ]
  }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const user = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const userEmail = user?.email || 'admin@perusahaan.com';
  const userRole = user?.role ? `${user.role} Gudang` : 'Admin Gudang';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    addToast({ type: 'success', message: 'Anda telah berhasil logout.' });
    navigate('/login');
  };

  return (
    <aside className="w-[248px] flex-shrink-0 h-screen bg-surface-subtle border-r border-border flex flex-col hidden md:flex">
      {/* Logo Area */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="font-bold text-lg tracking-tight uppercase flex items-baseline gap-1.5 text-text-primary">
          WMS CONTROL
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-5">
        {MENU_GROUPS.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {group.label && (
              <div className="px-3 text-xs uppercase font-semibold text-text-muted tracking-wider mb-1">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 h-9 px-3 rounded transition-colors text-sm",
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-800 text-text-primary font-medium shadow-none" 
                      : "text-text-secondary hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-text-primary font-normal"
                  )}
                >
                  <item.icon size={17} strokeWidth={1.75} className={isActive ? "text-text-primary" : "text-text-muted"} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / User Info */}
      <div className="p-3.5 border-t border-border flex items-center justify-between bg-surface-subtle/50">
        <div className="flex flex-col truncate">
          <span className="text-sm font-semibold text-text-primary truncate">{userEmail}</span>
          <span className="text-xs text-text-muted">{userRole}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger/10 rounded transition-colors" 
          title="Logout"
        >
          <LogOut size={16} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
};