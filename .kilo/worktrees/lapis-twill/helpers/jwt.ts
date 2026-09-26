// lib/jwt.ts (using jose)

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode("secret");

export async function signJwt(payload: JWTPayload): Promise<string | null> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Token expiration time (7 days)
      .sign(secret);

    return token;
  } catch (error) {
    console.error('JWT signing error:', error);
    return null;
  }
}

export async function verifyJwt(token: string): Promise<JWTPayload | null> {
  try {
    if(!token){
      return null
    }
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.log('JWT verification error:', error);
    return null;
  }
}