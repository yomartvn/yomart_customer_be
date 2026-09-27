/**
 * Swagger documentation cho module Customer
 */

export const customerPaths = {
  "/customer": {
    get: {
      tags: ["Customer"],
      summary: "Lấy danh sách khách hàng",
      operationId: "getCustomers",
      description: "Lấy danh sách khách hàng với phân trang và bộ lọc. seller_id lấy từ token nếu không truyền.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: "#/components/parameters/pageParam" },
        { $ref: "#/components/parameters/limitParam" },
        {
          name: "key",
          in: "query",
          schema: { type: "string" },
          description: "Từ khóa tìm kiếm (tên, SĐT, email, mã khách hàng)",
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
          description: "ID nhà bán (tùy chọn)",
        },
        {
          name: "group_id",
          in: "query",
          schema: { type: "integer" },
          description: "ID nhóm khách hàng",
        },
        {
          name: "gender",
          in: "query",
          schema: { type: "integer", enum: [0, 1, 2] },
          description: "Giới tính (0: Nữ, 1: Nam, 2: Khác)",
        },
        {
          name: "city_id",
          in: "query",
          schema: { type: "integer" },
          description: "ID tỉnh/thành phố (lọc theo địa chỉ mặc định của khách hàng)",
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
                    items: { $ref: "#/components/schemas/CustomerListItem" },
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
      tags: ["Customer"],
      summary: "Tạo khách hàng mới",
      operationId: "createCustomer",
      description: "Tạo khách hàng mới. Có thể kèm địa chỉ mặc định. seller_id lấy từ token.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerCreate" },
            example: {
              name: "Nguyễn Văn A",
              phone: "0901234567",
              email: "nguyenvana@email.com",
              gender: 1,
              publish: 1,
              group_id: 1,
              address: {
                city_id: 1,
                ward_id: 1,
                address: "123 Đường ABC",
                address_type: "nha_rieng",
                name: "Nguyễn Văn A",
                phone: "0901234567",
              },
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
                  data: { $ref: "#/components/schemas/CustomerResponse" },
                },
              },
            },
          },
        },
        400: { description: "Lỗi validation (SĐT/email trùng, nhóm không tồn tại, địa chỉ không hợp lệ)" },
        403: { description: "Cần thuộc seller để tạo khách hàng" },
      },
    },
  },
  "/customer/get-by-id/{id}": {
    get: {
      tags: ["Customer"],
      summary: "Lấy thông tin khách hàng theo ID",
      operationId: "getCustomerById",
      description: "Lấy chi tiết khách hàng kèm địa chỉ mặc định và danh sách địa chỉ",
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
                  data: { $ref: "#/components/schemas/CustomerDetail" },
                },
              },
            },
          },
        },
        400: { description: "ID không hợp lệ" },
        404: { description: "Khách hàng không tồn tại" },
      },
    },
  },
  "/customer/{id}": {
    put: {
      tags: ["Customer"],
      summary: "Cập nhật khách hàng",
      operationId: "updateCustomer",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CustomerUpdate" },
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
                      name: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", nullable: true },
                      birthdate: { type: "string", format: "date-time", nullable: true },
                      gender: { type: "integer", nullable: true },
                      publish: { type: "integer" },
                      group_id: { type: "integer", nullable: true },
                      updated_at: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Lỗi validation hoặc không tìm thấy" },
      },
    },
    delete: {
      tags: ["Customer"],
      summary: "Xóa khách hàng",
      operationId: "deleteCustomer",
      description: "Xóa khách hàng và tất cả địa chỉ liên quan",
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
        400: { description: "ID không hợp lệ hoặc không tìm thấy" },
      },
    },
  },
  "/customer/update-publish/{id}": {
    put: {
      tags: ["Customer"],
      summary: "Cập nhật trạng thái hiển thị",
      operationId: "updateCustomerPublish",
      description: "Cập nhật trạng thái publish của khách hàng (0: Ẩn, 1: Hiển thị)",
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
        400: { description: "ID không hợp lệ" },
        404: { description: "Khách hàng không tồn tại" },
      },
    },
  },
};

