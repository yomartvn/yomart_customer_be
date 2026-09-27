import { IsNotEmpty, IsIn } from "class-validator";

export class UpdatePublishDto {
  @IsNotEmpty({ message: "Trạng thái không được để trống" })
  @IsIn([0, 1], { message: "Trạng thái phải là 0 hoặc 1" })
  publish!: number;
}
