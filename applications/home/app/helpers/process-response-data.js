import { helper } from '@ember/component/helper';

export default helper(function processResponseData([responses, scenario]) {
  if (!responses || !Array.isArray(responses)) {
    return {
      totalResponses: 0,
      averageTime: 0,
      demographics: {},
      preferences: [],
    };
  }

  const totalResponses = responses.length;
  const totalTime = responses.reduce(
    (sum, r) => sum + (r.response_time_seconds || 0),
    0,
  );
  const averageTime = totalResponses > 0 ? totalTime / totalResponses : 0;

  // Demographics breakdown
  const demographics = {
    gender: groupBy(responses, 'gender'),
    age: groupBy(responses, 'age'),
    caste: groupBy(responses, 'caste'),
  };

  // Process preferences based on scenario
  let preferences = [];
  switch (scenario) {
    case 'simple_choice':
    case 'choice_overload':
      preferences = processChoicePreferences(responses);
      break;
    case 'ranking':
      preferences = processRankingPreferences(responses);
      break;
    case 'point_allocation':
      preferences = processPointPreferences(responses);
      break;
    case 'approval_voting':
      preferences = processApprovalPreferences(responses);
      break;
  }

  return {
    totalResponses,
    averageTime: Math.round(averageTime * 100) / 100,
    demographics,
    preferences,
  };
});

function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const value = item[key] || 'Not specified';
    groups[value] = (groups[value] || 0) + 1;
    return groups;
  }, {});
}

function processChoicePreferences(responses) {
  const counts = groupBy(responses, 'selected_option');
  return Object.entries(counts).map(([option, count]) => ({
    option,
    count,
    percentage: Math.round((count / responses.length) * 100),
  }));
}

function processRankingPreferences(responses) {
  const rankings = {};
  responses.forEach((response) => {
    if (response.rankings && Array.isArray(response.rankings)) {
      response.rankings.forEach((option, index) => {
        if (!rankings[option]) rankings[option] = [];
        rankings[option].push(index + 1);
      });
    }
  });

  return Object.entries(rankings).map(([option, positions]) => ({
    option,
    averageRank:
      positions.reduce((sum, pos) => sum + pos, 0) / positions.length,
    topChoiceCount: positions.filter((pos) => pos === 1).length,
  }));
}

function processPointPreferences(responses) {
  const totals = {};
  responses.forEach((response) => {
    if (
      response.point_distribution &&
      Array.isArray(response.point_distribution)
    ) {
      response.point_distribution.forEach((item) => {
        totals[item.option] = (totals[item.option] || 0) + (item.points || 0);
      });
    }
  });

  const totalPoints = Object.values(totals).reduce(
    (sum, points) => sum + points,
    0,
  );
  return Object.entries(totals).map(([option, points]) => ({
    option,
    totalPoints: points,
    percentage: totalPoints > 0 ? Math.round((points / totalPoints) * 100) : 0,
  }));
}

function processApprovalPreferences(responses) {
  const approvals = {};
  responses.forEach((response) => {
    if (response.approved_options && Array.isArray(response.approved_options)) {
      response.approved_options.forEach((option) => {
        approvals[option] = (approvals[option] || 0) + 1;
      });
    }
  });

  return Object.entries(approvals).map(([option, count]) => ({
    option,
    approvalCount: count,
    approvalRate: Math.round((count / responses.length) * 100),
  }));
}
