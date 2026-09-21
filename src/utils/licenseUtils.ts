import { License, LicenseStatus, Currency } from '../types';

export function calculateStatus(vervaldatum: string): LicenseStatus {
  const now = new Date();
  const expiry = new Date(vervaldatum);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'verlopen';
  if (diffDays <= 30) return 'verloopt_soon';
  return 'actief';
}

export function getDaysUntilExpiry(vervaldatum: string): number {
  const now = new Date();
  const expiry = new Date(vervaldatum);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  if (currency === 'SRD') {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'SRD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace('SRD', 'SRD');
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyShort(amount: number, currency: Currency): string {
  if (currency === 'SRD') {
    return `SRD ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'SRD' ? 'SRD' : '$';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generateICS(license: License): string {
  const now = new Date();
  const expiry = new Date(license.vervaldatum);
  
  const reminder = new Date(expiry);
  reminder.setDate(reminder.getDate() - 30);

  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const currencyLabel = license.valuta === 'SRD' ? 'SRD' : 'USD';
  const priceLabel = `${formatCurrencyShort(license.totaalPrijs, license.valuta)}`;

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Smart ConneXXionZ//Licentie Beheer//NL
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatDateForICS(reminder)}T090000Z
DTEND:${formatDateForICS(reminder)}T100000Z
SUMMARY:Licentie verloopt: ${license.naam}
DESCRIPTION:Type: ${license.type}\\nLeverancier: ${license.leverancier}\\nVervaldatum: ${formatDate(license.vervaldatum)}\\nKlant: ${license.klantNaam || 'N/A'}\\nPrijs: ${priceLabel}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P30D
ACTION:DISPLAY
DESCRIPTION:Licentie ${license.naam} verloopt over 30 dagen
END:VALARM
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
DESCRIPTION:Licentie ${license.naam} verloopt over 7 dagen
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return ics;
}

export function generateAllICS(licenses: License[]): string {
  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  let events = '';
  licenses.forEach((license) => {
    const expiry = new Date(license.vervaldatum);
    const reminder = new Date(expiry);
    reminder.setDate(reminder.getDate() - 30);

    const priceLabel = formatCurrencyShort(license.totaalPrijs, license.valuta);

    events += `BEGIN:VEVENT
DTSTART:${formatDateForICS(reminder)}T090000Z
DTEND:${formatDateForICS(reminder)}T100000Z
SUMMARY:Licentie verloopt: ${license.naam}
DESCRIPTION:Type: ${license.type}\\nLeverancier: ${license.leverancier}\\nVervaldatum: ${formatDate(license.vervaldatum)}\\nKlant: ${license.klantNaam || 'N/A'}\\nPrijs: ${priceLabel}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P30D
ACTION:DISPLAY
DESCRIPTION:Licentie ${license.naam} verloopt over 30 dagen
END:VALARM
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
DESCRIPTION:Licentie ${license.naam} verloopt over 7 dagen
END:VALARM
END:VEVENT
`;
  });

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Smart ConneXXionZ//Licentie Beheer//NL
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}END:VCALENDAR`;

  return ics;
}

export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getLicenseTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    domein: 'Domein',
    odoo: 'Odoo',
    windows: 'Windows',
    office: 'Microsoft Office',
    antivirus: 'Antivirus',
    overig: 'Overig',
  };
  return labels[type] || type;
}

export function getStatusLabel(status: LicenseStatus): string {
  const labels: Record<LicenseStatus, string> = {
    actief: 'Actief',
    verloopt_soon: 'Verloopt binnenkort',
    verlopen: 'Verlopen',
    opgezegd: 'Opgezegd',
  };
  return labels[status] || status;
}
