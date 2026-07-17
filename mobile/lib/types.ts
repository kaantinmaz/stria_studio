export type User = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  customer_linked: boolean;
};

export type Loyalty = {
  campaign_title: string;
  nth: number;
  discount_percent: number;
  completed_count: number;
  progress: number;
  remaining: number;
  reward_next: boolean;
};

export type MeData = {
  user: User;
  loyalty: Loyalty | null;
};

export type AuthData = {
  token: string;
  user: User;
};

export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'no_show';

export type Appointment = {
  id: number;
  service_name: string | null;
  starts_at: string;
  duration_min: number;
  status: AppointmentStatus;
  photos: string[];
  campaign: { title: string; new_price: string | null } | null;
};

export type Campaign = {
  id: number;
  kind: 'loyalty' | 'promo';
  title: string;
  description: string | null;
  image: string | null;
  nth: number | null;
  discount_percent: number | null;
  old_price: string | null;
  new_price: string | null;
  starts_at: string | null;
  ends_at: string | null;
  service_slugs: string[] | null;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type Service = {
  name_tr: string;
  name_en: string;
  slug: string;
  image: string | null;
};

export type GalleryImage = {
  id: number;
  image: string | null;
  alt_tr: string | null;
  alt_en: string | null;
};

export type SlotData = {
  date: string;
  slots: string[];
};

export type ValidationErrors = Record<string, string[]>;

export type ChatMessage = { role: 'user' | 'assistant'; content: string };
