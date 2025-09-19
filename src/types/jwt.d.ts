export interface JwtUserPayload {
  id: string;
  role: "customer" | "admin";
  iat?: number;
  exp?: number;
}
