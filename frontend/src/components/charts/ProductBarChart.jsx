import { Chart } from 'react-chartjs-2';
import '../../charts.js';

// Product / channel ranking bars (horizontal by default).
export default function ProductBarChart({ type = 'bar', data, options, ...rest }) {
  return <Chart type={type} data={data} options={options} {...rest} />;
}
