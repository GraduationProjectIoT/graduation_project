import Papa from "papaparse";
import React, { useState, useEffect } from "react";
import cheerio from "cheerio";
import AppPresenter from "./AppPresenter";

export default () => {
    const [resultData, setResultData] = useState(null);
    const [allPacket, setAllPacket] = useState(null);
    const [packetCSV, setPacketCSV] = useState(null);
    const [packetJSON, setPacketJSON] = useState(null);
    const [packetHTML, setPacketHTML] = useState(null);
    const [popupData, setPopupData] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [type, setType] = useState("zigbee");

    useEffect(() => {
        if (packetCSV !== null && packetJSON !== null && packetHTML !== null && type === "zigbee") {
            console.log("csv", packetCSV)
            console.log("html", packetHTML)
            
            setAllPacket(() => {
                const save = packetCSV.map(packet => {
                    return {
                        ...packet,
                        timestamp: packetJSON[packet.no]["timestamp"],
                        value: packetJSON[packet.no]["value"],
                        changed: packetJSON[packet.no]["changed"]
                    }
                });
                return save;
            });

            setResultData(() => {
                let result = packetCSV.map(packet => {
                    return {
                        ...packet,
                        timestamp: packetJSON[packet.no]["timestamp"],
                        value: packetJSON[packet.no]["value"],
                        changed: packetJSON[packet.no]["changed"]
                    }
                });

                // 같은 seq의 패킷이 오면 하나만 남겨두고 나머지 제거
                for (let i = 0;i < result.length; i++) {
                    for (let j = i + 1;j < result.length; j++) {
                        // seq number가 같은 패킷이 있다면 제거
                        if (result[j].seq === result[i].seq) {
                            result.splice(j, 1);
                        }
                    }
                }

                // default response와 같은 packet 제거
                result = result.filter(packet => packet.info.includes("OnOff") || packet.info.includes("Level") || packet.info.includes("Color"));

                // Color가 오면 on도 같이 오는데 이때 on은 의도한 커맨드가 아니므로 제거
                result = result.filter((packet, idx) => {
                    if (packet.value === "on") {
                        const color = result.filter(colorTemp => colorTemp.info.split(" ")[1] === "Color" && parseInt(colorTemp.info.split(" ")[8]) === packet.seq + 1);
                        if (color.length !== 0) return false;
                    }
                    return true;
                });

                // 성공 여부 판단
                result = result.map(packet => {
                    const matching = packetHTML.filter(html => {
                        if ((html.date - packet.timestamp) >= 0 && (html.date - packet.timestamp) <= 2000 && String(html.feature) === String(packet.value)) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (matching.length === 1) {
                        return {
                            ...packet,
                            success: true,
                            message: "Success"
                        }
                    } else if (matching.length === 0) {
                        return {
                            ...packet,
                            success: false,
                            message: "No Command"
                        }
                    } else {
                        return {
                            ...packet,
                            success: false,
                            message: "More than One"
                        }
                    }
                });
                console.log("result", result)

                // graphData에 데이터 넣기
                setGraphData(() => {
                    return {
                        command: [
                            ["Command", "Number"],
                            ["On", result.filter(command => command.value === "on").length],
                            ["Off", result.filter(command => command.value === "off").length],
                            ["Color temperature", result.filter(command => command.info.split(" ")[1] === "Color").length],
                            ["Level control", result.filter(command => command.info.split(" ")[1] === "Level").length]
                        ],
                        isSuccess: [
                            ["Success", "Number"],
                            ["Success", result.filter(command => command.success === true).length],
                            ["Error", result.filter(command => command.success === false).length]
                        ]
                    }
                });

                return result;
            });
        }
    }, [packetCSV, packetJSON, packetHTML]);

    const readFilesZigbee = files => {
        if (files.length !== 3) {
            alert("3개 파일을 모두 넣어주세요.");
            return;
        }
        for(let i = 0; i < files.length; i++) {
            if(files[i].name.indexOf("csv") >= 0) {
                Papa.parse(files[i], {
                    header: true,
                    complete: result => { 
                        result.data.pop();
                        setPacketCSV(() => (
                            result.data.map(packet => {
                                const tmp = packet["Info"].split(" ");
                                const seq = parseInt(tmp[tmp.length - 1]);
                                const command = packet["Info"].includes("Color") ? "color" : packet["Info"].includes("Level") ? "level" : packet["Info"].includes("OnOff: Off") ? "off" : packet["Info"].includes("OnOff: On") ? "on" : "";

                                return {
                                    no: packet["No."],
                                    time: packet["Time"],
                                    source: packet["Source"],
                                    destination: packet["Destination"],
                                    protocol: packet["Protocol"],
                                    length: packet["Length"],
                                    info: packet["Info"],
                                    seq: seq,
                                    command: command
                                }
                            })
                        ));
                    }
                });
            } else if (files[i].name.indexOf("json") >= 0) {
                const reader = new FileReader();
                reader.onload = (() => {
                    return e => {
                        try {
                            const json = JSON.parse(e.target.result);
                            setPacketJSON(() => {
                                const result = {};
                                json.forEach(packet => {
                                    const timestamp = packet._source.layers.frame["frame.time"];
                                    let splitedDate = timestamp.split(" ");
                                    splitedDate.pop();
                                    splitedDate.pop();

                                    result[packet._source.layers.frame["frame.number"]] = {"timestamp": "", "value": "", "changed": ""};

                                    const setMill = new Date(splitedDate.join(" "));
                                    setMill.setMilliseconds(0)
                                    result[packet._source.layers.frame["frame.number"]]["timestamp"] = setMill

                                    let value = "";
                                    let changed = "";
                                    if ("zbee_zcl" in packet._source.layers) {
                                        const type = result[packet._source.layers.frame["frame.number"]]["value"] = packet._source.layers.zbee_zcl;

                                        if ("zbee_zcl_general.onoff.cmd.srv_rx.id" in type) {
                                            // on인 경우
                                            if (type["zbee_zcl_general.onoff.cmd.srv_rx.id"] === "0x00000001") { 
                                                value = "on";
                                            } 
                                            // off인 경우
                                            else if (type["zbee_zcl_general.onoff.cmd.srv_rx.id"] === "0x00000000") { 
                                                value = "off";
                                            }
                                        } else if ("Payload" in type) {
                                            const payload = type["Payload"];
                                            // level인 경우
                                            if ("zbee_zcl_general.level_control.level" in payload) {
                                                value = Math.round(parseInt(payload["zbee_zcl_general.level_control.level"]) * 100 / 255);
                                            }
                                            // color인 경우
                                            else if ("zbee_zcl_lighting.color_control.color_temp" in payload) {
                                                value = Math.round(parseInt(1000000 / parseInt(payload["zbee_zcl_lighting.color_control.color_temp"])) / 100) * 100
                                            }
                                        } else if ("Attribute Field" in type) {
                                            // report attribute인 경우
                                            // onoff인 경우
                                            if ("zbee_zcl_general.onoff.attr.onoff" in type["Attribute Field"]) {
                                                changed = type["Attribute Field"]["zbee_zcl_general.onoff.attr.onoff"] === "0x00000000" ? "off" : "on";
                                            } else if ("zbee_zcl_general.level_control.attr.current_level" in type["Attribute Field"]) {
                                                // level인 경우
                                                changed = Math.round(parseInt(type["Attribute Field"]["zbee_zcl_general.level_control.attr.current_level"]) * 100 / 255);
                                            }
                                        } else if ("Status Record" in type) {
                                            // Read Attributes Response인 경우
                                            if ("zbee_zcl_lighting.color_control.attr.color_temperature" in type["Status Record"]) {
                                                changed = Math.round(parseInt(1000000 / parseInt(type["Status Record"]["zbee_zcl_lighting.color_control.attr.color_temperature"])) / 100) * 100
                                            }
                                        }
                                    }
                                    result[packet._source.layers.frame["frame.number"]]["value"] = value;
                                    result[packet._source.layers.frame["frame.number"]]["changed"] = changed;
                                });
                                console.log("json", result);
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
                                $(".table.table-bordered.table-condensed.tbl-sm tbody tr").map(function (i, element) {
                                    const result = {};
                                    const splitedDate = String($(element).find('td:nth-of-type(1)').text().trim()).split(" ");
                                    const day = splitedDate[0].split(" ")[0];
                                    const time = splitedDate[1].split(":");
                                    result['date'] = new Date(day.split("-")[0], parseInt(day.split("-")[1]) - 1, day.split("-")[2], splitedDate[2] === "오후" ? parseInt(time[0]) + 12 : time[0], time[1], time[2], 0);
                                    result['name'] = String($(element).find('td:nth-of-type(4)').text().trim());
                                    result['feature'] = String($(element).find('td:nth-of-type(5)').text().trim());
                                    results.push(result);
                                });
                                results.reverse();
                                return results;           
                        });
                        
                        }catch(err){
                            console.log(err);
                            alert("error parsing html");
                        }                        
                    }
                })(files[i]);
                reader.readAsText(files[i]);

            } else {
                console.log("Wrong file");
                alert("You put the wrong files");
            }
        }
    };

    const readFilesBLE = files => {
        if (files.length !== 1) {
            alert("1개 파일만 넣어주세요.");
        }
        for(let i = 0; i < files.length; i++) {
            if(files[i].name.indexOf("json") >= 0) {
                const reader = new FileReader();
                reader.onload = (() => {
                    return e => {
                        try {
                            // TODO: 파싱해서 필요한 데이터 뽑기
                            const json = JSON.parse(e.target.result);
                            setResultData(() => {
                                let result = [];
                                json.forEach(packet => {
                                    const timestamp = packet._source.layers.frame["frame.time"];
                                    let splitedDate = timestamp.split(" ");
                                    splitedDate.pop();
                                    splitedDate.pop()
                                    result.push({"no": parseInt(packet._source.layers.frame["frame.number"]), "timestamp": "", "value": "", "info": "", "request": "", "success": false})
                                    const setMill = new Date(splitedDate.join(" "));
                                    setMill.setMilliseconds(0)
                                    result[result.length - 1]["timestamp"] = setMill

                                    if ("btatt" in packet._source.layers) {
                                        // 시작점
                                        if ("btatt.handle" in packet._source.layers.btatt) {
                                            result[result.length - 1]["value"] = packet._source.layers.btatt["btatt.handle"];
                                            result[result.length - 1]["info"] = "Request";
                                            // 끝점
                                            if ("btatt.request_in_frame" in packet._source.layers.btatt) {
                                                result[result.length - 1]["request"] = parseInt(packet._source.layers.btatt["btatt.request_in_frame"]);
                                                result[result.length - 1]["info"] = "Response";
                                            }
                                        }
                                    } else if ("btle" in packet._source.layers) {
                                        // empty PDU
                                        result[result.length - 1]["info"] = "Empty PDU";
                                    }
                                });
                                setAllPacket(result);
                                console.log("json", result);

                                // packet 성공 여부 판단
                                result.map(packet => {
                                    if (packet.info === "Request") {
                                        const first = result.filter(element => element.no === packet.no + 1)[0];
                                        const second = result.filter(element => element.no === packet.no + 2)[0];
                                        const response = result.filter(element => element.no === packet.no + 3)[0];
                                        if (first.info === "Empty PDU" && second.info === "Empty PDU" && response.info === "Response") {
                                            packet.success = true;
                                            return packet;
                                        } else {
                                            return packet;
                                        }
                                    } else {
                                        return packet;
                                    }
                                })

                                // response만 거르기
                                result = result.filter(packet => packet.info === "Request");

                                setGraphData(() => {
                                    return {
                                        isSuccess: [
                                            ["Success", "Number"],
                                            ["Success", result.filter(command => command.success === true).length],
                                            ["Error", result.filter(command => command.success === false).length]
                                        ]
                                    }
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
            }
        }
    };

    const handleInputChange = event => {
        if (event.target.files.length <= 0) return;
        const files = event.target.files;
        if (type === "zigbee") {
            readFilesZigbee(files);
        } else {
            readFilesBLE(files);
        }
    }

    const onClickTable = (packet) => {
        if (type === "zigbee") {
            if (packet.success === true) {
                setPopupData(curr => {
                    return {
                        success: true,
                        data: packet
                    };
                });
            } else if (packet.success === false) {
                if (packet.value === "on" || packet.value === "off" || packet.info.split(" ")[1] === "Level") {
                    // 시간 2초이내로 필터링
                    const filtered = allPacket.filter(element => (element.timestamp - packet.timestamp) >= 0 && (element.timestamp - packet.timestamp) <= 2000 && element.info.includes("Report Attributes") === true);
                    // 변경된 값이 맞는지 필터링
                    const matching = filtered.filter(element => element.changed === packet.value);

                    if (filtered.length < 1) { // report attribute가 없는 경우
                        setPopupData(curr => {
                            return {
                                success: false,
                                data: "No Report Attribute",
                                code: 0,
                                packet: packet
                            }
                        });
                    } else if (matching.length < 1) { // report attribute의 변경된 값이 일치하지 않는 경우
                        setPopupData(curr => {
                            return {
                                success: false,
                                data: "Wrong Report Attribute value",
                                code: 1,
                                packet: packet,
                                report: filtered
                            }
                        });
                    } else { // report attribute가 정상적인데, 클라우드에 기록이 안된 경우
                        setPopupData(curr => {
                            return {
                                success: false,
                                data: "Fail to write in cloud",
                                code: 2,
                                packet: packet
                            }
                        });
                    }
                } else if (packet.info.split(" ")[1] === "Color") {
                    // 시간 2초이내로 필터링
                    const filtered = allPacket.filter(element => (element.timestamp - packet.timestamp) >= 0 && (element.timestamp - packet.timestamp) <= 2000 && element.info.includes("Read Attributes Response") === true);
                    // 변경된 값이 맞는지 필터링
                    const matching = filtered.filter(element => element.changed === packet.value);
                    if (filtered.length < 1) { // read attribute response가 없는 경우
                        setPopupData(curr => {
                            return {
                                success: false,
                                data: "No Read Attribute Response",
                                code: 0,
                                packet: packet
                            }
                        });
                    } else if (matching.length < 1) { // read attribute response의 변경된 값이 일치하지 않는 경우
                        setPopupData(curr => {
                            return {
                                success: false,
                                data: "Wrong Read Attribute Response",
                                code: 1,
                                packet: packet,
                                report: filtered
                            }
                        });
                    } else { // read attribute response가 정상적인데, 클라우드에 기록이 안된 경우
                        setPopupData(curr => {
                            return {
                                success: false,
                                data: "Fail to write in cloud",
                                code: 2,
                                packet: packet
                            }
                        });
                    }
                } else {
                    setPopupData(curr => {
                        return {
                            success: false,
                            code: 3,
                            data: "error"
                        };
                    });
                }
            }
        } else if (type === "ble") {
            // TODO: popupdata도 세팅
        }
    }

    const onClickRadio = (id) => {
        setType(id);
        setResultData(null);
        setPopupData(null);
        setPacketCSV(null);
        setPacketHTML(null);
        setPacketJSON(null);
        setAllPacket(null);
        setGraphData(null);
    }
    
    return <AppPresenter resultData={resultData} popupData={popupData} graphData={graphData} type={type} setType={setType} handleInputChange={handleInputChange} onClickTable={onClickTable} onClickRadio={onClickRadio}/>
}
