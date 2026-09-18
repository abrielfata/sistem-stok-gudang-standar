import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/Toast';
import { 
  Building2, 
  Bell, 
  Sliders, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Hash 
} from 'lucide-react';

interface AppSettings {
  companyName: string;
  warehouseName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxId: string;
  
  // Stock & Inventory
  defaultMinStock: number;
  enableLowStockAlert: boolean;
  enableEmailNotification: boolean;
  grnPrefix: string;
  soPrefix: string;
  
  // Preferences
  dateFormat: string;
  currency: string;
  itemsPerPage: number;
  theme: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'PT Logistik Utama Standar',
  warehouseName: 'Gudang Pusat Jakarta',
  companyAddress: 'Jl. Industri Gudang No. 88, Jakarta Barat',
  companyPhone: '021-5558900',
  companyEmail: 'info@gudangstandar.co.id',
  taxId: '01.234.567.8-012.000',
  
  defaultMinStock: 10,
  enableLowStockAlert: true,
  enableEmailNotification: false,
  grnPrefix: 'GRN',
  soPrefix: 'SO',
  
  dateFormat: 'DD/MM/YYYY',
  currency: 'IDR (Rp)',
  itemsPerPage: 10,
  theme: 'dark',
};

export const SettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'company' | 'inventory' | 'preferences'>('company');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (err) {
        console.error('Failed to parse saved settings', err);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('app_settings', JSON.stringify(settings));
    setIsSaved(true);
    addToast({ type: 'success', message: 'Pengaturan sistem berhasil disimpan!' });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan semua pengaturan ke standar awal?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('app_settings');
      addToast({ type: 'info', message: 'Pengaturan dikembalikan ke standar awal.' });
    }
  };

  return (
    <div className="max-w-[900px] flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-text-primary uppercase">
              PENGATURAN SISTEM
            </h1>
            <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent uppercase font-semibold">
              SYSTEM CONFIG
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Kelola identitas gudang, preferensi stok, dan konfigurasi tampilan aplikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleReset} 
            className="gap-1.5 font-mono text-xs"
          >
            <RotateCcw size={14} /> RESET DEFAULT
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleSave} 
            className="gap-1.5 font-mono text-xs"
          >
            {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {isSaved ? 'TERSIMPAN' : 'SIMPAN PENGATURAN'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 bg-surface-subtle/50 p-1 rounded-sm">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-sm transition-colors ${
            activeTab === 'company'
              ? 'bg-surface text-accent border border-border shadow-sm font-bold'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          <Building2 size={14} /> PROFIL PERUSAHAAN & GUDANG
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-sm transition-colors ${
            activeTab === 'inventory'
              ? 'bg-surface text-accent border border-border shadow-sm font-bold'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          <Bell size={14} /> PARAMETER STOK & PREFIX
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-sm transition-colors ${
            activeTab === 'preferences'
              ? 'bg-surface text-accent border border-border shadow-sm font-bold'
              : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
          }`}
        >
          <Sliders size={14} /> TAMPILAN & FORMAT
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* TAB 1: COMPANY INFO */}
        {activeTab === 'company' && (
          <div className="bg-surface border border-border rounded-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Building2 size={15} className="text-accent" /> IDENTITAS PERUSAHAAN & GUDANG UTAMA
              </h2>
              <span className="text-[11px] font-mono text-text-muted">ID: PERUSAHAAN-01</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Nama Perusahaan / PT</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Nama Gudang Utama</label>
                <input
                  type="text"
                  value={settings.warehouseName}
                  onChange={(e) => setSettings({ ...settings, warehouseName: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-text-secondary">Alamat Lengkap</label>
                <input
                  type="text"
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Telepon Kontak</label>
                <input
                  type="text"
                  value={settings.companyPhone}
                  onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Email Resmi</label>
                <input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-text-secondary">Nomor NPWP / Tax ID</label>
                <input
                  type="text"
                  value={settings.taxId}
                  onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & PREFIX */}
        {activeTab === 'inventory' && (
          <div className="bg-surface border border-border rounded-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Bell size={15} className="text-accent" /> PERINGATAN STOK & PREFIX DOKUMEN
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Stok Minimum Default (Item Baru)</label>
                  <input
                    type="number"
                    min={0}
                    value={settings.defaultMinStock}
                    onChange={(e) => setSettings({ ...settings, defaultMinStock: Number(e.target.value) })}
                    className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <span className="text-[11px] text-text-muted">Nilai awal ambang batas stok kritis saat membuat produk baru.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Format Prefix Nomor GRN</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 h-9 flex items-center bg-surface border border-border font-mono text-xs text-text-muted rounded-sm">
                      <Hash size={13} />
                    </span>
                    <input
                      type="text"
                      value={settings.grnPrefix}
                      onChange={(e) => setSettings({ ...settings, grnPrefix: e.target.value.toUpperCase() })}
                      className="h-9 px-3 w-full bg-surface-subtle border border-border rounded-sm text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Format Prefix Nomor SO</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 h-9 flex items-center bg-surface border border-border font-mono text-xs text-text-muted rounded-sm">
                      <Hash size={13} />
                    </span>
                    <input
                      type="text"
                      value={settings.soPrefix}
                      onChange={(e) => setSettings({ ...settings, soPrefix: e.target.value.toUpperCase() })}
                      className="h-9 px-3 w-full bg-surface-subtle border border-border rounded-sm text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.enableLowStockAlert}
                    onChange={(e) => setSettings({ ...settings, enableLowStockAlert: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-surface"
                  />
                  <div>
                    <span className="text-xs font-medium text-text-primary block">Tampilkan Indikator Warning Stok Kritis</span>
                    <span className="text-[11px] text-text-muted block">Beri sorotan warna merah/kuning pada barang yang mendekati atau di bawah stok minimum.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.enableEmailNotification}
                    onChange={(e) => setSettings({ ...settings, enableEmailNotification: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-surface"
                  />
                  <div>
                    <span className="text-xs font-medium text-text-primary block">Kirim Rekapitulasi Audit Log via Email</span>
                    <span className="text-[11px] text-text-muted block">Mengirim ringkasan transaksi harian secara otomatis ke email admin.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PREFERENCES & FORMATS */}
        {activeTab === 'preferences' && (
          <div className="bg-surface border border-border rounded-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Globe size={15} className="text-accent" /> TAMPILAN, FORMAT TANGGAL & MATA UANG
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Format Tanggal</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Contoh: 18/09/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (Contoh: 2026-09-18)</option>
                  <option value="DD MMM YYYY">DD MMM YYYY (Contoh: 18 Sep 2026)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Mata Uang Default</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="IDR (Rp)">Rupiah (IDR - Rp)</option>
                  <option value="USD ($)">US Dollar (USD - $)</option>
                  <option value="EUR (€)">Euro (EUR - €)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Baris Tabel per Halaman</label>
                <select
                  value={settings.itemsPerPage}
                  onChange={(e) => setSettings({ ...settings, itemsPerPage: Number(e.target.value) })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value={10}>10 Baris / Halaman</option>
                  <option value={25}>25 Baris / Halaman</option>
                  <option value={50}>50 Baris / Halaman</option>
                  <option value={100}>100 Baris / Halaman</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Tema Visual Utama</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="h-9 px-3 bg-surface-subtle border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="dark">Industrial Dark Mode (Default System)</option>
                  <option value="light">Clean Light Mode</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck size={16} className="text-accent" />
            <span>Semua konfigurasi tersimpan aman secara lokal di browser Anda.</span>
          </div>

          <Button type="submit" variant="primary" className="gap-1.5 font-mono text-xs">
            {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {isSaved ? 'TERSIMPAN!' : 'SIMPAN SEMUA PERUBAHAN'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

