import { ArrayMaxSize, IsArray, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class ByIdsDto {
  @IsArray({ message: "Danh sách ID phải là mảng" })
  @ArrayMaxSize(200, { message: "Danh sách ID tối đa 200 phần tử" })
  @IsInt({ each: true, message: "Mỗi ID phải là số nguyên" })
  @Type(() => Number)
  listId!: number[];
}
