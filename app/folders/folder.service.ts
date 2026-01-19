// business logic, permission check
import { APIError, ErrCode } from "encore.dev/api";
import { FolderRepo } from "./folder.repo";
import {
     CreateFolderInput,
     ListFoldersInput,
     UpdateFolderInput,
} from "./folder.types";

export const FolderService = {
     // list folders
     async listFolders(userId: string, input: ListFoldersInput){
          const member = await FolderRepo.isOrgMember(
               userId,
               input.organizationId
          )
          if(!member) {
               throw new APIError(ErrCode.PermissionDenied, "Not org member")
          }
          return FolderRepo.listFolders(input.organizationId);
     },

     // create folder
     async createFolder(userId: string, input: CreateFolderInput){
          const member = await FolderRepo.isOrgMember(
               userId,
               input.organizationId
          )

          if(!member){
               throw new APIError(ErrCode.PermissionDenied, "Not org member")
          }

          return FolderRepo.createFolder(
               input.name,
               input.organizationId
          )
     },

     // update folder
     async updateFolder(userId: string, folderId: string, input: UpdateFolderInput){
          // check folder exist
          const folder = await FolderRepo.getFolderById(folderId);

          if(!folderId){
               throw new APIError(ErrCode.NotFound, "Folder Not Found")
          }

          // check member
          const member = await FolderRepo.isOrgMember(userId, folder.organizationId);
          if(!member){
               throw new APIError(ErrCode.PermissionDenied, "Not org member")
          }

          // update
          return FolderRepo.updateFolder(
               input.name,
               folderId
          )
     }
}
