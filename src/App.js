import Papa from "papaparse";
import React, { useState } from "react";
import "./App.css";
import "tabler-react/dist/Tabler.css";
import { Card, Table } from "tabler-react";

// const data = [
//     {no:"19", time:"93.606933", source:"0x0000", destination:"0xb474", protocol:"ZigBee HA", length:"74", info: "ZCL OnOff: On, Seq: 33"},
//     {no:"273", time:"398.152646", source:"0x0000", destination:"0xb474", protocol:"ZigBee HA", length:"74", info: "ZCL OnOff: Off, Seq: 42"}
// ];

export default () => {
    const [data, setData] = useState(null);
    const [packetCSV, setPacketCSV] = useState(null);
    const [packetJSON, setPacketJSON] = useState(null);

    const readFiles = files => {
        for(let i = 0; i < files.length; i++) {
            if(files[i].name.indexOf("csv") >= 0) {
                console.log("csv file: ", files[i].name)
                Papa.parse(files[i], {
                    header: true,
                    complete: result => { 
                        setPacketCSV(curr => result.data); 
                        console.log(result.data)
                    }
                });
            } else if (files[i].name.indexOf("json") >= 0) {
                console.log("json file: ", files[i].name);
                const reader = new FileReader();
                reader.onload = (theFile => {
                    return e => {
                        try {
                            const json = JSON.parse(e.target.result);
                            setPacketJSON(curr => {
                                return json.map(packet => {
                                    const result = {};
                                    result.number = packet._source.layers.frame["frame.number"];
                                    result.time = packet._source.layers.frame["frame.time"];
                                    return result;
                                })
                            });
                        } catch (err) {
                            console.log(err);
                            alert("error parsing json");
                        }
                    }
                })(files[i]);
                reader.readAsText(files[i]);
            } else if (files[i].name.indexOf(".html")) {
                console.log(files[i])
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
        console.log("packet")
        console.log(packetCSV);
        console.log(packetJSON);
    }

    return (
        <Card>
            <Card.Header className="header">
                <Card.Title className="title"><span style={{fontWeight: "bold"}}>Packet Analyzer</span></Card.Title>
                <div className="mb-3" style={{position: "absolute", right: "20px", paddingTop: "10px", paddingRight: "30px"}}>
                    <input className="form-control" type="file" id="formFile" multiple onChange={handleInputChange} />
                </div>
            </Card.Header>
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
                <Table.Body>
                    {data === null && (
                        <div style={{"fontSize": "20px", "color": "#cccccc", "fontWeight": "700", "padding": "10px 0px 0px 10px"}}>No data</div>
                    )}
                    {data !== null && data.map(({no, time, source, destination, protocol, length, info, timestamp}) => (
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
        </Card>
    )
}