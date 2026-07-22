export type ChannelDM = {
  id: string;
  workspaceId: any;
  name: string;
  description: string;
  type: string;
  isPrivate: boolean;
  createdAt: string;
  members: {
    channelId: string;
    userId: string;
    joinedAt: string;
    user: {
      id: string;
      email: string;
      password: string;
      username: string;
      displayName: string;
      avatar: string | null;
      bio: string | null;
      status: string;
      createdAt: string;
      updatedAt: string;
      dateOfBirth: string;
      phone: string;
      gender: string;
      fullName: string;
    };
  };
};
