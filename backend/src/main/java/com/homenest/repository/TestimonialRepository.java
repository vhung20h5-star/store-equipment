package com.homenest.repository;

import com.homenest.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, String> {

    List<Testimonial> findByIsPublishedTrueOrderByDisplayOrderAsc();
}

