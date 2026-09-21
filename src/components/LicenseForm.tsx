import React, { useState, useEffect } from 'react';
import { License, LicenseType, Currency } from '../types';

interface LicenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (license: any) => void;
  license?: License | null;
}

export default function LicenseForm({ isOpen, onClose, onSave, license }: LicenseFormProps) {
  const [formData, setFormData] = useState({
    naam: '',
    type: 'domein' as LicenseType,
    leverancier: '',
    aantalLicenties: 1,
    prijsPerLicentie: 0,
    valuta: 'SRD' as Currency,
    aankoopDatum: new Date().toISOString().split('T')[0],
    vervaldatum: '',
    klantNaam: '',
    domein: '',
    opmerkingen: '',
    automatischVerlengen: false,
  });

  useEffect(() => {
    if (license) {
      setFormData({
        naam: license.naam,
        type: license.type,
        leverancier: license.leverancier,
        aantalLicenties: license.aantalLicenties,
        prijsPerLicentie: license.prijsPerLicentie,
        valuta: license.valuta || 'SRD',
        aankoopDatum: license.aankoopDatum,
        vervaldatum: license.vervaldatum,
        klantNaam: license.klantNaam || '',
        domein: license.domein || '',
        opmerkingen: license.opmerkingen || '',
        automatischVerlengen: license.automatischVerlengen,
      });
    } else {
      setFormData({
        naam: '',
        type: 'domein',
        leverancier: '',
        aantalLicenties: 1,
        prijsPerLicentie: 0,
        valuta: 'SRD',
        aankoopDatum: new Date().toISOString().split('T')[0],
        vervaldatum: '',
        klantNaam: '',
        domein: '',
        opmerkingen: '',
        automatischVerlengen: false,
      });
    }
  }, [license, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totaalPrijs = formData.aantalLicenties * formData.prijsPerLicentie;
    onSave({
      ...formData,
      totaalPrijs,
      ...(license ? { id: license.id } : {}),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {license ? 'Licentie Bewerken' : 'Nieuwe Licentie Toevoegen'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basis Informatie */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Basis Informatie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Licentie Naam *</label>
                <input
                  type="text"
                  required
                  value={formData.naam}
                  onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="bijv. Windows 11 Pro - Klant ABC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type Licentie *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as LicenseType })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="domein">🌐 Domein</option>
                  <option value="odoo">📊 Odoo</option>
                  <option value="windows">🪟 Windows</option>
                  <option value="office">📧 Microsoft Office</option>
                  <option value="antivirus">🛡️ Antivirus</option>
                  <option value="overig">📋 Overig</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leverancier *</label>
                <input
                  type="text"
                  required
                  value={formData.leverancier}
                  onChange={(e) => setFormData({ ...formData, leverancier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="bijv. Microsoft, Odoo S.A., TransIP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Klant Naam</label>
                <input
                  type="text"
                  value={formData.klantNaam}
                  onChange={(e) => setFormData({ ...formData, klantNaam: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="bijv. ABC Trading B.V."
                />
              </div>
              {formData.type === 'domein' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domeinnaam</label>
                  <input
                    type="text"
                    value={formData.domein}
                    onChange={(e) => setFormData({ ...formData, domein: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="bijv. voorbeeld.nl"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Prijs Informatie */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Prijs Informatie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valuta *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, valuta: 'SRD' })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      formData.valuta === 'SRD'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-base font-bold">SRD</span>
                    <span className="block text-xs opacity-75">Surinaamse Dollar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, valuta: 'USD' })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      formData.valuta === 'USD'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-base font-bold">$ USD</span>
                    <span className="block text-xs opacity-75">US Dollar</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aantal Licenties</label>
                <input
                  type="number"
                  min="1"
                  value={formData.aantalLicenties}
                  onChange={(e) => setFormData({ ...formData, aantalLicenties: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prijs per Licentie ({formData.valuta === 'SRD' ? 'SRD' : 'USD $'})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    {formData.valuta === 'SRD' ? 'SRD' : '$'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.prijsPerLicentie}
                    onChange={(e) => setFormData({ ...formData, prijsPerLicentie: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Totaal Prijs</label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    formData.valuta === 'SRD' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {formData.valuta}
                  </span>
                  {(formData.aantalLicenties * formData.prijsPerLicentie).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Datums */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Datums</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aankoopdatum *</label>
                <input
                  type="date"
                  required
                  value={formData.aankoopDatum}
                  onChange={(e) => setFormData({ ...formData, aankoopDatum: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vervaldatum *</label>
                <input
                  type="date"
                  required
                  value={formData.vervaldatum}
                  onChange={(e) => setFormData({ ...formData, vervaldatum: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Opties */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Opties</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.automatischVerlengen}
                  onChange={(e) => setFormData({ ...formData, automatischVerlengen: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Automatisch verlengen</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opmerkingen</label>
                <textarea
                  value={formData.opmerkingen}
                  onChange={(e) => setFormData({ ...formData, opmerkingen: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Eventuele opmerkingen over deze licentie..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              {license ? 'Bijwerken' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
