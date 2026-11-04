package com.homenest.service;

import com.homenest.dto.NewsletterRequest;
import com.homenest.dto.NewsletterResponseDTO;

public interface NewsletterService {

    NewsletterResponseDTO subscribe(NewsletterRequest request);
}

