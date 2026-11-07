package com.homenest.payment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.homenest.auth.User;
import com.homenest.auth.UserRepository;
import com.homenest.exception.AccessDeniedException;
import com.homenest.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class BankCardServiceImpl implements BankCardService {

    private final BankCardRepository bankCardRepository;
    private final CardTransactionRepository cardTransactionRepository;
    private final UserRepository userRepository;

    public BankCardServiceImpl(
            BankCardRepository bankCardRepository,
            CardTransactionRepository cardTransactionRepository,
            UserRepository userRepository
    ) {
        this.bankCardRepository = bankCardRepository;
        this.cardTransactionRepository = cardTransactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<BankCardDTO> getMyCards(String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);
        return bankCardRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(BankCardServiceImpl::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CardTransactionDTO> getMyTransactions(String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);
        return cardTransactionRepository.findTop30ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(BankCardServiceImpl::mapTxToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BankCardDTO addCard(CreateBankCardRequest request, String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);

        String digitsOnly = request.getCardNumber() != null
                ? request.getCardNumber().replaceAll("[\\s-]", "")
                : "";
        if (!digitsOnly.matches("^\\d{12,19}$")) {
            throw new IllegalArgumentException("Số thẻ ngân hàng không hợp lệ. Vui lòng nhập dãy số từ 12 đến 19 chữ số (VD: 16 số).");
        }

        String expiry = request.getExpiryDate() != null ? request.getExpiryDate().trim() : "";
        if (!expiry.matches("^(0[1-9]|1[0-2])/\\d{2}$")) {
            throw new IllegalArgumentException("Ngày hết hạn không hợp lệ. Vui lòng nhập theo định dạng MM/YY (VD: 12/29).");
        }

        String cvv = request.getCvv() != null ? request.getCvv().trim() : "";
        if (!cvv.matches("^\\d{3,6}$")) {
            throw new IllegalArgumentException("Mã bảo mật CVV/PIN phải gồm từ 3 đến 6 chữ số.");
        }

        String last4 = digitsOnly.substring(digitsOnly.length() - 4);
        String masked = "**** **** **** " + last4;

        List<BankCard> existingCards = bankCardRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        boolean makeDefault = existingCards.isEmpty() || Boolean.TRUE.equals(request.getSetAsDefault());

        if (makeDefault && !existingCards.isEmpty()) {
            for (BankCard c : existingCards) {
                if (Boolean.TRUE.equals(c.getIsDefault())) {
                    c.setIsDefault(false);
                    bankCardRepository.save(c);
                }
            }
        }

        long initialBalance = request.getInitialBalance() != null && request.getInitialBalance() >= 0
                ? request.getInitialBalance()
                : 0L;

        BankCard card = new BankCard();
        card.setUser(user);
        card.setBankName(request.getBankName().trim());
        card.setCardBrand(request.getCardBrand() != null && !request.getCardBrand().isBlank()
                ? request.getCardBrand().trim().toUpperCase()
                : "VISA");
        card.setCardNumberMasked(masked);
        card.setCardLast4(last4);
        card.setCardHolderName(request.getCardHolderName().trim().toUpperCase());
        card.setExpiryDate(expiry);
        card.setCvvCode(cvv);
        card.setBalance(initialBalance);
        card.setIsDefault(makeDefault);
        card.setCreatedAt(LocalDateTime.now());
        card.setUpdatedAt(LocalDateTime.now());

        BankCard saved = bankCardRepository.save(card);

        if (initialBalance > 0) {
            cardTransactionRepository.save(new CardTransaction(
                    saved,
                    user,
                    "INITIAL_DEPOSIT",
                    initialBalance,
                    initialBalance,
                    "Số dư khởi tạo khi liên kết thẻ " + saved.getBankName() + " (" + masked + ")",
                    "CARD_INIT"
            ));
        }

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public BankCardDTO topUpCard(Long cardId, TopUpCardRequest request, String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);
        if (request == null || request.getAmount() == null || request.getAmount() < 10000L) {
            throw new IllegalArgumentException("Số tiền nạp vào thẻ tối thiểu là 10.000 VNĐ.");
        }

        BankCard card = bankCardRepository.findByIdAndUserIdWithLock(cardId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ ngân hàng trong tài khoản của bạn."));

        long newBalance = (card.getBalance() != null ? card.getBalance() : 0L) + request.getAmount();
        card.setBalance(newBalance);
        card.setUpdatedAt(LocalDateTime.now());
        BankCard saved = bankCardRepository.save(card);

        cardTransactionRepository.save(new CardTransaction(
                saved,
                user,
                "TOP_UP",
                request.getAmount(),
                newBalance,
                "Nạp thêm tiền vào thẻ " + saved.getBankName() + " (" + saved.getCardNumberMasked() + ")",
                "TOP_UP"
        ));

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public BankCardDTO setDefaultCard(Long cardId, String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);
        List<BankCard> cards = bankCardRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        BankCard target = cards.stream()
                .filter(c -> c.getId().equals(cardId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ ngân hàng."));

        for (BankCard c : cards) {
            boolean isTarget = c.getId().equals(cardId);
            if (!Boolean.valueOf(isTarget).equals(c.getIsDefault())) {
                c.setIsDefault(isTarget);
                c.setUpdatedAt(LocalDateTime.now());
                bankCardRepository.save(c);
            }
        }

        target.setIsDefault(true);
        return mapToDTO(target);
    }

    @Override
    @Transactional
    public void deleteCard(Long cardId, String authenticatedEmail) {
        User user = requireAuthenticatedUser(authenticatedEmail);
        BankCard card = bankCardRepository.findByIdAndUserId(cardId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ ngân hàng cần xóa."));

        boolean wasDefault = Boolean.TRUE.equals(card.getIsDefault());
        bankCardRepository.delete(card);

        if (wasDefault) {
            List<BankCard> remaining = bankCardRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
            if (!remaining.isEmpty()) {
                BankCard nextDefault = remaining.get(0);
                nextDefault.setIsDefault(true);
                bankCardRepository.save(nextDefault);
            }
        }
    }

    private User requireAuthenticatedUser(String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new AccessDeniedException("Vui lòng đăng nhập để quản lý thẻ ngân hàng.");
        }
        return userRepository.findByEmail(authenticatedEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng: " + authenticatedEmail));
    }

    public static BankCardDTO mapToDTO(BankCard card) {
        BankCardDTO dto = new BankCardDTO();
        dto.setId(card.getId());
        dto.setBankName(card.getBankName());
        dto.setCardBrand(card.getCardBrand());
        dto.setCardNumberMasked(card.getCardNumberMasked());
        dto.setCardLast4(card.getCardLast4());
        dto.setCardHolderName(card.getCardHolderName());
        dto.setExpiryDate(card.getExpiryDate());
        dto.setBalance(card.getBalance());
        dto.setIsDefault(card.getIsDefault());
        dto.setCreatedAt(card.getCreatedAt());
        return dto;
    }

    public static CardTransactionDTO mapTxToDTO(CardTransaction tx) {
        CardTransactionDTO dto = new CardTransactionDTO();
        dto.setId(tx.getId());
        if (tx.getCard() != null) {
            dto.setCardId(tx.getCard().getId());
            dto.setBankName(tx.getCard().getBankName());
            dto.setCardNumberMasked(tx.getCard().getCardNumberMasked());
        }
        dto.setTransactionType(tx.getTransactionType());
        dto.setAmount(tx.getAmount());
        dto.setBalanceAfter(tx.getBalanceAfter());
        dto.setDescription(tx.getDescription());
        dto.setReferenceCode(tx.getReferenceCode());
        dto.setCreatedAt(tx.getCreatedAt());
        return dto;
    }
}

