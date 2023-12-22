import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { TimelineState } from '@xzdarcy/react-timeline-editor';
import { Select } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { scale, scaleWidth, startLeft } from './mock';
import {
  markerAtomsAtom,
  markersAtom,
  toggleMarkerSelectionAtom,
  timelineCursorLastPostionAtom,
  updateMarkerPostionAtom,
  mapRefAtom,
  timeAtom
} from '../../store'
import './index.css'
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

const { Option } = Select;
export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const TimelinePlayer: FC<{
  timelineState: any;
  autoScrollWhenPlay: React.MutableRefObject<boolean>;
}> = ({ timelineState, autoScrollWhenPlay }) => {

  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useAtom(timeAtom);

  useEffect(() => {
    if (!timelineState.current) return;
    const engine = timelineState.current;
    engine.listener.on('play', () => setIsPlaying(true));
    engine.listener.on('paused',function () { setIsPlaying(false);console.log('pause')});
    engine.listener.on('afterSetTime', function({ time }) {setTime(time);console.log('after set time')});
    engine.listener.on('setTimeByTick', ({ time }) => {
      // console.log("OIMD");
      
      setTime(time);

      if (autoScrollWhenPlay.current) {
        const autoScrollFrom = 500;
        const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        
        timelineState.current.setScrollLeft(left)
      }

      // updateMarkerPosition(0,34,50,Math.random()*360-180)

    });

    return () => {
      
      if (!engine) return;
      engine.pause();
      engine.listener.offAll();
    };
  }, []);

  // 开始或暂停
  const handlePlayOrPause = () => {
    if (!timelineState.current){
      return;
    } 
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    } else {
      timelineState.current.play({ autoEnd: true });
    }
  };

  // 设置播放速率
  const handleRateChange = (rate: number) => {
    if (!timelineState.current) return;
    timelineState.current.setPlayRate(rate);
  };

  // 时间展示
  const timeRender = (time: number) => {
    const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
    const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
    const second = (parseInt((time % 60) + '') + '').padStart(2, '0');
    return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
  };

  return (
    <div className="timeline-player">
      <div className="play-control" onClick={handlePlayOrPause}>
        {isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
      </div>
      <div className="time">{timeRender(time)}</div>
      <div className="rate-control">
        <Select size={'small'} defaultValue={1} style={{ width: 120 }} onChange={handleRateChange}>
          {Rates.map((rate) => (
            <Option key={rate} value={rate}>{`x${rate.toFixed(1)}`}</Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default TimelinePlayer;