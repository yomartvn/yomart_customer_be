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

  @IsInt({ message: "ID nhóm khách hàng phải là số nguyên" })
  @Type(() => Number)
  @IsOptional()
  group_id?: number;

  @IsIn([0, 1, 2], { message: "Giới tính phải là 0 (Nữ), 1 (Nam) hoặc 2 (Khác)" })
  @Type(() => Number)
  @IsOptional()
  gender?: number;

  @IsInt({ message: "ID tỉnh/thành phố phải là số nguyên" })
  @Type(() => Number)
  @IsOptional()
  city_id?: number;
}
