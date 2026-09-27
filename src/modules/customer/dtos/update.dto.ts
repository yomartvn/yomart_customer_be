import { IsString, IsNotEmpty, IsIn, IsOptional, IsEmail, IsDateString, Matches, IsInt } from "class-validator";

export class UpdateDto {
  @IsString({ message: "Tên phải là một chuỗi" })
  @IsNotEmpty({ message: "Tên khách hàng không được để trống" })
  name!: string;

  @Matches(/^0(3|5|7|8|9)[0-9]{8}$/, {
    message: "Số điện thoại không đúng định dạng (ví dụ: 0901234567)",
  })
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: "Email không hợp lệ" })
  email?: string;

  @IsOptional()
  @IsDateString({}, { message: "Ngày sinh không hợp lệ" })
  birthdate?: string;

  @IsOptional()
  @IsIn([0, 1, 2], { message: "Giới tính phải là 0 (Nữ), 1 (Nam) hoặc 2 (Khác)" })
  gender?: number;
  
  @IsIn([0, 1], { message: "Trạng thái phải là 0 hoặc 1" })
  @IsNotEmpty({ message: "Trạng thái không được để trống" })
  publish!: number;

  @IsOptional()
  @IsInt({ message: "ID nhóm khách hàng phải là số nguyên" })
  group_id?: number;
}
