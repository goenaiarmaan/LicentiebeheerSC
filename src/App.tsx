import React, { useState, useEffect } from 'react';
import { License } from './types';
import { useLicenses } from './hooks/useLicenses';
import { sampleLicenses } from './data/sampleData';
import Dashboard from './components/Dashboard';
import LicenseTable from './components/LicenseTable';
import LicenseForm from './components/LicenseForm';
import ExportPanel from './components/ExportPanel';

type ViewType = 'dashboard' | 'licenses';

function App() {
  const { licenses, addLicense, updateLicense, deleteLicense } = useLicenses();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Initialize with sample data if empty
  useEffect(() => {
    if (licenses.length === 0) {
      setShowWelcome(true);
    }
  }, []);

  const loadSampleData = () => {
    sampleLicenses.forEach((license) => {
      addLicense(license);
    });
    setShowWelcome(false);
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    setIsFormOpen(true);
  };

  const handleSave = (licenseData: any) => {
    if (licenseData.id) {
      updateLicense(licenseData.id, licenseData);
    } else {
      addLicense(licenseData);
    }
    setEditingLicense(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLicense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">Smart ConneXXionZ</h1>
              <p className="text-xs text-gray-500">Licentie Beheer</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('licenses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentView === 'licenses'
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Licenties
            {licenses.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {licenses.length}
              </span>
            )}
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold text-blue-800">Google Calendar</span>
            </div>
            <p className="text-xs text-blue-600 mb-3">Exporteer licenties naar Google Calendar voor vervaldatum herinneringen.</p>
            <p className="text-[10px] text-blue-500">Download het .ics bestand en importeer in Google Calendar.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentView === 'dashboard' ? 'Dashboard' : 'Licentie Overzicht'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentView === 'dashboard'
                  ? 'Overzicht van alle licenties en kosten'
                  : 'Beheer en bewaak al uw licenties'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporteren
              </button>
              <button
                onClick={() => {
                  setEditingLicense(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Licentie Toevoegen
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {showWelcome && licenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welkom bij Licentie Beheer</h3>
              <p className="text-gray-500 max-w-md mb-8">
                Beheer al uw domeinen, Odoo licenties, Windows licenties en meer op één centrale plek. 
                Koppel aan Google Calendar om nooit meer een vervaldatum te missen.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={loadSampleData}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  Demo Data Laden
                </button>
                <button
                  onClick={() => {
                    setEditingLicense(null);
                    setIsFormOpen(true);
                    setShowWelcome(false);
                  }}
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Zelf Toevoegen
                </button>
              </div>
            </div>
          ) : currentView === 'dashboard' ? (
            <Dashboard licenses={licenses} />
          ) : (
            <LicenseTable
              licenses={licenses}
              onEdit={handleEdit}
              onDelete={deleteLicense}
              onExport={() => setIsExportOpen(true)}
            />
          )}
        </div>
      </main>

      {/* License Form Modal */}
      <LicenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        license={editingLicense}
      />

      {/* Export Panel */}
      <ExportPanel
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        licenses={licenses}
      />
    </div>
  );
}

export default App;
