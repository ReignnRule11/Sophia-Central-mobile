export type ResourceType = {
  id: string;
  title: string;
  course?: string;
  topic?: string;
  institution?: string;
  type?: string;
  description?: string;
  url?: string;
  uploader?: {
    firstName?: string;
    lastName?: string;
  };
  tags?: string[];
  rating?: number;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  institution?: string;
  points?: number;
};

export type AuthSession = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: UserProfile;
};
