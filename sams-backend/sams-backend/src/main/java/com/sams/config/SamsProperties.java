package com.sams.config;

import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Minimum percentage and the date the app treats as "today". */
@Component
public class SamsProperties {

    private final int minimum;
    private final String demoToday;

    public SamsProperties(@Value("${sams.minimum-percentage:75}") int minimum,
                          @Value("${sams.demo-today:}") String demoToday) {
        this.minimum = minimum;
        this.demoToday = demoToday;
    }

    public int minimum() {
        return minimum;
    }

    public LocalDate today() {
        return demoToday == null || demoToday.isBlank() ? LocalDate.now() : LocalDate.parse(demoToday);
    }
}
