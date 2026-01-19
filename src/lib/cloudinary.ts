import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getSignature = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "newsportal",
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return { timestamp, signature };
};

export const uploadImage = async (file: string) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: "newsportal",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 1200, crop: "limit" },
    ],
  });

  return result;
};

export const deleteImage = async (publicId: string) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

export const getOptimizedUrl = (url: string, width?: number) => {
  if (!url.includes("cloudinary.com")) return url;

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transformations = width
    ? `q_auto,f_auto,w_${width}`
    : "q_auto,f_auto";

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

export default cloudinary;
