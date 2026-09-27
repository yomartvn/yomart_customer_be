const messages = {
    // AUTH - forgot password
    SEND_EMAIL_SUCCESS: "Gửi email thành công",
    SEND_EMAIL_FAILED: "Gửi email thất bại",
    TOKEN_REQUIRED: "Token là bắt buộc",
    TOKEN_EXPIRED: "Token đã hết hạn",
    SERVER_ERROR: "Lỗi server",
    ROUTE_NOT_FOUND: "Không tìm thấy đường dẫn này, vui lòng kiểm tra lại",
    ACTION_NOT_FOUND: "Không tìm thấy thao tác",
    CHECK_PERMISSION_ERROR: "Lỗi khi kiểm tra quyền",
    NO_PERMISSION: "Bạn không có quyền truy cập chức năng này",

    // AUTH - login
    PHONE_NOT_EXISTED: "Số điện thoại không tồn tại",
    ACCOUNT_NOT_EXISTED: "Tài khoản không tồn tại",
    ACCOUNT_NOT_ACTIVE: "Tài khoản chưa được kích hoạt / đã bị khóa",
    PASSWORD_INCORRECT: "Mật khẩu không chính xác",
    LOGIN_SUCCESS: "Đăng nhập thành công",
    REGISTER_SUCCESS: "Đăng ký thành công",
    LOGIN_FAILED: "Đăng nhập thất bại",
    GET_FAILED: "Bạn không có quyền truy cập",

    // CRUD - get all/by id
    NOT_FOUND: "Không tìm thấy dữ liệu",
    FIND_ALL_SUCCESS: "Tìm thấy dữ liệu",
    FIND_ALL_FAILED: "Không tìm thấy dữ liệu",
    FIND_BY_ID_SUCCESS: "Tìm thấy dữ liệu",
    FIND_BY_ID_FAILED: "Không tìm thấy dữ liệu",

    // CRUD - create
    CREATE_SUCCESS: "Thêm dữ liệu thành công",
    CREATE_FAILED: "Thêm dữ liệu thất bại",

    // CRUD - upadate
    UPDATE_SUCCESS: "Cập nhật dữ liệu thành công",
    UPDATE_FAILED: "Cập nhật dữ liệu thất bại",

    // CRUD - delete
    DELETE_SUCCESS: "Xóa dữ liệu thành công",
    DELETE_FAILED: "Xóa dữ liệu thất bại",
    DELETE_MULTIPLE_NOT_VALID: "Danh sách ID không hợp lệ",

    // validate
    INVALID_ID: "Không hợp lệ",
    INVALID_NAME: "Tên không hợp lệ",
    INVALID_PAGE_LIMIT: "Trang và số lượng không hợp lệ",
    INVALID_LIMIT: "Số lượng không hợp lệ",
    INVALID_EMAIL: "Email không hợp lệ",
    INVALID_PHONE: "Số điện thoại không hợp lệ",
    INVALID_PASSWORD: "Mật khẩu không hợp lệ",
    INVALID_STATUS: "Trạng thái không hợp lệ",
    INVALID_PARAMS: "Tham số không hợp lệ",
    MISSING_PARAMS: "Thiếu tham số",
    PHONE_NOT_VALID: "Số điện thoại không hợp lệ",
    VALIDATION_FAILED: "Dữ liệu không hợp lệ",

    // exist
    EMAIL_EXISTED: "Email đã tồn tại",
    PHONE_EXISTED: "Số điện thoại đã tồn tại",
    USERNAME_EXISTED: "Tên đăng nhập đã tồn tại",
    USERNAME_NOT_EXISTED: "Tên đăng nhập không tồn tại",
    EMAIL_NOT_EXISTED: "Email không tồn tại",
    PASSWORD_NOT_EXISTED: "Mật khẩu không tồn tại",
    EXISTED: "Đã tồn tại",
    NOT_EXISTED: "Không tồn tại",
    NAME_EXISTED: "Tên đã tồn tại",
    USER_ROLE_EXISTED: "Người dùng và quyền đã tồn tại",
    USER_NOT_FOUND: "Người dùng không tồn tại",
    ROLE_NOT_FOUND: "Quyền không tồn tại",
    ROLE_EXISTED: "Quyền này đang được sử dụng",
    USER_EXISTED: "Người dùng này đang tồn tại",

    // auth
    INVALID_USERNAME: "Tên đăng nhập không hợp lệ",
    INVALID_FULLNAME: "Họ tên không hợp lệ",
    INVALID_LIST_ID: "Danh sách ID không hợp lệ",
    INVALID_TOKEN: "Token không hợp lệ",
    CANNOT_FETCH_PROFILE: "Không lấy được thông tin tài khoản",
    CANNOT_VERIFY_TOKEN: "Không xác thực được token",
    REFRESH_TOKEN_NOT_EXISTED: "Refresh token không tồn tại",
    CHANGE_PASSWORD_FAILED: "Thay đổi mật khẩu thất bại",
    CHANGE_PASSWORD_SUCCESS: "Thay đổi mật khẩu thành công",
    REFRESH_TOKEN_SUCCESS: "Refresh token thành công",
    USER_BLOCKED: "Tài khoản đã bị khóa",
    PASSWORD_CURRENT_INCORRECT: "Mật khẩu hiện tại không chính xác",
    LOGOUT_SUCCESS: "Đăng xuất thành công",
    LOGOUT_FAILED: "Đăng xuất thất bại",
    REFRESH_TOKEN_FAILED: "Refresh token thất bại",

    // ACTION
    CREATE: "Tạo mới",
    UPDATE: "Cập nhật",
    UPDATE_STATUS_SUCCESS: "Cập nhật trạng thái thành công",
    UPDATE_STATUS_FAILED: "Cập nhật trạng thái thất bại",
    DELETE: "Xóa",
    UPDATE_STATUS: "Cập nhật trạng thái",
    UPDATE_LIST_STATUS: "Cập nhật trạng thái danh sách",
    DELETE_LIST: "Xóa danh sách",
    GET_DATA_FAILED: "Lỗi khi lấy dữ liệu",

    //Common
    SEARCH_SUCCESS: "Tìm kiếm thành công",
    STATISTICS_SUCCESS: "Thống kê thành công",
    FILE_OVER: "Kính thước ảnh quá 2MB",
    IMAGE_ONLY: "Chỉ cho phép file PNG/JPG/JEPG",

    // Database
    DATABASE_POOL_NOT_INITIALIZED: "Database pool chưa được khởi tạo",

    // Url
    CHECK_URL: "Kiểm tra .env của Url.",

    // Write log
    LOG_FAILED: "Ghi log thất bại:",

    // Internal API (server-to-server)
    INTERNAL_AUTH_NOT_CONFIGURED: "Internal API chưa được cấu hình",
    INTERNAL_TOKEN_REQUIRED: "Thiếu internal API token",
    INTERNAL_TOKEN_INVALID: "Internal API token không hợp lệ",
}

export default messages;