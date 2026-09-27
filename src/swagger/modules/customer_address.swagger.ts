/**
 * Swagger documentation cho module Customer Address
 */

export const customerAddressPaths = {
  "/customer-address": {
    get: {
      tags: ["Customer Address"],
      summary: "Lấy danh sách địa chỉ khách hàng",
      operationId: "getCustomerAddresses",
      description: "Lấy danh sách địa chỉ với phân trang và bộ lọc",
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: "#/components/parameters/pageParam" },
        { $ref: "#/components/parameters/limitParam" },
        {
          name: "key",
          in: "query",
          schema: { type: "string" },
          description: "Từ khóa tìm kiếm (tên, SĐT)",
        },
        {
          name: "publish",
          in: "query",
          schema: { type: "integer", enum: [0, 1] },
          description: "Trạng thái (0: Ẩn, 1: Hiển thị)",
        },
        {
          name: "customer_id",
          in: "query",
          schema: { type: "integer" },
          description: "ID khách hàng",
        },
        {
          name: "city_id",
          in: "query",
          schema: { type: "integer" },
          description: "ID tỉnh/thành phố",
        },
      ],
      responses: {
        200: {
          description: "Thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CustomerAddressListItem" },
                  },
                  pagination: { $ref: "#/components/schemas/Pagination" },
                },
              },
            },
          },
        },
        400: { description: "Lỗi validation" },
      },
    },
    post: {
      tags: ["Customer Address"],
      summary: "Tạo địa chỉ mới",
      operationId: "createCustomerAddress",
      description: "Tạo địa chỉ mới cho khách hàng. Nếu is_default=1 sẽ cập nhật các địa chỉ khác của khách hàng về không mặc định.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerAddressCreate" },
            example: {
              customer_id: 1,
              name: "Nguyễn Văn A",
              address_type: "nha_rieng",
              publish: 1,
              is_default: 0,
              city_id: 1,
              ward_id: 1,
              address: "123 Đường ABC",
              phone: "0901234567",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Tạo thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/CustomerAddressResponse" },
                },
              },
            },
          },
        },
        400: {
          description:
            "Lỗi validation (khách hàng/tỉnh/phường không tồn tại, phường không thuộc tỉnh)",
        },
      },
    },
  },
  "/customer-address/get-by-id/{id}": {
    get: {
      tags: ["Customer Address"],
      summary: "Lấy thông tin địa chỉ theo ID",
      operationId: "getCustomerAddressById",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      responses: {
        200: {
          description: "Thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/CustomerAddressDetail" },
                },
              },
            },
          },
        },
        400: { description: "ID không hợp lệ" },
        404: { description: "Địa chỉ không tồn tại" },
      },
    },
  },
  "/customer-address/{id}": {
    put: {
      tags: ["Customer Address"],
      summary: "Cập nhật địa chỉ",
      operationId: "updateCustomerAddress",
      description:
        "Cập nhật địa chỉ. Lưu ý: Địa chỉ mặc định không cho phép cập nhật publish.",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerAddressUpdate" },
          },
        },
      },
      responses: {
        200: {
          description: "Cập nhật thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/CustomerAddressResponse" },
                },
              },
            },
          },
        },
        400: {
          description:
            "Lỗi validation (tỉnh/phường không tồn tại, phường không thuộc tỉnh)",
        },
      },
    },
    delete: {
      tags: ["Customer Address"],
      summary: "Xóa địa chỉ",
      operationId: "deleteCustomerAddress",
      description: "Không thể xóa địa chỉ mặc định (is_default=1)",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      responses: {
        200: {
          description: "Xóa thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: { id: { type: "integer" } },
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "ID không hợp lệ, không tìm thấy, hoặc không thể xóa địa chỉ mặc định",
        },
      },
    },
  },
  "/customer-address/update-publish/{id}": {
    put: {
      tags: ["Customer Address"],
      summary: "Cập nhật trạng thái hiển thị",
      operationId: "updateCustomerAddressPublish",
      description:
        "Cập nhật publish. Không áp dụng cho địa chỉ mặc định (is_default=1).",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdatePublish" },
          },
        },
      },
      responses: {
        200: {
          description: "Cập nhật thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      publish: { type: "integer", enum: [0, 1] },
                      updated_at: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "ID không hợp lệ hoặc không thể cập nhật publish địa chỉ mặc định",
        },
        404: { description: "Địa chỉ không tồn tại" },
      },
    },
  },
  "/customer-address/update-default/{id}": {
    put: {
      tags: ["Customer Address"],
      summary: "Đặt địa chỉ mặc định",
      operationId: "updateCustomerAddressDefault",
      description:
        "Đặt is_default. Khi đặt 1, tất cả địa chỉ khác của khách hàng sẽ về 0.",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateDefault" },
          },
        },
      },
      responses: {
        200: {
          description: "Cập nhật thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      is_default: { type: "integer", enum: [0, 1] },
                      updated_at: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "ID không hợp lệ" },
        404: { description: "Địa chỉ không tồn tại" },
      },
    },
  },
};

