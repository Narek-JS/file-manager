import { S3_API_KEY, UPLOAD_URL, FOLDERS_URL, DELETE_URL } from "../constants";

export const getFolders = async (path: string = "") => {
  const URL = FOLDERS_URL + (path ? `?folder=${path}` : "");

  const res = await fetch(URL, {
    headers: { "s3-api-key": S3_API_KEY },
  });
  const data = await res.json();

  return data?.data || null;
};

export const uploadFiles = async (body: FormData) => {
  const res = await fetch(UPLOAD_URL, {
    headers: { "s3-api-key": S3_API_KEY },
    method: "POST",
    body,
  });

  return res;
};

export const deleteFiles = async (body: {
  images: Array<string>;
  folder: string;
}) => {
  const res = await fetch(DELETE_URL, {
    headers: { "s3-api-key": S3_API_KEY },
    method: "POST",
    body: JSON.stringify(body),
  });

  return res;
};
