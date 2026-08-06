export type ChannelDM = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  type: string;
  isPrivate: boolean;
  createdAt: string;
  friend: {
    id: string;
    email: string;
    password: string;
    username: string;
    displayName: string;
    avatar: string;
    bio: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    dateOfBirth: string;
    phone: string;
    gender: string;
    fullName: string;
    privacySettings: {
      showEmail: boolean;
      showPhone: boolean;
      showGender: boolean;
      showBirthday: boolean;
    };
  };
};

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  type: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}
