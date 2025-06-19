import { helper } from '@ember/component/helper';

export default helper(function formatChartData([responses, scenario]) {
  if (!responses || !Array.isArray(responses)) {
    return [];
  }

  let data = [];

  switch (scenario) {
    case 'simple_choice':
    case 'choice_overload':
      data = formatChoiceData(responses);
      break;
    case 'ranking':
      data = formatRankingData(responses);
      break;
    case 'point_allocation':
      data = formatPointData(responses);
      break;
    case 'approval_voting':
      data = formatApprovalData(responses);
      break;
  }

  return data.sort((a, b) => b.value - a.value);
});

function formatChoiceData(responses) {
  const counts = {};
  responses.forEach((response) => {
    const option = response.selected_option;
    counts[option] = (counts[option] || 0) + 1;
  });

  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function formatRankingData(responses) {
  const scores = {};
  responses.forEach((response) => {
    if (response.rankings && Array.isArray(response.rankings)) {
      response.rankings.forEach((option, index) => {
        const score = response.rankings.length - index;
        scores[option] = (scores[option] || 0) + score;
      });
    }
  });

  return Object.entries(scores).map(([label, value]) => ({ label, value }));
}

function formatPointData(responses) {
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

  return Object.entries(totals).map(([label, value]) => ({ label, value }));
}

function formatApprovalData(responses) {
  const counts = {};
  responses.forEach((response) => {
    if (response.approved_options && Array.isArray(response.approved_options)) {
      response.approved_options.forEach((option) => {
        counts[option] = (counts[option] || 0) + 1;
      });
    }
  });

  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}
