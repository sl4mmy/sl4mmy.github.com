d3.csv(CHICAGO_WEATHER_DATASET, (d) => ({
  date: new Date(d['Date']),
  high: Number(d['Maximum Temperature']),
  low: Number(d['Minimum Temperature']),
  average: Number(d['Average Temperature']),
  anomaly: Number(d['Departure']),
})).then((data) => {
  const blue = 'blue';
  const orange = 'orange';

  const dateExtents = d3.extent(data, (d) => d.date);
  const lastDate = dateExtents[1];
  const dayScale = d3.scaleTime(dateExtents, xRange);

  const maxHighTemp = d3.max(data, (d) => d.high);
  const tempScale = d3.scaleLinear([0, maxHighTemp], yRange).nice();

  const xAxis = d3.axisBottom(dayScale).tickFormat(d3.timeFormat('%b %d'));
  const yAxis = d3.axisLeft(tempScale);

  const shadedArea = d3.area()
    .x((d) => dayScale(d.date))
    .y0((d) => tempScale(d.low))
    .y1((d) => tempScale(d.high))
    .curve(d3.curveCatmullRom);

  const averageTempCurve = d3.line()
    .x((d) => dayScale(d.date))
    .y((d) => tempScale(d.average))
    .curve(d3.curveCatmullRom);

   const anomalyCurve = d3.line()
    .x((d) => dayScale(d.date))
    .y((d) => tempScale(d.average - d.anomaly))
    .curve(d3.curveCatmullRom);

  const svg = d3.select('#scene-3 svg');

  svg.append('text')
    .text('Temperature (°F)')
    .attr('y', 20);

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${maxHeight - margin.bottom})`)
    .call(xAxis)
    .selectAll('text')
      .style('font-family', 'Roboto, sans-serif')
      .style('font-size', '14px');

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis)
    .selectAll('text')
      .style('font-family', 'Roboto, sans-serif')
      .style('font-size', '14px');

  svg.append('path')
    .attr('d', shadedArea(data))
    .attr('fill', orange)
    .attr('fill-opacity', 0.2);

  svg.selectAll('circle')
    .data(data)
    .join('circle')
      .attr('r', 4)
      .attr('cx', (d) => dayScale(d.date))
      .attr('cy', (d) => tempScale(d.average))
      .attr('fill', orange);

  svg.append('path')
    .attr('d', anomalyCurve(data))
    .attr('fill', 'none')
    .attr('stroke', blue)
    .attr('stroke-opacity', 0.75);

  svg.append('path')
    .attr('d', averageTempCurve(data))
    .attr('fill', 'none')
    .attr('stroke', orange);

  const finalDatum = data[data.length - 1];
  svg.append('text')
    .text('Daily high (°F)')
    .attr('x', dayScale(finalDatum.date) + 13)
    .attr('y', tempScale(finalDatum.high) - 20)
    .attr('fill', orange);
  svg.append('line')
    .attr('x1', dayScale(finalDatum.date))
    .attr('y1', tempScale(finalDatum.high) - 3)
    .attr('x2', dayScale(finalDatum.date) + 10)
    .attr('y2', tempScale(finalDatum.high) - 20)
    .attr('stroke', orange)
    .attr('stroke-width', 2);

  svg.append('text')
    .text('Daily avg (°F)')
    .attr('x', dayScale(lastDate) + 10)
    .attr('y', tempScale(finalDatum.average))
    .attr('dominant-baseline', 'middle')
    .attr('fill', orange);

  svg.append('text')
    .text('Historical avg (°F)')
    .attr('x', dayScale(lastDate) + 10)
    .attr('y', tempScale(finalDatum.average - finalDatum.anomaly))
    .attr('dominant-baseline', 'middle')
    .attr('fill', blue)
    .attr('opacity', 0.75);

  svg.append('text')
    .text('Daily Low (°F)')
    .attr('x', dayScale(finalDatum.date) + 13)
    .attr('y', tempScale(finalDatum.low) + 20)
    .attr('dominant-baseline', 'hanging')
    .attr('fill', orange);
  svg.append('line')
    .attr('x1', dayScale(finalDatum.date))
    .attr('y1', tempScale(finalDatum.low) + 3)
    .attr('x2', dayScale(finalDatum.date) + 10)
    .attr('y2', tempScale(finalDatum.low) + 20)
    .attr('stroke', orange)
    .attr('stroke-width', 2);
});
