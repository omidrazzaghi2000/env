import { Input,Row,Col } from "antd";
import { FC } from "react";
import './index.css'
export type TimelineOptionType = {
    isShowing:boolean,
    setIsShowing: React.Dispatch<React.SetStateAction<boolean>>,
    scale: number,
    setScale: React.Dispatch<React.SetStateAction<number>>,
    scaleSplitCount: number,
    setScaleSplitCount: React.Dispatch<React.SetStateAction<number>>,
    scaleWidth: number,
    setScaleWidth: React.Dispatch<React.SetStateAction<number>>,
    startLeft: number,
    setStartLeft: React.Dispatch<React.SetStateAction<number>>,
}

export const TimelineOption: FC<{
    options: TimelineOptionType;
}> = ({ options }) => {

    return ( 
        <div className={`timeline-option-area ${options.isShowing ? 'show' : 'hide'}`} >
            <Input.Group style={{ color:'#ddd' }} size="small">
                <Row >
                    <Col span={4} style={{ display: 'flex',paddingInline:'8px' }}>
                        <span style={{fontSize:'12px',flex:2}}>Scale：</span>
                        <Input style={{flex:3}}
                            value={options.scale}
                            onChange={(e) => {
                                let value = e.target.value.replace(/[^\d]/g, '');
                                options.setScale(Number(value));
                            }}
                        />
                    </Col>
                    <Col span={6} style={{ display: 'flex',paddingInline:'8px' }}>
                        <span  style={{fontSize:'12px',flex:2}}>Scale Split：</span>
                        <Input style={{flex:3}}
                            value={options.scaleSplitCount}
                            onChange={(e) => {
                                let value = e.target.value.replace(/[^\d]/g, '');
                                options.setScaleSplitCount(Number(value));
                            }}
                        />
                    </Col>
                    <Col span={6} style={{ display: 'flex',paddingInline:'8px' }}>
                        <span style={{fontSize:'12px',flex:2}}>ScaleWidth：</span>
                        <Input style={{flex:3}}
                            value={options.scaleWidth}
                            onChange={(e) => {
                                let value = e.target.value.replace(/[^\d]/g, '');
                                options.setScaleWidth(Number(value));
                            }}
                        />
                    </Col>
                </Row>
            </Input.Group>
        </div>)
}