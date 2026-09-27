import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";

export class CreateDto {
  @IsNotEmpty({ message: "Mã nhóm khách hàng không được để trống" })
  @IsString({ message: "Mã phải là một chuỗi" })
  code!: string;

  @IsNotEmpty({ message: "Tên nhóm khách hàng không được để trống" })
  @IsString({ message: "Tên phải là một chuỗi" })
  name!: string;

  @IsOptional()
  @IsIn([0, 1], { message: "Trạng thái phải là 0 hoặc 1" })
  publish?: number;
}
