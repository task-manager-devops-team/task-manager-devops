package com.example.backend.task.repository;

import com.example.backend.task.domain.Priority;
import com.example.backend.task.domain.Task;
import com.example.backend.task.dto.TaskFilter;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    public static Specification<Task> matching(TaskFilter filter) {
        return (Root<Task> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            String keyword = filter.q();
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + escapeLike(keyword.trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")), pattern, '!'));
            }
            if (filter.status() != null && !filter.status().isEmpty()) {
                predicates.add(root.get("status").in(filter.status()));
            }
            if (filter.priority() != null && !filter.priority().isEmpty()) {
                predicates.add(root.get("priority").in(filter.priority()));
            }
            if (filter.dueFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("dueDate"), filter.dueFrom()));
            }
            if (filter.dueTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("dueDate"), filter.dueTo()));
            }
            if (filter.archived() != null) {
                predicates.add(criteriaBuilder.equal(root.get("archived"), filter.archived()));
            }

            addOrdering(root, query, criteriaBuilder, filter);
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static String escapeLike(String value) {
        return value.replace("!", "!!").replace("%", "!%").replace("_", "!_");
    }

    private static void addOrdering(
            Root<Task> root,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder,
            TaskFilter filter) {
        if (filter.sort() == null) {
            query.orderBy(criteriaBuilder.asc(root.get("id")));
            return;
        }

        boolean descending = "desc".equals(filter.order())
                || (filter.order() == null && "priority".equals(filter.sort()));
        if ("dueDate".equals(filter.sort())) {
            Expression<Integer> nullRank = criteriaBuilder.<Integer>selectCase()
                    .when(criteriaBuilder.isNull(root.get("dueDate")), 1)
                    .otherwise(0);
            query.orderBy(
                    criteriaBuilder.asc(nullRank),
                    descending ? criteriaBuilder.desc(root.get("dueDate")) : criteriaBuilder.asc(root.get("dueDate")),
                    criteriaBuilder.asc(root.get("id")));
        } else {
            Expression<Integer> priorityRank = criteriaBuilder.<Priority, Integer>selectCase(root.<Priority>get("priority"))
                    .when(Priority.LOW, 0)
                    .when(Priority.MEDIUM, 1)
                    .when(Priority.HIGH, 2)
                    .otherwise(3);
            query.orderBy(
                    descending ? criteriaBuilder.desc(priorityRank) : criteriaBuilder.asc(priorityRank),
                    criteriaBuilder.asc(root.get("id")));
        }
    }
}
