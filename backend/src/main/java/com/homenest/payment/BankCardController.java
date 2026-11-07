package com.homenest.payment;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.homenest.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/payment/cards")
public class BankCardController {

    private final BankCardService bankCardService;

    public BankCardController(BankCardService bankCardService) {
        this.bankCardService = bankCardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BankCardDTO>>> getMyCards(Authentication authentication) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        return ResponseEntity.ok(ApiResponse.ok(bankCardService.getMyCards(email)));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<CardTransactionDTO>>> getMyTransactions(Authentication authentication) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        return ResponseEntity.ok(ApiResponse.ok(bankCardService.getMyTransactions(email)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BankCardDTO>> addCard(
            @Valid @RequestBody CreateBankCardRequest request,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        BankCardDTO created = bankCardService.addCard(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Liên kết thẻ ngân hàng mới thành công!", created));
    }

    @PostMapping("/{cardId}/top-up")
    public ResponseEntity<ApiResponse<BankCardDTO>> topUpCard(
            @PathVariable Long cardId,
            @Valid @RequestBody TopUpCardRequest request,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        BankCardDTO updated = bankCardService.topUpCard(cardId, request, email);
        return ResponseEntity.ok(ApiResponse.ok("Nạp thêm số dư vào thẻ thành công!", updated));
    }

    @PatchMapping("/{cardId}/default")
    public ResponseEntity<ApiResponse<BankCardDTO>> setDefaultCard(
            @PathVariable Long cardId,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        BankCardDTO updated = bankCardService.setDefaultCard(cardId, email);
        return ResponseEntity.ok(ApiResponse.ok("Đã đặt làm thẻ thanh toán mặc định!", updated));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<ApiResponse<Void>> deleteCard(
            @PathVariable Long cardId,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        bankCardService.deleteCard(cardId, email);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa liên kết thẻ ngân hàng.", null));
    }
}

