/**
 * Swagger documentation cho module Customer Group
 */

export const customerGroupPaths = {
  "/customer-group": {
    get: {
      tags: ["Customer Group"],
      summary: "Lấy danh sách nhóm khách hàng",
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: "#/components/parameters/pageParam" },
        { $ref: "#/components/parameters/limitParam" },
        {
          name: "key",
          in: "query",
          schema: { type: "string" },
          description: "Từ khóa tìm kiếm",
        },
        {
          name: "publish",
          in: "query",
          schema: { type: "integer", enum: [0, 1] },
          description: "Trạng thái (0: Ẩn, 1: Hiển thị)",
        },
        {
          name: "seller_id",
          in: "query",
          schema: { type: "integer" },
          description: "ID nhà bán",
        },
      ],
      responses: {
        200: { description: "Thành công" },
        400: { description: "Lỗi validation" },
      },
    },
    post: {
      tags: ["Customer Group"],
      summary: "Tạo nhóm khách hàng mới",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerGroupCreate" },
          },
        },
      },
      responses: {
        200: { description: "Tạo thành công" },
        400: { description: "Lỗi validation" },
        403: { description: "Cần thuộc seller" },
      },
    },
  },
  "/customer-group/get-by-id/{id}": {
    get: {
      tags: ["Customer Group"],
      summary: "Lấy thông tin nhóm khách hàng theo ID",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      responses: {
        200: { description: "Thành công" },
        400: { description: "ID không hợp lệ" },
      },
    },
  },
  "/customer-group/{id}": {
    put: {
      tags: ["Customer Group"],
      summary: "Cập nhật nhóm khách hàng",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerGroupUpdate" },
          },
        },
      },
      responses: {
        200: { description: "Cập nhật thành công" },
        400: { description: "Lỗi validation" },
        403: { description: "Cần thuộc seller" },
      },
    },
    delete: {
      tags: ["Customer Group"],
      summary: "Xóa nhóm khách hàng",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      responses: {
        200: { description: "Xóa thành công" },
        400: {
          description: "ID không hợp lệ hoặc nhóm đang có khách hàng",
        },
        403: { description: "Cần thuộc seller" },
      },
    },
  },
  "/customer-group/update-publish/{id}": {
    put: {
      tags: ["Customer Group"],
      summary: "Cập nhật trạng thái hiển thị nhóm khách hàng",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdatePublish" },
          },
        },
      },
      responses: {
        200: { description: "Cập nhật thành công" },
        400: { description: "ID không hợp lệ" },
        403: { description: "Cần thuộc seller" },
      },
    },
  },
};

export const customerGroupSchemas = {
  CustomerGroupCreate: {
    type: "object",
    required: ["code", "name"],
    properties: {
      code: { type: "string", description: "Mã nhóm khách hàng" },
      name: { type: "string", description: "Tên nhóm khách hàng" },
      publish: {
        type: "integer",
        enum: [0, 1],
        description: "Trạng thái (0: Ẩn, 1: Hiển thị)",
      },
    },
  },
  CustomerGroupUpdate: {
    type: "object",
    required: ["code", "name", "publish"],
    properties: {
      code: { type: "string", description: "Mã nhóm khách hàng" },
      name: { type: "string", description: "Tên nhóm khách hàng" },
      publish: {
        type: "integer",
        enum: [0, 1],
        description: "Trạng thái (0: Ẩn, 1: Hiển thị)",
      },
    },
  },
};
