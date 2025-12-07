export interface LinkItem {
  id: number;
  url: string;
  title?: string;
  category?: string;
  created_at: string | null;
  is_favorite?: boolean;
}

export const LINK_CATEGORIES = [
  "İş",
  "Kişisel",
  "Eğitim",
  "Eğlence",
  "Teknoloji",
  "Diğer"
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "İş": "blue",
  "Kişisel": "purple",
  "Eğitim": "green",
  "Eğlence": "orange",
  "Teknoloji": "cyan",
  "Diğer": "gray"
};

export interface User {
  id?: number;
  username: string;
  namesurname: string;
  first_name?: string;
  last_name?: string;
}

