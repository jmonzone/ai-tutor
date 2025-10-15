export interface FileMetadata {
  id: string;
  userId: string;
  filename: string;
  s3Key: string;
}

export const defaultMetaData = {
  id: "",
  userId: "",
  filename: "",
  s3Key: "",
};
