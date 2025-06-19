import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

export default helper(function generateBarChart([data, maxValue]) {
  if (!data || !Array.isArray(data)) {
    return htmlSafe('<div class="text-muted">No data available</div>');
  }

  const max = maxValue || Math.max(...data.map((d) => d.value));

  const bars = data
    .map((item) => {
      const percentage = max > 0 ? (item.value / max) * 100 : 0;
      return `
      <div class="bar-item mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="bar-label">${item.label}</span>
          <span class="bar-value">${item.value}</span>
        </div>
        <div class="progress" style="height: 8px;">
          <div class="progress-bar" 
               role="progressbar" 
               style="width: ${percentage}%" 
               aria-valuenow="${item.value}" 
               aria-valuemin="0" 
               aria-valuemax="${max}">
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  return htmlSafe(`<div class="bar-chart">${bars}</div>`);
});
