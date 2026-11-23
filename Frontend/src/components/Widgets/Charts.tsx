import type { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'

interface ApexChartProps {
  series: any[]
  options: ApexOptions
}

const ApexChart = ({ series, options }: ApexChartProps) => {
  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
          width={500}
        />
      </div>
    </div>
  )
}

export default ApexChart
