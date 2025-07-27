import api from '../api/axios';

// Smart Donor-Recipient Matching Algorithm
export const findBestDonorMatch = (request, donors) => {
  if (!request || !donors || donors.length === 0) return null;

  const compatibleDonors = donors.filter(donor => 
    donor.bloodGroup === request.bloodGroupNeeded
  );

  if (compatibleDonors.length === 0) return null;

  // Calculate match score for each compatible donor
  const scoredDonors = compatibleDonors.map(donor => {
    let score = 0;
    
    // Higher score for more experienced donors
    score += (donor.donations || 0) * 10;
    
    // Higher score for donors with recent activity
    if (donor.lastDonationDate) {
      const daysSinceLastDonation = (Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastDonation >= 56) { // Eligible to donate again
        score += 50;
      }
    }
    
    // Higher score for donors with higher donations this year
    score += (donor.donationsThisYear || 0) * 5;
    
    // Bonus for verified donors
    if (donor.verified) score += 20;
    
    return { ...donor, matchScore: score };
  });

  // Sort by score and return top 3 matches
  return scoredDonors
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
};

// Health Risk Assessment
export const assessDonorHealth = (donorData) => {
  const risks = [];
  let overallRisk = 'LOW';
  
  // Check gender-specific criteria
  const gender = donorData.gender?.toLowerCase() || donorData.screeningAnswers?.find(a => a.question === 'gender')?.answer?.toLowerCase();
  
  // Check age-related risks
  if (donorData.age < 18 || donorData.age > 65) {
    risks.push('Age outside donation range (18-65)');
    overallRisk = 'HIGH';
  }
  
  // Check weight requirements (can vary by gender)
  if (donorData.weight < 50) {
    risks.push('Weight below minimum requirement (50kg)');
    overallRisk = 'HIGH';
  } else if (gender === 'female' && donorData.weight < 55) {
    risks.push('Female donors should ideally weigh at least 55kg for optimal safety');
    overallRisk = 'MEDIUM';
  }
  
  // Check donation frequency (gender-specific limits)
  const maxDonationsPerYear = gender === 'male' ? 6 : 4; // Males can donate more frequently
  if (donorData.donationsThisYear > maxDonationsPerYear) {
    risks.push(`High donation frequency this year (max ${maxDonationsPerYear} for ${gender || 'your gender'})`);
    overallRisk = 'MEDIUM';
  }
  
  // Check if eligible to donate (56 days since last donation)
  if (donorData.lastDonationDate) {
    const daysSinceLastDonation = (Date.now() - new Date(donorData.lastDonationDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastDonation < 56) {
      risks.push(`Too soon since last donation (${Math.ceil(daysSinceLastDonation)} days ago)`);
      overallRisk = 'HIGH';
    }
  }
  
  // Gender-specific health considerations
  if (gender === 'female') {
    // Check for pregnancy-related restrictions
    const pregnancyAnswer = donorData.screeningAnswers?.find(a => a.question === 'pregnancy')?.answer?.toLowerCase();
    if (pregnancyAnswer && (pregnancyAnswer.includes('yes') || pregnancyAnswer.includes('true'))) {
      risks.push('Pregnant women or recent mothers may not be eligible to donate');
      overallRisk = 'HIGH';
    }
    
    // Check for menstrual cycle considerations
    const menstrualAnswer = donorData.screeningAnswers?.find(a => a.question === 'menstrual')?.answer?.toLowerCase();
    if (menstrualAnswer && (menstrualAnswer.includes('yes') || menstrualAnswer.includes('true'))) {
      risks.push('Consider donating after your menstrual cycle for optimal iron levels');
      overallRisk = 'MEDIUM';
    }
    
    // Check for iron levels
    const ironAnswer = donorData.screeningAnswers?.find(a => a.question === 'iron_levels')?.answer?.toLowerCase();
    if (ironAnswer && (ironAnswer.includes('yes') || ironAnswer.includes('true'))) {
      risks.push('History of low iron levels - consider iron supplements before donation');
      overallRisk = 'MEDIUM';
    }
    
    // Check for birth control
    const birthControlAnswer = donorData.screeningAnswers?.find(a => a.question === 'birth_control')?.answer?.toLowerCase();
    if (birthControlAnswer && (birthControlAnswer.includes('yes') || birthControlAnswer.includes('true'))) {
      // Informational only - birth control doesn't disqualify
      recommendations.push('Birth control pills are generally safe with blood donation');
    }
  } else if (gender === 'male') {
    // Check for prostate health
    const prostateAnswer = donorData.screeningAnswers?.find(a => a.question === 'prostate_health')?.answer?.toLowerCase();
    if (prostateAnswer && (prostateAnswer.includes('yes') || prostateAnswer.includes('true'))) {
      risks.push('Prostate health issues may require medical clearance before donation');
      overallRisk = 'MEDIUM';
    }
    
    // Check for testosterone supplements
    const testosteroneAnswer = donorData.screeningAnswers?.find(a => a.question === 'testosterone')?.answer?.toLowerCase();
    if (testosteroneAnswer && (testosteroneAnswer.includes('yes') || testosteroneAnswer.includes('true'))) {
      risks.push('Testosterone supplements may affect blood donation eligibility');
      overallRisk = 'MEDIUM';
    }
  } else {
    // Check for general health concerns
    const generalHealthAnswer = donorData.screeningAnswers?.find(a => a.question === 'general_health')?.answer?.toLowerCase();
    if (generalHealthAnswer && generalHealthAnswer.trim() !== 'no' && generalHealthAnswer.trim() !== 'none') {
      risks.push('Please discuss your health concerns with medical staff before donation');
      overallRisk = 'MEDIUM';
    }
  }
  
  return {
    overallRisk,
    risks,
    eligible: overallRisk === 'LOW',
    recommendations: getHealthRecommendations(risks, gender),
    gender: gender
  };
};

// Get health recommendations based on risks
const getHealthRecommendations = (risks, gender) => {
  const recommendations = [];
  
  if (risks.some(r => r.includes('Age'))) {
    recommendations.push('Please verify your age meets donation requirements');
  }
  
  if (risks.some(r => r.includes('Weight'))) {
    if (gender === 'female') {
      recommendations.push('Female donors should maintain a healthy weight of at least 55kg for optimal safety');
    } else {
      recommendations.push('Please ensure you meet the minimum weight requirement of 50kg');
    }
  }
  
  if (risks.some(r => r.includes('frequency'))) {
    const maxDonations = gender === 'male' ? 6 : 4;
    recommendations.push(`Consider limiting donations to ${maxDonations} times per year for your health`);
  }
  
  if (risks.some(r => r.includes('Too soon'))) {
    recommendations.push('Wait at least 56 days between donations');
  }
  
  if (risks.some(r => r.includes('Pregnant'))) {
    recommendations.push('Please wait until 6 weeks after childbirth before donating');
  }
  
  if (risks.some(r => r.includes('menstrual'))) {
    recommendations.push('Consider donating after your menstrual cycle for optimal iron levels');
  }
  
  if (risks.some(r => r.includes('iron levels'))) {
    recommendations.push('Consider taking iron supplements and eating iron-rich foods before donation');
  }
  
  if (risks.some(r => r.includes('prostate'))) {
    recommendations.push('Please consult with your doctor about blood donation with prostate health issues');
  }
  
  if (risks.some(r => r.includes('testosterone'))) {
    recommendations.push('Please discuss testosterone supplements with medical staff before donation');
  }
  
  // Gender-specific general recommendations
  if (gender === 'female') {
    recommendations.push('Female donors should maintain adequate iron levels through diet or supplements');
    recommendations.push('Consider donating during the middle of your menstrual cycle for optimal iron levels');
    recommendations.push('Birth control pills are generally safe with blood donation');
  } else if (gender === 'male') {
    recommendations.push('Male donors can donate up to 6 times per year with proper spacing');
    recommendations.push('Regular prostate health checkups are recommended for male donors');
  } else {
    recommendations.push('Please discuss any specific health concerns with medical staff');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('You appear eligible to donate. Please consult with medical staff.');
  }
  
  return recommendations;
};

// Demand Prediction Algorithm
export const predictBloodDemand = (historicalData) => {
  if (!historicalData || historicalData.length < 30) {
    return { prediction: 'Insufficient data', confidence: 'LOW' };
  }
  
  // Simple moving average prediction
  const recentRequests = historicalData.slice(-7); // Last 7 days
  const avgDailyRequests = recentRequests.reduce((sum, day) => sum + day.count, 0) / 7;
  
  // Seasonal adjustment (higher demand in summer/holidays)
  const currentMonth = new Date().getMonth();
  const seasonalMultiplier = getSeasonalMultiplier(currentMonth);
  
  const predictedDemand = Math.round(avgDailyRequests * seasonalMultiplier);
  
  return {
    prediction: predictedDemand,
    confidence: 'MEDIUM',
    trend: getTrendDirection(historicalData),
    seasonalFactor: seasonalMultiplier
  };
};

// Get seasonal multiplier for demand prediction
const getSeasonalMultiplier = (month) => {
  // Summer months (June-August) and holiday season (Dec) have higher demand
  if (month >= 5 && month <= 7) return 1.2; // Summer
  if (month === 11) return 1.3; // December holidays
  return 1.0; // Normal demand
};

// Get trend direction
const getTrendDirection = (data) => {
  if (data.length < 14) return 'STABLE';
  
  const recent = data.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const previous = data.slice(-14, -7).reduce((sum, day) => sum + day.count, 0);
  
  if (recent > previous * 1.1) return 'INCREASING';
  if (recent < previous * 0.9) return 'DECREASING';
  return 'STABLE';
};

// Smart Notification Timing
export const getOptimalNotificationTime = (donorHistory) => {
  if (!donorHistory || donorHistory.length === 0) {
    return { dayOfWeek: 'Tuesday', timeOfDay: '10:00' };
  }
  
  // Analyze donor's response patterns
  const responseTimes = donorHistory
    .filter(h => h.notificationSent && h.responseReceived)
    .map(h => ({
      dayOfWeek: new Date(h.notificationSent).getDay(),
      timeOfDay: new Date(h.notificationSent).getHours(),
      responseTime: new Date(h.responseReceived) - new Date(h.notificationSent)
    }));
  
  if (responseTimes.length === 0) {
    return { dayOfWeek: 'Tuesday', timeOfDay: '10:00' };
  }
  
  // Find best performing day and time
  const dayPerformance = {};
  const timePerformance = {};
  
  responseTimes.forEach(rt => {
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rt.dayOfWeek];
    const time = `${rt.timeOfDay}:00`;
    
    if (!dayPerformance[day]) dayPerformance[day] = [];
    if (!timePerformance[time]) timePerformance[time] = [];
    
    dayPerformance[day].push(rt.responseTime);
    timePerformance[time].push(rt.responseTime);
  });
  
  const bestDay = Object.keys(dayPerformance).reduce((best, day) => {
    const avgResponse = dayPerformance[day].reduce((sum, time) => sum + time, 0) / dayPerformance[day].length;
    return avgResponse < (dayPerformance[best]?.reduce((sum, time) => sum + time, 0) / dayPerformance[best]?.length || Infinity) ? day : best;
  });
  
  const bestTime = Object.keys(timePerformance).reduce((best, time) => {
    const avgResponse = timePerformance[time].reduce((sum, t) => sum + t, 0) / timePerformance[time].length;
    return avgResponse < (timePerformance[best]?.reduce((sum, t) => sum + t, 0) / timePerformance[best]?.length || Infinity) ? time : best;
  });
  
  return { dayOfWeek: bestDay, timeOfDay: bestTime };
};

// Sentiment Analysis for Feedback
export const analyzeFeedbackSentiment = (feedbackText) => {
  if (!feedbackText) return { sentiment: 'NEUTRAL', score: 0 };
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'helpful', 'satisfied', 'happy', 'love', 'perfect'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointed', 'angry', 'frustrated', 'hate', 'worst', 'useless'];
  
  const words = feedbackText.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const score = positiveCount - negativeCount;
  
  if (score > 0) return { sentiment: 'POSITIVE', score };
  if (score < 0) return { sentiment: 'NEGATIVE', score: Math.abs(score) };
  return { sentiment: 'NEUTRAL', score: 0 };
};

// API calls for AI features
export const getSmartRecommendations = async (userId) => {
  try {
    const response = await api.get(`/analytics/recommendations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch smart recommendations:', error);
    throw error;
  }
}; 