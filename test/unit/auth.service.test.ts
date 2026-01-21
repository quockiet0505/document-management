import { vi, describe, it, expect, beforeEach } from "vitest"
import { APIError, ErrCode } from "encore.dev/api"

// mock AuthRepo
vi.mock("../../app/auth/auth.repo", async () => {
  const mod = await import("../mocks/auth.repo")
  return mod
})

// mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

// mock jwt
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}))

// mock encore secret
vi.mock("encore.dev/config", () => ({
  secret: () => () => "test-secret",
}))

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { AuthService } from "../../app/auth/auth.service"
import { AuthRepo } from "../mocks/auth.repo"

// common data
const email = "test@example.com"
const password = "password123"
const userId = "user-1"

beforeEach(() => {
  Object.values(AuthRepo).forEach(fn => fn.mockReset())
  ;(bcrypt.hash as any).mockReset()
  ;(bcrypt.compare as any).mockReset()
  ;(jwt.sign as any).mockReset()
})

// test register
// check email existing
describe("AuthService.register", () => {
     it("throws AlreadyExists if email exists", async () => {
       AuthRepo.findUserByEmail.mockResolvedValue({ id: userId })
   
       await expect(
         AuthService.register({
           email,
           password,
           fullName: "Test User",
         } as any)
       ).rejects.toMatchObject({
         code: ErrCode.AlreadyExists,
       })
   
       expect(AuthRepo.createUser).not.toHaveBeenCalled()
     })
     it("registers user and returns token", async () => {
          AuthRepo.findUserByEmail.mockResolvedValue(null)
      
          ;(bcrypt.hash as any).mockResolvedValue("hashed-password")
      
          AuthRepo.createUser.mockResolvedValue({
            id: userId,
            email,
          })
      
          ;(jwt.sign as any).mockReturnValue("jwt-token")
      
          const res = await AuthService.register({
            email,
            password,
            fullName: "Test User",
            phone: "0123456789",
          } as any)
      
          expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
      
          expect(AuthRepo.createUser).toHaveBeenCalledWith({
            email,
            passwordHash: "hashed-password",
            fullName: "Test User",
            phone: "0123456789",
          })
      
          expect(jwt.sign).toHaveBeenCalledWith(
            { userID: userId },
            "test-secret",
            { expiresIn: "7d" }
          )
      
          expect(res).toEqual({
            userId,
            token: "jwt-token",
          })
        })
})


// test login
describe("AuthService.login", () => {
     it("throws Unauthenticated if user not found", async () => {
       AuthRepo.findUserByEmail.mockResolvedValue(null)
   
       await expect(
         AuthService.login({ email, password })
       ).rejects.toMatchObject({
         code: ErrCode.Unauthenticated,
       })
     })
     it("throws Unauthenticated if password is invalid", async () => {
          AuthRepo.findUserByEmail.mockResolvedValue({
            id: userId,
            passwordHash: "hashed",
          })
      
          ;(bcrypt.compare as any).mockResolvedValue(false)
      
          await expect(
            AuthService.login({ email, password })
          ).rejects.toMatchObject({
            code: ErrCode.Unauthenticated,
          })
        })
        it("logs in user and returns token", async () => {
          AuthRepo.findUserByEmail.mockResolvedValue({
            id: userId,
            passwordHash: "hashed",
          })
      
          ;(bcrypt.compare as any).mockResolvedValue(true)
          ;(jwt.sign as any).mockReturnValue("jwt-token")
      
          const res = await AuthService.login({ email, password })
      
          expect(bcrypt.compare).toHaveBeenCalledWith(password, "hashed")
      
          expect(jwt.sign).toHaveBeenCalledWith(
            { userID: userId },
            "test-secret",
            { expiresIn: "7d" }
          )
      
          expect(res).toEqual({
            userId,
            token: "jwt-token",
          })
        })
 })
               