export const customerSchemas = {
  Pagination: {
    type: "object",
    properties: {
      page: { type: "integer", description: "Trang hiện tại" },
      limit: { type: "integer", description: "Số lượng mỗi trang" },
      totalRow: { type: "integer", description: "Tổng số bản ghi" },
      totalPage: { type: "integer", description: "Tổng số trang" },
    },
  },
  CustomerListItem: {
    type: "object",
    properties: {
      id: { type: "integer" },
      code: { type: "string" },
      name: { type: "string" },
      phone: { type: "string", nullable: true },
      email: { type: "string", nullable: true },
      birthdate: { type: "string", format: "date-time", nullable: true },
      gender: { type: "integer", nullable: true },
      publish: { type: "integer" },
      seller_id: { type: "integer" },
      group_id: { type: "integer", nullable: true },
      group_name: { type: "string", nullable: true },
      city_name: { type: "string", nullable: true },
      full_address: { type: "string", nullable: true },
      create_id: { type: "integer", nullable: true },
      create_name: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },
  CustomerResponse: {
    type: "object",
    properties: {
      id: { type: "integer" },
      code: { type: "string" },
      name: { type: "string" },
      phone: { type: "string", nullable: true },
      email: { type: "string", nullable: true },
      birthdate: { type: "string", format: "date-time", nullable: true },
      gender: { type: "integer", nullable: true },
      publish: { type: "integer" },
      seller_id: { type: "integer" },
      group_id: { type: "integer", nullable: true },
      create_id: { type: "integer" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      address: {
        type: "object",
        nullable: true,
        description: "Địa chỉ mặc định (nếu có tạo khi create)",
      },
    },
  },
  CustomerDetail: {
    type: "object",
    properties: {
      id: { type: "integer" },
      code: { type: "string" },
      name: { type: "string" },
      phone: { type: "string", nullable: true },
      email: { type: "string", nullable: true },
      birthdate: { type: "string", format: "date-time", nullable: true },
      gender: { type: "integer", nullable: true },
      publish: { type: "integer" },
      seller_id: { type: "integer" },
      group_id: { type: "integer", nullable: true },
      group_name: { type: "string", nullable: true },
      create_id: { type: "integer", nullable: true },
      create_name: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      default_address: { type: "object", nullable: true },
      addresses: {
        type: "array",
        items: { type: "object" },
        description: "Danh sách tất cả địa chỉ",
      },
    },
  },
  CustomerCreate: {
    type: "object",
    required: ["name", "phone"],
    properties: {
      name: { type: "string", description: "Tên khách hàng" },
      phone: {
        type: "string",
        pattern: "^0(3|5|7|8|9)[0-9]{8}$",
        description: "Số điện thoại (VD: 0901234567)",
      },
      email: { type: "string", format: "email", description: "Email" },
      birthdate: {
        type: "string",
        format: "date-time",
        description: "Ngày sinh (ISO 8601)",
      },
      gender: {
        type: "integer",
        enum: [0, 1, 2],
        description: "Giới tính (0: Nữ, 1: Nam, 2: Khác)",
      },
      publish: {
        type: "integer",
        enum: [0, 1],
        default: 1,
        description: "Trạng thái (0: Ẩn, 1: Hiển thị)",
      },
      group_id: { type: "integer", description: "ID nhóm khách hàng" },
      address: {
        type: "object",
        description: "Địa chỉ mặc định (tùy chọn). Nếu truyền sẽ tạo địa chỉ mặc định.",
        required: ["city_id", "ward_id", "address"],
        properties: {
          city_id: { type: "integer", description: "ID tỉnh/thành phố" },
          ward_id: { type: "integer", description: "ID phường/xã" },
          address: { type: "string", description: "Địa chỉ chi tiết (số nhà, đường...)" },
          address_type: {
            type: "string",
            enum: ["nha_rieng", "van_phong"],
            default: "nha_rieng",
            description: "Loại địa chỉ",
          },
          name: { type: "string", description: "Tên người nhận (mặc định: tên khách hàng)" },
          phone: {
            type: "string",
            pattern: "^0(3|5|7|8|9)[0-9]{8}$",
            description: "Số điện thoại (mặc định: SĐT khách hàng)",
          },
        },
      },
    },
  },
  CustomerUpdate: {
    type: "object",
    required: ["name", "phone", "publish"],
    properties: {
      name: { type: "string", description: "Tên khách hàng" },
      phone: {
        type: "string",
        pattern: "^0(3|5|7|8|9)[0-9]{8}$",
        description: "Số điện thoại (VD: 0901234567)",
      },
      email: { type: "string", format: "email", description: "Email" },
      birthdate: {
        type: "string",
        format: "date-time",
        description: "Ngày sinh (ISO 8601)",
      },
      gender: {
        type: "integer",
        enum: [0, 1, 2],
        description: "Giới tính (0: Nữ, 1: Nam, 2: Khác)",
      },
      publish: {
        type: "integer",
        enum: [0, 1],
        description: "Trạng thái (0: Ẩn, 1: Hiển thị) - bắt buộc",
      },
      group_id: { type: "integer", description: "ID nhóm khách hàng" },
    },
  },
};
