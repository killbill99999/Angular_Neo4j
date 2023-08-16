import { Brand } from "./brand";

export interface BrandRes {
  brandCategoryDto: Brand[];
  id: number;
  brandName: string;
  brandOriginName: string;
  brandCollaboration: number;
  brandVendorId: number;
  brandVendorName: string;
  userId: number;
  userName: string;
  brandCountry: number;
  newItemTypeFbStatus: boolean;
  newItemTypeHlStatus: boolean;
  newItemTypeSfStatus: boolean;
  newItemTypeHfStatus: boolean;
  createDate: string;
  updateDate: string;
  createUser: string;
  updateUser: string;
}
