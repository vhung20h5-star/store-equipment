package com.homenest.repository;

import com.homenest.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    Optional<Category> findBySlug(String slug);

    @Query("SELECT c.slug, COUNT(p) FROM Category c LEFT JOIN c.products p GROUP BY c.slug")
    List<Object[]> countProductsGroupedBySlug();
}

