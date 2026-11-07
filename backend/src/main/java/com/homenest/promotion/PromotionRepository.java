package com.homenest.promotion;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {

    Optional<Promotion> findByCodeIgnoreCaseAndIsActiveTrue(String code);

    Optional<Promotion> findByCodeIgnoreCase(String code);

    Optional<Promotion> findFirstByIsActiveTrueAndFeaturedProductIsNotNullOrderByStartTimeDesc();

    Optional<Promotion> findFirstByIsActiveTrueOrderByStartTimeDesc();

    List<Promotion> findByIsActiveTrueOrderByDiscountPercentDescCreatedAtDesc();

    List<Promotion> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Promotion p WHERE p.id = :id")
    Optional<Promotion> findByIdWithLock(@Param("id") String id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Promotion p WHERE LOWER(p.code) = LOWER(:code)")
    Optional<Promotion> findByCodeWithLock(@Param("code") String code);
}
