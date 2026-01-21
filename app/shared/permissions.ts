// permissions
import { APIError, ErrCode } from "encore.dev/api"
import { AuthRepo } from "../auth/auth.repo"


export type Role = "admin" | "member"

export async function requireRole(params: {
  userId: string
  organizationId: string
  roles: Role[]
}) {
  const { userId, organizationId, roles } = params

  const member = await AuthRepo.getMembershipByOrg(userId, organizationId)

  if (!member) {
    throw new APIError(
      ErrCode.PermissionDenied,
      "User is not a member of the organization"
    )
  }

  if (!roles.includes(member.role)) {
    throw new APIError(
      ErrCode.PermissionDenied,
      "Insufficient permissions"
    )
  }

  return member
}
