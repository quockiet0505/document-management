import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import {
     ListFoldersSchema,
     CreateFolderSchema,
     UpdateFolderSchema
} from "./folder.schema";

import {
     ListFoldersInput,
     CreateFolderInput,
     UpdateFolderRequest,
     IdRequest
} from "./folder.types";

import {FolderService } from "./folder.service";

// list folders
export const listFolders = api(
     {method: "POST", path: "/v1/folders", auth: true},

     async ( req: ListFoldersInput ) =>{
          const input = ListFoldersSchema.parse(req);
          const auth = getAuthData();

          return FolderService.listFolders(auth.userID, input);
     } 
)

// create folder
export const createFolder = api(
     {method: "POST", path: "/v1/folders/create", auth: true},
     async (req: CreateFolderInput) =>{
          const input = CreateFolderSchema.parse(req);

          const auth = getAuthData();
          return FolderService.createFolder(auth.userID, input)
     }
)

// update folder
export const updateFolder = api(
     {method: "PUT", path: "/v1/folders/:id", auth: true},
     async (req: UpdateFolderRequest) =>{
          const input = UpdateFolderSchema.parse({
               folderId: req.id,    // map path param
               name: req.name
          });

          if (!input.name) {
               throw APIError.invalidArgument("name is required");
          }

          const auth = getAuthData();
          return FolderService.updateFolder(
               auth.userID,
               req.id,
               { name: input.name }
          )
     }
)