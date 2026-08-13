package com.strongman.rankings.model;

import java.util.List;

public class CompetitorRanking {
    private int globalRank;
    private Competitor competitor;
    private double totalPoints;
    private int podiumsCount;
    private int winsCount;
    private int totalShows;
    private List<ShowScoreContribution> contributions;

    public CompetitorRanking() {}

    public CompetitorRanking(int globalRank, Competitor competitor, double totalPoints, int podiumsCount, int winsCount, int totalShows, List<ShowScoreContribution> contributions) {
        this.globalRank = globalRank;
        this.competitor = competitor;
        this.totalPoints = Math.round(totalPoints * 100.0) / 100.0;
        this.podiumsCount = podiumsCount;
        this.winsCount = winsCount;
        this.totalShows = totalShows;
        this.contributions = contributions;
    }

    public int getGlobalRank() { return globalRank; }
    public void setGlobalRank(int globalRank) { this.globalRank = globalRank; }

    public Competitor getCompetitor() { return competitor; }
    public void setCompetitor(Competitor competitor) { this.competitor = competitor; }

    public double getTotalPoints() { return totalPoints; }
    public void setTotalPoints(double totalPoints) { this.totalPoints = totalPoints; }

    public int getPodiumsCount() { return podiumsCount; }
    public void setPodiumsCount(int podiumsCount) { this.podiumsCount = podiumsCount; }

    public int getWinsCount() { return winsCount; }
    public void setWinsCount(int winsCount) { this.winsCount = winsCount; }

    public int getTotalShows() { return totalShows; }
    public void setTotalShows(int totalShows) { this.totalShows = totalShows; }

    public List<ShowScoreContribution> getContributions() { return contributions; }
    public void setContributions(List<ShowScoreContribution> contributions) { this.contributions = contributions; }
}
