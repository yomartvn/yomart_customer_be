import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateByRegisterDto {
  @IsString({ message: "Tên phải là một chuỗi" })
  @IsNotEmpty({ message: "Tên khách hàng không được để trống" })
  name!: string;

  @Matches(/^0(3|5|7|8|9)[0-9]{8}$/, {
    message: "Số điện thoại không đúng định dạng (ví dụ: 0901234567)",
  })
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  phone!: string;

  @IsEmail({}, { message: "Email không hợp lệ" })
  @IsNotEmpty({ message: "Email không được để trống" })
  email!: string;
}
