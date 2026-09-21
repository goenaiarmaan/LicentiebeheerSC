import React from 'react';
import { License } from '../types';
import { formatCurrencyShort } from '../utils/licenseUtils';

interface DashboardProps {
  licenses: License[];
}

export default function Dashboard({ licenses }: DashboardProps) {
  const totaalLicenties = licenses.length;
  const actief = licenses.filter((l) => l.status === 'actief').length;
  const verlooptBinnenkort = licenses.filter((l) => l.status === 'verloopt_soon').length;
  const verlopen = licenses.filter((l) => l.status === 'verlopen').length;
  
  const totaalSRD = licenses.filter((l) => l.valuta === 'SRD').reduce((sum, l) => sum + l.totaalPrijs, 0);
  const totaalUSD = licenses.filter((l) => l.valuta === 'USD').reduce((sum, l) => sum + l.totaalPrijs, 0);

  const kostenPerTypeSRD = licenses
    .filter((l) => l.valuta === 'SRD')
    .reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + l.totaalPrijs;
      return acc;
    }, {} as Record<string, number>);

  const kostenPerTypeUSD = licenses
    .filter((l) => l.valuta === 'USD')
    .reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + l.totaalPrijs;
      return acc;
    }, {} as Record<string, number>);

  // Combineer voor de grafiek
  const kostenPerType = licenses.reduce((acc, l) => {
    const key = `${l.type}_${l.valuta}`;
    acc[key] = (acc[key] || 0) + l.totaalPrijs;
    return acc;
  }, {} as Record<string, number>);

  const totaalKosten = totaalSRD + totaalUSD; // Voor de grafiek percentages

  const upcomingExpiries = licenses
    .filter((l) => l.status === 'verloopt_soon' || l.status === 'verlopen')
    .sort((a, b) => new Date(a.vervaldatum).getTime() - new Date(b.vervaldatum).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Totaal Licenties</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totaalLicenties}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">{actief} actief</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Totaal Kosten</p>
              <div className="mt-1 space-y-0.5">
                {totaalSRD > 0 && (
                  <p className="text-lg font-bold text-green-700">SRD {totaalSRD.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
                )}
                {totaalUSD > 0 && (
                  <p className="text-lg font-bold text-blue-700">$ {totaalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                )}
                {totaalSRD === 0 && totaalUSD === 0 && (
                  <p className="text-2xl font-bold text-gray-900">-</p>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Per jaar</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Verloopt Binnenkort</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{verlooptBinnenkort}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Binnen 30 dagen</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Verlopen</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{verlopen}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Actie vereist</p>
        </div>
      </div>

      {/* Kosten per Type & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kosten per Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kosten per Licentietype</h3>
          
          {/* SRD Kosten */}
          {Object.keys(kostenPerTypeSRD).length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">SRD</span>
                <span className="text-sm font-semibold text-gray-700">
                  Totaal: SRD {totaalSRD.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="space-y-2 pl-1">
                {Object.entries(kostenPerTypeSRD).map(([type, kosten]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        type === 'domein' ? 'bg-purple-500' :
                        type === 'odoo' ? 'bg-blue-500' :
                        type === 'windows' ? 'bg-cyan-500' :
                        type === 'office' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm text-gray-600 capitalize">{type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      SRD {kosten.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USD Kosten */}
          {Object.keys(kostenPerTypeUSD).length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">USD</span>
                <span className="text-sm font-semibold text-gray-700">
                  Totaal: $ {totaalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="space-y-2 pl-1">
                {Object.entries(kostenPerTypeUSD).map(([type, kosten]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        type === 'domein' ? 'bg-purple-500' :
                        type === 'odoo' ? 'bg-blue-500' :
                        type === 'windows' ? 'bg-cyan-500' :
                        type === 'office' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm text-gray-600 capitalize">{type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      $ {kosten.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(kostenPerTypeSRD).length === 0 && Object.keys(kostenPerTypeUSD).length === 0 && (
            <p className="text-sm text-gray-400">Geen licenties gevonden</p>
          )}

          {/* Bar chart visualization */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Verdeling</p>
            <div className="space-y-2">
              {Object.entries(kostenPerType).map(([key, kosten]) => {
                const [type, valuta] = key.split('_');
                const percentage = (totaalSRD + totaalUSD) > 0 ? (kosten / (totaalSRD + totaalUSD)) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20 truncate capitalize">{type}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          type === 'domein' ? 'bg-purple-500' :
                          type === 'odoo' ? 'bg-blue-500' :
                          type === 'windows' ? 'bg-cyan-500' :
                          type === 'office' ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      valuta === 'SRD' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {valuta}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Expiries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Binnenkort Verlopen</h3>
          {upcomingExpiries.length > 0 ? (
            <div className="space-y-3">
              {upcomingExpiries.map((license) => {
                const daysLeft = Math.ceil((new Date(license.vervaldatum).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{license.naam}</p>
                      <p className="text-xs text-gray-500">{license.klantNaam || 'Geen klant'}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        daysLeft < 0 ? 'bg-red-100 text-red-800' :
                        daysLeft <= 7 ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} dagen geleden` : `${daysLeft} dagen`}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        license.valuta === 'SRD' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {formatCurrencyShort(license.totaalPrijs, license.valuta)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-400">Geen licenties die binnenkort verlopen 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
