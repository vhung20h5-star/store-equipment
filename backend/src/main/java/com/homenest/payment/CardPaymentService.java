package com.homenest.payment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Locale;

import com.homenest.auth.User;
import com.homenest.exception.ResourceNotFoundException;

/**
 * Shared bank-card payment engine: charges a user's saved card after verifying
 * CVV/PIN, expiry and available balance, and refunds amounts back to the card.
 * Always joins the caller's transaction so a failed charge rolls back the whole
 * business operation (VIP activation / order creation).
 */
@Service
public class CardPaymentService {

    private final BankCardRepository bankCardRepository;
    private final CardTransactionRepository cardTransactionRepository;

    public CardPaymentService(
            BankCardRepository bankCardRepository,
            CardTransactionRepository cardTransactionRepository
    ) {
        this.bankCardRepository = bankCardRepository;
        this.cardTransactionRepository = cardTransactionRepository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public BankCard charge(
            User user,
            Long cardId,
            String cvv,
            long amount,
            String transactionType,
            String description,
            String referenceCode
    ) {
        if (user == null) {
            throw new IllegalArgumentException("Vui lòng đăng nhập để thanh toán bằng thẻ ngân hàng.");
        }
        if (cardId == null) {
            throw new IllegalArgumentException("Vui lòng chọn thẻ ngân hàng đã liên kết để thanh toán.");
        }
        if (cvv == null || cvv.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập mã bảo mật CVV/PIN của thẻ để xác thực giao dịch.");
        }

        BankCard card = bankCardRepository.findByIdAndUserIdWithLock(cardId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ ngân hàng trong tài khoản của bạn."));

        if (!card.verifyCvv(cvv)) {
            throw new IllegalArgumentException("Mã bảo mật CVV/PIN không chính xác. Giao dịch bị từ chối.");
        }

        if (isExpired(card.getExpiryDate())) {
            throw new IllegalArgumentException("Thẻ " + card.getCardNumberMasked() + " đã hết hạn sử dụng. Vui lòng dùng thẻ khác.");
        }

        long currentBalance = card.getBalance() != null ? card.getBalance() : 0L;
        if (currentBalance < amount) {
            throw new IllegalArgumentException(
                    "Số dư thẻ không đủ để thanh toán. Cần " + formatVND(amount)
                            + ", số dư hiện tại " + formatVND(currentBalance)
                            + ". Vui lòng nạp thêm tiền hoặc chọn thẻ khác."
            );
        }

        long newBalance = currentBalance - amount;
        card.setBalance(newBalance);
        card.setUpdatedAt(LocalDateTime.now());
        BankCard saved = bankCardRepository.save(card);

        cardTransactionRepository.save(new CardTransaction(
                saved, user, transactionType, -amount, newBalance, description, referenceCode
        ));
        return saved;
    }

    /**
     * Refunds an amount back to a card. Silently skips if the card no longer exists
     * (e.g. the user deleted it after paying).
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void refund(Long cardId, long amount, String description, String referenceCode) {
        if (cardId == null || amount <= 0) {
            return;
        }
        bankCardRepository.findByIdWithLock(cardId).ifPresent(card -> {
            long newBalance = (card.getBalance() != null ? card.getBalance() : 0L) + amount;
            card.setBalance(newBalance);
            card.setUpdatedAt(LocalDateTime.now());
            BankCard saved = bankCardRepository.save(card);
            cardTransactionRepository.save(new CardTransaction(
                    saved, saved.getUser(), "REFUND", amount, newBalance, description, referenceCode
            ));
        });
    }

    private boolean isExpired(String expiry) {
        if (expiry == null || !expiry.matches("^(0[1-9]|1[0-2])/\\d{2}$")) {
            return false;
        }
        int month = Integer.parseInt(expiry.substring(0, 2));
        int year = 2000 + Integer.parseInt(expiry.substring(3, 5));
        return YearMonth.of(year, month).isBefore(YearMonth.now());
    }

    private String formatVND(long amount) {
        return NumberFormat.getInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ";
    }
}

