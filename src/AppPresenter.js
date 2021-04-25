import React from "react";
import "tabler-react/dist/Tabler.css";
import "./css/App.css";
import { Table, Tag } from "tabler-react";
import Chart from "react-google-charts";
import Success from "./img/success.png";
import FailCloud from "./img/fail_cloud.png";
import FailResponse from "./img/fail_response.png";
import SuccessBLE from "./img/success_ble.png";
import FailBLE from "./img/fail_ble.png";

export default ({resultData, popupData, graphData, type, setType, handleInputChange, onClickTable, onClickRadio}) => (
    <div>
        <div style={{height: "50px", width: "100%", display: "flex", borderBottom: "1px solid #dee2e6", background: "white", alignItems: "center"}}>
            <div style={{fontSize: "1.2em", fontWeight: "1000", padding: "0px 10px", color: "#222222"}}>Packet Analyzer</div>
            <div>
                <div className="form-check" style={{display: "inline-block", paddingLeft: "30px", cursor: "pointer"}}>
                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="zigbee" checked={type === "zigbee"} onClick={e => onClickRadio(e.target.id)}/>
                    <label className="form-check-label" for="zigbee" style={{cursor: "pointer"}}>
                        Zigbee
                    </label>
                </div>
                <div className="form-check" style={{display: "inline-block", paddingLeft: "30px", cursor: "pointer"}}>
                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="ble" checked={type === "ble"} onClick={e => onClickRadio(e.target.id)}/>
                    <label className="form-check-label" for="ble" style={{cursor: "pointer"}}>
                        BLE
                    </label>
                </div>
            </div>
            <div className="mb-3" style={{position: "absolute", right: "10px", paddingTop: "10px", paddingRight: "30px"}}>
                <input className="form-control" type="file" id="formFile" multiple onChange={handleInputChange} />
            </div>
        </div>
        <div style={{overflow: "auto", maxHeight: "400px", borderBottom: "1px solid #dee2e6"}}>
            <Table>
                {type === "zigbee" && (
                <Table.Header>
                    <Table.ColHeader>No.</Table.ColHeader>
                    <Table.ColHeader>Time</Table.ColHeader>
                    <Table.ColHeader>Source</Table.ColHeader>
                    <Table.ColHeader>Destination</Table.ColHeader>
                    <Table.ColHeader>Protocol</Table.ColHeader>
                    <Table.ColHeader>Length</Table.ColHeader>
                    <Table.ColHeader>Info</Table.ColHeader>
                    <Table.ColHeader>Value</Table.ColHeader>
                    <Table.ColHeader>Timestamp</Table.ColHeader>
                </Table.Header>
                )}
                {type === "ble" && (
                <Table.Header>
                    <Table.ColHeader>No.</Table.ColHeader>
                    <Table.ColHeader>Info</Table.ColHeader>
                    <Table.ColHeader>Value</Table.ColHeader>
                    <Table.ColHeader>Timestamp</Table.ColHeader>
                </Table.Header>
                )}
                {(type === "zigbee" && resultData !== null) && resultData.map((packet, idx) => (
                    <Table.Body key={packet.no} style={{"background": "white", "cursor": "pointer", "fontSize": "0.9em"}} onClick={() => onClickTable(packet)}>
                        <Table.Row style={packet.success ? {background: "white"} : {background: "#FFD2D2"}}>
                            <Table.Col>{packet.no}</Table.Col>
                            <Table.Col>{packet.time}</Table.Col>
                            <Table.Col>{packet.source}</Table.Col>
                            <Table.Col>{packet.destination}</Table.Col>
                            <Table.Col>{packet.protocol}</Table.Col>
                            <Table.Col>{packet.length}</Table.Col>
                            <Table.Col>{packet.info}</Table.Col>
                            <Table.Col>{packet.value}</Table.Col>
                            <Table.Col>{packet.timestamp.toString()}</Table.Col>
                        </Table.Row>
                    </Table.Body>
                ))}
                {(type === "ble" && resultData !== null) && resultData.map((packet, idx) => (
                    <Table.Body key={packet.no} style={{"background": "white", "cursor": "pointer", "fontSize": "0.9em"}} onClick={() => onClickTable(packet)}>
                        <Table.Row style={packet.success ? {background: "white"} : {background: "#FFD2D2"}}>
                            <Table.Col>{packet.no}</Table.Col>
                            <Table.Col>{packet.info}</Table.Col>
                            <Table.Col>{packet.value}</Table.Col>
                            <Table.Col>{packet.timestamp.toString()}</Table.Col>
                        </Table.Row>
                    </Table.Body>
                ))}
            </Table>
        </div>
        {graphData !== null && (
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 5px", background: "#f5f7fb"}}>
                {type === "zigbee" && (
                    <div>
                        <Chart
                            width={'450px'}
                            height={'300px'}
                            chartType="PieChart"
                            loader={<div>Loading Chart</div>}
                            data={graphData.command}
                            options={{
                                title: 'Commands',
                                backgroundColor: "#f5f7fb",
                                colors: ["#D8E3E7", "#51C4D3", "#126E82", "#132C33"]
                            }}
                            rootProps={{ 'data-testid': '1' }}
                        />
                    </div>
                )}
                <div>
                    <Chart
                        width={'450px'}
                        height={'300px'}
                        chartType="PieChart"
                        loader={<div>Loading Chart</div>}
                        data={graphData.isSuccess}
                        options={{
                            title: 'Error Ratio',
                            backgroundColor: "#f5f7fb",
                            colors: ["#D8E3E7", "#51C4D3", "#126E82", "#132C33"]
                        }}
                        rootProps={{ 'data-testid': '1' }}
                    />
                </div>
                <div>
                    {popupData === null && (
                        <div style={{width: "500px", height: "300px", textAlign: "center", border: "1px solid #D8E3E7", borderRadius: "5px", background: "white", paddingTop: "10px"}}>Select the packet</div>
                    )}
                    {popupData !== null && type === "zigbee" && (
                        <>
                        {popupData.success === true && (
                            <div style={{width: "500px", height: "300px", border: "1px solid #D8E3E7", borderRadius: "5px", background: "white", padding: "10px 15px"}}>
                                <div>
                                    <div style={{display: "inline-block", fontWeight: "600"}}>No.{popupData.data.no}</div>
                                    <div style={{display: "inline-block", float: "right"}}>
                                        <Tag color="azure">Success</Tag>
                                    </div> 
                                </div>
                                <div style={{padding: "30px 40px 0px 40px"}}>
                                    <div style={{display: "inline-block", width: "50%", textAlign: "center", fontWeight: "600", fontSize: "1.3em"}}>{popupData.data.command}</div>
                                    <div style={{display: "inline-block", width: "50%", textAlign: "center", fontWeight: "600", fontSize: "1.3em"}}>{popupData.data.command}</div>
                                </div>
                                <img src={Success} alt="Success" style={{padding: "5px 20px"}}/>  
                            </div>
                        )}
                        {popupData.success === false && (
                            <div style={{width: "500px", height: "300px", border: "1px solid #D8E3E7", borderRadius: "5px", background: "white", padding: "10px 15px"}}>
                                {(popupData.code === 1 || popupData.code === 0) && ( // response가 없거나 값이 이상한 경우
                                    <div>
                                        <div>
                                            <div style={{display: "inline-block", fontWeight: "600"}}>No.{popupData.packet.no}</div>
                                            <div style={{display: "inline-block", float: "right"}}>
                                                <Tag color="red">Error</Tag>
                                            </div> 
                                        </div>
                                        <div style={{padding: "20px 50px 0px 90px"}}>
                                            <div style={{display: "inline-block", width: "50%", textAlign: "center", fontWeight: "600", fontSize: "1.3em"}}>{popupData.packet.command}</div>
                                            <div style={{display: "inline-block", width: "50%", textAlign: "center", fontWeight: "600", fontSize: "1.3em", color: "red"}}>Error</div>
                                        </div>
                                        <img src={FailResponse} alt="Error" style={{padding: "5px 20px"}}/> 
                                        <div style={{paddingTop: "20px", textAlign: "center", fontWeight: "700", color: "red"}}>{popupData.data}</div>
                                    </div>
                                )}
                                {popupData.code === 2 && ( // 클라우드 기록에 실패한 경우
                                    <div>
                                        <div>
                                            <div style={{display: "inline-block", fontWeight: "600"}}>No.{popupData.packet.no}</div>
                                            <div style={{display: "inline-block", float: "right"}}>
                                                <Tag color="red">Error</Tag>
                                            </div> 
                                        </div>
                                        <div style={{padding: "20px 50px 0px 90px"}}>
                                            <div style={{display: "inline-block", width: "50%", textAlign: "center", fontWeight: "600", fontSize: "1.3em", color: "red"}}>Error</div>
                                            <div style={{display: "inline-block", width: "50%", textAlign: "center", fontWeight: "600", fontSize: "1.3em"}}>{popupData.packet.command}</div>
                                        </div>
                                        <img src={FailCloud} alt="Error" style={{padding: "5px 20px"}}/> 
                                        <div style={{paddingTop: "20px", textAlign: "center", fontWeight: "700", color: "red"}}>{popupData.data}</div>
                                    </div>
                                )}
                                {popupData.code === 3 && ( // 그냥 이상한 경우
                                    <div>
                                        <div>
                                            <div style={{display: "inline-block", fontWeight: "600"}}>No.{popupData.packet.no}</div>
                                            <div style={{display: "inline-block", float: "right"}}>
                                                <Tag color="red">Error</Tag>
                                            </div> 
                                        </div>
                                        <div>
                                            error
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        </>
                    )}
                    {popupData !== null && type === "ble" && (
                        <>
                        {popupData.success === true && (
                            <div style={{width: "500px", height: "300px", border: "1px solid #D8E3E7", borderRadius: "5px", background: "white", padding: "10px 15px"}}>
                                <div>
                                    <div style={{display: "inline-block", fontWeight: "600"}}>No.{popupData.data.no}</div>
                                    <div style={{display: "inline-block", float: "right"}}>
                                        <Tag color="azure">Success</Tag>
                                    </div> 
                                </div>
                                <img src={SuccessBLE} alt="SuccessBLE" style={{paddingTop: "10px"}}/>  
                            </div>
                        )}
                        {popupData.success === false && (
                            <div style={{width: "500px", height: "300px", border: "1px solid #D8E3E7", borderRadius: "5px", background: "white", padding: "10px 15px"}}>
                                <div>
                                    <div>
                                        <div style={{display: "inline-block", fontWeight: "600"}}>No.{popupData.packet.no}</div>
                                        <div style={{display: "inline-block", paddingLeft: "20px", textAlign: "center", fontWeight: "700", color: "red"}}>{popupData.data}</div>
                                        <div style={{display: "inline-block", float: "right"}}>
                                            <Tag color="red">Error</Tag>
                                        </div> 
                                    </div>
                                    <img src={FailBLE} alt="Error" style={{paddingTop: "10px"}}/> 
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        )}
    </div>
)