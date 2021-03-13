import React from "react";
import './Packet.css';

export default ({ no, status }) => {
    return (
        <div className="accordion-item packet">
            <h2 className="accordion-header" id={"flush-heading" + no}>
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={"#flush-collapse" + no} aria-expanded="false" aria-controls={"flush-collapse" + no}>
                    <div className="flexInfo">
                        <div className="info">19</div>
                        <div className="info">On</div>
                        <div className="info">
                            {status === "success" && <span class="badge bg-success">Success</span>}
                            {status === "error" && <span class="badge bg-danger">Error</span>}
                        </div>
                    </div>
                </button>
            </h2>
            <div id={"flush-collapse" + no} className="accordion-collapse collapse" aria-labelledby={"flush-heading" + no} data-bs-parent="#accordionFlushExample">
                <div className="accordion-body">
                    <div className="flex">
                        <div className="right-info">
                            <div className="description">93.606933</div>
                            <div className="description">0x0000</div>
                            <div className="description">0xb474</div>
                        </div>
                        <div className="left-info">
                            <div className="description">ZigBee HA</div>
                            <div className="description">74</div>
                            <div className="description">ZCL OnOff: On, Seq: 33</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}