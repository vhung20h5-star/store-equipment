package com.homenest.content;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import com.homenest.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/testimonials")
public class TestimonialController {

    private final TestimonialService testimonialService;

    public TestimonialController(TestimonialService testimonialService) {
        this.testimonialService = testimonialService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestimonialResponseDTO>>> getTestimonials() {
        List<TestimonialResponseDTO> list = testimonialService.getPublishedTestimonials();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

