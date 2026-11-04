package com.homenest.repository;

import com.homenest.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {

    Optional<Promotion> findByCodeIgnoreCaseAndIsActiveTrue(String code);

    Optional<Promotion> findFirstByIsActiveTrueOrderByStartTimeDesc();
}

