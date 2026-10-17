export interface User {
  email: string;
  name: string | null;
  picture: string | null;
  created_at: string;
}

export interface AuthState {
  is_authenticated: boolean;
  user: User | null;
}

export interface UserSettings {
  notion: {
    secret_set: boolean; // the secret itself is never sent back
    noun_db_id: string | null;
    verb_db_id: string | null;
  };
}

export interface NotionSettingsRequest {
  secret: string; // empty keeps the saved secret
  noun_db_id: string;
  verb_db_id: string;
}
