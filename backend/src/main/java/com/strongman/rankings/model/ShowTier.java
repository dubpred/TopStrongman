package com.strongman.rankings.model;

public enum ShowTier {
    TIER_1(1, "Tier 1: World Championship Level", 5.0),
    TIER_2(2, "Tier 2: Giants Live International", 3.0),
    TIER_3(3, "Tier 3: Continental Championships", 2.0),
    TIER_4(4, "Tier 4: National & Regional Pro/Am", 1.0);

    private final int tierNumber;
    private final String description;
    private final double multiplier;

    ShowTier(int tierNumber, String description, double multiplier) {
        this.tierNumber = tierNumber;
        this.description = description;
        this.multiplier = multiplier;
    }

    public int getTierNumber() {
        return tierNumber;
    }

    public String getDescription() {
        return description;
    }

    public double getMultiplier() {
        return multiplier;
    }
}
