/**
 * Swagger documentation cho Internal API (server-to-server)
 */

export const internalPaths = {
  "/internal/customers/by-ids": {
    post: {
      tags: ["Internal"],
      summary: "Lấy danh sách khách hàng theo list ID",
      operationId: "getInternalCustomersByIds",
      description:
        "API nội bộ dùng cho các service khác (order, seller, ...). " +
        "Xác thực bằng INTERNAL_API_KEY qua header Authorization. " +
        "Chỉ trả về các khách hàng tồn tại trong DB.",
      security: [{ internalAuth: [] }],
      parameters: [
        {
          name: "X-Service-Id",
          in: "header",
          required: false,
          schema: { type: "string", example: "order-service" },
          description: "Tên service gọi API (tùy chọn, dùng để trace log)",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/InternalCustomerByIdsRequest" },
            example: {
              listId: [1, 2, 15],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Thành công",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InternalCustomerByIdsResponse" },
              example: {
                statusCode: 200,
                message: "Tìm thấy dữ liệu",
                data: [
                  {
                    id: 1,
                    name: "Nguyễn Văn A",
                    code: "KH-000001",
                    phone: "0901234567",
                    email: "a@example.com",
                  },
                  {
                    id: 2,
                    name: "Trần Thị B",
                    code: "KH-000002",
                    phone: "0912345678",
                    email: "b@example.com",
                  },
                ],
              },
            },
          },
        },
        400: { description: "Dữ liệu không hợp lệ (listId không phải mảng số nguyên, vượt quá 200 ID)" },
        401: { description: "Thiếu hoặc sai internal API token" },
        503: { description: "INTERNAL_API_KEY chưa được cấu hình trên server" },
      },
    },
  },
};

export const internalSchemas = {
  InternalCustomerByIdsRequest: {
    type: "object",
    required: ["listId"],
    properties: {
      listId: {
        type: "array",
        items: { type: "integer" },
        maxItems: 200,
        description: "Danh sách ID khách hàng cần lấy (tối đa 200)",
        example: [1, 2, 15],
      },
    },
  },
  InternalCustomerItem: {
    type: "object",
    properties: {
      id: { type: "integer", description: "ID khách hàng" },
      name: { type: "string", description: "Tên khách hàng" },
      code: { type: "string", description: "Mã khách hàng (VD: KH-000001)" },
      phone: { type: "string", nullable: true, description: "Số điện thoại" },
      email: { type: "string", nullable: true, description: "Email" },
    },
  },
  InternalCustomerByIdsResponse: {
    type: "object",
    properties: {
      statusCode: { type: "integer", example: 200 },
      message: { type: "string", example: "Tìm thấy dữ liệu" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/InternalCustomerItem" },
      },
    },
  },
};
