export type PendingReg = {
  id: string;
  entry_number: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  is_cloud9: boolean;
  total_bill?: number | null;
  total_paid?: number | null;
  fully_paid?: boolean | null;
  bill_no?: string | null;
};

const KEY = "sharandev_lucky_draw";

export function saveReg(r: PendingReg) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(r));
}
export function loadReg(): PendingReg | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(KEY);
  return v ? (JSON.parse(v) as PendingReg) : null;
}
export function clearReg() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
