package com.sams.domain;

import static org.junit.jupiter.api.Assertions.*;

import com.sams.domain.AttendanceMath.Stat;
import org.junit.jupiter.api.Test;

class AttendanceMathTest {

    @Test
    void noClassesMeansNoPercentage() {
        Stat s = AttendanceMath.of(0, 0, 75);
        assertNull(s.percentage());
        assertEquals("none", s.level());
    }

    @Test
    void belowMinimumNeedsClassesInARow() {
        // 18 of 27 = 66.7%. Attending 9 more in a row gives 27 of 36 = 75%.
        Stat s = AttendanceMath.of(27, 18, 75);
        assertFalse(s.eligible());
        assertEquals("shortage", s.level());
        assertEquals(9, s.classesNeeded());
        assertEquals(0, s.canMiss());
    }

    @Test
    void aboveMinimumCanMissSome() {
        // 21 of 27 = 77.8%. Missing 1 more gives 21 of 28 = 75%.
        Stat s = AttendanceMath.of(27, 21, 75);
        assertTrue(s.eligible());
        assertEquals("borderline", s.level());
        assertEquals(1, s.canMiss());
        assertEquals(0, s.classesNeeded());
    }

    @Test
    void exactlyAtMinimumIsEligible() {
        Stat s = AttendanceMath.of(4, 3, 75);
        assertTrue(s.eligible());
        assertEquals(0, s.canMiss());
    }

    @Test
    void highAttendanceIsGood() {
        assertEquals("good", AttendanceMath.of(20, 19, 75).level());
    }
}
