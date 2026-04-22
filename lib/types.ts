export type PropertyStatus = "available" | "urgent" | "searching" | "unavailable";

export type PropertyRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  total_investment: string | number | null;
  purchase_price: string | number | null;
  duration_years: number | null;
  yield_percent: string | number | null;
  status: PropertyStatus;
  image_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type ClientLinkRow = {
  id: string;
  client_id: string;
  access_code: string;
  expires_at: string;
  created_at: string;
  is_active: boolean;
};

export type PortalAccessError = "invalid" | "inactive" | "expired" | null;

export type PortalAccessResult = {
  error: PortalAccessError;
  properties: PropertyRow[];
  /** Nombre del cliente asociado al enlace; solo aplica si el acceso es correcto. */
  clientName: string | null;
};

/** Resultado de fetchPortalAccess (incluye pistas de depuración solo en desarrollo). */
export type PortalAccessFetchResult = PortalAccessResult & {
  devDebug?: string;
};
