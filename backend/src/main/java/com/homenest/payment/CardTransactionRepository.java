package com.homenest.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CardTransactionRepository extends JpaRepository<CardTransaction, Long> {

    List<CardTransaction> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);
}

