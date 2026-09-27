import { IsNotEmpty, IsIn } from "class-validator";
import { Type } from "class-transformer";

export class UpdateDefaultDto {
  @IsIn([0, 1], { message: "Địa chỉ mặc định phải là 0 hoặc 1" })
  @IsNotEmpty({ message: "Địa chỉ mặc định không được để trống" })
  @Type(() => Number)
  is_default!: number;
}
