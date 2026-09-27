import { IsNotEmpty, IsString, IsInt, IsIn, IsOptional, Matches } from "class-validator";
import { Type } from "class-transformer";

export class CreateDto {

  @IsInt({ message: "ID khách hàng phải là số nguyên" })
  @IsNotEmpty({ message: "ID khách hàng không được để trống" })
  @Type(() => Number)
  customer_id!: number;

  @IsString({ message: "Tên phải là một chuỗi" })
  @IsNotEmpty({ message: "Tên không được để trống" })
  name!: string;

  
  @IsString({ message: "Loại địa chỉ phải là chuỗi" })
  @IsIn(["nha_rieng", "van_phong"], { message: "Loại địa chỉ phải là nha_rieng hoặc van_phong" })
  @IsNotEmpty({ message: "Loại địa chỉ không được để trống" })
  address_type!: string;

  @IsOptional()
  @IsIn([0, 1], { message: "Trạng thái phải là 0 hoặc 1" })
  @Type(() => Number)
  publish?: number;

  @IsOptional()
  @IsIn([0, 1], { message: "Địa chỉ mặc định phải là 0 hoặc 1" })
  @Type(() => Number)
  is_default?: number;


  @IsInt({ message: "ID tỉnh/thành phải là số nguyên" })
  @IsNotEmpty({ message: "ID tỉnh/thành không được để trống" })
  @Type(() => Number)
  city_id!: number;

  @IsInt({ message: "ID phường xã phải là số nguyên" })
  @IsNotEmpty({ message: "ID phường xã không được để trống" })
  @Type(() => Number)
  ward_id!: number;

  @IsString({ message: "Địa chỉ phải là chuỗi" })
  @IsNotEmpty({ message: "Địa chỉ không được để trống" })
  address!: string;

  
  @IsString({ message: "Số điện thoại phải là chuỗi" })
  @Matches(/^0(3|5|7|8|9)[0-9]{8}$/, {
    message: "Số điện thoại không đúng định dạng (ví dụ: 0901234567)",
  })
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  phone!: string;
}
