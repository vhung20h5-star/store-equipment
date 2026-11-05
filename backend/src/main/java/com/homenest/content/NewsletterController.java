package com.homenest.content;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.homenest.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/newsletter")
public class NewsletterController {

    private final NewsletterService newsletterService;

    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<NewsletterResponseDTO>> subscribe(
            @Valid @RequestBody NewsletterRequest request
    ) {
        NewsletterResponseDTO response = newsletterService.subscribe(request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }
}