export const customerAddressSchemas = {
  CustomerAddressListItem: {
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      phone: { type: "string", nullable: true },
      publish: { type: "integer" },
      is_default: { type: "integer" },
      address_type: { type: "string" },
      full_address: { type: "string", nullable: true },
      create_id: { type: "integer", nullable: true },
      creator_name: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },
  CustomerAddressDetail: {
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      phone: { type: "string", nullable: true },
      address_type: { type: "string" },
      publish: { type: "integer" },
      is_default: { type: "integer" },
      customer_id: { type: "integer" },
      full_address: { type: "string", nullable: true },
      create_id: { type: "integer", nullable: true },
      creator_name: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },
  CustomerAddressResponse: {
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      phone: { type: "string", nullable: true },
      publish: { type: "integer" },
      is_default: { type: "integer" },
      customer_id: { type: "integer" },
      city_id: { type: "integer" },
      ward_id: { type: "integer" },
      address: { type: "string", nullable: true },
      address_type: { type: "string", nullable: true },
      create_id: { type: "integer" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },
  CustomerAddressCreate: {
    type: "object",
    required: [
      "customer_id",
      "name",
      "address_type",
      "city_id",
      "ward_id",
      "address",
      "phone",
    ],
    properties: {
      customer_id: { type: "integer", description: "ID khách hàng" },
      name: { type: "string", description: "Tên người nhận" },
      address_type: {
        type: "string",
        enum: ["nha_rieng", "van_phong"],
        description: "Loại địa chỉ",
      },
      publish: {
        type: "integer",
        enum: [0, 1],
        default: 1,
        description: "Trạng thái (0: Ẩn, 1: Hiển thị)",
      },
      is_default: {
        type: "integer",
        enum: [0, 1],
        default: 0,
        description: "Địa chỉ mặc định (0: Không, 1: Có)",
      },
      city_id: { type: "integer", description: "ID tỉnh/thành phố" },
      ward_id: { type: "integer", description: "ID phường/xã" },
      address: { type: "string", description: "Địa chỉ chi tiết (số nhà, đường...)" },
      phone: {
        type: "string",
        pattern: "^0(3|5|7|8|9)[0-9]{8}$",
        description: "Số điện thoại (VD: 0901234567)",
      },
    },
  },
  CustomerAddressUpdate: {
    type: "object",
    required: ["name", "address_type", "publish", "city_id", "ward_id", "address", "phone"],
    properties: {
      name: { type: "string", description: "Tên người nhận" },
      address_type: {
        type: "string",
        enum: ["nha_rieng", "van_phong"],
        description: "Loại địa chỉ",
      },
      publish: {
        type: "integer",
        enum: [0, 1],
        description: "Trạng thái (0: Ẩn, 1: Hiển thị). Địa chỉ mặc định không cho cập nhật.",
      },
      is_default: {
        type: "integer",
        enum: [0, 1],
        description: "Địa chỉ mặc định (0: Không, 1: Có)",
      },
      city_id: { type: "integer", description: "ID tỉnh/thành phố" },
      ward_id: { type: "integer", description: "ID phường/xã" },
      address: { type: "string", description: "Địa chỉ chi tiết" },
      phone: {
        type: "string",
        pattern: "^0(3|5|7|8|9)[0-9]{8}$",
        description: "Số điện thoại (VD: 0901234567)",
      },
    },
  },
  UpdateDefault: {
    type: "object",
    required: ["is_default"],
    properties: {
      is_default: {
        type: "integer",
        enum: [0, 1],
        description: "Địa chỉ mặc định (0: Không, 1: Có)",
      },
    },
  },
};
