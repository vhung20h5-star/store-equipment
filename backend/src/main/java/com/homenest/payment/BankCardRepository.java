package com.homenest.payment;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BankCardRepository extends JpaRepository<BankCard, Long> {

    List<BankCard> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    Optional<BankCard> findByIdAndUserId(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM BankCard c WHERE c.id = :id AND c.user.id = :userId")
    Optional<BankCard> findByIdAndUserIdWithLock(@Param("id") Long id, @Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM BankCard c WHERE c.id = :id")
    Optional<BankCard> findByIdWithLock(@Param("id") Long id);
}

