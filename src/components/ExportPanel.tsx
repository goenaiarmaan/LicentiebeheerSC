import React, { useState, useMemo } from 'react';
import { License, Currency } from '../types';
import { formatDate, formatCurrencyShort, getLicenseTypeLabel } from '../utils/licenseUtils';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  licenses: License[];
}

export default function ExportPanel({ isOpen, onClose, licenses }: ExportPanelProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedCurrency, setSelectedCurrency] = useState<string>('alle');
  const [selectedType, setSelectedType] = useState<string>('alle');

  // Get available years from licenses
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    licenses.forEach((l) => {
      const date = new Date(l.aankoopDatum);
      years.add(date.getFullYear().toString());
      const expiryDate = new Date(l.vervaldatum);
      years.add(expiryDate.getFullYear().toString());
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [licenses]);

  // Filter licenses based on selected criteria
  const filteredLicenses = useMemo(() => {
    return licenses.filter((l) => {
      // Month filter
      if (selectedMonth) {
        const expiryMonth = new Date(l.vervaldatum).getMonth() + 1;
        if (expiryMonth.toString() !== selectedMonth) return false;
      }

      // Year filter
      if (selectedYear) {
        const expiryYear = new Date(l.vervaldatum).getFullYear().toString();
        if (expiryYear !== selectedYear) return false;
      }

      // Currency filter
      if (selectedCurrency !== 'alle' && l.valuta !== selectedCurrency) return false;

      // Type filter
      if (selectedType !== 'alle' && l.type !== selectedType) return false;

      return true;
    });
  }, [licenses, selectedMonth, selectedYear, selectedCurrency, selectedType]);

  // Calculate totals
  const totaalSRD = filteredLicenses.filter(l => l.valuta === 'SRD').reduce((sum, l) => sum + l.totaalPrijs, 0);
  const totaalUSD = filteredLicenses.filter(l => l.valuta === 'USD').reduce((sum, l) => sum + l.totaalPrijs, 0);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Naam', 'Type', 'Leverancier', 'Klant', 'Aantal', 'Prijs per Licentie', 'Totaal Prijs', 'Valuta', 'Aankoopdatum', 'Vervaldatum', 'Status', 'Opmerkingen'];
    
    const rows = filteredLicenses.map((l) => [
      l.naam,
      getLicenseTypeLabel(l.type),
      l.leverancier,
      l.klantNaam || '',
      l.aantalLicenties.toString(),
      l.prijsPerLicentie.toFixed(2),
      l.totaalPrijs.toFixed(2),
      l.valuta,
      formatDate(l.aankoopDatum),
      formatDate(l.vervaldatum),
      l.status === 'actief' ? 'Actief' : l.status === 'verloopt_soon' ? 'Verloopt binnenkort' : 'Verlopen',
      l.opmerkingen || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    downloadFile(csvContent, `licenties-export-${selectedYear}-${selectedMonth || 'alle'}.csv`, 'text/csv;charset=utf-8;');
  };

  // Export to Excel (using CSV with Excel compatibility)
  const exportToExcel = () => {
    const headers = ['Naam', 'Type', 'Leverancier', 'Klant', 'Aantal', 'Prijs per Licentie', 'Totaal Prijs', 'Valuta', 'Aankoopdatum', 'Vervaldatum', 'Status', 'Opmerkingen'];
    
    const rows = filteredLicenses.map((l) => [
      l.naam,
      getLicenseTypeLabel(l.type),
      l.leverancier,
      l.klantNaam || '',
      l.aantalLicenties.toString(),
      l.prijsPerLicentie.toFixed(2),
      l.totaalPrijs.toFixed(2),
      l.valuta,
      formatDate(l.aankoopDatum),
      formatDate(l.vervaldatum),
      l.status === 'actief' ? 'Actief' : l.status === 'verloopt_soon' ? 'Verloopt binnenkort' : 'Verlopen',
      l.opmerkingen || '',
    ]);

    // Add totals row
    rows.push([]);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    if (totaalSRD > 0) {
      rows.push(['TOTAAL SRD', '', '', '', '', '', totaalSRD.toFixed(2), 'SRD', '', '', '', '']);
    }
    if (totaalUSD > 0) {
      rows.push(['TOTAAL USD', '', '', '', '', '', totaalUSD.toFixed(2), 'USD', '', '', '', '']);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    downloadFile(BOM + csvContent, `licenties-export-${selectedYear}-${selectedMonth || 'alle'}.csv`, 'text/csv;charset=utf-8;');
  };

  // Export to JSON
  const exportToJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      filter: {
        month: selectedMonth || 'alle',
        year: selectedYear,
        currency: selectedCurrency,
        type: selectedType,
      },
      summary: {
        totaalLicenties: filteredLicenses.length,
        totaalSRD,
        totaalUSD,
      },
      licenses: filteredLicenses,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `licenties-export-${selectedYear}-${selectedMonth || 'alle'}.json`, 'application/json');
  };

  // Export to PDF (simple text-based)
  const exportToPDF = () => {
    const monthNames = ['', 'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    const periodLabel = selectedMonth ? `${monthNames[parseInt(selectedMonth)]} ${selectedYear}` : `Alle maanden ${selectedYear}`;

    let content = `LICENTIE RAPPORT - ${periodLabel}\n`;
    content += `Genereerd op: ${new Date().toLocaleDateString('nl-NL')}\n`;
    content += `${'='.repeat(80)}\n\n`;

    content += `SAMENVATTING\n`;
    content += `${'-'.repeat(80)}\n`;
    content += `Totaal licenties: ${filteredLicenses.length}\n`;
    if (totaalSRD > 0) content += `Totaal SRD: SRD ${totaalSRD.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}\n`;
    if (totaalUSD > 0) content += `Totaal USD: $ ${totaalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    content += `\n`;

    content += `LICENTIES\n`;
    content += `${'-'.repeat(80)}\n\n`;

    filteredLicenses.forEach((l, index) => {
      content += `${index + 1}. ${l.naam}\n`;
      content += `   Type: ${getLicenseTypeLabel(l.type)} | Leverancier: ${l.leverancier}\n`;
      if (l.klantNaam) content += `   Klant: ${l.klantNaam}\n`;
      content += `   Aantal: ${l.aantalLicenties} | Prijs: ${formatCurrencyShort(l.totaalPrijs, l.valuta)} (${l.valuta})\n`;
      content += `   Vervaldatum: ${formatDate(l.vervaldatum)} | Status: ${l.status === 'actief' ? 'Actief' : l.status === 'verloopt_soon' ? 'Verloopt binnenkort' : 'Verlopen'}\n`;
      if (l.opmerkingen) content += `   Opmerkingen: ${l.opmerkingen}\n`;
      content += `\n`;
    });

    downloadFile(content, `licenties-rapport-${selectedYear}-${selectedMonth || 'alle'}.txt`, 'text/plain;charset=utf-8;');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maart' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Augustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Export Licenties</h2>
            <p className="text-sm text-gray-500">Filter en exporteer licenties per periode</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maand</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Alle maanden</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jaar</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valuta</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="alle">Alle valuta</option>
                  <option value="SRD">SRD (Surinaamse Dollar)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="alle">Alle types</option>
                  <option value="domein">Domein</option>
                  <option value="odoo">Odoo</option>
                  <option value="windows">Windows</option>
                  <option value="office">Office</option>
                  <option value="antivirus">Antivirus</option>
                  <option value="overig">Overig</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Gefilterd Resultaat</p>
                <p className="text-xs text-blue-700 mt-1">
                  {filteredLicenses.length} licenties gevonden
                </p>
              </div>
              <div className="text-right space-y-1">
                {totaalSRD > 0 && (
                  <p className="text-sm font-bold text-green-700">
                    SRD {totaalSRD.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </p>
                )}
                {totaalUSD > 0 && (
                  <p className="text-sm font-bold text-blue-700">
                    $ {totaalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Voorbeeld</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Naam</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Klant</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Prijs</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Vervaldatum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLicenses.slice(0, 10).map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900">{l.naam}</td>
                        <td className="px-3 py-2 text-gray-600">{getLicenseTypeLabel(l.type)}</td>
                        <td className="px-3 py-2 text-gray-600">{l.klantNaam || '-'}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          {formatCurrencyShort(l.totaalPrijs, l.valuta)}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{formatDate(l.vervaldatum)}</td>
                      </tr>
                    ))}
                    {filteredLicenses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                          Geen licenties gevonden met deze filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredLicenses.length > 10 && (
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                  + {filteredLicenses.length - 10} meer licenties
                </div>
              )}
            </div>
          </div>

          {/* Export Buttons */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Export Opties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={exportToCSV}
                disabled={filteredLicenses.length === 0}
                className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">CSV</span>
                <span className="text-xs text-gray-500">Universeel formaat</span>
              </button>

              <button
                onClick={exportToExcel}
                disabled={filteredLicenses.length === 0}
                className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Excel</span>
                <span className="text-xs text-gray-500">Met totalen</span>
              </button>

              <button
                onClick={exportToJSON}
                disabled={filteredLicenses.length === 0}
                className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-sm font-medium text-gray-900">JSON</span>
                <span className="text-xs text-gray-500">Voor developers</span>
              </button>

              <button
                onClick={exportToPDF}
                disabled={filteredLicenses.length === 0}
                className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Rapport</span>
                <span className="text-xs text-gray-500">Tekst formaat</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
