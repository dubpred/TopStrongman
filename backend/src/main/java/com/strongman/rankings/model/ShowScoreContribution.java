package com.strongman.rankings.model;

public class ShowScoreContribution {
    private String competitionId;
    private String competitionName;
    private int year;
    private ShowTier tier;
    private int rank;
    private double basePoints;
    private double tierMultiplier;
    private double recencyMultiplier;
    private double finalPoints;

    public ShowScoreContribution() {}

    public ShowScoreContribution(String competitionId, String competitionName, int year, ShowTier tier, int rank, double basePoints, double tierMultiplier, double recencyMultiplier, double finalPoints) {
        this.competitionId = competitionId;
        this.competitionName = competitionName;
        this.year = year;
        this.tier = tier;
        this.rank = rank;
        this.basePoints = basePoints;
        this.tierMultiplier = tierMultiplier;
        this.recencyMultiplier = recencyMultiplier;
        this.finalPoints = finalPoints;
    }

    public String getCompetitionId() { return competitionId; }
    public String getCompetitionName() { return competitionName; }
    public int getYear() { return year; }
    public ShowTier getTier() { return tier; }
    public int getRank() { return rank; }
    public double getBasePoints() { return basePoints; }
    public double getTierMultiplier() { return tierMultiplier; }
    public double getRecencyMultiplier() { return recencyMultiplier; }
    public double getFinalPoints() { return finalPoints; }
}
