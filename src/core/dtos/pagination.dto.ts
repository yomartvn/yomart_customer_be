import { IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @IsNumber({}, { message: "Trang phải là một số" })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber({}, { message: "Số lượng phải là một số" })
  @Type(() => Number)
  limit?: number;
}
