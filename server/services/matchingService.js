import User from '../models/User.js';

export const matchingService = {
  /**
   * Deterministic, explainable matching algorithm.
   * Compares current user's wanted/offered skills with community users.
   */
  async getMatchesForUser(currentUserId, { limit = 20 } = {}) {
    const currentUser = await User.findById(currentUserId)
      .populate('skillsOffered.skill')
      .populate('skillsWanted.skill');

    if (!currentUser) throw new Error('User not found');

    const wantedSkillIds = currentUser.skillsWanted.map((s) => s.skill?._id?.toString() || s.skill?.toString());
    const offeredSkillIds = currentUser.skillsOffered.map((s) => s.skill?._id?.toString() || s.skill?.toString());

    // Find candidates who are not the current user and not suspended
    const candidates = await User.find({
      _id: { $ne: currentUserId },
      isSuspended: false
    })
      .populate('skillsOffered.skill')
      .populate('skillsWanted.skill')
      .limit(100);

    const scoredMatches = [];

    for (const candidate of candidates) {
      let score = 0;
      const reasons = [];
      let isDirectSkillMatch = false;
      let isMutualMatch = false;
      const matchedSkills = [];

      // 1. SKILL OVERLAP (Max 50 points)
      // Check if candidate offers any skill current user wants
      const candidateOfferedIds = candidate.skillsOffered.map((s) => ({
        id: s.skill?._id?.toString() || s.skill?.toString(),
        name: s.skill?.name,
        level: s.level
      }));

      const sharedTaughtSkills = candidateOfferedIds.filter((cos) => wantedSkillIds.includes(cos.id));

      if (sharedTaughtSkills.length > 0) {
        score += 50;
        isDirectSkillMatch = true;
        const skillNames = sharedTaughtSkills.map((s) => s.name).join(', ');
        reasons.push(`Teaches ${skillNames} which is on your learning wishlist`);
        matchedSkills.push(...sharedTaughtSkills.map((s) => s.name));
      }

      // Check if candidate wants any skill current user offers (Mutual Barter Bonus)
      const candidateWantedIds = candidate.skillsWanted.map((s) => ({
        id: s.skill?._id?.toString() || s.skill?.toString(),
        name: s.skill?.name
      }));

      const sharedWantedSkills = candidateWantedIds.filter((cws) => offeredSkillIds.includes(cws.id));

      if (sharedWantedSkills.length > 0) {
        isMutualMatch = true;
        score += 10; // Bonus mutual interest
        const mutualSkillNames = sharedWantedSkills.map((s) => s.name).join(', ');
        reasons.push(`Mutual Exchange: Wants to learn ${mutualSkillNames} which you teach!`);
      }

      // If there's neither a direct skill match nor mutual match, skip unless user has no skills set
      if (!isDirectSkillMatch && !isMutualMatch && wantedSkillIds.length > 0) {
        continue;
      }

      // 2. AVAILABILITY OVERLAP (Max 20 points)
      let availScore = 0;
      const dayOverlap =
        (currentUser.availability?.weekdays && candidate.availability?.weekdays) ||
        (currentUser.availability?.weekends && candidate.availability?.weekends);

      if (dayOverlap) {
        availScore += 10;
        if (currentUser.availability?.weekends && candidate.availability?.weekends) {
          reasons.push('Shared weekend availability');
        } else {
          reasons.push('Shared weekday availability');
        }
      }

      // Time slots overlap
      const mySlots = currentUser.availability?.timeSlots || [];
      const theirSlots = candidate.availability?.timeSlots || [];
      const commonSlots = mySlots.filter((slot) => theirSlots.includes(slot));

      if (commonSlots.length > 0) {
        availScore += 10;
        reasons.push(`Overlapping ${commonSlots[0].toLowerCase()} schedule`);
      }

      score += availScore;

      // 3. PREFERRED SESSION MODE (Max 10 points)
      if (
        currentUser.preferredMode === 'BOTH' ||
        candidate.preferredMode === 'BOTH' ||
        currentUser.preferredMode === candidate.preferredMode
      ) {
        score += 10;
        const modeDesc =
          currentUser.preferredMode === candidate.preferredMode
            ? `${currentUser.preferredMode.toLowerCase().replace('_', ' ')} sessions`
            : 'flexible online/in-person preference';
        reasons.push(`Compatible with ${modeDesc}`);
      }

      // 4. RATING FACTOR (Max 10 points)
      const rating = candidate.rating || 5.0;
      const ratingScore = Math.min(10, Math.round((rating / 5) * 10));
      score += ratingScore;
      if (rating >= 4.5 && (candidate.completedSessions || 0) > 0) {
        reasons.push(`Top-rated community member (${rating.toFixed(1)} ★)`);
      }

      // 5. COMPLETED SESSIONS / EXPERIENCE (Max 10 points)
      const sessions = candidate.completedSessions || 0;
      let expScore = 2;
      if (sessions >= 10) {
        expScore = 10;
        reasons.push(`Experienced teacher with ${sessions} completed sessions`);
      } else if (sessions >= 3) {
        expScore = 6;
        reasons.push(`Active learner with ${sessions} successful exchanges`);
      }
      score += expScore;

      // Clamp score to 100 max
      const finalScore = Math.min(100, Math.max(10, score));

      scoredMatches.push({
        user: {
          _id: candidate._id,
          name: candidate.name,
          profilePhoto: candidate.profilePhoto,
          bio: candidate.bio,
          location: candidate.location,
          rating: candidate.rating,
          reviewCount: candidate.reviewCount,
          completedSessions: candidate.completedSessions,
          preferredMode: candidate.preferredMode,
          skillsOffered: candidate.skillsOffered,
          skillsWanted: candidate.skillsWanted,
          spendableCredits: candidate.spendableCredits
        },
        matchScore: finalScore,
        isMutualMatch,
        matchedSkills,
        reasons
      });
    }

    // Sort descending by matchScore
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    return scoredMatches.slice(0, limit);
  }
};
