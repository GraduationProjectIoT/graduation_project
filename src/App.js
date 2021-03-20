import React, { Component } from "react";
import "./App.css";

import "tabler-react/dist/Tabler.css";
// import "tabler-react/dist/Tabler.RTL.css";

import { Card, Table, Button, List } from "tabler-react";

const data = [
    {no:"19", time:"93.606933", source:"0x0000", destination:"0xb474", protocol:"ZigBee HA", length:"74", info: "ZCL OnOff: On, Seq: 33"},
    {no:"273", time:"398.152646", source:"0x0000", destination:"0xb474", protocol:"ZigBee HA", length:"74", info: "ZCL OnOff: Off, Seq: 42"}
];

const handleInputChange = () => {

}

export default class MyCard extends Component {
    render() {
        return (
            <Card>
                <Card.Header className="header">
                    <Card.Title className="title"><span style={{fontWeight: "bold"}}>Packet Analyzer</span></Card.Title>
                    <div className="mb-3" style={{position: "absolute", right: "0", paddingTop: "10px", paddingRight: "30px"}}>
                        <input className="form-control" type="file" id="formFile" multiple onChange={handleInputChange}/>
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
                    </Table.Header>
                    <Table.Body>
                        {data.map(({no, time, source, destination, protocol, length, info}) => (
                            <Table.Row>
                                <Table.Col>{no}</Table.Col>
                                <Table.Col>{time}</Table.Col>
                                <Table.Col>{source}</Table.Col>
                                <Table.Col>{destination}</Table.Col>
                                <Table.Col>{protocol}</Table.Col>
                                <Table.Col>{length}</Table.Col>
                                <Table.Col>{info}</Table.Col>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Card>
        )
    }
}