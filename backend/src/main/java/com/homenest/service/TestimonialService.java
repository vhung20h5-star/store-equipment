package com.homenest.service;

import com.homenest.dto.TestimonialResponseDTO;
import java.util.List;

public interface TestimonialService {

    List<TestimonialResponseDTO> getPublishedTestimonials();
}

