package com.strongman.rankings.controller;

import com.strongman.rankings.model.Competition;
import com.strongman.rankings.model.CompetitorRanking;
import com.strongman.rankings.model.ShowTier;
import com.strongman.rankings.repository.CompetitionDataRepository;
import com.strongman.rankings.service.RankingCalculatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RankingController {

    private final RankingCalculatorService rankingService;
    private final CompetitionDataRepository repository;

    public RankingController(RankingCalculatorService rankingService, CompetitionDataRepository repository) {
        this.rankingService = rankingService;
        this.repository = repository;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("app", "Strongman Rankings API");
        status.put("version", "1.0.0");
        return ResponseEntity.ok(status);
    }

    @GetMapping("/rankings/top10")
    public ResponseEntity<List<CompetitorRanking>> getTop10Rankings(
            @RequestParam(value = "formula", defaultValue = "INVERSE") String formula) {
        List<CompetitorRanking> allRankings = rankingService.calculateRankings(formula, 2026);
        List<CompetitorRanking> top10 = allRankings.stream().limit(10).collect(Collectors.toList());
        return ResponseEntity.ok(top10);
    }

    @GetMapping("/rankings/all")
    public ResponseEntity<List<CompetitorRanking>> getAllRankings(
            @RequestParam(value = "formula", defaultValue = "INVERSE") String formula) {
        List<CompetitorRanking> allRankings = rankingService.calculateRankings(formula, 2026);
        return ResponseEntity.ok(allRankings);
    }

    @GetMapping("/rankings/competitor/{id}")
    public ResponseEntity<CompetitorRanking> getCompetitorRanking(
            @PathVariable("id") String id,
            @RequestParam(value = "formula", defaultValue = "INVERSE") String formula) {
        List<CompetitorRanking> allRankings = rankingService.calculateRankings(formula, 2026);
        Optional<CompetitorRanking> match = allRankings.stream()
                .filter(r -> r.getCompetitor().getId().equalsIgnoreCase(id))
                .findFirst();

        return match.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/shows")
    public ResponseEntity<Map<String, Object>> getShows() {
        Collection<Competition> competitions = repository.getAllCompetitions();

        Map<String, Object> response = new HashMap<>();
        response.put("totalShows", competitions.size());

        Map<ShowTier, List<Competition>> groupedByTier = competitions.stream()
                .collect(Collectors.groupingBy(Competition::getTier));

        response.put("tier1Shows", groupedByTier.getOrDefault(ShowTier.TIER_1, Collections.emptyList()));
        response.put("tier2Shows", groupedByTier.getOrDefault(ShowTier.TIER_2, Collections.emptyList()));
        response.put("tier3Shows", groupedByTier.getOrDefault(ShowTier.TIER_3, Collections.emptyList()));
        response.put("tier4Shows", groupedByTier.getOrDefault(ShowTier.TIER_4, Collections.emptyList()));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tier-config")
    public ResponseEntity<List<Map<String, Object>>> getTierConfig() {
        List<Map<String, Object>> config = new ArrayList<>();
        for (ShowTier tier : ShowTier.values()) {
            Map<String, Object> item = new HashMap<>();
            item.put("tier", tier.name());
            item.put("tierNumber", tier.getTierNumber());
            item.put("description", tier.getDescription());
            item.put("multiplier", tier.getMultiplier());
            config.add(item);
        }
        return ResponseEntity.ok(config);
    }
}
