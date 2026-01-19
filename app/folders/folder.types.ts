// type
export interface ListFoldersInput{
     organizationId: string;
}

export interface CreateFolderInput{
     organizationId: string;
     name: string;
}

export interface UpdateFolderInput{
     name: string;
}

// request for api
export interface ListFoldersRequest extends ListFoldersInput{}
export interface CreateFolderRequest extends CreateFolderInput{}

export interface IdRequest{
     id: string;
}
export interface UpdateFolderRequest {
     id: string;
     name?: string;
}