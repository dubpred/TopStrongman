package com.strongman.rankings.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.strongman.rankings.model.Competition;
import com.strongman.rankings.model.Competitor;
import com.strongman.rankings.model.DatabaseRow;
import com.strongman.rankings.model.Result;
import com.strongman.rankings.model.ShowTier;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.util.*;

@Repository
public class CompetitionDataRepository {

    private final Map<String, Competitor> competitors = new HashMap<>();
    private final Map<String, Competition> competitions = new HashMap<>();
    private final List<Result> results = new ArrayList<>();

    @PostConstruct
    private void initData() {
        try {
            // Read from the root directory where database_strongman.json is stored
            File dbFile = new File("../database_strongman.json");
            if (!dbFile.exists()) {
                dbFile = new File("database_strongman.json");
            }
            if (!dbFile.exists()) {
                System.err.println("Could not find database_strongman.json");
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            List<DatabaseRow> rows = mapper.readValue(dbFile, new TypeReference<List<DatabaseRow>>() {});

            for (DatabaseRow row : rows) {
                // 1. Process Competitor
                String compId = generateId(row.getCompetitorFName(), row.getCompetitorLName());
                if (!competitors.containsKey(compId)) {
                    Competitor c = new Competitor();
                    c.setId(compId);
                    c.setName(row.getCompetitorFName() + " " + row.getCompetitorLName());
                    c.setNickname("Unknown");
                    c.setCountry("International");
                    c.setCountryCode("UN");
                    c.setFlagEmoji("🌐");
                    c.setImageUrl("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"); // default
                    c.setHeightCm(190);
                    c.setWeightKg(150);
                    competitors.put(compId, c);
                }

                // 2. Process Competition
                String showId = generateShowId(row.getShowName());
                if (!competitions.containsKey(showId)) {
                    Competition comp = new Competition();
                    comp.setId(showId);
                    comp.setName(row.getShowName());
                    comp.setYear(row.getYear());
                    comp.setTier(determineTier(row.getShowPromotion(), row.getShowName()));
                    comp.setLocation("Unknown Location");
                    competitions.put(showId, comp);
                }

                // 3. Process Result
                results.add(new Result(showId, compId, row.getPlacementRank()));
            }

            System.out.println("Loaded " + rows.size() + " rows from JSON database.");
            System.out.println("Generated " + competitors.size() + " competitors and " + competitions.size() + " competitions.");

        } catch (Exception e) {
            System.err.println("Failed to load JSON database: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String generateId(String fName, String lName) {
        return (fName + "_" + lName).toLowerCase().replaceAll("[^a-z0-9]", "");
    }
    
    private String generateShowId(String showName) {
        return showName.toLowerCase().replaceAll("[^a-z0-9]", "_");
    }

    private ShowTier determineTier(String promotion, String showName) {
        if ("WSM".equals(promotion) || "Arnold Classic".equals(promotion) || "Shaw Classic".equals(promotion) || "Rogue".equals(promotion)) {
            return ShowTier.TIER_1;
        } else if (showName.contains("Europe's") || "NASM".equals(promotion)) {
            return ShowTier.TIER_3;
        } else if ("Giants Live".equals(promotion) && !showName.contains("Britain's")) {
            return ShowTier.TIER_2;
        } else {
            return ShowTier.TIER_4;
        }
    }

    public Collection<Competitor> getAllCompetitors() {
        return competitors.values();
    }

    public Optional<Competitor> getCompetitorById(String id) {
        return Optional.ofNullable(competitors.get(id));
    }

    public Collection<Competition> getAllCompetitions() {
        return competitions.values();
    }

    public Optional<Competition> getCompetitionById(String id) {
        return Optional.ofNullable(competitions.get(id));
    }

    public List<Result> getAllResults() {
        return results;
    }
}
