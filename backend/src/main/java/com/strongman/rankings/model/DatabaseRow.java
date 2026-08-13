package com.strongman.rankings.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DatabaseRow {
    private int placementId;
    
    @JsonProperty("Competitor_fName")
    private String competitorFName;
    
    @JsonProperty("Compititor_LName")
    private String competitorLName;
    
    @JsonProperty("Show_Name")
    private String showName;
    
    @JsonProperty("Show_Promotion")
    private String showPromotion;
    
    @JsonProperty("PlacementRank")
    private int placementRank;
    
    @JsonProperty("Year")
    private int year;
    
    @JsonProperty("Date")
    private String date;

    public DatabaseRow() {}

    public int getPlacementId() { return placementId; }
    public void setPlacementId(int placementId) { this.placementId = placementId; }

    public String getCompetitorFName() { return competitorFName; }
    public void setCompetitorFName(String competitorFName) { this.competitorFName = competitorFName; }

    public String getCompetitorLName() { return competitorLName; }
    public void setCompetitorLName(String competitorLName) { this.competitorLName = competitorLName; }

    public String getShowName() { return showName; }
    public void setShowName(String showName) { this.showName = showName; }

    public String getShowPromotion() { return showPromotion; }
    public void setShowPromotion(String showPromotion) { this.showPromotion = showPromotion; }

    public int getPlacementRank() { return placementRank; }
    public void setPlacementRank(int placementRank) { this.placementRank = placementRank; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
