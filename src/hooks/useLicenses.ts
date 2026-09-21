import { useState, useEffect } from 'react';
import { License } from '../types';
import { calculateStatus } from '../utils/licenseUtils';

const STORAGE_KEY = 'smartconnxxionz_licenses';

export function useLicenses() {
  const [licenses, setLicenses] = useState<License[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored).map((l: License) => ({
          ...l,
          valuta: l.valuta || 'SRD', // Default to SRD for backward compatibility
          status: calculateStatus(l.vervaldatum),
        }));
      }
    } catch (e) {
      console.error('Error loading licenses from storage:', e);
    }
    // Return empty array if no stored data
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(licenses));
    } catch (e) {
      console.error('Error saving licenses to storage:', e);
    }
  }, [licenses]);

  const addLicense = (license: Omit<License, 'id' | 'status'>) => {
    const newLicense: License = {
      ...license,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      status: calculateStatus(license.vervaldatum),
    };
    setLicenses((prev) => [...prev, newLicense]);
  };

  const updateLicense = (id: string, updates: Partial<License>) => {
    setLicenses((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...updates };
          if (updates.vervaldatum) {
            updated.status = calculateStatus(updates.vervaldatum);
          }
          return updated;
        }
        return l;
      })
    );
  };

  const deleteLicense = (id: string) => {
    setLicenses((prev) => prev.filter((l) => l.id !== id));
  };

  const refreshStatuses = () => {
    setLicenses((prev) =>
      prev.map((l) => ({
        ...l,
        status: calculateStatus(l.vervaldatum),
      }))
    );
  };

  return {
    licenses,
    addLicense,
    updateLicense,
    deleteLicense,
    refreshStatuses,
  };
}
