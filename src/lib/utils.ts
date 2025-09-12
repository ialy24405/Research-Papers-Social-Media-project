import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlaceHolderImages, type ImagePlaceholder } from "./placeholder-images"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getPlaceholderImage(id: string): ImagePlaceholder | undefined {
  return PlaceHolderImages.find((img) => img.id === id);
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
