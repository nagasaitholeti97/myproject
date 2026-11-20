package com.sams.domain;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

public final class Periods {

    private Periods() {}

    public static final List<String> TIMES = List.of(
        "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "01:00 - 02:00", "02:00 - 03:00");

    /** Hour (0 to 4) in which a section has a subject on a weekday. Same formula as the website demo. */
    public static int periodOf(int sectionIndex, int subjectIndex, DayOfWeek day) {
        return (subjectIndex + day.getValue() + sectionIndex) % TIMES.size();
    }

    public static int periodOf(int sectionIndex, int subjectIndex, LocalDate date) {
        return periodOf(sectionIndex, subjectIndex, date.getDayOfWeek());
    }
}
