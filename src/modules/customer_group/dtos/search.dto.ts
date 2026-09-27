import { IsIn, IsOptional, IsString, IsInt } from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "@core/dtos/pagination.dto";

export class SearchDto extends PaginationDto {
  @IsString({ message: "Từ khóa phải là một chuỗi" })
  @IsOptional()
  key?: string;

  @IsIn([0, 1], { message: "Trạng thái phải là 0 hoặc 1" })
  @Type(() => Number)
  @IsOptional()
  publish?: number;

  @IsInt({ message: "ID nhà bán phải là số nguyên" })
  @Type(() => Number)
  @IsOptional()
  seller_id?: number;
}
