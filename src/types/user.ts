export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    avatar?: File;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface SocialLoginData {
    email: string;
    firstName: string;
    lastName: string;
    socialId: string;
    provider: 'google' | 'facebook' | 'apple';
  }