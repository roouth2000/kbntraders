import { useState, useMemo } from 'react';
import {
  Scale,
  Box,
  Download,
  FileDown,
  Plus,
  Eye,
  Edit2,
  Trash2, 
  X,
  Search,
  Check,
  AlertTriangle,
  Layers,
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Invoice, PaymentRecord, Customer, ProduceVariety } from '../../types';
import { formatCurrency, downloadCSV } from '../../utils/formatters';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface ReportsViewProps {
  invoices: Invoice[];
  payments: PaymentRecord[];
  customers: Customer[];
  varieties: ProduceVariety[];
  onAddVariety?: (data: {
    fruit?: string;
    origin?: string;
    size_count?: string;
    code: string;
    name: string;
    default_unit: 'Kg' | 'Box';
    default_rate_kg: number;
    default_rate_box: number;
  }) => Promise<any>;
  onUpdateVariety?: (id: string, updatedFields: Partial<ProduceVariety>) => Promise<any>;
  onDeleteVariety?: (id: string) => Promise<any>;
}

export function ReportsView({
  invoices,
  customers,
  varieties,
  onAddVariety,
  onUpdateVariety,
  onDeleteVariety,
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'performance'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFruitFilter, setSelectedFruitFilter] = useState<'ALL' | 'Apple' | 'Malta' | 'Other'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingVariety, setViewingVariety] = useState<ProduceVariety | null>(null);
  const [editingVariety, setEditingVariety] = useState<ProduceVariety | null>(null);
  const [deletingVariety, setDeletingVariety] = useState<ProduceVariety | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Add Variety
  const [newFruit, setNewFruit] = useState<'Apple' | 'Malta' | 'Other'>('Apple');
  const [newOrigin, setNewOrigin] = useState<string>('Indian');
  const [newSizeCount, setNewSizeCount] = useState<string>('135 Count');
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState<'Kg' | 'Box'>('Box');
  const [newRateKg, setNewRateKg] = useState<string>('95');
  const [newRateBox, setNewRateBox] = useState<string>('1850');

  // Form states for Edit Variety
  const [editFruit, setEditFruit] = useState('Apple');
  const [editOrigin, setEditOrigin] = useState('Indian');
  const [editSizeCount, setEditSizeCount] = useState('');
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState<'Kg' | 'Box'>('Kg');
  const [editRateKg, setEditRateKg] = useState<string>('0');
  const [editRateBox, setEditRateBox] = useState<string>('0');
  const [editIsActive, setEditIsActive] = useState(true);

  // Variety-wise Sales Aggregate
  const varietyStatsMap = useMemo(() => {
    const stats: Record<
      string,
      { code: string; name: string; totalKg: number; totalBoxes: number; revenue: number; billsCount: number; invoices: any[] }
    > = {};

    varieties.forEach((v) => {
      stats[v.code] = {
        code: v.code,
        name: v.name,
        totalKg: 0,
        totalBoxes: 0,
        revenue: 0,
        billsCount: 0,
        invoices: [],
      };
    });

    invoices.forEach((inv) => {
      const items = (inv.items || (inv as any).produceItems || []) as any[];
      items.forEach((it) => {
        const code = it.variety || 'A1';
        if (!stats[code]) {
          stats[code] = { code, name: code, totalKg: 0, totalBoxes: 0, revenue: 0, billsCount: 0, invoices: [] };
        }
        stats[code].billsCount += 1;
        stats[code].revenue += Number(it.amount || 0);
        stats[code].invoices.push({
          invoiceNumber: inv.invoiceNumber,
          date: inv.date,
          customerName: inv.partyName || (inv as any).customer_name || 'Customer',
          amount: it.amount,
          unit: it.unit,
          qty: it.unit === 'Box' ? `${it.boxes || 0} Boxes` : `${it.weight_kg || it.boxes || 0} Kg`,
          rate: it.rate,
        });

        if (it.unit === 'Box') {
          stats[code].totalBoxes += Number(it.boxes || 0);
          if (it.weight_kg) stats[code].totalKg += Number(it.weight_kg || 0);
        } else {
          stats[code].totalKg += Number(it.weight_kg || it.boxes || 0);
        }
      });
    });

    return stats;
  }, [varieties, invoices]);

  const totalSalesAll = useMemo(() => {
    return Object.values(varietyStatsMap).reduce((sum, v) => sum + v.revenue, 0);
  }, [varietyStatsMap]);

  // Fruit count badges
  const fruitCounts = useMemo(() => {
    let apple = 0;
    let malta = 0;
    let other = 0;
    varieties.forEach((v) => {
      const f = (v.fruit || 'Apple').toLowerCase();
      if (f.includes('apple')) apple++;
      else if (f.includes('malta')) malta++;
      else other++;
    });
    return { all: varieties.length, apple, malta, other };
  }, [varieties]);

  // Filter varieties by fruit and search
  const filteredVarieties = useMemo(() => {
    return varieties.filter((v) => {
      if (selectedFruitFilter !== 'ALL') {
        const f = (v.fruit || 'Apple').toLowerCase();
        if (selectedFruitFilter === 'Apple' && !f.includes('apple')) return false;
        if (selectedFruitFilter === 'Malta' && !f.includes('malta')) return false;
        if (selectedFruitFilter === 'Other' && (f.includes('apple') || f.includes('malta'))) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.code.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        (v.fruit && v.fruit.toLowerCase().includes(q)) ||
        (v.origin && v.origin.toLowerCase().includes(q)) ||
        (v.size_count && v.size_count.toLowerCase().includes(q))
      );
    });
  }, [varieties, selectedFruitFilter, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (v: ProduceVariety) => {
    setEditingVariety(v);
    setEditFruit(v.fruit || 'Apple');
    setEditOrigin(v.origin || 'Indian');
    setEditSizeCount(v.size_count || '');
    setEditName(v.name);
    setEditUnit(v.default_unit || 'Kg');
    setEditRateKg(String(v.default_rate_kg || '0'));
    setEditRateBox(String(v.default_rate_box || '0'));
    setEditIsActive(v.is_active !== false);
  };

  // Open Add Modal with smart preset
  const handleOpenAdd = (presetFruit: 'Apple' | 'Malta' = 'Apple') => {
    setNewFruit(presetFruit);
    if (presetFruit === 'Apple') {
      setNewOrigin('Indian');
      setNewSizeCount('135 Count');
      setNewCode('APL-IND-135');
      setNewName('Indian Apple 135 Count');
      setNewUnit('Box');
      setNewRateKg('95');
      setNewRateBox('1850');
    } else {
      setNewOrigin('Indian');
      setNewSizeCount('88 Count');
      setNewCode('MLT-IND-88');
      setNewName('Malta Indian 88 Count');
      setNewUnit('Box');
      setNewRateKg('65');
      setNewRateBox('1300');
    }
    setIsAddModalOpen(true);
  };

  // Preset quick click in modal
  const handleApplyAddPreset = (fruit: 'Apple' | 'Malta', origin: string, sizeCount: string, rateKg: number, rateBox: number) => {
    setNewFruit(fruit);
    setNewOrigin(origin);
    setNewSizeCount(sizeCount);
    const fruitPrefix = fruit === 'Apple' ? 'APL' : 'MLT';
    const orgShort = origin.slice(0, 3).toUpperCase();
    const countClean = sizeCount.replace(/[^0-9a-zA-Z]/g, '-').replace(/-+/g, '-').replace(/-$/, '').toUpperCase();
    setNewCode(`${fruitPrefix}-${orgShort}-${countClean}`);
    setNewName(`${origin} ${fruit} ${sizeCount}`);
    setNewUnit('Box');
    setNewRateKg(String(rateKg));
    setNewRateBox(String(rateBox));
  };

  // Submit Add Variety
  const handleCreateVariety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      toast.error('Variety code and name are required.');
      return;
    }

    const cleanCode = newCode.trim().toUpperCase();
    if (varieties.some((v) => v.code.toUpperCase() === cleanCode)) {
      toast.error(`Variety with code "${cleanCode}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onAddVariety) {
        await onAddVariety({
          fruit: newFruit,
          origin: newOrigin.trim(),
          size_count: newSizeCount.trim(),
          code: cleanCode,
          name: newName.trim(),
          default_unit: newUnit,
          default_rate_kg: Number(newRateKg) || 0,
          default_rate_box: Number(newRateBox) || 0,
        });
      }
      setIsAddModalOpen(false);
      setNewCode('');
      setNewName('');
      setNewRateKg('40');
      setNewRateBox('800');
    } catch {
      toast.error('Failed to create variety.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Variety
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariety) return;

    if (!editName.trim()) {
      toast.error('Variety name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onUpdateVariety) {
        await onUpdateVariety(editingVariety.id, {
          fruit: editFruit,
          origin: editOrigin.trim(),
          size_count: editSizeCount.trim(),
          name: editName.trim(),
          default_unit: editUnit,
          default_rate_kg: Number(editRateKg) || 0,
          default_rate_box: Number(editRateBox) || 0,
          is_active: editIsActive,
        });
      }
      setEditingVariety(null);
    } catch {
      toast.error('Failed to update variety.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Variety
  const handleConfirmDelete = async () => {
    if (!deletingVariety) return;
    setIsSubmitting(true);
    try {
      if (onDeleteVariety) {
        await onDeleteVariety(deletingVariety.id);
      }
      setDeletingVariety(null);
    } catch {
      toast.error('Failed to delete variety.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excel / CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Fruit / Product',
      'Origin / Region',
      'Size / Count',
      'Variety Code',
      'Variety Name',
      'Default Unit',
      'Default Rate/Kg (₹)',
      'Default Rate/Box (₹)',
      'Boxes Sold',
      'Kg Sold',
      'Total Revenue (₹)',
      'Status',
    ];
    const rows = varieties.map((v) => {
      const stats = varietyStatsMap[v.code] || { totalBoxes: 0, totalKg: 0, revenue: 0 };
      return [
        v.fruit || 'Apple',
        v.origin || 'Indian',
        v.size_count || 'Standard',
        v.code,
        v.name,
        v.default_unit,
        v.default_rate_kg,
        v.default_rate_box,
        stats.totalBoxes,
        stats.totalKg,
        stats.revenue,
        v.is_active !== false ? 'Active' : 'Inactive',
      ];
    });
    downloadCSV('KBN_Traders_Produce_Varieties', headers, rows);
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Teal Header
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('KBN TRADERS - PRODUCE VARIETY CATALOG & RATES', 14, 15);

    let y = 35;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Produce Varieties, Origins & Count Rates (Apple, Malta, Core)', 14, y);

    y += 8;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text('CODE', 18, y + 5);
    doc.text('FRUIT & ORIGIN', 46, y + 5);
    doc.text('VARIETY / COUNT', 82, y + 5);
    doc.text('DEF. UNIT', 125, y + 5);
    doc.text('RATE/KG (₹)', 145, y + 5, { align: 'right' });
    doc.text('RATE/BOX (₹)', 170, y + 5, { align: 'right' });
    doc.text('REVENUE (₹)', pageWidth - 18, y + 5, { align: 'right' });

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    varieties.forEach((v, idx) => {
      const stats = varietyStatsMap[v.code] || { revenue: 0 };
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      }

      doc.setTextColor(13, 148, 136);
      doc.setFont('helvetica', 'bold');
      doc.text(v.code, 18, y + 4.5);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(`${v.fruit || 'Apple'} (${v.origin || 'Indian'})`, 46, y + 4.5);
      doc.text(v.size_count ? `${v.name} [${v.size_count}]` : v.name, 82, y + 4.5);

      doc.text(v.default_unit || 'Kg', 125, y + 4.5);
      doc.text(`₹${v.default_rate_kg}`, 145, y + 4.5, { align: 'right' });
      doc.text(`₹${v.default_rate_box}`, 170, y + 4.5, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(stats.revenue), pageWidth - 18, y + 4.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 6.5, pageWidth - 14, y + 6.5);
      y += 6.5;
    });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated electronically by KBN Traders Mandi Suite', 14, pageHeight - 9);
    doc.text('Page 1 of 1', pageWidth - 14, pageHeight - 9, { align: 'right' });

    doc.save('KBN_Traders_Produce_Varieties.pdf');
  };

  const getVarietyBadgeStyle = (code: string) => {
    if (code.startsWith('APL-IND')) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (code.startsWith('APL-GRN')) return 'bg-lime-50 text-lime-800 border-lime-300';
    if (code.startsWith('APL-TRK') || code.startsWith('APL-POL')) return 'bg-red-50 text-red-800 border-red-300';
    if (code.startsWith('MLT')) return 'bg-amber-50 text-amber-800 border-amber-300';
    switch (code) {
      case 'A1':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'A2':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'A3':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'SPL':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Loosu':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
    }
  };

  const getOriginBadge = (origin?: string) => {
    switch ((origin || '').toLowerCase()) {
      case 'indian':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'turkey':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'poland':
        return 'bg-pink-50 text-pink-800 border-pink-200';
      case 'egypt':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'australia':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'imported':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getFruitIcon = (fruit?: string) => {
    const f = (fruit || '').toLowerCase();
    if (f.includes('malta')) return '🍊';
    if (f.includes('apple')) return '🍎';
    return '📦';
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Fruit & Produce Varieties
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {varieties.length} Grades
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage fruit varieties, country origins, and caliber counts (Indian Apple 135/100/90/200/250, Turkey, Poland, Malta 80/88) with dedicated Box & Kg rates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 text-xs font-semibold py-2 shadow-xs hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Excel / CSV</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            className="bg-white border border-slate-200 text-xs font-semibold py-2 shadow-xs hover:bg-slate-50"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span>Export PDF</span>
          </Button>

          <div className="inline-flex rounded-lg shadow-xs">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenAdd('Apple')}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold py-2 shadow-sm flex items-center gap-1.5 rounded-r-none"
            >
              <Plus className="w-4 h-4" />
              <span>🍎 Add Apple</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenAdd('Malta')}
              className="bg-[#0b8277] hover:bg-[#0a6c63] text-white text-xs font-bold py-2 shadow-sm flex items-center gap-1.5 rounded-l-none border-l border-teal-600"
            >
              <Plus className="w-4 h-4" />
              <span>🍊 Add Malta</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Fruit Filter Chips & Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs">
        {/* Fruit Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedFruitFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedFruitFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Produce</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedFruitFilter === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {fruitCounts.all}
            </span>
          </button>

          <button
            onClick={() => setSelectedFruitFilter('Apple')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedFruitFilter === 'Apple'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <span>🍎 Apple Varieties</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedFruitFilter === 'Apple' ? 'bg-red-700 text-white' : 'bg-red-200 text-red-900'
            }`}>
              {fruitCounts.apple}
            </span>
          </button>

          <button
            onClick={() => setSelectedFruitFilter('Malta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedFruitFilter === 'Malta'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>🍊 Malta Varieties</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedFruitFilter === 'Malta' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
            }`}>
              {fruitCounts.malta}
            </span>
          </button>

          {fruitCounts.other > 0 && (
            <button
              onClick={() => setSelectedFruitFilter('Other')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedFruitFilter === 'Other'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span>📦 Other</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedFruitFilter === 'Other' ? 'bg-purple-700 text-white' : 'bg-purple-200 text-purple-900'
              }`}>
                {fruitCounts.other}
              </span>
            </button>
          )}
        </div>

        {/* View Switcher & Search Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === 'performance'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales
            </button>
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by count, origin, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: Variety Catalog & Rates with View / Edit / Delete */}
      {activeTab === 'catalog' && (
        <Card className="overflow-hidden border border-slate-200/90 shadow-xs">
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Produce Directory & Dual-Rate Catalog (Kg & Box Rates)
              </h2>
              <p className="text-xs text-slate-500">
                Indian & Imported apples, Turkey/Poland red apples, and Indian/Australia/Egypt Malta with specific caliber counts.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Showing {filteredVarieties.length} of {varieties.length} varieties
            </span>
          </div>

          {/* Mobile Variety Cards (md:hidden) */}
          <div className="md:hidden p-3 space-y-3 bg-slate-50/50">
            {filteredVarieties.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No produce varieties found matching "{searchQuery}".
              </div>
            ) : (
              filteredVarieties.map((v) => {
                const stats = varietyStatsMap[v.code] || { revenue: 0, totalBoxes: 0, totalKg: 0 };
                return (
                  <div key={v.id} className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" title={v.fruit || 'Apple'}>
                          {getFruitIcon(v.fruit)}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md border font-mono text-xs font-bold ${getVarietyBadgeStyle(v.code)}`}>
                              {v.code}
                            </span>
                            {v.origin && (
                              <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${getOriginBadge(v.origin)}`}>
                                {v.origin}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 text-xs mt-1">{v.name}</p>
                        </div>
                      </div>

                      {v.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                          <XCircle className="w-2.5 h-2.5 text-slate-400" />
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Count</span>
                        <span className="font-mono font-bold text-slate-800">{v.size_count || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rate/Kg</span>
                        <span className="font-mono font-bold text-slate-800">₹{v.default_rate_kg}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rate/Box</span>
                        <span className="font-mono font-bold text-teal-700">₹{v.default_rate_box}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500">
                        Revenue: <span className="font-mono font-bold text-slate-800">{formatCurrency(stats.revenue)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          title="View Variety Details"
                          onClick={() => setViewingVariety(v)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-teal-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Variety Rates"
                          onClick={() => handleOpenEdit(v)}
                          className="p-2 rounded-lg hover:bg-teal-50 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Variety"
                          onClick={() => setDeletingVariety(v)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop & Tablet Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Fruit & Code</th>
                  <th className="py-3 px-3">Origin & Variety Name</th>
                  <th className="py-3 px-3">Size / Count</th>
                  <th className="py-3 px-3">Default Unit</th>
                  <th className="py-3 px-3 text-right">Default Rate / Kg</th>
                  <th className="py-3 px-3 text-right">Default Rate / Box</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredVarieties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No produce varieties found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredVarieties.map((v) => {
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Fruit & Code */}
                        <td className="py-3 px-4 font-bold font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-base" title={v.fruit || 'Apple'}>
                              {getFruitIcon(v.fruit)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md border font-mono text-xs font-bold ${getVarietyBadgeStyle(v.code)}`}>
                              {v.code}
                            </span>
                          </div>
                        </td>

                        {/* Origin & Variety Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {v.origin && (
                              <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${getOriginBadge(v.origin)}`}>
                                {v.origin}
                              </span>
                            )}
                            <p className="font-bold text-slate-900 text-xs">{v.name}</p>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {v.is_custom ? 'Custom Produce Grade' : 'Standard Mandi Grade'}
                          </span>
                        </td>

                        {/* Size / Count */}
                        <td className="py-3 px-3">
                          {v.size_count ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-[11px] border border-slate-200">
                              {v.size_count}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>

                        {/* Default Unit */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {v.default_unit === 'Box' ? (
                              <>
                                <Box className="w-3 h-3 text-amber-600" />
                                <span>Box</span>
                              </>
                            ) : (
                              <>
                                <Scale className="w-3 h-3 text-teal-600" />
                                <span>Kilogram (Kg)</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Default Rate / Kg */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 text-xs">
                          ₹{Number(v.default_rate_kg).toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-normal ml-0.5">/Kg</span>
                        </td>

                        {/* Default Rate / Box */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 text-xs">
                          ₹{Number(v.default_rate_box).toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-normal ml-0.5">/Box</span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {v.is_active !== false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <XCircle className="w-2.5 h-2.5 text-slate-400" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* VIEW BUTTON */}
                            <button
                              title="View Variety Details"
                              onClick={() => setViewingVariety(v)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-teal-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* EDIT BUTTON */}
                            <button
                              title="Edit Variety Rates"
                              onClick={() => handleOpenEdit(v)}
                              className="p-1.5 rounded-md hover:bg-teal-50 text-teal-700 hover:text-teal-900 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              title="Delete Variety"
                              onClick={() => setDeletingVariety(v)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: Sales Performance Analysis */}
      {activeTab === 'performance' && (
        <Card className="overflow-hidden border border-slate-200/90 shadow-xs">
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-teal-600" />
                Multi-Variety Sales Performance (Kg & Box Rate Analysis)
              </h2>
              <p className="text-xs text-slate-500">
                Quantity sold in Boxes vs Kilograms and revenue share.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs text-teal-700 hover:bg-teal-50 font-semibold"
            >
              Download CSV &rarr;
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Variety Grade</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Boxes Sold</th>
                  <th className="py-2.5 px-3 text-right">Weight Sold (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue (₹)</th>
                  <th className="py-2.5 px-4 text-right">% Revenue Share</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {varieties.map((v) => {
                  const stat = varietyStatsMap[v.code] || { totalBoxes: 0, totalKg: 0, revenue: 0 };
                  const sharePct = totalSalesAll > 0 ? ((stat.revenue / totalSalesAll) * 100).toFixed(1) : '0';

                  return (
                    <tr key={v.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-teal-700">
                        <span className={`px-2.5 py-1 rounded-md border font-mono text-xs font-bold ${getVarietyBadgeStyle(v.code)}`}>
                          {v.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{v.name}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {stat.totalBoxes > 0 ? `${stat.totalBoxes} Boxes` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {stat.totalKg > 0 ? `${stat.totalKg} Kg` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(stat.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-teal-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, Number(sharePct))}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold text-slate-600">{sharePct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewingVariety(v)}
                          className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold"
                        >
                          View Sales
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* 1. ADD VARIETY MODAL                                     */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="p-4 bg-teal-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                <div>
                  <h2 className="text-base font-bold">Add Fruit / Produce Variety</h2>
                  <p className="text-[11px] text-teal-100">Configure grade, country origin, caliber count & rates</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-teal-800 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVariety} className="p-5 space-y-4 overflow-y-auto">
              {/* Fruit Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product / Fruit Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewFruit('Apple');
                      handleApplyAddPreset('Apple', 'Indian', '135 Count', 95, 1850);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      newFruit === 'Apple'
                        ? 'bg-red-50 border-red-500 text-red-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🍎 Apple</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFruit('Malta');
                      handleApplyAddPreset('Malta', 'Indian', '88 Count', 65, 1300);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      newFruit === 'Malta'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🍊 Malta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFruit('Other');
                      setNewCode('PROD-SPL');
                      setNewName('Special Produce Grade');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      newFruit === 'Other'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>📦 Other Fruit</span>
                  </button>
                </div>
              </div>

              {/* Quick Count & Origin Preset Chips */}
              {newFruit === 'Apple' && (
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                  <span className="text-[11px] font-bold text-red-900 block mb-1.5">
                    ⚡ Quick Apple Variety Presets (Click to Auto-fill):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Apple', 'Indian', '135 Count', 95, 1850)}
                      className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold text-red-800 transition-colors"
                    >
                      Indian 135
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Apple', 'Indian', '100 Count', 105, 2100)}
                      className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold text-red-800 transition-colors"
                    >
                      Indian 100
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Apple', 'Indian', '90 Count', 115, 2300)}
                      className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold text-red-800 transition-colors"
                    >
                      Indian 90
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Apple', 'Indian', '200 (Small)', 78, 1550)}
                      className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold text-red-800 transition-colors"
                    >
                      Indian 200 Small
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Apple', 'Indian', '250 (Extra Small)', 68, 1350)}
                      className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold text-red-800 transition-colors"
                    >
                      Indian 250 Ex-Small
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Apple', 'Turkey', '100 Count', 140, 2600)}
                      className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold text-red-800 transition-colors"
                    >
                      Turkey Red Apple
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Apple', 'Poland', '100 Count', 135, 2500)}
                      className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold text-red-800 transition-colors"
                    >
                      Poland Red Apple
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Apple', 'Imported', '100 Count', 130, 2400)}
                      className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold text-red-800 transition-colors"
                    >
                      Green Apple (Granny)
                    </button>
                  </div>
                </div>
              )}

              {newFruit === 'Malta' && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="text-[11px] font-bold text-amber-900 block mb-1.5">
                    ⚡ Quick Malta Variety Presets (Click to Auto-fill):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Malta', 'Indian', '80 Count', 70, 1400)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-bold text-amber-800 transition-colors"
                    >
                      Indian Malta 80
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Malta', 'Indian', '88 Count', 65, 1300)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-bold text-amber-800 transition-colors"
                    >
                      Indian Malta 88
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Malta', 'Australia', '88 Count', 110, 1950)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-bold text-amber-800 transition-colors"
                    >
                      Australia Malta 88
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Malta', 'Egypt', '80 Count', 95, 1750)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-bold text-amber-800 transition-colors"
                    >
                      Egypt Malta 80
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAddPreset('Malta', 'Egypt', '88 Count', 90, 1650)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-bold text-amber-800 transition-colors"
                    >
                      Egypt Malta 88
                    </button>
                  </div>
                </div>
              )}

              {/* Origin & Caliber Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Origin / Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Indian, Turkey, Poland, Egypt..."
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Caliber / Size Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 135 Count, 88 Count, Small"
                    value={newSizeCount}
                    onChange={(e) => setNewSizeCount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Variety Code & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Variety Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. APL-IND-135, MLT-80"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Variety Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indian Apple 135 Count"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Default Billing Unit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Billing Unit
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUnit('Box')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      newUnit === 'Box'
                        ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Box (Standard Count Rate)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUnit('Kg')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      newUnit === 'Kg'
                        ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Kilogram (Kg Bulk Rate)</span>
                  </button>
                </div>
              </div>

              {/* Default Rates: Kg and Box */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default Rate / Kg (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 95"
                    value={newRateKg}
                    onChange={(e) => setNewRateKg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default Rate / Box (₹)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    placeholder="e.g. 1850"
                    value={newRateBox}
                    onChange={(e) => setNewRateBox(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                  {isSubmitting ? 'Saving...' : 'Register Variety'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EDIT VARIETY MODAL                                    */}
      {/* ======================================================== */}
      {editingVariety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-400" />
                <div>
                  <h2 className="text-sm font-bold">Edit Variety Rates & Details</h2>
                  <p className="text-[11px] text-slate-300 font-mono">Code: {editingVariety.code}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingVariety(null)}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fruit
                  </label>
                  <input
                    type="text"
                    value={editFruit}
                    onChange={(e) => setEditFruit(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={editOrigin}
                    onChange={(e) => setEditOrigin(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Size / Count
                  </label>
                  <input
                    type="text"
                    value={editSizeCount}
                    onChange={(e) => setEditSizeCount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Variety Name / Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Billing Unit
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditUnit('Box')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      editUnit === 'Box'
                        ? 'bg-teal-50 border-teal-600 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Box</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUnit('Kg')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      editUnit === 'Kg'
                        ? 'bg-teal-50 border-teal-600 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Kilogram (Kg)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default Rate / Kg (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editRateKg}
                    onChange={(e) => setEditRateKg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default Rate / Box (₹)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={editRateBox}
                    onChange={(e) => setEditRateBox(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Variety Active Status</span>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                    editIsActive
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {editIsActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingVariety(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                  {isSubmitting ? 'Saving...' : 'Update Variety'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. VIEW VARIETY DETAILS MODAL                            */}
      {/* ======================================================== */}
      {viewingVariety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFruitIcon(viewingVariety.fruit)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/20 font-mono font-bold text-xs border border-white/30">
                      {viewingVariety.code}
                    </span>
                    {viewingVariety.origin && (
                      <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-bold border border-white/20">
                        {viewingVariety.origin}
                      </span>
                    )}
                    {viewingVariety.size_count && (
                      <span className="px-2 py-0.5 rounded bg-white/20 font-mono text-[11px] font-bold border border-white/30">
                        {viewingVariety.size_count}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold mt-0.5">{viewingVariety.name}</h2>
                </div>
              </div>
              <button
                onClick={() => setViewingVariety(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Rate Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Default Rate / Kg</span>
                  <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    ₹{Number(viewingVariety.default_rate_kg).toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-500">Billed per Kilogram</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Default Rate / Box</span>
                  <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    ₹{Number(viewingVariety.default_rate_box).toFixed(2)}
                  </p>
                  <span className="text-[11px] text-slate-500">Billed per Box</span>
                </div>
              </div>

              {/* Cumulative Sales Stats */}
              {(() => {
                const stat = varietyStatsMap[viewingVariety.code] || { revenue: 0, totalBoxes: 0, totalKg: 0, billsCount: 0, invoices: [] };
                return (
                  <>
                    <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-900 block mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                        All-Time Sales Performance
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded-lg border border-teal-100">
                          <span className="text-[10px] text-slate-500 block">Boxes Sold</span>
                          <span className="font-mono font-bold text-slate-800 text-sm">{stat.totalBoxes}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-teal-100">
                          <span className="text-[10px] text-slate-500 block">Weight (Kg)</span>
                          <span className="font-mono font-bold text-slate-800 text-sm">{stat.totalKg} Kg</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-teal-100">
                          <span className="text-[10px] text-slate-500 block">Total Revenue</span>
                          <span className="font-mono font-bold text-teal-700 text-sm">{formatCurrency(stat.revenue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Invoices Section */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Recent Invoices with {viewingVariety.code} ({stat.invoices.length} Bills)
                      </h3>
                      {stat.invoices.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No sales bills recorded yet for this variety.</p>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                          {stat.invoices.map((invItem: any, idx: number) => (
                            <div key={idx} className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-mono font-bold text-teal-700">{invItem.invoiceNumber}</span>
                                <span className="text-slate-400 text-[10px] ml-2">{invItem.date}</span>
                                <p className="text-[11px] text-slate-700 font-medium">{invItem.customerName}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-slate-900 block">{formatCurrency(invItem.amount)}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {invItem.qty} @ ₹{invItem.rate}/{invItem.unit}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewingVariety(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const toEdit = viewingVariety;
                    setViewingVariety(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Rates</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DELETE CONFIRMATION MODAL                             */}
      {/* ======================================================== */}
      {deletingVariety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-sm font-bold">Remove Variety</h2>
              </div>
              <button
                onClick={() => setDeletingVariety(null)}
                className="p-1 hover:bg-red-700 rounded-lg transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700">
                Are you sure you want to delete variety{' '}
                <strong className="font-mono text-red-600">{deletingVariety.code}</strong> (
                {deletingVariety.name})?
              </p>
              <p className="text-[11px] text-slate-500 bg-red-50 p-2.5 rounded-lg border border-red-200">
                This will remove the variety from the catalog. Existing historical invoices will remain intact.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeletingVariety(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Variety'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
