package com.strongman.rankings.service;

import com.strongman.rankings.model.*;
import com.strongman.rankings.repository.CompetitionDataRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RankingCalculatorService {

    private final CompetitionDataRepository repository;

    public RankingCalculatorService(CompetitionDataRepository repository) {
        this.repository = repository;
    }

    public List<CompetitorRanking> calculateRankings(String formulaType, Integer referenceYear) {
        int currentYear = (referenceYear != null) ? referenceYear : 2026;
        String formula = (formulaType != null && !formulaType.isBlank()) ? formulaType.toUpperCase() : "EXPONENTIAL";

        Map<String, Competitor> competitorMap = repository.getAllCompetitors().stream()
                .collect(Collectors.toMap(Competitor::getId, c -> c));

        Map<String, Competition> competitionMap = repository.getAllCompetitions().stream()
                .collect(Collectors.toMap(Competition::getId, c -> c));

        // Group results by competitor ID
        Map<String, List<Result>> competitorResultsMap = new HashMap<>();
        for (Result res : repository.getAllResults()) {
            competitorResultsMap.computeIfAbsent(res.getCompetitorId(), k -> new ArrayList<>()).add(res);
        }

        List<CompetitorRanking> rankings = new ArrayList<>();

        for (Map.Entry<String, Competitor> entry : competitorMap.entrySet()) {
            String competitorId = entry.getKey();
            Competitor competitor = entry.getValue();
            List<Result> results = competitorResultsMap.getOrDefault(competitorId, Collections.emptyList());

            double totalPoints = 0.0;
            int podiumsCount = 0;
            int winsCount = 0;
            int totalShows = results.size();
            List<ShowScoreContribution> contributions = new ArrayList<>();

            for (Result res : results) {
                Competition comp = competitionMap.get(res.getCompetitionId());
                if (comp == null) continue;

                // Check 5-year window restriction
                int yearsDiff = currentYear - comp.getYear();
                if (yearsDiff < 0 || yearsDiff >= 5) {
                    continue; // Skip shows outside the 5-year window
                }

                // 1. Calculate Base Points based on placement curve
                double basePoints = calculateBasePoints(res.getRank(), formula);

                // 2. Tier Multiplier (Fibonacci: T1=5x, T2=3x, T3=2x, T4=1x)
                double tierMultiplier = comp.getTier().getMultiplier();

                // 3. Recency Multiplier (Fibonacci: Y0=5x, Y-1=3x, Y-2=2x, Y-3=1x, Y-4=1x)
                double recencyMultiplier = calculateRecencyMultiplier(yearsDiff);

                // Final Score for this show
                double showScore = basePoints * tierMultiplier * recencyMultiplier;
                totalPoints += showScore;

                if (res.getRank() == 1) winsCount++;
                if (res.getRank() <= 3) podiumsCount++;

                contributions.add(new ShowScoreContribution(
                        comp.getId(),
                        comp.getName(),
                        comp.getYear(),
                        comp.getTier(),
                        res.getRank(),
                        Math.round(basePoints * 100.0) / 100.0,
                        tierMultiplier,
                        recencyMultiplier,
                        Math.round(showScore * 100.0) / 100.0
                ));
            }

            // Sort contributions by final points descending
            contributions.sort((a, b) -> Double.compare(b.getFinalPoints(), a.getFinalPoints()));

            rankings.add(new CompetitorRanking(
                    0, competitor, totalPoints, podiumsCount, winsCount, contributions.size(), contributions
            ));
        }

        // Sort competitors by total points descending
        rankings.sort((a, b) -> Double.compare(b.getTotalPoints(), a.getTotalPoints()));

        // Assign global rank numbers
        for (int i = 0; i < rankings.size(); i++) {
            rankings.get(i).setGlobalRank(i + 1);
        }

        return rankings;
    }

    public double calculateBasePoints(int rank, String formula) {
        if (rank < 1 || rank > 10) return 0.0;

        switch (formula) {
            case "EXPONENTIAL":
                // Smooth decay: 100 * e^(-0.25 * (rank - 1))
                return 100.0 * Math.exp(-0.25 * (rank - 1));

            case "STANDARD_POINTS":
                // Standard podium point table: 100, 70, 50, 40, 30, 25, 20, 15, 10, 5
                double[] stdPoints = {100.0, 70.0, 50.0, 40.0, 30.0, 25.0, 20.0, 15.0, 10.0, 5.0};
                return stdPoints[rank - 1];

            case "INVERSE":
            default:
                // Primary requested curve: y = 100 / x
                return 100.0 / rank;
        }
    }

    public double calculateRecencyMultiplier(int yearsDiff) {
        // Fibonacci sequence for recency (last 5 years)
        switch (yearsDiff) {
            case 0: return 5.0; // Current year (e.g. 2026)
            case 1: return 3.0; // 2025
            case 2: return 2.0; // 2024
            case 3: return 1.0; // 2023
            case 4: return 1.0; // 2022
            default: return 0.0; // Outside 5 years
        }
    }
}
