// Teacher Performance Update Utilities
// Functions to automatically update teacher performance when students submit assessments or ratings

import { db } from './firebase-config.js';
import { 
    doc, 
    updateDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

/**
 * Update teacher performance metrics based on new student assessment
 * Called automatically when teachers/TAs submit assessments
 */
export async function updateTeacherPerformanceFromAssessment(teacherUID, assessmentData) {
    try {
        // Get current teacher performance data
        const teacherPerformanceRef = doc(db, 'teachers', teacherUID, 'performance', 'current');
        const teacherPerformanceDoc = await getDoc(teacherPerformanceRef);
        
        let performanceData = teacherPerformanceDoc.exists() 
            ? teacherPerformanceDoc.data() 
            : initializeTeacherPerformance();

        // Calculate new student achievement score contribution
        const studentScoreWeight = 0.4; // 40% weight for student scores
        const newScore = assessmentData.score;
        
        // Update running average of student scores
        if (!performanceData.studentScores) {
            performanceData.studentScores = {
                average: newScore,
                count: 1,
                total: newScore
            };
        } else {
            performanceData.studentScores.count += 1;
            performanceData.studentScores.total += newScore;
            performanceData.studentScores.average = performanceData.studentScores.total / performanceData.studentScores.count;
        }

        // Calculate overall performance score
        performanceData.overallScore = calculateOverallTeacherScore(performanceData);
        performanceData.lastUpdated = serverTimestamp();
        
        // Update teacher performance document
        await updateDoc(teacherPerformanceRef, performanceData);
        
        console.log(`Teacher ${teacherUID} performance updated - Student assessment score: ${newScore}%`);
        
    } catch (error) {
        console.error('Error updating teacher performance from assessment:', error);
    }
}

/**
 * Update teacher performance metrics based on student ratings
 * Called automatically when students submit teacher ratings
 */
export async function updateTeacherPerformanceFromRating(teacherUID, rating) {
    try {
        // Get all ratings for this teacher
        const ratingsQuery = query(
            collection(db, 'teachers', teacherUID, 'ratings')
        );
        
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
        
        // Calculate average rating
        const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        
        // Get current teacher performance data
        const teacherPerformanceRef = doc(db, 'teachers', teacherUID, 'performance', 'current');
        const teacherPerformanceDoc = await getDoc(teacherPerformanceRef);
        
        let performanceData = teacherPerformanceDoc.exists() 
            ? teacherPerformanceDoc.data() 
            : initializeTeacherPerformance();

        // Update student feedback score (30% weight)
        performanceData.studentFeedback = {
            averageRating: averageRating,
            totalRatings: ratings.length,
            lastRating: rating
        };

        // Calculate overall performance score
        performanceData.overallScore = calculateOverallTeacherScore(performanceData);
        performanceData.lastUpdated = serverTimestamp();
        
        // Update teacher performance document
        await updateDoc(teacherPerformanceRef, performanceData);
        
        console.log(`Teacher ${teacherUID} performance updated - Student rating: ${rating}/5`);
        
    } catch (error) {
        console.error('Error updating teacher performance from rating:', error);
    }
}

/**
 * Update teacher performance metrics based on professional engagement
 * Called when teachers attend meetings, complete professional development, etc.
 */
export async function updateTeacherProfessionalEngagement(teacherUID, engagementData) {
    try {
        const teacherPerformanceRef = doc(db, 'teachers', teacherUID, 'performance', 'current');
        const teacherPerformanceDoc = await getDoc(teacherPerformanceRef);
        
        let performanceData = teacherPerformanceDoc.exists() 
            ? teacherPerformanceDoc.data() 
            : initializeTeacherPerformance();

        // Update professional engagement metrics (30% weight)
        if (!performanceData.professionalEngagement) {
            performanceData.professionalEngagement = {
                meetingAttendance: 0,
                professionalDevelopment: 0,
                collaborationScore: 0
            };
        }

        // Update specific engagement metrics
        Object.assign(performanceData.professionalEngagement, engagementData);

        // Calculate overall performance score
        performanceData.overallScore = calculateOverallTeacherScore(performanceData);
        performanceData.lastUpdated = serverTimestamp();
        
        await updateDoc(teacherPerformanceRef, performanceData);
        
        console.log(`Teacher ${teacherUID} professional engagement updated`);
        
    } catch (error) {
        console.error('Error updating teacher professional engagement:', error);
    }
}

/**
 * Calculate overall teacher performance score from all metrics
 */
function calculateOverallTeacherScore(performanceData) {
    let score = 0;
    let totalWeight = 0;

    // Student achievement scores (40% weight)
    if (performanceData.studentScores?.average) {
        score += performanceData.studentScores.average * 0.4;
        totalWeight += 0.4;
    }

    // Student feedback/ratings (30% weight)
    if (performanceData.studentFeedback?.averageRating) {
        const ratingScore = (performanceData.studentFeedback.averageRating / 5) * 100;
        score += ratingScore * 0.3;
        totalWeight += 0.3;
    }

    // Professional engagement (30% weight)
    if (performanceData.professionalEngagement) {
        const engagementScore = calculateEngagementScore(performanceData.professionalEngagement);
        score += engagementScore * 0.3;
        totalWeight += 0.3;
    }

    return totalWeight > 0 ? score / totalWeight * 100 : 0;
}

/**
 * Calculate professional engagement score
 */
function calculateEngagementScore(engagement) {
    // This is a simplified calculation - can be enhanced based on specific requirements
    const meetingScore = Math.min(engagement.meetingAttendance || 0, 100);
    const devScore = Math.min(engagement.professionalDevelopment || 0, 100);
    const collabScore = Math.min(engagement.collaborationScore || 0, 100);
    
    return (meetingScore + devScore + collabScore) / 3;
}

/**
 * Initialize teacher performance data structure
 */
function initializeTeacherPerformance() {
    return {
        overallScore: 0,
        studentScores: {
            average: 0,
            count: 0,
            total: 0
        },
        studentFeedback: {
            averageRating: 0,
            totalRatings: 0
        },
        professionalEngagement: {
            meetingAttendance: 0,
            professionalDevelopment: 0,
            collaborationScore: 0
        },
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
    };
}

/**
 * Get teacher performance trend
 */
export async function getTeacherPerformanceTrend(teacherUID, days = 30) {
    try {
        // This would query historical performance data
        // Implementation depends on how historical data is stored
        console.log(`Getting performance trend for teacher ${teacherUID} over ${days} days`);
        
        // Return sample trend data for now
        return {
            trend: 'improving',
            change: 5.2,
            period: `${days} days`
        };
    } catch (error) {
        console.error('Error getting teacher performance trend:', error);
        return null;
    }
}

/**
 * Update principal performance based on teacher performance
 * Called when teacher performance changes significantly
 */
export async function updatePrincipalPerformanceFromTeachers(principalUID) {
    try {
        // Get all teachers under this principal
        const teachersQuery = query(
            collection(db, 'users'),
            where('role', 'in', ['Teacher', 'Teacher Assistant']),
            where('principal', '==', principalUID)
        );
        
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate average teacher performance
        let totalTeacherScore = 0;
        let teacherCount = 0;
        
        for (const teacher of teachers) {
            const performanceDoc = await getDoc(doc(db, 'teachers', teacher.id, 'performance', 'current'));
            if (performanceDoc.exists()) {
                totalTeacherScore += performanceDoc.data().overallScore || 0;
                teacherCount++;
            }
        }
        
        if (teacherCount > 0) {
            const averageTeacherPerformance = totalTeacherScore / teacherCount;
            
            // Update principal performance
            const principalPerformanceRef = doc(db, 'principals', principalUID, 'performance', 'current');
            await updateDoc(principalPerformanceRef, {
                teacherPerformanceAverage: averageTeacherPerformance,
                teacherCount: teacherCount,
                lastUpdated: serverTimestamp()
            });
            
            console.log(`Principal ${principalUID} performance updated based on ${teacherCount} teachers`);
        }
        
    } catch (error) {
        console.error('Error updating principal performance from teachers:', error);
    }
}