import { Chart } from 'react-chartjs-2';
import '../../charts.js';

// Category / channel share doughnut.
export default function CategoryPieChart({ type = 'doughnut', data, options, ...rest }) {
  return <Chart type={type} data={data} options={options} {...rest} />;
}
