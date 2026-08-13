package com.strongman.rankings.model;

public class Competitor {
    private String id;
    private String name;
    private String nickname;
    private String country;
    private String countryCode;
    private String flagEmoji;
    private String imageUrl;
    private double heightCm;
    private double weightKg;

    public Competitor() {}

    public Competitor(String id, String name, String nickname, String country, String countryCode, String flagEmoji, String imageUrl, double heightCm, double weightKg) {
        this.id = id;
        this.name = name;
        this.nickname = nickname;
        this.country = country;
        this.countryCode = countryCode;
        this.flagEmoji = flagEmoji;
        this.imageUrl = imageUrl;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public String getFlagEmoji() { return flagEmoji; }
    public void setFlagEmoji(String flagEmoji) { this.flagEmoji = flagEmoji; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getHeightCm() { return heightCm; }
    public void setHeightCm(double heightCm) { this.heightCm = heightCm; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }
}
