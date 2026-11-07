package com.homenest.promotion;

import jakarta.validation.constraints.NotBlank;

public class TriggerEventRequest {

    @NotBlank(message = "Vui lòng chọn loại sự kiện cần kích hoạt")
    private String eventPreset;

    public TriggerEventRequest() {}

    public TriggerEventRequest(String eventPreset) {
        this.eventPreset = eventPreset;
    }

    public String getEventPreset() { return eventPreset; }
    public void setEventPreset(String eventPreset) { this.eventPreset = eventPreset; }
}

