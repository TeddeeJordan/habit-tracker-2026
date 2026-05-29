import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { MoodLog } from '@/db/queries';

const CHART_HEIGHT = 80;
const CHART_PADDING = { top: 8, bottom: 8, left: 4, right: 4 };

type Props = {
  moodLogs: MoodLog[];
  weekStart: string;
  today: string;
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function avgMood(log: MoodLog | undefined): number | null {
  if (!log) return null;
  const vals = [log.morning, log.evening].filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default function MoodChart({ moodLogs, weekStart, today }: Props) {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const values = dates.map((d) => avgMood(moodLogs.find((m) => m.date === d)));

  return (
    <View>
      <ChartInner values={values} dates={dates} today={today} />
      <View style={styles.xLabels}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <Text key={d} style={styles.xLabel}>{d}</Text>
        ))}
      </View>
    </View>
  );
}

function ChartInner({ values, dates, today }: { values: (number | null)[]; dates: string[]; today: string }) {
  const [width, setWidth] = React.useState(0);

  const drawWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const drawHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const xStep = drawWidth / 6;

  function xFor(i: number) { return CHART_PADDING.left + i * xStep; }
  function yFor(v: number) {
    return CHART_PADDING.top + drawHeight - (v / 10) * drawHeight;
  }

  const points = values
    .map((v, i) => (v != null ? { x: xFor(i), y: yFor(v), v, date: dates[i] } : null))
    .filter(Boolean) as { x: number; y: number; v: number; date: string }[];

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const todayIndex = dates.indexOf(today);
  const todayPoint = todayIndex >= 0 ? points.find((p) => p.date === today) : null;

  if (width === 0) {
    return (
      <View
        style={{ height: CHART_HEIGHT }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      />
    );
  }

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Svg width={width} height={CHART_HEIGHT}>
        {/* Baseline */}
        <Line
          x1={CHART_PADDING.left}
          y1={CHART_PADDING.top + drawHeight}
          x2={CHART_PADDING.left + drawWidth}
          y2={CHART_PADDING.top + drawHeight}
          stroke="#E5E5E5"
          strokeWidth={1}
        />
        {/* Chart line */}
        {points.length >= 2 && (
          <Polyline points={polylinePoints} fill="none" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        )}
        {/* Dots for all data points */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#FFFFFF" stroke="#000000" strokeWidth={1.5} />
        ))}
        {/* Today dot (filled) */}
        {todayPoint && (
          <Circle cx={todayPoint.x} cy={todayPoint.y} r={5} fill="#000000" />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CHART_PADDING.left,
    marginTop: 2,
  },
  xLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
  },
});
