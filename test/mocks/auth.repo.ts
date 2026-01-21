import { vi } from "vitest"

export const AuthRepo = {
     findUserById: vi.fn(),
     getMembershipByOrg: vi.fn(),
     findUserByEmail: vi.fn(),
     createUser: vi.fn(),
}