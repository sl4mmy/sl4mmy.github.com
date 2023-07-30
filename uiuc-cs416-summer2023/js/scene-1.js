d3.csv(GLOBAL_AVERAGE_TEMPERATURE_DATASET, (d) => ({
  year: Number(d.Year),
  anomaly: Number(d.Anomaly),
})).then((data) => {
  const anomalyExtents = d3.extent(data, (d) => d.anomaly);
  const anomalyDomain = [Math.floor(anomalyExtents[0]), Math.ceil(anomalyExtents[1])];
  const years = data.map((d) => d.year).sort();
  const decades = years.filter((year) => year % 10 === 0);

  const anomalyScale = d3.scaleLinear(anomalyDomain, yRange);
  const yearScale = d3.scaleBand(years, xRange);

  const scaledOrigin = anomalyScale(0.0);
  const scaledMaxExtent = anomalyScale(anomalyExtents[1]);
  const scaledMinExtent = anomalyScale(anomalyExtents[0]);
  const totalExtent = scaledMaxExtent - scaledMinExtent;
  const percentageBelowOrigin = (scaledOrigin - scaledMinExtent) / totalExtent;

  const colorCutoffs = [0.0, 0.4, 1.0];
  const colorScale = d3.scaleThreshold(colorCutoffs, ['white', 'blue', 'orange'])

  const lineGraph = d3.line()
    .x((d) => yearScale(d.year))
    .y((d) => anomalyScale(d.anomaly))
    .curve(d3.curveCatmullRom);

  const xAxis = d3.axisBottom(yearScale)
    .ticks(decades.length)
    .tickValues(decades);
  const yAxis = d3.axisLeft(anomalyScale);

  const svg = d3.select('#scene-1 svg');

  svg.append('linearGradient')
    .attr('id', 'scene-1-color-gradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 10)
    .attr('y1', scaledMinExtent)
    .attr('x2', 10)
    .attr('y2', scaledMaxExtent)
    .selectAll('stop')
      .data(colorCutoffs)
    .join('stop')
      .attr('offset', (d) => d)
      .attr('stop-color', (d) => colorScale(d));

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

  d3.selectAll('.axis-x text, .axis-y text')
    .style('font-family', 'Roboto, sans-serif')
    .style('font-size', '14px');

  svg
    .append('text')
      .text('Temperature (°F)')
      .attr('y', 20);

  svg.append('line')
    .attr('x1', margin.left)
    .attr('y1', anomalyScale(0.0))
    .attr('x2', maxWidth - margin.right)
    .attr('y2', anomalyScale(0.0))
    .attr('stroke', 'black')
    .attr('stroke-opacity', 0.75)
    .attr('stroke-width', 1.0);

  svg.selectAll('circle')
    .data(data)
    .join('circle')
      .attr('r', 4)
      .attr('cx', (d) => yearScale(d.year))
      .attr('cy', (d) => anomalyScale(d.anomaly))
      .attr('fill', "url('#scene-1-color-gradient')");

  svg.append('path')
    .datum(data)
    .attr('d', lineGraph)
    .attr('fill', 'none')
    .attr('stroke', "url('#scene-1-color-gradient')")
    .attr('stroke-width', 2.5);

  svg
    .append('text')
      .text('Zero baseline (°F)')
      .attr('x', yearScale(data[data.length - 1].year) + 10)
      .attr('y', anomalyScale(0.0))
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'black')
      .attr('opacity', 0.75);

  svg
    .append('text')
      .text('Annual avg (°F)')
      .attr('x', yearScale(data[data.length - 1].year) + 10)
      .attr('y', anomalyScale(data[data.length - 1].anomaly))
      .attr('dominant-baseline', 'middle')
      .attr('fill', "url('#scene-1-color-gradient')");
});
