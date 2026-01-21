import { vi } from "vitest"

// fake database for organizations
export const OrgRepo = {
  createOrg: vi.fn(),
  addMemberToOrg: vi.fn(),
  listOrgsOfUser: vi.fn(),
}
