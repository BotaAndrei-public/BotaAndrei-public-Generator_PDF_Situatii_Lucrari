export interface WorkItem {
  id: number;
  name: string;
  unit: string;
  totalQuantity: number;
  quantityThisMonth: number;
  rate: number;
  bool: boolean[];
  valueThisMonth: number;
}

export interface WorkSituationData {
  beneficiary: string;
  subcontractor: string;
  site: string;
  month: string;
  year: string;
  director?: string;
  executor?: string;
  siteManager?: string;
  items: WorkItem[];
  totalBeforeTax: number;
  vat: number;
  total: number;
  remainingToPay: number;
  footerImage?: string; // imagine opțională pentru PDF (base64 sau url)
}

export const defaultWorkItems: WorkItem[] = [
  {
    id: 1,
    name: "",
    unit: "",
    totalQuantity: 0,
    quantityThisMonth: 0,
    rate: 0,
    bool: [false,false,false],
    valueThisMonth: 0,
  },
];

export const createEmptyWorkItem = (id: number): WorkItem => ({
  id,
  name: "",
  unit: "",
  totalQuantity: 0,
  quantityThisMonth: 0,
  rate: 0,
  bool: [false,false,false],
  valueThisMonth: 0,
});
