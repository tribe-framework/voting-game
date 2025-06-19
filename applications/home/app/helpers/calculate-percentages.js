import { helper } from '@ember/component/helper';

export default helper(function calculatePercentages([responses]) {
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return [];
  }

  const total = responses.length;
  const counts = {};

  // Count responses by option
  responses.forEach((response) => {
    let key;
    if (response.selected_option) {
      key = response.selected_option;
    } else if (response.rankings && response.rankings.length > 0) {
      key = response.rankings[0]; // Top choice
    } else if (
      response.approved_options &&
      response.approved_options.length > 0
    ) {
      // For approval voting, count each approved option
      response.approved_options.forEach((option) => {
        counts[option] = (counts[option] || 0) + 1;
      });
      return;
    }

    if (key) {
      counts[key] = (counts[key] || 0) + 1;
    }
  });

  // Convert to percentages
  return Object.entries(counts).map(([option, count]) => ({
    option,
    count,
    percentage: Math.round((count / total) * 100),
  }));
});
