package com.homenest.promotion;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.homenest.auth.AuthServiceImpl;
import com.homenest.auth.User;
import com.homenest.auth.UserRepository;
import com.homenest.catalog.ProductResponseDTO;
import com.homenest.catalog.ProductService;
import com.homenest.exception.AccessDeniedException;
import com.homenest.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final VipSubscriptionRepository vipSubscriptionRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    public PromotionServiceImpl(
            PromotionRepository promotionRepository,
            UserVoucherRepository userVoucherRepository,
            VipSubscriptionRepository vipSubscriptionRepository,
            UserRepository userRepository,
            ProductService productService
    ) {
        this.promotionRepository = promotionRepository;
        this.userVoucherRepository = userVoucherRepository;
        this.vipSubscriptionRepository = vipSubscriptionRepository;
        this.userRepository = userRepository;
        this.productService = productService;
    }

    @Override
    public FlashSaleResponseDTO getActiveFlashSale() {
        Promotion promo = promotionRepository.findById("promo-flash-sale")
                .filter(Promotion::getIsActive)
                .or(() -> promotionRepository.findFirstByIsActiveTrueAndFeaturedProductIsNotNullOrderByStartTimeDesc())
                .or(() -> promotionRepository.findFirstByIsActiveTrueOrderByStartTimeDesc())
                .orElseThrow(() -> new ResourceNotFoundException("Hiện không có chương trình Flash Sale nào đang kích hoạt"));

        ProductResponseDTO featured = null;
        if (promo.getFeaturedProduct() != null) {
            try {
                featured = productService.getProductById(promo.getFeaturedProduct().getId());
            } catch (Exception ignored) {
                // Ignore if featured product is not found
            }
        }

        return new FlashSaleResponseDTO(
                promo.getId(),
                promo.getCode(),
                promo.getTitle(),
                promo.getDescription(),
                promo.getDiscountPercent(),
                promo.getEndTime(),
                featured
        );
    }

    @Override
    public ValidatePromotionResponseDTO validatePromotionCode(String code) {
        return validatePromotionCode(code, null, null);
    }

    @Override
    public ValidatePromotionResponseDTO validatePromotionCode(String code, Long orderSubtotal, String authenticatedEmail) {
        if (code == null || code.isBlank()) {
            return ValidatePromotionResponseDTO.invalid("", "Mã voucher không được để trống");
        }

        Optional<Promotion> promoOpt = promotionRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim());
        if (promoOpt.isEmpty()) {
            return ValidatePromotionResponseDTO.invalid(code, "Mã voucher không tồn tại hoặc đã hết hiệu lực");
        }

        Promotion promo = promoOpt.get();
        LocalDateTime now = LocalDateTime.now();
        if (promo.getEndTime() != null && promo.getEndTime().isBefore(now)) {
            return ValidatePromotionResponseDTO.invalid(code, "Mã voucher đã hết hạn sử dụng");
        }
        if (promo.getStartTime() != null && promo.getStartTime().isAfter(now)) {
            return ValidatePromotionResponseDTO.invalid(code, "Mã voucher chưa đến thời gian mở áp dụng");
        }

        long minOrder = promo.getMinOrderAmount() != null ? promo.getMinOrderAmount() : 0L;
        if (orderSubtotal != null && minOrder > 0 && orderSubtotal < minOrder) {
            return ValidatePromotionResponseDTO.invalid(
                    promo.getCode(),
                    "Đơn hàng tối thiểu từ " + formatVND(minOrder) + " mới đủ điều kiện áp dụng mã " + promo.getCode()
            );
        }

        User user = null;
        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            user = userRepository.findByEmail(authenticatedEmail.trim().toLowerCase()).orElse(null);
        }

        if (Boolean.TRUE.equals(promo.getVipOnly())) {
            if (user == null || !user.hasActiveVip()) {
                return ValidatePromotionResponseDTO.invalid(
                        promo.getCode(),
                        "Mã " + promo.getCode() + " chỉ dành riêng cho Hội viên VIP đang hoạt động"
                );
            }
        }

        if (Boolean.TRUE.equals(promo.getRequiresClaim())) {
            if (user != null) {
                Optional<UserVoucher> uvOpt = userVoucherRepository.findByUserIdAndPromotionId(user.getId(), promo.getId());
                if (uvOpt.isEmpty()) {
                    return ValidatePromotionResponseDTO.invalid(
                            promo.getCode(),
                            "Bạn chưa lưu mã " + promo.getCode() + ". Vui lòng bấm 'Lưu Voucher' vào kho cá nhân trước khi sử dụng!"
                    );
                }
                UserVoucher uv = uvOpt.get();
                if ("USED".equalsIgnoreCase(uv.getStatus())) {
                    return ValidatePromotionResponseDTO.invalid(
                            promo.getCode(),
                            "Bạn đã sử dụng mã voucher " + promo.getCode() + " ở đơn hàng trước đó"
                    );
                }
            } else if (orderSubtotal != null) {
                // Only block guest checkout validation when orderSubtotal is passed from Checkout UI
                return ValidatePromotionResponseDTO.invalid(
                        promo.getCode(),
                        "Vui lòng đăng nhập và lưu mã " + promo.getCode() + " vào Kho Voucher để áp dụng"
                );
            }
        }

        return ValidatePromotionResponseDTO.valid(
                promo.getCode(),
                promo.getDiscountPercent(),
                promo.getMaxDiscountAmount(),
                minOrder,
                promo.getVipOnly(),
                "Áp dụng mã giảm giá thành công! Giảm " + promo.getDiscountPercent() + "%"
        );
    }

    @Override
    @Transactional
    public List<VoucherDTO> getPublicVouchers(String campaignType, String authenticatedEmail) {
        ensureAutomaticSpecialDayVouchers();

        User currentUser = findUserOrNull(authenticatedEmail);
        Map<String, UserVoucher> claimedMap = getUserClaimedMap(currentUser);

        List<Promotion> promotions = promotionRepository.findByIsActiveTrueOrderByDiscountPercentDescCreatedAtDesc();
        return promotions.stream()
                .filter(p -> {
                    if (campaignType == null || campaignType.isBlank() || "ALL".equalsIgnoreCase(campaignType)) {
                        return true;
                    }
                    return campaignType.trim().equalsIgnoreCase(p.getCampaignType());
                })
                .map(p -> mapToVoucherDTO(p, claimedMap.get(p.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public List<VoucherDTO> getMyVouchers(String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);
        List<UserVoucher> userVouchers = userVoucherRepository.findByUserIdOrderByClaimedAtDesc(user.getId());
        return userVouchers.stream()
                .map(uv -> mapToVoucherDTO(uv.getPromotion(), uv))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VoucherDTO claimVoucher(String codeOrId, String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);
        if (codeOrId == null || codeOrId.isBlank()) {
            throw new IllegalArgumentException("Mã voucher không hợp lệ.");
        }

        String key = codeOrId.trim();
        Promotion promo = promotionRepository.findByCodeWithLock(key)
                .or(() -> promotionRepository.findByIdWithLock(key))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chương trình voucher: " + key));

        if (!Boolean.TRUE.equals(promo.getIsActive())) {
            throw new IllegalArgumentException("Voucher '" + promo.getCode() + "' hiện đã tạm ngưng phát hành.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (promo.getEndTime() != null && promo.getEndTime().isBefore(now)) {
            throw new IllegalArgumentException("Voucher '" + promo.getCode() + "' đã hết hạn.");
        }

        if (Boolean.TRUE.equals(promo.getVipOnly()) && !user.hasActiveVip()) {
            throw new IllegalArgumentException(
                    "Voucher '" + promo.getCode() + "' là đặc quyền dành riêng cho Hội viên VIP. Hãy đăng ký Gói VIP Tháng hoặc Năm để mở khóa!"
            );
        }

        Optional<UserVoucher> existing = userVoucherRepository.findByUserIdAndPromotionId(user.getId(), promo.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Bạn đã lưu mã voucher '" + promo.getCode() + "' vào Kho Voucher của mình rồi.");
        }

        if (promo.isSoldOut()) {
            throw new IllegalArgumentException("Rất tiếc! Mã voucher '" + promo.getCode() + "' đã hết lượt lưu.");
        }

        int currentClaimed = promo.getClaimedQuantity() != null ? promo.getClaimedQuantity() : 0;
        promo.setClaimedQuantity(currentClaimed + 1);
        promotionRepository.save(promo);

        UserVoucher savedClaim = userVoucherRepository.save(new UserVoucher(user, promo));
        return mapToVoucherDTO(promo, savedClaim);
    }

    @Override
    public VipStatusResponseDTO getVipStatus(String authenticatedEmail) {
        User user = findUserOrNull(authenticatedEmail);
        return buildVipStatusResponse(user);
    }

    @Override
    @Transactional
    public VipStatusResponseDTO subscribeVip(SubscribeVipRequest request, String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);
        String planType = request.getPlanType() != null ? request.getPlanType().trim().toUpperCase() : "";

        long price;
        int durationDays;
        int discountPercent;
        long maxDiscountPerOrder;
        String targetTier;

        if ("MONTHLY".equals(planType) || "VIP_MONTHLY".equals(planType)) {
            planType = "MONTHLY";
            targetTier = "VIP_MONTHLY";
            price = 99000L;
            durationDays = 30;
            discountPercent = 5;
            maxDiscountPerOrder = 300000L;
        } else if ("YEARLY".equals(planType) || "VIP_YEARLY".equals(planType)) {
            planType = "YEARLY";
            targetTier = "VIP_YEARLY";
            price = 890000L;
            durationDays = 365;
            discountPercent = 8;
            maxDiscountPerOrder = 600000L;
        } else {
            throw new IllegalArgumentException("Gói VIP không hợp lệ. Vui lòng chọn MONTHLY (Gói Tháng) hoặc YEARLY (Gói Năm).");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime baseStart = (user.hasActiveVip() && user.getVipExpiresAt() != null)
                ? user.getVipExpiresAt()
                : now;
        LocalDateTime newExpiresAt = baseStart.plusDays(durationDays);

        // If user already has VIP_YEARLY, keep VIP_YEARLY tier even if extending by a month
        if ("VIP_YEARLY".equalsIgnoreCase(user.getVipTier()) && user.hasActiveVip()) {
            user.setVipTier("VIP_YEARLY");
        } else {
            user.setVipTier(targetTier);
        }
        user.setVipExpiresAt(newExpiresAt);
        user.setUpdatedAt(now);
        userRepository.save(user);

        VipSubscription sub = new VipSubscription();
        sub.setUser(user);
        sub.setPlanType(planType);
        sub.setPricePaid(price);
        sub.setDiscountPercent(discountPercent);
        sub.setMaxDiscountPerOrder(maxDiscountPerOrder);
        sub.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().trim().toUpperCase() : "QR_INSTANT");
        sub.setStatus("ACTIVE");
        sub.setStartedAt(now);
        sub.setExpiresAt(newExpiresAt);
        vipSubscriptionRepository.save(sub);

        // Automatically gift all active VIP_ONLY vouchers to the user's voucher wallet
        List<Promotion> vipPromotions = promotionRepository.findByIsActiveTrueOrderByDiscountPercentDescCreatedAtDesc()
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getVipOnly()))
                .collect(Collectors.toList());

        for (Promotion vipPromo : vipPromotions) {
            Optional<UserVoucher> uvOpt = userVoucherRepository.findByUserIdAndPromotionId(user.getId(), vipPromo.getId());
            if (uvOpt.isEmpty() && !vipPromo.isSoldOut()) {
                vipPromo.setClaimedQuantity((vipPromo.getClaimedQuantity() != null ? vipPromo.getClaimedQuantity() : 0) + 1);
                promotionRepository.save(vipPromo);
                userVoucherRepository.save(new UserVoucher(user, vipPromo));
            } else if (uvOpt.isPresent() && "USED".equalsIgnoreCase(uvOpt.get().getStatus())) {
                // Refresh used VIP voucher upon new subscription/renewal
                UserVoucher uv = uvOpt.get();
                uv.setStatus("AVAILABLE");
                uv.setUsedAt(null);
                uv.setOrderNumber(null);
                userVoucherRepository.save(uv);
            }
        }

        return buildVipStatusResponse(user);
    }

    @Override
    public List<VoucherDTO> getAllPromotionsForAdmin() {
        return promotionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(p -> mapToVoucherDTO(p, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VoucherDTO createPromotionByAdmin(CreatePromotionRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (promotionRepository.findByCodeIgnoreCase(code).isPresent()) {
            throw new IllegalArgumentException("Mã voucher '" + code + "' đã tồn tại trong hệ thống.");
        }

        Promotion promo = new Promotion();
        String id = (request.getId() != null && !request.getId().isBlank())
                ? request.getId().trim()
                : "promo-" + code.toLowerCase() + "-" + (System.currentTimeMillis() % 10000);
        promo.setId(id);
        applyAdminRequestToPromotion(promo, request, code);
        promo.setClaimedQuantity(0);
        promo.setUsedQuantity(0);

        Promotion saved = promotionRepository.save(promo);
        return mapToVoucherDTO(saved, null);
    }

    @Override
    @Transactional
    public VoucherDTO updatePromotionByAdmin(String id, CreatePromotionRequest request) {
        Promotion promo = promotionRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với ID: " + id));

        String code = request.getCode().trim().toUpperCase();
        Optional<Promotion> dup = promotionRepository.findByCodeIgnoreCase(code);
        if (dup.isPresent() && !dup.get().getId().equals(id)) {
            throw new IllegalArgumentException("Mã voucher '" + code + "' đã được sử dụng bởi chương trình khác.");
        }

        applyAdminRequestToPromotion(promo, request, code);
        Promotion saved = promotionRepository.save(promo);
        return mapToVoucherDTO(saved, null);
    }

    @Override
    @Transactional
    public VoucherDTO togglePromotionActiveByAdmin(String id) {
        Promotion promo = promotionRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với ID: " + id));
        promo.setIsActive(!Boolean.TRUE.equals(promo.getIsActive()));
        Promotion saved = promotionRepository.save(promo);
        return mapToVoucherDTO(saved, null);
    }

    @Override
    @Transactional
    public List<VoucherDTO> triggerEventPresetByAdmin(String eventPreset) {
        String preset = eventPreset != null ? eventPreset.trim().toUpperCase() : "";
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = now.plusDays(14);

        switch (preset) {
            case "DOUBLE_1010" -> upsertEventVoucher(
                    "promo-double-1010",
                    "SALE1010",
                    "Đại Tiệc 10/10 – Giảm Sốc 35%",
                    "Săn mã ngày đôi 10/10 giảm ngay 35% (tối đa 900.000đ) cho đơn hàng thiết bị gia dụng từ 1.500.000đ.",
                    35,
                    900000L,
                    1500000L,
                    "DOUBLE_DAY",
                    "10/10 Đại Tiệc Ngày Đôi",
                    60,
                    30,
                    false,
                    now,
                    end
            );
            case "DOUBLE_1111" -> upsertEventVoucher(
                    "promo-double-1111",
                    "MEGA1111",
                    "Siêu Sale 11/11 – Giảm Sâu 40%",
                    "Voucher đặc biệt đợt 11/11 giảm tới 40% (tối đa 1.200.000đ) cho đơn từ 2.000.000đ. Số lượng phát hành cực kỳ giới hạn!",
                    40,
                    1200000L,
                    2000000L,
                    "DOUBLE_DAY",
                    "11/11 Siêu Sale Ngày Đôi",
                    50,
                    25,
                    false,
                    now,
                    end
            );
            case "DOUBLE_1212" -> upsertEventVoucher(
                    "promo-double-1212",
                    "SALE1212",
                    "Lễ Hội 12/12 – Ưu Đãi Đỉnh Điểm 45%",
                    "Siêu voucher ngày đôi 12/12 giảm tới 45% (tối đa 1.500.000đ) cho đơn hàng từ 3.000.000đ. Chỉ 30 suất duy nhất!",
                    45,
                    1500000L,
                    3000000L,
                    "DOUBLE_DAY",
                    "12/12 Sale Cuối Năm",
                    30,
                    15,
                    false,
                    now,
                    end
            );
            case "HOLIDAY_TET" -> upsertEventVoucher(
                    "promo-holiday-tet",
                    "LEHOI35",
                    "Mừng Đại Lễ & Tết – Giảm 35%",
                    "Ưu đãi dịp Lễ lớn tân trang tổ ấm: Giảm 35% (tối đa 1.000.000đ) cho đơn từ 2.000.000đ.",
                    35,
                    1000000L,
                    2000000L,
                    "HOLIDAY",
                    "Đặc Biệt Ngày Lễ",
                    80,
                    40,
                    false,
                    now,
                    end
            );
            case "DAILY_REFRESH" -> {
                upsertEventVoucher(
                        "promo-daily-10",
                        "DAILY10",
                        "Ưu Đãi Ngày Thường – Giảm 10%",
                        "Mã giảm giá hàng ngày dành cho mọi khách hàng: Giảm 10% (tối đa 150.000đ) cho đơn từ 500.000đ.",
                        10,
                        150000L,
                        500000L,
                        "DAILY",
                        "Ưu Đãi Hàng Ngày",
                        500,
                        100,
                        false,
                        now,
                        end.plusDays(60)
                );
                upsertEventVoucher(
                        "promo-daily-12",
                        "DAILY12",
                        "Tiện Nghi Mỗi Ngày – Giảm 12%",
                        "Voucher mua sắm ngày thường tiết kiệm 12% (tối đa 250.000đ) cho đơn từ 1.200.000đ.",
                        12,
                        250000L,
                        1200000L,
                        "DAILY",
                        "Ưu Đãi Hàng Ngày",
                        300,
                        60,
                        false,
                        now,
                        end.plusDays(60)
                );
            }
            default -> throw new IllegalArgumentException("Preset sự kiện không hợp lệ: " + eventPreset);
        }

        return getAllPromotionsForAdmin();
    }

    private void ensureAutomaticSpecialDayVouchers() {
        LocalDate today = LocalDate.now();
        int day = today.getDayOfMonth();
        int month = today.getMonthValue();

        // Automatically open Double Day voucher if today is dd == mm (e.g., 10/10, 11/11, 7/7...)
        if (day == month) {
            String tag = String.format("%02d/%02d", day, month);
            String code = String.format("DOUBLEDAY%02d%02d", day, month);
            String id = String.format("promo-auto-%02d%02d", day, month);
            if (promotionRepository.findByCodeIgnoreCase(code).isEmpty()) {
                Promotion autoPromo = new Promotion();
                autoPromo.setId(id);
                autoPromo.setCode(code);
                autoPromo.setTitle("Siêu Sale Ngày Đôi " + tag + " – Giảm Sốc 38%");
                autoPromo.setDescription("Hệ thống tự động mở kho Voucher Ngày Đôi " + tag + " duy nhất hôm nay: Giảm 38% (tối đa 1.000.000đ) cho đơn từ 1.800.000đ.");
                autoPromo.setDiscountPercent(38);
                autoPromo.setMaxDiscountAmount(1000000L);
                autoPromo.setMinOrderAmount(1800000L);
                autoPromo.setCampaignType("DOUBLE_DAY");
                autoPromo.setEventTag(tag + " Sự Kiện Tự Động");
                autoPromo.setTotalQuantity(40);
                autoPromo.setClaimedQuantity(31);
                autoPromo.setUsedQuantity(12);
                autoPromo.setVipOnly(false);
                autoPromo.setRequiresClaim(true);
                autoPromo.setStartTime(today.atStartOfDay());
                autoPromo.setEndTime(today.atTime(23, 59, 59));
                autoPromo.setIsActive(true);
                promotionRepository.save(autoPromo);
            }
        }
    }

    private void upsertEventVoucher(
            String id,
            String code,
            String title,
            String description,
            int discountPercent,
            long maxDiscountAmount,
            long minOrderAmount,
            String campaignType,
            String eventTag,
            int totalQuantity,
            int claimedQuantity,
            boolean vipOnly,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {
        Promotion promo = promotionRepository.findById(id)
                .or(() -> promotionRepository.findByCodeIgnoreCase(code))
                .orElseGet(() -> {
                    Promotion p = new Promotion();
                    p.setId(id);
                    return p;
                });

        promo.setCode(code);
        promo.setTitle(title);
        promo.setDescription(description);
        promo.setDiscountPercent(discountPercent);
        promo.setMaxDiscountAmount(maxDiscountAmount);
        promo.setMinOrderAmount(minOrderAmount);
        promo.setCampaignType(campaignType);
        promo.setEventTag(eventTag);
        promo.setTotalQuantity(totalQuantity);
        promo.setClaimedQuantity(claimedQuantity);
        promo.setVipOnly(vipOnly);
        promo.setRequiresClaim(true);
        promo.setStartTime(startTime);
        promo.setEndTime(endTime);
        promo.setIsActive(true);
        promotionRepository.save(promo);
    }

    private void applyAdminRequestToPromotion(Promotion promo, CreatePromotionRequest request, String code) {
        promo.setCode(code);
        promo.setTitle(request.getTitle().trim());
        promo.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        promo.setDiscountPercent(request.getDiscountPercent());
        promo.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promo.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : 0L);
        String campaignType = (request.getCampaignType() != null && !request.getCampaignType().isBlank())
                ? request.getCampaignType().trim().toUpperCase()
                : "DAILY";
        promo.setCampaignType(campaignType);
        promo.setEventTag(request.getEventTag() != null && !request.getEventTag().isBlank()
                ? request.getEventTag().trim()
                : switch (campaignType) {
                    case "DOUBLE_DAY" -> "Siêu Sale Ngày Đôi";
                    case "HOLIDAY" -> "Đặc Biệt Ngày Lễ";
                    case "VIP_ONLY" -> "Đặc Quyền Hội Viên VIP";
                    default -> "Ưu Đãi Hàng Ngày";
                });
        promo.setTotalQuantity(request.getTotalQuantity());
        boolean isVipOnly = Boolean.TRUE.equals(request.getVipOnly()) || "VIP_ONLY".equals(campaignType);
        promo.setVipOnly(isVipOnly);
        promo.setRequiresClaim(request.getRequiresClaim() != null ? request.getRequiresClaim() : true);
        promo.setStartTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now().minusMinutes(5));
        promo.setEndTime(request.getEndTime() != null ? request.getEndTime() : LocalDateTime.now().plusDays(30));
        promo.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
    }

    private VipStatusResponseDTO buildVipStatusResponse(User user) {
        List<VipPlanDTO> plans = List.of(
                new VipPlanDTO(
                        "MONTHLY",
                        "HomeNest VIP Tháng",
                        "Linh hoạt",
                        99000L,
                        149000L,
                        30,
                        5,
                        300000L,
                        List.of(
                                "Giảm trực tiếp thêm 5% (tối đa 300.000đ) cho mọi đơn hàng",
                                "Cộng dồn trực tiếp với mã Voucher sự kiện 10/10, 11/11, Lễ Tết",
                                "Mở khóa lưu & sử dụng kho Voucher Độc Quyền VIP giảm đến 35%",
                                "Tặng ngay bộ mã VIPCLUB25 & VIPDIAMOND35 vào Kho Voucher cá nhân"
                        ),
                        List.of("VIPCLUB25", "VIPDIAMOND35")
                ),
                new VipPlanDTO(
                        "YEARLY",
                        "HomeNest VIP Năm (Gold)",
                        "Tiết kiệm 25% • Phổ biến nhất",
                        890000L,
                        1188000L,
                        365,
                        8,
                        600000L,
                        List.of(
                                "Giảm trực tiếp thêm 8% (tối đa 600.000đ) cho mọi đơn hàng suốt 365 ngày",
                                "Cộng dồn 2 tầng ưu đãi: Trừ Voucher trước + Trừ thêm 8% đặc quyền VIP Năm",
                                "Toàn quyền săn mọi mã Voucher Độc Quyền VIP & Ưu tiên sự kiện Ngày Đôi",
                                "Tặng ngay trọn bộ mã VIP giảm sâu vào Kho Voucher & Huy hiệu VIP Gold"
                        ),
                        List.of("VIPCLUB25", "VIPDIAMOND35")
                )
        );

        VipStatusResponseDTO resp = new VipStatusResponseDTO();
        resp.setPlans(plans);

        if (user != null) {
            boolean active = user.hasActiveVip();
            resp.setUser(AuthServiceImpl.mapUserToDTO(user));
            resp.setActive(active);
            resp.setTier(active ? user.getVipTier() : "NONE");
            resp.setExpiresAt(user.getVipExpiresAt());
            resp.setDirectDiscountPercent(user.getActiveVipDiscountPercent());
            resp.setMaxDiscountPerOrder(user.getActiveVipMaxDiscount());

            List<VipStatusResponseDTO.VipSubscriptionDTO> history = vipSubscriptionRepository
                    .findByUserIdOrderByCreatedAtDesc(user.getId())
                    .stream()
                    .map(sub -> {
                        VipStatusResponseDTO.VipSubscriptionDTO dto = new VipStatusResponseDTO.VipSubscriptionDTO();
                        dto.setId(sub.getId());
                        dto.setPlanType(sub.getPlanType());
                        dto.setPricePaid(sub.getPricePaid());
                        dto.setDiscountPercent(sub.getDiscountPercent());
                        dto.setMaxDiscountPerOrder(sub.getMaxDiscountPerOrder());
                        dto.setPaymentMethod(sub.getPaymentMethod());
                        dto.setStatus(sub.getExpiresAt().isAfter(LocalDateTime.now()) ? "ACTIVE" : "EXPIRED");
                        dto.setStartedAt(sub.getStartedAt());
                        dto.setExpiresAt(sub.getExpiresAt());
                        return dto;
                    })
                    .collect(Collectors.toList());
            resp.setSubscriptions(history);
        } else {
            resp.setActive(false);
            resp.setTier("NONE");
            resp.setDirectDiscountPercent(0);
            resp.setMaxDiscountPerOrder(0L);
            resp.setSubscriptions(Collections.emptyList());
        }

        return resp;
    }

    private User findUserOrNull(String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            return null;
        }
        return userRepository.findByEmail(authenticatedEmail.trim().toLowerCase()).orElse(null);
    }

    private User requireAuthenticatedUser(String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new AccessDeniedException("Vui lòng đăng nhập tài khoản HomeNest để sử dụng tính năng này.");
        }
        return userRepository.findByEmail(authenticatedEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng: " + authenticatedEmail));
    }

    private Map<String, UserVoucher> getUserClaimedMap(User user) {
        if (user == null) {
            return Collections.emptyMap();
        }
        return userVoucherRepository.findByUserIdOrderByClaimedAtDesc(user.getId())
                .stream()
                .collect(Collectors.toMap(
                        uv -> uv.getPromotion().getId(),
                        uv -> uv,
                        (a, b) -> a
                ));
    }

    private VoucherDTO mapToVoucherDTO(Promotion promo, UserVoucher userVoucher) {
        VoucherDTO dto = new VoucherDTO();
        dto.setId(promo.getId());
        dto.setCode(promo.getCode());
        dto.setTitle(promo.getTitle());
        dto.setDescription(promo.getDescription());
        dto.setDiscountPercent(promo.getDiscountPercent());
        dto.setMaxDiscountAmount(promo.getMaxDiscountAmount());
        dto.setMinOrderAmount(promo.getMinOrderAmount() != null ? promo.getMinOrderAmount() : 0L);
        dto.setCampaignType(promo.getCampaignType());
        dto.setEventTag(promo.getEventTag());
        dto.setTotalQuantity(promo.getTotalQuantity());
        dto.setClaimedQuantity(promo.getClaimedQuantity() != null ? promo.getClaimedQuantity() : 0);
        dto.setRemainingQuantity(promo.getRemainingQuantity());
        dto.setUsedQuantity(promo.getUsedQuantity() != null ? promo.getUsedQuantity() : 0);
        dto.setVipOnly(Boolean.TRUE.equals(promo.getVipOnly()));
        dto.setRequiresClaim(Boolean.TRUE.equals(promo.getRequiresClaim()));
        dto.setStartTime(promo.getStartTime());
        dto.setEndTime(promo.getEndTime());
        dto.setIsActive(Boolean.TRUE.equals(promo.getIsActive()));

        if (userVoucher != null) {
            dto.setClaimed(true);
            String status = userVoucher.getStatus();
            if ("AVAILABLE".equalsIgnoreCase(status)
                    && promo.getEndTime() != null
                    && promo.getEndTime().isBefore(LocalDateTime.now())) {
                status = "EXPIRED";
            }
            dto.setUserVoucherStatus(status);
            dto.setClaimedAt(userVoucher.getClaimedAt());
            dto.setUsedAt(userVoucher.getUsedAt());
            dto.setOrderNumber(userVoucher.getOrderNumber());
        } else {
            dto.setClaimed(false);
            dto.setUserVoucherStatus(null);
        }

        return dto;
    }

    private String formatVND(long amount) {
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(amount) + "đ";
    }
}
