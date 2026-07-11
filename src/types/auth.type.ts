export type RegisterBodyType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
};

export type LoginBodyType = {
  email: string;
  password: string;
};
