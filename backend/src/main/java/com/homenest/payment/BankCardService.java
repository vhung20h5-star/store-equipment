package com.homenest.payment;

import java.util.List;

public interface BankCardService {

    List<BankCardDTO> getMyCards(String authenticatedEmail);

    List<CardTransactionDTO> getMyTransactions(String authenticatedEmail);

    BankCardDTO addCard(CreateBankCardRequest request, String authenticatedEmail);

    BankCardDTO topUpCard(Long cardId, TopUpCardRequest request, String authenticatedEmail);

    BankCardDTO setDefaultCard(Long cardId, String authenticatedEmail);

    void deleteCard(Long cardId, String authenticatedEmail);
}

