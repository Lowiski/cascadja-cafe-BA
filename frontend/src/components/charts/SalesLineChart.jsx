import { Chart } from 'react-chartjs-2';
import '../../charts.js'; // registers Chart.js + shared defaults

// Revenue/marketing trend. Defaults to the combo bar+line setup used by the
// overview, but accepts `type="line"` for pure trend series.
export default function SalesLineChart({ type = 'bar', data, options, ...rest }) {
  return <Chart type={type} data={data} options={options} {...rest} />;
}
