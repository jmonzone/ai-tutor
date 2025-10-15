export interface User {
  id: string;
  email: string;
  role: "guest" | "student";
}

export const guest: User = {
  id: "guest",
  email: "guest",
  role: "guest",
};
