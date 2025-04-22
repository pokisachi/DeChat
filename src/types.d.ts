// Cập nhật types.d.ts
interface Message {
  file: React.JSX.Element;
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  encrypted?: boolean;
  attachment?: {
    cid: string;
    type: 'image' | 'file';
    name: string;
  };
  status: 'sent' | 'delivered' | 'read';
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  members: Array<{
    address: string;
    role: 'admin' | 'member';
    joinedAt: number;
  }>;
  createdBy: string;
  createdAt: number;
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: number;
  };
  settings: {
    onlyAdminsCanPost: boolean;
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanEditInfo: boolean;
  };
}

type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  code: number;
};

// src/types.d.ts
declare module '@/components/ui/input' {
  import { ComponentType } from 'react'
  const Input: ComponentType<any>
  export { Input }
  export const Button: ComponentType<any>
  export const buttonVariants: (props: any) => string
};
declare module '@/components/ui/button' {
  import { ComponentType } from 'react'
  export const Button: ComponentType<any>
  export const buttonVariants: (props: any) => string
};
// src/types.d.ts
declare type Message = {
  file: React.ReactElement | null  // <-- Thêm union type 'null'
  // ... các property khác
}

