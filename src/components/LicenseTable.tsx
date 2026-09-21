import React, { useState } from 'react';
import { License, LicenseType } from '../types';
import { formatDate, formatCurrencyShort, getDaysUntilExpiry, getLicenseTypeLabel, generateICS, downloadICS, generateAllICS } from '../utils/licenseUtils';

interface LicenseTableProps {
  licenses: License[];
  onEdit: (license: License) => void;
  onDelete: (id: string) => void;
  onExport?: () => void;
}

export default function LicenseTable({ licenses, onEdit, onDelete, onExport }: LicenseTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('alle');
  const [filterStatus, setFilterStatus] = useState<string>('alle');
  const [sortBy, setSortBy] = useState<string>('vervaldatum');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredLicenses = licenses
    .filter((l) => {
      const matchesSearch = l.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.klantNaam || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.leverancier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'alle' || l.type === filterType;
      const matchesStatus = filterStatus === 'alle' || l.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'vervaldatum':
          comparison = new Date(a.vervaldatum).getTime() - new Date(b.vervaldatum).getTime();
          break;
        case 'naam':
          comparison = a.naam.localeCompare(b.naam);
          break;
        case 'prijs':
          comparison = a.totaalPrijs - b.totaalPrijs;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExportSingle = (license: License) => {
    const ics = generateICS(license);
    downloadICS(ics, `licentie-${license.naam.replace(/\s+/g, '-')}.ics`);
  };

  const handleExportAll = () => {
    const ics = generateAllICS(filteredLicenses);
    downloadICS(ics, 'alle-licenties-calendar.ics');
  };

  const getStatusBadge = (status: string, vervalDatum: string) => {
    const days = getDaysUntilExpiry(vervalDatum);
    switch (status) {
      case 'actief':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Actief</span>;
      case 'verloopt_soon':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">⚠️ {days} dagen</span>;
      case 'verlopen':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ Verlopen</span>;
      case 'opgezegd':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Opgezegd</span>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: LicenseType) => {
    switch (type) {
      case 'domein':
        return <span className="text-purple-600">🌐</span>;
      case 'odoo':
        return <span className="text-blue-600">📊</span>;
      case 'windows':
        return <span className="text-cyan-600">🪟</span>;
      case 'office':
        return <span className="text-orange-600">📧</span>;
      case 'antivirus':
        return <span className="text-green-600">🛡️</span>;
      default:
        return <span className="text-gray-600">📋</span>;
    }
  };

  const totaalSRD = filteredLicenses.filter(l => l.valuta === 'SRD').reduce((sum, l) => sum + l.totaalPrijs, 0);
  const totaalUSD = filteredLicenses.filter(l => l.valuta === 'USD').reduce((sum, l) => sum + l.totaalPrijs, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Zoeken op naam, klant of leverancier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="alle">Alle types</option>
              <option value="domein">Domein</option>
              <option value="odoo">Odoo</option>
              <option value="windows">Windows</option>
              <option value="office">Office</option>
              <option value="antivirus">Antivirus</option>
              <option value="overig">Overig</option>
            </select>
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="alle">Alle statussen</option>
              <option value="actief">Actief</option>
              <option value="verloopt_soon">Verloopt binnenkort</option>
              <option value="verlopen">Verlopen</option>
            </select>
          </div>
          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporteer
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('naam')}>
                  Licentie {sortBy === 'naam' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('type')}>
                  Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Klant
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Aantal
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('prijs')}>
                  Prijs {sortBy === 'prijs' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Valuta
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('vervaldatum')}>
                  Vervaldatum {sortBy === 'vervaldatum' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLicenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(license.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{license.naam}</p>
                        <p className="text-xs text-gray-500">{license.leverancier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{getLicenseTypeLabel(license.type)}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-700">{license.klantNaam || '-'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-700">{license.aantalLicenties}x</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrencyShort(license.totaalPrijs, license.valuta)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrencyShort(license.prijsPerLicentie, license.valuta)}/st.
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      license.valuta === 'SRD' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {license.valuta}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{formatDate(license.vervaldatum)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(license.status, license.vervaldatum)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleExportSingle(license)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Exporteer naar Google Calendar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit(license)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Bewerken"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Weet u zeker dat u deze licentie wilt verwijderen?')) {
                            onDelete(license.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Verwijderen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLicenses.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">Geen licenties gevonden</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            {filteredLicenses.length} van {licenses.length} licenties weergegeven
          </p>
          <div className="flex items-center gap-4">
            {totaalSRD > 0 && (
              <p className="text-xs font-semibold text-green-700">
                SRD: {totaalSRD.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </p>
            )}
            {totaalUSD > 0 && (
              <p className="text-xs font-semibold text-blue-700">
                USD: ${totaalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
