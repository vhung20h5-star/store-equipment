package com.homenest.content;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TestimonialServiceImpl implements TestimonialService {

    private final TestimonialRepository testimonialRepository;

    public TestimonialServiceImpl(TestimonialRepository testimonialRepository) {
        this.testimonialRepository = testimonialRepository;
    }

    @Override
    public List<TestimonialResponseDTO> getPublishedTestimonials() {
        return testimonialRepository.findByIsPublishedTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private TestimonialResponseDTO mapToDTO(Testimonial entity) {
        return new TestimonialResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getLocation(),
                entity.getAvatar(),
                entity.getRating(),
                entity.getComment(),
                entity.getPurchasedProduct()
        );
    }
}

