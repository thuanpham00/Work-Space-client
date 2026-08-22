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
  config: ChannelConfig;
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
  members?: MemberChannel[];
}

export interface ChannelBody {
  workspaceId: string;
  name: string;
  type: string;
  categoryId: string;
  description: string;
  isPrivate: boolean;
}

export interface MemberChannel {
  joinedAt: string;
  userId: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  status: string;
}

export interface ChannelConfig {
  id: string;
  channelId: string;
  backgroundUrl: string;
  backgroundColor: string;
  accent: string;
  createdAt: string;
  updatedAt: string;
}
