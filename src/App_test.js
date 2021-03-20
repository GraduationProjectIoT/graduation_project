import './App.css';
import Packet from "./Packet"
import { PieChart } from 'react-minimal-pie-chart';

function App() {
  const handleInputChange = () => {

  };

  const chartData = [
    { title: 'On', value: 10, color: '#CBE3EE' },
    { title: 'Off', value: 15, color: '#96C4D8' },
    { title: 'Color', value: 20, color: '#548BA1' },
    { title: 'Level', value: 20, color: '#2A3E4D' },
  ];

  return (
    <div className="container">
      <div className="body">
        <div className="left">
          <div className="title">
            <div>No.</div>
            <div>Command Type</div>
            <div>Status</div>
          </div>
          <div className="accordion accordion-flush" id="accordionFlushExample">
            <Packet no={1} status={"success"}></Packet>
            <Packet no={2} status={"success"}></Packet>
            <Packet no={3} status={"error"}></Packet>
          </div>
        </div>
        <div className="right">
          <div className="chart">
            <h3 style={{paddingBottom: "10px"}}>Commands (%)</h3>
            <PieChart
              data={chartData}
              label={({ dataEntry }) => dataEntry.title + " " + dataEntry.value + "%"}
              labelStyle={{ fontSize: "5px"}}
            />
          </div>
          <div className="percentage flex">
            <span>3</span>
            <span>/</span>
            <span>12545</span>
            <span>개</span>
          </div>
          <div className="mb-3">
            <input className="form-control" type="file" id="formFile" multiple onChange={handleInputChange}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
