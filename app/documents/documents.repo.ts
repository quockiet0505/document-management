import  { db } from "../../drizzle/db"
import { users, organizations, organizationMembers} from "../../drizzle/schema"
import { eq, and} from "drizzle-orm"
