package com.homenest.promotion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {

    List<UserVoucher> findByUserIdOrderByClaimedAtDesc(Long userId);

    Optional<UserVoucher> findByUserIdAndPromotionId(Long userId, String promotionId);

    Optional<UserVoucher> findByUserIdAndPromotionCodeIgnoreCase(Long userId, String code);

    boolean existsByUserIdAndPromotionId(Long userId, String promotionId);
}

