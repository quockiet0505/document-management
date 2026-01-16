//  recognize service and gateway setup
import { Service } from "encore.dev/service";
import { Gateway } from "encore.dev/api";
import { authHandlerInstance } from "../app/auth/auth.handler";

export default new Service("app");

export const gateway = new Gateway({
  authHandler: authHandlerInstance,
});
