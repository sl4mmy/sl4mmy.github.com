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

  const tooltipHeight = 60;
  const tooltipWidth = 250;
  const tooltip = svg.append('g')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  tooltip.append('rect')
    .attr('width', tooltipWidth)
    .attr('height', tooltipHeight)
    .attr('rx', 25)
    .attr('ry', 25)
    .attr('fill', orange)
    .attr('fill-opacity', 0.85);
  const tooltipText = tooltip.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', 'white')
    .attr('fill-opacity', 1.0)
    .attr('x', tooltipWidth / 2)
    .attr('y', tooltipHeight / 2 + 1)
    .style('font-weight', 900);

  const showTooltip = (e, d) => {
    const labels = [
      `June ${d3.timeFormat('%d')(d.date)}, 2022`,
      `Daily avg - ${d.average}°F`,
    ];

    tooltipText.selectAll('tspan')
      .remove();
    tooltipText.selectAll('tspan')
      .data(labels)
      .join('tspan')
        .text((d) => d)
        .attr('x', tooltipWidth / 2)
        .attr('y', 20)
        .attr('dy', (d, i) => i * 20);

    const mouse = d3.pointer(e);
    const date = dayScale.invert(mouse[0]);
    const day = Number(d3.timeFormat('%d')(date));
    const datum = data[day - 1];

    const cx = dayScale(datum.date);
    const cy = tempScale(datum.average);
    const x = cx - 0.5 * tooltipWidth;
    const y = cy - 1.25 * tooltipHeight;
    tooltip.attr('transform', `translate(${x}, 0)`)
      .transition()
      .duration(300)
      .attr('transform', `translate(${x}, ${y})`)
      .style('opacity', 0.85);
  };

  const hideTooltip = (e) => {
    svg.selectAll('.hover')
      .remove();

    const mouse = d3.pointer(e);
    const date = dayScale.invert(mouse[0]);
    const day = Number(d3.timeFormat('%d')(date));
    const datum = data[day - 1];

    const cx = dayScale(datum.date);
    const x = cx - 0.5 * tooltipWidth;
    tooltip.transition()
      .duration(200)
      .attr('transform', `translate(${x}, -${tooltipHeight + 25})`)
      .style('opacity', 0);
  };

  const showNearestTooltip = (e) => {
    const mouse = d3.pointer(e);

    if (mouse[0] < margin.left || mouse[0] > (maxWidth - margin.right) ||
      mouse[1] < margin.top || mouse[1] > (maxHeight - margin.bottom)) {
      return;
    }

    const date = dayScale.invert(mouse[0]);
    const day = Number(d3.timeFormat('%d')(date));
    const datum = data[day - 1];

    const cx = dayScale(datum.date);
    const anomalyAnnotationXOffset = (cx <= (maxWidth - margin.right - 45)) ?
      ((day != 15) ? cx + 45 : cx) : cx - 50;
    const anomalyAnnotationYOffset = (datum.low < (datum.average - datum.anomaly)) ?
      tempScale(datum.low) + 25 : tempScale(datum.average - datum.anomaly) + 25;

    svg.selectAll('.hover')
      .remove();
    svg.append('text')
      .text(`${datum.high} °F`)
      .attr('x', dayScale(datum.date))
      .attr('y', tempScale(datum.high) - 33)
      .attr('fill', orange)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'bottom')
      .attr('class', 'hover')
      .transition()
      .duration(200)
      .attr('opacity', 0.85);
    svg.append('text')
      .text(`${datum.low} °F`)
      .attr('x', dayScale(datum.date))
      .attr('y', tempScale(datum.low) + 33)
      .attr('fill', orange)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('class', 'hover')
      .transition()
      .duration(200)
      .attr('opacity', 0.85);
    svg.append('text')
      .text(`${datum.average - datum.anomaly} °F`)
      .attr('x', anomalyAnnotationXOffset + 5)
      .attr('y', anomalyAnnotationYOffset + 5)
      .attr('fill', blue)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('class', 'hover')
      .transition()
      .duration(200)
      .attr('opacity', 0.5);
    svg.append('line')
      .attr('x1', cx)
      .attr('y1', tempScale(datum.low) + 25)
      .attr('x2', cx)
      .attr('y2', tempScale(datum.high) - 25)
      .attr('stroke', orange)
      .attr('stroke-width', 3.0)
      .attr('class', 'hover')
      .transition()
      .duration(200)
      .attr('opacity', 0.35);
    svg.append('line')
      .attr('x1', cx)
      .attr('y1', tempScale(datum.average - datum.anomaly))
      .attr('x2', anomalyAnnotationXOffset)
      .attr('y2', anomalyAnnotationYOffset)
      .attr('stroke', blue)
      .attr('stroke-width', 3.0)
      .attr('class', 'hover')
      .transition()
      .duration(200)
      .attr('opacity', 0.15);

    showTooltip(e, datum);
  };

  svg.on('mouseenter', showNearestTooltip)
    .on('mouseover', showNearestTooltip)
    .on('mousemove', showNearestTooltip)
    .on('mouseleave', hideTooltip);

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
    .attr('stroke-opacity', 0.5);

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
