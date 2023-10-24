
export enum UserVerifyStatus {
    Unverified, // Chua xac thuc email, mac dinh = 0
    Verified, // da xac thuc email,
    Banned // Bi khoa
  }

  // Ko duoc thay doi thu tu token trong obj nay
export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum EncodingStatus {
  Pending,
  Processing,
  Success,
  Failed
}