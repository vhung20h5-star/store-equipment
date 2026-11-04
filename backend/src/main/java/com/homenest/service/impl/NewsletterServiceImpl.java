package com.homenest.service.impl;

import com.homenest.dto.NewsletterRequest;
import com.homenest.dto.NewsletterResponseDTO;
import com.homenest.entity.NewsletterSubscriber;
import com.homenest.repository.NewsletterSubscriberRepository;
import com.homenest.service.NewsletterService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NewsletterServiceImpl implements NewsletterService {

    private static final String WELCOME_VOUCHER = "HOMENEST10";

    private final NewsletterSubscriberRepository subscriberRepository;

    public NewsletterServiceImpl(NewsletterSubscriberRepository subscriberRepository) {
        this.subscriberRepository = subscriberRepository;
    }

    @Override
    public NewsletterResponseDTO subscribe(NewsletterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (subscriberRepository.existsByEmailIgnoreCase(email)) {
            return new NewsletterResponseDTO(
                    email,
                    WELCOME_VOUCHER,
                    true,
                    "Email này đã được đăng ký trước đó. Mã ưu đãi của bạn là " + WELCOME_VOUCHER
            );
        }

        NewsletterSubscriber subscriber = new NewsletterSubscriber(email, WELCOME_VOUCHER);
        subscriberRepository.save(subscriber);

        return new NewsletterResponseDTO(
                email,
                WELCOME_VOUCHER,
                false,
                "Đăng ký nhận tin thành công! Mã ưu đãi 10% của bạn là " + WELCOME_VOUCHER
        );
    }
}

