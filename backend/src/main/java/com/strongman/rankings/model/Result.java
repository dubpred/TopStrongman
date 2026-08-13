package com.strongman.rankings.model;

public class Result {
    private String competitionId;
    private String competitorId;
    private int rank; // 1 to 10

    public Result() {}

    public Result(String competitionId, String competitorId, int rank) {
        this.competitionId = competitionId;
        this.competitorId = competitorId;
        this.rank = rank;
    }

    public String getCompetitionId() { return competitionId; }
    public void setCompetitionId(String competitionId) { this.competitionId = competitionId; }

    public String getCompetitorId() { return competitorId; }
    public void setCompetitorId(String competitorId) { this.competitorId = competitorId; }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
}
