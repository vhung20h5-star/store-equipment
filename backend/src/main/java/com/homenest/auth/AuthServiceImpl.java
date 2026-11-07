package com.homenest.auth;

import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.homenest.cart.Cart;
import com.homenest.cart.CartRepository;
import com.homenest.exception.ResourceNotFoundException;
import com.homenest.security.JwtTokenProvider;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(
            UserRepository userRepository,
            CartRepository cartRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostConstruct
    @Transactional
    public void initDefaultDemoUsers() {
        // Guarantee demo user exists and has accurate BCrypt hash matching "Password@123"
        userRepository.findByEmail("demo@homenest.vn").ifPresentOrElse(
                user -> {
                    if (!passwordEncoder.matches("Password@123", user.getPasswordHash())) {
                        user.setPasswordHash(passwordEncoder.encode("Password@123"));
                        userRepository.save(user);
                    }
                    if (cartRepository.findByUserId(user.getId()).isEmpty()) {
                        cartRepository.save(new Cart(user));
                    }
                },
                () -> {
                    User demoUser = new User();
                    demoUser.setEmail("demo@homenest.vn");
                    demoUser.setFullName("Nguyễn Văn An");
                    demoUser.setPasswordHash(passwordEncoder.encode("Password@123"));
                    demoUser.setPhone("0912345678");
                    demoUser.setAddress("123 Đường Cầu Giấy, Hà Nội");
                    demoUser.setRole("ROLE_USER");
                    demoUser.setIsActive(true);
                    User saved = userRepository.save(demoUser);
                    cartRepository.save(new Cart(saved));
                }
        );

        // Guarantee demo admin exists and has ROLE_ADMIN matching "Admin@123"
        userRepository.findByEmail("admin@homenest.vn").ifPresentOrElse(
                admin -> {
                    boolean changed = false;
                    if (!passwordEncoder.matches("Admin@123", admin.getPasswordHash())) {
                        admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                        changed = true;
                    }
                    if (!"ROLE_ADMIN".equals(admin.getRole())) {
                        admin.setRole("ROLE_ADMIN");
                        changed = true;
                    }
                    if (changed) {
                        userRepository.save(admin);
                    }
                    if (cartRepository.findByUserId(admin.getId()).isEmpty()) {
                        cartRepository.save(new Cart(admin));
                    }
                },
                () -> {
                    User demoAdmin = new User();
                    demoAdmin.setEmail("admin@homenest.vn");
                    demoAdmin.setFullName("Quản Trị Viên HomeNest");
                    demoAdmin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                    demoAdmin.setPhone("0900000001");
                    demoAdmin.setAddress("Trụ sở HomeNest, Quận 1, TP.HCM");
                    demoAdmin.setRole("ROLE_ADMIN");
                    demoAdmin.setIsActive(true);
                    User savedAdmin = userRepository.save(demoAdmin);
                    cartRepository.save(new Cart(savedAdmin));
                }
        );
    }

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email '" + email + "' đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.");
        }

        User user = new User();
        user.setEmail(email);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        user.setRole("ROLE_USER");
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // Initialize persistent cart for new user
        Cart cart = new Cart(savedUser);
        cartRepository.save(cart);

        String token = tokenProvider.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );

        return new AuthResponseDTO(token, mapToDTO(savedUser));
    }

    @Override
    @Transactional
    public AuthResponseDTO login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không chính xác."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Email hoặc mật khẩu không chính xác.");
        }

        if (!user.getIsActive()) {
            throw new IllegalArgumentException("Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.");
        }

        // Ensure user has a cart
        if (cartRepository.findByUserId(user.getId()).isEmpty()) {
            cartRepository.save(new Cart(user));
        }

        String token = tokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );

        return new AuthResponseDTO(token, mapToDTO(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + email));
        return mapToDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + email));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }

    public static UserResponseDTO mapUserToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        boolean activeVip = user.hasActiveVip();
        dto.setVipTier(activeVip ? user.getVipTier() : "NONE");
        dto.setVipExpiresAt(user.getVipExpiresAt());
        dto.setVipActive(activeVip);
        dto.setVipDiscountPercent(user.getActiveVipDiscountPercent());
        dto.setVipMaxDiscountAmount(user.getActiveVipMaxDiscount());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private UserResponseDTO mapToDTO(User user) {
        return mapUserToDTO(user);
    }
}

