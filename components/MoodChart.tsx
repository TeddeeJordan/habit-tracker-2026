import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { MoodEntry } from '@/db/queries';
import { MOOD_FACES } from './MoodModal';

const CHART_HEIGHT = 100;
const PAD = { top: 12, bottom: 12, left: 20, right: 8 };

// Maps score 1-5 to y coordinate (5 = top, 1 = bottom)
function yFor(score: number, drawHeight: number): number {
  return PAD.top + drawHeight - ((score - 1) / 4) * drawHeight;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function dailyAverage(entries: MoodEntry[], date: string): number | null {
  const dayEntries = entries.filter((e) => e.date === date);
  if (dayEntries.length === 0) return null;
  return dayEntries.reduce((sum, e) => sum + e.score, 0) / dayEntries.length;
}

type Props = {
  moodEntries: MoodEntry[];
  weekStart: string;
  today: string;
};

export default function MoodChart({ moodEntries, weekStart, today }: Props) {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const values = dates.map((d) => dailyAverage(moodEntries, d));

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

function ChartInner({
  values,
  dates,
  today,
}: {
  values: (number | null)[];
  dates: string[];
  today: string;
}) {
  const [width, setWidth] = React.useState(0);

  const drawWidth = width - PAD.left - PAD.right;
  const drawHeight = CHART_HEIGHT - PAD.top - PAD.bottom;
  const xStep = drawWidth / 6;

  function xFor(i: number) { return PAD.left + i * xStep; }

  const points = values
    .map((v, i) => (v != null ? { x: xFor(i), y: yFor(v, drawHeight), v, date: dates[i] } : null))
    .filter(Boolean) as { x: number; y: number; v: number; date: string }[];

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const todayPoint = points.find((p) => p.date === today);

  const yAxisEmojis = [
    { score: 5, emoji: '😄' },
    { score: 1, emoji: '😢' },
  ];

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
        {/* Y-axis emoji labels */}
        {yAxisEmojis.map(({ score, emoji }) => (
          <SvgText
            key={score}
            x={PAD.left - 4}
            y={yFor(score, drawHeight) + 5}
            fontSize={12}
            textAnchor="middle"
          >
            {emoji}
          </SvgText>
        ))}

        {/* Baseline */}
        <Line
          x1={PAD.left}
          y1={PAD.top + drawHeight}
          x2={PAD.left + drawWidth}
          y2={PAD.top + drawHeight}
          stroke="#E5E5E5"
          strokeWidth={1}
        />

        {/* Mid-line */}
        <Line
          x1={PAD.left}
          y1={yFor(3, drawHeight)}
          x2={PAD.left + drawWidth}
          y2={yFor(3, drawHeight)}
          stroke="#F0F0F0"
          strokeWidth={1}
          strokeDasharray="3,4"
        />

        {/* Chart line */}
        {points.length >= 2 && (
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke="#000000"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Dots */}
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
    paddingLeft: PAD.left,
    paddingRight: PAD.right,
    marginTop: 2,
  },
  xLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
    flex: 1,
  },
});
