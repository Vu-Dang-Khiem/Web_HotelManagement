const UserModel = require('../models/user.model');
const RoleModel = require('../models/role.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const roles = require('../constants/roles');
const messages = require('../constants/messages');

const AuthService = {
  // Đăng ký tài khoản khách hàng
  async register({ full_name, email, password, phone, address }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new Error(messages.EMAIL_EXISTS);

    // Chặn trùng số điện thoại (chỉ khi khách có nhập)
    if (phone) {
      const phoneExists = await UserModel.findByPhone(phone);
      if (phoneExists) throw new Error(messages.PHONE_EXISTS);
    }

    const clientRole = await RoleModel.findByName(roles.CLIENT);
    const hashed = await hashPassword(password);
    const id = await UserModel.create({
      role_id: clientRole.id,
      full_name, email, password: hashed, phone, address,
    });
    return id;
  },

  // Đăng nhập, trả về thông tin user rút gọn để lưu session
  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new Error(messages.LOGIN_FAILED);
    if (user.status === 'locked') throw new Error(messages.ACCOUNT_LOCKED);

    const match = await comparePassword(password, user.password);
    if (!match) throw new Error(messages.LOGIN_FAILED);

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role_name,
    };
  },

  // Đổi mật khẩu
  async changePassword(userId, currentPassword, newPassword) {
    const user = await UserModel.findById(userId);
    const match = await comparePassword(currentPassword, user.password);
    if (!match) throw new Error(messages.WRONG_PASSWORD);
    const hashed = await hashPassword(newPassword);
    await UserModel.updatePassword(userId, hashed);
  },
};

module.exports = AuthService;
