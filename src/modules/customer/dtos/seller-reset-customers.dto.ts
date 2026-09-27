import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === "true" || value === 1 || value === "1";

export class SellerResetCustomersDto {
  @IsOptional()
  @IsBoolean({ message: "dry_run phải là boolean" })
  @Transform(toBoolean)
  dry_run?: boolean;

  /** Bắt buộc khi dry_run=false. Giá trị: RESET */
  @IsOptional()
  @IsString({ message: "confirm phải là chuỗi" })
  confirm?: string;

  @IsOptional()
  @IsBoolean({ message: "reset_orders phải là boolean" })
  @Transform(toBoolean)
  reset_orders?: boolean;
}
