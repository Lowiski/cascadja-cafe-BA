import { Chart } from 'react-chartjs-2';
import '../../charts.js';

// Customer segment / city / day-of-week charts.
export default function CustomerChart({ type = 'bar', data, options, ...rest }) {
  return <Chart type={type} data={data} options={options} {...rest} />;
}
