export interface AppSettings {
  currencyCode: string;
  storeName: string;
  supportEmail: string | null;
  freeShippingThresholdCents: number | null;
  updatedAt: Date;
}
