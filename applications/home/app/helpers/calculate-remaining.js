import { helper } from '@ember/component/helper';

export default helper(function calculateRemaining([
  pointDistribution,
  totalPoints = 10,
]) {
  if (!pointDistribution || !Array.isArray(pointDistribution)) {
    return totalPoints;
  }

  const usedPoints = pointDistribution.reduce((sum, item) => {
    return sum + (parseInt(item.points) || 0);
  }, 0);

  return Math.max(0, totalPoints - usedPoints);
});
