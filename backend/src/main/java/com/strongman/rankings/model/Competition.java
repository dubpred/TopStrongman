package com.strongman.rankings.model;

public class Competition {
    private String id;
    private String name;
    private int year;
    private ShowTier tier;
    private String location;

    public Competition() {}

    public Competition(String id, String name, int year, ShowTier tier, String location) {
        this.id = id;
        this.name = name;
        this.year = year;
        this.tier = tier;
        this.location = location;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public ShowTier getTier() { return tier; }
    public void setTier(ShowTier tier) { this.tier = tier; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
