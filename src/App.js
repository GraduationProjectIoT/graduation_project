import Papa from "papaparse";
import React, { useState, useEffect } from "react";
import "tabler-react/dist/Tabler.css";
import { Table } from "tabler-react";
import cheerio from "cheerio";

export default () => {
    const [data, setData] = useState(null);
    const [packetCSV, setPacketCSV] = useState(null);
    const [packetJSON, setPacketJSON] = useState(null);
    const [packetHTML, setPacketHTML] = useState(null);

    useEffect(() => {
        if (packetCSV !== null && packetJSON !== null) {
            console.log("Data matching start");
            // 데이터들 매칭
            setData(() => {
                const result = packetCSV.map(packet => {
                    return {
                        ...packet,
                        timestamp: packetJSON[packet.no]
                    }
                });
                return result;
            });
        }
    }, [packetCSV, packetJSON]);

    const readFiles = files => {
        for(let i = 0; i < files.length; i++) {
            if(files[i].name.indexOf("csv") >= 0) {
                console.log("csv file: ", files[i].name)
                Papa.parse(files[i], {
                    header: true,
                    complete: result => { 
                        setPacketCSV(() => (
                            result.data.map(packet => {
                                return {
                                    no: packet["No."],
                                    time: packet["Time"],
                                    source: packet["Source"],
                                    destination: packet["Destination"],
                                    protocol: packet["Protocol"],
                                    length: packet["Length"],
                                    info: packet["Info"],
                                }
                            })
                        )); 
                        console.log(result.data)
                    }
                });
            } else if (files[i].name.indexOf("json") >= 0) {
                console.log("json file: ", files[i].name);
                const reader = new FileReader();
                reader.onload = (() => {
                    return e => {
                        try {
                            const json = JSON.parse(e.target.result);
                            setPacketJSON(() => {
                                const result = {};
                                json.forEach(packet => {
                                    result[packet._source.layers.frame["frame.number"]] = packet._source.layers.frame["frame.time"];
                                });
                                return result;
                            });

                        } catch (err) {
                            console.log(err);
                            alert("error parsing json");
                        }                
                    }
                })(files[i]);
                reader.readAsText(files[i]);
            } else if (files[i].name.indexOf(".html") >= 0) {
                const reader = new FileReader();
                reader.onload = (() => {
                    return e => {
                        try {
                            const $ = cheerio.load(e.target.result);
                            
                            setPacketHTML(() => {
                                const results = [];
                                const bodyList = $(".table.table-bordered.table-condensed.tbl-sm tbody tr").map(function (i, element) {
                                    const result = {};
                                    result['date'] = String($(element).find('td:nth-of-type(1)').text().trim());
                                    result['name'] = String($(element).find('td:nth-of-type(4)').text().trim());
                                    result['feature'] = String($(element).find('td:nth-of-type(5)').text().trim());
                                    results.push(result);
                                });
                                console.log(results);
                                return results;           
                        });
                        
                        }catch(err){
                            console.log(err);
                            alert("error parsing html");
                        }                        
                    }
                })(files[i]);
                reader.readAsText(files[i]);
                console.log(packetHTML);

            } else {
                console.log("Wrong file");
                alert("You put the wrong files");
            }
        }
    }

    const handleInputChange = event => {
        if (event.target.files.length <= 0) return;
        const files = event.target.files;
        readFiles(files);
    }
    
    return (
        <div>
            <div style={{height: "50px", width: "100%", display: "flex", borderBottom: "1px solid #dee2e6", background: "white", alignItems: "center"}}>
                <div style={{fontSize: "1.2em", fontWeight: "1000", paddingLeft: "10px", color: "#222222"}}>Packet Analyzer</div>
                <div className="mb-3" style={{position: "absolute", right: "10px", paddingTop: "10px", paddingRight: "30px"}}>
                    <input className="form-control" type="file" id="formFile" multiple onChange={handleInputChange} />
                </div>
            </div>
            <div style={{overflow: "auto", maxHeight: "500px", borderBottom: "1px solid #dee2e6"}}>
                <Table>
                    <Table.Header>
                        <Table.ColHeader>No.</Table.ColHeader>
                        <Table.ColHeader>Time</Table.ColHeader>
                        <Table.ColHeader>Source</Table.ColHeader>
                        <Table.ColHeader>Destination</Table.ColHeader>
                        <Table.ColHeader>Protocol</Table.ColHeader>
                        <Table.ColHeader>Length</Table.ColHeader>
                        <Table.ColHeader>Info</Table.ColHeader>
                        <Table.ColHeader>Timestamp</Table.ColHeader>
                    </Table.Header>
                    <Table.Body style={{"background": "white"}}>
                        {data !== null && data.map(({no, time, source, destination, protocol, length, info, timestamp}, idx) => (
                            <Table.Row key={no}>
                                <Table.Col>{no}</Table.Col>
                                <Table.Col>{time}</Table.Col>
                                <Table.Col>{source}</Table.Col>
                                <Table.Col>{destination}</Table.Col>
                                <Table.Col>{protocol}</Table.Col>
                                <Table.Col>{length}</Table.Col>
                                <Table.Col>{info}</Table.Col>
                                <Table.Col>{timestamp}</Table.Col>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
            <div>
                <div>여기 3줄 div 지우고 작성하면댐</div>
                <div>참고로 난 <a href="https://tabler-react.com/documentation/">Tabler-React Documentation</a> 이거씀!!</div>
                <div><a href="https://tabler-react.com/">예시</a> 이거는 tabler-react 예시 보여주는거!</div>
            </div>
        </div>
        
    )
}
