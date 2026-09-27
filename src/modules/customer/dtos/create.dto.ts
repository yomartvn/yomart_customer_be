import { IsNotEmpty, IsString, IsOptional, IsIn, IsEmail, IsDateString, Matches, IsInt, ValidateNested } from "class-validator";
import { Type, Transform } from "class-transformer";

export class CreateAddressDto {
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

  @IsOptional()
  @IsIn(["nha_rieng", "van_phong"], { message: "Loại địa chỉ phải là nha_rieng hoặc van_phong" })
  address_type?: string;

  @IsOptional()
  @IsString({ message: "Tên người nhận phải là chuỗi" })
  name?: string;

  @IsOptional()
  @Matches(/^0(3|5|7|8|9)[0-9]{8}$/, {
    message: "Số điện thoại không đúng định dạng (ví dụ: 0901234567)",
  })
  phone?: string;
}

export class CreateDto {
  @IsString({ message: "Tên phải là một chuỗi" })
  @IsNotEmpty({ message: "Tên khách hàng không được để trống" })
  name!: string;

  @Matches(/^0(3|5|7|8|9)[0-9]{8}$/, {
    message: "Số điện thoại không đúng định dạng (ví dụ: 0901234567)",
  })
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  phone!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" && value.trim() === "" ? undefined : value))
  @IsEmail({}, { message: "Email không hợp lệ" })
  email?: string;

  @IsOptional()
  @IsDateString({}, { message: "Ngày sinh không hợp lệ" })
  birthdate?: string;

  @IsOptional()
  @IsIn([0, 1, 2], { message: "Giới tính phải là 0 (Nữ), 1 (Nam) hoặc 2 (Khác)" })
  gender?: number;

  @IsOptional()
  @IsIn([0, 1], { message: "Trạng thái phải là 0 hoặc 1" })
  publish?: number;

  @IsOptional()
  @IsInt({ message: "ID nhóm khách hàng phải là số nguyên" })
  group_id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;
}
