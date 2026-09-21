export type LicenseType = 'domein' | 'odoo' | 'windows' | 'office' | 'antivirus' | 'overig';

export type LicenseStatus = 'actief' | 'verloopt_soon' | 'verlopen' | 'opgezegd';

export type Currency = 'SRD' | 'USD';

export interface License {
  id: string;
  naam: string;
  type: LicenseType;
  leverancier: string;
  aantalLicenties: number;
  prijsPerLicentie: number;
  totaalPrijs: number;
  valuta: Currency;
  aankoopDatum: string;
  vervaldatum: string;
  status: LicenseStatus;
  klantNaam?: string;
  domein?: string;
  opmerkingen?: string;
  automatischVerlengen: boolean;
}

export interface DashboardStats {
  totaalLicenties: number;
  totaalKostenSRD: number;
  totaalKostenUSD: number;
  verlooptBinnen30Dagen: number;
  verlopen: number;
  actief: number;
}
