package com.homenest.promotion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VipSubscriptionRepository extends JpaRepository<VipSubscription, Long> {

    List<VipSubscription> findByUserIdOrderByCreatedAtDesc(Long userId);
}

