package com.sams.domain;

/** The attendance rules, kept free of Spring so they can be unit tested. */
public final class AttendanceMath {

    private AttendanceMath() {}

    public record Stat(int held, int attended, Double percentage, String level, boolean eligible,
                       int classesNeeded, int canMiss) {
        public int absent() {
            return held - attended;
        }
    }

    /**
     * @param minimum minimum percentage required for the exam (75)
     */
    public static Stat of(int held, int attended, int minimum) {
        if (held == 0) {
            return new Stat(0, 0, null, "none", true, 0, 0);
        }
        double pct = attended * 100.0 / held;
        boolean eligible = pct >= minimum;
        String level = pct >= 80 ? "good" : pct >= minimum ? "borderline" : "shortage";
        // Attend n more in a row: (attended + n) / (held + n) >= 0.75  ->  n >= 3 * held - 4 * attended
        int needed = eligible ? 0 : Math.max(0, 3 * held - 4 * attended);
        // Miss m more and stay at 75%: attended / (held + m) >= 0.75
        int canMiss = eligible ? Math.max(0, Math.floorDiv(4 * attended - 3 * held, 3)) : 0;
        return new Stat(held, attended, pct, level, eligible, needed, canMiss);
    }
}
