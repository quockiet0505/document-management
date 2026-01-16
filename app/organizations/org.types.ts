// 
export type Organization ={
     id: string
     name: string
     createdAt: Date
}

export type OrgMember = {
     userId: string
     organizationId: string
     role: "admin" | "member"
}