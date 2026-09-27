import { IsDateString, IsIn, IsNotEmpty, IsString } from "class-validator";

export class UpdateFromProfileByIDDto {
  @IsString({ message: "Tên phải là một chuỗi" })
  @IsNotEmpty({ message: "Tên khách hàng không được để trống" })
  name!: string;

  @IsDateString({}, { message: "Ngày sinh không hợp lệ" })
  @IsNotEmpty({ message: "Ngày sinh không được để trống" })
  birthdate!: string;

  @IsIn([0, 1, 2], { message: "Giới tính phải là 0 (Nữ), 1 (Nam) hoặc 2 (Khác)" })
  @IsNotEmpty({ message: "Giới tính không được để trống" })
  gender!: number;
}
