import { IsString, IsNotEmpty, IsIn } from "class-validator";

export class UpdateDto {
  @IsNotEmpty({ message: "Mã nhóm khách hàng không được để trống" })
  @IsString({ message: "Mã phải là một chuỗi" })
  code!: string;

  @IsString({ message: "Tên phải là một chuỗi" })
  @IsNotEmpty({ message: "Tên nhóm khách hàng không được để trống" })
  name!: string;

  @IsNotEmpty({ message: "Trạng thái không được để trống" })
  @IsIn([0, 1], { message: "Trạng thái phải là 0 hoặc 1" })
  publish!: number;
}
